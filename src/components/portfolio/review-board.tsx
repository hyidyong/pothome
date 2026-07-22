"use client";

import { FormEvent, useState } from "react";
import { SendIcon, StarIcon, ThumbsUpIcon } from "lucide-react";

import type { ReviewComment } from "@/lib/review-board/repository";

type ReviewBoardProps = { initialComments: ReviewComment[] };

function visitorId() {
  const key = "portfolio-review-visitor";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(key, id);
  return id;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "numeric", day: "numeric" }).format(new Date(value));
}

export function ReviewBoard({ initialComments }: ReviewBoardProps) {
  const [comments, setComments] = useState(initialComments);
  const [rating, setRating] = useState(5);
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setNotice("");
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ authorName: form.get("authorName"), body: form.get("body"), rating }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setComments((current) => [payload, ...current]);
      event.currentTarget.reset();
      setRating(5);
      setNotice("댓글이 등록됐어요. 고마워요!");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "댓글을 등록하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function like(commentId: string) {
    try {
      const response = await fetch(`/api/reviews/${commentId}/like`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ visitorId: visitorId() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setComments((current) => current.map((comment) => comment.id === commentId ? { ...comment, likeCount: payload.likeCount } : comment));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "공감을 저장하지 못했습니다.");
    }
  }

  return <section className="review-board" aria-labelledby="reviews-heading">
    <header className="review-board__header"><p>REVIEW BOARD</p><div><h1 id="reviews-heading">함께한 사람들이<br />남긴 한마디.</h1><span>프로젝트·활동에서 받은 피드백과 누구나 남길 수 있는 짧은 리뷰를 모았습니다.</span></div></header>
    <form className="review-board__form" onSubmit={submit}>
      <div className="review-board__form-top"><label>이름<input name="authorName" required maxLength={24} placeholder="이름 또는 닉네임" /></label><fieldset><legend>별점</legend><div className="review-board__stars">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value}점`} aria-pressed={rating === value} onClick={() => setRating(value)}><StarIcon fill={value <= rating ? "currentColor" : "none"} /></button>)}</div></fieldset></div>
      <label className="review-board__body-label">댓글<textarea name="body" required minLength={2} maxLength={1500} placeholder="희정님과 함께한 경험을 남겨 주세요." /></label>
      <div className="review-board__form-foot"><span role="status">{notice}</span><button disabled={pending} type="submit">{pending ? "등록 중…" : "댓글 등록"}<SendIcon /></button></div>
    </form>
    <div className="review-board__count">댓글 <strong>{comments.length}</strong></div>
    <ol className="review-board__list">{comments.map((comment) => <li key={comment.id}><article><header><div><strong>{comment.authorName}</strong><span>{formatDate(comment.createdAt)}</span></div><span className="review-board__rating" aria-label={`${comment.rating}점`}>{Array.from({ length: 5 }, (_, index) => <StarIcon key={index} fill={index < comment.rating ? "currentColor" : "none"} />)}</span></header><p>{comment.body}</p><footer><button type="button" onClick={() => like(comment.id)}><ThumbsUpIcon />공감 <b>{comment.likeCount}</b></button></footer></article></li>)}</ol>
  </section>;
}
