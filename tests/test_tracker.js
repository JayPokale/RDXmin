#!/usr/bin/env node
// Integration tests for rdx-mode-tracker.js — drives it via stdin with a temp
// CLAUDE_CONFIG_DIR and asserts the resulting flag state.
// Run: node --test tests/test_tracker.js

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const TRACKER = path.join(__dirname, '..', 'hooks', 'rdx-mode-tracker.js');

// Run the tracker with a given prompt against a fresh temp config dir.
// Returns the flag contents after the run (or null if the flag was removed).
function runTracker(prompt, { preActive } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rdx-trk-'));
  const flagPath = path.join(dir, '.rdx-active');
  if (preActive) fs.writeFileSync(flagPath, preActive, { mode: 0o600 });

  try {
    execFileSync(process.execPath, [TRACKER], {
      input: JSON.stringify({ prompt }),
      env: { ...process.env, CLAUDE_CONFIG_DIR: dir, RDX_DEFAULT_MODE: 'full' },
      encoding: 'utf8',
      timeout: 5000,
    });
  } catch (e) { /* tracker silent-fails; we assert on flag state */ }

  let flag = null;
  try { flag = fs.readFileSync(flagPath, 'utf8').trim(); } catch (e) {}
  fs.rmSync(dir, { recursive: true, force: true });
  return flag;
}

// ── Activation ───────────────────────────────────────────────────────────────

test('/rdx activates at default level', () => {
  assert.equal(runTracker('/rdx'), 'full');
});

test('/rdx ultra activates ultra', () => {
  assert.equal(runTracker('/rdx ultra'), 'ultra');
});

test('natural language "activate rdx" activates', () => {
  assert.equal(runTracker('please activate rdx'), 'full');
});

// ── Deactivation ─────────────────────────────────────────────────────────────

test('"stop rdx" deactivates', () => {
  assert.equal(runTracker('stop rdx', { preActive: 'full' }), null);
});

test('"/rdx off" deactivates', () => {
  assert.equal(runTracker('/rdx off', { preActive: 'full' }), null);
});

test('"normal mode" deactivates', () => {
  assert.equal(runTracker('normal mode', { preActive: 'full' }), null);
});

// ── Regression: must NOT deactivate on unrelated "off"/"stop" ─────────────────

test('REGRESSION: "use rdx to turn off the logger" stays active', () => {
  assert.equal(runTracker('use rdx to turn off the logger', { preActive: 'full' }), 'full');
});

test('REGRESSION: "rdx please stop the server" stays active', () => {
  assert.equal(runTracker('rdx please stop the server', { preActive: 'full' }), 'full');
});
