// experiments/e_g5_determinism.mjs — P-G5: JS garden vs Python twin,
// byte-identical hash-arm weave core. Weights serialize as integer
// micro-units (floor(w*1e6+0.5)) so float repr never crosses substrates.

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { canonicalJSON, sha256Hex } from '../src/canon.mjs';
import { Rhizome } from '../src/field.mjs';
import { trainHash } from '../src/heads.mjs';
import { grow } from '../src/weaver.mjs';
import { splitLedgers, loadLedger, makeSamples } from '../adapters/qcells.mjs';

// seal gate (any current version)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.mtimeNs / 1000000000n !== BigInt(reg.predictions.mtime_s)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
console.log('seal verified (v' + reg.predictions.v + '):', sha.slice(0, 16));

const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;
const sp = splitLedgers(QCELLS);
const trainSamples = sp.train.flatMap((f) => makeSamples(loadLedger(QCELLS, f))); // pipeline v2: per-ledger

// same pipeline as the twin: fresh rhizome, grow, train hash
const rhizome = new Rhizome();
grow(rhizome, trainSamples);
const hashM = trainHash(trainSamples);

const Wm = hashM.W.map((w) => {
  const sparse = {};
  for (let i = 0; i < w.length; i++) if (w[i] !== 0) sparse[String(i)] = Math.round(w[i] * 1e6);
  return sparse;
});
const bm = Array.from(hashM.b, (x) => Math.round(x * 1e6));
const core = {
  schema: 'jev-garden/weave-core-v1',
  index: 1,
  journal_tip: rhizome.journalTip(),
  journal_len: rhizome.journal.length,
  hyper: { lr: 0.5, epochs: 12, wd: 0.0001, clip: 5, K: 3, HB: 2048, ens_lambda: 0.5, wormhole_weight: 0.3 },
  arms: { hash: { W: Wm, b: bm } },
};
mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/weave_core_js.json', canonicalJSON(core));

// python twin
const py = spawnSync('python3', ['ref/garden_ref.py', QCELLS, 'experiments/outputs/weave_core_py.json'], { encoding: 'utf8' });
if (py.status !== 0) { console.error('twin failed:', py.stderr); process.exit(1); }
console.log('twin:', py.stdout.trim());

const js = readFileSync('experiments/outputs/weave_core_js.json', 'utf8');
const pyo = readFileSync('experiments/outputs/weave_core_py.json', 'utf8');
const identical = js === pyo;
let firstDiff = -1;
if (!identical) {
  for (let i = 0; i < Math.max(js.length, pyo.length); i++) if (js[i] !== pyo[i]) { firstDiff = i; break; }
}
console.log(`\nJS core bytes: ${js.length} | PY core bytes: ${pyo.length}`);
console.log(`journal tips: js=${core.journal_tip.slice(0, 16)} (see twin line above)`);
const verdict = identical ? 'PASS' : 'FAIL';
console.log(`P-G5 (cross-substrate byte-identity): ${verdict}${identical ? '' : ` — first diff at byte ${firstDiff}: js=...${js.slice(Math.max(0, firstDiff - 40), firstDiff + 40)}... py=...${pyo.slice(Math.max(0, firstDiff - 40), firstDiff + 40)}...`}`);

mkdirSync('receipts', { recursive: true });
const row = { n: 1, claim: 'P-G5', verdict, js_bytes: js.length, py_bytes: pyo.length, journal_tip: core.journal_tip, journal_len: core.journal_len };
row.row_hash = sha256Hex(canonicalJSON(['JEVG-EXP-GENESIS-D2', row]));
writeFileSync('receipts/e_g5.jsonl', JSON.stringify(row) + '\n');
console.log('receipts: receipts/e_g5.jsonl');
process.exit(0); // verdict printed; honest either way
