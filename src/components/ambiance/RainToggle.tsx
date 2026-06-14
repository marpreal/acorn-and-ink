"use client";

import { motion } from "framer-motion";
import { Cloud, CloudRain } from "lucide-react";
import { useAmbiance } from "./ambiance-context";

/** Cloud toggle — rain visuals + frogsong off by default; tap to let the storm in. */
export default function RainToggle() {
  const a = useAmbiance();
  if (!a.ready) return null;

  return (
    <motion.button
      onClick={() => { a.playSfx("tap"); a.toggleAmbient(); }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-pressed={a.ambientOn}
      aria-label={a.ambientOn ? "Turn off rain and frogsong" : "Turn on rain and frogsong"}
      title={a.ambientOn ? "Rain falling — tap to hush" : "Summon rain & frogsong"}
      className="fixed bottom-[5.5rem] right-5 z-[70] grid place-items-center rounded-full transition-shadow"
      style={{
        width: 48,
        height: 48,
        background: a.ambientOn
          ? "linear-gradient(165deg, #6b7d8a 0%, #3d4a52 55%, #2a3238 100%)"
          : "linear-gradient(165deg, rgba(60,72,80,0.55), rgba(30,38,42,0.75))",
        border: `1px solid ${a.ambientOn ? "rgba(180,210,230,0.45)" : "rgba(159,174,100,0.22)"}`,
        boxShadow: a.ambientOn
          ? "0 0 22px -4px rgba(140,180,210,0.55), 0 8px 20px -10px rgba(0,0,0,0.85)"
          : "0 8px 20px -12px rgba(0,0,0,0.75)",
        color: a.ambientOn ? "#d8e8f4" : "var(--color-moss-300)",
      }}
    >
      {a.ambientOn ? <CloudRain size={22} /> : <Cloud size={22} />}
    </motion.button>
  );
}
