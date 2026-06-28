#!/usr/bin/env node
// Generates assets/benchmark.svg from REAL measured results — the "reliability"
// chart: each tool's WORST case across every task, as % of the no-tool baseline.
// Anything past 100% means the tool made the answer LONGER than using no tool at
// all (it backfired). That's the metric that actually matters for mixed work.
//
// Source: the committed raw model outputs under benchmarks/results/raw/ and
// benchmarks/results/raw-sonnet/ (produced by run-live.sh / the Sonnet runs).
// Data-driven + CI-checkable: same cells in → same chart out.
//
// Run:  node scripts/build-chart.js          (write svg)
//       node scripts/build-chart.js --check   (fail if stale; for CI)
//       node scripts/build-chart.js --json

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RAW_DIRS = [
  path.join(ROOT, 'benchmarks', 'results', 'raw'),
  path.join(ROOT, 'benchmarks', 'results', 'raw-sonnet'),
];
const SVG_OUT = path.join(ROOT, 'assets', 'benchmark.svg');
const ARMS = [
  { key: 'caveman',  label: 'caveman',  color: '#d9822b' },
  { key: 'ponytail', label: 'ponytail', color: '#cf3b3b' },
  { key: 'rdxifier', label: 'RDXifier', color: '#2da44e' },
];

function tok(file) {
  try { const d = JSON.parse(fs.readFileSync(file, 'utf8')); return d.is_error ? null : d.usage.output_tokens; }
  catch (_) { return null; }
}

// Collect per-(dir,task) baseline and compute each arm's worst % + backfire count.
function collect() {
  const cells = {}; // `${dir}|${task}|${arm}` -> tokens
  for (const dir of RAW_DIRS) {
    let files = [];
    try { files = fs.readdirSync(dir); } catch (_) { continue; }
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const m = f.slice(0, -5).match(/^(.+)__([a-z]+)$/);
      if (!m) continue;
      cells[`${dir}|${m[1]}|${m[2]}`] = tok(path.join(dir, f));
    }
  }
  const tasks = new Set();
  for (const k of Object.keys(cells)) {
    const [dir, task, arm] = k.split('|');
    if (arm === 'vanilla' && cells[k]) tasks.add(`${dir}|${task}`);
  }
  const stat = {};
  for (const a of ARMS) stat[a.key] = { worst: 0, over: 0, n: 0 };
  for (const dt of tasks) {
    const [dir, task] = dt.split('|');
    const base = cells[`${dir}|${task}|vanilla`];
    for (const a of ARMS) {
      const v = cells[`${dir}|${task}|${a.key}`];
      if (!v) continue;
      const pct = Math.round((v / base) * 100);
      stat[a.key].n++;
      if (pct > stat[a.key].worst) stat[a.key].worst = pct;
      if (pct > 100) stat[a.key].over++;
    }
  }
  return { stat, taskCount: tasks.size };
}

function buildSvg(stat, taskCount) {
  const W = 860, H = 340;
  const left = 150, top = 96, rowH = 64, plotW = 620;
  const maxPct = 240;                 // ponytail's 227% needs headroom
  const px = plotW / maxPct;          // px per percent
  const line100 = left + 100 * px;    // the "no tool" baseline

  // backfire zone (>100%) shaded faint red
  let body = `<rect x="${line100}" y="${top - 16}" width="${left + plotW - line100}" height="${ARMS.length * rowH + 8}" fill="#cf3b3b" opacity="0.07"/>`;
  body += `<line x1="${line100}" y1="${top - 16}" x2="${line100}" y2="${top + ARMS.length * rowH - 8}" stroke="#cf3b3b" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  body += `<text x="${line100}" y="${top - 22}" font-size="11" fill="#cf3b3b" text-anchor="middle">100% = no tool</text>`;
  body += `<text x="${(line100 + left + plotW) / 2}" y="${top + ARMS.length * rowH + 6}" font-size="10.5" fill="#cf3b3b" text-anchor="middle" opacity="0.8">⬅ backfire zone: tool made it WORSE than no tool</text>`;

  ARMS.forEach((a, i) => {
    const s = stat[a.key];
    const y = top + i * rowH;
    const w = Math.max(2, s.worst * px);
    const bold = a.key === 'rdxifier' ? ' font-weight="700"' : '';
    const badge = s.over === 0 ? 'never backfires' : `backfired ${s.over}/${taskCount} tasks`;
    body += `<text x="${left - 12}" y="${y + 21}" font-size="14" fill="#c9d1d9" text-anchor="end"${bold}>${a.label}</text>` +
            `<rect x="${left}" y="${y + 4}" width="${w}" height="30" rx="4" fill="${a.color}"/>` +
            `<text x="${left + w + 9}" y="${y + 18}" font-size="14" fill="#c9d1d9"${bold}>${s.worst}%</text>` +
            `<text x="${left + w + 9}" y="${y + 32}" font-size="10.5" fill="#8b949e">${badge}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Worst-case output size across ${taskCount} tasks as percent of the no-tool baseline. ponytail 227% (backfired 4 tasks), caveman 130% (1), RDXifier 83% (never backfires).">
<rect width="${W}" height="${H}" rx="10" fill="#0d1117"/>
<text x="${W / 2}" y="34" font-size="17" font-weight="700" fill="#c9d1d9" text-anchor="middle">Worst case across ${taskCount} tasks — lower is better, past 100% is a betrayal</text>
<text x="${W / 2}" y="54" font-size="11.5" fill="#8b949e" text-anchor="middle">output size vs using no tool at all (Haiku + Sonnet; code, prose &amp; judgment prompts)</text>
${body}</svg>
`;
}

function main() {
  const { stat, taskCount } = collect();
  if (process.argv.includes('--json')) { console.log(JSON.stringify({ stat, taskCount }, null, 2)); return; }
  const svg = buildSvg(stat, taskCount);
  if (process.argv.includes('--check')) {
    let have = '';
    try { have = fs.readFileSync(SVG_OUT, 'utf8'); } catch (_) {}
    if (have !== svg) { console.error('assets/benchmark.svg is stale. Run: node scripts/build-chart.js'); process.exit(1); }
    console.log('benchmark.svg in sync.'); return;
  }
  fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
  fs.writeFileSync(SVG_OUT, svg);
  console.log(`wrote ${path.relative(ROOT, SVG_OUT)} — worst case: ` +
    ARMS.map(a => `${a.label} ${stat[a.key].worst}%`).join(', ') + ` over ${taskCount} tasks`);
}

main();
