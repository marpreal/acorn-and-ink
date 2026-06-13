import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JournalView from "@/components/journal/JournalView";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string }>;
}) {
  const user = await requireUser();
  const { book } = await searchParams;

  const [tasks, notes, books, entries] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id }, orderBy: [{ done: "asc" }, { sort: "asc" }, { createdAt: "desc" }] }),
    prisma.note.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { book: { select: { title: true } } } }),
    prisma.book.findMany({ where: { userId: user.id }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
    prisma.diaryEntry.findMany({ where: { userId: user.id }, orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <JournalView
      focusBookId={book ?? null}
      tasks={tasks.map((t) => ({ id: t.id, content: t.content, done: t.done }))}
      notes={notes.map((n) => ({
        id: n.id, content: n.content, bookId: n.bookId,
        bookTitle: n.book?.title ?? null, createdAt: n.createdAt.toISOString(),
      }))}
      books={books}
      entries={entries.map((e) => ({
        id: e.id, title: e.title, content: e.content, mood: e.mood,
        entryDate: e.entryDate.toISOString(), createdAt: e.createdAt.toISOString(),
      }))}
    />
  );
}
