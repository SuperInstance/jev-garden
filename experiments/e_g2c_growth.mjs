// experiments/e_g2c_growth.mjs — P-G2c (Addendum A2, sealed v3).
// The living-model claim in its honest form: the garden watches the first
// half of each live eval ledger (H1), then judges the second half (H2).
// Fresh memory of the watched stream vs a frozen head.

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { canonicalJSON, sha256Hex } from '../src/canon.mjs';
import { Rhizome, OPS } from '../src/field.mjs';
import { trainHash, judgeHash, top1 } from '../src/heads.mjs';
import { grow } from '../src/weaver.mjs';
import { splitLedgers, loadLedger, makeSamples } from '../adapters/qcells.mjs';

const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;

// seal gate (v3)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || st.size !== reg.predictions.size) { // A4: sha+size bind; mtime is a local witness
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
console.log('seal verified (v' + reg.predictions.v + ', addendum re-run):', sha.slice(0, 16));

const sp = splitLedgers(QCELLS);
const ledgers = new Map();
for (const f of sp.all) ledgers.set(f, loadLedger(QCELLS, f));
const hashM = trainHash(sp.train.flatMap((f) => makeSamples(ledgers.get(f)))); // pipeline v2: per-ledger

const grid = [0.0, 0.3, 0.5, 0.7, 0.9, 1.0];
let headHit = 0, ensHit = 0, n = 0;
const perLedger = [];
for (const f of sp.eval) {
  const rows = ledgers.get(f);
  const samples = makeSamples(rows);
  const half = Math.floor(samples.length / 2);
  const H1 = samples.slice(0, half), H2 = samples.slice(half);
  if (!H1.length || !H2.length) continue;
  // watch H1: the rhizome grows from the live stream (fresh memory only)
  const rz = new Rhizome();
  grow(rz, H1);
  // λ fit on the watched data (H1); H2 untouched until the verdict
  const fit = grid.map((lam) => {
    let hit = 0;
    for (const s of H1) {
      const ph = judgeHash(hashM, s.tokens).probs;
      const pc = rz.priorCounted(s.ctx);
      const p = {};
      for (const o of OPS) p[o] = lam * ph[o] + (1 - lam) * pc[o];
      if (top1(p, s.label)) hit++;
    }
    return { lam, acc: hit / H1.length };
  });
  const lamStar = fit.reduce((a, b) => (b.acc > a.acc ? b : a)).lam;
  let hHit = 0, eHit = 0;
  for (const s of H2) {
    const ph = judgeHash(hashM, s.tokens).probs;
    if (top1(ph, s.label)) hHit++;
    const pc = rz.priorCounted(s.ctx);
    const p = {};
    for (const o of OPS) p[o] = lamStar * ph[o] + (1 - lamStar) * pc[o];
    if (top1(p, s.label)) eHit++;
  }
  headHit += hHit; ensHit += eHit; n += H2.length;
  perLedger.push({ ledger: f, h1: H1.length, h2: H2.length, lam_star: lamStar,
    head_h2: Math.round(hHit / H2.length * 1e6) / 1e6,
    ens3_h2: Math.round(eHit / H2.length * 1e6) / 1e6 });
  console.log(`  ${f}: λ*=${lamStar}  head ${(hHit / H2.length * 100).toFixed(2)}%  ens3 ${(eHit / H2.length * 100).toFixed(2)}%  (watched ${H1.length}, judged ${H2.length})`);
}
const headAcc = headHit / n, ensAcc = ensHit / n;
const pg2c = { head: Math.round(headAcc * 1e6) / 1e6, ens3: Math.round(ensAcc * 1e6) / 1e6, margin: Math.round((ensAcc - headAcc) * 1e6) / 1e6, judged_rows: n, protocol: 'watch H1 -> judge H2, λ fit on H1 only' };
pg2c.verdict = ensAcc >= headAcc + 0.01 ? 'PASS' : 'FAIL';
console.log(`\nP-G2c (growth-as-used): ${pg2c.verdict}  (ens3 ${(ensAcc * 100).toFixed(2)} vs head ${(headAcc * 100).toFixed(2)}, margin ${((ensAcc - headAcc) * 100).toFixed(2)}pp over ${n} judged rows)`);

mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-C';
const chain = (row) => { row.row_hash = sha256Hex(canonicalJSON([prev, row])); chainRows.push(row); prev = row.row_hash; };
chain({ n: 1, seal: 'v4-pipeline-v2', supersedes: 'run1', claim: 'P-G2c', verdict: pg2c.verdict, ...pg2c });
chain({ n: 2, claim: 'per-ledger', detail: perLedger });
writeFileSync('receipts/e_g2c.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_g2c_summary.json', JSON.stringify({ run: 'e_g2c_growth', pg2c, perLedger }, null, 2));
console.log(`receipts: receipts/e_g2c.jsonl (tip ${prev.slice(0, 16)})`);
