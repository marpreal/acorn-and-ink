import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBookDTO } from "@/lib/book-dto";
import ShelvesView from "@/components/books/ShelvesView";

export default async function ShelvesPage() {
  const user = await requireUser();
  const books = await prisma.book.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return <ShelvesView books={books.map(toBookDTO)} />;
}
