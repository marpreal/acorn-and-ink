"use client";

import { useState } from "react";

/** A rating shown in toadstools, 0–5 in half steps. Interactive when onRate is given. */
export default function MushroomRating({
  value,
  onRate,
  size = 20,
  glyph = "🍄",
}: {
  value: number | null;
  onRate?: (v: number) => void;
  size?: number;
  glyph?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  const pct = (shown / 5) * 100;
  const interactive = !!onRate;

  const row = (opacity: number) => (
    <div
      aria-hidden
      style={{ fontSize: size, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "2px", opacity }}
    >
      {glyph}{glyph}{glyph}{glyph}{glyph}
    </div>
  );

  return (
    <div
      className="relative inline-flex items-center select-none"
      role={interactive ? "slider" : "img"}
      aria-label={`${value ?? 0} of 5 mushrooms`}
      aria-valuenow={interactive ? value ?? 0 : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 5 : undefined}
    >
      <div className="relative inline-block">
        {row(0.22)}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
          {row(1)}
        </div>

        {interactive && (
          <div className="absolute inset-0 flex" onMouseLeave={() => setHover(null)}>
            {Array.from({ length: 10 }).map((_, i) => {
              const v = (i + 1) * 0.5;
              return (
                <button
                  key={i}
                  type="button"
                  className="h-full"
                  style={{ width: "10%", cursor: "pointer" }}
                  onMouseEnter={() => setHover(v)}
                  onClick={() => onRate?.(value === v ? 0 : v)}
                  aria-label={`Rate ${v} mushrooms`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
