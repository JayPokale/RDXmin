# Installation

## One-line installer (recommended)

```bash
npx rdxifier
```

Detects every supported agent on your machine and installs RDXifier for each:

| Agent | What gets installed | Scope |
|-------|--------------------|-------|
| Claude Code | plugin (or standalone hooks + statusline) | global |
| Gemini CLI | `gemini extensions install` | global |
| Codex | fenced ruleset in `~/.codex/AGENTS.md` | global |
| Cursor / Windsurf / Cline / Kiro / Copilot | rule file in the current project | project |

Flags:

```bash
npx rdxifier --list          # show detected agents, install nothing
npx rdxifier --only claude   # one agent
npx rdxifier --dry-run       # preview, change nothing
npx rdxifier --force         # reinstall / overwrite
npx rdxifier --uninstall     # remove everything it added
```

curl / PowerShell one-liners:

```bash
curl -fsSL https://raw.githubusercontent.com/jaypokale/rdxifier/main/install.sh | bash
```
```powershell
irm https://raw.githubusercontent.com/jaypokale/rdxifier/main/install.ps1 | iex
```

## Manual Claude Code plugin

Add to `~/.claude/settings.json`:

```json
{
  "plugins": [
    "/path/to/rdxifier"
  ]
}
```

Restart Claude Code. RDXifier activates automatically on every session.

## Statusline badge

To show `[RDX] 💥 3.5k` in your Claude Code statusline, also add:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash \"/path/to/rdxifier/hooks/rdx-statusline.sh\""
  }
}
```

If you don't configure it manually, Claude will offer to set it up on first session.

## Verify it's working

Start a Claude Code session. You should see:

```
RDX MODE ACTIVE — level: full
```

in the session context. Then type `/rdx ultra` to switch levels.

## Uninstall

Remove the `plugins` entry from `~/.claude/settings.json` and delete the flag files:

```bash
rm -f ~/.claude/.rdx-active
rm -f ~/.claude/.rdx-session-turns
rm -f ~/.claude/.rdx-statusline-suffix
```

## Config

Override default level via environment variable:

```bash
export RDX_DEFAULT_MODE=ultra   # lite | full | ultra
```

Or via config file at `~/.config/rdxifier/config.json`:

```json
{ "defaultMode": "lite" }
```
