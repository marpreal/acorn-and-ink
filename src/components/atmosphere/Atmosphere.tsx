"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAmbiance } from "@/components/ambiance/ambiance-context";

/* The candle that lights your way: a flame follows the pointer, pooling warm
   light over the page and scattering sparks when you press. */
function CandleCursor({ lively }: { lively: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const flame = flameRef.current;
    if (!canvas || !flame) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const resize = () => {
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = vw * dpr; canvas.height = vh * dpr;
      canvas.style.width = vw + "px"; canvas.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: vw / 2, y: vh / 2 };
    const pos = { x: pointer.x, y: pointer.y };
    let lastX = pos.x, lastY = pos.y;

    type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; hue: number };
    const sparks: Spark[] = [];

    const spawn = (n: number, power: number, x: number, y: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * power;
        sparks.push({
          x, y,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.4,
          life: 0, max: 40 + Math.random() * 40,
          size: 1 + Math.random() * 2.2,
          hue: 38 + Math.random() * 18,
        });
      }
    };

    const onMove = (e: PointerEvent) => { pointer.x = e.clientX; pointer.y = e.clientY; };
    const onDown = (e: PointerEvent) => { if (lively) spawn(16, 4, e.clientX, e.clientY); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", resize);

    let raf = 0;
    const frame = () => {
      pos.x += (pointer.x - pos.x) * 0.2;
      pos.y += (pointer.y - pos.y) * 0.2;
      const speed = Math.hypot(pos.x - lastX, pos.y - lastY);
      lastX = pos.x; lastY = pos.y;

      flame.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

      if (lively && speed > 1.5 && Math.random() < 0.5) spawn(1, 1.2, pos.x, pos.y - 6);

      ctx.clearRect(0, 0, vw, vh);

      // warm pool of candlelight
      const r = 200;
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r);
      glow.addColorStop(0, "rgba(255, 226, 150, 0.18)");
      glow.addColorStop(0.4, "rgba(255, 184, 92, 0.08)");
      glow.addColorStop(1, "rgba(255, 170, 80, 0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.fill();

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life++;
        p.vy += 0.04; // gentle gravity
        p.vx *= 0.96; p.vy *= 0.97;
        p.x += p.vx; p.y += p.vy;
        const t = 1 - p.life / p.max;
        if (t <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `hsla(${p.hue}, 95%, ${60 + t * 25}%, ${t})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resize);
    };
  }, [lively]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="fixed inset-0 z-[60] pointer-events-none" />
      <div
        ref={flameRef}
        aria-hidden
        className="fixed left-0 top-0 z-[61] pointer-events-none"
        style={{ width: 0, height: 0 }}
      >
        <div
          className={lively ? "anim-flicker" : ""}
          style={{
            position: "absolute",
            left: -7, top: -22,
            width: 14, height: 22,
            borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%",
            background:
              "radial-gradient(60% 55% at 50% 62%, #fff7e6 0%, #ffe39a 28%, #ffae4d 55%, rgba(255,120,40,0.5) 78%, rgba(255,90,30,0) 100%)",
            filter: "blur(0.4px) drop-shadow(0 0 10px rgba(255,184,92,0.9))",
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -2.5, top: -3,
            width: 5, height: 5,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fff 0%, #ffd27a 60%, rgba(255,180,90,0) 100%)",
          }}
        />
      </div>
    </>
  );
}

function Fireflies({ count = 22 }: { count?: number }) {
  const flies = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 3,
        dur: 2 + Math.random() * 3,
        fdur: 6 + Math.random() * 8,
        delay: Math.random() * 6,
        hue: Math.random() < 0.7 ? "#f5c451" : "#9fe0c0",
      })),
    [count]
  );
  return (
    <div aria-hidden className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
      {flies.map((f) => (
        <span
          key={f.id}
          className="absolute anim-floaty"
          style={{ left: `${f.left}%`, top: `${f.top}%`, animationDuration: `${f.fdur}s`, animationDelay: `${f.delay}s` }}
        >
          <span
            className="block anim-twinkle"
            style={{
              width: f.size, height: f.size, borderRadius: "50%",
              background: f.hue,
              boxShadow: `0 0 ${f.size * 3}px ${f.size}px ${f.hue}`,
              animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

function FallingLeaves({ count = 12 }: { count?: number }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        dur: 9 + Math.random() * 12,
        delay: Math.random() * 14,
        drift: (Math.random() * 120 - 30).toFixed(0),
        glyph: ["🍂", "🍁", "🍃"][Math.floor(Math.random() * 3)],
        size: 12 + Math.random() * 12,
        op: 0.5 + Math.random() * 0.4,
      })),
    [count]
  );
  return (
    <div aria-hidden className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {leaves.map((l) => (
        <span
          key={l.id}
          style={{
            position: "absolute",
            left: `${l.left}%`,
            top: 0,
            fontSize: l.size,
            opacity: l.op,
            // @ts-expect-error custom prop consumed by the drift keyframe
            "--drift-x": `${l.drift}px`,
            animation: `drift ${l.dur}s linear ${l.delay}s infinite`,
          }}
        >
          {l.glyph}
        </span>
      ))}
    </div>
  );
}

export default function Atmosphere() {
  const { atmosphereOn, reducedMotion, isTouch, ready } = useAmbiance();
  if (!ready || !atmosphereOn) return null;
  return (
    <>
      {/* canopy shadow + vignette to deepen the glade */}
      <div
        aria-hidden
        className="fixed inset-0 z-[0] pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 120%, transparent 55%, rgba(0,0,0,0.55) 100%)," +
            "radial-gradient(90% 60% at 50% -10%, rgba(40,60,38,0.5), transparent 60%)",
        }}
      />
      {!reducedMotion && <Fireflies />}
      {!reducedMotion && <FallingLeaves />}
      {!isTouch && <CandleCursor lively={!reducedMotion} />}
    </>
  );
}
