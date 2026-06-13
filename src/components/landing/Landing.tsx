"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookHeart, Library, ListTodo, NotebookPen, Sprout, Stars } from "lucide-react";
import { useSfx } from "@/components/ambiance/ambiance-context";

const features = [
  { icon: BookHeart, title: "Your shelves", text: "Novels, manga & comics — add, tend and let go by candlelight." },
  { icon: Stars, title: "Mushroom scores", text: "Rate each tome in toadstools and pen your own private review." },
  { icon: Library, title: "The public library", text: "Search the world's books and borrow the community's ratings." },
  { icon: ListTodo, title: "A reading to-do", text: "A little parchment list of what to read and what to do next." },
  { icon: NotebookPen, title: "Marginalia", text: "Whisper private notes to yourself in the margins of any book." },
  { icon: Sprout, title: "The stats grove", text: "Watch your year of reading grow, counted by kind and in whole." },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Landing({ signedIn, name }: { signedIn: boolean; name: string | null }) {
  const sfx = useSfx();

  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <div className="w-full max-w-5xl flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="anim-floaty"
        >
          <div
            className="rounded-full p-1"
            style={{ boxShadow: "0 0 70px -8px rgba(245,196,81,0.6)" }}
          >
            <Image
              src="/brand/sigil.webp"
              alt="A glowing open book beside a crystal ball"
              width={128}
              height={128}
              priority
              className="rounded-full"
              style={{ filter: "drop-shadow(0 0 18px rgba(255,184,92,0.5))" }}
            />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
          className="font-hand mt-6 text-2xl glow-soft"
          style={{ color: "var(--color-wisp)" }}
        >
          welcome, wanderer, to
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9, ease }}
          className="font-display glow-text mt-1"
          style={{ fontSize: "clamp(2.6rem, 8vw, 5.5rem)", lineHeight: 1.02 }}
        >
          Acorn &amp; Ink
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
          className="mt-4 max-w-xl text-lg"
          style={{ color: "var(--color-parchment)" }}
        >
          An enchanted library tucked in the heart of the wood, where you keep your books
          like pressed flowers — counted, scored in mushrooms, and remembered. Light a candle,
          and let the fireflies show you the shelves.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8, ease }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href={signedIn ? "/dashboard" : "/enter"}
            onMouseEnter={() => sfx("hover")}
            onClick={() => sfx("open")}
            className="btn btn-ember text-lg"
            style={{ padding: "0.8rem 1.6rem" }}
          >
            🍄 {signedIn ? `Return to your shelves${name ? `, ${name}` : ""}` : "Enter the library"}
          </Link>
          {!signedIn && (
            <Link
              href="/enter?mode=signup"
              onMouseEnter={() => sfx("hover")}
              onClick={() => sfx("tap")}
              className="btn btn-ghost text-lg"
              style={{ padding: "0.8rem 1.6rem" }}
            >
              Plant a new library
            </Link>
          )}
        </motion.div>

        <div className="mt-16 w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.09, duration: 0.7, ease }}
              onMouseEnter={() => sfx("hover")}
              className="glass rounded-2xl p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid place-items-center rounded-xl"
                  style={{ width: 42, height: 42, background: "rgba(245,196,81,0.12)", color: "var(--color-candle)", border: "1px solid rgba(245,196,81,0.25)" }}
                >
                  <f.icon size={22} />
                </span>
                <h3 className="font-serif-d text-xl" style={{ color: "var(--color-vellum)" }}>{f.title}</h3>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--color-moss-200)" }}>{f.text}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-14 font-hand text-xl" style={{ color: "var(--color-moss-300)" }}>
          ✦ tap the lantern, bottom-right, to wake the forest music ✦
        </p>
      </div>
    </main>
  );
}
