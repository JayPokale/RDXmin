# Benchmarks

## 1. Live 4-arm head-to-head (the real one)

`run-live.sh` drives the authenticated `claude` CLI across four arms — vanilla
(no tool), caveman, ponytail, rdxifier — over 6 tasks (3 coding, 3 non-coding).
Each arm differs **only** in the system prompt injected; plugins, tone hooks, and
personal config are neutralized via an isolated `HOME` + config dir holding only
credentials. Raw model outputs are committed under `results/raw/` for audit.

```bash
bash benchmarks/run-live.sh                       # 24 runs → results/raw/*.json (resumable)
node benchmarks/aggregate.js                       # comparison tables
node benchmarks/aggregate.js --json > results/summary.json   # freeze for the chart
node scripts/build-chart.js                        # regenerate assets/benchmark.svg
```

Headline (visible answer tokens as % of vanilla): **coding** — rdxifier 14%,
ponytail 29%, caveman 46%. **non-coding** — caveman 79%, rdxifier 96%, ponytail
121%. Full writeup: [`results/2026-06-29-live-4arm.md`](./results/2026-06-29-live-4arm.md).

rdxifier is leanest on code; on pure prose a dedicated prose compressor wins. The
chart and README state this plainly — no cherry-picking.

## 2. promptfoo config (alternative live runner, requires API key)

`promptfooconfig.yaml` runs the same prompts through a real model across three
arms — baseline (no plugin), rdxifier, and (optionally) the parent-style
prose-only and code-only modes — then measures output length and an LLM-judged
correctness score. Output quality varies run to run (temperature > 0), so treat
these as directional, not exact.

```bash
npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml
```

You provide the system prompt for each arm from `arms/`. The rdxifier arm uses
the contents of `skills/rdxifier/SKILL.md` as its system prompt.

## What we measure

| Metric | Layer | Why |
|--------|-------|-----|
| Output tokens | both | The headline cost number |
| Word count | deterministic | Prose-only proxy, language-agnostic |
| Lines of code | deterministic | YAGNI proxy — fewer lines = less to maintain |
| Correctness | live | A short answer that's wrong is not a win |

The correctness gate matters: compression is only a benefit if the answer still
solves the task. An arm that's 90% shorter but fails the task scores zero.
