// Dev helper: ensure a test reader exists (with sample books) and print a
// valid session cookie so we can curl the authed pages.
//   node --env-file=.env scripts/seed-test.mjs
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = "test@thewood.glade";

const user = await prisma.user.upsert({
  where: { email },
  update: {},
  create: { email, name: "Hazel", passwordHash: await bcrypt.hash("acorns-and-ink", 11) },
});

const count = await prisma.book.count({ where: { userId: user.id } });
if (count === 0) {
  const y = new Date().getFullYear();
  const sample = [
    { title: "The Hobbit", author: "J.R.R. Tolkien", format: "novel", status: "read", rating: 5, finishedAt: new Date(y, 2, 12), favorite: true, coverUrl: "https://covers.openlibrary.org/b/id/6979861-L.jpg" },
    { title: "Piranesi", author: "Susanna Clarke", format: "novel", status: "read", rating: 4.5, finishedAt: new Date(y, 4, 3) },
    { title: "The Night Circus", author: "Erin Morgenstern", format: "novel", status: "paused", rating: 3.5 },
    { title: "Berserk", author: "Kentaro Miura", format: "manga", status: "reading", rating: 5, series: "Berserk", volume: 14, startedAt: new Date(y, 0, 9) },
    { title: "Chainsaw Man", author: "Tatsuki Fujimoto", format: "manga", status: "want" },
    { title: "The Sandman", author: "Neil Gaiman", format: "comic", status: "read", rating: 4, finishedAt: new Date(y, 1, 20) },
    { title: "Bone", author: "Jeff Smith", format: "comic", status: "dropped", rating: 2 },
  ];
  for (const b of sample) await prisma.book.create({ data: { ...b, userId: user.id } });

  await prisma.task.createMany({
    data: [
      { userId: user.id, content: "Finish Berserk vol. 14", sort: 0 },
      { userId: user.id, content: "Find a cosy reading nook by the window", sort: 1 },
      { userId: user.id, content: "Lend Piranesi to the fox", sort: 2 },
    ],
  });
  await prisma.note.create({ data: { userId: user.id, content: "Note to self: the forest reads best at dusk, with tea." } });
}

const token = await new SignJWT({ sub: user.id })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("30d")
  .sign(new TextEncoder().encode(process.env.AUTH_SECRET));

console.log("COOKIE ai_session=" + token);
await prisma.$disconnect();
