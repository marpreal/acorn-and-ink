"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { FORMATS, STATUSES, type FormatKey, type StatusKey } from "@/lib/formats";
import type { BookDTO } from "@/lib/book-dto";
import BookCard from "./BookCard";
import BookForm from "./BookForm";
import { useSfx } from "@/components/ambiance/ambiance-context";

type SortKey = "recent" | "title" | "rating";

export default function ShelvesView({ books: initialBooks }: { books: BookDTO[] }) {
  const router = useRouter();
  const sfx = useSfx();
  const [books, setBooks] = useState<BookDTO[]>(initialBooks);
  const [query, setQuery] = useState("");
  const [fmt, setFmt] = useState<FormatKey | "all">("all");
  const [status, setStatus] = useState<StatusKey | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [formOpen, setFormOpen] = useState(false);
  const [formBook, setFormBook] = useState<BookDTO | null>(null);

  // keep local list in step with the server (after refresh / revalidate)
  useEffect(() => { setBooks(initialBooks); }, [initialBooks]);

  const onLocalRemove = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);
  const onLocalUpdate = useCallback((id: string, patch: Partial<BookDTO>) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = books.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (q && !`${b.title} ${b.author ?? ""} ${b.series ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return out;
  }, [books, query, status, sort]);

  const openAdd = () => { sfx("open"); setFormBook(null); setFormOpen(true); };
  const openEdit = (b: BookDTO) => { setFormBook(b); setFormOpen(true); };
  const onSaved = useCallback(() => { setFormOpen(false); router.refresh(); }, [router]);

  const shelves = FORMATS.filter((f) => fmt === "all" || f.key === fmt);
  const anyShown = filtered.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display glow-text" style={{ fontSize: "clamp(1.9rem,5vw,3rem)" }}>My Shelves</h1>
          <p style={{ color: "var(--color-moss-200)" }}>
            {books.length} {books.length === 1 ? "tome" : "tomes"} kept by candlelight.
          </p>
        </div>
        <button onClick={openAdd} className="btn btn-ember"><Plus size={18} /> Add a book</button>
      </header>

      <div className="glass rounded-2xl p-3 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b4a2b" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search your shelves…"
              className="ink-field" style={{ paddingLeft: "2.1rem" }} />
          </div>
          <select value={sort} onChange={(e) => { sfx("tap"); setSort(e.target.value as SortKey); }} className="ink-field" style={{ width: "auto" }}>
            <option value="recent">↧ recently added</option>
            <option value="title">A–Z by title</option>
            <option value="rating">most mushrooms</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button className="chip" data-active={fmt === "all"} onClick={() => { sfx("tap"); setFmt("all"); }}>All kinds</button>
          {FORMATS.map((f) => (
            <button key={f.key} className="chip" data-active={fmt === f.key} onClick={() => { sfx("tap"); setFmt(f.key); }}>
              {f.glyph} {f.plural}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button className="chip" data-active={status === "all"} onClick={() => { sfx("tap"); setStatus("all"); }}>Any standing</button>
          {STATUSES.map((s) => (
            <button key={s.key} className="chip" data-active={status === s.key} onClick={() => { sfx("tap"); setStatus(s.key); }}>
              {s.glyph} {s.label}
            </button>
          ))}
        </div>
      </div>

      {books.length === 0 ? (
        <div className="parchment p-8 text-center">
          <div className="text-5xl mb-2">🌱</div>
          <h2 className="font-display" style={{ fontSize: "1.6rem", color: "#2c2113" }}>Bare shelves, full of promise</h2>
          <p className="mt-2" style={{ color: "#5a4225" }}>Plant your first book to begin your wood.</p>
          <button onClick={openAdd} className="btn btn-ember mt-4"><Plus size={18} /> Add a book</button>
        </div>
      ) : !anyShown ? (
        <p className="text-center py-12 font-hand text-2xl" style={{ color: "var(--color-moss-300)" }}>
          no tomes answer to that search…
        </p>
      ) : (
        <LayoutGroup>
          <div className="flex flex-col gap-8">
            {shelves.map((f) => {
              const items = filtered.filter((b) => b.format === f.key);
              if (items.length === 0) return null;
              return (
                <section key={f.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="wood-panel rounded-lg px-3 py-1.5 font-serif-d flex items-center gap-2" style={{ color: "var(--color-glow)" }}>
                      <span className="text-lg">{f.glyph}</span> {f.plural}
                    </span>
                    <span className="text-sm" style={{ color: "var(--color-moss-300)" }}>{items.length}</span>
                    <span className="font-hand text-base" style={{ color: "var(--color-moss-400)" }}>· {f.blurb}</span>
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                    <AnimatePresence mode="popLayout">
                      {items.map((b) => (
                        <BookCard key={b.id} book={b} onEdit={openEdit} onLocalRemove={onLocalRemove} onLocalUpdate={onLocalUpdate} />
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="wood-panel mt-3 rounded-b-lg" style={{ height: 12 }} />
                </section>
              );
            })}
          </div>
        </LayoutGroup>
      )}

      <BookForm key={formBook?.id ?? "new"} open={formOpen} book={formBook} onClose={() => setFormOpen(false)} onSaved={onSaved} />
    </div>
  );
}
