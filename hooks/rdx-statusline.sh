#!/bin/bash
# rdxifier — statusline badge for Claude Code
#
# Usage in ~/.claude/settings.json:
#   "statusLine": { "type": "command", "command": "bash /path/to/rdx-statusline.sh" }

FLAG="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.rdx-active"

# Refuse symlinks — local attacker could point flag at ~/.ssh/id_rsa and have
# the statusline render its bytes to the terminal every keystroke.
[ -L "$FLAG" ] && exit 0
[ ! -f "$FLAG" ] && exit 0

# Hard-cap at 64 bytes, strip non-alphanumeric-dash — blocks terminal-escape injection.
MODE=$(head -c 64 "$FLAG" 2>/dev/null | tr -d '\n\r' | tr '[:upper:]' '[:lower:]')
MODE=$(printf '%s' "$MODE" | tr -cd 'a-z0-9-')

# Whitelist — render nothing for unknown values rather than echo attacker bytes.
case "$MODE" in
  off|lite|full|ultra) ;;
  *) exit 0 ;;
esac

# Orange badge — same hue as caveman, we're family
if [ -z "$MODE" ] || [ "$MODE" = "full" ]; then
  printf '\033[38;5;172m[RDX]\033[0m'
else
  SUFFIX=$(printf '%s' "$MODE" | tr '[:lower:]' '[:upper:]')
  printf '\033[38;5;172m[RDX:%s]\033[0m' "$SUFFIX"
fi

# Token savings suffix — written by rdx-mode-tracker.js on each turn.
# Refuses symlinks, strips control chars. Empty until first rdx-active turn.
SAVINGS_FILE="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.rdx-statusline-suffix"
if [ -f "$SAVINGS_FILE" ] && [ ! -L "$SAVINGS_FILE" ]; then
  SAVINGS=$(head -c 64 "$SAVINGS_FILE" 2>/dev/null | tr -d '\000-\010\013\014\016-\037\177')
  [ -n "$SAVINGS" ] && printf ' \033[38;5;172m%s\033[0m' "$SAVINGS"
fi
