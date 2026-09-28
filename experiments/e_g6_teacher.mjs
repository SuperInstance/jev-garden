// experiments/e_g6_teacher.mjs — P-G6: live hosted-JEV teacher probe.
// Rich state built from 8 clean chain contexts (jev-quilt law: rich state
// matters — bare state ~33%, rich state 85.3%). Usage receipt recorded
// (pricing-first). NOT part of tests; networked by design.

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { canonicalJSON, sha256Hex } from '../src/canon.mjs';
import { teacherJudge } from '../src/teacher.mjs';
import { splitLedgers, loadLedger } from '../adapters/qcells.mjs';
import { tokenOf, K } from '../src/features.mjs';

const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
const st = statSync('docs/PREDICTIONS.md');
if (sha !== reg.predictions.sha256 || st.size !== reg.predictions.size) { // A4: sha+size bind; mtime is a local witness
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}

const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;
const sp = splitLedgers(QCELLS);
const cleanRows = sp.train.flatMap((f) => loadLedger(QCELLS, f)).slice(0, 40);
const contexts = [];
for (let i = K; i < K + 8; i++) contexts.push(cleanRows.slice(i - K, i).map(tokenOf));
const state = {
  substrate: 'quilt-qcells CELL-MAPPING receipt chain (fnv1a-64, 7 opcodes: LINK/BIND/TICK/EFFECT/VIEW/FORGET/PROOF)',
  doctrine: 'rows are quilt cell events; healthy chains alternate gate BINDs with TICKs, collapse EFFECTs follow readouts, views follow statevector witnesses',
  clean_contexts: contexts,
};
const questions = { in_pattern: { type: 'noul', instructions: 'Are these receipt-chain contexts consistent with a healthy CELL-MAPPING quantum-circuit ledger (in-pattern)?' } };

console.log(`teacher probe: model=jev-latest, state bytes=${JSON.stringify(state).length}, 1 noul question`);
try {
  const receipt = await teacherJudge({ state, questions });
  const noul = receipt.answers?.in_pattern?.noul;
  console.log('teacher answers:', JSON.stringify(receipt.answers));
  console.log('usage receipt:', JSON.stringify(receipt.usage), 'latency', receipt.latency_ms + 'ms');
  const pg6 = { noul, usage_receipted: !!receipt.usage, model: receipt.model, latency_ms: receipt.latency_ms };
  pg6.verdict = (typeof noul === 'number' && noul >= 0.70 && receipt.usage) ? 'PASS' : 'FAIL';
  mkdirSync('receipts', { recursive: true });
  const row = { n: 1, claim: 'P-G6', verdict: pg6.verdict, noul, model: receipt.model, usage: receipt.usage };
  row.row_hash = sha256Hex(canonicalJSON(['JEVG-EXP-GENESIS-E', row]));
  writeFileSync('receipts/e_g6.jsonl', JSON.stringify(row) + '\n');
  writeFileSync('experiments/outputs/e_g6_summary.json', JSON.stringify({ pg6, state_bytes: JSON.stringify(state).length }, null, 2));
  console.log(`\nP-G6 (teacher channel): ${pg6.verdict}  (noul=${noul} >= 0.70, usage receipted)`);
} catch (e) {
  console.error('teacher call FAILED (honest negative):', e.message);
  mkdirSync('receipts', { recursive: true });
  const row = { n: 1, claim: 'P-G6', verdict: 'FAIL', error: e.message.slice(0, 300) };
  row.row_hash = sha256Hex(canonicalJSON(['JEVG-EXP-GENESIS-E', row]));
  writeFileSync('receipts/e_g6.jsonl', JSON.stringify(row) + '\n');
  process.exit(0);
}
