"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const QA = [
  {
    q: "Does terse output mean worse answers?",
    a: "No — terse ≠ incomplete. The rules cut words around the facts, never the facts: the fix, the gotcha, the caveat all stay. In the 20-task benchmark every RDXmin answer was verified correct, and the one task where structure genuinely helped is the one backfire we publish instead of hiding.",
  },
  {
    q: "What's the overhead of the plugin itself?",
    a: "~1.8k tokens of rules injected at session start. It pays for itself within the first few responses; the compressor's savings are pure margin on top.",
  },
  {
    q: "Can the compressor corrupt my files?",
    a: "No. It runs behind a hard allowlist — Bash, Agent, WebFetch, WebSearch, Grep, Glob, mcp__* — and never touches Read, Edit, or Write, whose exact bytes feed later edits. That boundary is what the test suite is for.",
  },
  {
    q: "Does it work outside Claude Code?",
    a: "The ruleset ships to Cursor, Windsurf, Cline, Kiro, and Copilot via generated rule files. Live /rdx level switching, the statusline badge, and the tool-output compressor are Claude Code features (they ride on its hooks).",
  },
  {
    q: "How do I turn it off?",
    a: "Say \"stop rdx\" for the persona, RDX_COMPRESS=0 for the compressor, npx rdxmin --uninstall to remove everything. No lock-in, no residue.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-line bg-panel/40 py-28">
      <div className="mx-auto max-w-3xl px-5">
        <p className="text-xs tracking-[0.3em] text-amber uppercase">faq</p>
        <h2
          className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The questions worth their tokens.
        </h2>
        <div className="mt-12 divide-y divide-line border-y border-line">
          {QA.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm transition-colors hover:text-amber"
                aria-expanded={open === i}
              >
                <span>{item.q}</span>
                <span className={`text-amber transition-transform ${open === i ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-xs leading-relaxed text-dim">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
