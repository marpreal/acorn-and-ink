import type { CSSProperties } from "react";
import { ShelfCritter, Spider } from "@/components/critters/Critters";

// The wee folk that live on each bough: a critter scurrying back and forth
// along the branch, and — on some shelves — a spider dangling from a thread.
export default function ShelfWildlife({ index }: { index: number }) {
  const dir = index % 2 === 0 ? "right" : "left";
  const dur = 13 + (index % 4) * 3; // 13–22s to cross
  const delay = (index % 3) * 2.4; // staggered starts so they don't march in step
  const showSpider = index % 2 === 1;
  const spiderX = 58 + (index % 3) * 13; // 58–84%

  return (
    <>
      <span
        className="critter-runner"
        data-dir={dir}
        style={{ ["--run-dur" as string]: `${dur}s`, ["--run-delay" as string]: `${delay}s` } as CSSProperties}
      >
        <span className="critter-gait">
          <ShelfCritter index={index} size={30} />
        </span>
      </span>

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
