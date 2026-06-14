"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { createBook, updateBook, type BookActionState } from "@/app/(grove)/shelves/actions";
import type { PublicBook } from "@/lib/openlibrary";
import { FORMATS, STATUSES } from "@/lib/formats";
import { usesChapters } from "@/lib/progress";
import type { BookDTO } from "@/lib/book-dto";
import { FormatCritter } from "@/components/critters/Critters";
import MushroomRating from "./MushroomRating";
import OlSuggestionList from "@/components/library/OlSuggestionList";
import { useOlSuggestions } from "@/components/library/useOlSuggestions";
import { useSfx } from "@/components/ambiance/ambiance-context";

const init: BookActionState = { ok: false };
const dateVal = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

export default function BookForm({
  open,
  book,
  onClose,
  onSaved,
}: {
  open: boolean;
  book: BookDTO | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const sfx = useSfx();
  const isEdit = !!book;
  const action = isEdit ? updateBook.bind(null, book!.id) : createBook;
  const [state, formAction, pending] = useActionState(action, init);
  const [rating, setRating] = useState<number>(book?.rating ?? 0);
  const [fmt, setFmt] = useState<string>(book?.format ?? "novel");
  const [more, setMore] = useState(false);
  const [olQuery, setOlQuery] = useState("");
  const [showOlSuggest, setShowOlSuggest] = useState(false);
  const [prefill, setPrefill] = useState<PublicBook | null>(null);
  const { suggestions, loading: olLoading } = useOlSuggestions(showOlSuggest ? olQuery : "", 2, 8);

  // Keep the latest onSaved without making it an effect dependency (that was
  // re-firing the success chime on every parent re-render).
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  const handledRef = useRef(false);

  useEffect(() => {
    if (state.ok && !handledRef.current) {
      handledRef.current = true;
      sfx("success");
      if (!isEdit && state.id) {
        router.push(`/books/${state.id}`);
        onSavedRef.current();
        return;
      }
      onSavedRef.current();
    } else if (state.error) {
      sfx("error");
    }
  }, [state, sfx, isEdit, router]);

  useEffect(() => {
    if (!open) return;
    handledRef.current = false;
    setPrefill(null);
    setOlQuery("");
    setShowOlSuggest(false);
    setRating(book?.rating ?? 0);
    setFmt(book?.format ?? "novel");
    setMore(false);
  }, [open, book]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center p-4"
          style={{ background: "rgba(8,10,8,0.7)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="parchment w-full max-w-lg max-h-[88vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display" style={{ fontSize: "1.7rem", color: "#2c2113" }}>
                {isEdit ? "Mend this tome" : "Press a new book"}
              </h2>
              <button onClick={() => { sfx("close"); onClose(); }} aria-label="Close" style={{ color: "#6b4a2b" }}>
                <X size={20} />
              </button>
            </div>

            <form action={formAction} onSubmit={() => sfx("page")} className="flex flex-col gap-3" key={prefill?.olKey ?? book?.id ?? "new"}>
              <input type="hidden" name="rating" value={rating || ""} />
              {isEdit && <input type="hidden" name="olKey" defaultValue={book?.olKey ?? ""} />}
              {isEdit && <input type="hidden" name="isbn" defaultValue={book?.isbn ?? ""} />}
              {!isEdit && prefill && (
                <>
                  <input type="hidden" name="olKey" value={prefill.olKey} readOnly />
                  <input type="hidden" name="isbn" value={prefill.isbn ?? ""} readOnly />
                  <input type="hidden" name="coverUrl" value={prefill.coverUrl ?? ""} readOnly />
                  <input type="hidden" name="publishedYear" value={prefill.year ?? ""} readOnly />
                </>
              )}

              {!isEdit && (
                <div>
                  <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Find in the public library</span>
                  <div className="relative mt-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b4a2b" }} />
                    <input
                      value={olQuery}
                      onChange={(e) => { setOlQuery(e.target.value); setShowOlSuggest(true); }}
                      onFocus={() => setShowOlSuggest(true)}
                      onBlur={() => { window.setTimeout(() => setShowOlSuggest(false), 150); }}
                      placeholder="start typing a title or author…"
                      className="ink-field"
                      style={{ paddingLeft: "2.1rem" }}
                      autoComplete="off"
                    />
                    {showOlSuggest && olQuery.trim().length >= 2 && (
                      <OlSuggestionList
                        items={suggestions}
                        loading={olLoading}
                        onPick={(b) => {
                          sfx("sparkle");
                          setPrefill(b);
                          setOlQuery(b.title);
                          setShowOlSuggest(false);
                        }}
                      />
                    )}
                  </div>
                  {prefill && (
                    <p className="text-xs mt-1" style={{ color: "#7a5a2c" }}>
                      ✓ filled from Open Library — you can still edit below
                    </p>
                  )}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Title</span>
                <input name="title" required maxLength={300} defaultValue={prefill?.title ?? book?.title ?? ""}
                  placeholder="The Hazel Grove Almanac" className="ink-field mt-1" autoFocus={isEdit} />
              </label>

              <label className="block">
                <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Author</span>
                <input name="author" maxLength={200} defaultValue={prefill?.author ?? book?.author ?? ""}
                  placeholder="by whose hand?" className="ink-field mt-1" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Kind</span>
                  <select name="format" value={fmt} onChange={(e) => { sfx("tap"); setFmt(e.target.value); }} className="ink-field mt-1">
                    {FORMATS.map((f) => <option key={f.key} value={f.key}>{f.glyph} {f.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Where you stand</span>
                  <select name="status" defaultValue={book?.status ?? "want"} className="ink-field mt-1">
                    {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.glyph} {s.label}</option>)}
                  </select>
                </label>
              </div>

              <div className="rounded-xl p-3" style={{ background: "rgba(120,86,46,0.08)" }}>
                <span className="text-sm font-serif-d flex items-center gap-1.5" style={{ color: "#5a4225" }}>
                  <FormatCritter format={fmt} size={18} /> Where you are now
                </span>
                {usesChapters(fmt) ? (
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>On chapter</span>
                      <input name="currentChapter" type="number" min={0} defaultValue={book?.currentChapter ?? ""} placeholder="—" className="ink-field mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>of how many</span>
                      <input name="totalChapters" type="number" min={0} defaultValue={book?.totalChapters ?? ""} placeholder="total" className="ink-field mt-1" />
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>On page</span>
                      <input name="currentPage" type="number" min={0} defaultValue={book?.currentPage ?? ""} placeholder="—" className="ink-field mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>of how many</span>
                      <input name="pageCount" type="number" min={0} defaultValue={prefill?.pageCount ?? book?.pageCount ?? ""} placeholder="total" className="ink-field mt-1" />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Your score</span>
                <MushroomRating value={rating} onRate={(v) => { setRating(v); sfx("tap"); }} size={24} />
                {rating > 0 && (
                  <button type="button" onClick={() => setRating(0)} className="text-xs underline" style={{ color: "#8a6b47" }}>clear</button>
                )}
              </div>

              <button type="button" onClick={() => { sfx("tap"); setMore((v) => !v); }}
                className="flex items-center gap-1 text-sm mt-1 self-start" style={{ color: "#7a5a2c" }}>
                <ChevronDown size={16} style={{ transform: more ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                {more ? "fewer details" : "more details"}
              </button>

              {more && (
                <div className="flex flex-col gap-3 rounded-xl p-3" style={{ background: "rgba(120,86,46,0.08)" }}>
                  <label className="block">
                    <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Cover image URL</span>
                    <input name="coverUrl" maxLength={1200} defaultValue={prefill?.coverUrl ?? book?.coverUrl ?? ""}
                      placeholder="https://…" className="ink-field mt-1" />
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>Series</span>
                      <input name="series" defaultValue={book?.series ?? ""} className="ink-field mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>Volume</span>
                      <input name="volume" type="number" min={0} defaultValue={book?.volume ?? ""} className="ink-field mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>of</span>
                      <input name="totalVolumes" type="number" min={0} defaultValue={book?.totalVolumes ?? ""} className="ink-field mt-1" />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>Year</span>
                      <input name="publishedYear" type="number" min={0} defaultValue={prefill?.year ?? book?.publishedYear ?? ""} className="ink-field mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>Publisher</span>
                      <input name="publisher" defaultValue={book?.publisher ?? ""} className="ink-field mt-1" />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>Started</span>
                      <input name="startedAt" type="date" defaultValue={dateVal(book?.startedAt ?? null)} className="ink-field mt-1" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-serif-d" style={{ color: "#5a4225" }}>Finished</span>
                      <input name="finishedAt" type="date" defaultValue={dateVal(book?.finishedAt ?? null)} className="ink-field mt-1" />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm" style={{ color: "#5a4225" }}>
                    <input type="checkbox" name="favorite" defaultChecked={book?.favorite ?? false} /> A treasured favourite ✦
                  </label>
                </div>
              )}

              <label className="block">
                <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Your review &amp; thoughts</span>
                <textarea name="review" rows={3} maxLength={8000} defaultValue={book?.review ?? ""}
                  placeholder="what did the wood whisper to you?" className="ink-field mt-1" />
              </label>

              {state.error && (
                <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(179,54,31,0.14)", color: "#7a1f12" }}>
                  🥀 {state.error}
                </p>
              )}

              <div className="flex gap-2 mt-1">
                <button type="submit" disabled={pending} className="btn btn-ember flex-1">
                  {pending ? <Loader2 size={18} className="animate-spin" /> : "🌿"} {isEdit ? "Save" : "Plant it"}
                </button>
                <button type="button" onClick={() => { sfx("close"); onClose(); }} className="btn"
                  style={{ background: "rgba(120,86,46,0.2)", color: "#5a4225" }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
