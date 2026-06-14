"use client";

import { useMemo, type CSSProperties } from "react";
import {
  Toadstool,
  MushroomDot,
  Fairy,
  Gnome,
  Hedgehog,
  Frog,
  Squirrel,
  Snail,
  Leaf,
  Sprout,
  type Critter,
} from "@/components/critters/Critters";
import { useAmbiance } from "@/components/ambiance/ambiance-context";

type Spot = { x: number; bottom: number; size: number; flip?: boolean };

const MUSHROOMS: Spot[] = [
  { x: 6, bottom: 4, size: 40 },
  { x: 20, bottom: 8, size: 24 },
  { x: 36, bottom: 2, size: 32 },
  { x: 52, bottom: 10, size: 20 },
  { x: 66, bottom: 6, size: 36 },
  { x: 80, bottom: 12, size: 28 },
  { x: 93, bottom: 4, size: 34 },
];

const FERNS: Spot[] = [
  { x: 4, bottom: 18, size: 30, flip: true },
  { x: 16, bottom: 22, size: 36 },
  { x: 42, bottom: 20, size: 32, flip: true },
  { x: 58, bottom: 24, size: 38 },
  { x: 76, bottom: 19, size: 30, flip: true },
  { x: 90, bottom: 21, size: 34 },
];

const FLOOR_RUNNERS: { Critter: Critter; size: number; dur: number; delay: number; dir: "left" | "right"; bottom: number }[] = [
  { Critter: Hedgehog, size: 28, dur: 20, delay: 0, dir: "right", bottom: 14 },
  { Critter: Frog, size: 26, dur: 15, delay: 3.5, dir: "left", bottom: 8 },
  { Critter: Squirrel, size: 28, dur: 17, delay: 1.5, dir: "right", bottom: 18 },
  { Critter: Snail, size: 24, dur: 26, delay: 6, dir: "left", bottom: 6 },
];

const FAIRIES: { x: number; bottom: number; dur: number; delay: number }[] = [
  { x: 12, bottom: 72, dur: 7, delay: 0 },
  { x: 46, bottom: 88, dur: 8.5, delay: 1.2 },
  { x: 70, bottom: 76, dur: 6.5, delay: 2.4 },
  { x: 88, bottom: 82, dur: 9, delay: 0.6 },
];

const GNOMES: { bottom: number; dur: number; delay: number; dir: "left" | "right" }[] = [
  { bottom: 12, dur: 32, delay: 0.5, dir: "right" },
  { bottom: 10, dur: 36, delay: 4.5, dir: "left" },
];

export default function TreeFloor() {
  const { reducedMotion } = useAmbiance();

  const shrooms = useMemo(
    () => MUSHROOMS.map((m, i) => ({ ...m, red: i % 3 !== 1 })),
    [],
  );

  return (
    <div className="tree-floor" aria-hidden>
      <div className="tree-floor-moss" />
      <div className="tree-floor-roots" />

      {FERNS.map((f, i) => (
        <span
          key={`fern-${i}`}
          className="tree-floor-fern anim-sway"
          style={{
            left: `${f.x}%`,
            bottom: f.bottom,
            transform: f.flip ? "scaleX(-1)" : undefined,
            animationDuration: `${5 + (i % 3)}s`,
            animationDelay: `${i * 0.35}s`,
          }}
        >
          <Sprout size={f.size} />
          <Leaf size={f.size * 0.75} style={{ marginLeft: -6, marginTop: -10, opacity: 0.85 }} />
        </span>
      ))}

      {shrooms.map((m, i) => (
        <span
          key={`shroom-${i}`}
          className="tree-floor-shroom"
          style={{ left: `${m.x}%`, bottom: m.bottom }}
        >
          {m.red ? <Toadstool size={m.size} /> : <MushroomDot size={m.size * 0.85} />}
        </span>
      ))}

      {!reducedMotion && (
        <>
          {FLOOR_RUNNERS.map(({ Critter, size, dur, delay, dir, bottom }, i) => (
            <span
              key={`runner-${i}`}
              className="floor-runner"
              data-dir={dir}
              style={
                {
                  bottom,
                  ["--run-dur" as string]: `${dur}s`,
                  ["--run-delay" as string]: `${delay}s`,
                } as CSSProperties
              }
            >
              <span className="critter-gait">
                <Critter size={size} />
              </span>
            </span>
          ))}

          {FAIRIES.map((f, i) => (
            <span
              key={`fairy-${i}`}
              className="floor-fairy anim-floaty"
              style={{
                left: `${f.x}%`,
                bottom: f.bottom,
                animationDuration: `${f.dur}s`,
                animationDelay: `${f.delay}s`,
              }}
            >
              <Fairy size={26} />
            </span>
          ))}

          {GNOMES.map((g, i) => (
            <span
              key={`gnome-${i}`}
              className="floor-gnome"
              data-dir={g.dir}
              style={
                {
                  bottom: g.bottom,
                  ["--run-dur" as string]: `${g.dur}s`,
                  ["--run-delay" as string]: `${g.delay}s`,
                } as CSSProperties
              }
            >
              <span className="critter-gait">
                <Gnome size={32} />
              </span>
            </span>
          ))}
        </>
      )}

      {reducedMotion && (
        <>
          <span className="tree-floor-shroom" style={{ left: "30%", bottom: 10 }}><Gnome size={34} /></span>
          <span className="tree-floor-shroom" style={{ left: "70%", bottom: 12 }}><Fairy size={28} /></span>
        </>
      )}
    </div>
  );
}
