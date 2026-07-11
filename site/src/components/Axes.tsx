"use client";

import { motion } from "motion/react";

const AXES = [
  {
    n: "01",
    name: "The persona",
    what: "How the model writes",
    body: "Terse senior-dev voice: fragments over sentences, YAGNI-first code, the efficiency ladder — reuse, stdlib, platform, one-liner — before new code. Three levels: /rdx lite · full · ultra. Commits and security warnings stay fully verbose, on purpose.",
    tag: "the axis caveman & ponytail pioneered",
  },
  {
    n: "02",
    name: "The compressor",
    what: "What survives into context",
    body: "A PostToolUse hook squeezes tool results before the model reads them: ANSI scrub, head + tail elide that salvages error lines, same-session dedup. Tool output is 67.5% of a session and re-bills every later turn — this evicts it once. Behind a correctness allowlist: never touches Read, Edit, or Write.",
    tag: "the axis nobody else has",
  },
  {
    n: "03",
    name: "The context diet",
    what: "What gets read at all",
    body: "Rules that teach the model to fetch the slice, not the file: grep first, Read with offset/limit, filter long output at the source, never re-read what's already in context. Prevention for the whale the compressor must not touch.",
    tag: "prevention over cleanup",
  },
];

export default function Axes() {
  return (
    <section id="axes" className="mx-auto max-w-6xl px-5 py-28">
      <p className="text-xs tracking-[0.3em] text-amber uppercase">the three axes</p>
      <h2
        className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Other token savers push on one lever. There are three.
      </h2>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {AXES.map((a, i) => (
          <motion.article
            key={a.n}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className="group relative rounded-xl border border-line bg-panel p-6 transition-colors hover:border-amber-deep/60"
          >
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(255,160,40,0.06),transparent_65%)]" />
            <div className="flex items-baseline justify-between">
              <span className="text-4xl text-line transition-colors group-hover:text-amber-deep" style={{ fontFamily: "var(--font-display)" }}>
                {a.n}
              </span>
              <span className="text-[10px] tracking-widest text-dim uppercase">{a.what}</span>
            </div>
            <h3 className="mt-5 text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {a.name}
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-dim">{a.body}</p>
            <p className="mt-5 text-[10px] tracking-widest text-amber/70 uppercase">→ {a.tag}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
