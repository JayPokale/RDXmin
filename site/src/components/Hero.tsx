"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

// Filler words drift as particles; every few seconds a sweep drags a batch into
// the compressor point and they vanish — the product, as physics.
const FILLER = [
  "actually", "basically", "just", "really", "simply", "certainly", "of course",
  "in order to", "it's worth noting", "as you can see", "obviously", "happy to help",
  "essentially", "importantly", "furthermore", "to summarize", "in conclusion",
];

type P = { x: number; y: number; vx: number; vy: number; w: string; a: number; dying: boolean };

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ps: P[] = [];

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      w: FILLER[Math.floor(Math.random() * FILLER.length)],
      a: 0.1 + Math.random() * 0.25,
      dying: false,
    });
    for (let i = 0; i < 46; i++) ps.push(spawn());

    let tick = 0;
    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, w, h);
      ctx.font = "13px monospace";

      // every ~4s mark a few for eviction
      if (tick % 240 === 0) {
        for (const p of ps.slice(0, 6 + Math.floor(Math.random() * 5))) p.dying = true;
      }

      const cx = w * 0.5, cy = h * 0.42;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (p.dying) {
          // pull toward compressor point, fade out
          p.x += (cx - p.x) * 0.06;
          p.y += (cy - p.y) * 0.06;
          p.a *= 0.93;
          if (p.a < 0.01) ps[i] = spawn();
          ctx.fillStyle = `rgba(229,72,77,${p.a})`;
        } else {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -80) p.x = w; if (p.x > w + 80) p.x = 0;
          if (p.y < -20) p.y = h; if (p.y > h + 20) p.y = 0;
          ctx.fillStyle = `rgba(143,133,116,${p.a})`;
        }
        ctx.fillText(p.w, p.x, p.y);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}

function CopyCmd() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText("npx rdxmin");
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="group flex items-center gap-3 rounded-lg border border-line bg-panel px-5 py-3 text-left transition-all hover:border-amber-deep hover:shadow-[0_0_32px_rgba(255,160,40,0.12)]"
      aria-label="Copy install command"
    >
      <span className="text-dim">$</span>
      <span className="text-paper">npx rdxmin</span>
      <span className="ml-2 text-xs text-dim transition-colors group-hover:text-amber">
        {copied ? "copied ✓" : "copy"}
      </span>
    </button>
  );
}

const stag = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function Hero() {
  return (
    <header id="top" className="scanlines relative overflow-hidden pt-32 pb-24">
      <ParticleField />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,160,40,0.07),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-5">
        <motion.p custom={0} initial="hidden" animate="show" variants={stag} className="mb-6 text-xs tracking-[0.3em] text-amber uppercase">
          a claude code plugin · measured, not vibes
        </motion.p>
        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={stag}
          className="font-display max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-7xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Write less.
          <br />
          Ship less.
          <br />
          <span className="text-amber">Mean more.</span>
        </motion.h1>
        <motion.p custom={2} initial="hidden" animate="show" variants={stag} className="mt-8 max-w-xl text-sm leading-relaxed text-dim">
          RDXmin cuts Claude Code&apos;s token bill on three axes — how the model{" "}
          <span className="text-paper">writes</span>, what it{" "}
          <span className="text-paper">reads</span>, and how much tool output{" "}
          <span className="text-paper">survives</span> into context. Across 20 live tasks it
          billed <span className="text-save">52% of a bare model</span>. The other token savers
          billed 68% and 80% — and backfired 6× more often.
        </motion.p>
        <motion.div custom={3} initial="hidden" animate="show" variants={stag} className="mt-10 flex flex-wrap items-center gap-4">
          <CopyCmd />
          <a
            href="https://github.com/JayPokale/RDXmin"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-transparent px-5 py-3 text-sm text-dim transition-colors hover:border-line hover:text-amber"
          >
            github →
          </a>
        </motion.div>
        <motion.p custom={4} initial="hidden" animate="show" variants={stag} className="mt-6 text-xs text-dim/70">
          or as a Claude Code plugin:{" "}
          <code className="text-dim">claude plugin marketplace add JayPokale/RDXmin</code>
        </motion.p>
      </div>
    </header>
  );
}
