"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getAudioEngine, TRACKS, type SfxName, type TrackInfo } from "./audio-engine";

type AmbianceState = {
  ready: boolean;
  atmosphereOn: boolean;
  musicOn: boolean;
  sfxOn: boolean;
  ambientOn: boolean;
  volume: number;
  trackIndex: number;
  reducedMotion: boolean;
  isTouch: boolean;
  tracks: TrackInfo[];
  toggleAtmosphere: () => void;
  toggleMusic: () => void;
  toggleSfx: () => void;
  toggleAmbient: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playIndex: (i: number) => void;
  setVolume: (v: number) => void;
  playSfx: (name: SfxName) => void;
};

const Ctx = createContext<AmbianceState | null>(null);

const KEY = "acorn-ambiance-v1";
type Persisted = { atmosphereOn: boolean; musicOn: boolean; sfxOn: boolean; ambientOn: boolean; volume: number };

export function AmbianceProvider({ children }: { children: React.ReactNode }) {
  const engine = useMemo(() => getAudioEngine(), []);
  const [ready, setReady] = useState(false);
  const [atmosphereOn, setAtmosphereOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [sfxOn, setSfxOn] = useState(true);
  const [ambientOn, setAmbientOn] = useState(false);
  const [volume, setVolumeState] = useState(0.38);
  const [trackIndex, setTrackIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const unlocked = useRef(false);
  const ambientWanted = useRef(false); // start the bed once audio is unlocked

  // hydrate prefs + environment
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setReducedMotion(rm);
    setIsTouch(touch);

    let stored: Partial<Persisted> = {};
    try { stored = JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch {}

    const atmo = stored.atmosphereOn ?? !rm;
    setAtmosphereOn(atmo);
    setSfxOn(stored.sfxOn ?? true);
    setAmbientOn(stored.ambientOn ?? false);
    ambientWanted.current = stored.ambientOn ?? false;
    setVolumeState(stored.volume ?? 0.38);
    engine.sfxOn = stored.sfxOn ?? true;
    engine.setMusicVolume(stored.volume ?? 0.38);
    setReady(true);
  }, [engine]);

  // reflect atmosphere / rain flags onto <html> for global CSS
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.atmosphere = atmosphereOn ? "on" : "off";
    document.documentElement.dataset.ambient = ambientOn ? "on" : "off";
  }, [atmosphereOn, ambientOn, ready]);

  // persist
  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { atmosphereOn, musicOn, sfxOn, ambientOn, volume };
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }, [atmosphereOn, musicOn, sfxOn, ambientOn, volume, ready]);

  // unlock audio on first gesture
  useEffect(() => {
    const onGesture = () => {
      if (unlocked.current) return;
      unlocked.current = true;
      engine.unlock();
      if (ambientWanted.current) engine.setAmbientOn(true);
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [engine]);

  // keep React in step with the engine (auto-advance to next track, play/pause)
  useEffect(() => {
    engine.onChange = () => { setTrackIndex(engine.currentIndex); setMusicOn(engine.musicOn); };
    return () => { engine.onChange = null; };
  }, [engine]);

  const playSfx = useCallback((name: SfxName) => { engine.playSfx(name); }, [engine]);

  const toggleAtmosphere = useCallback(() => setAtmosphereOn((v) => !v), []);
  const toggleSfx = useCallback(() => {
    setSfxOn((v) => { engine.sfxOn = !v; return !v; });
  }, [engine]);
  const toggleMusic = useCallback(() => {
    setMusicOn((v) => { engine.setMusicOn(!v); return !v; });
  }, [engine]);
  const toggleAmbient = useCallback(() => {
    setAmbientOn((v) => { const next = !v; ambientWanted.current = next; engine.setAmbientOn(next); return next; });
  }, [engine]);
  const nextTrack = useCallback(() => { engine.next(); setTrackIndex(engine.currentIndex); }, [engine]);
  const prevTrack = useCallback(() => { engine.prev(); setTrackIndex(engine.currentIndex); }, [engine]);
  const playIndex = useCallback((i: number) => {
    engine.playIndex(i); setTrackIndex(engine.currentIndex); setMusicOn(true);
  }, [engine]);
  const setVolume = useCallback((v: number) => { engine.setMusicVolume(v); setVolumeState(v); }, [engine]);

  const value: AmbianceState = {
    ready, atmosphereOn, musicOn, sfxOn, ambientOn, volume, trackIndex, reducedMotion, isTouch,
    tracks: TRACKS,
    toggleAtmosphere, toggleMusic, toggleSfx, toggleAmbient, nextTrack, prevTrack, playIndex, setVolume, playSfx,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAmbiance(): AmbianceState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAmbiance must be used within AmbianceProvider");
  return ctx;
}

/** Convenience: returns a stable playSfx fn (safe to call anywhere under the provider). */
export function useSfx() {
  return useAmbiance().playSfx;
}
