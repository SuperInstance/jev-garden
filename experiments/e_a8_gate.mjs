// experiments/e_a8_gate.mjs — P-A8 (Addendum A8, seal v10): the hardness-gated
// serve blend. Registered rule: saturation s = top.p(ens2) (the v1 law's own
// predictive mass); H* = ESCALATE_BELOW (0.55, sealed, REUSED — no new
// constant); w(ens3) = 0 if s >= H* (gate closed: serve the v1 expression,
// byte-identical), w = 1 if s < H* (gate open: registered ens3 blend).
//
// (a) P-A8a: over serve.judge() calls on the sealed eval slice + shift-family
//     H2, every gate-closed response is byte-identical to the pre-A8 v1-law
//     reference and every gate-open response is exactly the registered ens3.
// (b) P-A8b: gate_open_count == 0 on the saturated eval slice (n=259).
// (c) P-A8c: on shift-family H2 (n=343, battery windows), pooled gated top-1
//     >= pooled ens2 top-1 + 0.01 (integer-exact: 100*(gated-ens2) >= n).
// (d) P-A8d: P-W2a twin byte-identity re-verified; the serve prior rebuild
//     consumes the TWIN's serialized table (prior vectors identical); smoke
//     9/9; selftest green.
// Fail-closed seal gate (A4: sha+size bind).

import { readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { canonicalJSON, sha256Hex, r6 } from '../src/canon.mjs';
import { Rhizome, OPS } from '../src/field.mjs';
import { trainHash, judgeHash, judgeQthe, ensemble, argmax, top1 } from '../src/heads.mjs';
import { grow, compileWeaveV2 } from '../src/weaver.mjs';
import { loadWeave, judge as serveJudge, ESCALATE_BELOW } from '../src/serve.mjs';
import { SenseTablePrior } from '../src/sensetable.mjs';
import { contextTokens, contextStr, K } from '../src/features.mjs';
import { splitLedgers, loadLedger, makeSamples } from '../adapters/qcells.mjs';

// seal gate (v10)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.size !== BigInt(reg.predictions.size)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
if (reg.predictions.v < 10) { console.error('P-A8 requires seal v10+'); process.exit(2); }
console.log('seal verified (v' + reg.predictions.v + '):', sha.slice(0, 16));

const micro = (x) => Math.round(x * 1e6);
const SHIFT_DIR = new URL('./outputs/shift_family/', import.meta.url).pathname;
const LEDGERS = ['ladder7_echo3', 'ladder8_echo4', 'ladder9_echo4', 'ladder8_echo6'];

// ---------- soil ----------
const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;
const sp = splitLedgers(QCELLS);
const trainSamples = sp.train.flatMap((f) => makeSamples(loadLedger(QCELLS, f))); // pipeline v2: per-ledger
const evalLedgers = sp.eval.map((f) => ({ name: f, rows: loadLedger(QCELLS, f) }));
const evalSamples = evalLedgers.flatMap((l) => makeSamples(l.rows));

// samples WITH row index (identical to makeSamples by construction — guard below)
function samplesWithIdx(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    if (!OPS.includes(rows[i].op)) continue;
    out.push({ tokens: contextTokens(rows, i), ctx: contextStr(rows, i), label: rows[i].op, i });
  }
  return out;
}
for (const l of evalLedgers) {
  const a = samplesWithIdx(l.rows), b = makeSamples(l.rows);
  if (a.length !== b.length || a.some((s, j) => s.ctx !== b[j].ctx || s.label !== b[j].label ||
    JSON.stringify(s.tokens) !== JSON.stringify(b[j].tokens))) {
    console.error('samplesWithIdx diverges from makeSamples on ' + l.name); process.exit(2);
  }
}
console.log('soil: train=' + trainSamples.length + ' eval=' + evalSamples.length +
  ' (samplesWithIdx == makeSamples on all eval ledgers)');

// ---------- compile weave-v2 (mirror e_w2 exactly; artifact pinned to receipt) ----------
const rhizome = new Rhizome();
grow(rhizome, trainSamples);
const { artifact } = compileWeaveV2({
  rhizome, trainSamples, evalSamples, weaveIndex: 2,
  notes: 'weave-2 (A7): first weave carrying the rhizome sense table',
});
mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/weave_v2_js.json', canonicalJSON(artifact));
const eW2 = JSON.parse(readFileSync('receipts/e_w2.jsonl', 'utf8').split('\n')[0]);
const artifactPinned = artifact.artifact_sha256 === eW2.artifact_sha256;
console.log('weave-v2 compiled: artifact_sha256=' + artifact.artifact_sha256.slice(0, 16) +
  ' pinned-to-e_w2-receipt=' + artifactPinned +
  ' field_cells=' + Object.keys(artifact.arms.field.cells).length);

// ---------- P-W2a re-verification (twin, under seal v10) ----------
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
const jsCore = readFileSync('experiments/outputs/weave_core_v2_js.json', 'utf8');
const pyCoreStr = readFileSync('experiments/outputs/weave_core_v2_py.json', 'utf8');
const twinIdentical = jsCore === pyCoreStr;
let firstDiff = -1;
if (!twinIdentical) {
  for (let i = 0; i < Math.max(jsCore.length, pyCoreStr.length); i++) if (jsCore[i] !== pyCoreStr[i]) { firstDiff = i; break; }
}
console.log('P-W2a re-check (seal v10): ' + (twinIdentical ? 'IDENTICAL' : 'DIVERGED @' + firstDiff) +
  ` — js=${jsCore.length}B py=${pyCoreStr.length}B`);

// ---------- serve setup (measurement mode: force the registered rule active) ----------
const reloaded = JSON.parse(readFileSync('experiments/outputs/weave_v2_js.json', 'utf8'));
const loaded = loadWeave(reloaded);
loaded.ens3 = { ...loaded.ens3, hardness_gate: true }; // measurement mode — the rule under test, independent of the default flag
const QUESTIONS = { q1: { type: 'choice', criteria: { opcode: true } }, q2: { type: 'noul' } };

// references: pre-A8 v1 law / registered ens3 — the exact expressions of record
function refResponse(tokens, judgedOp, kind) {
  const ph = judgeHash(loaded.hash, tokens).probs;
  const pq = judgeQthe(loaded.qthe, tokens).probs;
  let probs;
  if (kind === 'ens3') {
    const pf = loaded.field.prior(tokens.join('|'));
    const { wh, wq, wf } = loaded.ens3;
    probs = {};
    for (const o of OPS) probs[o] = wh * ph[o] + wq * pq[o] + wf * pf[o];
  } else {
    probs = ensemble(ph, pq, 0.5);
  }
  const top = argmax(probs);
  const claimed = judgedOp ?? top.op;
  const answers = {
    q1: { type: 'choice', choice: top.op, confidence: top.p, probabilities: probs },
    q2: { type: 'noul', noul: probs[claimed] ?? 0, confidence: top.p, probabilities: probs },
  };
  return {
    model: `jev-garden/${loaded.artifact.schema}@w${loaded.artifact.index}`,
    answers, escalate: top.p < ESCALATE_BELOW,
    usage: { model: 'garden-local', tokens: 0 },
  };
}

// ---------- P-A8a / P-A8b: wire path (serve protocol) ----------
const priorCtxs = new Set();
function wireDrive(rows, targets) {
  const st = { calls: 0, closed: 0, open: 0, closedMismatch: 0, openMismatch: 0, minTopP: 1 };
  for (const i of targets) {
    const tokens = contextTokens(rows.slice(0, i + 1), i + 1); // exactly what serve.judge() computes
    const ph = judgeHash(loaded.hash, tokens).probs;
    const pq = judgeQthe(loaded.qthe, tokens).probs;
    const e2 = ensemble(ph, pq, 0.5);
    const topP = argmax(e2).p;
    const open = topP < ESCALATE_BELOW;
    const out = serveJudge(loaded, { context: rows.slice(Math.max(0, i - K), i) }, QUESTIONS, rows[i]);
    const ref = refResponse(tokens, rows[i].op, open ? 'ens3' : 'v1');
    const same = JSON.stringify(out) === JSON.stringify(ref);
    st.calls++;
    if (open) { st.open++; if (!same) st.openMismatch++; }
    else { st.closed++; if (!same) st.closedMismatch++; }
    if (topP < st.minTopP) st.minTopP = topP;
    priorCtxs.add(tokens.join('|'));
  }
  return st;
}

const evalWire = { closed: 0, open: 0, closedMismatch: 0, openMismatch: 0, calls: 0, minTopP: 1 };
for (const l of evalLedgers) {
  const st = wireDrive(l.rows, samplesWithIdx(l.rows).map((s) => s.i));
  for (const k of ['calls', 'closed', 'open', 'closedMismatch', 'openMismatch']) evalWire[k] += st[k];
  if (st.minTopP < evalWire.minTopP) evalWire.minTopP = st.minTopP;
}

let shiftWire = { closed: 0, open: 0, closedMismatch: 0, openMismatch: 0, calls: 0, minTopP: 1 };
let ens2Hit = 0, gatedHit = 0, n2 = 0, openRows = 0;
const flips = { right2wrong: 0, wrong2right: 0 };
const armHits = { hash: 0, qthe: 0, field: 0 };
const perLedger = [];
for (const name of LEDGERS) {
  const f = new URL('./outputs/shift_family/' + name + '.jsonl', import.meta.url).pathname;
  if (!existsSync(f)) { console.error('missing shift soil: ' + name); process.exit(2); }
  const rows = loadLedger(SHIFT_DIR, name + '.jsonl');
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const H2 = samples.slice(half);
  if (!H2.length) { console.error('empty H2 for ' + name); process.exit(2); }
  const st = wireDrive(rows, H2.map((s) => s.i));
  for (const k of ['calls', 'closed', 'open', 'closedMismatch', 'openMismatch']) shiftWire[k] += st[k];
  if (st.minTopP < shiftWire.minTopP) shiftWire.minTopP = st.minTopP;

  // ---------- P-A8c: battery protocol on H2 (windows per pipeline-v2) ----------
  let h2e2 = 0, h2g = 0, h2open = 0, armHash = 0, armQ = 0, armF = 0;
  for (const s of H2) {
    const ph = judgeHash(loaded.hash, s.tokens).probs;
    const pq = judgeQthe(loaded.qthe, s.tokens).probs;
    const pf = loaded.field.prior(s.ctx);
    priorCtxs.add(s.ctx);
    if (top1(ph, s.label)) armHash++;
    if (top1(pq, s.label)) armQ++;
    if (top1(pf, s.label)) armF++;
    const e2 = ensemble(ph, pq, 0.5);
    let gated = e2;
    const open = argmax(e2).p < ESCALATE_BELOW;
    if (open) {
      gated = {};
      const { wh, wq, wf } = loaded.ens3;
      for (const o of OPS) gated[o] = wh * ph[o] + wq * pq[o] + wf * pf[o];
      h2open++;
    }
    const t2 = top1(e2, s.label), tg = top1(gated, s.label);
    h2e2 += t2; h2g += tg;
    if (open && t2 === 1 && tg === 0) flips.right2wrong++;
    if (open && t2 === 0 && tg === 1) flips.wrong2right++;
  }
  ens2Hit += h2e2; gatedHit += h2g; n2 += H2.length; openRows += h2open;
  armHits.hash += armHash; armHits.qthe += armQ; armHits.field += armF;
  perLedger.push({
    ledger: name, h2: H2.length, gate_open: h2open,
    head_h2: micro(armHash / H2.length) / 1e6,
    ens2_top1: micro(h2e2 / H2.length) / 1e6,
    gated_top1: micro(h2g / H2.length) / 1e6,
    field_top1: micro(armF / H2.length) / 1e6,
  });
  console.log(`  ${name}: H2=${H2.length} gate_open=${h2open}  ens2 ${(h2e2 / H2.length * 100).toFixed(2)}%  gated ${(h2g / H2.length * 100).toFixed(2)}%  (head ${(armHash / H2.length * 100).toFixed(2)}%, field ${(armF / H2.length * 100).toFixed(2)}%)`);
}

// ---------- eval-slice battery-protocol cross-check (pin to P-W2b receipt) ----------
let evalEns2Hit = 0, evalGatedHit = 0, evalOpenBattery = 0;
for (const s of evalSamples) {
  const ph = judgeHash(loaded.hash, s.tokens).probs;
  const pq = judgeQthe(loaded.qthe, s.tokens).probs;
  priorCtxs.add(s.ctx);
  const e2 = ensemble(ph, pq, 0.5);
  let gated = e2;
  if (argmax(e2).p < ESCALATE_BELOW) {
    evalOpenBattery++;
    const pf = loaded.field.prior(s.ctx);
    gated = {};
    const { wh, wq, wf } = loaded.ens3;
    for (const o of OPS) gated[o] = wh * ph[o] + wq * pq[o] + wf * pf[o];
  }
  evalEns2Hit += top1(e2, s.label);
  evalGatedHit += top1(gated, s.label);
}
const evalEns2Micro = micro(evalEns2Hit / evalSamples.length);
const pinnedToPW2b = evalEns2Micro === eW2.serve.ens2;
console.log('eval battery-protocol ens2=' + (evalEns2Hit / evalSamples.length).toFixed(4) +
  ' (P-W2b receipt ' + (eW2.serve.ens2 / 1e6).toFixed(4) + ') pinned=' + pinnedToPW2b +
  '; battery gate_open=' + evalOpenBattery + '; gated=' + (evalGatedHit / evalSamples.length).toFixed(4));

// ---------- P-A8d (ii): the serve prior rebuild consumes the TWIN's table ----------
const pyCore = JSON.parse(pyCoreStr);
const tableIdentical = canonicalJSON(pyCore.arms.field) === canonicalJSON(reloaded.arms.field);
const twinPrior = new SenseTablePrior(pyCore.arms.field);
let twinPriorOk = tableIdentical, twinPriorChecked = 0, twinPriorBad = null;
for (const ctx of priorCtxs) {
  twinPriorChecked++;
  const a = loaded.field.prior(ctx), b = twinPrior.prior(ctx);
  if (JSON.stringify(a) !== JSON.stringify(b)) { twinPriorOk = false; twinPriorBad = ctx; break; }
}

// ---------- smoke + selftest (battery green) ----------
const smoke = spawnSync('node', ['smoke.mjs'], { encoding: 'utf8' });
const smokeOk = smoke.status === 0 && /9 passed, 0 failed/.test(smoke.stdout);
const selftest = spawnSync('node', ['tests/selftest.mjs'], { encoding: 'utf8' });
const selftestOk = selftest.status === 0;
console.log('smoke: ' + (smokeOk ? '9/9' : 'FAIL') + '; selftest: ' + (selftestOk ? 'green' : 'FAIL'));

// ---------- verdicts ----------
const pA8a = evalWire.closedMismatch === 0 && evalWire.openMismatch === 0 &&
  shiftWire.closedMismatch === 0 && shiftWire.openMismatch === 0;
const pA8b = evalWire.open === 0;
const pA8c = 100 * (gatedHit - ens2Hit) >= n2; // integer-exact form of delta >= 0.01
const pA8d = twinIdentical && tableIdentical && twinPriorOk && smokeOk && selftestOk;
const delta = (gatedHit - ens2Hit) / (n2 || 1);
console.log('\nP-A8a (closed==v1-law byte-identical, open==registered ens3): ' + (pA8a ? 'PASS' : 'FAIL') +
  ` — wire calls=${evalWire.calls + shiftWire.calls} closed=${evalWire.closed + shiftWire.closed} (mismatch ${evalWire.closedMismatch + shiftWire.closedMismatch}) open=${evalWire.open + shiftWire.open} (mismatch ${evalWire.openMismatch + shiftWire.openMismatch})`);
console.log('P-A8b (saturated closure, eval slice): ' + (pA8b ? 'PASS' : 'FAIL') +
  ` — gate_open=${evalWire.open}/${evalWire.calls} (min ens2 top.p=${evalWire.minTopP.toFixed(4)} vs H*=${ESCALATE_BELOW})`);
console.log('P-A8c (hard-soil margin, shift H2): ' + (pA8c ? 'PASS' : 'FAIL') +
  ` — gated ${gatedHit}/${n2}=${(gatedHit / n2).toFixed(4)} vs ens2 ${ens2Hit}/${n2}=${(ens2Hit / n2).toFixed(4)} (delta ${delta >= 0 ? '+' : ''}${delta.toFixed(4)}, gate +0.01; gate_open=${openRows}/${n2}; flips +${flips.wrong2right}/-${flips.right2wrong})`);
console.log('P-A8d (twin + prior rebuild + battery green): ' + (pA8d ? 'PASS' : 'FAIL') +
  ` — twin=${twinIdentical ? 'IDENTICAL ' + jsCore.length + 'B==' + pyCoreStr.length + 'B' : 'DIVERGED'} table=${tableIdentical} prior_ctx=${twinPriorChecked} prior_ok=${twinPriorOk}${twinPriorBad ? ' first_bad=' + twinPriorBad : ''} smoke=${smokeOk} selftest=${selftestOk}`);
const verdict = pA8a && pA8b && pA8c && pA8d ? 'PASS' : 'FAIL';
console.log('\nP-A8 overall: ' + verdict);

// ---------- receipts ----------
mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-D';
const chain = (row) => { row.row_hash = sha256Hex(canonicalJSON([prev, row])); chainRows.push(row); prev = row.row_hash; };
chain({
  n: 1, claim: 'P-A8', verdict,
  pA8a, pA8b, pA8c, pA8d,
  gate_rule: { signal: 'top.p(ens2)', op: '<', threshold: ESCALATE_BELOW, provenance: 'ESCALATE_BELOW (sealed, reused — no new constant)', w: '0 if s>=H* else 1' },
  wire: {
    eval: { calls: evalWire.calls, closed: evalWire.closed, open: evalWire.open, closed_mismatch: evalWire.closedMismatch, open_mismatch: evalWire.openMismatch, min_top_p: micro(evalWire.minTopP) },
    shift_h2: { calls: shiftWire.calls, closed: shiftWire.closed, open: shiftWire.open, closed_mismatch: shiftWire.closedMismatch, open_mismatch: shiftWire.openMismatch, min_top_p: micro(shiftWire.minTopP) },
  },
  shift_h2_battery: { rows: n2, gate_open: openRows, ens2_hits: ens2Hit, gated_hits: gatedHit, delta: micro(delta), margin: 10000, flips_wrong2right: flips.wrong2right, flips_right2wrong: flips.right2wrong, arms: { hash: armHits.hash, qthe: armHits.qthe, field: armHits.field } },
  eval_battery: { rows: evalSamples.length, ens2_micro: evalEns2Micro, pinned_to_e_w2: pinnedToPW2b, gated_micro: micro(evalGatedHit / evalSamples.length), gate_open: evalOpenBattery },
  twin: { identical: twinIdentical, js_bytes: jsCore.length, py_bytes: pyCoreStr.length, table_identical: tableIdentical, prior_ctx: twinPriorChecked, prior_ok: twinPriorOk },
  smoke_9of9: smokeOk, selftest_green: selftestOk,
  artifact_sha256: artifact.artifact_sha256, artifact_pinned: artifactPinned,
  seal_v: reg.predictions.v,
});
chain({ n: 2, claim: 'per-ledger-h2', detail: perLedger });
writeFileSync('receipts/e_a8.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_a8_summary.json', JSON.stringify({
  run: 'e_a8_gate', verdict, pA8a, pA8b, pA8c, pA8d,
  gate_rule: { signal: 'top.p(ens2)', threshold: ESCALATE_BELOW, w: 'binary 0|1' },
  evalWire, shiftWire, shiftBattery: { rows: n2, gate_open: openRows, ens2: micro(ens2Hit / n2) / 1e6, gated: micro(gatedHit / n2) / 1e6, flips },
  evalBattery: { rows: evalSamples.length, ens2_micro: evalEns2Micro, gate_open: evalOpenBattery },
  perLedger, twin: { identical: twinIdentical, bytes: jsCore.length, prior_ctx: twinPriorChecked, prior_ok: twinPriorOk },
}, null, 2));
console.log('receipts: receipts/e_a8.jsonl (tip ' + prev.slice(0, 16) + ')');
process.exit(0); // verdict printed; honest either way
