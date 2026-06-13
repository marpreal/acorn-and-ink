# 🍄 Acorn & Ink

> *An enchanted library tucked in the heart of the wood — where you keep your books like pressed flowers, counted, scored in mushrooms, and remembered.*

A cozy, goblincore / cottagecore reading tracker. Tend shelves of **novels, manga and comics** by candlelight: add, edit and let books go; rate them in toadstools; write private marginalia; keep a reading to-do list; search the world's books in the public library; and watch your year of reading grow in the Stats Grove.

The cursor is a **candle that lights your way**, **fireflies** drift across the glade, **leaves** fall, and the forest hums with music (tap the 🏮 lantern, bottom-right).

---

## ✨ What's inside

- **Your shelves** — novels / manga / comics / curios, with reading status: *want · reading · read · paused · dropped*.
- **Mushroom scores** — rate 0–5 in half-steps 🍄, plus a private long-form review per book.
- **The public library** — search [Open Library](https://openlibrary.org), see the community's average score, and carry finds home in one tap.
- **The journal** — a parchment to-do list and pinned marginalia (notes that can attach to a book).
- **The stats grove** — books finished *this year* per kind, the grand tally of all three together, and your library's makeup.
- **A synced account** — sign up with email + passphrase; your library follows you (sessions are signed, http-only cookies).
- **Atmosphere** — candle cursor, fireflies, falling leaves, forest music + a procedural sound engine (page-turns, sparkles, chimes generated in code). All toggleable, and it respects `prefers-reduced-motion`.

## 🪵 Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma + Postgres · Framer Motion · Howler + Web Audio · Open Library API.

## 🌱 Getting started

This project uses **Postgres**. The quickest way to get a free database (and the connection strings for `.env`) is in **[DEPLOY.md](./DEPLOY.md)** — it works the same for local dev and for Vercel.

```bash
npm install
# put your DATABASE_URL + DIRECT_URL + AUTH_SECRET in .env (see .env.example)
npx prisma migrate dev      # applies the schema to your database
npm run dev                 # http://localhost:3000
```

Open the door, **plant a library** (sign up), and begin.

Want it pre-filled to explore? Seed a demo reader (`test@thewood.glade` / `acorns-and-ink`) with sample books:

```bash
node --env-file=.env scripts/seed-test.mjs
```

## 📦 Bringing your old books across

Books from the previous `my-library` project can be imported:

```bash
# preview what would be imported (no writes)
node --env-file=.env scripts/import-legacy.mjs you@your-email --dry

# import for real (sign up with that email in the app first)
node --env-file=.env scripts/import-legacy.mjs you@your-email
```

## 🚀 Deploying to Vercel

The project is already configured for **Vercel Postgres (Neon)** — `prisma generate` runs on install and `prisma migrate deploy` runs during the build. Full click-by-click guide in **[DEPLOY.md](./DEPLOY.md)**.

## 🔑 Environment

`.env` (git-ignored) — see `.env.example`:

```
DATABASE_URL="postgresql://…   (pooled connection)"
DIRECT_URL="postgresql://…     (direct connection, for migrations)"
AUTH_SECRET="<a long random string>"
```

## 🎵 Credits

Forest music tracks (`/public/sounds`) and the book-and-crystal-ball sigil were brought over from your own earlier `acorn-faery` and `my-library` projects. The forest-floor texture is your fly-agaric photo. Replace anything in `/public` with your own assets freely.

---

*Tended by candlelight.* 🕯️
