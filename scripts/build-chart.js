#!/usr/bin/env node
// Generates assets/benchmark.svg from REAL measured results.
//
// Source: benchmarks/results/summary.json — frozen output of
// `node benchmarks/aggregate.js --json`, which aggregates 24 live model runs
// (4 arms x 6 tasks) produced by benchmarks/run-live.sh. Regenerate the data
// with that script; regenerate the chart here.
//
// The chart plots visible answer size (tokens of the delivered answer) as a
// percent of the vanilla baseline, split into coding and non-coding so it shows
// honestly where each tool wins. Lower = leaner.
//
// Run:  node scripts/build-chart.js          (write svg)
//       node scripts/build-chart.js --check   (fail if stale; for CI)

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SUMMARY = path.join(ROOT, 'benchmarks', 'results', 'summary.json');
const SVG_OUT = path.join(ROOT, 'assets', 'benchmark.svg');

const ARMS = [
  { key: 'vanilla',  label: 'vanilla',  color: '#8b949e' },
  { key: 'caveman',  label: 'caveman',  color: '#d9822b' },
  { key: 'ponytail', label: 'ponytail', color: '#2da44e' },
  { key: 'rdxifier', label: 'RDXifier', color: '#d78a3c' },
];
const METRIC = 'ans'; // visible answer tokens

function pct(base, v) { return base ? Math.round((v / base) * 100) : 0; }

function buildSvg(sum) {
  const groups = [
    { seg: 'coding', title: 'Coding tasks (n=3)' },
    { seg: 'noncoding', title: 'Non-coding tasks (n=3)' },
  ];
  const W = 860, H = 430;
  const left = 120, top = 90, groupGap = 80, barH = 22, barGap = 8;
  const scale = 5.4; // px per percent (100% ≈ 540px)

  let body = '';
  // legend
  ARMS.forEach((a, i) => {
    const lx = 120 + i * 150;
    body += `<rect x="${lx}" y="54" width="12" height="12" rx="2" fill="${a.color}"/>` +
            `<text x="${lx + 18}" y="64" font-size="12" fill="#8b949e">${a.label}</text>`;
  });

  let y = top;
  for (const g of groups) {
    body += `<text x="${left}" y="${y - 8}" font-size="14" font-weight="600" fill="#c9d1d9">${g.title}</text>`;
    const base = sum[g.seg] ? sum.vanilla[g.seg][METRIC] : 0;
    ARMS.forEach((a) => {
      const v = pct(base, sum[a.key][g.seg][METRIC]);
      const w = Math.max(2, Math.round(v * scale / 100 * 100) / 100);
      const bold = a.key === 'rdxifier' ? ' font-weight="700"' : '';
      body += `<text x="${left - 10}" y="${y + 16}" font-size="12" fill="#8b949e" text-anchor="end"${bold}>${a.label}</text>` +
              `<rect x="${left}" y="${y + 2}" width="${w}" height="${barH}" rx="3" fill="${a.color}"/>` +
              `<text x="${left + w + 7}" y="${y + 18}" font-size="12" fill="#c9d1d9"${bold}>${v}%</text>`;
      y += barH + barGap;
    });
    y += groupGap;
  }
  // baseline gridline at 100%
  const gx = left + Math.round(100 * scale);
  body += `<line x1="${gx}" y1="${top - 4}" x2="${gx}" y2="${y - groupGap}" stroke="#30363d" stroke-width="1" stroke-dasharray="3 3"/>` +
          `<text x="${gx}" y="${top - 14}" font-size="10" fill="#6e7681" text-anchor="middle">100% = vanilla</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Visible answer size as percent of vanilla baseline, measured over 24 live model runs. Coding: rdxifier 14%, ponytail 29%, caveman 46%. Non-coding: caveman 79%, rdxifier 96%, ponytail 121%.">
<rect width="${W}" height="${H}" rx="10" fill="#0d1117"/>
<text x="${W / 2}" y="28" font-size="16" font-weight="700" fill="#c9d1d9" text-anchor="middle">Visible answer size vs vanilla — measured, lower is better</text>
<text x="${W / 2}" y="44" font-size="11" fill="#8b949e" text-anchor="middle">24 live runs (Haiku 4.5, 4 arms x 6 tasks); answer tokens as % of no-tool baseline</text>
${body}</svg>
`;
}

function main() {
  let summary;
  try { summary = JSON.parse(fs.readFileSync(SUMMARY, 'utf8')); }
  catch (e) { console.error('missing benchmarks/results/summary.json — run: node benchmarks/aggregate.js --json > benchmarks/results/summary.json'); process.exit(1); }
  const svg = buildSvg(summary.sum);

  if (process.argv.includes('--check')) {
    let have = '';
    try { have = fs.readFileSync(SVG_OUT, 'utf8'); } catch (_) {}
    if (have !== svg) { console.error('assets/benchmark.svg is stale. Run: node scripts/build-chart.js'); process.exit(1); }
    console.log('benchmark.svg in sync.'); return;
  }
  fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
  fs.writeFileSync(SVG_OUT, svg);
  console.log(`wrote ${path.relative(ROOT, SVG_OUT)} from real results`);
}

main();
