#!/usr/bin/env node
// rdxmin — SessionStart hook
//
// 1. Writes flag at $CLAUDE_CONFIG_DIR/.rdx-active
// 2. Resets session turn counter
// 3. Emits rdxmin ruleset (filtered to active level) as system context
// 4. Nudges user to configure statusline if missing
// 5. Major-version update notice (majors only, cached, fail-silent)

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getClaudeDir, safeWriteFlag } = require('./rdx-config');

// ── Update-notice helpers (pure — tested directly) ─────────────────────────
// Minor/patch releases stay quiet: a nudge per major is signal, more is spam.
const UPDATE_CACHE_MS = 3 * 24 * 60 * 60 * 1000;

function majorOf(v) {
  const m = /^(\d+)\./.exec(String(v || ''));
  return m ? parseInt(m[1], 10) : null;
}

// Notice line for a major jump, else null.
function majorUpdateNotice(installed, latest) {
  const i = majorOf(installed), l = majorOf(latest);
  if (i == null || l == null || l <= i) return null;
  return '\n\nRDXMIN UPDATE AVAILABLE: v' + latest + ' (major; you run v' + installed + '). ' +
    'Mention this to the user once: update with `claude plugin update rdxmin@rdxmin` or `npx rdxmin`.';
}

function installedVersion() {
  try {
    return JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', '.claude-plugin', 'plugin.json'), 'utf8')).version;
  } catch (e) { return null; } // standalone-hooks install → no manifest → skip
}

// Registry lookup, cached on disk. Network capped at 1.5s inside the 5s hook budget.
async function latestVersion(cachePath) {
  try {
    const c = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (c && Date.now() - c.checkedAt < UPDATE_CACHE_MS) return c.latest;
  } catch (e) {}
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch('https://registry.npmjs.org/rdxmin/latest', { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const latest = (await res.json()).version;
    try {
      fs.writeFileSync(cachePath, JSON.stringify({ checkedAt: Date.now(), latest }), { mode: 0o600 });
    } catch (e) {}
    return latest;
  } catch (e) { return null; }
}

// ── Hook body ───────────────────────────────────────────────────────────────
function run() {
  const claudeDir = getClaudeDir();
  const flagPath = path.join(claudeDir, '.rdx-active');
  const settingsPath = path.join(claudeDir, 'settings.json');

  const mode = getDefaultMode();

  if (mode === 'off') {
    try { fs.unlinkSync(flagPath); } catch (e) {}
    process.stdout.write('OK');
    process.exit(0);
  }

  // 1. Write flag
  safeWriteFlag(flagPath, mode);

  // 2. Read SKILL.md — single source of truth for behavior
  const modeLabel = mode;
  let skillContent = '';
  try {
    skillContent = fs.readFileSync(
      path.join(__dirname, '..', 'skills', 'rdx', 'SKILL.md'), 'utf8'
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
      'RDXmin: maximum-efficiency dev mode. Zero-fluff prose. YAGNI-first code.\n\n' +
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
        'STATUSLINE SETUP NEEDED: The rdxmin plugin includes a statusline badge showing active mode ' +
        '(e.g. [RDX], [RDX:ULTRA]) with token savings. It is not configured yet. ' +
        'To enable, add this to ' + settingsPath + ': ' +
        statusLineSnippet + ' ' +
        'Proactively offer to set this up for the user on first interaction.';
    }
  } catch (e) {}

  // 4. Update notice, then emit. RDX_UPDATE_CHECK=0 disables.
  (async () => {
    try {
      if (process.env.RDX_UPDATE_CHECK !== '0') {
        const installed = installedVersion();
        if (installed) {
          const latest = await latestVersion(path.join(claudeDir, '.rdx-update-check.json'));
          const notice = majorUpdateNotice(installed, latest);
          if (notice) output += notice;
        }
      }
    } catch (e) {}
    process.stdout.write(output);
  })();
}

if (require.main === module) run();

module.exports = { majorOf, majorUpdateNotice };
