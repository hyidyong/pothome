import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const guardPath = resolve(process.cwd(), "scripts/check-public-content.mjs");
const temporaryRoots: string[] = [];

function createRoot({ inventory = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "portfolio-content-guard-"));
  temporaryRoots.push(root);

  for (const directory of ["src", "public", "supabase/migrations", "tests"]) {
    mkdirSync(join(root, directory), { recursive: true });
  }

  if (inventory) {
    writeFileSync(
      join(root, "EXPERIENCE_INVENTORY.md"),
      "# Public experience inventory\n\nVerified aggregates only.\n",
      "utf8",
    );
  }

  return root;
}

function runGuard(root: string) {
  return spawnSync(process.execPath, [guardPath, "--root", root], {
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("public content guard", () => {
  it("fails clearly when the required inventory is missing", () => {
    const result = runGuard(createRoot({ inventory: false }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "FAIL: required file EXPERIENCE_INVENTORY.md is missing.",
    );
  });

  it("passes a clean public-content tree", () => {
    const result = runGuard(createRoot());

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS: public content guard");
    expect(result.stderr).toBe("");
  });

  it("reports every forbidden pattern by path and line without echoing values", () => {
    const root = createRoot();
    writeFileSync(
      join(root, "src", "unsafe.ts"),
      [
        "export const safe = true;",
        'const contact = "alpha@example.test";',
        'const mobile = "010-1234-5678";',
        'const resident = "900101-1234567";',
        'const privilegedRole = "service_role";',
        'const browserKey = "NEXT_PUBLIC_TOKEN";',
        'const privateKey = "-----BEGIN PRIVATE KEY-----";',
        'const credential = "PORTFOLIO_TOKEN=fixture-secret";',
        'const endpoint = "SUPABASE_URL=https://secret.invalid";',
      ].join("\n"),
      "utf8",
    );
    writeFileSync(
      join(root, "public", "sample.txt"),
      ["40 voices", "40 candidate rows", "후보자 원본 40명"].join("\n"),
      "utf8",
    );
    writeFileSync(
      join(root, "supabase", "migrations", "unsafe.sql"),
      "select '07 cases';\n",
      "utf8",
    );

    const result = runGuard(root);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("src/unsafe.ts:2 [contact-email]");
    expect(output).toContain("src/unsafe.ts:3 [korean-mobile]");
    expect(output).toContain("src/unsafe.ts:4 [resident-registration]");
    expect(output).toContain("src/unsafe.ts:5 [privileged-keyword]");
    expect(output).toContain("src/unsafe.ts:6 [browser-env]");
    expect(output).toContain("src/unsafe.ts:7 [private-key-marker]");
    expect(output).toContain("src/unsafe.ts:8 [credential-assignment]");
    expect(output).toContain("src/unsafe.ts:9 [credential-assignment]");
    expect(output).toContain("public/sample.txt:1 [raw-candidate-sample]");
    expect(output).toContain("public/sample.txt:2 [raw-candidate-sample]");
    expect(output).toContain("public/sample.txt:3 [raw-candidate-sample]");
    expect(output).toContain(
      "supabase/migrations/unsafe.sql:1 [forbidden-case-count]",
    );
    expect(output).not.toContain("alpha@example.test");
    expect(output).not.toContain("010-1234-5678");
    expect(output).not.toContain("fixture-secret");
    expect(output).not.toContain("900101-1234567");
  });

  it("does not scan protective tests or the path-only sensitive queue", () => {
    const root = createRoot();
    writeFileSync(
      join(root, "tests", "fixture.txt"),
      "alpha@example.test\n40 voices\n",
      "utf8",
    );
    writeFileSync(
      join(root, "SENSITIVE_REVIEW.txt"),
      "[EXCLUDE] /private/path | credential | review before publication\n",
      "utf8",
    );

    const result = runGuard(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS: public content guard");
  });
});
