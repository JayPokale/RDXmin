# Changelog

All notable changes to RDXifier are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- **`npx rdxifier` installer** — auto-detects 8 agents (Claude Code, Gemini, Codex,
  Cursor, Windsurf, Cline, Kiro, Copilot) and installs for each. Flags: `--list`,
  `--only`, `--dry-run`, `--force`, `--uninstall`, `--config-dir`, `--help`.
- Claude Code path: plugin install with automatic fallback to standalone hooks +
  JSONC-safe `settings.json` merge + statusline. Idempotent; clean uninstall.
- `curl | bash` and `irm | iex` shims delegating to the Node installer.
- 20 new tests (settings merge, installer integration). Suite now 36 tests.

## [1.0.0] — 2026-06-29

### Added
- Unified efficiency mode: zero-fluff prose + YAGNI-first code, always active together.
- `/rdx` command with `lite` / `full` / `ultra` levels; natural-language activation.
- SessionStart + UserPromptSubmit hooks with symlink-safe flag handling (`O_NOFOLLOW`, 0600).
- Statusline badge `[RDX] 💥 X.Xk` with per-session token-savings estimate (bash + PowerShell).
- Multi-agent distribution: Cursor, Windsurf, Cline, Kiro, Codex, Gemini, Copilot rule copies, generated from one source via `scripts/build-rules.js`.
- Deterministic benchmark harness (`benchmarks/compare.js`) + live promptfoo config.
- Test suite: config/flag safety, tracker integration, benchmark sanity. CI on Node 18/20/22.

### Fixed
- Deactivation no longer triggers on unrelated sentences that merely mention "rdx"
  alongside "off"/"stop" (e.g. "use rdx to turn off the logger"). Now requires the
  off-verb to target rdx directly. Regression-tested.

### Notes
- Token-savings counter is an estimate (`~350 tok/turn`), not a transcript measurement.
- Example outputs are representative/illustrative; the *measurement* over them is reproducible.
