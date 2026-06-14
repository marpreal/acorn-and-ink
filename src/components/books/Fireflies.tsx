import type { CSSProperties } from "react";

// A scatter of fireflies that bob and pulse among the branches. Positions are
// fixed (not random) so the server and client render the same markup.
const FLIES: Array<{ top: string; left: string; s: number; dur: number; delay: number; dx: number }> = [
  { top: "12%", left: "18%", s: 4, dur: 7, delay: 0, dx: 12 },
  { top: "20%", left: "62%", s: 3, dur: 8.5, delay: 1.2, dx: -10 },
  { top: "9%", left: "78%", s: 5, dur: 6.5, delay: 0.6, dx: 14 },
  { top: "32%", left: "30%", s: 3, dur: 9, delay: 2.1, dx: -8 },
  { top: "28%", left: "85%", s: 4, dur: 7.8, delay: 0.3, dx: 10 },
  { top: "40%", left: "12%", s: 3, dur: 8, delay: 1.8, dx: 9 },
  { top: "44%", left: "55%", s: 5, dur: 6.8, delay: 0.9, dx: -12 },
  { top: "52%", left: "72%", s: 3, dur: 9.5, delay: 2.6, dx: 11 },
  { top: "58%", left: "24%", s: 4, dur: 7.2, delay: 1.4, dx: -9 },
  { top: "64%", left: "88%", s: 3, dur: 8.2, delay: 0.5, dx: 8 },
  { top: "70%", left: "40%", s: 5, dur: 6.6, delay: 2.3, dx: 13 },
  { top: "76%", left: "66%", s: 3, dur: 9.2, delay: 1.1, dx: -10 },
  { top: "16%", left: "44%", s: 3, dur: 8.8, delay: 1.7, dx: 7 },
  { top: "36%", left: "92%", s: 4, dur: 7.5, delay: 0.8, dx: -11 },
  { top: "82%", left: "16%", s: 4, dur: 7.9, delay: 2.0, dx: 10 },
  { top: "48%", left: "6%", s: 3, dur: 8.4, delay: 0.4, dx: 9 },
];

export default function Fireflies() {
  return (
    <div className="tree-fireflies" aria-hidden>
      {FLIES.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            top: f.top,
            left: f.left,
            ["--ff-s" as string]: `${f.s}px`,
            ["--ff-dur" as string]: `${f.dur}s`,
            ["--ff-delay" as string]: `${f.delay}s`,
            ["--ff-dx" as string]: `${f.dx}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
