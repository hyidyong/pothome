import "server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
export type ReviewComment = {
  id: string;
  authorName: string;
  body: string;
  rating: number;
  likeCount: number;
  createdAt: string;
};

const execFileAsync = promisify(execFile);

function canUseLocalDatabaseFallback() {
  const configuredUrl = process.env.SUPABASE_URL ?? "";
  const isLocalSupabase = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(configuredUrl);
  return process.env.NODE_ENV !== "production" || isLocalSupabase;
}

function publicClient() {
  return createSupabaseServerClient() as unknown as SupabaseClient;
}

async function query(sql: string) {
  const { stdout } = await execFileAsync("docker", [
    "exec",
    process.env.SUPABASE_LOCAL_DB_CONTAINER ?? "supabase_db_work-home",
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-t",
    "-A",
    "-F",
    "\t",
    "-c",
    sql,
  ]);
  return stdout.trim().split("\n").filter(Boolean).map((row) => row.split("\t"));
}

function quote(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

export async function getReviewComments(): Promise<ReviewComment[]> {
  if (!canUseLocalDatabaseFallback()) {
    const { data, error } = await publicClient()
      .from("review_comments")
      .select("id, author_name, body, rating, like_count, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Review feed query failed: ${error.message}`);
    return (data ?? []).map((comment) => ({
      id: String(comment.id),
      authorName: String(comment.author_name),
      body: String(comment.body),
      rating: Number(comment.rating),
      likeCount: Number(comment.like_count),
      createdAt: String(comment.created_at),
    }));
  }
  const rows = await query(
    "select id::text, author_name, body, rating::text, like_count::text, created_at::text from public.review_comments where published is true order by created_at desc",
  );
  return rows.map(([id, authorName, body, rating, likeCount, createdAt]) => ({
    id: id!,
    authorName: authorName!,
    body: body!,
    rating: Number(rating),
    likeCount: Number(likeCount),
    createdAt: createdAt!,
  }));
}

export async function createReviewComment(input: Omit<ReviewComment, "id" | "likeCount" | "createdAt">) {
  if (!canUseLocalDatabaseFallback()) {
    const { data, error } = await publicClient()
      .from("review_comments")
      .insert({ author_name: input.authorName, body: input.body, rating: input.rating, published: true })
      .select("id, author_name, body, rating, like_count, created_at")
      .single();
    if (error || !data) throw new Error(`Review comment insert failed: ${error?.message ?? "unknown error"}`);
    return {
      id: String(data.id),
      authorName: String(data.author_name),
      body: String(data.body),
      rating: Number(data.rating),
      likeCount: Number(data.like_count),
      createdAt: String(data.created_at),
    };
  }
  const rows = await query(
    `insert into public.review_comments (author_name, body, rating) values (${quote(input.authorName)}, ${quote(input.body)}, ${input.rating}) returning id::text, author_name, body, rating::text, like_count::text, created_at::text`,
  );
  const [id, authorName, body, rating, likeCount, createdAt] = rows[0] ?? [];
  if (!id) throw new Error("Review comment insert failed.");
  return { id, authorName: authorName!, body: body!, rating: Number(rating), likeCount: Number(likeCount), createdAt: createdAt! };
}

export async function likeReviewComment(commentId: string, visitorId: string) {
  if (!canUseLocalDatabaseFallback()) {
    const supabase = publicClient();
    const { error: insertError } = await supabase
      .from("review_comment_likes")
      .insert({ comment_id: commentId, visitor_id: visitorId });
    if (insertError && insertError.code !== "23505") {
      throw new Error(`Review like insert failed: ${insertError.message}`);
    }
    const { data, error } = await supabase
      .from("review_comments")
      .select("like_count")
      .eq("id", commentId)
      .eq("published", true)
      .single();
    if (error || !data) throw new Error(`Review like query failed: ${error?.message ?? "unknown error"}`);
    return Number(data.like_count);
  }
  const rows = await query(
    `with inserted as (
      insert into public.review_comment_likes (comment_id, visitor_id)
      values (${quote(commentId)}::uuid, ${quote(visitorId)}::uuid)
      on conflict do nothing
      returning 1
    ), bumped as (
      update public.review_comments
      set like_count = like_count + 1
      where id = ${quote(commentId)}::uuid and exists (select 1 from inserted)
      returning like_count
    )
    select coalesce((select like_count::text from bumped), (select like_count::text from public.review_comments where id = ${quote(commentId)}::uuid))`,
  );
  return Number(rows[0]?.[0] ?? 0);
}
