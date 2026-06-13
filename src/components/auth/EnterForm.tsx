"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { signInAction, signUpAction, type AuthState } from "@/app/enter/actions";
import { useSfx } from "@/components/ambiance/ambiance-context";

type Mode = "signin" | "signup";
const initial: AuthState = {};

export default function EnterForm({ initialMode }: { initialMode: Mode }) {
  const sfx = useSfx();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [signInState, signInForm, signInPending] = useActionState(signInAction, initial);
  const [signUpState, signUpForm, signUpPending] = useActionState(signUpAction, initial);

  const isSignup = mode === "signup";
  const state = isSignup ? signUpState : signInState;
  const formAction = isSignup ? signUpForm : signInForm;
  const pending = isSignup ? signUpPending : signInPending;

  useEffect(() => {
    if (state.error) sfx("error");
  }, [state.error, sfx]);

  return (
    <main className="flex-1 grid place-items-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          onMouseEnter={() => sfx("hover")}
          className="inline-flex items-center gap-1.5 mb-4 text-sm"
          style={{ color: "var(--color-moss-300)" }}
        >
          <ArrowLeft size={15} /> back to the glade
        </Link>

        <div className="parchment p-7">
          <div className="flex flex-col items-center text-center">
            <Image src="/brand/sigil.webp" alt="" width={64} height={64} className="rounded-full anim-floaty"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,184,92,0.5))" }} />
            <h1 className="font-display mt-3" style={{ fontSize: "1.9rem", color: "#2c2113" }}>
              {isSignup ? "Plant a Library" : "Welcome Home"}
            </h1>
            <p className="font-hand text-xl mt-1" style={{ color: "#7a5a2c" }}>
              {isSignup ? "press your first seed into the soil" : "the candle has been kept lit for you"}
            </p>
          </div>

          {/* tab toggle */}
          <div className="mt-5 grid grid-cols-2 gap-1 p-1 rounded-full" style={{ background: "rgba(120,86,46,0.14)" }}>
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { sfx("tap"); setMode(m); }}
                aria-pressed={mode === m}
                className="rounded-full py-1.5 text-sm font-serif-d transition"
                style={
                  mode === m
                    ? { background: "linear-gradient(180deg,#ffb24d,#b3361f)", color: "#2a1408", boxShadow: "0 2px 10px -4px rgba(0,0,0,0.5)" }
                    : { color: "#6b4a2b" }
                }
              >
                {m === "signin" ? "Return" : "New library"}
              </button>
            ))}
          </div>

          <form action={formAction} onSubmit={() => sfx("open")} className="mt-5 flex flex-col gap-3">
            {isSignup && (
              <label className="block">
                <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Your name</span>
                <input name="name" required maxLength={60} autoComplete="name" placeholder="Hazel Thornberry"
                  className="ink-field mt-1" />
              </label>
            )}
            <label className="block">
              <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Raven address</span>
              <input name="email" type="email" required autoComplete="email" placeholder="you@thewood.glade"
                className="ink-field mt-1" />
            </label>
            <label className="block">
              <span className="text-sm font-serif-d" style={{ color: "#5a4225" }}>Passphrase</span>
              <input name="password" type="password" required minLength={8}
                autoComplete={isSignup ? "new-password" : "current-password"} placeholder="at least eight letters"
                className="ink-field mt-1" />
            </label>

            {state.error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-sm rounded-lg px-3 py-2"
                style={{ background: "rgba(179,54,31,0.14)", color: "#7a1f12", border: "1px solid rgba(179,54,31,0.3)" }}
              >
                🥀 {state.error}
              </motion.p>
            )}

            <button type="submit" disabled={pending} className="btn btn-ember mt-1 text-lg" style={{ padding: "0.7rem 1.2rem" }}>
              {pending ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
              {isSignup ? "Open the doors" : "Step inside"}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-sm" style={{ color: "var(--color-moss-300)" }}>
          {isSignup ? "Already have a library? " : "No library yet? "}
          <button onClick={() => { sfx("tap"); setMode(isSignup ? "signin" : "signup"); }}
            className="underline" style={{ color: "var(--color-candle)" }}>
            {isSignup ? "return to it" : "plant one"}
          </button>
        </p>
      </motion.div>
    </main>
  );
}
