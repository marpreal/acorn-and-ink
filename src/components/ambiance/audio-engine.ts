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

  private howl: Howl | null = null;
  private trackIndex = 0;

  musicOn = false;
  musicVolume = 0.45;
  sfxOn = true;

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

  // ── Howler (the music library) ────────────────────────────────────
  private loadTrack(index: number, autoplay: boolean) {
    this.howl?.unload();
    const n = TRACKS.length || 1;
    this.trackIndex = ((index % n) + n) % n;
    const track = TRACKS[this.trackIndex];
    if (!track) return;
    this.howl = new Howl({
      src: [track.file],
      html5: true,
      volume: this.musicVolume,
      autoplay,
      onend: () => this.next(),
    });
  }

  get currentTrack(): TrackInfo | undefined { return TRACKS[this.trackIndex]; }
  get currentIndex(): number { return this.trackIndex; }

  setMusicOn(on: boolean) {
    this.musicOn = on;
    if (on) {
      if (!this.howl) this.loadTrack(this.trackIndex, true);
      else this.howl.play();
    } else {
      this.howl?.pause();
    }
  }

  next() { this.loadTrack(this.trackIndex + 1, this.musicOn); }
  prev() { this.loadTrack(this.trackIndex - 1, this.musicOn); }

  playIndex(index: number) {
    this.loadTrack(index, true);
    this.musicOn = true;
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    this.howl?.volume(v);
  }

  dispose() {
    this.howl?.unload();
    this.howl = null;
    void this.ctx?.close();
    this.ctx = null;
  }
}

let engineSingleton: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (!engineSingleton) engineSingleton = new AudioEngine();
  return engineSingleton;
}
