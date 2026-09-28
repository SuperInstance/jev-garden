// experiments/e_g1b_addendum.mjs — Addendum A1 experiments (sealed v2).
// P-G2b: count-based rhizome prior + train-chosen λ → ens2 vs hash.
// P-G4b: arg-channel tokens, semantic-only anomaly family → AUC/FPR.
// Task A re-report under arg-channel tokens (context; not a re-verdict).

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { canonicalJSON, sha256Hex, LCG } from '../src/canon.mjs';
import { Rhizome, OPS } from '../src/field.mjs';
import { trainQthe, judgeQthe, trainHash, judgeHash, judgeBigram, top1 } from '../src/heads.mjs';
import { grow, trainBigramFromSamples } from '../src/weaver.mjs';
import { splitLedgers, loadLedger, makeSamples, injectAnomalies, rowSurprise, windowMax, percentile, auc } from '../adapters/qcells.mjs';

const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;

// ---------- seal gate (v2) ----------
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
// Addendum A3 (pipeline v2): per-ledger sample building
const trainSamples = sp.train.flatMap((f) => makeSamples(ledgers.get(f)));
const evalSamples = sp.eval.flatMap((f) => makeSamples(ledgers.get(f)));

// grow + train under arg-channel tokens
const rhizome = new Rhizome();
grow(rhizome, trainSamples);
const qtheM = trainQthe(trainSamples);
const hashM = trainHash(trainSamples);
const bigramM = trainBigramFromSamples(trainSamples);

// Task A re-report (context)
const names = ['bigram', 'qthe', 'hash', 'field', 'ens1', 'ens2'];
const hits = Object.fromEntries(names.map((n) => [n, 0]));
for (const s of evalSamples) {
  if (top1(judgeBigram(bigramM, s.prevOp), s.label)) hits.bigram++;
  if (top1(judgeQthe(qtheM, s.tokens).probs, s.label)) hits.qthe++;
  if (top1(judgeHash(hashM, s.tokens).probs, s.label)) hits.hash++;
  if (top1(rhizome.prior(s.ctx), s.label)) hits.field++;
  const ph = judgeHash(hashM, s.tokens).probs;
  const pf = rhizome.prior(s.ctx);
  const pc = rhizome.priorCounted(s.ctx);
  const pe1 = {}, pe2 = {};
  for (const o of OPS) { pe1[o] = 0.5 * ph[o] + 0.5 * pf[o]; pe2[o] = 0.7 * ph[o] + 0.3 * pc[o]; }
  if (top1(pe1, s.label)) hits.ens1++;
  if (top1(pe2, s.label)) hits.ens2++;
}
const acc = Object.fromEntries(names.map((k) => [k, hits[k] / (evalSamples.length || 1)]));
console.log('Task A re-report (arg-channel tokens; context, not a re-verdict):');
for (const k of names) console.log(`  ${k.padEnd(7)} ${(acc[k] * 100).toFixed(2)}%`);

// ---------- P-G2b: λ chosen on TRAIN walk-forward only ----------
const grid = [0.6, 0.7, 0.8, 0.9, 1.0];
const trainByLedger = sp.train.map((f) => makeSamples(ledgers.get(f)));
const wf = grid.map((lam) => {
  let hit = 0, n = 0;
  const rz = new Rhizome();
  for (let t = 0; t < trainByLedger.length; t++) {
    for (const s of trainByLedger[t]) {
      const ph2 = judgeHash(hashM, s.tokens).probs;
      const pc2 = rz.priorCounted(s.ctx);
      const p = {};
      for (const o of OPS) p[o] = lam * ph2[o] + (1 - lam) * pc2[o];
      if (top1(p, s.label)) hit++;
      n++;
    }
    grow(rz, trainByLedger[t]); // the rhizome grows as the quilt uses it
  }
  return { lam, acc: hit / n };
});
const best = wf.reduce((a, b) => (b.acc > a.acc ? b : a));
const lamStar = best.lam;
console.log(`\nλ walk-forward (train only): ${wf.map((w) => `${w.lam}:${(w.acc * 100).toFixed(2)}`).join('  ')}  -> λ* = ${lamStar}`);
// eval under λ*
let ens2hit = 0, hashhit = 0;
for (const s of evalSamples) {
  const ph2 = judgeHash(hashM, s.tokens).probs;
  const pc2 = rhizome.priorCounted(s.ctx);
  const p = {};
  for (const o of OPS) p[o] = lamStar * ph2[o] + (1 - lamStar) * pc2[o];
  if (top1(p, s.label)) ens2hit++;
  if (top1(ph2, s.label)) hashhit++;
}
const ens2acc = ens2hit / evalSamples.length, hashacc = hashhit / evalSamples.length;
const pg2b = { lam_star: lamStar, ens2: Math.round(ens2acc * 1e6) / 1e6, hash: Math.round(hashacc * 1e6) / 1e6, margin: Math.round((ens2acc - hashacc) * 1e6) / 1e6 };
pg2b.verdict = ens2acc >= hashacc + 0.005 ? 'PASS' : 'FAIL';
console.log(`P-G2b (count-prior ens2 vs hash): ${pg2b.verdict}  (ens2 ${(ens2acc * 100).toFixed(2)} vs hash ${(hashacc * 100).toFixed(2)}, margin ${((ens2acc - hashacc) * 100).toFixed(2)}pp)`);

// ---------- P-G4b: semantic anomalies, arg-channel judge ----------
const trainSurprise = sp.train.flatMap((f) => rowSurprise((tokens) => judgeHash(hashM, tokens), ledgers.get(f)));
const trainWin = windowMax(trainSurprise, 5).filter((v) => v > 0);
const threshold = percentile([...trainWin].sort((a, b) => a - b), 0.95);
const rng = new LCG('task-b-impact-sensitive');
const pos = [], neg = [];
let nAnom = 0, nClean = 0, cleanFlagged = 0;
for (const f of sp.eval) {
  const rows = ledgers.get(f);
  const { rows: corrupted, flags } = injectAnomalies(rows, rng, { rate: 0.25, families: 'semantic' });
  const surp = rowSurprise((tokens) => judgeHash(hashM, tokens), corrupted);
  const win = windowMax(surp, 5);
  for (let i = 0; i < corrupted.length; i++) {
    if (surp[i] === null) continue;
    if (flags[i]) { pos.push(surp[i]); nAnom++; }
    else { neg.push(surp[i]); nClean++; if (win[i] >= threshold) cleanFlagged++; }
  }
}
const aucVal = auc(pos, neg);
const fpr = nClean ? cleanFlagged / nClean : null;
const pg4b = {
  auc: aucVal === null ? null : Math.round(aucVal * 1e4) / 1e4,
  fpr: fpr === null ? null : Math.round(fpr * 1e4) / 1e4,
  anomalies: nAnom, clean_rows: nClean, threshold: Math.round(threshold * 1e6) / 1e6,
  note: 'seq/prev structural breaks delegated to the chain reader (quilt-qcells 4254/4254)',
};
pg4b.verdict = (aucVal !== null && aucVal >= 0.85 && fpr !== null && fpr <= 0.10) ? 'PASS' : 'FAIL';
console.log(`\nP-G4b (semantic validator): ${pg4b.verdict}  (AUC=${pg4b.auc} >= 0.85, FPR=${pg4b.fpr} <= 0.10, anomalies=${nAnom}, clean=${nClean})`);

// ---------- receipts ----------
mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-B';
function chain(row) {
  row.row_hash = sha256Hex(canonicalJSON([prev, row]));
  chainRows.push(row);
  prev = row.row_hash;
}
chain({ n: 1, seal: 'v4-pipeline-v2', supersedes: 'run1', claim: 'P-G2b', verdict: pg2b.verdict, ...pg2b });
chain({ n: 2, seal: 'v4-pipeline-v2', supersedes: 'run1', claim: 'P-G4b', verdict: pg4b.verdict, ...pg4b });
chain({ n: 3, claim: 'task-A-context-report', acc: Object.fromEntries(names.map((k) => [k, Math.round(acc[k] * 1e6) / 1e6])), eval_n: evalSamples.length });
chain({ n: 4, claim: 'delegation', structural: 'chain reader owns seq/prev breaks', semantic: 'JEV owns op/arg drift' });
writeFileSync('receipts/e_g1b.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_g1b_summary.json', JSON.stringify({
  run: 'e_g1b_addendum', pg2b, pg4b, lambda_walkforward: wf, task_a_context: acc,
}, null, 2));
console.log(`\nreceipts: receipts/e_g1b.jsonl (${chainRows.length} links, tip ${prev.slice(0, 16)})`);
console.log(`\n=== ADDENDUM VERDICTS === P-G2b ${pg2b.verdict} | P-G4b ${pg4b.verdict}`);
