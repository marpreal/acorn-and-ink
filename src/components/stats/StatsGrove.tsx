"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FORMATS, STATUSES, shelvesHref } from "@/lib/formats";
import type { ReadingStats } from "@/lib/stats";

function CountUp({ value, duration = 1100 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n}</>;
}

export default function StatsGrove({ stats }: { stats: ReadingStats }) {
  const ref = useRef<HTMLDivElement>(null);

  const yearFormats = FORMATS.map((f) => ({ ...f, count: stats.readThisYearByFormat[f.key] ?? 0 }));
  const maxYear = Math.max(1, ...yearFormats.map((f) => f.count));
  const totalLib = Math.max(1, stats.total);

  const stones = [
    { glyph: "🌲", label: "Read all-time", value: stats.readAllTime, href: shelvesHref({ status: "read" }) },
    { glyph: "📚", label: "Tomes in all", value: stats.total, href: shelvesHref() },
    { glyph: "🌿", label: "Reading now", value: stats.currentlyReading, href: shelvesHref({ status: "reading" }) },
    { glyph: "🕯️", label: "On the wishlist", value: stats.wishlisted, href: shelvesHref({ status: "want" }) },
  ];

  return (
    <div ref={ref} className="flex flex-col gap-8">
      <header>
        <h1 className="font-display glow-text" style={{ fontSize: "clamp(1.9rem,5vw,3rem)" }}>The Stats Grove</h1>
        <p style={{ color: "var(--color-moss-200)" }}>Every book you finish plants a little tree. Here is your year, growing.</p>
      </header>

      {/* THIS YEAR — growing bars */}
      <section className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <p className="font-hand text-2xl" style={{ color: "var(--color-wisp)" }}>in {stats.year}, you&rsquo;ve finished</p>
            <div className="font-display glow-text leading-none" style={{ fontSize: "clamp(3rem,12vw,6rem)" }}>
              <CountUp value={stats.readThisYear} />
            </div>
            <p className="font-serif-d text-lg" style={{ color: "var(--color-moss-200)" }}>
              {stats.readThisYear === 1 ? "book, comic & manga all together" : "books, comics & manga all together"}
            </p>
          </div>
          {stats.averageRating != null && (
            <div className="text-right">
              <div className="font-display" style={{ fontSize: "2rem", color: "var(--color-toadstool-bright)" }}>{stats.averageRating}🍄</div>
              <div className="text-sm" style={{ color: "var(--color-moss-300)" }}>average score · {stats.rated} rated</div>
            </div>
          )}
        </div>

        <div className="flex items-end justify-around gap-4 pt-4" style={{ minHeight: 230 }}>
          {yearFormats.map((f, i) => {
            const h = 30 + (f.count / maxYear) * 170;
            return (
              <div key={f.key} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
                <div className="font-display" style={{ fontSize: "1.8rem", color: f.accent }}><CountUp value={f.count} /></div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ duration: 1, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full rounded-t-xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(180deg, ${f.accent}, ${f.accent}55)`,
                    boxShadow: `0 0 26px -8px ${f.accent}, inset 0 2px 0 rgba(255,255,255,0.25)`,
                  }}
                >
                  <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 10px)" }} />
                </motion.div>
                <div className="text-3xl">{f.glyph}</div>
                <div className="text-sm font-serif-d" style={{ color: "var(--color-moss-200)" }}>{f.plural}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STONES */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stones.map((s, i) => (
          <Link key={s.label} href={s.href} className="glass rounded-2xl p-5 anim-grow transition hover:-translate-y-0.5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="text-3xl">{s.glyph}</div>
            <div className="font-display mt-1" style={{ fontSize: "2.2rem", color: "var(--color-glow)", lineHeight: 1 }}>
              <CountUp value={s.value} />
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--color-moss-200)" }}>{s.label}</div>
          </Link>
        ))}
      </section>

      {/* DISTRIBUTIONS */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-serif-d text-xl mb-3" style={{ color: "var(--color-vellum)" }}>🌳 Your library by kind</h2>
          <div className="flex flex-col gap-3">
            {FORMATS.map((f) => {
              const c = stats.byFormat[f.key] ?? 0;
              return (
                <div key={f.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "var(--color-moss-200)" }}>{f.glyph} {f.plural}</span>
                    <span style={{ color: f.accent }}>{c}</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(c / totalLib) * 100}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full" style={{ background: f.accent }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-serif-d text-xl mb-3" style={{ color: "var(--color-vellum)" }}>🕯️ Where they stand</h2>
          <div className="flex flex-col gap-3">
            {STATUSES.map((s) => {
              const c = stats.byStatus[s.key] ?? 0;
              return (
                <Link key={s.key} href={shelvesHref({ status: s.key })} className="block rounded-lg transition hover:bg-white/5 -mx-1 px-1 py-0.5">
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "var(--color-moss-200)" }}>{s.glyph} {s.label}</span>
                    <span style={{ color: s.accent }}>{c}</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(c / totalLib) * 100}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full" style={{ background: s.accent }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
