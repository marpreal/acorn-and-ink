import "server-only";
import { prisma } from "@/lib/prisma";
import { FORMAT_KEYS, STATUS_KEYS, type FormatKey, type StatusKey } from "@/lib/formats";

export type ReadingStats = {
  year: number;
  total: number;
  byStatus: Record<StatusKey, number>;
  byFormat: Record<FormatKey, number>;
  readThisYear: number;
  readThisYearByFormat: Record<FormatKey, number>;
  readAllTime: number;
  currentlyReading: number;
  wishlisted: number;
  rated: number;
  averageRating: number | null;
};

function zeroFormat(): Record<FormatKey, number> {
  return FORMAT_KEYS.reduce((acc, k) => ((acc[k] = 0), acc), {} as Record<FormatKey, number>);
}
function zeroStatus(): Record<StatusKey, number> {
  return STATUS_KEYS.reduce((acc, k) => ((acc[k] = 0), acc), {} as Record<StatusKey, number>);
}

export async function getReadingStats(userId: string): Promise<ReadingStats> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);

  const books = await prisma.book.findMany({
    where: { userId },
    select: { format: true, status: true, rating: true, finishedAt: true },
  });

  const byStatus = zeroStatus();
  const byFormat = zeroFormat();
  const readThisYearByFormat = zeroFormat();
  let readThisYear = 0;
  let readAllTime = 0;
  let ratingSum = 0;
  let rated = 0;

  for (const b of books) {
    const fmt = (FORMAT_KEYS.includes(b.format as FormatKey) ? b.format : "other") as FormatKey;
    const st = (STATUS_KEYS.includes(b.status as StatusKey) ? b.status : "want") as StatusKey;
    byFormat[fmt]++;
    byStatus[st]++;
    if (st === "read") {
      readAllTime++;
      if (b.finishedAt && b.finishedAt >= startOfYear) {
        readThisYear++;
        readThisYearByFormat[fmt]++;
      }
    }
    if (typeof b.rating === "number" && b.rating > 0) {
      ratingSum += b.rating;
      rated++;
    }
  }

  return {
    year,
    total: books.length,
    byStatus,
    byFormat,
    readThisYear,
    readThisYearByFormat,
    readAllTime,
    currentlyReading: byStatus.reading,
    wishlisted: byStatus.want,
    rated,
    averageRating: rated ? Math.round((ratingSum / rated) * 10) / 10 : null,
  };
}
