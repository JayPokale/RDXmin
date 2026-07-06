#!/usr/bin/env node
// Tool-output compressor tests — correctness guardrails and never-crash.
// Run: node --test tests/test_compress.js

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  extractText, compress, limitsFor, toolAllowed, processPayload, THRESHOLDS,
} = require('../hooks/rdx-compress-output');

const FULL = THRESHOLDS.full;

function bigOutput(lines, prefix) {
  return Array.from({ length: lines }, (_, i) => `${prefix || 'line'} ${i} ${'x'.repeat(80)}`).join('\n');
}

// ── extractText ──────────────────────────────────────────────────────────────

test('extractText handles string, object, and array shapes', () => {
  assert.equal(extractText('plain'), 'plain');
  assert.equal(extractText({ stdout: 'out', stderr: 'err' }), 'out\nerr');
  assert.equal(extractText([{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }]), 'a\nb');
  assert.equal(extractText(null), null);
});

// ── compress ─────────────────────────────────────────────────────────────────

test('compress keeps head and tail, elides middle', () => {
  const text = bigOutput(500);
  const out = compress(text, FULL);
  assert.ok(out.length < text.length);
  assert.ok(out.startsWith('line 0 '));
  assert.ok(out.trimEnd().endsWith('x'.repeat(80)));
  assert.ok(out.includes('line 499 '));         // tail survived
  assert.ok(out.includes('[rdx: elided'));      // marker present
  assert.ok(!out.includes('line 250 '));        // middle gone
});

test('compress salvages error lines from the elided middle', () => {
  const lines = bigOutput(500).split('\n');
  lines[250] = 'FATAL ERROR: connection refused at db.js:42';
  const out = compress(lines.join('\n'), FULL);
  assert.ok(out.includes('FATAL ERROR: connection refused at db.js:42'));
  assert.ok(out.includes('error-like line(s) below'));
});

test('compress hard-cuts a single giant line by chars', () => {
  const text = 'y'.repeat(50000);
  const out = compress(text, FULL);
  assert.ok(out.length < text.length);
  assert.ok(out.includes('elided'));
});

test('compress returns null when no win', () => {
  assert.equal(compress('short', FULL), null);
});

// ── limitsFor / modes ────────────────────────────────────────────────────────

test('tighter mode, tighter thresholds', () => {
  assert.ok(THRESHOLDS.ultra.maxChars < THRESHOLDS.full.maxChars);
  assert.ok(THRESHOLDS.full.maxChars < THRESHOLDS.lite.maxChars);
  assert.equal(limitsFor('unknown-mode').maxChars, THRESHOLDS.full.maxChars);
});

test('env vars override thresholds', () => {
  process.env.RDX_COMPRESS_MAX_CHARS = '1234';
  assert.equal(limitsFor('full').maxChars, 1234);
  delete process.env.RDX_COMPRESS_MAX_CHARS;
});

// ── toolAllowed — the correctness allowlist ──────────────────────────────────

test('Read/Edit/Write are NEVER compressed (Edit old_string correctness)', () => {
  assert.equal(toolAllowed('Read'), false);
  assert.equal(toolAllowed('Edit'), false);
  assert.equal(toolAllowed('Write'), false);
  assert.equal(toolAllowed('NotebookEdit'), false);
});

test('Bash, Agent, mcp__ tools are compressible', () => {
  assert.equal(toolAllowed('Bash'), true);
  assert.equal(toolAllowed('Agent'), true);
  assert.equal(toolAllowed('mcp__tokensave__tokensave_read'), true);
});

test('RDX_COMPRESS_TOOLS overrides the allowlist', () => {
  process.env.RDX_COMPRESS_TOOLS = 'Grep';
  assert.equal(toolAllowed('Bash'), false);
  assert.equal(toolAllowed('Grep'), true);
  assert.equal(toolAllowed('mcp__x__y'), false); // override disables mcp__ default
  delete process.env.RDX_COMPRESS_TOOLS;
});

// ── processPayload — full pipeline ───────────────────────────────────────────

test('processPayload compresses a big Bash output', () => {
  const out = processPayload({ tool_name: 'Bash', tool_response: { stdout: bigOutput(500) } }, 'full');
  assert.ok(out && out.includes('[rdx: elided'));
});

test('processPayload passes small outputs through (null)', () => {
  assert.equal(processPayload({ tool_name: 'Bash', tool_response: 'tiny' }, 'full'), null);
});

test('processPayload does nothing when mode is off or missing', () => {
  const payload = { tool_name: 'Bash', tool_response: bigOutput(500) };
  assert.equal(processPayload(payload, 'off'), null);
  assert.equal(processPayload(payload, null), null);
});

test('RDX_COMPRESS=0 is a kill switch', () => {
  process.env.RDX_COMPRESS = '0';
  assert.equal(processPayload({ tool_name: 'Bash', tool_response: bigOutput(500) }, 'full'), null);
  delete process.env.RDX_COMPRESS;
});

test('processPayload never throws on garbage', () => {
  assert.equal(processPayload(null, 'full'), null);
  assert.equal(processPayload({}, 'full'), null);
  assert.equal(processPayload({ tool_name: 'Bash' }, 'full'), null);
  assert.equal(processPayload({ tool_name: 'Bash', tool_response: 12345 }, 'full'), null);
});
