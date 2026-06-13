"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, ChevronUp, Disc3, ListMusic, Radio, X } from "lucide-react";
import { useAmbiance } from "./ambiance-context";
import { getAudioEngine } from "./audio-engine";
import { ALBUMS, TRACKS } from "@/lib/tracks";

type View = "menu" | "albums" | "album" | "now";

const fmt = (s: number) => {
  if (!isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
};
const indexOfFile = (file: string) => TRACKS.findIndex((t) => t.file === file);

function Cover({ src, size }: { src: string | null; size: number }) {
  return (
    <div className="shrink-0 rounded-md overflow-hidden grid place-items-center"
      style={{ width: size, height: size, background: "linear-gradient(140deg,#3c5234,#16231a)" }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : <Disc3 size={size * 0.5} style={{ color: "var(--color-moss-300)" }} />}
    </div>
  );
}

export default function MusicPlayer() {
  const a = useAmbiance();
  const engine = getAudioEngine();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);

  const current = a.tracks[a.trackIndex];
  const album = ALBUMS.find((al) => al.id === albumId) ?? null;

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => { setPos(engine.position()); setDur(engine.duration()); }, 300);
    return () => clearInterval(id);
  }, [open, engine, a.trackIndex, a.musicOn]);

  if (!a.ready) return null;

  const back = () => {
    a.playSfx("tap");
    setView((v) => (v === "now" ? (albumId ? "album" : "menu") : v === "album" ? "albums" : "menu"));
  };
  const playTrack = (file: string) => { const i = indexOfFile(file); if (i >= 0) { a.playIndex(i); a.playSfx("open"); setView("now"); } };
  const openAlbum = (id: string) => { a.playSfx("page"); setAlbumId(id); setView("album"); };

  const screen = () => {
    if (view === "menu") {
      const items: { label: string; glyph: React.ReactNode; go: () => void }[] = [
        { label: "Now Playing", glyph: <Disc3 size={15} />, go: () => setView("now") },
        { label: "Albums", glyph: <ListMusic size={15} />, go: () => { a.playSfx("page"); setView("albums"); } },
        { label: "Shuffle the Wood", glyph: <Radio size={15} />, go: () => { a.playIndex(Math.floor(Math.random() * TRACKS.length)); setView("now"); } },
      ];
      return (
        <ul className="flex flex-col">
          {items.map((it) => (
            <li key={it.label}>
              <button onClick={it.go} onMouseEnter={() => a.playSfx("hover")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-md hover:bg-[rgba(245,196,81,0.12)]"
                style={{ color: "var(--color-parchment)" }}>
                <span style={{ color: "var(--color-candle)" }}>{it.glyph}</span>
                <span className="font-serif-d">{it.label}</span>
                <span className="ml-auto opacity-40">›</span>
              </button>
            </li>
          ))}
        </ul>
      );
    }
    if (view === "albums") {
      return (
        <ul className="flex flex-col gap-1">
          {ALBUMS.map((al) => (
            <li key={al.id}>
              <button onClick={() => openAlbum(al.id)} onMouseEnter={() => a.playSfx("hover")}
                className="w-full flex items-center gap-2 p-1.5 text-left rounded-md hover:bg-[rgba(245,196,81,0.1)]">
                <Cover src={al.cover} size={34} />
                <span className="min-w-0">
                  <span className="block truncate font-serif-d text-sm" style={{ color: "var(--color-vellum)" }}>{al.album}</span>
                  <span className="block truncate text-[0.7rem]" style={{ color: "var(--color-moss-300)" }}>{al.artist}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      );
    }
    if (view === "album" && album) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Cover src={album.cover} size={44} />
            <div className="min-w-0">
              <div className="truncate font-serif-d" style={{ color: "var(--color-glow)" }}>{album.album}</div>
              <div className="truncate text-xs" style={{ color: "var(--color-moss-300)" }}>{album.artist}</div>
            </div>
          </div>
          <ul className="flex flex-col">
            {album.tracks.map((t, i) => {
              const isCur = current?.file === t.file;
              return (
                <li key={t.file}>
                  <button onClick={() => playTrack(t.file)} onMouseEnter={() => a.playSfx("hover")}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md hover:bg-[rgba(245,196,81,0.1)]"
                    style={{ color: isCur ? "var(--color-candle)" : "var(--color-parchment)" }}>
                    <span className="text-[0.7rem] w-4 opacity-60">{isCur && a.musicOn ? "♪" : i + 1}</span>
                    <span className="truncate text-sm">{t.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    // now playing
    return (
      <div className="flex flex-col items-center text-center px-2 pt-1">
        <Cover src={current?.cover ?? null} size={104} />
        <div className="mt-2 font-serif-d truncate w-full" style={{ color: "var(--color-glow)" }}>{current?.title ?? "—"}</div>
        <div className="text-xs truncate w-full" style={{ color: "var(--color-moss-200)" }}>{current?.artist}</div>
        <div className="text-[0.68rem] truncate w-full" style={{ color: "var(--color-moss-400)" }}>{current?.album}</div>
        <div
          className="mt-2 w-full h-1.5 rounded-full cursor-pointer relative"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const frac = (e.clientX - r.left) / r.width;
            if (dur > 0) { engine.seekTo(frac * dur); setPos(frac * dur); }
          }}
        >
          <div className="h-full rounded-full" style={{ width: `${dur ? (pos / dur) * 100 : 0}%`, background: "linear-gradient(90deg,var(--color-ember),var(--color-candle))" }} />
        </div>
        <div className="flex justify-between w-full text-[0.62rem] mt-0.5" style={{ color: "var(--color-moss-300)" }}>
          <span>{fmt(pos)}</span><span>{fmt(dur)}</span>
        </div>
      </div>
    );
  };

  const titles: Record<View, string> = { menu: "The Wireless Toadstool", albums: "Albums", album: album?.album ?? "Album", now: "Now Playing" };

  return (
    <div className="fixed bottom-5 left-5 z-[70] flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2rem] p-4 w-[270px]"
            style={{
              background: "linear-gradient(165deg,#f3e7cf,#d9c79f 60%,#b98f5c)",
              border: "1px solid rgba(120,86,46,0.5)",
              boxShadow: "0 26px 60px -22px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
            role="dialog" aria-label="Music player"
          >
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="font-hand text-lg" style={{ color: "#5a4225" }}>🍄 forest pod</span>
              <button onClick={() => { a.playSfx("close"); setOpen(false); }} aria-label="Close" style={{ color: "#6b4a2b" }}><X size={16} /></button>
            </div>

            {/* screen */}
            <div className="rounded-xl p-2 h-[208px] overflow-y-auto"
              style={{ background: "linear-gradient(180deg,#0e1410,#16231a)", border: "2px solid #2a1d0f", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.7)" }}>
              <div className="flex items-center justify-between mb-1 px-1">
                <button onClick={back} className="text-[0.62rem] flex items-center gap-0.5" style={{ color: "var(--color-moss-300)" }} aria-label="Back">
                  {view !== "menu" && <><ChevronUp size={11} className="-rotate-90" /> back</>}
                </button>
                <span className="text-[0.62rem] tracking-wide truncate" style={{ color: "var(--color-candle)" }}>{titles[view]}</span>
                <span className="text-[0.62rem]" style={{ color: "var(--color-moss-400)" }}>🍂</span>
              </div>
              {screen()}
            </div>

            {/* click wheel */}
            <div className="relative mx-auto mt-4" style={{ width: 150, height: 150 }}>
              <div className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle at 50% 35%, #e9dcc0, #c2a878 70%, #9c7a4f)", boxShadow: "inset 0 2px 8px rgba(255,255,255,0.5), 0 6px 16px -8px rgba(0,0,0,0.6)" }} />
              <button onClick={back} aria-label="Menu / back"
                className="absolute left-1/2 -translate-x-1/2 top-2 text-[0.7rem] font-serif-d" style={{ color: "#5a4225" }}>MENU</button>
              <button onClick={() => { a.playSfx("tap"); a.prevTrack(); }} aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1" style={{ color: "#5a4225" }}><SkipBack size={18} /></button>
              <button onClick={() => { a.playSfx("tap"); a.nextTrack(); }} aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: "#5a4225" }}><SkipForward size={18} /></button>
              <button onClick={() => { a.playSfx("tap"); setView("now"); }} aria-label="Now playing"
                className="absolute left-1/2 -translate-x-1/2 bottom-2 p-1" style={{ color: "#5a4225" }}><Disc3 size={16} /></button>
              <button onClick={() => { a.playSfx("tap"); a.toggleMusic(); }} aria-label={a.musicOn ? "Pause" : "Play"}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full"
                style={{ width: 58, height: 58, background: "radial-gradient(circle at 50% 35%, #fff7e6, #e4d2ab 70%, #c2a878)", boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.7)", color: "#3a2c1a" }}>
                {a.musicOn ? <Pause size={22} /> : <Play size={22} />}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 px-1">
              <span className="text-xs" style={{ color: "#6b4a2b" }}>🔉</span>
              <input type="range" min={0} max={1} step={0.01} value={a.volume}
                onChange={(e) => a.setVolume(parseFloat(e.target.value))} aria-label="Volume"
                className="w-full" style={{ accentColor: "#b3361f" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => { a.playSfx(open ? "close" : "open"); setOpen((v) => !v); }}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        aria-label="Open the music player"
        className="relative grid place-items-center rounded-2xl"
        style={{
          width: 54, height: 54,
          background: "linear-gradient(160deg,#e9dcc0,#b98f5c)",
          border: "1px solid rgba(120,86,46,0.5)",
          boxShadow: "0 10px 24px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.6)",
          color: "#5a4225",
        }}
      >
        {a.musicOn ? <Disc3 size={24} className="animate-spin" style={{ animationDuration: "3.5s" }} /> : <Radio size={24} />}
      </motion.button>
    </div>
  );
}
