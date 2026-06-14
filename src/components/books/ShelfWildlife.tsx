import type { CSSProperties } from "react";
import { Spider } from "@/components/critters/Critters";
import SquirrelChase from "./SquirrelChase";

// Each bough: a squirrel chasing an acorn, and sometimes a spider on a thread.
export default function ShelfWildlife({ index }: { index: number }) {
  const showSpider = index % 2 === 1;
  const spiderX = 58 + (index % 3) * 13;

  return (
    <>
      <SquirrelChase index={index} />

      {showSpider && (
        <span className="spider-drop" style={{ ["--spider-x" as string]: `${spiderX}%` } as CSSProperties} aria-hidden>
          <span className="spider-thread" />
          <span className="spider-bob">
            <Spider size={22} />
          </span>
        </span>
      )}
    </>
  );
}
