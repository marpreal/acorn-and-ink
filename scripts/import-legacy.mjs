// Import books from the old my-library Postgres dump into Acorn & Ink.
//
//   Preview (no writes):   node --env-file=.env scripts/import-legacy.mjs you@email --dry
//   Import for real:       node --env-file=.env scripts/import-legacy.mjs you@email
//   Custom dump path:      ... you@email --file=/path/to/backup.sql
//
// The target reader (by email) must already exist — sign up in the app first.
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const args = process.argv.slice(2);
const email = args.find((a) => !a.startsWith("--"));
const dry = args.includes("--dry");
const fileArg = args.find((a) => a.startsWith("--file="))?.slice(7);
const statusArg = args.find((a) => a.startsWith("--status="))?.slice(9);
const file = path.resolve(fileArg ?? "../my-library/backup.sql");

if (!email) {
  console.error("Usage: node --env-file=.env scripts/import-legacy.mjs <email> [--dry] [--file=...] [--status=read|want]");
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`Dump not found at ${file}`);
  process.exit(1);
}

const sql = fs.readFileSync(file, "utf8");
const nn = (v) => (v === "\\N" || v === undefined ? null : v);

function copyBlock(table) {
  const re = new RegExp(`COPY public\\."${table}" \\(([^)]*)\\) FROM stdin;\\n([\\s\\S]*?)\\n\\\\\\.`, "m");
  const m = sql.match(re);
  if (!m) return { cols: [], rows: [] };
  const cols = m[1].split(",").map((s) => s.trim().replace(/"/g, ""));
  const body = m[2];
  const rows = body.length ? body.split("\n").map((line) => line.split("\t")) : [];
  return {
    cols,
    rows: rows.map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i]]))),
  };
}

const books = copyBlock("Book");
const reviews = copyBlock("Review");
console.log(`Found ${books.rows.length} legacy books and ${reviews.rows.length} reviews.`);

// first review per legacy bookId (for rating + text)
const reviewByBook = new Map();
for (const r of reviews.rows) {
  if (!reviewByBook.has(r.bookId)) reviewByBook.set(r.bookId, r);
}

const mapped = books.rows
  .filter((b) => nn(b.title))
  .map((b) => {
    const rev = reviewByBook.get(b.id);
    const ratingRaw = rev ? Number(rev.rating) : null;
    const date = nn(b.date) ? new Date(b.date.replace(" ", "T")) : null;
    const status = statusArg ?? "read";
    return {
      title: b.title,
      author: nn(b.author),
      coverUrl: nn(b.imageUrl),
      description: nn(b.description),
      publisher: nn(b.publisher),
      format: "novel",
      status,
      rating: ratingRaw && Number.isFinite(ratingRaw) ? Math.max(0, Math.min(5, ratingRaw)) : null,
      review: rev ? nn(rev.review) : null,
      finishedAt: status === "read" ? (date && !isNaN(date) ? date : null) : null,
    };
  });

console.log(`Mapped ${mapped.length} books:`);
for (const m of mapped) console.log(`  • ${m.title}${m.author ? " — " + m.author : ""}${m.rating ? `  (${m.rating}🍄)` : ""}`);

if (dry) {
  console.log("\n(dry run — nothing written. Drop --dry to import.)");
  process.exit(0);
}

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
if (!user) {
  console.error(`\nNo reader found with email "${email}". Sign up in the app first, then re-run.`);
  await prisma.$disconnect();
  process.exit(1);
}

let added = 0, skipped = 0;
for (const m of mapped) {
  const dup = await prisma.book.findFirst({ where: { userId: user.id, title: m.title, author: m.author } });
  if (dup) { skipped++; continue; }
  await prisma.book.create({ data: { ...m, userId: user.id } });
  added++;
}
console.log(`\nDone. Added ${added}, skipped ${skipped} (already present) for ${email}.`);
await prisma.$disconnect();
