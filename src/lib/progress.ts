// Where a reader stands within a tome. Manga & comics are tracked by chapter;
// everything else by page. Pure (no React) so server actions can share it.

export type ProgressShape = {
  format: string;
  currentPage: number | null;
  pageCount: number | null;
  currentChapter: number | null;
  totalChapters: number | null;
};

/** Manga & comics march by chapters; novels & curios by pages. */
export function usesChapters(format: string): boolean {
  return format === "manga" || format === "comic";
}

export type ReadingProgress = {
  chapters: boolean;
  current: number | null;
  total: number | null;
  unit: "chapter" | "page";
  unitPlural: "chapters" | "pages";
  /** 0–1 when a total is known, else null. */
  ratio: number | null;
  /** true once any progress or total has been recorded. */
  has: boolean;
  /** the form field name this progress writes to. */
  field: "currentChapter" | "currentPage";
};

export function readingProgress(b: ProgressShape): ReadingProgress {
  const chapters = usesChapters(b.format);
  const current = chapters ? b.currentChapter : b.currentPage;
  const total = chapters ? b.totalChapters : b.pageCount;
  const ratio =
    total != null && total > 0 && current != null
      ? Math.max(0, Math.min(1, current / total))
      : null;
  return {
    chapters,
    current: current ?? null,
    total: total ?? null,
    unit: chapters ? "chapter" : "page",
    unitPlural: chapters ? "chapters" : "pages",
    ratio,
    has: current != null || total != null,
    field: chapters ? "currentChapter" : "currentPage",
  };
}
