#!/usr/bin/env node
// rdxmin — UserPromptSubmit hook
// Handles /rdx commands, natural language activation/deactivation, and
// per-turn reinforcement.

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getClaudeDir, VALID_MODES, safeWriteFlag, readFlag } = require('./rdx-config');

const claudeDir = getClaudeDir();
const flagPath = path.join(claudeDir, '.rdx-active');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input.replace(/^﻿/, ''));
    const prompt = (data.prompt || '').trim();
    const promptLower = prompt.toLowerCase();

    // Natural language activation
    if (/\b(activate|enable|turn on|start|use)\b.*\brdx\b/i.test(promptLower) ||
        /\brdx\b.*\b(mode|activate|enable|on)\b/i.test(promptLower) ||
        /\brdxif(y|ier)\b/i.test(promptLower)) {
      if (!/\b(stop|disable|turn off|deactivate|off)\b/i.test(promptLower)) {
        const mode = getDefaultMode();
        if (mode !== 'off') safeWriteFlag(flagPath, mode);
      }
    }

    // /rdx slash commands
    if (/^\/rdx(\b|:rdxmin\b)/.test(promptLower)) {
      const parts = promptLower.split(/\s+/);
      const cmd = parts[0];
      const arg = parts[1] || '';

      let mode = null;

      if (cmd === '/rdx' || cmd === '/rdx:rdxmin') {
        if (!arg) {
          mode = getDefaultMode();
        } else if (arg === 'off' || arg === 'stop' || arg === 'disable') {
          mode = 'off';
        } else if (VALID_MODES.includes(arg)) {
          mode = arg;
        }
      }

      if (mode && mode !== 'off') {
        safeWriteFlag(flagPath, mode);
      } else if (mode === 'off') {
        try { fs.unlinkSync(flagPath); } catch (e) {}
      }
    }

    // Natural language deactivation.
    // Only fire when the off-verb actually targets rdx — NOT when rdx merely
    // appears in a sentence that also mentions turning something else off.
    // ("use rdx to turn off the logger" must NOT deactivate.)
    if (/\b(turn off|disable|deactivate|stop|kill|exit)\s+rdx\b/i.test(promptLower) ||
        /\brdx\s+(mode\s+)?(off|stop|disable|deactivate)\b/i.test(promptLower) ||
        /\bnormal mode\b/i.test(promptLower)) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }

    // Per-turn reinforcement
    const activeMode = readFlag(flagPath);
    if (activeMode && activeMode !== 'off') {
      // Inject compact reminder — keeps rdx visible across context compression
      const ladderHint = activeMode === 'ultra'
        ? 'YAGNI extremist: delete before add, challenge req in same breath.'
        : 'Code: YAGNI ladder first (stdlib → native → dep → one line → min code).';

      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext:
            'RDX MODE ACTIVE (' + activeMode + '). ' +
            'Prose: drop articles/filler/pleasantries/hedging. Fragments OK. ' +
            ladderHint + ' ' +
            'Code/commits/security: write normal.'
        }
      }));
    }
  } catch (e) {
    // Silent fail
  }
});
