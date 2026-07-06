#!/usr/bin/env node
// rdxmin — PostToolUse hook: tool-output compression (the input axis).
//
// Prompt-side rules shrink what the agent WRITES; this shrinks what it READS.
// Oversized tool results (Bash dumps, subagent reports, web fetches) get their
// repetitive middle elided — head kept (command context), tail kept (results/
// errors), error-looking lines salvaged from the cut — and the trimmed version
// replaces what the model sees via `updatedToolOutput`. Deterministic, zero
// LLM, zero network. Small outputs pass through untouched.
//
// Correctness guardrails (why this never touches Read/Edit/Write):
//   - Read output feeds later Edit old_string matching — eliding it makes the
//     model edit against text it never saw. Allowlist below, never a blocklist.
//   - Error lines in the elided middle are salvaged, capped, and kept verbatim.
//   - If compression doesn't shrink the output, the original is kept.
//   - Never throws: a broken hook must not break the tool pipeline.
//
// Compression tracks the /rdx mode flag (off → untouched). Tunables via env:
//   RDX_COMPRESS=0                 — kill switch
//   RDX_COMPRESS_MAX_CHARS         — outputs at/under this size pass through
//   RDX_COMPRESS_HEAD_LINES        — lines kept from the top
//   RDX_COMPRESS_TAIL_LINES        — lines kept from the bottom
//   RDX_COMPRESS_TOOLS=Bash,Grep   — override the tool allowlist
//
// Savings accrue in <claudeDir>/.rdx-compress-stats.json for the statusline.

const fs = require('fs');
const path = require('path');
const { getClaudeDir, readFlag } = require('./rdx-config');

// Mode → thresholds. Tighter mode, tighter budget. Env overrides all.
const THRESHOLDS = {
  lite:  { maxChars: 16000, headLines: 100, tailLines: 80 },
  full:  { maxChars: 8000,  headLines: 60,  tailLines: 40 },
  ultra: { maxChars: 5000,  headLines: 40,  tailLines: 30 },
};

// Tools whose output is safe to elide. Read/Edit/Write are absent on purpose:
// their output feeds exact-match edits. mcp__* are read-only info tools.
const SAFE_TOOLS = ['Bash', 'Agent', 'WebFetch', 'WebSearch', 'Grep', 'Glob'];
const SALVAGE_RE = /\b(error|err!|fail(ed|ure|ing)?|exception|traceback|panic|fatal|denied|refused|timed?[ _-]?out|assert(ion)?|segfault|npe|undefined reference|cannot find|not found|warning)\b/i;
const MAX_SALVAGED = 12;      // error lines rescued from the elided middle
const MAX_SALVAGE_LINE = 300; // per-line char cap on salvaged lines

function toolAllowed(name) {
  if (!name || typeof name !== 'string') return false;
  const list = process.env.RDX_COMPRESS_TOOLS
    ? process.env.RDX_COMPRESS_TOOLS.split(',').map(s => s.trim()).filter(Boolean)
    : SAFE_TOOLS;
  return list.includes(name) || (!process.env.RDX_COMPRESS_TOOLS && name.startsWith('mcp__'));
}

function envInt(name, fallback) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function limitsFor(mode) {
  const base = THRESHOLDS[mode] || THRESHOLDS.full;
  return {
    maxChars: envInt('RDX_COMPRESS_MAX_CHARS', base.maxChars),
    headLines: envInt('RDX_COMPRESS_HEAD_LINES', base.headLines),
    tailLines: envInt('RDX_COMPRESS_TAIL_LINES', base.tailLines),
  };
}

// Pull a plain-text payload out of tool_response, whatever its shape.
function extractText(response) {
  if (response == null) return null;
  if (typeof response === 'string') return response;
  if (Array.isArray(response)) {
    const parts = response.map(b => (b && typeof b.text === 'string') ? b.text : extractText(b && b.content)).filter(Boolean);
    return parts.length ? parts.join('\n') : null;
  }
  if (typeof response === 'object') {
    const parts = [];
    for (const key of ['stdout', 'stderr', 'output', 'content', 'text', 'result']) {
      const val = response[key];
      if (typeof val === 'string' && val) parts.push(val);
      else if (val && typeof val === 'object') { const t = extractText(val); if (t) parts.push(t); }
    }
    if (parts.length) return parts.join('\n');
    try { return JSON.stringify(response); } catch (e) { return null; }
  }
  return String(response);
}

// Keep head + tail; salvage error-looking lines from the elided middle so the
// one line that mattered in a 3000-line build log survives the cut.
function compress(text, limits) {
  const { maxChars, headLines, tailLines } = limits;
  const lines = text.split('\n');

  if (lines.length <= headLines + tailLines) {
    // Big in bytes, few lines (one giant line) — hard char cut.
    const keep = Math.floor(maxChars / 2);
    const elided = text.length - 2 * keep;
    if (elided <= 0) return null;
    return text.slice(0, keep) +
      '\n... [rdx: elided ' + elided.toLocaleString('en-US') + ' chars from the middle] ...\n' +
      text.slice(-keep);
  }

  const head = lines.slice(0, headLines);
  const tail = lines.slice(-tailLines);
  const middle = lines.slice(headLines, lines.length - tailLines);

  const salvaged = [];
  for (const line of middle) {
    if (salvaged.length >= MAX_SALVAGED) break;
    if (SALVAGE_RE.test(line)) salvaged.push(line.length > MAX_SALVAGE_LINE ? line.slice(0, MAX_SALVAGE_LINE) + '…' : line);
  }

  const marker = '... [rdx: elided ' + middle.length.toLocaleString('en-US') +
    ' lines — kept first ' + headLines + ', last ' + tailLines +
    (salvaged.length ? ', and ' + salvaged.length + ' error-like line(s) below' : '') + '] ...';

  const out = head.concat([marker], salvaged, tail).join('\n');
  return out.length < text.length ? out : null;
}

// Best-effort savings ledger. Races between parallel tool calls can drop a
// count — stats only, never worth a lock file.
function recordSavings(saved) {
  try {
    const p = path.join(getClaudeDir(), '.rdx-compress-stats.json');
    try { if (fs.lstatSync(p).isSymbolicLink()) return; } catch (e) { if (e.code !== 'ENOENT') return; }
    let stats = { savedChars: 0, events: 0 };
    try {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (parsed && Number.isFinite(parsed.savedChars) && Number.isFinite(parsed.events)) stats = parsed;
    } catch (e) {}
    stats.savedChars += saved;
    stats.events += 1;
    const tmp = p + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(stats), { mode: 0o600 });
    fs.renameSync(tmp, p);
  } catch (e) {}
}

// Full pipeline on one hook payload → updated output string, or null to keep
// the original. Pure given (payload, mode, env) — this is what the tests hit.
function processPayload(payload, mode) {
  if (!payload || typeof payload !== 'object') return null;
  if (!mode || mode === 'off') return null;
  if (process.env.RDX_COMPRESS === '0') return null;
  if (!toolAllowed(payload.tool_name)) return null;

  const text = extractText(payload.tool_response != null ? payload.tool_response : payload.tool_output);
  const limits = limitsFor(mode);
  if (!text || text.length <= limits.maxChars) return null;
  return compress(text, limits);
}

function main() {
  let input = '';
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const payload = JSON.parse(input.replace(/^﻿/, ''));
      const mode = readFlag(path.join(getClaudeDir(), '.rdx-active'));
      const updated = processPayload(payload, mode);
      if (updated == null) return;
      const original = extractText(payload.tool_response != null ? payload.tool_response : payload.tool_output);
      recordSavings(original.length - updated.length);
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          updatedToolOutput: updated,
        },
      }));
    } catch (e) {} // silent — never break the tool pipeline
  });
}

if (require.main === module) main();

module.exports = { extractText, compress, limitsFor, toolAllowed, processPayload, THRESHOLDS, SAFE_TOOLS };
