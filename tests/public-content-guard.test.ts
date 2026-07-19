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

function encodeUtf16Be(value: string) {
  const encoded = Buffer.from(value, "utf16le");
  for (let index = 0; index + 1 < encoded.length; index += 2) {
    const first = encoded[index]!;
    encoded[index] = encoded[index + 1]!;
    encoded[index + 1] = first;
  }

  return Buffer.concat([Buffer.from([0xfe, 0xff]), encoded]);
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

  it("scans UTF-16LE BOM text instead of treating it as binary", () => {
    const root = createRoot();
    const encoded = Buffer.concat([
      Buffer.from([0xff, 0xfe]),
      Buffer.from("safe\nservice_role\n", "utf16le"),
    ]);
    writeFileSync(join(root, "src", "utf16le.txt"), encoded);

    const result = runGuard(root);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("src/utf16le.txt:2 [privileged-keyword]");
    expect(output).not.toContain("service_role");
  });

  it("scans UTF-16BE BOM text instead of treating it as binary", () => {
    const root = createRoot();
    writeFileSync(
      join(root, "src", "utf16be.txt"),
      encodeUtf16Be("safe\nNEXT_PUBLIC_TOKEN\n"),
    );

    const result = runGuard(root);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("src/utf16be.txt:2 [browser-env]");
    expect(output).not.toContain("NEXT_PUBLIC_TOKEN");
  });

  it("skips true binary data with NUL bytes and no supported text BOM", () => {
    const root = createRoot();
    writeFileSync(
      join(root, "public", "binary.bin"),
      Buffer.concat([
        Buffer.from([0x00, 0x01, 0x02]),
        Buffer.from("service_role"),
      ]),
    );

    const result = runGuard(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS: public content guard");
  });

  it.each([
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_CONNECTION_STRING",
    "DIRECT_URL",
  ])("rejects exposed database connection alias %s", (alias) => {
    const root = createRoot();
    const exposedValue = "postgresql://db.invalid/example";
    writeFileSync(
      join(root, "src", "connection.txt"),
      `${alias}=${exposedValue}\n`,
      "utf8",
    );

    const result = runGuard(root);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("src/connection.txt:1 [credential-assignment]");
    expect(output).not.toContain(exposedValue);
  });

  it.each(["DB_URL", "DB_URI", "DB_CONNECTION_STRING"])(
    "rejects generic database credential alias %s",
    (alias) => {
      const root = createRoot();
      const exposedValue = "postgresql://db.invalid/generic";
      writeFileSync(
        join(root, "src", "generic-connection.txt"),
        `${alias}=${exposedValue}\n`,
        "utf8",
      );

      const result = runGuard(root);
      const output = `${result.stdout}${result.stderr}`;

      expect(result.status).toBe(1);
      expect(output).toContain(
        "src/generic-connection.txt:1 [credential-assignment]",
      );
      expect(output).not.toContain(exposedValue);
    },
  );

  it("rejects a reversed English raw candidate sample phrase", () => {
    const root = createRoot();
    writeFileSync(
      join(root, "public", "raw-sample.txt"),
      "candidate raw sample count: 40\n",
      "utf8",
    );

    const result = runGuard(root);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("public/raw-sample.txt:1 [raw-candidate-sample]");
    expect(output).not.toContain("candidate raw sample count: 40");
  });

  it("rejects a label-first forbidden case count", () => {
    const root = createRoot();
    writeFileSync(
      join(root, "public", "case-count.txt"),
      "cases: 07\n",
      "utf8",
    );

    const result = runGuard(root);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("public/case-count.txt:1 [forbidden-case-count]");
    expect(output).not.toContain("cases: 07");
  });
});
