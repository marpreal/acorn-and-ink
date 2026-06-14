import type { CSSProperties, ReactNode } from "react";
import ShelfWildlife from "./ShelfWildlife";

/** A curved oak bough — books rest on the bark, not a flat plank. */
export default function BranchBough({ index, children }: { index: number; children: ReactNode }) {
  const fromRight = index % 2 === 1;

  return (
    <div className={`branch-bough${fromRight ? " branch-bough--from-right" : ""}`}>
      <svg className="branch-arm" viewBox="0 0 920 96" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`bark-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a8743a" />
            <stop offset="42%" stopColor="#6b4a2b" />
            <stop offset="100%" stopColor="#2a1a0d" />
          </linearGradient>
          <linearGradient id={`moss-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8fae64" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#3c5234" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {/* main limb — thick near trunk, tapering to a leafy tip */}
        <path
          d={
            fromRight
              ? "M920 58 C780 44 640 36 500 40 C360 44 220 52 80 62 C40 66 12 72 0 78 L0 96 C50 86 180 74 340 70 C520 66 700 72 860 84 L920 88 Z"
              : "M0 58 C140 44 280 36 420 40 C560 44 700 52 840 62 C880 66 908 72 920 78 L920 96 C870 86 740 74 580 70 C400 66 220 72 60 84 L0 88 Z"
          }
          fill={`url(#bark-${index})`}
        />
        {/* mossy top */}
        <path
          d={
            fromRight
              ? "M920 58 C780 44 640 36 500 40 C360 44 220 52 80 62 C40 66 12 72 0 78 L0 68 C120 58 280 48 440 46 C600 44 760 50 920 58 Z"
              : "M0 58 C140 44 280 36 420 40 C560 44 700 52 840 62 C880 66 908 72 920 78 L920 68 C800 58 640 48 480 46 C320 44 160 50 0 58 Z"
          }
          fill={`url(#moss-${index})`}
        />
        {/* bark rings */}
        <path
          d={fromRight ? "M680 52 Q560 48 420 50" : "M240 52 Q360 48 500 50"}
          stroke="#221409"
          strokeWidth="2.5"
          opacity="0.22"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse
          cx={fromRight ? 780 : 140}
          cy={54}
          rx={11}
          ry={7}
          fill="#241408"
          opacity="0.35"
        />
        {/* leaf clusters at the tip */}
        <g transform={fromRight ? "translate(860 34)" : "translate(60 34)"}>
          <ellipse cx="0" cy="8" rx="18" ry="12" fill="#5b6b3f" opacity="0.9" />
          <ellipse cx="14" cy="4" rx="14" ry="10" fill="#7d8d4f" opacity="0.85" />
          <ellipse cx="-10" cy="2" rx="12" ry="9" fill="#9fae64" opacity="0.8" />
        </g>
        {/* small twig */}
        <path
          d={fromRight ? "M220 46 Q200 28 188 18" : "M700 46 Q720 28 732 18"}
          stroke="#5e4023"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
      </svg>
      <div className="branch-books">{children}</div>
      <ShelfWildlife index={index} />
    </div>
  );
}
