# RDXifier vs baseline — 2026-06-29

Deterministic measurement from `examples/*.md` via `node benchmarks/compare.js`.
Reproducible: same inputs, identical numbers every run.

## Token reduction (baseline → rdxifier)

| Example | Before (tok) | After (tok) | Words ↓ | Tokens ↓ | Lines ↓ |
|---------|-------------:|------------:|--------:|---------:|--------:|
| api-cache | 358 | 121 | 61% | 66% | 65% |
| auth-middleware | 397 | 125 | 60% | 69% | 69% |
| debounce | 716 | 111 | 82% | 84% | 85% |
| react-state | 406 | 135 | 66% | 67% | 64% |
| **Overall** | **1877** | **492** | — | **74%** | — |

Token estimate: `chars / 4` (standard English+code heuristic). Numbers are stable
because they're computed from fixed sample outputs, not live model calls.

## How rdxifier compares to prose-only and code-only modes

RDXifier compresses on two axes at once. Prose-only and code-only tools each
move one. This is a conceptual comparison of what each axis targets, not a
head-to-head quality claim — run `promptfooconfig.yaml` for live numbers.

| Capability | Prose-only mode | Code-only mode | RDXifier |
|------------|:---------------:|:--------------:|:--------:|
| Drops filler / hedging in prose | ✅ | ❌ | ✅ |
| Compresses explanations | ✅ | ❌ | ✅ |
| YAGNI ladder on code | ❌ | ✅ | ✅ |
| Stdlib / native-first | ❌ | ✅ | ✅ |
| Deletes speculative abstractions | ❌ | ✅ | ✅ |
| Single plugin, both axes | ❌ | ❌ | ✅ |

On the `debounce` example the two axes compound: the prose collapses (890 → ~40
words) **and** the code collapses (116 → 8 lines), for an 84% token cut. A
prose-only tool would leave the 116-line implementation; a code-only tool would
leave the "Sure! I'd be happy to help..." preamble.

## Caveats

- Token counts are estimates (`chars/4`), not a real tokenizer. Directionally
  accurate; not exact per-model.
- The example outputs are representative, not captured from a single pinned
  benchmark run. The *measurement* is reproducible; the *sample text* is curated.
- Correctness is not measured in the deterministic layer — see the live harness.
