# Sonnet cross-check + engineering-judgment test — 2026-06-29

A second, smaller benchmark on **Sonnet 4.6** (the main one is Haiku), focused on
the question: is RDXifier genuinely better than caveman and ponytail, or just a
compromise? Raw cells: [`raw-sonnet/`](./raw-sonnet/). Same isolation rig as
`run-live.sh` (only the injected system prompt varies).

## 1. Small prose prompts — caveman's home turf

Billed output tokens, % of vanilla baseline (lower = leaner):

| task | vanilla | caveman | ponytail | RDXifier |
|------|--------:|--------:|---------:|---------:|
| palindrome (one-liner) | 80 | 13 | 13 | 18 |
| deadlock (concept) | 403 | 175 | 300 | **174** |
| let vs const (concept) | 209 | 119 | 178 | 167 |
| **total** | **692** | **307 (44%)** | **491 (71%)** | **359 (52%)** |

**Honest read:** caveman wins raw token count on pure prose — it's a dedicated prose
compressor and this is its specialty. RDXifier is a close 2nd (52% vs 44%) and **beats
caveman on `deadlock`** (174 vs 175) *while keeping the fix* ("consistent lock ordering")
that caveman omits. ponytail is worst on prose (71%) — it pads explanations. The
sharpened prose rules moved RDXifier from 59% → 52% vs the prior skill version.

## 2. Engineering judgment — RDXifier's decisive win

Prompt: *"Add caching to this Python function so repeated calls with the same user_id
don't re-hit the DB."* The right YAGNI answer is one stdlib decorator.

| arm | tokens | what it did |
|-----|-------:|-------------|
| caveman | 330 | Dumped **three** implementations (lru_cache + manual dict + cachetools TTL) — terse prose, but no judgment about which to use |
| **RDXifier** | **151** | One answer: `@cache`, with a one-line upgrade path for eviction/TTL |

**RDXifier used less than half the tokens AND made the better engineering call.** This is
the gap caveman can't close: it shortens text but has no YAGNI ladder, so on a code
decision it over-answers. ponytail would make the same lean call but pads the surrounding
prose.

## Verdict

| | caveman | ponytail | RDXifier |
|---|:---:|:---:|:---:|
| Lean on prose | ✅ (best) | ❌ pads | ✅ (close 2nd) |
| Lean + correct on code judgment | ❌ over-answers | ✅ | ✅ (best, 151 vs 330) |
| Keeps the decisive fact | ❌ sometimes drops | — | ✅ |
| **Has a failure mode** | **yes (code)** | **yes (prose)** | **no** |

caveman is the better *pure prose* compressor by a small margin. But it has no engineering
judgment, and ponytail pads prose. **RDXifier is the only arm that's lean on both axes** —
which is what wins a real mixed workload of code + explanation.

Sample is small (Sonnet, a handful of prompts, temperature variance). Directional, not a
leaderboard. Audit the raw cells yourself.
