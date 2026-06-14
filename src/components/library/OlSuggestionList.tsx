"use client";

import type { PublicBook } from "@/lib/openlibrary";

export default function OlSuggestionList({
  items,
  loading,
  onPick,
}: {
  items: PublicBook[];
  loading?: boolean;
  onPick: (book: PublicBook) => void;
}) {
  if (!loading && items.length === 0) return null;

  return (
    <ul
      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border p-1 shadow-lg"
      style={{ background: "var(--color-vellum)", borderColor: "rgba(120,86,46,0.35)" }}
      role="listbox"
    >
      {loading && items.length === 0 && (
        <li className="px-3 py-2 text-sm" style={{ color: "#7a5a2c" }}>searching the stacks…</li>
      )}
      {items.map((b) => (
        <li key={b.olKey}>
          <button
            type="button"
            onClick={() => onPick(b)}
            className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-[rgba(120,86,46,0.12)]"
          >
            <div className="shrink-0 rounded overflow-hidden grid place-items-center" style={{ width: 34, height: 50, background: "#d9c79f" }}>
              {b.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.coverUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>📖</span>
              )}
            </div>
            <span className="min-w-0">
              <span className="block truncate text-sm font-serif-d" style={{ color: "#2c2113" }}>{b.title}</span>
              <span className="block truncate text-xs" style={{ color: "#7a5a2c" }}>
                {b.author ?? "unknown hand"}{b.year ? ` · ${b.year}` : ""}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
