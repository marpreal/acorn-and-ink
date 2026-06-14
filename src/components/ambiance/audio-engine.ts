// The library's voice: forest music (Howler) + a tiny procedural synth (Web Audio)
// that conjures page-turns, sparkles and wooden chimes with no sound files at all.
// The music library itself is generated into src/lib/tracks.ts by scripts/import-music.mjs.

import { Howl } from "howler";
import { TRACKS, type Track } from "@/lib/tracks";

export type TrackInfo = Track;
export { TRACKS };

export type SfxName =
  | "page" | "sparkle" | "chime" | "tap" | "hover"
  | "success" | "error" | "open" | "close";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private delay: DelayNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Ambient bed: synthesized rain + the odd frog croak (no sound files).
  private ambientGain: GainNode | null = null;
  private rainSrc: AudioBufferSourceNode | null = null;
  private rainBuffer: AudioBuffer | null = null;
  private frogTimer: ReturnType<typeof setTimeout> | null = null;
  private cricketTimer: ReturnType<typeof setTimeout> | null = null;

  private howl: Howl | null = null;
  private trackIndex = 0;

  musicOn = false;
  musicVolume = 0.45;
  sfxOn = true;
  ambientOn = false;
  ambientVolume = 0.55;

  /** Fired whenever the current track or play state changes (for the React UI). */
  onChange: (() => void) | null = null;

  // ── Web Audio (SFX) ───────────────────────────────────────────────
  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.3;

      this.delay = this.ctx.createDelay(1.0);
      this.delay.delayTime.value = 0.16;
      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.25;
      const wet = this.ctx.createGain();
      wet.gain.value = 0.35;
      this.delay.connect(feedback).connect(this.delay);
      this.delay.connect(wet).connect(this.sfxGain);

      this.sfxGain.connect(this.ctx.destination);

      const len = Math.floor(this.ctx.sampleRate * 0.4);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  unlock() { this.ensureCtx(); }

  private tone(opts: {
    freq: number; type?: OscillatorType; start?: number; dur: number;
    gain?: number; toFreq?: number; shimmer?: boolean;
  }) {
    const ctx = this.ctx; if (!ctx || !this.sfxGain) return;
    const t0 = ctx.currentTime + (opts.start ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.toFreq) osc.frequency.exponentialRampToValueAtTime(opts.toFreq, t0 + opts.dur);
    const peak = opts.gain ?? 0.3;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(g).connect(this.sfxGain);
    if (opts.shimmer && this.delay) g.connect(this.delay);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.05);
  }

  private noise(opts: { start?: number; dur: number; gain?: number; cutoff?: number; sweepTo?: number }) {
    const ctx = this.ctx; if (!ctx || !this.sfxGain || !this.noiseBuffer) return;
    const t0 = ctx.currentTime + (opts.start ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(opts.cutoff ?? 1800, t0);
    if (opts.sweepTo) filter.frequency.exponentialRampToValueAtTime(opts.sweepTo, t0 + opts.dur);
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.15, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start(t0);
    src.stop(t0 + opts.dur + 0.05);
  }

  playSfx(name: SfxName) {
    if (!this.sfxOn) return;
    if (!this.ensureCtx()) return;
    switch (name) {
      case "hover": this.tone({ freq: 1320, type: "sine", dur: 0.09, gain: 0.05 }); break;
      case "tap":
        this.tone({ freq: 320, type: "triangle", dur: 0.12, gain: 0.16, toFreq: 180 });
        this.noise({ dur: 0.05, gain: 0.05, cutoff: 2600 }); break;
      case "page": this.noise({ dur: 0.22, gain: 0.16, cutoff: 1200, sweepTo: 3200 }); break;
      case "open": [392, 523.25, 659.25].forEach((f, i) => this.tone({ freq: f, type: "triangle", start: i * 0.05, dur: 0.5, gain: 0.12, shimmer: true })); break;
      case "close": [659.25, 523.25, 392].forEach((f, i) => this.tone({ freq: f, type: "triangle", start: i * 0.05, dur: 0.4, gain: 0.1, shimmer: true })); break;
      case "sparkle": [1046, 1318, 1568, 2093].forEach((f, i) => this.tone({ freq: f, type: "sine", start: i * 0.045, dur: 0.32, gain: 0.08, shimmer: true })); break;
      case "chime":
        this.tone({ freq: 587.33, type: "sine", dur: 1.2, gain: 0.14, shimmer: true });
        this.tone({ freq: 1174.66, type: "sine", dur: 0.9, gain: 0.05, shimmer: true }); break;
      case "success": [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone({ freq: f, type: "triangle", start: i * 0.08, dur: 0.6, gain: 0.12, shimmer: true })); break;
      case "error":
        this.tone({ freq: 220, type: "sawtooth", dur: 0.28, gain: 0.1, toFreq: 180 });
        this.tone({ freq: 233, type: "sine", dur: 0.3, gain: 0.06 }); break;
    }
  }

  // ── Ambient bed: rain + frogsong (synthesized) ────────────────────
  private ensureAmbient(): AudioContext | null {
    const ctx = this.ensureCtx();
    if (!ctx) return null;
    if (!this.ambientGain) {
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.value = 0;
      this.ambientGain.connect(ctx.destination);
      // layered noise buffers for a softer rain bed
      const len = Math.floor(ctx.sampleRate * 3);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = last * 0.96 + white * 0.04;
        data[i] = last * 1.4 + white * 0.25;
      }
      this.rainBuffer = buf;
    }
    return ctx;
  }

  private startRain() {
    const ctx = this.ctx;
    if (!ctx || !this.ambientGain || !this.rainBuffer || this.rainSrc) return;
    const src = ctx.createBufferSource();
    src.buffer = this.rainBuffer;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 280;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    lp.Q.value = 0.35;
    const rg = ctx.createGain();
    rg.gain.value = 0.42;
    src.connect(hp).connect(lp).connect(rg).connect(this.ambientGain);
    src.start();
    this.rainSrc = src;
  }

  private stopRain() {
    try { this.rainSrc?.stop(); } catch {}
    this.rainSrc?.disconnect();
    this.rainSrc = null;
  }

  private frogCroak(deep = false) {
    const ctx = this.ctx;
    if (!ctx || !this.ambientGain) return;
    const t0 = ctx.currentTime;
    const base = deep ? 55 + Math.random() * 35 : 95 + Math.random() * 70;
    const osc = ctx.createOscillator();
    osc.type = deep ? "square" : "sawtooth";
    osc.frequency.setValueAtTime(base, t0);
    if (!deep) osc.frequency.exponentialRampToValueAtTime(base * 0.82, t0 + 0.18);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = base * (deep ? 3.2 : 4.5);
    bp.Q.value = deep ? 3 : 4;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    osc.connect(bp).connect(g).connect(this.ambientGain);
    const pulses = deep ? 3 + Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 5);
    const step = deep ? 0.07 : 0.05;
    const peak = deep ? 0.09 : 0.11;
    for (let i = 0; i < pulses; i++) {
      const t = t0 + i * step;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.85);
    }
    osc.start(t0);
    osc.stop(t0 + pulses * step + 0.1);
  }

  private cricketChirp() {
    const ctx = this.ctx;
    if (!ctx || !this.ambientGain) return;
    const t0 = ctx.currentTime;
    const freq = 4200 + Math.random() * 1800;
    const chirps = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < chirps; i++) {
      const t = t0 + i * 0.045;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq + Math.random() * 400, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);
      osc.connect(g).connect(this.ambientGain);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  private scheduleFrog() {
    if (!this.ambientOn) return;
    const delay = 1400 + Math.random() * 3800;
    this.frogTimer = setTimeout(() => {
      this.frogCroak(Math.random() < 0.35);
      this.scheduleFrog();
    }, delay);
  }

  private scheduleCricket() {
    if (!this.ambientOn) return;
    const delay = 900 + Math.random() * 2200;
    this.cricketTimer = setTimeout(() => {
      this.cricketChirp();
      this.scheduleCricket();
    }, delay);
  }

  setAmbientOn(on: boolean) {
    this.ambientOn = on;
    if (on) {
      const ctx = this.ensureAmbient();
      if (!ctx || !this.ambientGain) return;
      this.startRain();
      const g = this.ambientGain.gain;
      g.cancelScheduledValues(ctx.currentTime);
      g.setValueAtTime(Math.max(g.value, 0.0001), ctx.currentTime);
      g.linearRampToValueAtTime(this.ambientVolume, ctx.currentTime + 1.4);
      this.scheduleFrog();
      this.scheduleCricket();
    } else {
      if (this.frogTimer) { clearTimeout(this.frogTimer); this.frogTimer = null; }
      if (this.cricketTimer) { clearTimeout(this.cricketTimer); this.cricketTimer = null; }
      if (this.ctx && this.ambientGain) {
        const ctx = this.ctx;
        const g = this.ambientGain.gain;
        g.cancelScheduledValues(ctx.currentTime);
        g.setValueAtTime(g.value, ctx.currentTime);
        g.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        setTimeout(() => this.stopRain(), 700);
      } else {
        this.stopRain();
      }
    }
  }

  setAmbientVolume(v: number) {
    this.ambientVolume = v;
    if (this.ambientOn && this.ctx && this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.2);
    }
  }

  // ── Howler (the music library) ────────────────────────────────────
  private unloadCurrent() {
    if (!this.howl) return;
    this.howl.stop();
    this.howl.off();
    this.howl.unload();
    this.howl = null;
  }

  private loadTrack(index: number, autoplay: boolean) {
    const n = TRACKS.length || 1;
    const nextIndex = ((index % n) + n) % n;
    const track = TRACKS[nextIndex];
    if (!track) return;

    if (nextIndex === this.trackIndex && this.howl) {
      if (autoplay && !this.howl.playing()) void this.howl.play();
      this.onChange?.();
      return;
    }

    this.unloadCurrent();
    this.trackIndex = nextIndex;

    this.howl = new Howl({
      src: [track.file],
      html5: true,
      volume: this.musicVolume,
      onload: () => {
        if (autoplay && this.musicOn) void this.howl?.play();
      },
      onloaderror: (_id, err) => console.warn("Track load failed:", track.file, err),
      onplayerror: () => {
        this.musicOn = false;
        this.onChange?.();
      },
      onend: () => this.next(),
      onplay: () => this.onChange?.(),
      onpause: () => this.onChange?.(),
    });
    this.onChange?.();
  }

  get currentTrack(): TrackInfo | undefined { return TRACKS[this.trackIndex]; }
  get currentIndex(): number { return this.trackIndex; }
  get playing(): boolean { return !!this.howl?.playing(); }

  position(): number { const p = this.howl?.seek(); return typeof p === "number" ? p : 0; }
  duration(): number { const d = this.howl?.duration(); return typeof d === "number" ? d : 0; }
  seekTo(sec: number) { this.howl?.seek(sec); }

  setMusicOn(on: boolean) {
    this.musicOn = on;
    if (on) {
      if (!this.howl) this.loadTrack(this.trackIndex, true);
      else this.howl.play();
    } else {
      this.howl?.pause();
    }
    this.onChange?.();
  }

  next() { this.loadTrack(this.trackIndex + 1, this.musicOn); }
  prev() { this.loadTrack(this.trackIndex - 1, this.musicOn); }

  playIndex(index: number) {
    this.musicOn = true;
    this.loadTrack(index, true);
    this.onChange?.();
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    this.howl?.volume(v);
  }

  dispose() {
    this.unloadCurrent();
    if (this.frogTimer) { clearTimeout(this.frogTimer); this.frogTimer = null; }
    if (this.cricketTimer) { clearTimeout(this.cricketTimer); this.cricketTimer = null; }
    this.stopRain();
    void this.ctx?.close();
    this.ctx = null;
  }
}

let engineSingleton: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (!engineSingleton) engineSingleton = new AudioEngine();
  return engineSingleton;
}
