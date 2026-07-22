import "server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

export type ReviewComment = {
  id: string;
  authorName: string;
  body: string;
  rating: number;
  likeCount: number;
  createdAt: string;
};

const execFileAsync = promisify(execFile);

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
  const rows = await query(
    `insert into public.review_comments (author_name, body, rating) values (${quote(input.authorName)}, ${quote(input.body)}, ${input.rating}) returning id::text, author_name, body, rating::text, like_count::text, created_at::text`,
  );
  const [id, authorName, body, rating, likeCount, createdAt] = rows[0] ?? [];
  if (!id) throw new Error("Review comment insert failed.");
  return { id, authorName: authorName!, body: body!, rating: Number(rating), likeCount: Number(likeCount), createdAt: createdAt! };
}

export async function likeReviewComment(commentId: string, visitorId: string) {
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
