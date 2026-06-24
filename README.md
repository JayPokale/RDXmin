<p align="center">
  <img src="assets/logo.svg" width="120" alt="RDXifier">
</p>

<h1 align="center">RDXifier</h1>

<p align="center">
  <em>Maximum signal. Minimum noise. Write less. Ship less. Mean more.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/rdxifier?style=flat-square&color=d78a3c&label=npm" alt="npm">
  <img src="https://img.shields.io/badge/works%20with-8%20agents-d78a3c?style=flat-square" alt="Works with 8 agents">
  <img src="https://img.shields.io/badge/tests-36%20passing-2da44e?style=flat-square" alt="36 tests">
  <img src="https://img.shields.io/badge/deps-0-2da44e?style=flat-square" alt="Zero deps">
  <img src="https://img.shields.io/badge/license-MIT-d78a3c?style=flat-square" alt="MIT">
</p>

<p align="center">
  <strong>~74% fewer output tokens on coding tasks &middot; both prose AND code &middot; 8 agents &middot; one command</strong>
</p>

---

Most "be concise" tools compress one thing. Prose-compressors (caveman-style) shrink
the chatter but leave a 116-line implementation. Code-minimizers (ponytail-style) cut
the implementation but keep the "Sure! I'd be happy to help…" preamble.

**RDXifier compresses both axes at once** — zero-fluff prose *and* a YAGNI-first code
ladder, always active together. On coding tasks that's where the tokens actually are.

## What it does

**Zero-fluff prose** — drops articles, filler, pleasantries, hedging. Fragments OK.
Technical terms stay exact. Code blocks unchanged. Pattern: `[thing] [action] [reason].`

**Efficiency-first code** — applies the YAGNI ladder before writing anything.
Stdlib first. Native platform over dependencies. One line over fifty. Deletion over addition.

## Numbers

Measured over the four coding tasks in [`examples/`](examples/) — debounce, an API
cache, an auth-middleware bug, and React state. Reproduce with `node benchmarks/compare.js`.

<p align="center">
  <img src="assets/benchmark.svg" width="820" alt="Output tokens as percent of the no-tool baseline. RDXifier 26%, code-only 35%, prose-only 91%, baseline 100%.">
</p>

| vs no-tool baseline | output tokens | what it cuts |
|---|--:|---|
| no tool | 100% | — |
| prose-only *(caveman-style)* | 91% | chatter, but keeps the over-built code |
| code-only *(ponytail-style)* | 35% | the code, but keeps the prose preamble |
| **RDXifier** | **26%** | **both — prose *and* code** |

On coding tasks the bloat is mostly **code**, so prose-only compression barely moves
the needle (91%). Cutting code is most of the win — and cutting prose on top is the
last 9 points only RDXifier captures. Honest caveats:

- The single-axis arms are **modeled generously**: each gets full credit for the
  reduction RDXifier achieves on *its own* axis, so RDXifier's lead is a conservative
  floor, not a cherry-pick. Method in [`scripts/build-chart.js`](scripts/build-chart.js).
- This is the **coding-task** domain. A pure prose-compressor shines on non-code chat —
  that's its home turf, not measured here.
- Token counts are estimates (`chars/4`), not a live tokenizer. The *measurement* is
  reproducible; the example outputs are representative, not a pinned model capture.

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

Badge shows active level and estimated session token savings:

```
[RDX] 💥 3.5k
[RDX:ULTRA] 💥 7.0k
```

Orange. Updates every turn. Resets each session.

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

Two layers. Deterministic (no API key) and live (promptfoo).

```bash
node benchmarks/compare.js     # measured reduction over examples/
node scripts/build-chart.js    # regenerate the chart above from the data
npm test                       # 36 tests: flag safety, tracker, settings merge, installer
```

Measured result: **74% fewer output tokens** across the four examples. See
[`benchmarks/`](./benchmarks/) and [`benchmarks/results/`](./benchmarks/results/).

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
Because they each leave half the tokens on the table. On a coding task the bloat is
mostly code, but the preamble adds up too. RDXifier cuts both — that's the 9-point gap
between "code-only" and RDXifier in the chart above.

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

## Star History

<a href="https://www.star-history.com/#jaypokale/rdxifier&Date">
  <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=jaypokale/rdxifier&type=Date" width="600">
</a>
