<p align="center">
  <img src="assets/logo.svg" width="120" alt="RDXmin">
</p>

<h1 align="center">🧨 RDXmin</h1>

<p align="center">
  <em>Your AI talks less, builds less, says more. Like a senior dev who bills by the syllable.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-pre--release-d78a3c?style=flat-square" alt="Pre-release">
  <img src="https://img.shields.io/badge/works%20with-8%20agents-d78a3c?style=flat-square" alt="Works with 8 agents">
  <a href="https://github.com/JayPokale/RDXmin/actions/workflows/test.yml"><img src="https://img.shields.io/github/actions/workflow/status/JayPokale/RDXmin/test.yml?style=flat-square&label=CI" alt="CI"></a>
  <img src="https://img.shields.io/badge/deps-0-2da44e?style=flat-square" alt="Zero deps">
  <img src="https://img.shields.io/badge/backfires-1%2F20-2da44e?style=flat-square" alt="1 backfire in 20 tasks">
  <img src="https://img.shields.io/badge/license-MIT-d78a3c?style=flat-square" alt="MIT">
</p>

<p align="center">
  <strong>Compresses prose AND code &middot; 1 backfire across 20 measured tasks (competitors: 6 and 8) &middot; one command</strong>
</p>

---

You asked your AI agent to "add a cache." A bare agent answered with a **150-line** cache class — config object, TTL logic, stats counters, the works. RDXmin's answer to the same prompt: **7 lines.** Same model, same question, measured, receipts committed in [`benchmarks/`](benchmarks/results/).

RDXmin enforces **zero-fluff prose** and **YAGNI-first code** simultaneously — no filler, no speculative abstractions, no `// TODO: maybe later`. Other tools compress either prose or code. RDXmin does both at once and — across 20 measured tasks over two suites — made the answer worse than no tool exactly once (competitors: 6× and 8×, with blowups to 424%); that one failure was diagnosed, the rule hardened, and the fix re-validated live. It's the Toyota Corolla of efficiency skills: not the flashiest, just the one that always starts. [Why not caveman or ponytail? →](docs/comparison.md)

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

**Requirements:** Node ≥18 (installer / `npx`) · Claude Code for the live `/rdx` switching + statusline badge — the always-on ruleset still ships to every other agent · bash for the statusline (macOS/Linux; a PowerShell version ships for Windows).

### Claude Code plugin (marketplace)

Prefer Claude's own plugin manager? Skip the installer and add the marketplace directly:

```bash
claude plugin marketplace add JayPokale/RDXmin   # register the marketplace
claude plugin install rdxmin@rdxmin              # enable the plugin
```

<details>
<summary>Statusline badge (manual setup)</summary>

Add to `~/.claude/settings.json`:

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

## Numbers

**59 live model runs** — not a tidy 14×4×2 grid, but two suites with different coverage: a clean **6-task × 4-arm** matrix on Haiku (24 runs) plus a wider **Sonnet sweep** (35 runs, including a 5th "both-tools-stacked" arm and one partial probe). The **14 tasks** charted below are those run across all four arms (6 on Haiku + 8 on Sonnet). They span coding, prose, and vague "judgment" requests — *add a cache*, *explain this error*, *refactor for clarity*; the [full task list and every raw answer are committed](benchmarks/results/raw/). Arms (no tool, caveman, ponytail, RDXmin) differ only in the injected system prompt. Each tool's **worst case** across those 14 tasks:

<p align="center">
  <img src="assets/benchmark.svg" width="820" alt="Worst-case billed output across the June 14-task suite as percent of the no-tool baseline. ponytail 227% (backfired on 4 tasks), caveman 130% (1 task), RDXmin 83% (0 in that suite; 1 backfire appeared in the July re-run — see verification writeup).">
</p>

ponytail, a tool whose entire job is *writing less*, has a worst case of **227%** — more than double the no-tool baseline. RDXmin's worst day in that suite was still a 17% discount.

A fresh July re-run ([verification writeup](benchmarks/results/2026-07-07-verify-rerun.md)) reproduced the June numbers from raw data, then re-measured with the competitors' **installed plugins**: caveman blew up to **424%** on one task (5/6 over baseline), ponytail went over on 4/6, RDXmin over on 1/6 — a 173% comparison-prompt answer whose root cause was diagnosed, fixed in the ruleset, and re-validated live at 93%. Combined ledger across both suites: **caveman 6/20 over, ponytail 8/20, RDXmin 1/20.**

Small sample, two models, temperature wobble. Directional, not gospel — but it's *measured*, and re-measured.

→ [Full comparison, per-segment tables, and detailed competitor breakdown](docs/comparison.md)

---

## What the output sounds like

**"Why React component re-render?"** (full)
> New object ref each render. Inline object prop = new ref = re-render. `useMemo`.

**"Why React component re-render?"** (ultra)
> Inline obj prop → new ref → re-render. `useMemo`. Why inline object at all?

**"Add a cache for API responses."** (ultra)
> No cache until profiler says so. When it does: `@lru_cache`. Hand-rolled TTL cache = bug farm with hit rate.

---

## Usage

| Command | Effect |
|---------|--------|
| *(nothing)* | On automatically at `full` every session after install |
| `/rdx` | Re-activate at default level if you'd stopped it |
| `/rdx lite` | Tighter prose, flags the minimal alternative |
| `/rdx full` | Full compression + YAGNI ladder enforced |
| `/rdx ultra` | Extremist — abbreviate prose, delete before add, challenge requirements |
| `stop rdx` | Deactivate |
| `normal mode` | Deactivate |

Natural language works too: "activate rdx", "rdx mode", "rdxify this". Across every level, code symbols, function/API names, and error strings stay verbatim — only the prose around them compresses.

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

## Input-side compression (the second axis)

Prose rules shrink what the agent *writes*. Since v0.2.0 a `PostToolUse` hook also shrinks what it *reads*: oversized tool output (Bash dumps, subagent reports, web fetches) gets its middle elided before the model sees it — head kept, tail kept, error-looking lines salvaged from the cut. Deterministic, zero LLM, zero network.

Why it matters, measured over 171 real sessions: tool output is **67.5%** of context content, and every byte of it is re-billed on *every subsequent request* in the session (median: 171 requests). Receipts: [`benchmarks/results/2026-07-07-input-axis.md`](benchmarks/results/2026-07-07-input-axis.md). Replay it on your own transcripts:

```bash
node benchmarks/replay-compress.js        # what it would have saved you
```

Correctness rules: allowlist only (`Bash`, `Agent`, `WebFetch`, `WebSearch`, `Grep`, `Glob`, `mcp__*`) — never `Read`/`Edit`, whose exact bytes feed later edits. Thresholds track the `/rdx` level (lite 16k / full 8k / ultra 5k chars). `stop rdx` or `RDX_COMPRESS=0` disables it. Savings show in the statusline: `⇣9k tok`. Claude Code only — no other agent has a post-tool output rewrite hook yet; everywhere else the ruleset's Context Diet section (Grep before Read, filter at the source) covers the same axis by prevention.

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

**On by default.** After install, RDX activates automatically at `full` every session — no `/rdx` needed. Change the default level, or set `off` to stay dormant until you type `/rdx`:

```bash
# env var (highest priority)
export RDX_DEFAULT_MODE=ultra

# config file (persists across shells)
~/.config/rdxmin/config.json → { "defaultMode": "ultra" }
```

Resolution: env var → config file → `full`. Valid: `off`, `lite`, `full`, `ultra`.

---

## Multi-agent

Primarily a Claude Code plugin, but ships to every agent with a rules/context file — Cursor, Windsurf, Cline, Kiro, Codex, Gemini, Copilot. Generated from one source (`scripts/build-rules.js`), verified in CI. See [`docs/agent-portability.md`](./docs/agent-portability.md).

---

## FAQ

**Doesn't injecting a persona every turn cost tokens?**
Yes — a one-time ruleset at session start (~1.5k tokens) plus a ~40-token reminder per turn. Output is where it pays back: coding answers shrink 40–60% (benchmarks), and output bills several × higher than input, so net is positive after the first couple of turns. On a one-line throwaway prompt the overhead can exceed the saving. Honest caveat: the benchmarks measure *output* size, not the injected input.

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
