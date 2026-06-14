"use client";

import { motion } from "framer-motion";
import { formatMeta } from "@/lib/formats";
import type { BookDTO } from "@/lib/book-dto";
import { FormatCritter } from "@/components/critters/Critters";
import { useSfx } from "@/components/ambiance/ambiance-context";

// Stable pseudo-random from the id, so a spine keeps its size between renders.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Some accent colours are pale (mint, pink) — use dark ink on those.
function inkFor(accent: string): string {
  const pale = ["#8fe0c8", "#e79ab0", "#ffb24d"];
  return pale.includes(accent.toLowerCase()) ? "#2a1d0f" : "#fbf3df";
}

export default function BookSpine({
  book,
  onOpen,
}: {
  book: BookDTO;
  onOpen: (book: BookDTO, rect: DOMRect) => void;
}) {
  const sfx = useSfx();
  const fmt = formatMeta(book.format);
  const h = hash(book.id);
  const thickness = book.pageCount ?? (book.totalChapters ? book.totalChapters * 6 : null);
  const width = 40 + Math.min(26, Math.round((thickness ?? h % 260) / 16)); // 40–66px
  const height = 150 + (h % 34); // 150–183px

  return (
    <motion.button
      type="button"
      className="book-spine"
      style={{
        ["--spine-w" as string]: `${width}px`,
        ["--spine-h" as string]: `${height}px`,
        ["--spine-a" as string]: fmt.accent,
        ["--spine-ink" as string]: inkFor(fmt.accent),
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -18, rotateZ: -1.4, transition: { type: "spring", stiffness: 320, damping: 16 } }}
      whileTap={{ y: -7, scale: 0.97 }}
      onHoverStart={() => sfx("hover")}
      onClick={(e) => {
        sfx("page");
        onOpen(book, (e.currentTarget as HTMLElement).getBoundingClientRect());
      }}
      title={`${book.title}${book.author ? " — " + book.author : ""}`}
      aria-label={`Open ${book.title}`}
    >
      <span className="spine-label">
        <span className="spine-title">{book.title}</span>
      </span>
      <span style={{ position: "absolute", bottom: 13, left: "50%", transform: "translateX(-50%)" }}>
        <FormatCritter format={book.format} size={Math.min(width - 16, 20)} />
      </span>
      {book.favorite && (
        <span
          aria-hidden
          style={{
            position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
            fontSize: 13, color: "var(--color-candle)", filter: "drop-shadow(0 0 6px rgba(245,196,81,0.9))",
          }}
        >
          ✦
        </span>
      )}
    </motion.button>
  );
}
