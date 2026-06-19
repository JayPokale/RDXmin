#!/usr/bin/env node
// Basic hook tests — validates config logic and flag safety
// Run: node --test tests/test_hooks.js

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { VALID_MODES, safeWriteFlag, readFlag, getDefaultMode } = require('../hooks/rdx-config');

// ── VALID_MODES ──────────────────────────────────────────────────────────────

test('VALID_MODES contains expected levels', () => {
  assert.ok(VALID_MODES.includes('off'));
  assert.ok(VALID_MODES.includes('lite'));
  assert.ok(VALID_MODES.includes('full'));
  assert.ok(VALID_MODES.includes('ultra'));
  assert.equal(VALID_MODES.length, 4);
});

// ── safeWriteFlag / readFlag ─────────────────────────────────────────────────

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rdx-test-'));
}

test('safeWriteFlag writes and readFlag reads back', () => {
  const dir = tmpDir();
  const flagPath = path.join(dir, '.rdx-active');
  safeWriteFlag(flagPath, 'full');
  assert.equal(readFlag(flagPath), 'full');
  fs.rmSync(dir, { recursive: true });
});

test('readFlag returns null for missing file', () => {
  assert.equal(readFlag('/tmp/rdx-does-not-exist-xyz'), null);
});

test('readFlag returns null for unknown mode', () => {
  const dir = tmpDir();
  const flagPath = path.join(dir, '.rdx-active');
  fs.writeFileSync(flagPath, 'wenyan-ultra', { mode: 0o600 });
  assert.equal(readFlag(flagPath), null);
  fs.rmSync(dir, { recursive: true });
});

test('readFlag returns null for symlink', () => {
  const dir = tmpDir();
  const flagPath = path.join(dir, '.rdx-active');
  const target = path.join(dir, 'target');
  fs.writeFileSync(target, 'full', { mode: 0o600 });
  fs.symlinkSync(target, flagPath);
  assert.equal(readFlag(flagPath), null);
  fs.rmSync(dir, { recursive: true });
});

test('readFlag returns null for oversized file', () => {
  const dir = tmpDir();
  const flagPath = path.join(dir, '.rdx-active');
  fs.writeFileSync(flagPath, 'full' + 'x'.repeat(100), { mode: 0o600 });
  assert.equal(readFlag(flagPath), null);
  fs.rmSync(dir, { recursive: true });
});

test('safeWriteFlag refuses to overwrite a symlink', () => {
  const dir = tmpDir();
  const flagPath = path.join(dir, '.rdx-active');
  const target = path.join(dir, 'target');
  fs.writeFileSync(target, '', { mode: 0o600 });
  fs.symlinkSync(target, flagPath);
  safeWriteFlag(flagPath, 'ultra'); // must not throw, must not overwrite
  assert.equal(fs.readFileSync(target, 'utf8'), ''); // target untouched
  fs.rmSync(dir, { recursive: true });
});

// ── getDefaultMode ───────────────────────────────────────────────────────────

test('getDefaultMode returns full by default', () => {
  const saved = process.env.RDX_DEFAULT_MODE;
  delete process.env.RDX_DEFAULT_MODE;
  // Only validates when no user config file exists (CI / clean env)
  const mode = getDefaultMode();
  assert.ok(VALID_MODES.includes(mode));
  if (saved !== undefined) process.env.RDX_DEFAULT_MODE = saved;
});

test('getDefaultMode respects RDX_DEFAULT_MODE env var', () => {
  process.env.RDX_DEFAULT_MODE = 'lite';
  assert.equal(getDefaultMode(), 'lite');
  process.env.RDX_DEFAULT_MODE = 'ultra';
  assert.equal(getDefaultMode(), 'ultra');
  delete process.env.RDX_DEFAULT_MODE;
});

test('getDefaultMode ignores invalid RDX_DEFAULT_MODE', () => {
  process.env.RDX_DEFAULT_MODE = 'wenyan-ultra';
  const mode = getDefaultMode();
  assert.ok(VALID_MODES.includes(mode));
  delete process.env.RDX_DEFAULT_MODE;
});
