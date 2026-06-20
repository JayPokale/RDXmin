# Benchmarks

Two layers, because "benchmark" means two different things:

## 1. Deterministic measurement (no API key)

`compare.js` parses the committed `examples/*.md` and measures the reduction
between the no-plugin output and the rdxifier output. Same inputs → identical
numbers every run. This is what you cite when you want a number that can't drift.

```bash
node benchmarks/compare.js          # human-readable table
node benchmarks/compare.js --json   # machine-readable
```

Current result: **74% fewer output tokens** across the four examples. See
[`results/2026-06-29-rdxifier-vs-baseline.md`](./results/2026-06-29-rdxifier-vs-baseline.md).

## 2. Live model comparison (requires API key)

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
