# Contributing

Small focused PRs beat big rewrites. RDXmin is a small package — keep it that way.

## What lives where

| File | Purpose |
|------|---------|
| `skills/rdx/SKILL.md` | **Source of truth.** All behavior, intensity levels, examples. Edit this. |
| `hooks/rdx-activate.js` | SessionStart: reads SKILL.md, writes flag, emits rules |
| `hooks/rdx-mode-tracker.js` | UserPromptSubmit: commands, NL detection, per-turn reinforcement, savings counter |
| `hooks/rdx-config.js` | Shared flag read/write, mode resolution. Security-sensitive — test changes carefully. |
| `hooks/rdx-statusline.sh` | Statusline badge. Reads flag + suffix file. |

## What to edit

**Changing behavior or intensity levels** → edit `skills/rdx/SKILL.md`. The activate hook reads it at runtime — no duplication.

**Adding natural language triggers** → edit the regex patterns in `hooks/rdx-mode-tracker.js`.

**Changing the statusline badge** → `hooks/rdx-statusline.sh`.

**Security-sensitive paths** → `hooks/rdx-config.js` (`safeWriteFlag`, `readFlag`). These are symlink-safe and use `O_NOFOLLOW`. Don't simplify them.

## Tests

```bash
node --test tests/*.test.js
```

Add a test for any hook logic change. The test file is `tests/test_hooks.js`.

## PR checklist

- [ ] `skills/rdx/SKILL.md` is the source of truth — no hardcoded rule duplication in hooks
- [ ] Hook changes don't break the flag file security model
- [ ] New behavior is covered by a benchmark task in `benchmarks/run-live.sh` (if measurable)
- [ ] Tests pass

## Reporting bugs

Open an issue. Include: what you typed, what rdxmin did, what you expected.
