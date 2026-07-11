"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

// Verified numbers — benchmarks/results/, 20 live tasks, billed output tokens.
const ARMS = [
  { name: "rdxmin", pct: 52, cls: "bg-amber", note: "1 backfire / 20", self: true },
  { name: "ponytail", pct: 68, cls: "bg-dim/60", note: "6 backfires / 20" },
  { name: "caveman", pct: 80, cls: "bg-dim/60", note: "8 backfires / 20 · worst day 424%" },
  { name: "bare model", pct: 100, cls: "bg-line", note: "baseline" },
];

function Count({ to, run }: { to: number; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 1200);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{v}</>;
}

export default function Benchmarks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="numbers" className="border-y border-line bg-panel/50 py-28">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-xs tracking-[0.3em] text-amber uppercase">receipts, not vibes</p>
        <h2
          className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The 20-task bill, as a share of a bare model.
        </h2>
        <p className="mt-4 max-w-xl text-sm text-dim">
          Four arms, same 20 live tasks, same model, isolated configs, billed tokens. Raw
          transcripts and the runner ship in the repo —{" "}
          <a
            href="https://github.com/JayPokale/RDXmin/tree/main/benchmarks"
            className="text-amber underline decoration-amber-deep/40 underline-offset-4 hover:decoration-amber"
            target="_blank"
            rel="noopener noreferrer"
          >
            rerun them yourself
          </a>
          .
        </p>

        <div ref={ref} className="mt-14 space-y-6">
          {ARMS.map((a, i) => (
            <div key={a.name}>
              <div className="mb-2 flex items-baseline justify-between text-xs">
                <span className={a.self ? "text-amber" : "text-dim"}>
                  {a.name}
                  {a.self && " ← you are here"}
                </span>
                <span className="text-dim">{a.note}</span>
              </div>
              <div className="relative h-9 overflow-hidden rounded border border-line bg-ink">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${a.pct}%` } : {}}
                  transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full ${a.cls} ${a.self ? "shadow-[0_0_24px_rgba(255,160,40,0.35)]" : ""}`}
                />
                <span
                  className={`absolute top-1/2 -translate-y-1/2 text-sm font-bold ${
                    a.self ? "text-ink" : "text-paper"
                  }`}
                  style={{ left: `max(${a.pct - 7}%, 8px)` }}
                >
                  <Count to={a.pct} run={inView} />%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { k: "avg task", v: "69%", s: "vs 91% / 98%" },
            { k: "worst single task", v: "173%", s: "vs 227% / 424%" },
            { k: "tasks that backfired", v: "1/20", s: "vs 6/20 / 8/20" },
          ].map((c) => (
            <div key={c.k} className="rounded-xl border border-line bg-panel p-5">
              <p className="text-[10px] tracking-widest text-dim uppercase">{c.k}</p>
              <p className="mt-2 text-3xl text-amber" style={{ fontFamily: "var(--font-display)" }}>
                {c.v}
              </p>
              <p className="mt-1 text-xs text-dim">{c.s}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-dim/70">
          Compared arms: caveman and ponytail — both credited in the repo&apos;s prior-art table.
          Descendants should beat their parents; this one shows its work.
        </p>
      </div>
    </section>
  );
}
