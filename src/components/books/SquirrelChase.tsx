import type { CSSProperties } from "react";
import { Acorn, Squirrel } from "@/components/critters/Critters";

/** A squirrel hot on the tail of a rolling acorn, skittering along the bough. */
export default function SquirrelChase({ index }: { index: number }) {
  const fromRight = index % 2 === 1;
  const dir = fromRight ? "left" : "right";
  const dur = 10 + (index % 3) * 2.2;
  const delay = (index % 4) * 1.6;

  return (
    <span
      className="squirrel-chase"
      data-dir={dir}
      style={
        {
          ["--chase-dur" as string]: `${dur}s`,
          ["--chase-delay" as string]: `${delay}s`,
        } as CSSProperties
      }
      aria-hidden
    >
      <span className="squirrel-chase-squirrel critter-gait">
        <Squirrel size={30} />
      </span>
      <span className="squirrel-chase-acorn">
        <Acorn size={17} />
      </span>
    </span>
  );
}
