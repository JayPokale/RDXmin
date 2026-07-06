# rdxmin — statusline badge for Claude Code (Windows / PowerShell)
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

# Input-side savings from the tool-output compressor ledger (mirrors the sh version).
$suffix = ''
$stats = Join-Path $configDir '.rdx-compress-stats.json'
if (Test-Path -LiteralPath $stats -PathType Leaf) {
  $raw = Get-Content -LiteralPath $stats -Raw
  if ($raw -match '"savedChars":(\d+)') {
    $tok = [long]$Matches[1] / 4
    if ($tok -ge 1000000)   { $suffix = " $([math]::Floor($tok / 1000000))M tok" }
    elseif ($tok -ge 1000)  { $suffix = " $([math]::Floor($tok / 1000))k tok" }
    elseif ($tok -gt 0)     { $suffix = " $([math]::Floor($tok)) tok" }
    if ($suffix) { $suffix = " $([char]0x21E3)$($suffix.Trim())" }
  }
}

if ([string]::IsNullOrEmpty($mode) -or $mode -eq 'full') {
  Write-Host -NoNewline "$orange[RDX]$reset$suffix"
} else {
  Write-Host -NoNewline ("{0}[RDX:{1}]{2}{3}" -f $orange, $mode.ToUpper(), $reset, $suffix)
}
