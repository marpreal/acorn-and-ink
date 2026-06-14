// Sync the live Postgres schema to match the code, then let the build continue.
//
// Runs during `npm run build` on Vercel (and can be run by hand to fix a drifted
// DB). Vercel/Neon inject POSTGRES_* names; Prisma wants DATABASE_URL (pooled,
// for the runtime client) + DIRECT_URL (non-pooled, used here for DDL — pooled
// PgBouncer connections can't hold the advisory lock `db push` needs).
//
//   Fix prod by hand:  DATABASE_URL='<neon direct url>' node scripts/db-deploy.mjs
import { execSync } from "node:child_process";

function pick(...values) {
  for (const v of values) if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

// Pooled URL for the runtime client.
process.env.DATABASE_URL = pick(
  process.env.DATABASE_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL,
);
// Direct (non-pooled) URL for schema changes; fall back to the pooled one.
process.env.DIRECT_URL = pick(
  process.env.DIRECT_URL,
  process.env.DATABASE_URL_UNPOOLED,
  process.env.POSTGRES_URL_NON_POOLING,
  process.env.DATABASE_URL,
);

if (!process.env.DATABASE_URL) {
  console.error("db-deploy: no DATABASE_URL (or POSTGRES_URL/POSTGRES_PRISMA_URL) found — skipping schema sync.");
  process.exit(1);
}

// No --accept-data-loss: additive changes apply automatically; a destructive
// change will fail the build loudly rather than silently drop data.
execSync("npx prisma db push --schema prisma/schema.production.prisma --skip-generate", {
  stdio: "inherit",
});
