/**
 * Vercel + Neon often inject POSTGRES_* names. Prisma expects DATABASE_URL.
 * Map pooled URLs only — never use unpooled for runtime.
 */
function pickFirst(...values: Array<string | undefined>): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

export function ensureRuntimeEnv(): void {
  if (!process.env.DATABASE_URL) {
    const pooled = pickFirst(
      process.env.POSTGRES_URL,
      process.env.POSTGRES_PRISMA_URL,
    );
    if (pooled) process.env.DATABASE_URL = pooled;
  }

  if (!process.env.DIRECT_URL) {
    const direct = pickFirst(
      process.env.DATABASE_URL_UNPOOLED,
      process.env.POSTGRES_URL_NON_POOLING,
    );
    if (direct) process.env.DIRECT_URL = direct;
  }
}

export function authConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim());
}

ensureRuntimeEnv();
