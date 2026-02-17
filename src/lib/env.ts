import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  RESEND_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  DEMO_ENABLED: z.string().optional(),
  EMAIL_FROM: z.string().default("noreply@content.pl"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Missing or invalid environment variables:\n${message}`);
    }
    _env = parsed.data;
  }
  return _env;
}
