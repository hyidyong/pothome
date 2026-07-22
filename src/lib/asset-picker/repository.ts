import "server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AssetDecision = "undecided" | "selected" | "rejected";

export type AssetPickerAsset = {
  id: string;
  fileName: string;
  sourceGroup: string;
  mimeType: string;
  byteSize: number;
  decision: AssetDecision;
};

export type GalleryAssetCategory = "field" | "result" | "credential";

export type GalleryAsset = {
  id: string;
  fileName: string;
  sourceGroup: string;
  mimeType: string;
  category: GalleryAssetCategory;
  label: string;
  title: string;
  description: string | null;
};

const execFileAsync = promisify(execFile);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getClient() {
  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error(
      "Asset picker requires SUPABASE_SERVICE_ROLE_KEY for its private catalog.",
    );
  }
  return client;
}

function canUseLocalDatabaseFallback() {
  return process.env.NODE_ENV !== "production";
}

async function queryLocalDatabase(query: string) {
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
    query,
  ]);
  return stdout.trim().split("\n").filter(Boolean).map((row) => row.split("\t"));
}

function sql(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

export async function getPickerAssets({ limit = 48, offset = 0 } = {}): Promise<AssetPickerAsset[]> {
  if (!createSupabaseAdminClient() && canUseLocalDatabaseFallback()) {
    const rows = await queryLocalDatabase(
      `select id, file_name, source_group, mime_type, byte_size, decision from public.asset_picker_assets where decision in ('undecided', 'selected') order by source_group, file_name limit ${limit} offset ${offset}`,
    );
    return rows.map(([id, fileName, sourceGroup, mimeType, byteSize, decision]) => ({
      id: id!,
      fileName: fileName!,
      sourceGroup: sourceGroup!,
      mimeType: mimeType!,
      byteSize: Number(byteSize),
      decision: decision as AssetDecision,
    }));
  }
  const { data, error } = await getClient()
    .from("asset_picker_assets")
    .select("id, file_name, source_group, mime_type, byte_size, decision")
    .in("decision", ["undecided", "selected"])
    .order("source_group")
    .order("file_name")
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Asset picker catalog query failed: ${error.message}`);
  }

  return data.map((asset) => ({
    id: asset.id,
    fileName: asset.file_name,
    sourceGroup: asset.source_group,
    mimeType: asset.mime_type,
    byteSize: asset.byte_size,
    decision: asset.decision as AssetDecision,
  }));
}

export async function getPickerAssetCount() {
  if (!createSupabaseAdminClient() && canUseLocalDatabaseFallback()) {
    const rows = await queryLocalDatabase(
      "select count(*)::text from public.asset_picker_assets where decision in ('undecided', 'selected')",
    );
    return Number(rows[0]?.[0] ?? "0");
  }
  const { count, error } = await getClient()
    .from("asset_picker_assets")
    .select("id", { count: "exact", head: true })
    .in("decision", ["undecided", "selected"]);
  if (error) throw new Error(`Asset picker count query failed: ${error.message}`);
  return count ?? 0;
}

function classifyGalleryAsset(
  fileName: string,
  sourceGroup: string,
): Pick<GalleryAsset, "category" | "label"> {
  const source = `${sourceGroup} ${fileName}`.toLowerCase();

  if (/(수료|상장|상패|award|certificate|certification)/.test(source)) {
    return { category: "credential", label: "수료 · 상장" };
  }
  if (/(해커톤|청년창업|kakaotalk|활동|현장)/.test(source)) {
    return { category: "field", label: "현장 활동" };
  }
  return { category: "result", label: "프로젝트 결과물" };
}

function mapGalleryAsset(
  id: string,
  fileName: string,
  sourceGroup: string,
  mimeType: string,
  category?: string | null,
  title?: string | null,
  description?: string | null,
): GalleryAsset {
  const fallback = classifyGalleryAsset(fileName, sourceGroup);
  const resolvedCategory = (category as GalleryAssetCategory | null) ?? fallback.category;
  const labels: Record<GalleryAssetCategory, string> = {
    field: "현장 활동",
    result: "프로젝트 결과물",
    credential: "수료 · 상장",
  };
  return {
    id,
    fileName,
    sourceGroup,
    mimeType,
    category: resolvedCategory,
    label: labels[resolvedCategory],
    title: title?.trim() || sourceGroup,
    description: description?.trim() || null,
  };
}

export async function getSelectedGalleryAssets(): Promise<GalleryAsset[]> {
  if (!createSupabaseAdminClient() && canUseLocalDatabaseFallback()) {
    const rows = await queryLocalDatabase(
      "select id, file_name, source_group, mime_type, gallery_category, gallery_title, gallery_description from public.asset_picker_assets where decision = 'selected' order by source_group, file_name",
    );
    const unique = new Map<string, GalleryAsset>();
    for (const [id, fileName, sourceGroup, mimeType, category, title, description] of rows) {
      const key = `${sourceGroup}\u0000${fileName}`;
      if (!unique.has(key)) {
        unique.set(
          key,
          mapGalleryAsset(id!, fileName!, sourceGroup!, mimeType!, category, title, description),
        );
      }
    }
    return [...unique.values()];
  }

  const { data, error } = await getClient()
    .from("asset_picker_assets")
    .select("id, file_name, source_group, mime_type, gallery_category, gallery_title, gallery_description")
    .eq("decision", "selected")
    .order("source_group")
    .order("file_name");

  if (error) {
    throw new Error(`Selected gallery assets query failed: ${error.message}`);
  }

  return data.map((asset) =>
    mapGalleryAsset(
      asset.id,
      asset.file_name,
      asset.source_group,
      asset.mime_type,
      asset.gallery_category,
      asset.gallery_title,
      asset.gallery_description,
    ),
  );
}

export async function updatePickerDecision(
  id: string,
  decision: AssetDecision,
) {
  if (!createSupabaseAdminClient() && canUseLocalDatabaseFallback()) {
    await queryLocalDatabase(
      `update public.asset_picker_assets set decision = ${sql(decision)}, decision_updated_at = now() where id = ${sql(id)}::uuid`,
    );
    return;
  }
  const { error } = await getClient()
    .from("asset_picker_assets")
    .update({ decision, decision_updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Asset picker decision update failed: ${error.message}`);
  }
}

export async function updateGalleryMetadata(
  id: string,
  input: {
    category: GalleryAssetCategory;
    title: string;
    description: string | null;
  },
) {
  if (!uuidPattern.test(id)) throw new Error("Invalid asset id.");

  if (!createSupabaseAdminClient() && canUseLocalDatabaseFallback()) {
    await queryLocalDatabase(
      `update public.asset_picker_assets set gallery_category = ${sql(input.category)}, gallery_title = ${sql(input.title)}, gallery_description = ${input.description ? sql(input.description) : "null"}, decision_updated_at = now() where id = ${sql(id)}::uuid`,
    );
    return;
  }

  const { error } = await getClient()
    .from("asset_picker_assets")
    .update({
      gallery_category: input.category,
      gallery_title: input.title,
      gallery_description: input.description,
      decision_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Gallery metadata update failed: ${error.message}`);
}

export async function getPickerAssetPath(id: string) {
  if (!uuidPattern.test(id)) return null;
  if (!createSupabaseAdminClient() && canUseLocalDatabaseFallback()) {
    const [[filePath, mimeType] = []] = await queryLocalDatabase(
      `select file_path, mime_type from public.asset_picker_assets where id = ${sql(id)}::uuid limit 1`,
    );
    return filePath && mimeType ? { file_path: filePath, mime_type: mimeType } : null;
  }
  const { data, error } = await getClient()
    .from("asset_picker_assets")
    .select("file_path, mime_type")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Asset picker image query failed: ${error.message}`);
  }

  return data;
}
