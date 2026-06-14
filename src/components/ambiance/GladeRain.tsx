"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAmbiance } from "./ambiance-context";

/** Full-page rain curtain — only when the cloud toggle is on. Sits behind page content. */
export default function GladeRain() {
  const { ambientOn, ready, reducedMotion } = useAmbiance();
  if (!ready) return null;

  return (
    <AnimatePresence>
      {ambientOn && (
        <motion.div
          key="glade-rain"
          className="glade-rain"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={`glade-rain-curtain${reducedMotion ? " glade-rain-curtain--still" : ""}`} />
          <div className="glade-rain-mist" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
