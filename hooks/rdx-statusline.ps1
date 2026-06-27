# rdxifier — statusline badge for Claude Code (Windows / PowerShell)
# Mirrors rdx-statusline.sh. Reads the mode flag and savings suffix, renders an orange badge.

$ErrorActionPreference = 'SilentlyContinue'

$configDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
$flag = Join-Path $configDir '.rdx-active'

if (-not (Test-Path -LiteralPath $flag -PathType Leaf)) { exit 0 }

# Hard-cap read, lowercase, strip anything outside [a-z0-9-]
$mode = (Get-Content -LiteralPath $flag -Raw -TotalCount 1).ToLower()
$mode = ($mode -replace '[^a-z0-9-]', '')

switch ($mode) {
  'off'   { }
  'lite'  { }
  'full'  { }
  'ultra' { }
  default { exit 0 }
}

$esc = [char]27
$orange = "$esc[38;5;172m"
$reset = "$esc[0m"

if ([string]::IsNullOrEmpty($mode) -or $mode -eq 'full') {
  Write-Host -NoNewline "$orange[RDX]$reset"
} else {
  Write-Host -NoNewline ("{0}[RDX:{1}]{2}" -f $orange, $mode.ToUpper(), $reset)
}
