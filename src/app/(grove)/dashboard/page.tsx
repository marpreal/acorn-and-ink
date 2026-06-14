import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReadingStats } from "@/lib/stats";
import { shelvesHref } from "@/lib/formats";
import { readingProgress } from "@/lib/progress";
import { Toadstool, Sprout, Fairy, Oak, Quill, FormatCritter, StatusCritter, type Critter } from "@/components/critters/Critters";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "The owls are still awake";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const stones = (s: Awaited<ReturnType<typeof getReadingStats>>): { critter: Critter; label: string; value: number; accent: string; href: string }[] => [
  { critter: Toadstool, label: `Read in ${s.year}`, value: s.readThisYear, accent: "var(--color-toadstool-bright)", href: shelvesHref({ status: "read" }) },
  { critter: Sprout, label: "Reading now", value: s.currentlyReading, accent: "var(--color-moss-300)", href: shelvesHref({ status: "reading" }) },
  { critter: Fairy, label: "On the wishlist", value: s.wishlisted, accent: "var(--color-candle)", href: shelvesHref({ status: "want" }) },
  { critter: Oak, label: "Tomes in all", value: s.total, accent: "var(--color-wisp)", href: shelvesHref() },
];

const paths: { href: string; critter: Critter; title: string; text: string }[] = [
  { href: "/shelves", critter: Toadstool, title: "My Shelves", text: "Add, tend and rate your novels, manga and comics." },
  { href: "/library", critter: Oak, title: "Public Library", text: "Search the world's books and bring some home." },
  { href: "/journal", critter: Quill, title: "Journal", text: "Your reading to-do list and private marginalia." },
  { href: "/stats", critter: Sprout, title: "Stats Grove", text: "Watch this year's reading grow, by kind and in whole." },
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
            <st.critter size={34} className="anim-floaty" style={{ animationDuration: `${6 + i}s` }} />
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
                  {reading.map((b) => {
                    const pr = readingProgress(b);
                    return (
                      <li key={b.id}>
                        <Link href={`/books/${b.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <FormatCritter format={b.format} size={24} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate" style={{ color: "var(--color-vellum)" }}>{b.title}</div>
                            <div className="text-xs truncate" style={{ color: "var(--color-moss-300)" }}>{b.author ?? "unknown hand"}</div>
                          </div>
                          {pr.has && (
                            <span className="text-xs shrink-0 font-serif-d" style={{ color: "var(--color-candle)" }}>
                              {pr.unit === "chapter" ? "ch." : "p."} {pr.current ?? "—"}{pr.total != null ? `/${pr.total}` : ""}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-serif-d text-xl" style={{ color: "var(--color-vellum)" }}>🪶 Lately gathered</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {recent.map((b) => (
                  <li key={b.id}>
                    <Link href={`/books/${b.id}`} className="chip transition hover:-translate-y-0.5">
                      <FormatCritter format={b.format} size={16} />
                      <span className="truncate max-w-[12rem]">{b.title}</span>
                      <StatusCritter status={b.status} size={15} />
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
            <p.critter size={28} />
            <h3 className="font-serif-d text-lg mt-2" style={{ color: "var(--color-vellum)" }}>{p.title}</h3>
            <p className="text-sm mt-1" style={{ color: "var(--color-moss-200)" }}>{p.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
