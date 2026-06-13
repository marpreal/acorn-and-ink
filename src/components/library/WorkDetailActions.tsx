"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { addPublicBook } from "@/app/(grove)/library/actions";
import type { PublicBook } from "@/lib/openlibrary";
import { useSfx } from "@/components/ambiance/ambiance-context";

export default function WorkDetailActions({
  book,
  ownedBookId,
}: {
  book: PublicBook & { description?: string | null };
  ownedBookId: string | null;
}) {
  const router = useRouter();
  const sfx = useSfx();
  const [pending, start] = useTransition();

  if (ownedBookId) {
    return (
      <Link href={`/books/${ownedBookId}`} className="btn btn-ember" style={{ padding: "0.45rem 0.9rem" }}>
        <Check size={16} /> On your shelves — open
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      className="btn btn-ember"
      style={{ padding: "0.45rem 0.9rem" }}
      onClick={() => {
        sfx("open");
        start(async () => {
          const r = await addPublicBook({
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            olKey: book.olKey,
            isbn: book.isbn,
            publishedYear: book.year,
            pageCount: book.pageCount,
            format: "novel",
            status: "want",
          });
          if (r.ok) {
            sfx("success");
            router.refresh();
          } else {
            sfx("error");
          }
        });
      }}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add to shelves
    </button>
  );
}
