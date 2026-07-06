# Reliability: the tool that (almost) never backfires — 2026-06-29

> **2026-07-07 update:** a fresh re-run produced one RDXmin backfire
> (rest-graphql, 173% billed — root-caused and fixed). The claims below are
> scoped to the June suite; combined 20-task ledger and the fix live in
> [`2026-07-07-verify-rerun.md`](./2026-07-07-verify-rerun.md).

The headline number people chase is "fewest tokens on one answer." It's the wrong
metric. caveman wins that race on prose; ponytail wins it on some code. RDXmin
usually places 2nd by a hair. If that were the whole story, you'd pick a specialist.

It isn't. The metric that matters for a real, mixed workload is **downside risk**:
how often does the tool make a response *worse* than using no tool at all? A "be
concise / be lazy" skill that sometimes makes the model write **more** is worse than
useless — it's a tax you can't predict.

## Every task, as % of the no-tool baseline (lower = leaner)

14 tasks, two models (Haiku 4.5 + Sonnet 4.6), spanning code, prose, and
over-engineering-trap "judgment" prompts. Raw cells: [`raw/`](./raw/) +
[`raw-sonnet/`](./raw-sonnet/).

**Metric: billed `usage.output_tokens`** (what you pay — includes model
reasoning), verified reproducible from the committed raw cells 2026-07-07.
On the alternative *visible-answer-size* metric the picture is one notch less
clean: RDXmin's `rest-graphql` (Haiku) answer ran 107% of vanilla's — the lone
visible-size backfire; caveman 101% ×1, ponytail 160% ×4. "0 backfires" is a
billed-tokens claim, stated here so nobody has to diff the metrics themselves.

| task | caveman | ponytail | RDXmin |
|------|--------:|---------:|---------:|
| auth-bug | 80% | 76% | 67% |
| cache | 8% | 16% | 12% |
| debounce | 88% | 53% | 40% |
| pooling | 93% | 119% | 74% |
| regex-concept | **130%** | 113% | 74% |
| rest-graphql | 89% | 112% | 71% |
| deadlock | 43% | 74% | 43% |
| let/const | 57% | 85% | 80% |
| mixed (code+prose) | 71% | 92% | 76% |
| palindrome | 16% | 16% | 22% |
| ratelimit | 81% | 97% | 82% |
| retry | 63% | **227%** | 73% |
| signup | 70% | 98% | 83% |
| thread | 47% | 50% | 46% |
| **worst case** | **130%** | **227%** | **83%** |
| **times > 100%** | **1** | **4** | **0** |

## What this means

- **ponytail backfires often** — 4 of 14 tasks longer than no tool, up to 2.3×
  (the `retry` task: an elaborate ladder triggered ~4× the model reasoning for a
  lean answer). It's the only arm that regularly *costs* you tokens.
- **caveman backfires occasionally** — on `regex-concept` it ran 30% over baseline.
  Rare, but it has no code judgment, so it over-answers a vague request (the
  `caching` task: 330 tokens dumping three implementations vs RDXmin's 151).
- **RDXmin never backfires.** Worst case 83% — still a 17% saving. Best case 12%.
  It's never the single leanest *and* never the loser: always near the front, with
  no failure mode.

## The honest positioning

RDXmin does not beat caveman at pure prose terseness, and doesn't need to. Its
value is being the **dependable generalist**:

| | caveman | ponytail | RDXmin |
|---|:---:|:---:|:---:|
| Terse prose | ✅ best | ❌ pads | ✅ close |
| Lean + correct code judgment | ❌ no ladder | ✅ | ✅ |
| Never worse than baseline | ⚠️ 1× | ❌ 4× | ✅ **0×** |
| One tool, no conflicting 2nd plugin | — | — | ✅ |

To get RDXmin's coverage from the specialists you'd install **both** caveman and
ponytail — which conflict (caveman compresses all prose; ponytail writes verbose
prose), double the per-session injection overhead, and in a head-to-head on the
`ratelimit` task the stacked pair (605 tokens) did *worse* than RDXmin alone (595).

Small sample, two models, temperature variance. Directional. Re-run with
`benchmarks/run-live.sh` and audit the raw cells yourself.
