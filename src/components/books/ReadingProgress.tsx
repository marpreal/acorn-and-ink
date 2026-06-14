"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { setBookProgress } from "@/app/(grove)/shelves/actions";
import { readingProgress } from "@/lib/progress";
import type { BookDTO } from "@/lib/book-dto";
import { useSfx } from "@/components/ambiance/ambiance-context";
import { Snail, Toadstool } from "@/components/critters/Critters";

/**
 * "Where you are right now" — a vine the reader's snail creeps along, with acorn
 * bumps for the chapter/page you're on. Shows for manga & comics by chapter,
 * everything else by page.
 */
export default function ReadingProgress({
  book,
  size = "full",
  force = false,
  onLocalUpdate,
}: {
  book: BookDTO;
  size?: "compact" | "full";
  /** show even when there's no data yet (e.g. the detail page logger). */
  force?: boolean;
  onLocalUpdate?: (patch: Partial<BookDTO>) => void;
}) {
  const router = useRouter();
  const sfx = useSfx();
  const [pending, start] = useTransition();
  const p = readingProgress(book);
  const current = p.current ?? 0;

  const relevant = force || p.has || book.status === "reading";
  if (!relevant) return null;

  const done = p.ratio != null && p.ratio >= 1;

  const set = (next: number) => {
    let v = Math.max(0, Math.round(next));
    if (p.total != null) v = Math.min(v, p.total);
    if (v === current) return;
    sfx(v > current ? "tap" : "close");
    const patch = p.field === "currentChapter" ? { currentChapter: v } : { currentPage: v };
    onLocalUpdate?.(patch);
    start(async () => {
      await setBookProgress(book.id, patch);
      router.refresh();
    });
  };

  const compact = size === "compact";
  const markerLeft = `${(p.ratio ?? 0) * 100}%`;

  const label = done ? (
    <span className="inline-flex items-center gap-1" style={{ color: "var(--color-candle)" }}>
      <Toadstool size={compact ? 13 : 16} /> finished all {p.total} {p.unitPlural}
    </span>
  ) : (
    <span style={{ color: "var(--color-moss-200)" }}>
      {p.unit === "chapter" ? "Chapter" : "Page"} <strong style={{ color: "var(--color-vellum)" }}>{current || "—"}</strong>
      {p.total != null && <> of {p.total}</>}
      {p.ratio != null && <span style={{ color: "var(--color-moss-400)" }}> · {Math.round(p.ratio * 100)}%</span>}
    </span>
  );

  return (
    <div className="flex flex-col gap-1.5" style={{ opacity: pending ? 0.7 : 1 }}>
      <div className="flex items-center justify-between gap-2">
        <span className={compact ? "text-[0.72rem]" : "text-xs"}>{label}</span>
        <div className="flex items-center gap-1">
          <button
            type="button" onClick={() => set(current - 1)} disabled={current <= 0}
            aria-label={`one ${p.unit} back`} title={`back a ${p.unit}`}
            className="bump-pip" data-dir="down"
          >
            <Minus size={compact ? 12 : 13} />
          </button>
          <button
            type="button" onClick={() => set(current + 1)} disabled={done}
            aria-label={`read another ${p.unit}`} title={`I read another ${p.unit}`}
            className="bump-pip" data-dir="up"
          >
            <Plus size={compact ? 12 : 13} />
          </button>
        </div>
      </div>

      {p.total != null ? (
        <div className="vine-track" title={`${current} of ${p.total} ${p.unitPlural}`}>
          <div className="vine-fill" style={{ width: markerLeft }} />
          <span className="vine-marker" style={{ left: markerLeft }}>
            <Snail size={compact ? 16 : 20} />
          </span>
        </div>
      ) : (
        <p className="font-hand" style={{ color: "var(--color-moss-400)", fontSize: compact ? "0.85rem" : "1rem" }}>
          {current > 0 ? `${current} ${current === 1 ? p.unit : p.unitPlural} in…` : `tap + as you read`}
        </p>
      )}
    </div>
  );
}
