"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { FORMATS, STATUSES, isFormat, isStatus, type FormatKey, type StatusKey } from "@/lib/formats";
import type { BookDTO } from "@/lib/book-dto";
import BookSpine from "./BookSpine";
import BookTome from "./BookTome";
import BookForm from "./BookForm";
import Fireflies from "./Fireflies";
import ShelfWildlife from "./ShelfWildlife";
import { FormatCritter, StatusCritter, Sprout } from "@/components/critters/Critters";
import { useSfx } from "@/components/ambiance/ambiance-context";

type SortKey = "recent" | "title" | "rating";
type GroupKey = "genre" | "status" | "month";

const GROUPINGS: { key: GroupKey; label: string }[] = [
  { key: "genre", label: "by genre" },
  { key: "status", label: "by standing" },
  { key: "month", label: "by month" },
];

// A shelf (bough) on the tree: a titled row of books grouped by one dimension.
type Shelf = {
  id: string;
  kind: GroupKey;
  metaKey: string;
  label: string;
  blurb?: string;
  items: BookDTO[];
};

// When did a book enter your reading life? Prefer finished, then started, then added.
function monthKeyOf(b: BookDTO): string {
  return (b.finishedAt ?? b.startedAt ?? b.createdAt).slice(0, 7); // YYYY-MM
}
function monthLabelOf(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function ShelvesView({ books: initialBooks }: { books: BookDTO[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sfx = useSfx();
  const [books, setBooks] = useState<BookDTO[]>(initialBooks);
  const [query, setQuery] = useState("");
  const [fmt, setFmt] = useState<FormatKey | "all">("all");
  const [status, setStatus] = useState<StatusKey | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [groupBy, setGroupBy] = useState<GroupKey>("genre");
  const [formOpen, setFormOpen] = useState(false);
  const [formBook, setFormBook] = useState<BookDTO | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openOrigin, setOpenOrigin] = useState<DOMRect | null>(null);

  // keep local list in step with the server (after refresh / revalidate)
  useEffect(() => { setBooks(initialBooks); }, [initialBooks]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (isStatus(statusParam)) setStatus(statusParam);

    const formatParam = searchParams.get("format");
    if (isFormat(formatParam)) setFmt(formatParam);

    const editId = searchParams.get("edit");
    if (!editId) return;
    const book = initialBooks.find((b) => b.id === editId);
    if (book) {
      setFormBook(book);
      setFormOpen(true);
    }
  }, [searchParams, initialBooks]);

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
      if (fmt !== "all" && b.format !== fmt) return false;
      if (q && !`${b.title} ${b.author ?? ""} ${b.series ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return out;
  }, [books, query, status, fmt, sort]);

  const openAdd = () => { sfx("open"); setFormBook(null); setFormOpen(true); };
  const openEdit = (b: BookDTO) => { setFormBook(b); setFormOpen(true); };
  const onSaved = useCallback(() => { setFormOpen(false); router.refresh(); }, [router]);

  const onOpenBook = useCallback((b: BookDTO, rect: DOMRect) => { setOpenOrigin(rect); setOpenId(b.id); }, []);
  // Read the live copy so the open book reflects inline edits (and closes if removed).
  const openBook = openId ? books.find((b) => b.id === openId) ?? null : null;
  const onTomeEdit = (b: BookDTO) => { setOpenId(null); openEdit(b); };

  // Arrange the filtered books into boughs by the chosen dimension.
  const shelves = useMemo<Shelf[]>(() => {
    if (groupBy === "status") {
      return STATUSES.map((s) => ({
        id: s.key, kind: "status" as const, metaKey: s.key, label: s.label,
        items: filtered.filter((b) => b.status === s.key),
      })).filter((g) => g.items.length > 0);
    }
    if (groupBy === "month") {
      const byMonth = new Map<string, BookDTO[]>();
      for (const b of filtered) {
        const k = monthKeyOf(b);
        const bucket = byMonth.get(k);
        if (bucket) bucket.push(b); else byMonth.set(k, [b]);
      }
      return [...byMonth.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([k, items]) => ({ id: k, kind: "month" as const, metaKey: k, label: monthLabelOf(k), items }));
    }
    return FORMATS.map((f) => ({
      id: f.key, kind: "genre" as const, metaKey: f.key, label: f.plural, blurb: f.blurb,
      items: filtered.filter((b) => b.format === f.key),
    })).filter((g) => g.items.length > 0);
  }, [filtered, groupBy]);
  const anyShown = shelves.length > 0;

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
              <FormatCritter format={f.key} size={16} /> {f.plural}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button className="chip" data-active={status === "all"} onClick={() => { sfx("tap"); setStatus("all"); }}>Any standing</button>
          {STATUSES.map((s) => (
            <button key={s.key} className="chip" data-active={status === s.key} onClick={() => { sfx("tap"); setStatus(s.key); }}>
              <StatusCritter status={s.key} size={15} /> {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center pt-1" style={{ borderTop: "1px solid rgba(120,86,46,0.18)" }}>
          <span className="font-hand text-base mr-1" style={{ color: "var(--color-moss-300)" }}>grow the tree</span>
          {GROUPINGS.map((g) => (
            <button key={g.key} className="chip" data-active={groupBy === g.key} onClick={() => { sfx("tap"); setGroupBy(g.key); }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {books.length === 0 ? (
        <div className="parchment p-8 text-center">
          <Sprout size={56} className="mx-auto mb-2 anim-sway" />
          <h2 className="font-display" style={{ fontSize: "1.6rem", color: "#2c2113" }}>Bare shelves, full of promise</h2>
          <p className="mt-2" style={{ color: "#5a4225" }}>Plant your first book to begin your wood.</p>
          <button onClick={openAdd} className="btn btn-ember mt-4"><Plus size={18} /> Add a book</button>
        </div>
      ) : !anyShown ? (
        <p className="text-center py-12 font-hand text-2xl" style={{ color: "var(--color-moss-300)" }}>
          no tomes answer to that search…
        </p>
      ) : (
        <div className="reading-tree">
          <div className="tree-bg" aria-hidden />
          <div className="tree-overlay" aria-hidden />
          <Fireflies />
          <div className="tree-shelves">
            {shelves.map((shelf, gi) => (
              <section key={shelf.id} className="branch-shelf">
                <div className="shelf-sign">
                  {shelf.kind === "genre" && <FormatCritter format={shelf.metaKey} size={22} />}
                  {shelf.kind === "status" && <StatusCritter status={shelf.metaKey} size={20} />}
                  {shelf.kind === "month" && <Sprout size={20} />}
                  <span className="font-serif-d">{shelf.label}</span>
                  <span className="shelf-sign-count">{shelf.items.length}</span>
                  {shelf.blurb && (
                    <span className="shelf-sign-blurb font-hand text-base hidden sm:inline">· {shelf.blurb}</span>
                  )}
                </div>
                <div className="shelf-books">
                  <AnimatePresence mode="popLayout">
                    {shelf.items.map((b) => (
                      <BookSpine key={b.id} book={b} onOpen={onOpenBook} />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="shelf-plank" />
                <ShelfWildlife index={gi} />
              </section>
            ))}
          </div>
        </div>
      )}

      <BookForm key={formBook?.id ?? "new"} open={formOpen} book={formBook} onClose={() => setFormOpen(false)} onSaved={onSaved} />

      <AnimatePresence>
        {openBook && (
          <BookTome
            key={openBook.id}
            book={openBook}
            origin={openOrigin}
            onClose={() => setOpenId(null)}
            onEdit={onTomeEdit}
            onLocalRemove={onLocalRemove}
            onLocalUpdate={onLocalUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
