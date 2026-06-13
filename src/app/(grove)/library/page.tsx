import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LibraryView from "@/components/library/LibraryView";

export default async function LibraryPage() {
  const user = await requireUser();
  const existing = await prisma.book.findMany({
    where: { userId: user.id, olKey: { not: null } },
    select: { olKey: true },
  });
  const keys = existing.map((e) => e.olKey).filter((k): k is string => !!k);
  return <LibraryView existingKeys={keys} />;
}
