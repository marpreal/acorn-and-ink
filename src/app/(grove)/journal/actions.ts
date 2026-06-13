"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export type JournalResult = { ok: boolean; error?: string };

const rev = () => { revalidatePath("/journal"); revalidatePath("/dashboard"); };
const text = z.string().trim().min(1, "A whisper needs words.").max(4000);

async function owns(model: "task" | "note", id: string, userId: string) {
  const row = model === "task"
    ? await prisma.task.findUnique({ where: { id }, select: { userId: true } })
    : await prisma.note.findUnique({ where: { id }, select: { userId: true } });
  return !!row && row.userId === userId;
}

// ── Tasks ────────────────────────────────────────────────
export async function addTask(content: string): Promise<JournalResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be inside the library." };
  const parsed = text.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await prisma.task.create({ data: { userId, content: parsed.data } });
  rev();
  return { ok: true };
}

export async function toggleTask(id: string, done: boolean): Promise<JournalResult> {
  const userId = await getUserId();
  if (!userId || !(await owns("task", id, userId))) return { ok: false, error: "Not your task." };
  await prisma.task.update({ where: { id }, data: { done } });
  rev();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<JournalResult> {
  const userId = await getUserId();
  if (!userId || !(await owns("task", id, userId))) return { ok: false, error: "Not your task." };
  await prisma.task.delete({ where: { id } });
  rev();
  return { ok: true };
}

// ── Notes (marginalia) ───────────────────────────────────
export async function addNote(content: string, bookId?: string | null): Promise<JournalResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be inside the library." };
  const parsed = text.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  let linked: string | null = null;
  if (bookId) {
    const b = await prisma.book.findUnique({ where: { id: bookId }, select: { userId: true } });
    if (b && b.userId === userId) linked = bookId;
  }
  await prisma.note.create({ data: { userId, content: parsed.data, bookId: linked } });
  rev();
  return { ok: true };
}

export async function updateNote(id: string, content: string): Promise<JournalResult> {
  const userId = await getUserId();
  if (!userId || !(await owns("note", id, userId))) return { ok: false, error: "Not your note." };
  const parsed = text.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await prisma.note.update({ where: { id }, data: { content: parsed.data } });
  rev();
  return { ok: true };
}

export async function deleteNote(id: string): Promise<JournalResult> {
  const userId = await getUserId();
  if (!userId || !(await owns("note", id, userId))) return { ok: false, error: "Not your note." };
  await prisma.note.delete({ where: { id } });
  rev();
  return { ok: true };
}
