"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { signOutAction } from "@/app/enter/actions";
import { useSfx } from "@/components/ambiance/ambiance-context";
import { HearthStump, Toadstool, Oak, Quill, Sprout, type Critter } from "@/components/critters/Critters";

const NAV: { href: string; label: string; icon: Critter }[] = [
  { href: "/dashboard", label: "The Hearth", icon: HearthStump },
  { href: "/shelves", label: "My Shelves", icon: Toadstool },
  { href: "/library", label: "Public Library", icon: Oak },
  { href: "/journal", label: "Journal", icon: Quill },
  { href: "/stats", label: "Stats Grove", icon: Sprout },
];

export default function GroveShell({
  user,
  children,
}: {
  user: { name: string | null; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sfx = useSfx();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const links = NAV.map((item) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        data-active={active}
        onMouseEnter={() => sfx("hover")}
        onClick={() => { sfx("page"); setOpen(false); }}
        className="lantern-link font-serif-d"
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </Link>
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/dashboard" onMouseEnter={() => sfx("hover")} onClick={() => sfx("open")} className="flex items-center gap-2.5 shrink-0">
            <Image src="/brand/sigil.webp" alt="" width={36} height={36} className="rounded-full anim-floaty"
              style={{ filter: "drop-shadow(0 0 8px rgba(255,184,92,0.5))" }} />
            <span className="font-display text-xl glow-text hidden sm:block">Acorn &amp; Ink</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">{links}</nav>

          <div className="flex items-center gap-2">
            <span className="font-hand text-lg hidden lg:block" style={{ color: "var(--color-moss-200)" }}>
              {user.name ?? user.email}
            </span>
            <form action={signOutAction}>
              <button onClick={() => sfx("close")} className="btn btn-ghost" style={{ padding: "0.4rem 0.7rem" }} aria-label="Sign out" title="Leave the library">
                <LogOut size={16} />
              </button>
            </form>
            <button className="md:hidden btn btn-ghost" style={{ padding: "0.4rem 0.6rem" }}
              onClick={() => { sfx("tap"); setOpen((v) => !v); }} aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t" style={{ borderColor: "rgba(159,174,100,0.15)" }}
            >
              <div className="px-4 py-3 flex flex-col gap-1">{links}</div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-center">
        <div className="hairline mb-4" />
        <p className="font-hand text-lg" style={{ color: "var(--color-moss-300)" }}>
          tended by candlelight · Acorn &amp; Ink
        </p>
      </footer>
    </div>
  );
}
