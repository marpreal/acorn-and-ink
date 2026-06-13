// A window onto the great public library — Open Library (openlibrary.org).
// Free, key-less, with covers and community ratings.

export type PublicBook = {
  olKey: string; // e.g. "/works/OL45883W"
  title: string;
  author: string | null;
  year: number | null;
  coverUrl: string | null;
  coverId: number | null;
  pageCount: number | null;
  editionCount: number | null;
  isbn: string | null;
  ratingAverage: number | null;
  ratingCount: number | null;
};

export function coverUrlFromId(coverId: number | null | undefined, size: "S" | "M" | "L" = "L") {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;
}

type RawDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  edition_count?: number;
  number_of_pages_median?: number;
  isbn?: string[];
  ratings_average?: number;
  ratings_count?: number;
};

export async function searchPublicBooks(query: string, limit = 24): Promise<PublicBook[]> {
  const q = query.trim();
  if (!q) return [];
  const fields = [
    "key", "title", "author_name", "first_publish_year", "cover_i",
    "edition_count", "number_of_pages_median", "isbn",
    "ratings_average", "ratings_count",
  ].join(",");
  const url =
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}` +
    `&fields=${fields}&limit=${limit}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "AcornAndInk/0.1 (personal cozy library)" },
    // cache OL results briefly to be kind to their servers
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) throw new Error(`Open Library responded ${res.status}`);
  const data = (await res.json()) as { docs?: RawDoc[] };

  return (data.docs ?? []).map((d): PublicBook => ({
    olKey: d.key ?? "",
    title: d.title ?? "Untitled",
    author: d.author_name?.[0] ?? null,
    year: d.first_publish_year ?? null,
    coverId: d.cover_i ?? null,
    coverUrl: coverUrlFromId(d.cover_i),
    pageCount: d.number_of_pages_median ?? null,
    editionCount: d.edition_count ?? null,
    isbn: d.isbn?.[0] ?? null,
    ratingAverage: typeof d.ratings_average === "number" ? Math.round(d.ratings_average * 10) / 10 : null,
    ratingCount: d.ratings_count ?? null,
  })).filter((b) => b.olKey);
}

export function workPageUrl(olKey: string) {
  return `https://openlibrary.org${olKey}`;
}
