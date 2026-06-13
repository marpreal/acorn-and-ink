import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchWorkByKey, olKeyFromPath, searchPublicBooks, workPageUrl } from "@/lib/openlibrary";
import MushroomRating from "@/components/books/MushroomRating";
import WorkDetailActions from "@/components/library/WorkDetailActions";

export default async function LibraryWorkPage({ params }: { params: Promise<{ olKey: string[] }> }) {
  const user = await requireUser();
  const { olKey: segments } = await params;
  const olKey = olKeyFromPath(segments.join("/"));

  const work = await fetchWorkByKey(olKey);
  if (!work) notFound();

  const searchHit = (await searchPublicBooks(work.title, 6)).find((b) => b.olKey === olKey) ?? null;
  const merged = {
    ...work,
    author: searchHit?.author ?? work.author,
    ratingAverage: searchHit?.ratingAverage ?? work.ratingAverage,
    ratingCount: searchHit?.ratingCount ?? work.ratingCount,
    pageCount: searchHit?.pageCount ?? work.pageCount,
    isbn: searchHit?.isbn ?? work.isbn,
    year: searchHit?.year ?? work.year,
  };

  const owned = await prisma.book.findFirst({
    where: { userId: user.id, olKey },
    select: { id: true },
  });

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link href="/library" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--color-moss-300)" }}>
        <ArrowLeft size={15} /> back to the public library
      </Link>

      <article className="glass rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
        <div className="shrink-0 rounded-xl overflow-hidden mx-auto sm:mx-0 grid place-items-center"
          style={{ width: 140, height: 210, background: "rgba(0,0,0,0.3)" }}>
          {merged.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={merged.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl opacity-60">📖</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm" style={{ color: "var(--color-candle)" }}>Public library work</p>
          <h1 className="font-display glow-text mt-1" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>{merged.title}</h1>
          <p style={{ color: "var(--color-moss-200)" }}>
            {merged.author ?? "unknown hand"}{merged.year ? ` · ${merged.year}` : ""}
            {merged.pageCount ? ` · ${merged.pageCount} pages` : ""}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {merged.ratingAverage != null ? (
              <>
                <MushroomRating value={merged.ratingAverage} size={18} />
                <span className="text-sm" style={{ color: "var(--color-moss-300)" }}>
                  {merged.ratingAverage} · {merged.ratingCount ?? 0} readers on Open Library
                </span>
              </>
            ) : (
              <span className="text-sm" style={{ color: "var(--color-moss-400)" }}>No community scores yet</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <WorkDetailActions book={merged} ownedBookId={owned?.id ?? null} />
            <a href={workPageUrl(olKey)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "0.45rem 0.9rem" }}>
              <ExternalLink size={16} /> Open Library
            </a>
          </div>
        </div>
      </article>

      {merged.description && (
        <section className="parchment p-5">
          <h2 className="font-serif-d text-xl mb-2" style={{ color: "#2c2113" }}>About</h2>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "#3a2c1a" }}>{merged.description}</p>
        </section>
      )}

      <section className="glass rounded-2xl p-5">
        <h2 className="font-serif-d text-xl mb-2" style={{ color: "var(--color-glow)" }}>Community notes</h2>
        <p className="text-sm" style={{ color: "var(--color-moss-200)" }}>
          In-app comments aren&apos;t shared between readers yet. Community scores and descriptions come from Open Library.
          After you add this book to your shelves, you can write your own review and marginalia on its page.
        </p>
      </section>
    </div>
  );
}
