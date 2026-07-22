import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const catalogRoot = process.env.ASSET_PICKER_ROOT
  ? path.resolve(process.env.ASSET_PICKER_ROOT)
  : path.join(process.env.USERPROFILE ?? "", "OneDrive", "Desktop");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const extensions = new Map([
  [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".png", "image/png"],
  [".webp", "image/webp"], [".gif", "image/gif"], [".avif", "image/avif"],
  [".bmp", "image/bmp"], [".svg", "image/svg+xml"], [".tif", "image/tiff"],
  [".tiff", "image/tiff"], [".heic", "image/heic"], [".heif", "image/heif"],
]);
const ignoredDirectories = new Set([".git", ".next", "node_modules"]);


async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) yield* walk(path.join(directory, entry.name));
      continue;
    }
    if (entry.isFile()) yield path.join(directory, entry.name);
  }
}

async function upsert(batch) {
  if (!supabaseUrl || !serviceRoleKey) {
    await upsertLocal(batch);
    return;
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/asset_picker_assets?on_conflict=file_path`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(batch),
  });
  if (!response.ok) throw new Error(`Catalog upsert failed: ${await response.text()}`);
}

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function upsertLocal(batch) {
  const values = batch.map((asset) =>
    `(${sql(asset.file_path)}, ${sql(asset.file_name)}, ${sql(asset.source_group)}, ${sql(asset.mime_type)}, ${asset.byte_size}, ${sql(asset.modified_at)})`,
  );
  const query = `insert into public.asset_picker_assets (file_path, file_name, source_group, mime_type, byte_size, modified_at) values ${values.join(", ")} on conflict (file_path) do update set file_name = excluded.file_name, source_group = excluded.source_group, mime_type = excluded.mime_type, byte_size = excluded.byte_size, modified_at = excluded.modified_at, indexed_at = now()`;
  await new Promise((resolve, reject) => {
    const child = spawn("docker", [
      "exec", "-i", process.env.SUPABASE_LOCAL_DB_CONTAINER ?? "supabase_db_work-home",
      "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1",
    ]);
    let error = "";
    child.stderr.on("data", (chunk) => { error += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Local catalog upsert failed: ${error}`));
      }
    });
    child.stdin.end(`${query};`);
  });
}

let batch = [];
let count = 0;
const batchSize = 500;
for await (const filePath of walk(catalogRoot)) {
  const mimeType = extensions.get(path.extname(filePath).toLowerCase());
  if (!mimeType) continue;
  const metadata = await stat(filePath);
  const relativePath = path.relative(catalogRoot, filePath);
  batch.push({
    file_path: filePath,
    file_name: path.basename(filePath),
    source_group: relativePath.split(path.sep)[0] || "Desktop",
    mime_type: mimeType,
    byte_size: metadata.size,
    modified_at: metadata.mtime.toISOString(),
  });
  if (batch.length === batchSize) {
    await upsert(batch);
    count += batch.length;
    console.log(`Indexed ${count} images`);
    batch = [];
  }
}
if (batch.length) {
  await upsert(batch);
  count += batch.length;
}
console.log(`Indexed ${count} images into Supabase.`);
