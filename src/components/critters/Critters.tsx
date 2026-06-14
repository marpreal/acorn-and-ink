// ─────────────────────────── The Wee Folk of the Wood ───────────────────────────
// A bestiary of hand-drawn critters for Acorn & Ink. No stock icons here — every
// creature is its own little SVG so the library feels grown, not assembled.
// Each accepts a `size` (px) and the usual styling props; all are decorative
// (aria-hidden) unless given a `title`.

import type { CSSProperties, ReactElement } from "react";

export type CritterProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

function svgProps({ size = 24, className, style, title }: CritterProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    className,
    style,
    role: title ? ("img" as const) : undefined,
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
    xmlns: "http://www.w3.org/2000/svg",
  };
}

/* An acorn — the house sigil. Cross-hatched cap, glossy nut, jaunty stem. */
export function Acorn(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M16 4.5v3.5" stroke="#3f2c1a" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 21.5c0-4.4 3.1-7.5 7-7.5s7 3.1 7 7.5-3.1 8-7 8-7-3.6-7-8z" fill="#c08a4a" />
      <path d="M9 21.5c0-4.4 3.1-7.5 7-7.5 0 0-3.2 3-3.2 7.7s3.2 7.8 3.2 7.8c-3.9 0-7-3.6-7-8z" fill="#a8743a" opacity="0.55" />
      <path d="M8 11.5c0-1.8 3.6-3.2 8-3.2s8 1.4 8 3.2c0 2.4-3.6 4-8 4s-8-1.6-8-4z" fill="#5e4023" />
      <path d="M9.4 10.2 22.6 13M9.6 12.4 22.4 10.8M13 9 19 14.6M19 9 13 14.6" stroke="#3f2c1a" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="13.4" cy="20" rx="1.4" ry="2.1" fill="#f6e3bf" opacity="0.7" />
    </svg>
  );
}

/* A round, contented hedgehog snuffling to the right. */
export function Hedgehog(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M5 21c-1-6 3.5-11 9.5-11 4.4 0 7 2.4 8.2 4.6-2-.3-3 .8-2.6 2.2-2-.6-3.2.4-2.8 2-2.2-.6-3.4.6-2.8 2.2C9.6 23 6 23.4 5 21z" fill="#6e4a28" />
      <path d="M8.5 12.2C10.4 10.8 12.4 10 14.5 10c1 0 1.9.1 2.7.4C13.5 11.8 10.5 14.4 9.4 18c-.5-2-.8-4-.9-5.8z" fill="#8a6038" opacity="0.55" />
      <path d="M21.5 17.5c2.6-.4 4.2.6 4.8 1.7.5 1-.1 2.2-1.3 2.5-1.6.4-3-.4-3.6-1.6" fill="#e7c79a" />
      <circle cx="25.2" cy="19.3" r="0.9" fill="#3a2616" />
      <circle cx="22.6" cy="17.4" r="0.85" fill="#2c1c10" />
      <path d="M22 21c.7.5 1.6.6 2.4.2" stroke="#a9794a" strokeWidth="0.7" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* A toadstool — the rating creature, fly-agaric scarlet with cream freckles. */
export function Toadstool(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M13 17h6l-.6 8.5c0 1.3-1 2.3-2.4 2.3s-2.4-1-2.4-2.3z" fill="#f0e3c4" />
      <path d="M16 17l-.4 11.3c-1 0-1.9-.9-2-2.1L13 17z" fill="#d9c79e" />
      <path d="M4.5 16.5C5 10.6 10 6.5 16 6.5s11 4.1 11.5 10c.1 1-.7 1.7-1.7 1.7H6.2c-1 0-1.8-.7-1.7-1.7z" fill="#cf3a23" />
      <path d="M4.5 16.5C5 10.6 10 6.5 16 6.5c1 0 2 .1 2.9.4C13.8 8.3 9.7 12.4 9 18H6.2c-1 0-1.8-.7-1.7-1.7z" fill="#e1583f" opacity="0.7" />
      <circle cx="11" cy="12" r="1.5" fill="#fbf1d6" />
      <circle cx="17" cy="10" r="1.7" fill="#fbf1d6" />
      <circle cx="21.5" cy="13.5" r="1.3" fill="#fbf1d6" />
      <circle cx="14.5" cy="14.5" r="1" fill="#fbf1d6" />
    </svg>
  );
}

/* A little wisp-fairy with glowing wings. */
export function Fairy(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <g opacity="0.9">
        <path d="M15 16C11 10 5.5 9.5 5 13c-.4 3 4 5 9 4.4z" fill="#bfeede" opacity="0.7" />
        <path d="M17 16c4-6 9.5-6.5 10-3 .4 3-4 5-9 4.4z" fill="#cdeccb" opacity="0.7" />
      </g>
      <circle cx="16" cy="15.5" r="2.4" fill="#fff3cf" />
      <circle cx="16" cy="15.5" r="4.4" fill="#ffe9a8" opacity="0.35" />
      <path d="M16 17.8c1.2 1.6 1.6 4 .8 6.4M16 17.8c-1.1 1.5-1.5 3.6-.9 5.8" stroke="#9b7bb0" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="22" r="0.9" fill="#cdeccb" />
      <circle cx="24" cy="9" r="0.8" fill="#ffe9a8" />
      <circle cx="22" cy="22" r="0.7" fill="#8fe0c8" />
    </svg>
  );
}

/* A round frog mid-ribbit, perched and pleased. */
export function Frog(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <ellipse cx="7" cy="24.5" rx="3.3" ry="1.6" fill="#5b8a3a" />
      <ellipse cx="25" cy="24.5" rx="3.3" ry="1.6" fill="#5b8a3a" />
      <path d="M5 21c0-6 5-10 11-10s11 4 11 10c0 3-2 5-5 5H10c-3 0-5-2-5-5z" fill="#6fa83f" />
      <path d="M16 11c-6 0-11 4-11 10 0 1.4.5 2.6 1.3 3.5C6 19 9.6 14 16 12.5c2.5-.6 5-.4 7 .4C20.8 11.6 18.5 11 16 11z" fill="#86bf52" opacity="0.7" />
      <circle cx="11" cy="11" r="3.2" fill="#7ab04a" />
      <circle cx="21" cy="11" r="3.2" fill="#7ab04a" />
      <circle cx="11.4" cy="11" r="1.7" fill="#1f2d14" />
      <circle cx="20.6" cy="11" r="1.7" fill="#1f2d14" />
      <circle cx="12" cy="10.4" r="0.5" fill="#eafbe0" />
      <circle cx="21.2" cy="10.4" r="0.5" fill="#eafbe0" />
      <path d="M11 20c1.6 1.8 8.4 1.8 10 0" stroke="#33571d" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="9.5" cy="18.5" r="1.1" fill="#cf5d6e" opacity="0.55" />
      <circle cx="22.5" cy="18.5" r="1.1" fill="#cf5d6e" opacity="0.55" />
    </svg>
  );
}

/* A two-leaf sprout pushing up — for growth & stats. */
export function Sprout(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M16 28V14" stroke="#5b6b3f" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 17C13 17 8 16 6.5 11.5 11 10.5 15 12.5 16 17z" fill="#7d8d4f" />
      <path d="M16 14c3-1 7.5-3 8.5-8C20 5 16.5 8 16 14z" fill="#9fae64" />
      <path d="M16 14c.4-3 2.4-6 5.5-7.6" stroke="#5b6b3f" strokeWidth="0.7" opacity="0.6" fill="none" />
      <path d="M16 17c-1.4-2-4-3.4-6.8-3.9" stroke="#4f5d35" strokeWidth="0.7" opacity="0.6" fill="none" />
    </svg>
  );
}

/* A spiral-shelled snail, the unhurried reader. */
export function Snail(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M5 23c0-1.4 1.1-2.4 2.6-2.4H18c2 0 3-1 3-2.2 0-1.1-.9-1.9-2-1.9-1 0-1.8.7-1.8 1.7" fill="none" stroke="#caa06a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="7" cy="23.4" rx="3.4" ry="1.5" fill="#c79a5f" />
      <circle cx="21" cy="14.5" r="6.5" fill="#c98a3f" />
      <path d="M21 8c3.6 0 6.5 2.9 6.5 6.5S24.6 21 21 21s-6.5-2.9-6.5-6.5c0-2.6 2.1-4.7 4.7-4.7 1.9 0 3.4 1.5 3.4 3.4 0 1.4-1.1 2.5-2.5 2.5-1 0-1.8-.8-1.8-1.8" fill="none" stroke="#7a4f23" strokeWidth="1.3" />
      <path d="M5 21.5c-.4-2-.2-3.8.8-4.8M3.6 22c-.4-2.4-.1-4.4 1-5.6" stroke="#8a6b47" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <circle cx="3.4" cy="16" r="0.9" fill="#3a2616" />
      <circle cx="5" cy="16.4" r="0.9" fill="#3a2616" />
    </svg>
  );
}

/* A sturdy little oak — the public library. */
export function Oak(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M14.5 28v-9h3v9z" fill="#5e4023" />
      <path d="M16 22c-1.6 0-3-1.2-3.4-2.6M16 20c1.4 0 2.6-1 3-2.2" stroke="#3f2c1a" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <path d="M16 4c3 0 5.2 1.8 5.8 4.2C24.6 8.6 27 10.7 27 13.7c0 3.4-2.9 5.8-6.6 5.8h-8.8C7.9 19.5 5 17.1 5 13.7c0-3 2.4-5.1 5.2-5.5C10.8 5.8 13 4 16 4z" fill="#5b6b3f" />
      <path d="M16 4c1 0 1.9.2 2.7.6C15.3 6 12.8 9 12.8 12.6c0 2.8 1.5 5.2 3.7 6.6h-4.3C7.9 19.2 5 16.9 5 13.5c0-3 2.4-5.1 5.2-5.5C10.8 5.6 13 4 16 4z" fill="#7d8d4f" opacity="0.6" />
      <circle cx="12.5" cy="11" r="1" fill="#9fae64" />
      <circle cx="19" cy="10" r="1.1" fill="#9fae64" />
      <circle cx="20" cy="14.5" r="0.9" fill="#9fae64" />
    </svg>
  );
}

/* A five-petal blossom — manga & cherry-ink. */
export function Blossom(p: CritterProps) {
  const petals = [0, 1, 2, 3, 4];
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <g transform="translate(16 16)">
        {petals.map((i) => (
          <g key={i} transform={`rotate(${i * 72})`}>
            <path d="M0 -2C3 -4 4.5 -8 2.6 -10.5 1.5 -12 -1.5 -12 -2.6 -10.5-4.5 -8 -3 -4 0 -2z" fill="#ec9bb6" />
            <path d="M0 -3.5C1 -5.5 1 -8.5 0 -10.6" stroke="#d97ea0" strokeWidth="0.7" opacity="0.6" fill="none" />
          </g>
        ))}
        <circle r="2.6" fill="#f6d873" />
        <circle r="1.1" fill="#e7a93f" />
      </g>
    </svg>
  );
}

/* A quill feather — the journal. */
export function Quill(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M26 5C16 6 9 12 7 22l3.2-2.2C13 11 19 7.5 26 5z" fill="#bfeede" opacity="0.5" />
      <path d="M26 5C18.5 8 12.5 13 9.5 21.5c-.4 1 .8 1.8 1.6 1.1C18 16.5 22.5 11 26 5z" fill="#c0cb8f" />
      <path d="M26 5C18.5 8 12.5 13 9.5 21.5M22 8c-3 1.4-7 5-9.5 10M24 9.5c-3.4 2-6.5 5-8.7 9" stroke="#5b6b3f" strokeWidth="0.7" opacity="0.6" fill="none" />
      <path d="M11 21.5 5.5 27" stroke="#3f2c1a" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="5" cy="27.5" r="1.3" fill="#1a2418" />
    </svg>
  );
}

/* A tree stump cradling a small flame — the hearth/home. */
export function HearthStump(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M7 18h18l-1.4 8.5c-.1 1-1 1.7-2 1.7H10.4c-1 0-1.9-.7-2-1.7z" fill="#6e4a28" />
      <path d="M7 18h18l-.3 2H7.3z" fill="#8a5c33" />
      <ellipse cx="16" cy="18" rx="9" ry="3" fill="#caa06a" />
      <ellipse cx="16" cy="18" rx="5.4" ry="1.7" fill="none" stroke="#9a7340" strokeWidth="0.8" />
      <ellipse cx="16" cy="18" rx="2.4" ry="0.8" fill="#7a4f23" />
      <path d="M16 4c2.4 2.4 3.6 4.6 3.6 6.8 0 2.3-1.6 4.2-3.6 4.2s-3.6-1.7-3.6-4c0-1.4.6-2.6 1.4-3.7.2 1.3 1 2 1.8 2C15.4 9.3 15 6.6 16 4z" fill="#ffb24d" />
      <path d="M16 7.5c1.2 1.4 1.8 2.7 1.8 3.9 0 1.3-.8 2.3-1.8 2.3s-1.8-1-1.8-2.2c0-.6.2-1.2.5-1.7.2.7.6 1 1 1 .3-.6.1-1.9.3-3.3z" fill="#ffe9a8" />
    </svg>
  );
}

/* A single leaf — small divider/accent. */
export function Leaf(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M26 6C12 7 6 14 6 24c0 1 .8 1.8 1.8 1.6C19 23.5 25 17 26 6z" fill="#7d8d4f" />
      <path d="M26 6C16 13 10 19 7.5 25.4M26 6c-7 .9-12 4.5-15 9.5M26 6c-3.5 4.5-5.5 9.6-6 15.5" stroke="#4f5d35" strokeWidth="0.8" opacity="0.6" fill="none" />
    </svg>
  );
}

/* A wee mushroom button-cap, for small markers & bullets. */
export function MushroomDot(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M13.5 17.5h5l-.4 6.6c0 1-.8 1.9-1.9 1.9h-.4c-1 0-1.9-.8-1.9-1.9z" fill="#efe1c2" />
      <path d="M7 16.5C7 12 11 8.5 16 8.5s9 3.5 9 8c0 .9-.7 1.5-1.6 1.5H8.6C7.7 18 7 17.4 7 16.5z" fill="#cf3a23" />
      <circle cx="12.5" cy="13" r="1.3" fill="#fbf1d6" />
      <circle cx="18.5" cy="12" r="1.5" fill="#fbf1d6" />
      <circle cx="20.5" cy="15" r="1" fill="#fbf1d6" />
    </svg>
  );
}

/* A bright-eyed squirrel, bushy tail curled, hugging an acorn. */
export function Squirrel(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      {/* bushy tail curling up behind */}
      <path d="M13 28C4.5 28 1.8 20.5 4.2 14.5 5.8 10.4 10 9 12.4 10.8c2 1.5 1.2 3.9-1 3.9-3 0-4.8 3.2-3.8 5.9.8 2.1 3 3.1 5.7 3.1z" fill="#b9762e" />
      <path d="M11.8 11.2C8.3 11.6 5.3 14 4.2 17.8c-.7 2.4-.4 4.6.6 6.3C4 19.2 6.4 14 11.8 12.6z" fill="#d6a05c" opacity="0.6" />
      {/* hind foot */}
      <ellipse cx="14.5" cy="26.8" rx="3" ry="1.5" fill="#8a4f1a" />
      {/* body */}
      <path d="M12.5 25c-1.3-6.2 1.9-11.4 7.1-11.4 3.8 0 6.4 2.9 6.4 6.8 0 4.3-3.1 7.6-7.6 7.6-3 0-5.2-1-5.9-3z" fill="#a9651f" />
      {/* cream belly */}
      <path d="M14.6 24c-.7-3.2.5-6.3 2.8-7.9 1.7 1.9 2.5 4.4 2.2 7.2-1.4 1.4-3.6 1.6-5 .7z" fill="#f0dcbf" />
      {/* head */}
      <circle cx="22.6" cy="11.8" r="5.3" fill="#a9651f" />
      {/* ear */}
      <path d="M20 7.6c-.5-1.7 0-3.1 1.1-3.4 1.1-.3 2.1.8 2.2 2.5z" fill="#8a4f1a" />
      {/* eye + shine */}
      <circle cx="24.2" cy="11.2" r="1.15" fill="#2a1a0e" />
      <circle cx="24.6" cy="10.8" r="0.35" fill="#fff" opacity="0.85" />
      {/* nose */}
      <circle cx="27.4" cy="12.4" r="0.9" fill="#3a2616" />
      {/* acorn hugged at the chest */}
      <ellipse cx="18.4" cy="20.6" rx="2" ry="2.4" fill="#c9a36a" />
      <path d="M16.1 19.4c0-1 1-1.7 2.3-1.7s2.3.7 2.3 1.7z" fill="#5e4023" />
      {/* little paws */}
      <path d="M20 23.2c-1 .5-2.1.4-3-.2M20.6 18.4c-.9-.6-2-.7-3-.2" stroke="#8a4f1a" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* A cozy gnome with a droopy hat — keeper of the root hollow. */
export function Gnome(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      <path d="M10 24c0-2.2 2.6-3.8 6-3.8s6 1.6 6 3.8v4.2H10V24z" fill="#5a4225" />
      <path d="M16 8.5c-4.5 0-7.5 3.2-8.2 7.2-.4 2.2.8 3.8 2.4 4.1 1.2.2 2.4-.4 3-1.8.8 1.6 2.2 2.2 3.6 1.8 1.6-.5 2.8-2.2 2.4-4.6C26.2 11.2 21.8 8.5 16 8.5z" fill="#cf4327" />
      <path d="M16 8.5c-2.2 0-4 1.2-5 3.1 1.4-.6 3-.5 4.2.4 1-.8 2.4-1 3.8-.6-.8-1.8-2.2-3-3-3z" fill="#e1583f" opacity="0.55" />
      <circle cx="16" cy="17.5" r="4.2" fill="#e7c79a" />
      <circle cx="17.6" cy="16.8" r="0.75" fill="#3a2616" />
      <circle cx="14.2" cy="16.8" r="0.75" fill="#3a2616" />
      <path d="M16 19.2c.9.7 2 .9 3 .3" stroke="#a9794a" strokeWidth="0.7" strokeLinecap="round" fill="none" />
      <path d="M12.5 19.8c-.6 1.6-.4 3.2.4 4.4 1.2 1.8 3.2 2.8 3.1 2.8h-.2c-1.8 0-3.6-1-4.6-2.6-.8-1.2-1-2.8-.4-4.2z" fill="#f0e3c4" />
      <path d="M19.5 19.8c.6 1.6.4 3.2-.4 4.4-1.2 1.8-3.2 2.8-3.1 2.8h.2c1.8 0 3.6-1 4.6-2.6.8-1.2 1-2.8.4-4.2z" fill="#f0e3c4" />
      <path d="M14 24.5h4" stroke="#3f2c1a" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="24.5" cy="22" r="1.2" fill="#ffe9a8" opacity="0.9" />
    </svg>
  );
}

/* A wee round spider, for dangling from a silk thread on the boughs. */
export function Spider(p: CritterProps) {
  return (
    <svg {...svgProps(p)}>
      {p.title && <title>{p.title}</title>}
      {/* legs */}
      <g stroke="#1c130b" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M13 15c-3-1.5-5-1-7-3M13 17c-3 0-5.5 1-7.5 1M13 19c-2.6 1.2-4 2.6-6 3.4" />
        <path d="M19 15c3-1.5 5-1 7-3M19 17c3 0 5.5 1 7.5 1M19 19c2.6 1.2 4 2.6 6 3.4" />
      </g>
      {/* round abdomen + head */}
      <ellipse cx="16" cy="18.5" rx="5.2" ry="5.8" fill="#241812" />
      <ellipse cx="16" cy="18.5" rx="5.2" ry="5.8" fill="#3a2616" opacity="0.5" />
      <circle cx="16" cy="12.5" r="3" fill="#2a1c12" />
      {/* a friendly pair of eyes + a back marking */}
      <circle cx="14.8" cy="12" r="0.7" fill="#f6e3bf" />
      <circle cx="17.2" cy="12" r="0.7" fill="#f6e3bf" />
      <path d="M16 15.5v6M14 17.5l4 2M18 17.5l-4 2" stroke="#6e4a28" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

// ─────────────────────────── Maps ───────────────────────────
// Format & status keys → their critter. Kept here (not in lib/formats.ts) so the
// data layer stays free of React. Components fall back gracefully to the emoji
// glyph in formats.ts when a key is unknown.

export type Critter = (p: CritterProps) => ReactElement;

const FORMAT_CRITTERS: Record<string, Critter> = {
  novel: Acorn,
  manga: Blossom,
  comic: Frog,
  other: Snail,
};

const STATUS_CRITTERS: Record<string, Critter> = {
  want: Fairy,
  reading: Sprout,
  read: Toadstool,
  paused: Hedgehog,
  dropped: Leaf,
};

export function FormatCritter({ format, ...rest }: { format: string } & CritterProps) {
  const C = FORMAT_CRITTERS[format] ?? Leaf;
  return <C {...rest} />;
}

export function StatusCritter({ status, ...rest }: { status: string } & CritterProps) {
  const C = STATUS_CRITTERS[status] ?? Leaf;
  return <C {...rest} />;
}

// Wee folk that wander the boughs, tucked into the gaps at the end of a shelf.
const SHELF_CRITTERS: Critter[] = [Squirrel, Hedgehog, Frog, Snail, Fairy, Gnome];

export function ShelfCritter({ index = 0, ...rest }: { index?: number } & CritterProps) {
  const C = SHELF_CRITTERS[((index % SHELF_CRITTERS.length) + SHELF_CRITTERS.length) % SHELF_CRITTERS.length];
  return <C {...rest} />;
}
