<p align="center">
  <img src="assets/logo.svg" width="120" alt="RDXmin">
</p>

<h1 align="center">🧨 RDXmin</h1>

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

🧨 You asked your AI agent to "add a cache." A bare agent answered with a **150-line** cache class — config object, TTL logic, stats counters, the works. RDXmin's answer to the same prompt: **7 lines.** Same model, same question, measured, receipts committed in [`benchmarks/`](benchmarks/results/).

RDXmin enforces **zero-fluff prose** and **YAGNI-first code** simultaneously — no filler, no speculative abstractions, no `// TODO: maybe later`. Other tools do one axis. RDXmin does both and — across 14 measured tasks — never once made things worse. It's the Toyota Corolla of efficiency skills: not the flashiest, just the one that always starts. [Why not caveman or ponytail? →](docs/comparison.md)

---

## Install

One command. Auto-detects your agents (Claude Code, Cursor, Windsurf, Cline, Kiro, Codex, Gemini, Copilot) and wires each one. `--uninstall` puts everything back.

```bash
npx rdxmin
```

```bash
# or via curl
curl -fsSL https://raw.githubusercontent.com/JayPokale/RDXmin/main/install.sh | bash
```

```powershell
# Windows
irm https://raw.githubusercontent.com/JayPokale/RDXmin/main/install.ps1 | iex
```

Preview first with `npx rdxmin --dry-run`, scope with `--only claude`, see everything with `npx rdxmin --help`. Remove with `npx rdxmin --uninstall`.

<details>
<summary>Manual install (Claude Code plugin)</summary>

```bash
claude plugin marketplace add JayPokale/RDXmin   # register the marketplace
claude plugin install rdxmin@rdxmin              # enable the plugin
```

Statusline badge — add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash \"/path/to/rdxmin/hooks/rdx-statusline.sh\""
  }
}
```
</details>

---

## 🧨 Numbers

**59 live model runs** across 14 tasks — coding, prose, and vague "judgment" requests (e.g., "add a cache", "explain this error", "refactor for clarity") — 4 arms (no tool, caveman, ponytail, RDXmin) on Haiku and Sonnet, each differing only in the injected system prompt. The full task list and every raw answer are [committed for audit](benchmarks/results/raw/). Here's the chart that matters — each tool's **worst case** across all 14 tasks:

<p align="center">
  <img src="assets/benchmark.svg" width="820" alt="Worst-case output size across 14 tasks as percent of the no-tool baseline. ponytail 227% (backfired on 4 tasks), caveman 130% (1 task), RDXmin 83% (never backfires).">
</p>

ponytail, a tool whose entire job is *writing less*, has a worst case of **227%** — more than double the no-tool baseline. caveman creeps over once. RDXmin's worst day is still a 17% discount.

Small sample, two models, temperature wobble. Directional, not gospel — but it's *measured*, which already puts it ahead of most READMEs.

→ [Full comparison, per-segment tables, and detailed competitor breakdown](docs/comparison.md)

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

**lite** — No filler/hedging, keeps articles and full sentences. Flags the more minimal code approach in one line. You decide.

**full** (default) — Drop articles, fragments OK. Ladder enforced: YAGNI → reuse → stdlib → native → installed dep → one line → min code.

**ultra** — Abbreviate prose words (DB/auth/config/req/res/fn). Strip conjunctions, use arrows for causality (X → Y). YAGNI extremist: deletion before addition, challenge the requirement in the same breath. Code symbols, function names, API names: never abbreviated.

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

The ladder runs *after* reading the code — lazy about the solution, never about understanding. Lazy is not negligent: trust-boundary validation, data-loss handling, security, and accessibility are never on the chopping block.

Mark deliberate simplifications so "later" doesn't quietly become "never":

```js
// rdx: global lock, per-account locks if throughput matters
// rdx: O(n) scan, index this when table exceeds ~10k rows
```

---

## What the output sounds like

**"Why React component re-render?"** (full)
> New object ref each render. Inline object prop = new ref = re-render. `useMemo`.

**"Why React component re-render?"** (ultra)
> Inline obj prop → new ref → re-render. `useMemo`. Why inline object at all?

**"Add a cache for API responses."** (ultra)
> No cache until profiler says so. When it does: `@lru_cache`. Hand-rolled TTL cache = bug farm with hit rate.

---

## Statusline

Badge shows the active level. Plan users see rate-limit usage + reset countdown:

```
[RDX:ULTRA] Session: ███████░░░ 73% ⟳2h14m | Weekly: ████░░░░░░ 41% ⟳3d4h
```

API-key users have no rate limits, so they see session cost instead:

```
[RDX:ULTRA] Session: $0.42
```

Orange. Pulled live from Claude's statusline JSON — no extra API calls. Renders nothing when rdx is off.

---

## Config

```bash
# env var (highest priority)
export RDX_DEFAULT_MODE=ultra

# config file
~/.config/rdxmin/config.json → { "defaultMode": "ultra" }
```

---

## Multi-agent

Primarily a Claude Code plugin, but ships to every agent with a rules/context file — Cursor, Windsurf, Cline, Kiro, Codex, Gemini, Copilot. Generated from one source (`scripts/build-rules.js`), verified in CI. See [`docs/agent-portability.md`](./docs/agent-portability.md).

---

## FAQ

**Will it golf my code into clever one-liners?**
No. Boring over clever. Deletion beats addition; obfuscation isn't deletion.

**Does it cut corners on safety?**
Never. Input validation, data-loss handling, security, and accessibility are off the table. Lazy about solutions, not about reading the problem.

**0 GitHub stars. Should I be worried?**
Everyone starts at zero. Run `npx rdxmin --dry-run`, see what it'd do, decide. No commitment, no stars required.

→ [More FAQ and competitor comparison](docs/comparison.md)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Edit the source of truth ([`skills/rdx/SKILL.md`](skills/rdx/SKILL.md)), regenerate rule copies and chart, run the tests. CI enforces all three.

```bash
npm test    # 34 tests: flag safety, tracker, settings merge, installer
```

## License

[MIT](LICENSE). The shortest license that works.
