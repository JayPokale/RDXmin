# Changelog

All notable changes to RDXifier are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-06-29

### Added
- Unified efficiency mode: zero-fluff prose + YAGNI-first code, always active together.
- `/rdx` command with `lite` / `full` / `ultra` levels; natural-language activation.
- SessionStart + UserPromptSubmit hooks with symlink-safe flag handling (`O_NOFOLLOW`, 0600).
- Statusline badge `[RDX] 💥 X.Xk` with per-session token-savings estimate (bash + PowerShell).
- **`npx rdxifier` installer** — auto-detects 8 agents (Claude Code, Gemini, Codex,
  Cursor, Windsurf, Cline, Kiro, Copilot) and installs for each. Flags: `--list`,
  `--only`, `--dry-run`, `--force`, `--uninstall`, `--config-dir`, `--help`. Claude path
  does a plugin install with automatic fallback to standalone hooks + JSONC-safe
  `settings.json` merge. Idempotent; clean round-trip uninstall.
- `curl | bash` and `irm | iex` shims delegating to the Node installer.
- Multi-agent distribution: Cursor, Windsurf, Cline, Kiro, Codex, Gemini, Copilot rule copies, generated from one source via `scripts/build-rules.js`.
- **Live 4-arm benchmark** (`benchmarks/run-live.sh` + `aggregate.js`): vanilla vs
  caveman vs ponytail vs rdxifier over 24 real model runs, isolated so the arm is the
  only variable. Raw outputs committed under `benchmarks/results/raw/`. README chart and
  numbers are generated from this real data (replacing an earlier chart modeled from
  hand-authored examples). Finding: rdxifier is leanest on coding tasks; on pure prose a
  dedicated prose compressor wins — stated plainly, not cherry-picked.
- Deterministic example check (`benchmarks/compare.js`) + chart generator (`scripts/build-chart.js`) + promptfoo config.
- npm trusted publishing (OIDC, provenance) + GitHub Release workflow on `v*` tags.
- Test suite: 36 tests across flag safety, tracker, settings merge, installer integration. CI on Node 18/20/22.

### Fixed
- Deactivation no longer triggers on unrelated sentences that merely mention "rdx"
  alongside "off"/"stop" (e.g. "use rdx to turn off the logger"). Now requires the
  off-verb to target rdx directly. Regression-tested.

### Notes
- Token-savings counter is an estimate (`~350 tok/turn`), not a transcript measurement.
- Example outputs are representative/illustrative; the *measurement* over them is reproducible.
