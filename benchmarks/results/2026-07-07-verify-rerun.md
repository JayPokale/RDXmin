# 2026-07-07 — Independent re-verification + fresh 4-arm re-run

Everything below was recomputed from raw data, not quoted from earlier
writeups. Two mistakes found and fixed; one claim revised.

## 1. June numbers reproduce exactly

Recomputed from the committed raw cells (`raw/` + `raw-sonnet/`, billed
`usage.output_tokens`, 14 four-arm-complete tasks): caveman worst 130%
(regex-concept), ponytail worst 227% (retry, Sonnet), RDXmin worst 83%
(signup, Sonnet), over-baseline counts 1 / 4 / 0. Matches the published
reliability table to the digit.

**Found: metric ambiguity.** On the *visible-answer-size* metric the June data
shows RDXmin over baseline once (rest-graphql, Haiku, 107%). "0 backfires" was
a billed-tokens claim but wasn't labeled as such — now stated explicitly in
the reliability writeup.

**Found: two sources of truth.** `CONTRIBUTING.md` said editing
`skills/rdx/SKILL.md` + regenerating keeps the per-agent rule copies in sync.
False — `scripts/build-rules.js` carries its own condensed BODY; SKILL.md
edits silently propagated nowhere. Fixed (BODY updated + labeled as a manual
mirror).

## 2. Fresh 24-cell re-run (Haiku 4.5, 2026-07-07, `raw-verify/`)

Same 6 tasks × 4 arms, competitor skills taken from their **installed plugins**
(`caveman@caveman`, `ponytail@ponytail` via plugin cache), arms run in
parallel per task. Billed output tokens as % of vanilla:

| segment | caveman | ponytail | RDXmin |
|---|--:|--:|--:|
| coding | 160% | 84% | **64%** |
| noncoding | 137% | 106% | 117% |
| all | **154%** | 89% | **78%** |

Per-arm backfires (billed > vanilla): **caveman 5/6** (worst: `cache` at
**424%** — 206 lines of speculative implementations for a one-line ask),
**ponytail 4/6** (worst 119%), **RDXmin 1/6** (`rest-graphql`, 173%).

**Correctness: 24/24 answers graded correct.** All four arms found the
auth-bug boundary fix; on `cache`/`debounce` in an empty directory,
ponytail + RDXmin correctly asked for the codebase (ladder rung 1) instead of
dumping code — caveman's 424% is exactly the no-code-judgment failure mode.

### Combined ledger, June + July (20 tasks, billed tokens)

| | worst case | times > vanilla |
|---|--:|--:|
| caveman | **424%** | 6 / 20 |
| ponytail | 227% | 8 / 20 |
| **RDXmin** | **173%** | **1 / 20** |

The June "never backfires (0/14)" claim did not survive the re-run and is
retired. The honest replacement: RDXmin backfired once in 20 tasks;
the specialists backfired 6× and 8×, with far worse blowups.

## 3. The one backfire, diagnosed and fixed

RDXmin's `rest-graphql` answer (22 lines) used headed pro/con bullet walls +
"Pick REST if / Pick GraphQL if" scaffolding — structure its own ruleset
explicitly bans. The rule was too weak for "summarize/compare" prompts.
Fix: SKILL.md structure rule now names the comparison-prompt trap with the
measured consequence.

**Validation** (3 trials each, same day, same model): vanilla mean **487**
billed tokens (341/474/645 — the original 410 baseline was a lucky draw);
hardened RDXmin mean **453 = 93%** (407/455/498), answer prose-form, complete,
correct. Pre-fix RDXmin: 708 = 145% of the fair vanilla mean.

## Caveats

n=6 tasks per fresh run, n=3 validation trials, one model, temperature > 0.
Cell-level numbers wobble hard (vanilla's own spread on one task was
341–645). Segment aggregates and backfire *patterns* are the signal;
any single percentage is not.
