<p align="center">
  <img src="assets/logo.svg" width="120" alt="RDXifier">
</p>

<h1 align="center">🧨 RDXifier</h1>

<p align="center">
  <em>Your AI talks less, builds less, and somehow says more. Like a senior dev who bills by the syllable.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-pre--release-d78a3c?style=flat-square" alt="Pre-release">
  <img src="https://img.shields.io/badge/works%20with-8%20agents-d78a3c?style=flat-square" alt="Works with 8 agents">
  <img src="https://img.shields.io/badge/tests-34%20passing-2da44e?style=flat-square" alt="34 tests">
  <img src="https://img.shields.io/badge/deps-0-2da44e?style=flat-square" alt="Zero deps">
  <img src="https://img.shields.io/badge/backfires-0%2F14-2da44e?style=flat-square" alt="0 backfires">
  <img src="https://img.shields.io/badge/license-MIT-d78a3c?style=flat-square" alt="MIT">
</p>

<p align="center">
  <strong>The only AI efficiency tool that never makes things worse &middot; prose AND code &middot; one command</strong>
</p>

---

🧨 You asked your AI agent to "add a cache." In our actual benchmark, a bare agent answered
with a **150-line** cache class — config object, TTL logic, stats counters, the works.
RDXifier's answer to the same prompt: **7 lines.** Same model, same question, measured, receipts
committed in [`benchmarks/`](benchmarks/results/).

RDXifier is the tool that makes that stop.

There are two excellent specialists already: **[caveman](https://github.com/JuliusBrussee/caveman)**
compresses prose like it's being charged per vowel, and **[ponytail](https://github.com/DietrichGebert/ponytail)**
deletes code like it has a personal vendetta against line 117. Both are great. Both also have a
catch we measured: caveman has zero engineering judgment (ask it to "add caching" and it hands
you *three* implementations and a shrug — 330 tokens to RDXifier's 151), and ponytail pads prose
so enthusiastically that on one prompt it ran **227% of the no-tool baseline**. Yes — a "write
less" tool, writing more. 🔥 Receipts: [↓](#why-not-just-use-caveman-or-ponytail).

RDXifier does both axes at once and — across **14 measured tasks on two models** — is the only
one of the three that **never once backfired**. It's not always the single tersest answer. It's
the one that never betrays you. The Toyota Corolla of efficiency skills: not the flashiest, just
the one that always starts.

## What it does

**Zero-fluff prose** — drops articles, filler, pleasantries, hedging. Fragments OK.
Technical terms stay exact. Code blocks unchanged. Pattern: `[thing] [action] [reason].`

**Efficiency-first code** — runs the YAGNI ladder before writing anything: does this need to
exist? → stdlib? → one line? → *fine,* the minimum that works. Stdlib over deps, native over
JS, deletion over addition, and a `// rdx:` comment whenever it takes a deliberate shortcut so
"later" doesn't quietly become "never."

## 🧨 Numbers

No hand-wavy "up to 90%!" marketing math here. This is **59 live model runs** across
14 tasks — 4 arms (no tool, [caveman](https://github.com/JuliusBrussee/caveman),
[ponytail](https://github.com/DietrichGebert/ponytail), RDXifier) on Haiku **and** Sonnet,
each arm differing *only* in the injected system prompt. Every raw answer is committed so
you can call us liars with evidence. Here's the chart that matters — each tool's **worst
case** across all 14 tasks:

<p align="center">
  <img src="assets/benchmark.svg" width="820" alt="Worst-case output size across 14 tasks as percent of the no-tool baseline. ponytail 227% (backfired on 4 tasks), caveman 130% (1 task), RDXifier 83% (never backfires).">
</p>

Read that again: ponytail, a tool whose entire job is *writing less code*, has a worst case
of **227%** — more than double what you'd get by using nothing. caveman creeps over the line
once. RDXifier's worst day is still a 17% discount. It is, statistically, incapable of wasting
your tokens. (We tried. It wouldn't.)

<details>
<summary><strong>"But who wins on a good day?"</strong> — the per-segment breakdown (Haiku, 6 tasks)</summary>

Visible answer size as % of the no-tool baseline, lower = leaner:

| | vanilla | caveman | ponytail | **RDXifier** |
|---|--:|--:|--:|--:|
| **coding** (tokens) | 100% | 46% | 29% | **22%** |
| **coding** (lines) | 100% | 40% | 19% | **14%** |
| **non-coding** (tokens) | 100% | 79% | 121% | **71%** |
| **all 6 tasks** | 100% | 57% | 61% | **39%** |

On coding, RDXifier is leanest (the "add a cache" prompt where vanilla wrote a **150-line**
class became **7 lines**). On pure prose, caveman is a hair leaner on a *good* day (44% vs
52% on tiny prompts) — it's a dedicated prose compressor, and credit where due. RDXifier's
whole pitch is that it doesn't *have* a bad day. Full tables:
[live 4-arm](benchmarks/results/2026-06-29-live-4arm.md) ·
[reliability](benchmarks/results/2026-06-29-reliability.md). Reproduce:
`bash benchmarks/run-live.sh`.

</details>

Small sample, two models, temperature wobble. Directional, not gospel — but it's *measured*,
which already puts it ahead of most READMEs.

### Why not just use caveman or ponytail?

Because each has a failure mode, and RDXifier doesn't. Across **14 tasks** (code, prose,
and vague "judgment" requests; Haiku + Sonnet), measured as % of the no-tool baseline:

| | worst case | times it made the answer **worse** than no tool | code judgment |
|---|--:|--:|:--:|
| caveman | 130% | 1 / 14 | ❌ no ladder |
| ponytail | **227%** | **4 / 14** | ✅ |
| **RDXifier** | **83%** | **0 / 14** | ✅ |

caveman is a superb *prose* compressor (a hair leaner than RDXifier on pure prose) but has
**no engineering judgment** — asked to *"add caching,"* it dumped three implementations (330
tokens) where RDXifier gave one `@cache` + an upgrade line (151). ponytail has the judgment
but **pads prose so hard it backfires** — on a "retry logic" prompt it ran **227%** of the
no-tool baseline.

**RDXifier never backfired once** (worst case 83% = still a saving). It's rarely the single
tersest answer and never the loser — the dependable generalist. To get its both-axes coverage
from the specialists you'd install *both*, which conflict and double the per-session overhead;
stacked on one task they did *worse* (605t) than RDXifier alone (595t). Full data:
[reliability writeup](benchmarks/results/2026-06-29-reliability.md) ·
[Sonnet cross-check](benchmarks/results/2026-06-29-sonnet-cross-check.md).

### `/rdx-audit` — a thing neither specialist has

One pass over a diff, file, or repo that flags **both** over-engineered code *and* bloated
prose/docs/comments, ranked biggest-cut-first. ponytail-audit is code-only; caveman has no
audit at all. `/rdx-audit` is the union — what a PR reviewer actually wants in one report.

> ⚠️ Earlier versions of this README showed a "74% / both-axes-win" chart **modeled from
> hand-authored examples**. That was replaced with the live measurement above. The code
> generating it (`scripts/build-chart.js`) reads frozen real results and CI fails if it drifts.

---

## Install

It's one command, it touches nothing it shouldn't, and `--uninstall` puts everything back
if we're not friends anymore. Auto-detects your agents (Claude Code, Cursor, Windsurf, Cline,
Kiro, Codex, Gemini, Copilot) and wires each one:

```bash
npx rdxifier
```

```bash
# or via curl
curl -fsSL https://raw.githubusercontent.com/jaypokale/rdxifier/main/install.sh | bash
```

```powershell
# Windows
irm https://raw.githubusercontent.com/jaypokale/rdxifier/main/install.ps1 | iex
```

Preview first with `npx rdxifier --dry-run`, scope with `--only claude`, see
everything with `npx rdxifier --help`. Remove with `npx rdxifier --uninstall`.

<details>
<summary>Manual install (Claude Code plugin)</summary>

Add to `~/.claude/settings.json`:

```json
{
  "plugins": ["/path/to/rdxifier"],
  "statusLine": {
    "type": "command",
    "command": "bash \"/path/to/rdxifier/hooks/rdx-statusline.sh\""
  }
}
```
</details>

---

## Usage

| Command | Effect |
|---------|--------|
| `/rdx` | Activate at default level (full) |
| `/rdx lite` | Tighter prose, flags the minimal alternative |
| `/rdx full` | Full compression + YAGNI ladder enforced |
| `/rdx ultra` | Extremist — abbreviate prose, delete before add, challenge requirements |
| `stop rdx` | Deactivate |
| `normal mode` | Deactivate |

Natural language works too: "activate rdx", "rdx mode", "rdxify this".

---

## Levels

**lite** — No filler/hedging, keeps articles and full sentences. Flags the more
minimal code approach in one line. You decide.

**full** (default) — Drop articles, fragments OK. Ladder enforced: YAGNI →
reuse → stdlib → native → installed dep → one line → min code. Shortest diff,
shortest explanation.

**ultra** — Abbreviate prose words (DB/auth/config/req/res/fn). Strip
conjunctions, use arrows for causality (X → Y). YAGNI extremist: deletion
before addition, challenge the requirement in the same breath. Code symbols,
function names, API names, error strings: never abbreviated.

---

## How it works

Before writing code, the agent stops at the first rung that holds:

```
1. Does this need to exist?   → no: skip it (YAGNI)
2. Already in this codebase?  → reuse it, don't rewrite
3. Stdlib does it?            → use it
4. Native platform feature?   → use it
5. Installed dependency?      → use it
6. One line?                  → one line
7. Only then: the minimum that works
```

The ladder runs *after* it understands the problem — it reads the code the change
touches and traces the real flow first. Lazy about the solution, never about reading.

Lazy is not negligent: trust-boundary validation, data-loss handling, security, and
accessibility are never on the chopping block. The prose compresses in parallel —
fewer words to say the same true thing.

---

## Statusline

Badge shows the active level:

```
[RDX]
[RDX:ULTRA]
```

Orange. Reads the mode flag; renders nothing when rdx is off. (No "tokens saved"
counter — a live session has no counterfactual baseline to measure savings against,
so any such number would be invented. The real numbers live in [Numbers](#numbers).)

---

## 🔥 What the output sounds like

Illustrative of the *style* at each level (not benchmark numbers — those are
[above](#numbers), with receipts):

**"Why React component re-render?"** (full)
> New object ref each render. Inline object prop = new ref = re-render. `useMemo`.

**"Why React component re-render?"** (ultra)
> Inline obj prop → new ref → re-render. `useMemo`. Why inline object at all?

**"Add a cache for API responses."** (full)
> `@lru_cache(maxsize=1000)` on fetch fn. Skipped custom cache class, add when lru_cache measurably falls short.

**"Add a cache for API responses."** (ultra)
> No cache until profiler says so. When it does: `@lru_cache`. Hand-rolled TTL cache = bug farm with hit rate.

---

## Auto-Clarity

Compression drops automatically for:
- Security warnings
- Irreversible action confirmations
- Multi-step sequences where fragment order risks misread
- When compression itself creates technical ambiguity

Resumes after the clear part.

---

## When NOT to be minimal

Never simplify away: input validation at trust boundaries, error handling
preventing data loss, security measures, accessibility basics, anything
explicitly requested. User insists on the full version → build it, no re-arguing.

Never skip reading. The ladder shortens the solution, not the understanding.

---

## Mark deliberate simplifications

```js
// rdx: global lock, per-account locks if throughput matters
// rdx: O(n) scan, index this when table exceeds ~10k rows
```

Simple reads as intent, not ignorance.

---

## Config

Override default mode:

```bash
# env var (highest priority)
export RDX_DEFAULT_MODE=ultra

# config file
~/.config/rdxifier/config.json
{ "defaultMode": "lite" }
```

---

## Benchmarks

```bash
bash benchmarks/run-live.sh    # 24 live model runs (4 arms x 6 tasks) — the real head-to-head
node benchmarks/aggregate.js   # turn raw runs into the comparison tables
node scripts/build-chart.js    # regenerate the chart above from frozen results
npm test                       # 34 tests: flag safety, tracker, settings merge, installer
```

`run-live.sh` drives the authenticated `claude` CLI, isolating each arm so the only
variable is the injected system prompt. Raw outputs land in
[`benchmarks/results/raw/`](./benchmarks/results/raw/) and are committed for audit.

## Multi-agent

Primarily a Claude Code plugin, but the instruction set ships to every agent
with a rules/context file — Cursor, Windsurf, Cline, Kiro, Codex, Gemini,
Copilot. Copies are generated from one source (`scripts/build-rules.js`) and
verified in CI. See [`docs/agent-portability.md`](./docs/agent-portability.md).

## Files

```
rdxifier/
├── .claude-plugin/                ← plugin.json + marketplace.json
├── skills/
│   ├── rdxifier/SKILL.md          ← persona + rules (source of truth)
│   ├── rdx-help/SKILL.md          ← /rdx-help quick reference
│   └── rdx-review/SKILL.md        ← /rdx-review bloat finder
├── hooks/
│   ├── rdx-activate.js            ← SessionStart: write flag, emit rules
│   ├── rdx-mode-tracker.js        ← UserPromptSubmit: commands, NL, reinforcement
│   ├── rdx-statusline.sh / .ps1   ← statusline badge (bash + PowerShell)
│   ├── rdx-config.js              ← safeWriteFlag, readFlag, getDefaultMode
│   └── package.json               ← {"type": "commonjs"}
├── commands/                      ← /rdx, /rdx-help, /rdx-review, /rdx-audit
├── benchmarks/                    ← run-live.sh, aggregate.js, results/ + raw cells
├── tests/                         ← config, settings, tracker, installer
├── scripts/                       ← build-rules.js, build-chart.js
├── docs/                          ← install-windows, agent-portability, releasing
├── .cursor / .windsurf / .clinerules / .kiro / .github  ← per-agent rules
├── AGENTS.md / GEMINI.md          ← agent-agnostic instruction sets
└── rules/rdx-activate.md          ← always-on rules reference
```

## FAQ

**Why not just use caveman or ponytail?**
Use them! They're great, we cite them by name, and we tested *against* them honestly. But
caveman has no engineering judgment and ponytail can backfire (227%, measured). Installing
*both* to cover both axes gets you two plugins that fight over your prose style and double
the overhead. RDXifier is the one that does both and never face-plants. See [Numbers](#numbers).

**Will it golf my code into clever one-liners I'll hate at 3am?**
No. The rule is *necessary*, not *fewest characters*. Boring over clever — because clever is
what some poor soul (you, in six months) has to decode during an incident. Deletion beats
addition; obfuscation isn't deletion.

**Does it ever cut corners on safety?**
Never. Input validation, error handling that prevents data loss, security, and accessibility
are explicitly off the table. It's lazy about *solutions*, not about *reading the problem* —
which, frankly, is more discipline than some humans bring to a PR.

**It made my answer terse and dropped something I needed!**
File an issue — that's a bug, not the design. The whole point is *terse ≠ incomplete*: keep
the fix, cut the fluff. If it dropped the fix, it failed its own rules and we want to know.

**Does it work outside Claude Code?**
Yes — ships to Cursor, Windsurf, Cline, Kiro, Codex, Gemini, and Copilot. The live
mode-switching UI (`/rdx`, statusline badge) is Claude-Code-specific; everywhere else the
always-on ruleset still applies. See [agent portability](docs/agent-portability.md).

**Why "RDXifier"?**
RDX is a demolition charge. Your token bill is the building. Use your imagination. (Legally,
the only thing it detonates is verbosity.)

**0 GitHub stars. Should I be worried?**
Everyone starts at zero. You could be the protagonist of this repo's origin story. Or just
run `npx rdxifier --dry-run`, see what it'd do, and decide. No commitment, no stars required.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Edit the source of truth
([`skills/rdxifier/SKILL.md`](skills/rdxifier/SKILL.md)), regenerate the rule copies
and chart, run the tests. CI enforces all three.

## License

[MIT](LICENSE). The shortest license that works.
