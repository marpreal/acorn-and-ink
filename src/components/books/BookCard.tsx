"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Trash2, NotebookPen } from "lucide-react";
import Link from "next/link";
import { setBookStatus, setBookRating, deleteBook } from "@/app/(grove)/shelves/actions";
import { formatMeta, statusMeta, STATUSES } from "@/lib/formats";
import type { BookDTO } from "@/lib/book-dto";
import MushroomRating from "./MushroomRating";
import { useSfx } from "@/components/ambiance/ambiance-context";

export default function BookCard({
  book,
  onEdit,
  onLocalRemove,
  onLocalUpdate,
}: {
  book: BookDTO;
  onEdit: (b: BookDTO) => void;
  onLocalRemove: (id: string) => void;
  onLocalUpdate: (id: string, patch: Partial<BookDTO>) => void;
}) {
  const router = useRouter();
  const sfx = useSfx();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const fmt = formatMeta(book.format);
  const st = statusMeta(book.status);

  const remove = () => {
    sfx("close");
    setConfirming(false);
    onLocalRemove(book.id); // vanish immediately
    start(async () => { await deleteBook(book.id); router.refresh(); });
  };

  const changeStatus = (status: string) => {
    sfx("tap");
    onLocalUpdate(book.id, { status });
    start(async () => { await setBookStatus(book.id, status); router.refresh(); });
  };

  const rate = (v: number) => {
    sfx("tap");
    onLocalUpdate(book.id, { rating: v === 0 ? null : v });
    start(async () => { await setBookRating(book.id, v); router.refresh(); });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="glass rounded-2xl p-3 flex gap-3 relative"
      style={{ opacity: pending ? 0.75 : 1 }}
    >
      {book.favorite && (
        <span className="absolute -top-2 -right-2 text-lg" title="A treasured favourite" style={{ filter: "drop-shadow(0 0 6px rgba(245,196,81,0.8))" }}>✦</span>
      )}

      <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 72, height: 108, boxShadow: "0 8px 18px -10px rgba(0,0,0,0.8)" }}>
        <Link href={`/books/${book.id}`} onClick={() => sfx("page")} className="block w-full h-full">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full grid place-items-center p-1.5 text-center"
              style={{
                background: `linear-gradient(150deg, ${fmt.accent}33, #2a1d0f), repeating-linear-gradient(180deg, rgba(0,0,0,0.08) 0 3px, transparent 3px 7px)`,
                borderLeft: `4px solid ${fmt.accent}`,
              }}>
              <span className="text-[0.6rem] leading-tight font-serif-d" style={{ color: "var(--color-vellum)" }}>{book.title}</span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start gap-1.5">
          <span title={fmt.label}>{fmt.glyph}</span>
          <Link href={`/books/${book.id}`} onClick={() => sfx("page")} className="min-w-0 flex-1">
            <h3 className="font-serif-d leading-tight truncate hover:underline" style={{ color: "var(--color-vellum)", fontSize: "1.05rem" }} title={book.title}>
              {book.title}
            </h3>
          </Link>
        </div>
        <p className="text-xs truncate" style={{ color: "var(--color-moss-300)" }}>
          {book.author ?? "unknown hand"}
          {book.series ? ` · ${book.series}${book.volume ? ` #${book.volume}` : ""}` : ""}
        </p>

        <div className="mt-1.5">
          <MushroomRating value={book.rating} size={16} onRate={rate} />
        </div>

        <div className="mt-auto pt-2 flex items-center gap-1.5 flex-wrap">
          <select
            value={book.status}
            onChange={(e) => changeStatus(e.target.value)}
            className="text-xs rounded-full px-2 py-1 cursor-pointer"
            style={{ background: `${st.accent}22`, color: st.accent, border: `1px solid ${st.accent}55` }}
            aria-label="Reading status"
          >
            {STATUSES.map((s) => <option key={s.key} value={s.key} style={{ color: "#222" }}>{s.glyph} {s.label}</option>)}
          </select>

          <div className="ml-auto flex items-center gap-1">
            <Link href={`/journal?book=${book.id}`} onClick={() => sfx("page")} aria-label="Notes" title="Marginalia"
              className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "var(--color-moss-200)" }}>
              <NotebookPen size={15} />
            </Link>
            <button onClick={() => { sfx("open"); onEdit(book); }} aria-label="Edit" title="Mend"
              className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "var(--color-moss-200)" }}>
              <Pencil size={15} />
            </button>
            {confirming ? (
              <span className="flex items-center gap-1 text-xs rounded-lg px-1.5 py-1" style={{ background: "rgba(179,54,31,0.18)" }}>
                <button onClick={remove} className="font-serif-d px-1" style={{ color: "var(--color-toadstool-bright)" }}>remove</button>
                <button onClick={() => setConfirming(false)} className="px-1" style={{ color: "var(--color-moss-300)" }}>keep</button>
              </span>
            ) : (
              <button onClick={() => { sfx("tap"); setConfirming(true); }} aria-label="Remove" title="Let it go"
                className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "var(--color-sepia)" }}>
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
