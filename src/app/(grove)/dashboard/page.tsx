import Link from "next/link";
import { BookMarked, Library, ScrollText, Sprout } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReadingStats } from "@/lib/stats";
import { formatMeta, shelvesHref, statusMeta } from "@/lib/formats";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "The owls are still awake";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const stones = (s: Awaited<ReturnType<typeof getReadingStats>>) => [
  { glyph: "🍄", label: `Read in ${s.year}`, value: s.readThisYear, accent: "var(--color-toadstool-bright)", href: shelvesHref({ status: "read" }) },
  { glyph: "🌿", label: "Reading now", value: s.currentlyReading, accent: "var(--color-moss-300)", href: shelvesHref({ status: "reading" }) },
  { glyph: "🕯️", label: "On the wishlist", value: s.wishlisted, accent: "var(--color-candle)", href: shelvesHref({ status: "want" }) },
  { glyph: "📚", label: "Tomes in all", value: s.total, accent: "var(--color-wisp)", href: shelvesHref() },
];

const paths = [
  { href: "/shelves", icon: BookMarked, title: "My Shelves", text: "Add, tend and rate your novels, manga and comics." },
  { href: "/library", icon: Library, title: "Public Library", text: "Search the world's books and bring some home." },
  { href: "/journal", icon: ScrollText, title: "Journal", text: "Your reading to-do list and private marginalia." },
  { href: "/stats", icon: Sprout, title: "Stats Grove", text: "Watch this year's reading grow, by kind and in whole." },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, reading, recent, tasks] = await Promise.all([
    getReadingStats(user.id),
    prisma.book.findMany({ where: { userId: user.id, status: "reading" }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.book.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.task.findMany({ where: { userId: user.id, done: false }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }], take: 5 }),
  ]);

  const bare = stats.total === 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="anim-grow">
        <p className="font-hand text-2xl" style={{ color: "var(--color-wisp)" }}>{greeting()},</p>
        <h1 className="font-display glow-text" style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}>
          {user.name ?? "kind reader"}
        </h1>
        <p className="mt-1" style={{ color: "var(--color-moss-200)" }}>
          The library is quiet but for the turning of pages. Here is how your wood is growing.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stones(stats).map((st, i) => (
          <Link key={st.label} href={st.href} className="glass rounded-2xl p-5 anim-grow transition hover:-translate-y-0.5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="text-3xl">{st.glyph}</div>
            <div className="font-display mt-1" style={{ fontSize: "2.4rem", color: st.accent, lineHeight: 1 }}>
              {st.value}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--color-moss-200)" }}>{st.label}</div>
          </Link>
        ))}
      </section>

      {bare ? (
        <section className="parchment p-8 text-center anim-grow">
          <div className="text-5xl mb-2">🌱</div>
          <h2 className="font-display" style={{ fontSize: "1.8rem", color: "#2c2113" }}>Your shelves are bare</h2>
          <p className="mt-2 max-w-md mx-auto" style={{ color: "#5a4225" }}>
            Every great library begins with a single seed. Plant your first book — search the public
            library, or write one in by hand.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 justify-center">
            <Link href="/library" className="btn btn-ember">🔎 Search the public library</Link>
            <Link href="/shelves" className="btn btn-ghost" style={{ color: "#5a4225", borderColor: "rgba(120,86,46,0.4)" }}>✍ Add one by hand</Link>
          </div>
        </section>
      ) : (
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif-d text-xl" style={{ color: "var(--color-vellum)" }}>🌿 Currently reading</h2>
                <Link href={shelvesHref({ status: "reading" })} className="text-sm lantern-link">all reading →</Link>
              </div>
              {reading.length === 0 ? (
                <p className="mt-3 text-sm" style={{ color: "var(--color-moss-300)" }}>
                  Nothing open right now. Crack a spine and mark it <em>Reading</em>.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {reading.map((b) => (
                    <li key={b.id}>
                      <Link href={`/books/${b.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <span className="text-xl">{formatMeta(b.format).glyph}</span>
                        <div className="min-w-0">
                          <div className="truncate" style={{ color: "var(--color-vellum)" }}>{b.title}</div>
                          <div className="text-xs truncate" style={{ color: "var(--color-moss-300)" }}>{b.author ?? "unknown hand"}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-serif-d text-xl" style={{ color: "var(--color-vellum)" }}>🪶 Lately gathered</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {recent.map((b) => (
                  <li key={b.id}>
                    <Link href={`/books/${b.id}`} className="chip transition hover:-translate-y-0.5">
                      <span>{formatMeta(b.format).glyph}</span>
                      <span className="truncate max-w-[12rem]">{b.title}</span>
                      <span style={{ color: statusMeta(b.status).accent }}>{statusMeta(b.status).glyph}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-d text-xl" style={{ color: "var(--color-vellum)" }}>📜 To do</h2>
              <Link href="/journal" className="text-sm lantern-link">journal →</Link>
            </div>
            {tasks.length === 0 ? (
              <p className="mt-3 text-sm" style={{ color: "var(--color-moss-300)" }}>No tasks pinned to the corkboard.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-parchment)" }}>
                    <span style={{ color: "var(--color-candle)" }}>☐</span>
                    <span className="font-hand text-lg">{t.content}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paths.map((p) => (
          <Link key={p.href} href={p.href} className="glass rounded-2xl p-5 transition hover:-translate-y-0.5">
            <p.icon size={24} style={{ color: "var(--color-candle)" }} />
            <h3 className="font-serif-d text-lg mt-2" style={{ color: "var(--color-vellum)" }}>{p.title}</h3>
            <p className="text-sm mt-1" style={{ color: "var(--color-moss-200)" }}>{p.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
