---
name: rdx-help
description: >
  Quick-reference card for RDXifier modes, levels, and commands. One-shot
  display, not a persistent mode. Use when the user says "rdx help", "how do I
  use rdx", "what rdx commands", or invokes /rdx-help.
---

# RDXifier — quick reference

**What it is:** maximum-efficiency dev mode. Zero-fluff prose + YAGNI-first code, always on together.

## Commands

| Command | Effect |
|---------|--------|
| `/rdx` | Activate at default level (full) |
| `/rdx lite` | Tighter prose, flags the minimal alternative |
| `/rdx full` | Full compression + YAGNI ladder |
| `/rdx ultra` | Extremist: abbreviate prose, delete before add |
| `/rdx-audit [path]` | Audit a diff/file/repo for both code bloat AND prose verbosity |
| `/rdx-review` | Review the current diff for over-engineering |
| `stop rdx` / `normal mode` | Deactivate |

Natural language works: "activate rdx", "rdx mode", "rdxify this".

## Levels at a glance

- **lite** — keeps full sentences; names the lazier code option, you pick.
- **full** — drops articles, fragments OK, ladder enforced. Default.
- **ultra** — abbreviates prose words, challenges the requirement itself.

## The code ladder

YAGNI → reuse → stdlib → native → installed dep → one line → minimum code.

## Statusline

`[RDX]` / `[RDX:ULTRA]` — shows the active level. Configure via
`hooks/rdx-statusline.sh` (or `.ps1` on Windows).

## Never minimal about

Input validation, error handling that prevents data loss, security,
accessibility, anything you explicitly asked for.
