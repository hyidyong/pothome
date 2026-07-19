import { z } from "zod";

const serverEnvironmentSchema = z.object({
  SUPABASE_URL: z.url("must be a valid URL"),
  SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .regex(
      /^sb_publishable_[A-Za-z0-9_-]+$/,
      "must be a Supabase publishable key",
    ),
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
