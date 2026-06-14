import type { Book } from "@prisma/client";

/** A plain, serializable shape for passing books to client components. */
export type BookDTO = {
  id: string;
  title: string;
  author: string | null;
  format: string;
  status: string;
  rating: number | null;
  review: string | null;
  coverUrl: string | null;
  description: string | null;
  publisher: string | null;
  series: string | null;
  volume: number | null;
  totalVolumes: number | null;
  pageCount: number | null;
  currentPage: number | null;
  totalChapters: number | null;
  currentChapter: number | null;
  isbn: string | null;
  olKey: string | null;
  publishedYear: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  favorite: boolean;
  createdAt: string;
};

export function toBookDTO(b: Book): BookDTO {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    format: b.format,
    status: b.status,
    rating: b.rating,
    review: b.review,
    coverUrl: b.coverUrl,
    description: b.description,
    publisher: b.publisher,
    series: b.series,
    volume: b.volume,
    totalVolumes: b.totalVolumes,
    pageCount: b.pageCount,
    currentPage: b.currentPage,
    totalChapters: b.totalChapters,
    currentChapter: b.currentChapter,
    isbn: b.isbn,
    olKey: b.olKey,
    publishedYear: b.publishedYear,
    startedAt: b.startedAt ? b.startedAt.toISOString() : null,
    finishedAt: b.finishedAt ? b.finishedAt.toISOString() : null,
    favorite: b.favorite,
    createdAt: b.createdAt.toISOString(),
  };
}
