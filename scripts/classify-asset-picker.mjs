import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const container = process.env.SUPABASE_LOCAL_DB_CONTAINER ?? "supabase_db_work-home";

async function query(sql) {
  const { stdout } = await execFileAsync("docker", ["exec", container, "psql", "-U", "postgres", "-d", "postgres", "-t", "-A", "-F", "\t", "-c", sql]);
  return stdout.trim().split("\n").filter(Boolean).map((row) => row.split("\t"));
}

function quote(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

async function update(ids) {
  if (!ids.length) return;
  for (let start = 0; start < ids.length; start += 100) {
    const idList = ids.slice(start, start + 100).map((id) => `${quote(id)}::uuid`).join(",");
    await query(`update public.asset_picker_assets set decision = 'rejected', decision_updated_at = now() where decision = 'undecided' and id in (${idList})`);
  }
}

const rows = await query("select id, file_path, file_name, source_group, mime_type, byte_size from public.asset_picker_assets where decision = 'undecided' order by source_group, file_name, id");
const rejected = new Map();
const duplicateHashes = new Map();
const reject = (id, reason) => {
  if (!rejected.has(reason)) rejected.set(reason, []);
  rejected.get(reason).push(id);
};

for (const [id, filePath, fileName, sourceGroup, mimeType, byteSize] of rows) {
  const lowerPath = `${filePath} ${fileName} ${sourceGroup}`.toLowerCase();
  if (/ADsP 강의 자료|AI 공부 자료|학교 필기|학교 과제 모음 zip|데이터 프로그래밍 DSAC MODULE|8진수_슬라이드|lecture|강의|필기|과제|수업|시험|문제|문항|정답|해설|수식|formula|equation|도표|그래프|chart|graph|table|표\b|professor_schedule|강의계획서|[\\/]page-[^\\/]+\.png$/i.test(lowerPath)) {
    reject(id, "coursework-formulas-and-charts");
    continue;
  }
  if (/중간결과포폴/i.test(lowerPath) && /(?:image16|image21|image22|image29|image39|image40|image41|image42|image43|image44|image45|image53|image54|image55|image59)\.(?:png|jpe?g)$/i.test(fileName)) {
    reject(id, "portfolio-docs-and-charts");
    continue;
  }
  if (Number(byteSize) < 4096) {
    reject(id, "tiny-files");
    continue;
  }
  if (mimeType === "image/svg+xml" || /(^|[\\/_-])(icon|logo|globe|vercel|next|window|file)([._/-]|$)/i.test(fileName)) {
    reject(id, "icons-and-ui-assets");
    continue;
  }
  if (/개인 보안 문서|본인 관련 서류|personal|private|security/i.test(lowerPath)) {
    reject(id, "private-documents");
    continue;
  }
  if (/\\node_modules\\|\\.next\\|\\.git\\|\\playwright-report\\|\\test-results\\|\\coverage\\/i.test(lowerPath)) {
    reject(id, "development-artifacts");
    continue;
  }
  try {
    if (!filePath) {
      reject(id, "missing-or-unreadable");
      continue;
    }
    const hash = createHash("sha256").update(await readFile(filePath)).digest("hex");
    if (duplicateHashes.has(hash)) {
      reject(id, "exact-duplicates");
    } else {
      duplicateHashes.set(hash, id);
    }
  } catch {
    reject(id, "missing-or-unreadable");
  }
}

for (const [, ids] of rejected) await update(ids);
console.log(`Reviewed ${rows.length} undecided assets.`);
for (const [reason, ids] of rejected) console.log(`${reason}: ${ids.length}`);
console.log(`Kept for human review: ${rows.length - [...rejected.values()].reduce((sum, ids) => sum + ids.length, 0)}`);
