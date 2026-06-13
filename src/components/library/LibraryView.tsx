"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ExternalLink, Loader2, Plus, Search } from "lucide-react";
import type { PublicBook } from "@/lib/openlibrary";
import { FORMATS } from "@/lib/formats";
import { addPublicBook } from "@/app/(grove)/library/actions";
import MushroomRating from "@/components/books/MushroomRating";
import { useSfx } from "@/components/ambiance/ambiance-context";

const SUGGESTIONS = ["cottagecore", "Studio Ghibli", "fairy tales", "Tolkien", "Berserk", "Susanna Clarke"];

export default function LibraryView({ existingKeys }: { existingKeys: string[] }) {
  const router = useRouter();
  const sfx = useSfx();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set(existingKeys));
  const [fmtFor, setFmtFor] = useState<Record<string, string>>({});
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, start] = useTransition();
  const reqId = useRef(0);

  async function search(q: string) {
    const term = q.trim();
    if (!term) return;
    sfx("page");
    setLoading(true); setError(null); setSearched(true);
    const id = ++reqId.current;
    try {
      const res = await fetch(`/api/library/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (id !== reqId.current) return; // a newer search won
      if (!res.ok) { setError(data.error ?? "Something went awry."); setResults([]); }
      else { setResults(data.results ?? []); if ((data.results ?? []).length) sfx("sparkle"); }
    } catch {
      if (id === reqId.current) setError("The ravens couldn't reach the library.");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }

  function add(b: PublicBook) {
    const format = fmtFor[b.olKey] ?? "novel";
    setPendingKey(b.olKey);
    start(async () => {
      const r = await addPublicBook({
        title: b.title, author: b.author, coverUrl: b.coverUrl, olKey: b.olKey,
        isbn: b.isbn, publishedYear: b.year, pageCount: b.pageCount, format, status: "want",
      });
      setPendingKey(null);
      if (r.ok) {
        sfx("success");
        setAdded((s) => new Set(s).add(b.olKey));
        router.refresh();
      } else {
        sfx("error");
        if (r.error === "Already on your shelves.") setAdded((s) => new Set(s).add(b.olKey));
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display glow-text" style={{ fontSize: "clamp(1.9rem,5vw,3rem)" }}>The Public Library</h1>
        <p style={{ color: "var(--color-moss-200)" }}>
          Wander the world&rsquo;s books, borrow the community&rsquo;s mushroom-scores, and carry your finds home.
        </p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); search(query); }} className="glass rounded-2xl p-3 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b4a2b" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="a title, an author, a feeling…"
            className="ink-field" style={{ paddingLeft: "2.3rem" }} />
        </div>
        <button type="submit" className="btn btn-ember" disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Seek
        </button>
      </form>

      {!searched && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-hand text-lg" style={{ color: "var(--color-moss-300)" }}>try:</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => { setQuery(s); search(s); }}>{s}</button>
          ))}
        </div>
      )}

      {error && (
        <p className="parchment p-4 text-center" style={{ color: "#7a1f12" }}>🥀 {error}</p>
      )}

      {loading && (
        <div className="text-center py-12 font-hand text-2xl anim-flicker" style={{ color: "var(--color-candle)" }}>
          🕯️ searching the stacks…
        </div>
      )}

      {!loading && searched && !error && results.length === 0 && (
        <p className="text-center py-12 font-hand text-2xl" style={{ color: "var(--color-moss-300)" }}>
          the stacks hold nothing by that name…
        </p>
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {results.map((b, i) => {
          const isAdded = added.has(b.olKey);
          const isPending = pendingKey === b.olKey;
          return (
            <motion.article
              key={b.olKey}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="glass rounded-2xl p-3 flex gap-3"
            >
              <div className="shrink-0 rounded-lg overflow-hidden grid place-items-center" style={{ width: 76, height: 114, background: "rgba(0,0,0,0.3)" }}>
                {b.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-3xl opacity-50">📖</span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-serif-d leading-tight" style={{ color: "var(--color-vellum)", fontSize: "1rem" }}>{b.title}</h3>
                <p className="text-xs truncate" style={{ color: "var(--color-moss-300)" }}>
                  {b.author ?? "unknown hand"}{b.year ? ` · ${b.year}` : ""}
                </p>

                <div className="mt-1.5 flex items-center gap-1.5">
                  {b.ratingAverage != null ? (
                    <>
                      <MushroomRating value={b.ratingAverage} size={13} />
                      <span className="text-[0.7rem]" style={{ color: "var(--color-moss-300)" }}>
                        {b.ratingAverage} · {b.ratingCount ?? 0} readers
                      </span>
                    </>
                  ) : (
                    <span className="text-[0.7rem]" style={{ color: "var(--color-moss-400)" }}>no scores yet</span>
                  )}
                </div>

                <div className="mt-auto pt-2 flex items-center gap-1.5">
                  {isAdded ? (
                    <span className="chip" data-active="true" style={{ cursor: "default" }}><Check size={13} /> On your shelves</span>
                  ) : (
                    <>
                      <select
                        value={fmtFor[b.olKey] ?? "novel"}
                        onChange={(e) => setFmtFor((m) => ({ ...m, [b.olKey]: e.target.value }))}
                        className="text-xs rounded-full px-2 py-1 cursor-pointer"
                        style={{ background: "rgba(159,174,100,0.12)", color: "var(--color-moss-200)", border: "1px solid rgba(159,174,100,0.3)" }}
                        aria-label="Kind of book"
                      >
                        {FORMATS.map((f) => <option key={f.key} value={f.key} style={{ color: "#222" }}>{f.glyph} {f.label}</option>)}
                      </select>
                      <button onClick={() => add(b)} disabled={isPending} className="btn btn-ember" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                        {isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add
                      </button>
                    </>
                  )}
                  <a href={`https://openlibrary.org${b.olKey}`} target="_blank" rel="noopener noreferrer"
                    onMouseEnter={() => sfx("hover")} title="View on Open Library"
                    className="ml-auto p-1 opacity-60 hover:opacity-100" style={{ color: "var(--color-moss-200)" }}>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
