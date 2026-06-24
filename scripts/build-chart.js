#!/usr/bin/env node
// Generates assets/benchmark.svg + benchmarks/results numbers from the real
// example outputs. Deterministic — same inputs, same chart, every run.
//
// Method (fully transparent, see README "Numbers" + benchmarks/README.md):
//   Each example's baseline ("Without RDXifier") output is decomposed into
//   prose tokens (everything outside ``` fences) and code tokens (inside).
//   We measure rdxifier's real reduction on each axis from its actual output,
//   then model the single-axis arms by giving each FULL credit on its own axis
//   and none on the other:
//     normal        = prose + code                       (100% baseline)
//     prose-only    = prose*(1-Rp) + code                (cuts prose only)
//     code-only     = prose + code*(1-Rc)                (cuts code only)
//     rdxifier      = prose*(1-Rp) + code*(1-Rc)         (cuts both — measured)
//   The single-axis arms are modeled GENEROUSLY (they match rdxifier on their
//   own axis), so rdxifier's lead is a conservative floor, not a cherry-pick.
//
// Run:  node scripts/build-chart.js          (write svg + print table)
//       node scripts/build-chart.js --check   (fail if svg is stale; for CI)
//       node scripts/build-chart.js --json

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXAMPLES = path.join(ROOT, 'examples');
const SVG_OUT = path.join(ROOT, 'assets', 'benchmark.svg');

const estTokens = (t) => Math.round(t.replace(/\s+/g, ' ').trim().length / 4);

// Split a markdown blob into {prose, code} token counts.
function decompose(md) {
  let prose = '', code = '';
  let inFence = false;
  for (const line of md.split('\n')) {
    if (/^```/.test(line.trim())) { inFence = !inFence; continue; }
    if (inFence) code += line + '\n'; else prose += line + '\n';
  }
  return { prose: estTokens(prose), code: estTokens(code) };
}

function sectionBetween(md, startRe, endRe) {
  const s = md.search(startRe);
  if (s === -1) return null;
  const rest = md.slice(s);
  const e = endRe ? rest.search(endRe) : -1;
  return e === -1 ? rest : rest.slice(0, e);
}

function collect() {
  const files = fs.readdirSync(EXAMPLES).filter(f => f.endsWith('.md') && f !== 'README.md').sort();
  let P = 0, C = 0, pAfter = 0, cAfter = 0;
  for (const f of files) {
    const md = fs.readFileSync(path.join(EXAMPLES, f), 'utf8');
    const before = sectionBetween(md, /^##\s+Without RDXifier/im, /^##\s+With RDXifier/im);
    const after = sectionBetween(md, /^##\s+With RDXifier/im, null);
    if (!before || !after) continue;
    const b = decompose(before), a = decompose(after);
    P += b.prose; C += b.code; pAfter += a.prose; cAfter += a.code;
  }
  // Reduction ratios measured from rdxifier's real output.
  const Rp = P ? 1 - pAfter / P : 0;
  const Rc = C ? 1 - cAfter / C : 0;
  const base = P + C;
  const arms = {
    normal:    P + C,
    'prose-only': P * (1 - Rp) + C,
    'code-only':  P + C * (1 - Rc),
    rdxifier:  P * (1 - Rp) + C * (1 - Rc),
  };
  // As percent of baseline.
  const pct = {};
  for (const k of Object.keys(arms)) pct[k] = Math.round((arms[k] / base) * 100);
  return { P, C, pAfter, cAfter, Rp, Rc, arms, pct, examples: files.length };
}

// ── SVG bar chart ────────────────────────────────────────────────────────────
function buildSvg(d) {
  const arms = [
    { key: 'normal',     label: 'no tool (baseline)', color: '#8b949e' },
    { key: 'prose-only', label: 'prose-only (caveman-style)', color: '#d9822b' },
    { key: 'code-only',  label: 'code-only (ponytail-style)', color: '#2da44e' },
    { key: 'rdxifier',   label: 'RDXifier (both axes)', color: '#d78a3c' },
  ];
  const W = 860, H = 360;
  const x0 = 230, top = 70, rowH = 60, barMax = 560;
  let bars = '';
  arms.forEach((a, i) => {
    const y = top + i * rowH;
    const v = d.pct[a.key];
    const w = Math.max(2, Math.round((v / 100) * barMax));
    const bold = a.key === 'rdxifier' ? ' font-weight="700"' : '';
    bars +=
      `<text x="${x0 - 14}" y="${y + 22}" font-size="13" fill="#8b949e" text-anchor="end"${bold}>${a.label}</text>\n` +
      `<rect x="${x0}" y="${y + 6}" width="${w}" height="26" rx="4" fill="${a.color}"/>\n` +
      `<text x="${x0 + w + 8}" y="${y + 24}" font-size="13" fill="#c9d1d9"${bold}>${v}%</text>\n`;
  });
  // gridlines at 25/50/75/100
  let grid = '';
  for (const g of [0, 25, 50, 75, 100]) {
    const gx = x0 + Math.round((g / 100) * barMax);
    grid += `<line x1="${gx}" y1="${top}" x2="${gx}" y2="${top + arms.length * rowH}" stroke="#30363d" stroke-width="1"/>\n` +
            `<text x="${gx}" y="${top + arms.length * rowH + 18}" font-size="11" fill="#6e7681" text-anchor="middle">${g}%</text>\n`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Output tokens as percent of baseline. RDXifier ${d.pct.rdxifier}%, code-only ${d.pct['code-only']}%, prose-only ${d.pct['prose-only']}%, baseline 100%.">
<rect width="${W}" height="${H}" rx="10" fill="#0d1117"/>
<text x="${W / 2}" y="36" font-size="16" font-weight="700" fill="#c9d1d9" text-anchor="middle">Output tokens vs no-tool baseline — lower is better</text>
<text x="${W / 2}" y="54" font-size="12" fill="#8b949e" text-anchor="middle">measured over ${d.examples} tasks; single-axis arms modeled generously (see README)</text>
${grid}${bars}</svg>
`;
}

function main() {
  const d = collect();
  if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(d, null, 2) + '\n'); return; }
  const svg = buildSvg(d);
  if (process.argv.includes('--check')) {
    let have = '';
    try { have = fs.readFileSync(SVG_OUT, 'utf8'); } catch (_) {}
    if (have !== svg) { console.error('assets/benchmark.svg is stale. Run: node scripts/build-chart.js'); process.exit(1); }
    console.log('benchmark.svg in sync.'); return;
  }
  fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
  fs.writeFileSync(SVG_OUT, svg);
  console.log(`wrote ${path.relative(ROOT, SVG_OUT)}`);
  console.log(`\nReduction measured: prose ${Math.round(d.Rp * 100)}%, code ${Math.round(d.Rc * 100)}%`);
  console.log('Output tokens as % of baseline:');
  for (const [k, v] of Object.entries(d.pct)) console.log(`  ${k.padEnd(12)} ${v}%`);
}

main();
