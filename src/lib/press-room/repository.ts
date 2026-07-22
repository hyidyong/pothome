import "server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PressRelease = {
  id: string;
  publisher: string;
  headline: string;
  summary: string;
  publishedOn: string;
  thumbnailAssetId: string | null;
  externalUrl: string | null;
};

type PublicPressReleaseRow = {
  id: string;
  publisher: string;
  headline: string;
  summary: string;
  published_on: string;
  thumbnail_asset_id: string | null;
  external_url: string | null;
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

export async function getPressReleases(): Promise<PressRelease[]> {
  if (process.env.NODE_ENV === "production") {
    // The database type snapshot predates this public archive table. Keep the
    // external shape explicit until the generated snapshot is refreshed.
    const supabase = createSupabaseServerClient() as unknown as SupabaseClient;
    const { data, error } = await supabase
      .from("press_releases")
      .select("id, publisher, headline, summary, published_on, thumbnail_asset_id, external_url")
      .order("published_on", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Unable to load press releases: ${error.message}`);
    return (data as PublicPressReleaseRow[]).map((release) => ({
      id: release.id,
      publisher: release.publisher,
      headline: release.headline,
      summary: release.summary,
      publishedOn: release.published_on,
      thumbnailAssetId: release.thumbnail_asset_id,
      externalUrl: release.external_url,
    }));
  }
  const rows = await query(
    "select id, publisher, headline, summary, published_on::text, coalesce(thumbnail_asset_id::text, ''), coalesce(external_url, '') from public.press_releases order by published_on desc, created_at desc",
  );
  return rows.map(([id, publisher, headline, summary, publishedOn, thumbnailAssetId, externalUrl]) => ({
    id: id!,
    publisher: publisher!,
    headline: headline!,
    summary: summary!,
    publishedOn: publishedOn!,
    thumbnailAssetId: thumbnailAssetId || null,
    externalUrl: externalUrl || null,
  }));
}

export async function createPressRelease(input: Omit<PressRelease, "id">) {
  const thumbnail = input.thumbnailAssetId
    ? `${quote(input.thumbnailAssetId)}::uuid`
    : "null";
  const externalUrl = input.externalUrl ? quote(input.externalUrl) : "null";
  const rows = await query(
    `insert into public.press_releases (publisher, headline, summary, published_on, thumbnail_asset_id, external_url) values (${quote(input.publisher)}, ${quote(input.headline)}, ${quote(input.summary)}, ${quote(input.publishedOn)}::date, ${thumbnail}, ${externalUrl}) returning id`,
  );
  return rows[0]?.[0] ?? null;
}

export async function deletePressRelease(id: string) {
  await query(`delete from public.press_releases where id = ${quote(id)}::uuid`);
}
