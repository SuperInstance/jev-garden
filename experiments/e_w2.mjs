// experiments/e_w2.mjs — P-W2 (Addendum A7, seal v8): weave-2 sense table.
// (a) compile weave-v2 from the sealed train slice; (b) evaluate serve arms
// ens2 (0.5/0.5, v1 law) vs ens3 (0.4/0.4/0.2 with the sense-table field arm
// rebuilt from the SERIALIZED table) on the sealed eval slice; (c) P-W2a:
// run the Python twin and byte-compare weave-core-v2 (hash arm micro-units +
// arms.field). Fail-closed seal gate (A4: sha+size bind).

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { canonicalJSON, sha256Hex } from '../src/canon.mjs';
import { Rhizome } from '../src/field.mjs';
import { trainHash, trainQthe, judgeHash, judgeQthe, top1 } from '../src/heads.mjs';
import { grow, compileWeaveV2, evaluateServeArms } from '../src/weaver.mjs';
import { SenseTablePrior } from '../src/sensetable.mjs';
import { splitLedgers, loadLedger, makeSamples } from '../adapters/qcells.mjs';

// seal gate (v8)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.size !== BigInt(reg.predictions.size)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
if (reg.predictions.v < 8) { console.error('P-W2 requires seal v8+'); process.exit(2); }
console.log('seal verified (v' + reg.predictions.v + '):', sha.slice(0, 16));

const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;
const sp = splitLedgers(QCELLS);
const trainSamples = sp.train.flatMap((f) => makeSamples(loadLedger(QCELLS, f))); // pipeline v2: per-ledger
const evalSamples = sp.eval.flatMap((f) => makeSamples(loadLedger(QCELLS, f)));

// compile weave-v2
const rhizome = new Rhizome();
grow(rhizome, trainSamples);
const { artifact, serveMetrics } = compileWeaveV2({
  rhizome, trainSamples, evalSamples, weaveIndex: 2,
  notes: 'weave-2 (A7): first weave carrying the rhizome sense table',
});
mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/weave_v2_js.json', canonicalJSON(artifact));
console.log('weave-v2 compiled: artifact_sha256=' + artifact.artifact_sha256.slice(0, 16) +
  ' field_cells=' + Object.keys(artifact.arms.field.cells).length +
  ' observed_ctx=' + artifact.arms.field.observed.length);

// serve-roundtrip honesty: reload the artifact through the SERVE path (v2) and
// re-evaluate ens3 — the served ensemble must reproduce the compile-time number.
const reloaded = JSON.parse(readFileSync('experiments/outputs/weave_v2_js.json', 'utf8'));
// eslint-disable-next-line
const { loadWeave } = await import('../src/serve.mjs');
const loaded = loadWeave(reloaded);
let servedHits = 0;
for (const s of evalSamples) {
  const ph = judgeHash(loaded.hash, s.tokens).probs;
  const pq = judgeQthe(loaded.qthe, s.tokens).probs;
  const pf = loaded.field.prior(s.ctx);
  const probs = {};
  for (const o of ['LINK', 'BIND', 'TICK', 'EFFECT', 'VIEW', 'FORGET', 'PROOF']) {
    probs[o] = loaded.ens3.wh * ph[o] + loaded.ens3.wq * pq[o] + loaded.ens3.wf * pf[o];
  }
  if (top1(probs, s.label)) servedHits++;
}
const servedEns3 = servedHits / (evalSamples.length || 1);
console.log('serve-roundtrip ens3=' + servedEns3.toFixed(4) + ' (compile-time ' + serveMetrics.ens3.toFixed(4) + ')');
const roundtripOk = Math.abs(servedEns3 - serveMetrics.ens3) < 1e-12;

// P-W2a: twin byte-compare (core-v2 shape: hash arm micro-units + arms.field)
const hashM = trainHash(trainSamples);
const Wm = hashM.W.map((w) => {
  const sparse = {};
  for (let i = 0; i < w.length; i++) if (w[i] !== 0) sparse[String(i)] = Math.round(w[i] * 1e6);
  return sparse;
});
const bm = Array.from(hashM.b, (x) => Math.round(x * 1e6));
const core = {
  schema: 'jev-garden/weave-core-v2',
  index: 1,
  journal_tip: rhizome.journalTip(),
  journal_len: rhizome.journal.length,
  hyper: { lr: 0.5, epochs: 12, wd: 0.0001, clip: 5, K: 3, HB: 2048, ens_lambda: 0.5, wormhole_weight: 0.3, ens3: { wh: 0.4, wq: 0.4, wf: 0.2 } },
  arms: { hash: { W: Wm, b: bm }, field: rhizome.senseTable() },
};
writeFileSync('experiments/outputs/weave_core_v2_js.json', canonicalJSON(core));
const py = spawnSync('python3', ['ref/garden_ref.py', QCELLS, 'experiments/outputs/weave_core_v2_py.json'], { encoding: 'utf8' });
if (py.status !== 0) { console.error('twin failed:', py.stderr); process.exit(1); }
console.log('twin:', py.stdout.trim());
const js = readFileSync('experiments/outputs/weave_core_v2_js.json', 'utf8');
const pyo = readFileSync('experiments/outputs/weave_core_v2_py.json', 'utf8');
const identical = js === pyo;
let firstDiff = -1;
if (!identical) {
  for (let i = 0; i < Math.max(js.length, pyo.length); i++) if (js[i] !== pyo[i]) { firstDiff = i; break; }
}

// verdicts
const pW2a = identical;
const pW2b = serveMetrics.ens3 >= serveMetrics.ens2 - 0.005;
console.log('\nP-W2a (cross-substrate byte-identity, core-v2): ' + (pW2a ? 'PASS' : 'FAIL') +
  ` — js=${js.length}B py=${pyo.lengthB ?? pyo.length + 'B'}${identical ? '' : ` first diff @${firstDiff}: js=...${js.slice(Math.max(0, firstDiff - 40), firstDiff + 40)}... py=...${pyo.slice(Math.max(0, firstDiff - 40), firstDiff + 40)}...`}`);
console.log(`serve arms on eval slice (n=${evalSamples.length}): ` +
  Object.entries(serveMetrics).map(([k, v]) => `${k}=${v.toFixed(4)}`).join(' '));
console.log('P-W2b (ens3 >= ens2 - 0.005): ' + (pW2b ? 'PASS' : 'FAIL') +
  ` — ens3=${serveMetrics.ens3.toFixed(4)} vs ens2=${serveMetrics.ens2.toFixed(4)} (delta ${(serveMetrics.ens3 - serveMetrics.ens2).toFixed(4)})`);
console.log('serve-roundtrip: ' + (roundtripOk ? 'OK' : 'MISMATCH'));

mkdirSync('receipts', { recursive: true });
const row = {
  n: 1, claim: 'P-W2', verdict: pW2a && pW2b && roundtripOk ? 'PASS' : 'FAIL',
  pW2a, pW2b, roundtripOk,
  js_bytes: js.length, py_bytes: pyo.length,
  serve: Object.fromEntries(Object.entries(serveMetrics).map(([k, v]) => [k, Math.round(v * 1e6)])),
  served_ens3_roundtrip: Math.round(servedEns3 * 1e6),
  field_cells: Object.keys(artifact.arms.field.cells).length,
  observed_ctx: artifact.arms.field.observed.length,
  artifact_sha256: artifact.artifact_sha256,
  seal_v: reg.predictions.v,
};
row.row_hash = sha256Hex(canonicalJSON(['JEVG-EXP-GENESIS-D2', row]));
writeFileSync('receipts/e_w2.jsonl', JSON.stringify(row) + '\n');
console.log('receipts: receipts/e_w2.jsonl');
process.exit(0); // verdict printed; honest either way
