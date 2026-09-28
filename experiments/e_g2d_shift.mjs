// experiments/e_g2d_shift.mjs — P-G2d (Addendum A5, seal v6).
// Hard world under distribution shift: the garden watches H1 of each ladder-echo
// ledger (fresh memory only), then judges H2. Hardness gate FIRST (prediction-based
// difficulty meter — quilt-jepa round-2 law L2 applied here): pooled frozen-head
// H2 accuracy must be < 0.90 or the run is VOID-AS-REGISTERED. Claim: pooled
// ens3 (λ·head + (1-λ)·H1-memory prior, λ fit on H1 only) ≥ head + 0.02.

import { readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { canonicalJSON, sha256Hex } from '../src/canon.mjs';
import { Rhizome, OPS } from '../src/field.mjs';
import { trainHash, judgeHash, top1 } from '../src/heads.mjs';
import { grow } from '../src/weaver.mjs';
import { loadLedger, makeSamples } from '../adapters/qcells.mjs';

const SHIFT_DIR = new URL('./outputs/shift_family/', import.meta.url).pathname;

// seal gate (v6) — sha+size bind (A4: mtime is a local witness)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const mdBytes = readFileSync('docs/PREDICTIONS.md');
const sha = sha256Hex(mdBytes);
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.size !== BigInt(reg.predictions.size)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
if (reg.predictions.v < 6) { console.error('P-G2d requires seal v6+'); process.exit(2); }
console.log('seal verified (v' + reg.predictions.v + '):', sha.slice(0, 16));

// soil presence + construction receipt check (fail-closed)
const LEDGERS = ['ladder7_echo3', 'ladder8_echo4', 'ladder9_echo4', 'ladder8_echo6'];
const cr = JSON.parse(readFileSync(new URL('./outputs/shift_family/construction_receipt.json', import.meta.url), 'utf8'));
for (const name of LEDGERS) {
  const f = new URL('./outputs/shift_family/' + name + '.jsonl', import.meta.url).pathname;
  if (!existsSync(f)) { console.error('missing shift soil: ' + name); process.exit(2); }
  const want = cr.ledgers.find((l) => l.name === name);
  const got = sha256Hex(readFileSync(f));
  if (!want || want.sha256 !== got) { console.error('soil sha mismatch: ' + name); process.exit(2); }
}
console.log('shift soil verified: 4 ledgers, construction receipts match');

// frozen head (pipeline v2: per-ledger samples from the 12 train ledgers)
const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;
const { splitLedgers } = await import('../adapters/qcells.mjs');
const sp = splitLedgers(QCELLS);
const ledgers = new Map();
for (const f of sp.all) ledgers.set(f, loadLedger(QCELLS, f));
const hashM = trainHash(sp.train.flatMap((f) => makeSamples(ledgers.get(f))));

const grid = [0.0, 0.3, 0.5, 0.7, 0.9, 1.0];
let headHit = 0, ensHit = 0, n = 0;
const perLedger = [];
for (const name of LEDGERS) {
  const rows = loadLedger(SHIFT_DIR, name + '.jsonl');
  const samples = makeSamples(rows);
  const half = Math.floor(samples.length / 2);
  const H1 = samples.slice(0, half), H2 = samples.slice(half);
  if (!H1.length || !H2.length) { console.error('empty half for ' + name); process.exit(2); }
  const rz = new Rhizome();
  grow(rz, H1); // watch H1: fresh memory of the live stream
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
  perLedger.push({ ledger: name, h1: H1.length, h2: H2.length, lam_star: lamStar,
    head_h2: Math.round(hHit / H2.length * 1e6) / 1e6,
    ens3_h2: Math.round(eHit / H2.length * 1e6) / 1e6 });
  console.log(`  ${name}: λ*=${lamStar}  head ${(hHit / H2.length * 100).toFixed(2)}%  ens3 ${(eHit / H2.length * 100).toFixed(2)}%  (watched ${H1.length}, judged ${H2.length})`);
}
const headAcc = headHit / n, ensAcc = ensHit / n;
const hardGate = headAcc < 0.90;
const pg2d = {
  head: Math.round(headAcc * 1e6) / 1e6,
  ens3: Math.round(ensAcc * 1e6) / 1e6,
  margin: Math.round((ensAcc - headAcc) * 1e6) / 1e6,
  judged_rows: n,
  hardness_gate: { threshold: 0.90, head: Math.round(headAcc * 1e6) / 1e6, held: hardGate },
  protocol: 'watch H1 -> judge H2 on shift soil, λ fit on H1 only; void unless head < 0.90'
};
pg2d.verdict = !hardGate ? 'VOID_SOIL_NOT_HARD' : (ensAcc >= headAcc + 0.02 ? 'PASS' : 'FAIL');
console.log(`\nP-G2d (hard world): ${pg2d.verdict}  (head ${(headAcc * 100).toFixed(2)} vs ens3 ${(ensAcc * 100).toFixed(2)}, margin ${((ensAcc - headAcc) * 100).toFixed(2)}pp over ${n} rows; hardness gate ${hardGate ? 'HELD' : 'MISSED'})`);

mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-D';
const chain = (row) => { row.row_hash = sha256Hex(canonicalJSON([prev, row])); chainRows.push(row); prev = row.row_hash; };
chain({ n: 1, seal: 'v6-pipeline-v2', claim: 'P-G2d', verdict: pg2d.verdict, ...pg2d });
chain({ n: 2, claim: 'per-ledger', detail: perLedger });
chain({ n: 3, claim: 'soil', ledgers: LEDGERS, construction_receipt_sha256: sha256Hex(readFileSync(new URL('./outputs/shift_family/construction_receipt.json', import.meta.url).pathname)) });
writeFileSync('receipts/e_g2d.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_g2d_summary.json', JSON.stringify({ run: 'e_g2d_shift', pg2d, perLedger }, null, 2));
console.log(`receipts: receipts/e_g2d.jsonl (tip ${prev.slice(0, 16)})`);
