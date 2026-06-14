# 🚀 Deploying Acorn & Ink to Vercel

Acorn & Ink is a normal Next.js app, so the only real setup is a **hosted database** — your local SQLite file can't run on Vercel's serverless filesystem. We'll use **Vercel Postgres (Neon)** (free tier).

The project is already prepared for this:

- Local dev uses `prisma/schema.prisma` (SQLite); Vercel uses `prisma/schema.production.prisma` (Postgres, with `DATABASE_URL` pooled + `DIRECT_URL` direct). Keep the models in the two files identical.
- The Vercel build (`npm run build`) runs `prisma generate` → `prisma db push` (via `scripts/db-deploy.mjs`) → `next build`, so the live database schema is brought in sync with the code on **every deploy**. Push is additive; a destructive schema change fails the build instead of dropping data.

Follow the steps in order. ☕

---

## 1 · Put the code on GitHub

```bash
cd acorn-and-ink
git add -A
git commit -m "Acorn & Ink"
git branch -M main
```

Create the GitHub repo and push. Easiest with the GitHub CLI:

```bash
gh repo create acorn-and-ink --private --source=. --remote=origin --push
```

> Not logged into `gh`? Run an interactive login from the prompt by typing:
> `! gh auth login`
>
> Or make a repo on github.com, then:
> ```bash
> git remote add origin https://github.com/<you>/acorn-and-ink.git
> git push -u origin main
> ```

Your `.env` is git-ignored, so no secrets are pushed. ✅

---

## 2 · Create the database (Neon) & copy its connection strings

**Easiest:** in the [Vercel dashboard](https://vercel.com/dashboard) → **Storage** → **Create Database** → **Postgres (Neon)**. Create it (you can attach it to the project in step 4).

In the database's **`.env.local` / connection** panel, copy **two** strings:

| You need | Looks like | Vercel may label it |
|---|---|---|
| **Pooled** | host has `-pooler` | `DATABASE_URL` |
| **Direct** | host *without* `-pooler` | `DATABASE_URL_UNPOOLED` or `POSTGRES_URL_NON_POOLING` |

*(Alternatively create a free DB straight from [neon.tech](https://neon.tech) and copy the pooled + direct strings from its dashboard.)*

---

## 3 · Create the first migration (locally, against Neon)

Put the two strings into `.env` — `DATABASE_URL` = **pooled**, `DIRECT_URL` = **direct** — keep your `AUTH_SECRET`. Then:

```bash
npx prisma migrate dev --name init
```

This creates `prisma/migrations/…/migration.sql` and applies it to Neon.

> If Neon complains about a *shadow database*, run `npx prisma db push` instead — it sets the schema up directly. (The build's `migrate deploy` will then simply be a no-op, which is fine.)

Commit and push the migration:

```bash
git add -A && git commit -m "Postgres initial migration" && git push
```

You can now run the app locally against Neon too: `npm run dev`.

---

## 4 · Import the project into Vercel & set env vars

1. [vercel.com/new](https://vercel.com/new) → **Import** your `acorn-and-ink` repo.
2. If you didn't attach the database yet: project → **Storage** → connect the Neon DB you made.
3. Project → **Settings → Environment Variables** (apply to **Production** *and* **Preview**):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the **pooled** string |
   | `DIRECT_URL` | the **direct** string |
   | `AUTH_SECRET` | a long random string — run `openssl rand -hex 32` |

   > Attaching Neon storage usually sets `DATABASE_URL` for you; you still need to add **`DIRECT_URL`** (the unpooled string) and **`AUTH_SECRET`** yourself.

4. **Deploy** (or redeploy). The build runs `prisma generate` → `prisma migrate deploy` → `next build`, so your tables are created automatically.

That's it — open the deployment URL, **plant a library**, and you're live. 🍄

---

## CLI alternative (instead of steps 4)

```bash
npm i -g vercel
vercel            # links/creates the project
vercel env add DATABASE_URL production     # paste pooled
vercel env add DIRECT_URL production       # paste direct
vercel env add AUTH_SECRET production      # paste a random string
vercel --prod
```

---

## Notes & troubleshooting

- **`AUTH_SECRET` must be set in Vercel**, or sign-in/sign-up will fail.
- The build applies migrations, so it needs `DATABASE_URL` + `DIRECT_URL` available at **build time** (Vercel exposes env vars to builds by default).
- First import sometimes builds *before* you've added the DB/env — just add them and hit **Redeploy**.
- **Seed demo data on the live DB** (optional): with the Neon URLs in `.env`, run `node --env-file=.env scripts/seed-test.mjs`.
- **Bring your old books across**: `node --env-file=.env scripts/import-legacy.mjs you@email --dry` (drop `--dry` to import).
- `public/sounds` holds ~71 MB of music. It deploys fine, but you can delete tracks you don't want (and trim the list in `src/components/ambiance/audio-engine.ts`) to keep things lean.
- Custom domain: Vercel project → **Settings → Domains**.
