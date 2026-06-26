#!/usr/bin/env bash
# Live 4-arm benchmark: vanilla vs caveman vs ponytail vs rdxifier.
#
# Drives the authenticated `claude` CLI headlessly. Each arm differs ONLY in the
# system prompt appended (the respective SKILL.md body); vanilla appends nothing.
# Plugins/CLAUDE.md/tone hooks are neutralized via an isolated HOME + config dir
# holding only credentials, so the only variable is the arm.
#
# Measures real usage.output_tokens + visible answer size per (arm, task).
# Resumable: skips a cell whose raw JSON already exists.
#
# Usage: bash benchmarks/run-live.sh [model]
set -uo pipefail

MODEL="${1:-claude-haiku-4-5-20251001}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAW="$HERE/results/raw"
mkdir -p "$RAW"

# Isolated config: credentials only, no settings/CLAUDE.md/plugins.
ISO="$(mktemp -d)"
cp "$HOME/.claude/.credentials.json" "$ISO/" 2>/dev/null || { echo "no credentials found"; exit 1; }
trap 'rm -rf "$ISO"' EXIT

# Arm system prompts (frontmatter stripped). vanilla = none.
CAVEMAN_SKILL="/home/jay/Desktop/caveman/skills/caveman/SKILL.md"
PONYTAIL_SKILL="/home/jay/Desktop/ponytail/skills/ponytail/SKILL.md"
RDX_SKILL="$HERE/../skills/rdxifier/SKILL.md"

strip_fm() { awk 'BEGIN{n=0} /^---[[:space:]]*$/{n++; next} n>=2{print} n<2 && !/^---/ && n==1{print}' "$1" 2>/dev/null || cat "$1"; }
for f in "$CAVEMAN_SKILL" "$PONYTAIL_SKILL" "$RDX_SKILL"; do [ -f "$f" ] || { echo "missing skill: $f"; exit 1; }; done
strip_fm "$CAVEMAN_SKILL" > "$ISO/caveman.txt"
strip_fm "$PONYTAIL_SKILL" > "$ISO/ponytail.txt"
strip_fm "$RDX_SKILL" > "$ISO/rdxifier.txt"

# Tasks: id<TAB>kind<TAB>prompt
TASKS=$(cat <<'EOF'
debounce	coding	Add debounce to a search input that currently fires an API call on every keystroke. Show the code.
cache	coding	Add a cache layer for our user profile API responses. Show the code.
auth-bug	coding	Our auth middleware rejects valid tokens at the exact expiry boundary (it uses currentTime > expiry). Find and fix the root cause.
pooling	noncoding	Explain how database connection pooling works and why it helps.
rest-graphql	noncoding	Summarize the main tradeoffs between REST and GraphQL for a new API.
regex-concept	noncoding	Explain what a regular expression backreference is, with one short example.
EOF
)

run_cell() {
  local arm="$1" task_id="$2" prompt="$3"
  local out="$RAW/${task_id}__${arm}.json"
  [ -f "$out" ] && { echo "  skip $task_id/$arm (cached)"; return; }
  local args=(-p "$prompt" --model "$MODEL" --output-format json)
  [ "$arm" != "vanilla" ] && args+=(--append-system-prompt-file "$ISO/${arm}.txt")
  echo "  run  $task_id/$arm"
  # </dev/null is critical: without it `claude -p` consumes the while-read
  # loop's stdin (the task heredoc) and the loop exits after one iteration.
  ( cd /tmp && timeout 120 env HOME=/tmp CLAUDE_CONFIG_DIR="$ISO" claude "${args[@]}" </dev/null ) > "$out" 2>/dev/null \
    || echo "    (call failed for $task_id/$arm)"
}

echo "model: $MODEL"
while IFS=$'\t' read -r id kind prompt; do
  [ -z "$id" ] && continue
  echo "task: $id ($kind)"
  for arm in vanilla caveman ponytail rdxifier; do
    run_cell "$arm" "$id" "$prompt"
  done
done <<< "$TASKS"

echo "done. raw JSON in $RAW/"
