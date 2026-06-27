<p align="center">
  <img src="assets/logo.svg" width="120" alt="RDXifier">
</p>

<h1 align="center">RDXifier</h1>

<p align="center">
  <em>Maximum signal. Minimum noise. Write less. Ship less. Mean more.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-pre--release-d78a3c?style=flat-square" alt="Pre-release">
  <img src="https://img.shields.io/badge/works%20with-8%20agents-d78a3c?style=flat-square" alt="Works with 8 agents">
  <img src="https://img.shields.io/badge/tests-36%20passing-2da44e?style=flat-square" alt="36 tests">
  <img src="https://img.shields.io/badge/deps-0-2da44e?style=flat-square" alt="Zero deps">
  <img src="https://img.shields.io/badge/license-MIT-d78a3c?style=flat-square" alt="MIT">
</p>

<p align="center">
  <strong>Leanest answers measured — coding *and* prose &middot; ~78% smaller on coding tasks &middot; 8 agents &middot; one command</strong>
</p>

---

Most "be concise" tools compress one axis. Prose-compressors (caveman-style) shrink the
chatter but leave the over-built code. Code-minimizers (ponytail-style) cut the code but
can ramble in prose. **RDXifier does both** — zero-fluff prose *and* a YAGNI-first code
ladder, always on together.

## What it does

**Zero-fluff prose** — drops articles, filler, pleasantries, hedging. Fragments OK.
Technical terms stay exact. Code blocks unchanged. Pattern: `[thing] [action] [reason].`

**Efficiency-first code** — applies the YAGNI ladder before writing anything.
Stdlib first. Native platform over dependencies. One line over fifty. Deletion over addition.

## Numbers

A real head-to-head: **24 live model runs** — 4 arms (no tool, [caveman](https://github.com/JuliusBrussee/caveman),
[ponytail](https://github.com/DietrichGebert/ponytail), RDXifier) × 6 tasks (3 coding, 3
non-coding), Haiku 4.5, each arm differing only in its injected system prompt. Plugins,
tone hooks, and personal config were neutralized so the arm is the only variable.
Reproduce: `bash benchmarks/run-live.sh` then `node benchmarks/aggregate.js`.

<p align="center">
  <img src="assets/benchmark.svg" width="820" alt="Visible answer size as percent of vanilla baseline. Coding: RDXifier 22%, ponytail 29%, caveman 46%. Non-coding: RDXifier 71%, caveman 79%, ponytail 121%.">
</p>

**Visible answer size, as % of the no-tool baseline (lower = leaner):**

| | vanilla | caveman | ponytail | **RDXifier** |
|---|--:|--:|--:|--:|
| **coding** (tokens) | 100% | 46% | 29% | **22%** |
| **coding** (lines) | 100% | 40% | 19% | **14%** |
| **non-coding** (tokens) | 100% | 79% | 121% | **71%** |
| **all 6 tasks** (tokens) | 100% | 57% | 61% | **39%** |

The honest read:

- **On coding, RDXifier is leanest** — 22% of the baseline's answer tokens, 14% of its
  lines, ahead of caveman (46%) and ponytail (29%). The hero case: a "add a cache" prompt
  where vanilla over-built a **150-line** cache class and RDXifier delivered **6 lines**.
- **On non-coding prose, RDXifier is also leanest (71%)** — narrowly ahead of caveman, a
  dedicated prose compressor (79%), while ponytail is actually *worse* than no tool (121%,
  it pads prose with structure). RDXifier earns this with an explicit "structure is tokens"
  rule: answer at the question's altitude, no manufactured headings or bullet scaffolding.
- **Billed tokens (incl. model reasoning) land at ~45% overall** across all three skills:
  they make the model think more but emit far less visible text. Full table:
  [`benchmarks/results/2026-06-29-live-4arm.md`](benchmarks/results/2026-06-29-live-4arm.md).
- Small sample (n=6, one model, temperature variance run-to-run). Directional, not a
  leaderboard. Raw outputs committed under
  [`benchmarks/results/raw/`](benchmarks/results/raw/) — audit them yourself.

> ⚠️ Earlier versions of this README showed a "74% / both-axes-win" chart **modeled from
> hand-authored examples**. That was replaced with the live measurement above. The code
> generating it (`scripts/build-chart.js`) reads frozen real results and CI fails if it drifts.

---

## Install

One line — auto-detects your agents (Claude Code, Cursor, Windsurf, Cline, Kiro, Codex, Gemini, Copilot) and installs for each:

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

## Examples

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
npm test                       # 36 tests: flag safety, tracker, settings merge, installer
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
├── commands/                      ← /rdx, /rdx-help, /rdx-review
├── benchmarks/                    ← compare.js, promptfoo config, results/
├── tests/                         ← config, tracker integration
├── scripts/build-rules.js         ← generates per-agent rule copies
├── docs/                          ← install-windows, agent-portability
├── examples/                      ← before/after comparisons
├── .cursor / .windsurf / .clinerules / .kiro / .github  ← per-agent rules
├── AGENTS.md / GEMINI.md          ← agent-agnostic instruction sets
└── rules/rdx-activate.md          ← always-on rules reference
```

## FAQ

**Why not just use a prose-compressor or a code-minimizer?**
Each handles one axis. RDXifier measured leanest on *both* — coding (22% of baseline
tokens vs caveman 46%, ponytail 29%) and non-coding prose (71% vs caveman 79%, ponytail's
121%). A code-minimizer pads prose; a prose-compressor leaves over-built code. See [Numbers](#numbers).

**Will it golf my code into something clever and unreadable?**
No. The rule is *necessary*, not *fewest characters*. Boring over clever — clever is
what someone decodes at 3am. Deletion beats addition; obfuscation isn't deletion.

**Does it ever cut safety?**
Never. Input validation at trust boundaries, error handling that prevents data loss,
security, and accessibility are explicitly off-limits. Lazy about solutions, not reading.

**Does it work outside Claude Code?**
Yes — the instruction set ships to Cursor, Windsurf, Cline, Kiro, Codex, Gemini, and
Copilot. The live mode-switching UI (`/rdx`, statusline badge) is Claude-Code-specific;
elsewhere the always-on ruleset still applies. See [agent portability](docs/agent-portability.md).

**Why "RDXifier"?**
It's a demolition charge for your token bill. Things get smaller. Loudly.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Edit the source of truth
([`skills/rdxifier/SKILL.md`](skills/rdxifier/SKILL.md)), regenerate the rule copies
and chart, run the tests. CI enforces all three.

## License

[MIT](LICENSE). The shortest license that works.
