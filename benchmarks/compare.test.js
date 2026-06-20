#!/usr/bin/env node
// Tests for the deterministic comparison harness.
// Run: node --test benchmarks/compare.test.js

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const SCRIPT = path.join(__dirname, 'compare.js');

test('compare.js --json emits valid rows for every example', () => {
  const out = execFileSync(process.execPath, [SCRIPT, '--json'], { encoding: 'utf8' });
  const rows = JSON.parse(out);
  assert.ok(Array.isArray(rows));
  assert.ok(rows.length >= 4, 'expected at least 4 examples');
  for (const r of rows) {
    assert.ok(r.example, 'row has example name');
    assert.ok(r.before.tokens > 0, 'before has tokens');
    assert.ok(r.after.tokens > 0, 'after has tokens');
    // rdxifier must actually reduce — that's the whole point
    assert.ok(r.after.tokens < r.before.tokens, `${r.example}: after should be smaller than before`);
    assert.ok(r.reduction.tokens > 0, `${r.example}: token reduction should be positive`);
  }
});

test('overall reduction is meaningful (>40%)', () => {
  const out = execFileSync(process.execPath, [SCRIPT, '--json'], { encoding: 'utf8' });
  const rows = JSON.parse(out);
  const before = rows.reduce((a, r) => a + r.before.tokens, 0);
  const after = rows.reduce((a, r) => a + r.after.tokens, 0);
  const pct = Math.round(((before - after) / before) * 100);
  assert.ok(pct > 40, `overall reduction ${pct}% should exceed 40%`);
});
