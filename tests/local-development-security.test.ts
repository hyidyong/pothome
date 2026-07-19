import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("local development security", () => {
  it("keeps optional Supabase services disabled and the database loopback-only", () => {
    const config = readFileSync(resolve(root, "supabase/config.toml"), "utf8");

    expect(config).toContain("[db.network_restrictions]");
    expect(config).toContain('allowed_cidrs = ["127.0.0.0/8"]');
    expect(config).toContain('allowed_cidrs_v6 = ["::1/128"]');

    for (const section of [
      "auth",
      "realtime",
      "storage",
      "studio",
      "analytics",
    ]) {
      expect(config).toMatch(
        new RegExp(`\\[${section}\\]\\s+[\\s\\S]*?enabled = false`),
      );
    }
  });

  it("keeps the app loopback-only without breaking the default Supabase network", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(root, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts["supabase:local:start"]).toBe(
      "pnpm exec supabase start",
    );
    expect(packageJson.scripts["supabase:local:start"]).not.toContain(
      "--network-id",
    );
    expect(packageJson.scripts["supabase:local:stop"]).toBe(
      "pnpm exec supabase stop",
    );
    expect(packageJson.scripts["dev:local"]).toContain("--hostname 127.0.0.1");
  });
});
