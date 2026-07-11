"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

// The product, live: a wall of test output gets elided to head + tail + the
// error lines that matter, then the statusline ticks up.
const HEAD = [
  "$ npm test",
  "> jest --runInBand",
  "PASS  src/auth/session.test.ts (1.2s)",
  "PASS  src/auth/token.test.ts (0.8s)",
];
const NOISE_COUNT = 412;
const SALVAGED = [
  "FAIL  src/billing/invoice.test.ts",
  "  ● rounds line items — expected 1042, received 1041",
];
const TAIL = ["Tests: 1 failed, 96 passed, 97 total", "Time: 41.7s"];

export default function Terminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [phase, setPhase] = useState<"idle" | "flood" | "squeeze" | "done">("idle");
  const [flood, setFlood] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setPhase("flood");
    let n = 0;
    const t = setInterval(() => {
      n += 37;
      if (n >= NOISE_COUNT) {
        clearInterval(t);
        setFlood(NOISE_COUNT);
        setTimeout(() => setPhase("squeeze"), 500);
        setTimeout(() => setPhase("done"), 1300);
      } else {
        setFlood(n);
      }
    }, 90);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-28">
      <p className="text-xs tracking-[0.3em] text-amber uppercase">watch it work</p>
      <h2
        className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        400 lines of test output. Two of them matter.
      </h2>
      <p className="mt-4 max-w-xl text-sm text-dim">
        Every tool result you pull in is re-billed on every later turn. The compressor keeps the
        head, the tail, and the error lines — and evicts the rest before the model ever reads it.
      </p>

      <div
        ref={ref}
        className="mt-12 overflow-hidden rounded-xl border border-line bg-[#0d0c0a] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-waste/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-save/70" />
          <span className="ml-3 text-[10px] text-dim">claude code — PostToolUse: Bash</span>
          <span className="ml-auto rounded bg-amber-deep/20 px-1.5 py-0.5 text-[10px] text-amber">
            [RDX]{phase === "done" ? " ⇣9k tok" : ""}
          </span>
        </div>
        <div className="h-72 overflow-hidden p-4 text-xs leading-relaxed">
          {HEAD.map((l) => (
            <div key={l} className="text-dim">{l}</div>
          ))}

          {phase === "flood" && (
            <div className="text-dim/50">
              {Array.from({ length: Math.min(9, Math.ceil(flood / 45)) }).map((_, i) => (
                <div key={i}>
                  PASS  src/{["api", "core", "db", "ui", "jobs"][i % 5]}/spec-{i * 45}.test.ts …
                </div>
              ))}
              <div className="text-dim/40">… {flood} lines and counting …</div>
            </div>
          )}

          {(phase === "squeeze" || phase === "done") && (
            <div
              className={`my-2 rounded border border-dashed px-3 py-2 transition-all duration-700 ${
                phase === "done" ? "border-amber-deep/50 text-amber" : "border-line text-dim/60"
              }`}
            >
              ⋯ {NOISE_COUNT} lines elided — kept head, tail, 2 error lines ⋯
            </div>
          )}

          {(phase === "squeeze" || phase === "done") && (
            <>
              {SALVAGED.map((l) => (
                <div key={l} className="text-waste">{l}</div>
              ))}
              {TAIL.map((l) => (
                <div key={l} className="text-paper">{l}</div>
              ))}
              {phase === "done" && (
                <div className="mt-3 text-save">
                  ✓ 34,120 chars → 612 chars · billed once, saved every turn after
                </div>
              )}
            </>
          )}
          {phase !== "done" && <span className="caret" />}
        </div>
      </div>

      <p className="mt-5 text-xs text-dim/70">
        Deterministic. Zero LLM calls, zero network, zero deps. Kill switch:{" "}
        <code>RDX_COMPRESS=0</code>. Correctness allowlist: Bash, Agent, WebFetch, WebSearch,
        Grep, Glob, <code>mcp__*</code> — never Read/Edit/Write, whose exact bytes feed later
        edits.
      </p>
    </section>
  );
}
