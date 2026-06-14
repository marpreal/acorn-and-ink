import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, NotebookPen, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBookDTO } from "@/lib/book-dto";
import { formatMeta, statusMeta } from "@/lib/formats";
import { fetchWorkByKey, libraryWorkHref, workPageUrl } from "@/lib/openlibrary";
import MushroomRating from "@/components/books/MushroomRating";
import ReadingProgress from "@/components/books/ReadingProgress";
import { FormatCritter } from "@/components/critters/Critters";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!book || book.userId !== user.id) notFound();

  const dto = toBookDTO(book);
  const fmt = formatMeta(dto.format);
  const st = statusMeta(dto.status);
  const olWork = dto.olKey ? await fetchWorkByKey(dto.olKey) : null;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link href="/shelves" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--color-moss-300)" }}>
        <ArrowLeft size={15} /> back to shelves
      </Link>

      <article className="glass rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
        <div className="shrink-0 rounded-xl overflow-hidden mx-auto sm:mx-0" style={{ width: 140, height: 210, boxShadow: "0 12px 28px -14px rgba(0,0,0,0.85)" }}>
          {dto.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dto.coverUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full grid place-items-center p-3 text-center"
              style={{ background: `linear-gradient(150deg, ${fmt.accent}33, #2a1d0f)` }}>
              <span className="font-serif-d" style={{ color: "var(--color-vellum)" }}>{dto.title}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm inline-flex items-center gap-1.5" style={{ color: fmt.accent }}>
            <FormatCritter format={dto.format} size={18} /> {fmt.label}
          </p>
          <h1 className="font-display glow-text mt-1" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>{dto.title}</h1>
          <p style={{ color: "var(--color-moss-200)" }}>
            {dto.author ?? "unknown hand"}
            {dto.series ? ` · ${dto.series}${dto.volume ? ` #${dto.volume}` : ""}` : ""}
            {dto.publishedYear ? ` · ${dto.publishedYear}` : ""}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="chip" style={{ background: `${st.accent}22`, color: st.accent, borderColor: `${st.accent}55` }}>
              {st.glyph} {st.label}
            </span>
            {dto.favorite && <span className="chip">✦ treasured</span>}
          </div>

          <div className="mt-3">
            <p className="text-xs mb-1" style={{ color: "var(--color-moss-300)" }}>Your mushrooms</p>
            <MushroomRating value={dto.rating} size={22} />
          </div>

          <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(159,174,100,0.14)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--color-moss-300)" }}>How far you&apos;ve wandered</p>
            <ReadingProgress book={dto} size="full" force />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/journal?book=${dto.id}`} className="btn btn-ember" style={{ padding: "0.45rem 0.9rem" }}>
              <NotebookPen size={16} /> Marginalia
            </Link>
            <Link href={`/shelves?edit=${dto.id}`} className="btn" style={{ background: "rgba(120,86,46,0.25)", color: "var(--color-moss-200)" }}>
              <Pencil size={16} /> Mend
            </Link>
            {dto.olKey && (
              <a href={workPageUrl(dto.olKey)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "0.45rem 0.9rem" }}>
                <ExternalLink size={16} /> Open Library
              </a>
            )}
          </div>
        </div>
      </article>

      {(dto.review || dto.description || olWork?.description) && (
        <section className="parchment p-5">
          <h2 className="font-serif-d text-xl mb-2" style={{ color: "#2c2113" }}>Your thoughts</h2>
          {dto.review ? (
            <p className="whitespace-pre-wrap" style={{ color: "#3a2c1a" }}>{dto.review}</p>
          ) : (
            <p className="font-hand text-lg" style={{ color: "#7a5a2c" }}>No review yet — open marginalia or mend this tome.</p>
          )}
          {(dto.description || olWork?.description) && (
            <>
              <h3 className="font-serif-d text-lg mt-4 mb-1" style={{ color: "#2c2113" }}>About this book</h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "#5a4225" }}>
                {dto.description ?? olWork?.description}
              </p>
            </>
          )}
        </section>
      )}

      {dto.olKey && (
        <section className="glass rounded-2xl p-5">
          <h2 className="font-serif-d text-xl mb-2" style={{ color: "var(--color-glow)" }}>Community on Open Library</h2>
          <p className="text-sm mb-3" style={{ color: "var(--color-moss-200)" }}>
            Acorn &amp; Ink shares mushroom scores from the public library of readers worldwide.
          </p>
          <Link href={libraryWorkHref(dto.olKey)} className="underline" style={{ color: "var(--color-candle)" }}>
            View this work in the public library →
          </Link>
        </section>
      )}

      <section className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif-d text-xl" style={{ color: "var(--color-glow)" }}>Marginalia</h2>
          <Link href={`/journal?book=${dto.id}`} className="text-sm underline" style={{ color: "var(--color-candle)" }}>write a note</Link>
        </div>
        {book.notes.length === 0 ? (
          <p className="font-hand text-lg" style={{ color: "var(--color-moss-300)" }}>The margins are still blank.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {book.notes.map((n) => (
              <li key={n.id} className="rounded-xl px-3 py-2" style={{ background: "rgba(0,0,0,0.2)" }}>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--color-parchment)" }}>{n.content}</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-moss-400)" }}>
                  {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
