# RDXifier

Maximum signal. Minimum noise. Write less. Ship less. Mean more.

A Claude Code plugin that makes the model terse, precise, and ruthlessly minimal —
in both what it says and what it builds.

---

## What it does

Two dimensions. Always active simultaneously.

**Zero-fluff prose** — drops articles, filler, pleasantries, hedging. Fragments OK.
Technical terms stay exact. Code blocks unchanged. Pattern: `[thing] [action] [reason].`

**Efficiency-first code** — applies the YAGNI ladder before writing anything.
Stdlib first. Native platform over dependencies. One line over fifty. Deletion over addition.

---

## Install

Add to `~/.claude/settings.json`:

```json
{
  "plugins": [
    "/path/to/rdxifier"
  ],
  "statusLine": {
    "type": "command",
    "command": "bash \"/path/to/rdxifier/hooks/rdx-statusline.sh\""
  }
}
```

Hooks activate on session start. No manual step needed.

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

## Files

```
rdxifier/
├── .claude-plugin/plugin.json     ← hook wiring
├── skills/rdxifier/SKILL.md       ← persona + rules (source of truth)
├── hooks/
│   ├── rdx-activate.js            ← SessionStart: write flag, emit rules
│   ├── rdx-mode-tracker.js        ← UserPromptSubmit: commands, NL, reinforcement
│   ├── rdx-statusline.sh          ← statusline badge with savings suffix
│   ├── rdx-config.js              ← safeWriteFlag, readFlag, getDefaultMode
│   └── package.json               ← {"type": "commonjs"}
├── commands/rdxifier.toml         ← /rdx command definition
├── rules/rdx-activate.md          ← always-on rules reference
└── README.md
```
