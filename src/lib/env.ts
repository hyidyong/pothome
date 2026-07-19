import { z } from "zod";

const publishableKeyPattern = /^sb_publishable_[A-Za-z0-9_-]+$/;
const legacyJwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const loopbackHostnames = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

const serverEnvironmentSchema = z
  .object({
    SUPABASE_URL: z.url("must be a valid URL"),
    SUPABASE_PUBLISHABLE_KEY: z.string(),
  })
  .superRefine((environment, context) => {
    if (publishableKeyPattern.test(environment.SUPABASE_PUBLISHABLE_KEY)) {
      return;
    }

    const hostname = new URL(environment.SUPABASE_URL).hostname;
    const isLocalLegacyKey =
      loopbackHostnames.has(hostname) &&
      legacyJwtPattern.test(environment.SUPABASE_PUBLISHABLE_KEY);

    if (!isLocalLegacyKey) {
      context.addIssue({
        code: "custom",
        message: "must be a Supabase publishable key",
        path: ["SUPABASE_PUBLISHABLE_KEY"],
      });
    }
  });

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function getServerEnvironment(): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid server environment: ${details}`);
  }

  return result.data;
}
