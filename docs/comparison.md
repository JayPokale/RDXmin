# RDXmin vs caveman vs ponytail

## Why not just use caveman or ponytail?

Use them — they're great, and we tested against them honestly. But each has a failure mode, and RDXmin doesn't.

Across **14 tasks** (code, prose, and vague "judgment" requests; Haiku + Sonnet), measured as % of the no-tool baseline:

| | worst case | times worse than no tool | code judgment |
|---|--:|--:|:--:|
| caveman | 130% | 1 / 14 | ❌ no ladder |
| ponytail | **227%** | **4 / 14** | ✅ |
| **RDXmin** | **83%** | **0 / 14** | ✅ |

**caveman** is a superb prose compressor — a hair leaner than RDXmin on pure-prose prompts — but has no engineering judgment. Asked to *"add caching,"* it dumped three implementations (330 tokens) where RDXmin gave one `@cache` + an upgrade line (151).

**ponytail** has the engineering judgment but pads prose so hard it backfires. On a "retry logic" prompt it ran **227%** of the no-tool baseline. Yes — a "write less" tool, writing more than twice as much. Receipts: [`reliability writeup`](../benchmarks/results/2026-06-29-reliability.md).

**RDXmin never backfired once** (worst case 83% = still a saving). It's not always the single tersest answer; it's the one that never betrays you.

Installing *both* specialists to cover both axes gets you two plugins that fight over prose style and double per-session overhead — and on one task they did *worse* stacked (605t) than RDXmin alone (595t). Full data: [reliability](../benchmarks/results/2026-06-29-reliability.md) · [Sonnet cross-check](../benchmarks/results/2026-06-29-sonnet-cross-check.md).

## `/rdx-audit` — a thing neither specialist has

One pass over a diff, file, or repo that flags **both** over-engineered code *and* bloated prose/docs/comments, ranked biggest-cut-first. ponytail-audit is code-only; caveman has no audit mode. `/rdx-audit` is the union — what a PR reviewer actually wants in one report.

## Detailed benchmark tables

### Per-segment breakdown (Haiku, 6 tasks)

Visible answer size as % of the no-tool baseline, lower = leaner:

| | vanilla | caveman | ponytail | **RDXmin** |
|---|--:|--:|--:|--:|
| **coding** (tokens) | 100% | 46% | 29% | **22%** |
| **coding** (lines) | 100% | 40% | 19% | **14%** |
| **non-coding** (tokens) | 100% | 79% | 121% | **71%** |
| **all 6 tasks** | 100% | 57% | 61% | **39%** |

On coding, RDXmin is leanest (the "add a cache" prompt where vanilla wrote a **150-line** class became **7 lines**). On pure prose, caveman is a hair leaner on a good day — it's a dedicated prose compressor, credit where due.

Full results: [live 4-arm](../benchmarks/results/2026-06-29-live-4arm.md) · [reliability](../benchmarks/results/2026-06-29-reliability.md) · [Sonnet cross-check](../benchmarks/results/2026-06-29-sonnet-cross-check.md).

## FAQ

**Will it golf my code into clever one-liners I'll hate at 3am?**
No. The rule is *necessary*, not *fewest characters*. Boring over clever. Deletion beats addition; obfuscation isn't deletion.

**Does it ever cut corners on safety?**
Never. Input validation, error handling that prevents data loss, security, and accessibility are explicitly off the table. It's lazy about solutions, not about reading the problem.

**It made my answer terse and dropped something I needed!**
File an issue — that's a bug, not the design. Terse ≠ incomplete: keep the fix, cut the fluff. If it dropped the fix, it failed its own rules and we want to know.

**Does it work outside Claude Code?**
Yes — ships to Cursor, Windsurf, Cline, Kiro, Codex, Gemini, and Copilot. Live mode-switching UI (`/rdx`, statusline badge) is Claude-Code-specific; everywhere else the always-on ruleset still applies. See [agent portability](agent-portability.md).

**Why "RDXmin"?**
RDX is a demolition charge. Your token bill is the building. The only thing it detonates is verbosity.
