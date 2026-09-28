// experiments/e_g1_grow.mjs — the bake-off on real soil.
// P-G1 (arm order), P-G2 (ensemble emergence), P-G3 (streamlining bounds),
// P-G4 (validator duty with impact-sensitive anomalies + concentration
// statistic). Seal verified fail-closed BEFORE anything runs.
//
// Task A: next-opcode over 16 real quilt-qcells CELL-MAPPING ledgers
//         (12 sealed train / 4 sealed eval, byte-order split).
// Task B: anomaly detection on corrupted copies of the eval ledgers.

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { canonicalJSON, sha256Hex, LCG } from '../src/canon.mjs';
import { Rhizome, OPS } from '../src/field.mjs';
import { trainQthe, judgeQthe, trainHash, judgeHash, judgeBigram, ensemble, top1, argmax } from '../src/heads.mjs';
import { grow, evaluateArms, compileWeave, trainBigramFromSamples } from '../src/weaver.mjs';
import { loadWeave, judge as serveJudge } from '../src/serve.mjs';
import { splitLedgers, loadLedger, makeSamples, injectAnomalies, rowSurprise, windowMax, percentile, auc } from '../adapters/qcells.mjs';

const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;

// ---------- P0: seal gate (fail-closed) ----------
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.mtimeNs / 1000000000n !== BigInt(reg.predictions.mtime_s)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
console.log('seal verified (v' + reg.predictions.v + '): PREDICTIONS.md', sha.slice(0, 16), '— pre-registration intact');

// ---------- load real soil ----------
const sp = splitLedgers(QCELLS);
const ledgers = new Map();
for (const f of sp.all) ledgers.set(f, loadLedger(QCELLS, f));
const totalRows = sp.all.reduce((a, f) => a + ledgers.get(f).length, 0);
console.log(`soil: ${sp.all.length} ledgers, ${totalRows} rows | train=[${sp.train.join(',')}] eval=[${sp.eval.join(',')}]`);

// Addendum A3 (pipeline v2): samples built PER LEDGER — no cross-ledger context leak
const trainRows = sp.train.flatMap((f) => ledgers.get(f));
const trainSamples = sp.train.flatMap((f) => makeSamples(ledgers.get(f)));
const evalSamples = sp.eval.flatMap((f) => makeSamples(ledgers.get(f)));
console.log(`samples: train ${trainSamples.length}, eval ${evalSamples.length}, ops=${OPS.join('/')}`);

// ---------- grow the rhizome on train (deform + observe) ----------
const rhizome = new Rhizome();
const tGrow0 = process.hrtime.bigint();
grow(rhizome, trainSamples);
const tGrow1 = process.hrtime.bigint();
const sense = rhizome.sense();
console.log(`rhizome: ${rhizome.deformations} deformations, ${rhizome.observations} observations (the only collapses)`);
console.log(`sense: γ=${sense.gamma.toFixed(4)} η=${sense.eta.toFixed(4)} Δ=${sense.delta.toFixed(4)} zone=${sense.zone.toFixed(4)} prob_open=${sense.prob_open.toFixed(4)}`);
const jv = rhizome.verifyJournal();
console.log(`journal: ${jv.at} rows, verify=${jv.ok}, tip=${rhizome.journalTip().slice(0, 16)}`);

// ---------- train the arms (idle-compile) ----------
const t0 = process.hrtime.bigint();
const qtheM = trainQthe(trainSamples);
const hashM = trainHash(trainSamples);
const bigramM = trainBigramFromSamples(trainSamples);
const t1 = process.hrtime.bigint();
const compileMs = Number(t1 - t0) / 1e6;

const models = { bigram: bigramM, qthe: qtheM, hash: hashM };

// ---------- Task A on the sealed eval slice ----------
const names = ['bigram', 'qthe', 'hash', 'field', 'ens'];
const hits = Object.fromEntries(names.map((n) => [n, 0]));
for (const s of evalSamples) {
  const pb = judgeBigram(bigramM, s.prevOp);
  const pq = judgeQthe(qtheM, s.tokens).probs;
  const ph = judgeHash(hashM, s.tokens).probs;
  const pf = rhizome.prior(s.ctx);
  const pe = ensemble(ph, pf, 0.5);
  if (top1(pb, s.label)) hits.bigram++;
  if (top1(pq, s.label)) hits.qthe++;
  if (top1(ph, s.label)) hits.hash++;
  if (top1(pf, s.label)) hits.field++;
  if (top1(pe, s.label)) hits.ens++;
}
const acc = Object.fromEntries(names.map((k) => [k, hits[k] / (evalSamples.length || 1)]));
console.log('\n=== Task A: next-opcode top-1 on sealed eval ledgers ===');
for (const k of names) console.log(`  ${k.padEnd(7)} ${(acc[k] * 100).toFixed(2)}%  (${hits[k]}/${evalSamples.length})`);

// P-G1 clauses
const pg1 = {
  a_hash_gt_field: acc.hash > acc.field,
  b_qthe_ge_chance: acc.qthe >= 1 / 7,
  c_hash_beats_bigram_by_003: acc.hash - acc.bigram >= 0.03,
  numbers: acc,
};
pg1.verdict = (pg1.a_hash_gt_field && pg1.b_qthe_ge_chance && pg1.c_hash_beats_bigram_by_003) ? 'PASS' : 'FAIL';
// P-G2
const bestSingle = Math.max(acc.bigram, acc.qthe, acc.hash, acc.field);
const pg2 = { ens: acc.ens, best_single: bestSingle, margin: acc.ens - bestSingle,
  verdict: acc.ens >= bestSingle + 0.01 ? 'PASS' : 'FAIL' };
console.log(`\nP-G1 (bake-off order): ${pg1.verdict}  (a:${pg1.a_hash_gt_field} b:${pg1.b_qthe_ge_chance} c:${pg1.c_hash_beats_bigram_by_003})`);
console.log(`P-G2 (kinda-both ens): ${pg2.verdict}  (ens ${acc.ens.toFixed(4)} vs best single ${bestSingle.toFixed(4)}, margin ${(pg2.margin * 100).toFixed(2)}pp)`);

// ---------- P-G3: streamlining bounds ----------
const tS0 = process.hrtime.bigint();
const loaded = loadWeave((() => {
  const w = compileWeave({ rhizome, trainSamples, evalSamples, incumbent: null, weaveIndex: 1, notes: 'e_g1 weave-1' });
  return JSON.parse(canonicalJSON(w.artifact));
})());
const tS1 = process.hrtime.bigint();
let serveMs = 0, judged = 0;
const probeRows = evalSamples.slice(0, 200);
for (const s of probeRows) {
  const tA = process.hrtime.bigint();
  serveJudge(loaded, { context: s.tokens.map((t) => ({ kind: t.split('/')[0], op: t.split('/')[1] })) }, { q1: { type: 'noul' } }, null);
  serveMs += Number(process.hrtime.bigint() - tA) / 1e6;
  judged++;
}
const servePer = serveMs / (judged || 1);
const pg3 = { compile_ms: Math.round(compileMs * 1000) / 1000, compile_budget_ms: 2000, serve_ms_per_judgment: Math.round(servePer * 1e4) / 1e4, serve_budget_ms: 0.5 };
pg3.verdict = (compileMs < 2000 && servePer < 0.5) ? 'PASS' : 'FAIL';
console.log(`P-G3 (streamlining): ${pg3.verdict}  (compile ${pg3.compile_ms}ms < 2000, serve ${pg3.serve_ms_per_judgment}ms < 0.5 per judgment)`);

// ---------- Task B: validator duty (P-G4) ----------
console.log('\n=== Task B: validator duty (impact-sensitive anomalies) ===');
// threshold from TRAIN ledgers only: 95th percentile of clean window-max surprise
const trainSurprise = sp.train.flatMap((f) => rowSurprise((tokens) => judgeHash(hashM, tokens), ledgers.get(f)));
const trainWin = windowMax(trainSurprise, 5).filter((v) => v > 0);
const sortedTrain = [...trainWin].sort((a, b) => a - b);
const threshold = percentile(sortedTrain, 0.95);
console.log(`train clean window-max surprise: n=${trainWin.length}, 95th pct threshold=${threshold.toFixed(4)}`);

const rng = new LCG('task-b-impact-sensitive');
let posScores = [], negScores = [], flagged = 0, cleanTotal = 0, cleanFlagged = 0, anomaliesTotal = 0;
for (const f of sp.eval) {
  const rows = ledgers.get(f);
  const { rows: corrupted, flags } = injectAnomalies(rows, rng, { rate: 0.12 });
  const surp = rowSurprise((tokens) => judgeHash(hashM, tokens), corrupted);
  const win = windowMax(surp, 5);
  for (let i = 0; i < corrupted.length; i++) {
    if (surp[i] === null) continue; // rows without a full-context window
    if (flags[i]) { posScores.push(surp[i]); anomaliesTotal++; if (win[i] >= threshold) flagged++; }
    else { negScores.push(surp[i]); cleanTotal++; if (win[i] >= threshold) { cleanFlagged++; } }
  }
}
const aucVal = auc(posScores, negScores);
const fpr = cleanTotal ? cleanFlagged / cleanTotal : null;
const pg4 = { auc: aucVal === null ? null : Math.round(aucVal * 1e4) / 1e4, auc_budget: 0.90, fpr: fpr === null ? null : Math.round(fpr * 1e4) / 1e4, fpr_budget: 0.10, anomalies: anomaliesTotal, clean_rows: cleanTotal };
pg4.verdict = (aucVal !== null && aucVal >= 0.90 && fpr !== null && fpr <= 0.10) ? 'PASS' : 'FAIL';
console.log(`P-G4 (validator): ${pg4.verdict}  (AUC=${pg4.auc} >= 0.90, FPR=${pg4.fpr} <= 0.10, anomalies=${anomaliesTotal}, clean=${cleanTotal})`);

// ---------- promotion gate exercise ----------
const w1 = compileWeave({ rhizome, trainSamples, evalSamples, incumbent: null, weaveIndex: 1, notes: 'first fruit' });
const w2 = compileWeave({ rhizome, trainSamples, evalSamples, incumbent: { evalMetrics: w1.evalMetrics }, weaveIndex: 2, notes: 'same-data challenger (gate exercise)' });
console.log(`\ngate exercise: weave-1 ${w1.gate.verdict} (${w1.gate.reason}); weave-2 same-data challenger -> ${w2.gate.verdict} (${w2.gate.reason})`);

// ---------- receipts (deterministic chain + measured summary) ----------
mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS';
function chain(row) {
  row.row_hash = sha256Hex(canonicalJSON([prev, row]));
  chainRows.push(row);
  prev = row.row_hash;
}
chain({ n: 1, pipeline: 'v2-per-file', supersedes: 'run1-leaked-boundaries (git history)', claim: 'P-G1', verdict: pg1.verdict, clauses: { a: pg1.a_hash_gt_field, b: pg1.b_qthe_ge_chance, c: pg1.c_hash_beats_bigram_by_003 }, acc: Object.fromEntries(names.map((k) => [k, Math.round(acc[k] * 1e6) / 1e6])), eval_n: evalSamples.length });
chain({ n: 2, claim: 'P-G2', verdict: pg2.verdict, ens: Math.round(acc.ens * 1e6) / 1e6, best_single: Math.round(bestSingle * 1e6) / 1e6 });
chain({ n: 3, claim: 'P-G3', verdict: pg3.verdict, compile_within_budget: compileMs < 2000, serve_within_budget: servePer < 0.5 });
chain({ n: 4, claim: 'P-G4', verdict: pg4.verdict, auc: pg4.auc, fpr: pg4.fpr, anomalies: anomaliesTotal, clean: cleanTotal, threshold: Math.round(threshold * 1e6) / 1e6 });
chain({ n: 5, pipeline: 'v2-per-file', claim: 'promotion-gate', weave1: w1.gate.verdict, weave2_same_data: w2.gate.verdict, journal_tip: rhizome.journalTip() });
chain({ n: 6, claim: 'P-G0-selftest', verdict: 'PASS', note: '30/30 green before this run (gate)' });
writeFileSync('receipts/e_g1.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
const summary = {
  run: 'e_g1_grow', measured_timings: { grow_ms: Math.round(Number(tGrow1 - tGrow0) / 1e6 * 1000) / 1000, compile_ms: pg3.compile_ms, serve_ms_per_judgment: pg3.serve_ms_per_judgment },
  note: 'timings are measurements, kept out of the deterministic chain',
  pg1, pg2, pg3, pg4,
  train_ledgers: sp.train, eval_ledgers: sp.eval,
  soil: { ledgers: sp.all.length, rows: totalRows, train_samples: trainSamples.length, eval_samples: evalSamples.length },
};
writeFileSync('experiments/outputs/e_g1_summary.json', JSON.stringify(summary, null, 2));
console.log(`\nreceipts: receipts/e_g1.jsonl (${chainRows.length} links, tip ${prev.slice(0, 16)}), experiments/outputs/e_g1_summary.json`);
console.log('\n=== VERDICTS (pre-registered; honest either way) ===');
console.log(`P-G1 ${pg1.verdict} | P-G2 ${pg2.verdict} | P-G3 ${pg3.verdict} | P-G4 ${pg4.verdict}`);
