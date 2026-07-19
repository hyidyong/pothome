import { existsSync, readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

const ROOT_FLAG = "--root";
const rootFlagIndex = process.argv.indexOf(ROOT_FLAG);
const requestedRoot =
  rootFlagIndex >= 0 ? process.argv[rootFlagIndex + 1] : undefined;

if (rootFlagIndex >= 0 && !requestedRoot) {
  console.error("FAIL: --root requires a directory path.");
  process.exit(1);
}

const root = requestedRoot
  ? isAbsolute(requestedRoot)
    ? requestedRoot
    : resolve(process.cwd(), requestedRoot)
  : process.cwd();
const inventoryPath = join(root, "EXPERIENCE_INVENTORY.md");

if (!existsSync(inventoryPath)) {
  console.error("FAIL: required file EXPERIENCE_INVENTORY.md is missing.");
  process.exit(1);
}

const rules = [
  {
    id: "contact-email",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  },
  {
    id: "korean-mobile",
    pattern: /(?<!\d)01[016789][ -]?\d{3,4}[ -]?\d{4}(?!\d)/,
  },
  {
    id: "resident-registration",
    pattern: /(?<!\d)\d{6}[ -]?[1-4]\d{6}(?!\d)/,
  },
  {
    id: "privileged-keyword",
    pattern: /\bservice_role\b/i,
  },
  {
    id: "browser-env",
    pattern: /\bNEXT_PUBLIC_[A-Z0-9_]+\b/i,
  },
  {
    id: "private-key-marker",
    pattern: /-----BEGIN(?: [A-Z0-9]+)* PRIVATE KEY-----/i,
  },
  {
    id: "credential-assignment",
    pattern:
      /\b(?:[A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)|(?:(?:SUPABASE|DATABASE|POSTGRES|POSTGRESQL|PG)_[A-Z0-9_]*(?:URL|URI|CONNECTION_STRING)[A-Z0-9_]*|DIRECT_URL))\s*=\s*(?!["']?\s*(?:$|<|your-|replace|example|placeholder))\S+/,
  },
  {
    id: "raw-candidate-sample",
    pattern:
      /(?:\b40\s+(?:candidate\s+rows?|candidate\s+responses?|candidates?|voices?)\b|\b(?:candidates?|applicants?|respondents?)\s+(?:raw|original)\s+(?:sample\s+)?(?:count|size|rows?|responses?)\s*[:=]\s*40\b|(?:후보자|지원자|응답자).{0,12}(?:원본|원시|행|응답|표본)?.{0,4}40\s*(?:명|개|건)?|40\s*(?:명|개|건)?.{0,12}(?:후보자|지원자|응답자))/i,
  },
  {
    id: "forbidden-case-count",
    pattern:
      /(?:\b07\s+cases?\b|\bcases?\s*[:=]\s*07\b|\bcase\s+count\s*[:=]\s*07\b|07\s*개\s*사례|사례\s*07\s*(?:개|건)?)/i,
  },
];

function collectFiles(path) {
  if (!existsSync(path)) {
    return [];
  }

  const entries = readdirSync(path, { withFileTypes: true }).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
  const files = [];

  for (const entry of entries) {
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function decodeText(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le");
  }

  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    const littleEndian = Buffer.from(buffer.subarray(2));
    for (let index = 0; index + 1 < littleEndian.length; index += 2) {
      const first = littleEndian[index];
      littleEndian[index] = littleEndian[index + 1];
      littleEndian[index + 1] = first;
    }
    return littleEndian.toString("utf16le");
  }

  if (buffer.includes(0)) {
    return null;
  }

  return buffer.toString("utf8").replace(/^\uFEFF/u, "");
}

const files = [
  ...collectFiles(join(root, "src")),
  ...collectFiles(join(root, "public")),
  ...collectFiles(join(root, "supabase", "migrations")),
  inventoryPath,
];
const violations = [];

for (const file of files) {
  const buffer = readFileSync(file);
  const text = decodeText(buffer);
  if (text === null) {
    continue;
  }

  const lines = text.split(/\r?\n/u);
  lines.forEach((line, index) => {
    for (const rule of rules) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: relative(root, file).replaceAll("\\", "/"),
          line: index + 1,
          rule: rule.id,
        });
      }
    }
  });
}

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(
      `VIOLATION ${violation.file}:${violation.line} [${violation.rule}]`,
    );
  }
  console.error(
    `FAIL: public content guard found ${violations.length} violation(s).`,
  );
  process.exit(1);
}

console.log("PASS: public content guard");
