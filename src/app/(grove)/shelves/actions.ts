"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { FORMAT_KEYS, STATUS_KEYS } from "@/lib/formats";

export type BookActionState = { ok: boolean; error?: string; id?: string };

const bookSchema = z.object({
  title: z.string().trim().min(1, "Every book needs a title.").max(300),
  author: z.string().trim().max(200).nullish(),
  format: z.enum(FORMAT_KEYS as [string, ...string[]]),
  status: z.enum(STATUS_KEYS as [string, ...string[]]),
  rating: z.number().min(0).max(5).nullish(),
  review: z.string().max(8000).nullish(),
  coverUrl: z.string().max(1200).nullish(),
  description: z.string().max(8000).nullish(),
  publisher: z.string().max(200).nullish(),
  series: z.string().max(200).nullish(),
  volume: z.number().int().min(0).max(100000).nullish(),
  totalVolumes: z.number().int().min(0).max(100000).nullish(),
  pageCount: z.number().int().min(0).max(200000).nullish(),
  publishedYear: z.number().int().min(0).max(3000).nullish(),
  olKey: z.string().max(200).nullish(),
  isbn: z.string().max(40).nullish(),
});

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}
function num(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function date(fd: FormData, key: string): Date | null {
  const v = str(fd, key);
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function revalidate() {
  revalidatePath("/shelves");
  revalidatePath("/dashboard");
  revalidatePath("/stats");
  revalidatePath("/books");
}

function parse(fd: FormData) {
  return bookSchema.safeParse({
    title: str(fd, "title"),
    author: str(fd, "author"),
    format: str(fd, "format") ?? "novel",
    status: str(fd, "status") ?? "want",
    rating: num(fd, "rating"),
    review: str(fd, "review"),
    coverUrl: str(fd, "coverUrl"),
    description: str(fd, "description"),
    publisher: str(fd, "publisher"),
    series: str(fd, "series"),
    volume: num(fd, "volume"),
    totalVolumes: num(fd, "totalVolumes"),
    pageCount: num(fd, "pageCount"),
    publishedYear: num(fd, "publishedYear"),
    olKey: str(fd, "olKey"),
    isbn: str(fd, "isbn"),
  });
}

export async function createBook(_prev: BookActionState, fd: FormData): Promise<BookActionState> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be inside the library." };

  const parsed = parse(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Something went awry." };
  const data = parsed.data;

  let startedAt = date(fd, "startedAt");
  let finishedAt = date(fd, "finishedAt");
  if (data.status === "reading" && !startedAt) startedAt = new Date();
  if (data.status === "read" && !finishedAt) finishedAt = new Date();

  const book = await prisma.book.create({
    data: { ...data, favorite: fd.get("favorite") === "on", startedAt, finishedAt, userId },
    select: { id: true },
  });
  revalidate();
  return { ok: true, id: book.id };
}

export async function updateBook(id: string, _prev: BookActionState, fd: FormData): Promise<BookActionState> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be inside the library." };

  const existing = await prisma.book.findUnique({ where: { id }, select: { userId: true, startedAt: true, finishedAt: true } });
  if (!existing || existing.userId !== userId) return { ok: false, error: "That book isn't on your shelves." };

  const parsed = parse(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Something went awry." };
  const data = parsed.data;

  let startedAt = date(fd, "startedAt") ?? existing.startedAt;
  let finishedAt = date(fd, "finishedAt") ?? existing.finishedAt;
  if (data.status === "reading" && !startedAt) startedAt = new Date();
  if (data.status === "read" && !finishedAt) finishedAt = new Date();

  await prisma.book.update({
    where: { id },
    data: { ...data, favorite: fd.get("favorite") === "on", startedAt, finishedAt },
  });
  revalidate();
  return { ok: true, id };
}

export async function deleteBook(id: string): Promise<BookActionState> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be inside the library." };
  const existing = await prisma.book.findUnique({ where: { id }, select: { userId: true } });
  if (!existing || existing.userId !== userId) return { ok: false, error: "That book isn't on your shelves." };
  await prisma.book.delete({ where: { id } });
  revalidate();
  return { ok: true };
}

/** Quick inline change of reading status (with date side-effects). */
export async function setBookStatus(id: string, status: string): Promise<BookActionState> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be inside the library." };
  if (!STATUS_KEYS.includes(status as (typeof STATUS_KEYS)[number])) return { ok: false, error: "Unknown status." };

  const existing = await prisma.book.findUnique({ where: { id }, select: { userId: true, startedAt: true, finishedAt: true } });
  if (!existing || existing.userId !== userId) return { ok: false, error: "That book isn't on your shelves." };

  const data: { status: string; startedAt?: Date; finishedAt?: Date } = { status };
  if (status === "reading" && !existing.startedAt) data.startedAt = new Date();
  if (status === "read" && !existing.finishedAt) data.finishedAt = new Date();

  await prisma.book.update({ where: { id }, data });
  revalidate();
  return { ok: true };
}

/** Quick inline rating in mushrooms (0–5, half steps). */
export async function setBookRating(id: string, rating: number): Promise<BookActionState> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be inside the library." };
  const r = Math.max(0, Math.min(5, rating));
  const existing = await prisma.book.findUnique({ where: { id }, select: { userId: true } });
  if (!existing || existing.userId !== userId) return { ok: false, error: "That book isn't on your shelves." };
  await prisma.book.update({ where: { id }, data: { rating: r === 0 ? null : r } });
  revalidate();
  return { ok: true };
}
