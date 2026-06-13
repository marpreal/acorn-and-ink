"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles, Music4, Volume2, VolumeX, Play, Pause,
  SkipForward, SkipBack, Wand2, Moon, X,
} from "lucide-react";
import { useAmbiance } from "./ambiance-context";

function Toggle({
  on, onClick, label, children,
}: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left transition"
      style={{
        background: on ? "rgba(245,196,81,0.14)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${on ? "rgba(245,196,81,0.4)" : "rgba(159,174,100,0.18)"}`,
        color: on ? "var(--color-glow)" : "var(--color-moss-200)",
      }}
    >
      {children}
    </button>
  );
}

export default function AmbianceControls() {
  const a = useAmbiance();
  const [open, setOpen] = useState(false);
  if (!a.ready) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-2xl p-4 w-72"
            role="dialog"
            aria-label="Ambiance settings"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-serif-d text-lg" style={{ color: "var(--color-glow)" }}>
                The Glade&rsquo;s Mood
              </span>
              <button onClick={() => { a.playSfx("close"); setOpen(false); }} aria-label="Close" className="opacity-70 hover:opacity-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Toggle on={a.atmosphereOn} label="Toggle fireflies and candle" onClick={() => { a.playSfx("tap"); a.toggleAtmosphere(); }}>
                <Sparkles size={18} /> <span>Fireflies &amp; candlelight</span>
              </Toggle>

              <Toggle on={a.sfxOn} label="Toggle interface sounds" onClick={() => { a.toggleSfx(); a.playSfx("tap"); }}>
                <Wand2 size={18} /> <span>Whispers &amp; chimes</span>
              </Toggle>

              <div className="rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(159,174,100,0.18)" }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2" style={{ color: "var(--color-moss-200)" }}>
                    <Music4 size={18} /> Forest music
                  </span>
                  <button
                    onClick={() => { a.toggleMusic(); a.playSfx("tap"); }}
                    aria-label={a.musicOn ? "Pause music" : "Play music"}
                    className="btn btn-ember"
                    style={{ padding: "0.3rem 0.6rem" }}
                  >
                    {a.musicOn ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>

                <div className="mt-2 text-sm font-hand" style={{ color: "var(--color-glow)", fontSize: "1.1rem" }}>
                  {a.tracks[a.trackIndex]?.title}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => { a.prevTrack(); a.playSfx("tap"); }} aria-label="Previous track" className="opacity-80 hover:opacity-100"><SkipBack size={18} /></button>
                  <button onClick={() => { a.nextTrack(); a.playSfx("tap"); }} aria-label="Next track" className="opacity-80 hover:opacity-100"><SkipForward size={18} /></button>
                  <div className="flex items-center gap-1 flex-1">
                    {a.volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <input
                      type="range" min={0} max={1} step={0.01} value={a.volume}
                      onChange={(e) => a.setVolume(parseFloat(e.target.value))}
                      aria-label="Music volume"
                      className="w-full accent-[var(--color-ember)]"
                    />
                  </div>
                </div>
              </div>

              {a.reducedMotion && (
                <p className="text-xs flex items-center gap-1.5 mt-1" style={{ color: "var(--color-moss-300)" }}>
                  <Moon size={13} /> Reduced motion is on — the glade rests gently.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => { a.playSfx(open ? "close" : "open"); setOpen((v) => !v); }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open ambiance settings"
        className="relative grid place-items-center rounded-full"
        style={{
          width: 56, height: 56,
          background: "radial-gradient(circle at 50% 35%, #ffe39a, #ffae4d 45%, #b3361f 100%)",
          boxShadow: "0 0 26px -2px rgba(255,178,77,0.7), 0 10px 26px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,200,120,0.5) inset",
          color: "#2a1408",
        }}
      >
        <span className="anim-flicker">🏮</span>
      </motion.button>
    </div>
  );
}
