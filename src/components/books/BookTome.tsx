"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, NotebookPen, Pencil, Trash2, X } from "lucide-react";
import { setBookStatus, setBookRating, deleteBook } from "@/app/(grove)/shelves/actions";
import { formatMeta, STATUSES } from "@/lib/formats";
import type { BookDTO } from "@/lib/book-dto";
import MushroomRating from "./MushroomRating";
import ReadingProgress from "./ReadingProgress";
import { FormatCritter } from "@/components/critters/Critters";
import { useSfx } from "@/components/ambiance/ambiance-context";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Click a spine and its book flies off the shelf to the centre of the screen,
 * then swings open into a two-page spread — pages turning with a paper rustle.
 * Every per-book control (status, rating, progress, mend, marginalia, remove)
 * lives on the open pages.
 */
export default function BookTome({
  book,
  origin,
  onClose,
  onEdit,
  onLocalRemove,
  onLocalUpdate,
}: {
  book: BookDTO;
  origin: DOMRect | null;
  onClose: () => void;
  onEdit: (b: BookDTO) => void;
  onLocalRemove: (id: string) => void;
  onLocalUpdate: (id: string, patch: Partial<BookDTO>) => void;
}) {
  const router = useRouter();
  const sfx = useSfx();
  const reduced = useReducedMotion();
  const [, start] = useTransition();
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fmt = formatMeta(book.format);

  // Where the book flies in FROM (the clicked spine), relative to screen centre.
  const flyFrom = useMemo(() => {
    if (reduced || !origin || typeof window === "undefined") return null;
    const cx = origin.left + origin.width / 2;
    const cy = origin.top + origin.height / 2;
    return { x: cx - window.innerWidth / 2, y: cy - window.innerHeight / 2 };
  }, [origin, reduced]);

  // Open the covers a beat after the book lands.
  const beginOpen = () => {
    if (opened || closing) return;
    setOpened(true);
    sfx("page");
    window.setTimeout(() => sfx("page"), 320);
    window.setTimeout(() => sfx("open"), 200);
  };

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    setOpened(false);
    sfx("close");
    window.setTimeout(onClose, reduced ? 0 : 360);
  };

  useEffect(() => {
    if (reduced) beginOpen();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") requestClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const remove = () => {
    sfx("close");
    onLocalRemove(book.id);
    onClose();
    start(async () => { await deleteBook(book.id); router.refresh(); });
  };

  const coverArt = book.coverUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={book.coverUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
  ) : (
    <div className="w-full h-full grid place-items-center p-4 text-center">
      <span className="font-display glow-text" style={{ fontSize: "1.3rem" }}>{book.title}</span>
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[90] grid place-items-center p-4"
      style={{ background: "rgba(6,9,7,0.78)", backdropFilter: "blur(5px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={requestClose}
    >
      <motion.div
        className="tome-stage"
        initial={flyFrom ? { x: flyFrom.x, y: flyFrom.y, scale: 0.16, opacity: 0.5, rotate: -8 } : { scale: 0.9, opacity: 0 }}
        animate={{ x: 0, y: 0, scale: closing ? 0.82 : 1, opacity: closing ? 0 : 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 210, damping: 24 }}
        onAnimationComplete={() => { if (!opened && !closing && !reduced) beginOpen(); }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tome">
          {/* LEFT PAGE — the book's face */}
          <div className="tome-page left flex flex-col">
            <div className="mx-auto rounded-lg overflow-hidden shrink-0"
              style={{ width: 150, height: 210, boxShadow: "0 14px 30px -14px rgba(0,0,0,0.7)", border: "1px solid rgba(120,86,46,0.4)" }}>
              {coverArt}
            </div>
            <h2 className="font-display mt-3 text-center" style={{ fontSize: "1.5rem", color: "#2c2113", lineHeight: 1.1 }}>{book.title}</h2>
            <p className="text-center text-sm" style={{ color: "#6b4a2b" }}>
              {book.author ?? "unknown hand"}{book.publishedYear ? ` · ${book.publishedYear}` : ""}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-sm" style={{ color: "#5a4225" }}>
                <FormatCritter format={book.format} size={18} /> {fmt.label}
              </span>
              {book.favorite && <span className="text-sm" style={{ color: "#b8860b" }}>✦ treasured</span>}
            </div>
            <div className="mt-3 flex flex-col items-center">
              <span className="font-hand" style={{ color: "#7a5a2c" }}>your mushrooms</span>
              <MushroomRating value={book.rating} size={24} onRate={rate} />
            </div>
          </div>

          {/* RIGHT PAGE — where you stand & what you do */}
          <div className="tome-page right flex flex-col gap-3">
            <div>
              <p className="font-hand text-lg" style={{ color: "#7a5a2c" }}>where you stand</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {STATUSES.map((s) => (
                  <button key={s.key} type="button" onClick={() => changeStatus(s.key)}
                    className="text-xs rounded-full px-2.5 py-1 transition"
                    style={book.status === s.key
                      ? { background: `${s.accent}33`, color: "#3a2c1a", border: `1px solid ${s.accent}`, fontWeight: 600 }
                      : { background: "rgba(120,86,46,0.1)", color: "#7a5a2c", border: "1px solid rgba(120,86,46,0.25)" }}>
                    {s.glyph} {s.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ background: "rgba(120,86,46,0.1)" }}>
              <p className="font-hand text-lg mb-1" style={{ color: "#7a5a2c" }}>how far you&apos;ve wandered</p>
              <div style={{ color: "#3a2c1a" }}>
                <ReadingProgress book={book} size="full" force onLocalUpdate={(patch) => onLocalUpdate(book.id, patch)} />
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <p className="font-hand text-lg" style={{ color: "#7a5a2c" }}>your thoughts</p>
              {book.review ? (
                <p className="text-sm whitespace-pre-wrap mt-1" style={{ color: "#3a2c1a", maxHeight: 150, overflow: "auto" }}>{book.review}</p>
              ) : book.description ? (
                <p className="text-sm whitespace-pre-wrap mt-1" style={{ color: "#5a4225", maxHeight: 150, overflow: "auto" }}>{book.description}</p>
              ) : (
                <p className="font-hand text-base mt-1" style={{ color: "#9a7a4c" }}>the margins are still blank…</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1" style={{ borderTop: "1px solid rgba(120,86,46,0.25)" }}>
              <button onClick={() => { sfx("open"); onEdit(book); }} className="btn btn-ember" style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}>
                <Pencil size={15} /> Mend
              </button>
              <Link href={`/journal?book=${book.id}`} onClick={() => sfx("page")} className="btn" style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem", background: "rgba(120,86,46,0.18)", color: "#5a4225" }}>
                <NotebookPen size={15} /> Marginalia
              </Link>
              <Link href={`/books/${book.id}`} onClick={() => sfx("page")} className="btn" style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem", background: "rgba(120,86,46,0.18)", color: "#5a4225" }}>
                <BookOpen size={15} /> Full page
              </Link>
              {confirming ? (
                <span className="flex items-center gap-1 text-sm ml-auto">
                  <button onClick={remove} className="font-serif-d px-1" style={{ color: "#b3361f" }}>remove</button>
                  <button onClick={() => setConfirming(false)} className="px-1" style={{ color: "#7a5a2c" }}>keep</button>
                </span>
              ) : (
                <button onClick={() => { sfx("tap"); setConfirming(true); }} aria-label="Remove" title="Let it go"
                  className="ml-auto p-1.5 rounded-lg" style={{ color: "#8a6b47" }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* a silk bookmark ribbon trailing from the gutter */}
          <div className="tome-ribbon" aria-hidden />

          {/* a loose page that turns as the book opens */}
          {!reduced && (
            <motion.div className="tome-leaf" aria-hidden
              initial={{ rotateY: 0 }}
              animate={{ rotateY: opened ? -178 : 0, opacity: opened ? 0 : 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: opened ? 0.18 : 0, opacity: { delay: opened ? 0.5 : 0, duration: 0.2 } }}
            />
          )}

          {/* the hard front cover, hinged at the spine */}
          {!reduced && (
            <motion.div className="tome-cover" aria-hidden
              initial={{ rotateY: 0 }}
              animate={{ rotateY: opened ? -178 : 0, opacity: opened ? 0 : 1 }}
              transition={{ duration: 0.8, ease: EASE, opacity: { delay: opened ? 0.45 : 0, duration: 0.25 } }}
            >
              {coverArt}
            </motion.div>
          )}
        </div>

        <button onClick={requestClose} aria-label="Close the book"
          className="absolute -top-3 -right-3 rounded-full p-1.5"
          style={{ background: "var(--color-bark-700)", color: "var(--color-vellum)", boxShadow: "0 6px 16px -6px rgba(0,0,0,0.8)" }}>
          <X size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
}
