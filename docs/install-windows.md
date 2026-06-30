# Installing on Windows

RDXmin works on Windows via Claude Code's `commandWindows` hook variant and a
PowerShell statusline script. No WSL required.

## Plugin

Add to `%USERPROFILE%\.claude\settings.json`:

```json
{
  "plugins": ["C:\\path\\to\\rdxmin"]
}
```

The hooks in `plugin.json` already declare `commandWindows` variants, so Claude
Code runs the PowerShell-safe form automatically. Node.js must be on `PATH`.

## Statusline

```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -ExecutionPolicy Bypass -File \"C:\\path\\to\\rdxmin\\hooks\\rdx-statusline.ps1\""
  }
}
```

## Flag files

On Windows the flag lives at:

```
%CLAUDE_CONFIG_DIR%\.rdx-active        (defaults to %USERPROFILE%\.claude)
%CLAUDE_CONFIG_DIR%\.rdx-statusline-suffix
```

The symlink-safety checks in `rdx-config.js` fall back to a home-directory
containment check on Windows (where `process.getuid` is unavailable).

## Troubleshooting

- **Badge not showing** → confirm `rdx-statusline.ps1` runs: `powershell -File hooks\rdx-statusline.ps1`
- **Hook not firing** → confirm `node --version` works in a fresh terminal
- **Garbled colors** → your terminal may not support ANSI; Windows Terminal does
