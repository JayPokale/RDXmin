#!/usr/bin/env node
// rdxifier — deterministic comparison harness.
//
// Measures the reduction between the "Without RDXifier" and "With RDXifier"
// sections of every file in ../examples/. No API key, no network — it parses
// the committed example outputs and reports words / estimated tokens / lines.
//
// This is the REPRODUCIBLE half of benchmarking: given fixed sample outputs,
// the numbers never drift. For live model-quality comparison, see
// promptfooconfig.yaml (requires an API key).
//
// Run:  node benchmarks/compare.js
//       node benchmarks/compare.js --json

const fs = require('fs');
const path = require('path');

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

// ~4 chars/token is the standard rough estimate for English + code.
function estTokens(text) {
  return Math.round(text.replace(/\s+/g, ' ').trim().length / 4);
}

function countWords(text) {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

function countLines(text) {
  return text.trim() ? text.trim().split('\n').length : 0;
}

// Split an example into the "before" (no plugin) and "after" (rdxifier) halves.
// Sections are delimited by "## Without RDXifier" and "## With RDXifier".
function splitExample(md) {
  const withIdx = md.search(/^##\s+With RDXifier/im);
  const withoutIdx = md.search(/^##\s+Without RDXifier/im);
  if (withIdx === -1 || withoutIdx === -1) return null;
  const before = md.slice(withoutIdx, withIdx);
  const after = md.slice(withIdx);
  return { before, after };
}

function measure(text) {
  return { words: countWords(text), tokens: estTokens(text), lines: countLines(text) };
}

function pct(before, after) {
  if (before === 0) return 0;
  return Math.round(((before - after) / before) * 100);
}

function main() {
  const asJson = process.argv.includes('--json');
  const files = fs.readdirSync(EXAMPLES_DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .sort();

  const rows = [];
  for (const f of files) {
    const md = fs.readFileSync(path.join(EXAMPLES_DIR, f), 'utf8');
    const split = splitExample(md);
    if (!split) continue;
    const before = measure(split.before);
    const after = measure(split.after);
    rows.push({
      example: f.replace(/\.md$/, ''),
      before,
      after,
      reduction: {
        words: pct(before.words, after.words),
        tokens: pct(before.tokens, after.tokens),
        lines: pct(before.lines, after.lines),
      },
    });
  }

  if (asJson) {
    process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
    return;
  }

  // Plaintext table
  const sumBefore = rows.reduce((a, r) => a + r.before.tokens, 0);
  const sumAfter = rows.reduce((a, r) => a + r.after.tokens, 0);

  console.log('RDXifier — measured reduction (examples/*.md)\n');
  console.log('example            before→after tok   words%  tokens%  lines%');
  console.log('-----------------  ----------------   ------  -------  ------');
  for (const r of rows) {
    const name = r.example.padEnd(17);
    const tok = `${r.before.tokens}→${r.after.tokens}`.padEnd(16);
    console.log(
      `${name}  ${tok}   ${String(r.reduction.words).padStart(5)}%  ` +
      `${String(r.reduction.tokens).padStart(6)}%  ${String(r.reduction.lines).padStart(5)}%`
    );
  }
  console.log('-----------------  ----------------   ------  -------  ------');
  console.log(`OVERALL token reduction: ${sumBefore}→${sumAfter}  (${pct(sumBefore, sumAfter)}% fewer tokens)`);
}

main();
