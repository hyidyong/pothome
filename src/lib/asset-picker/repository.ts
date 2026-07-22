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
  staticImageUrl?: string;
};

export type UploadedGalleryAssetInput = {
  filePath: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  category: GalleryAssetCategory;
  title: string;
  description: string | null;
  decision?: AssetDecision;
};

const execFileAsync = promisify(execFile);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const deploymentFallbackGalleryAssets: GalleryAsset[] = [
  {
    id: "static-dandi-mobile-handover-cover",
    fileName: "dandi-mobile-handover-cover.png",
    sourceGroup: "관리자 업로드",
    mimeType: "image/png",
    category: "result",
    label: "프로젝트 결과물",
    title: "단디모바일 업무 인수인계 자료",
    description: "단디모바일 휴대폰 매장 업무 인수인계 자료 표지입니다.",
    staticImageUrl: "/images/gallery/dandi-mobile-handover-cover.png",
  },
  {
    id: "static-dandi-mobile-handover-index",
    fileName: "dandi-mobile-handover-index.png",
    sourceGroup: "관리자 업로드",
    mimeType: "image/png",
    category: "result",
    label: "프로젝트 결과물",
    title: "단디모바일 업무 인수인계 자료 목차",
    description: "단디모바일 휴대폰 매장 업무 인수인계 자료의 구성입니다.",
    staticImageUrl: "/images/gallery/dandi-mobile-handover-index.png",
  },
  {
    id: "static-humanics-field-connect-report",
    fileName: "humanics-field-connect-report.png",
    sourceGroup: "관리자 업로드",
    mimeType: "image/png",
    category: "result",
    label: "프로젝트 결과물",
    title: "휴머닉스 현장 Connect 보고서",
    description: "휴머닉스 프로젝트의 현장 Connect 보고서 표지입니다.",
    staticImageUrl: "/images/gallery/humanics-field-connect-report.png",
  },
  {
    id: "static-project-result-report",
    fileName: "project-result-report.png",
    sourceGroup: "관리자 업로드",
    mimeType: "image/png",
    category: "result",
    label: "프로젝트 결과물",
    title: "별도 프로젝트 결과 보고서",
    description: "휴머닉스와 별도로 진행한 프로젝트 결과 보고서 표지입니다.",
    staticImageUrl: "/images/gallery/project-result-report.png",
  },
];

const deploymentCategoryLabels: Record<GalleryAssetCategory, string> = {
  result: "프로젝트 결과물",
  field: "현장 활동",
  credential: "수료 · 상장",
};

type DeploymentGalleryAssetSeed = readonly [
  fileName: string,
  sourceGroup: string,
  mimeType: string,
  category: GalleryAssetCategory,
  title: string,
  description: string,
  staticImageUrl: string,
];

const deploymentGalleryAssetSeeds: readonly DeploymentGalleryAssetSeed[] = [
  ["ai-solution-team-field.jpg", "Admin Upload", "image/jpeg", "field", "AI Solution Challenge 팀 활동", "AI Solution Challenge 팀 협업 현장입니다.", "/images/gallery/selected/01.jpg"],
  ["global-team-exchange.png", "Admin Upload", "image/png", "field", "글로벌 팀 교류", "다문화 협업과 현장 교류 기록입니다.", "/images/gallery/selected/02.png"],
  ["hirepass-foreign-talent.png", "Admin Upload", "image/png", "result", "HirePass 외국인 전문인력 채용 서비스", "외국인 전문인력 채용 사전진단 서비스 랜딩 화면입니다.", "/images/gallery/selected/03.png"],
  ["multicultural-collaboration.png", "Admin Upload", "image/png", "field", "다문화 협업 현장", "온·오프라인 협업 세션 현장입니다.", "/images/gallery/selected/04.png"],
  ["vision-pruner-presentation.png", "Admin Upload", "image/png", "field", "비전프러너 현대차 PEB 발표", "비전프러너 현대차 PEB 프로젝트 발표 현장입니다.", "/images/gallery/selected/05.png"],
  ["research-war-room-concept.png", "REWORK 디자인 UI", "image/png", "result", "Research War Room UI 콘셉트", "리서치 의사결정 화면 UI 콘셉트입니다.", "/images/gallery/selected/06.png"],
  ["KakaoTalk_20260705_001712915.jpg", "공유캠 첫 해커톤 자료", "image/jpeg", "field", "공유캠 첫 해커톤 현장", "공유캠 첫 해커톤 협업 현장입니다.", "/images/gallery/selected/07.jpg"],
  ["ablearn-nia-certificate.png", "관리자 업로드", "image/png", "credential", "에이블런·NIA 디지털 마케팅 트랙 수료증", "2023년 9월 프로젝트 도약 디지털 마케팅 트랙 수료증입니다.", "/images/gallery/selected/08.png"],
  ["ai-solution-challenge-excellence-award.png", "관리자 업로드", "image/png", "credential", "AI Solution Challenge 우수상", "AI Solution Challenge Program 우수상 수상 현장입니다.", "/images/gallery/selected/09.png"],
  ["dsac-data-scientist-certificate.png", "관리자 업로드", "image/png", "credential", "DSAC 데이터 사이언티스트 수료증", "DSAC M1 Data Programming 수료증입니다.", "/images/gallery/selected/10.png"],
  ["human-ai-foundation-grand-prize.png", "관리자 업로드", "image/png", "credential", "Human AI Foundation 최우수상", "2026 첨단산업 인재양성 AI 부트캠프 최우수상입니다.", "/images/gallery/selected/11.png"],
  ["future-leaders-encouragement-award.png", "관리자 업로드", "image/png", "credential", "2026 퓨처리더스 캠프 장려상", "한경협 퓨처리더스 캠프 기업가정신 경연 장려상 수상 현장입니다.", "/images/gallery/selected/14.png"],
  ["vibecoding-basic-certificate.png", "관리자 업로드", "image/png", "credential", "대구디지털혁신진흥원 바이브코딩 초급 수료증", "2026년 6월 바이브코딩 초급 교육 과정 수료증입니다.", "/images/gallery/selected/17.png"],
  ["vibecoding-intermediate-certificate.png", "관리자 업로드", "image/png", "credential", "대구디지털혁신진흥원 바이브코딩 중급 수료증", "2026년 6월 바이브코딩 중급 교육 과정 수료증입니다.", "/images/gallery/selected/18.png"],
  ["ylc-excellent-operations-award.png", "관리자 업로드", "image/png", "credential", "YLC 우수 운영진상", "한국경제인협회 YLC 우수 운영진상입니다.", "/images/gallery/selected/19.png"],
  ["youth-entrepreneurship-committee-plan.jpg", "청년창업위원회 활동", "image/jpeg", "result", "청년창업위원회 사업계획서", "청년창업위원회 활동에서 기획한 사업계획서 결과물입니다.", "/images/gallery/selected/20.jpg"],
  ["fitory-01.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/21.png"],
  ["fitory-02.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/22.png"],
  ["fitory-03.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/23.png"],
  ["fitory-04.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/24.png"],
  ["fitory-05.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/25.png"],
  ["fitory-06.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/26.png"],
  ["fitory-07.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/27.png"],
  ["fitory-08.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/28.png"],
  ["fitory-09.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/29.png"],
  ["fitory-10.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/30.png"],
  ["fitory-11.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/31.png"],
  ["fitory-12.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/32.png"],
  ["fitory-13.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/33.png"],
  ["fitory-14.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/34.png"],
  ["fitory-15.png", "피토리", "image/png", "result", "피토리 제품 화면", "1인 사업 기획 피토리의 MVP 제품 화면입니다.", "/images/gallery/selected/35.png"],
];

const fullDeploymentFallbackGalleryAssets: GalleryAsset[] = [
  ...deploymentFallbackGalleryAssets,
  ...deploymentGalleryAssetSeeds.map(
    ([fileName, sourceGroup, mimeType, category, title, description, staticImageUrl], index) => ({
      id: `static-selected-${index + 1}`,
      fileName,
      sourceGroup,
      mimeType,
      category,
      label: deploymentCategoryLabels[category],
      title,
      description,
      staticImageUrl,
    }),
  ),
];

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
  const configuredUrl = process.env.SUPABASE_URL ?? "";
  const isLocalSupabase = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(configuredUrl);
  return process.env.NODE_ENV !== "production" || isLocalSupabase;
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
  if (!createSupabaseAdminClient() && !canUseLocalDatabaseFallback()) {
    return fullDeploymentFallbackGalleryAssets;
  }
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

export async function createUploadedGalleryAsset(input: UploadedGalleryAssetInput) {
  if (!createSupabaseAdminClient() && canUseLocalDatabaseFallback()) {
    const rows = await queryLocalDatabase(
      `insert into public.asset_picker_assets (
        file_path, file_name, source_group, mime_type, byte_size, modified_at,
        decision, gallery_category, gallery_title, gallery_description
      ) values (
        ${sql(input.filePath)}, ${sql(input.fileName)}, ${sql("관리자 업로드")},
        ${sql(input.mimeType)}, ${input.byteSize}, now(), ${sql(input.decision ?? "selected")},
        ${sql(input.category)}, ${sql(input.title)}, ${input.description ? sql(input.description) : "null"}
      ) returning id::text`,
    );
    const id = rows[0]?.[0];
    if (!id) throw new Error("Gallery upload catalog insert failed.");
    return id;
  }

  const { data, error } = await getClient()
    .from("asset_picker_assets")
    .insert({
      file_path: input.filePath,
      file_name: input.fileName,
      source_group: "관리자 업로드",
      mime_type: input.mimeType,
      byte_size: input.byteSize,
      modified_at: new Date().toISOString(),
      decision: input.decision ?? "selected",
      gallery_category: input.category,
      gallery_title: input.title,
      gallery_description: input.description,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Gallery upload catalog insert failed: ${error?.message ?? "unknown error"}`);
  }
  return data.id;
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
