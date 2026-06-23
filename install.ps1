# rdxifier — PowerShell shim. Delegates to the Node installer via npx.
#
#   irm https://raw.githubusercontent.com/jaypokale/rdxifier/main/install.ps1 | iex
#
# Or, from a local clone:  ./install.ps1 [flags]
# Flags forward to bin/install.js (see: npx rdxifier --help).

$ErrorActionPreference = 'Stop'
$Repo = 'jaypokale/rdxifier'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error 'rdxifier: Node.js >=18 is required. Install from https://nodejs.org and re-run.'
  exit 1
}

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$local = Join-Path $scriptDir 'bin/install.js'
if ($scriptDir -and (Test-Path $local)) {
  & node $local @args
  exit $LASTEXITCODE
}

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Error 'rdxifier: npx not found (ships with npm). Install Node.js >=18 from https://nodejs.org.'
  exit 1
}

& npx -y "github:$Repo" -- @args
exit $LASTEXITCODE
