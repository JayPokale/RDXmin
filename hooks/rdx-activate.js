#!/usr/bin/env node
// rdxifier — SessionStart hook
//
// 1. Writes flag at $CLAUDE_CONFIG_DIR/.rdx-active
// 2. Resets session turn counter
// 3. Emits rdxifier ruleset (filtered to active level) as system context
// 4. Nudges user to configure statusline if missing

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getClaudeDir, safeWriteFlag } = require('./rdx-config');

const claudeDir = getClaudeDir();
const flagPath = path.join(claudeDir, '.rdx-active');
const turnsPath = path.join(claudeDir, '.rdx-session-turns');
const settingsPath = path.join(claudeDir, 'settings.json');

const mode = getDefaultMode();

if (mode === 'off') {
  try { fs.unlinkSync(flagPath); } catch (e) {}
  try { fs.unlinkSync(turnsPath); } catch (e) {}
  process.stdout.write('OK');
  process.exit(0);
}

// 1. Write flag
safeWriteFlag(flagPath, mode);

// Reset session turn counter (new session = fresh savings count)
try { fs.writeFileSync(turnsPath, '0', { mode: 0o600 }); } catch (e) {}

// 2. Read SKILL.md — single source of truth for behavior
const modeLabel = mode;
let skillContent = '';
try {
  skillContent = fs.readFileSync(
    path.join(__dirname, '..', 'skills', 'rdxifier', 'SKILL.md'), 'utf8'
  );
} catch (e) {}

let output;

if (skillContent) {
  const body = skillContent.replace(/^---[\s\S]*?---\s*/, '');

  const filtered = body.split('\n').reduce((acc, line) => {
    const tableRowMatch = line.match(/^\|\s*\*\*(\S+?)\*\*\s*\|/);
    if (tableRowMatch) {
      if (tableRowMatch[1] === modeLabel) acc.push(line);
      return acc;
    }
    const exampleMatch = line.match(/^- (\S+?):\s/);
    if (exampleMatch) {
      if (exampleMatch[1] === modeLabel) acc.push(line);
      return acc;
    }
    acc.push(line);
    return acc;
  }, []);

  output = 'RDX MODE ACTIVE — level: ' + modeLabel + '\n\n' + filtered.join('\n');
} else {
  // Fallback ruleset when SKILL.md not found
  output =
    'RDX MODE ACTIVE — level: ' + modeLabel + '\n\n' +
    'RDXifier: maximum-efficiency dev mode. Zero-fluff prose. YAGNI-first code.\n\n' +
    '## Persistence\n\n' +
    'ACTIVE EVERY RESPONSE. Off only: "stop rdx" / "normal mode". Switch: `/rdx lite|full|ultra`.\n\n' +
    '## Prose\n\n' +
    'Drop articles/filler/pleasantries/hedging. Fragments OK. Technical terms exact.\n\n' +
    '## Code\n\n' +
    'Ladder: YAGNI → reuse → stdlib → native → installed dep → one line → min code.\n' +
    'No unrequested abstractions. Deletion over addition. Shortest diff wins.';
}

// 3. Detect missing statusline config
try {
  let hasStatusline = false;
  if (fs.existsSync(settingsPath)) {
    const raw = fs.readFileSync(settingsPath, 'utf8').replace(/^﻿/, '');
    const settings = JSON.parse(raw);
    if (settings.statusLine) hasStatusline = true;
  }

  if (!hasStatusline) {
    const scriptPath = path.join(__dirname, 'rdx-statusline.sh');
    const command = `bash "${scriptPath}"`;
    const statusLineSnippet =
      '"statusLine": { "type": "command", "command": ' + JSON.stringify(command) + ' }';
    output += '\n\n' +
      'STATUSLINE SETUP NEEDED: The rdxifier plugin includes a statusline badge showing active mode ' +
      '(e.g. [RDX], [RDX:ULTRA]) with token savings. It is not configured yet. ' +
      'To enable, add this to ' + settingsPath + ': ' +
      statusLineSnippet + ' ' +
      'Proactively offer to set this up for the user on first interaction.';
  }
} catch (e) {}

process.stdout.write(output);
