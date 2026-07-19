import { afterEach, describe, expect, it } from "vitest";

import { getServerEnvironment } from "@/lib/env";

const originalUrl = process.env.SUPABASE_URL;
const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const legacyLocalJwt = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature";

afterEach(() => {
  process.env.SUPABASE_URL = originalUrl;
  process.env.SUPABASE_PUBLISHABLE_KEY = originalKey;
});

describe("server environment", () => {
  it("accepts a legacy anon JWT only for a loopback Supabase URL", () => {
    process.env.SUPABASE_URL = "http://127.0.0.1:55321";
    process.env.SUPABASE_PUBLISHABLE_KEY = legacyLocalJwt;

    expect(getServerEnvironment()).toEqual({
      SUPABASE_URL: "http://127.0.0.1:55321",
      SUPABASE_PUBLISHABLE_KEY: legacyLocalJwt,
    });
  });

  it("rejects a legacy anon JWT for a hosted URL", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = legacyLocalJwt;

    expect(() => getServerEnvironment()).toThrow(
      "must be a Supabase publishable key",
    );
  });

  it("accepts a publishable key for a hosted URL", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_publicExample_123";

    expect(getServerEnvironment()).toEqual({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_publicExample_123",
    });
  });
});
