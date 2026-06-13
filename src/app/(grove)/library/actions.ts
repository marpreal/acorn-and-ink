"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { FORMAT_KEYS, STATUS_KEYS } from "@/lib/formats";

const schema = z.object({
  title: z.string().trim().min(1).max(300),
  author: z.string().trim().max(200).nullish(),
  coverUrl: z.string().max(1200).nullish(),
  olKey: z.string().max(200).nullish(),
  isbn: z.string().max(40).nullish(),
  publishedYear: z.number().int().min(0).max(3000).nullish(),
  pageCount: z.number().int().min(0).max(200000).nullish(),
  format: z.enum(FORMAT_KEYS as [string, ...string[]]),
  status: z.enum(STATUS_KEYS as [string, ...string[]]),
});

export type AddResult = { ok: boolean; error?: string };

export async function addPublicBook(input: unknown): Promise<AddResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be inside the library." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That book couldn't be carried home." };
  const d = parsed.data;

  // Avoid duplicates of the same Open Library work on a reader's shelves.
  if (d.olKey) {
    const dup = await prisma.book.findFirst({ where: { userId, olKey: d.olKey }, select: { id: true } });
    if (dup) return { ok: false, error: "Already on your shelves." };
  }

  await prisma.book.create({
    data: {
      userId,
      title: d.title,
      author: d.author ?? null,
      coverUrl: d.coverUrl ?? null,
      olKey: d.olKey ?? null,
      isbn: d.isbn ?? null,
      publishedYear: d.publishedYear ?? null,
      pageCount: d.pageCount ?? null,
      format: d.format,
      status: d.status,
      startedAt: d.status === "reading" ? new Date() : null,
      finishedAt: d.status === "read" ? new Date() : null,
    },
  });

  revalidatePath("/shelves");
  revalidatePath("/dashboard");
  revalidatePath("/stats");
  revalidatePath("/library");
  revalidatePath("/books");
  return { ok: true };
}
