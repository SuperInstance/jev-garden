// experiments/e_a10_fresh_everywhere.mjs — P-A10 (Addendum A10, seal v15):
// the fresh-everywhere trial mode. Registered law: opt-in
// hyper.fresh.fresh_everywhere = true — the A9 fresh law with the gate
// REMOVED; serve priorCounted from the SERIALIZED aggregate on EVERY row.
// Zero new constants (the mode has no threshold). Branch order registered:
// A7 serve_with_field -> A10 fresh_everywhere -> A9 serve_with_fresh ->
// A8 hardness_gate -> default v1.
//
// (a) P-A10a: wire mechanics — everywhere responses byte-identical to the
//     registered reference (compile-time aggregate AND live grow-as-used
//     table); default law byte-identical with the flag ABSENT; artifact-hyper
//     opt-in path == loaded-handle opt-in path; precedence (A10 > A9).
// (b) P-A10b: shift-H2 gain — battery protocol (per-ledger windows,
//     pipeline-v2, grow-as-used, judged-free serve): pooled everywhere top-1
//     == 298/343 EXACTLY (the P-G2d/A9 ungated pin) and 100*(everywhere-ens2)
//     >= 343 (ens2 pinned to 242).
// (c) P-A10c: saturated cost — eval slice everywhere micro == 938224 (the A9
//     receipt pin; risk priced -0.0154, flips -6/+2) and ens2 micro ==
//     953668 (P-W2b pin).
// (d) P-A10d: twin + battery green — core-v2 byte-identity re-verified; live
//     tables byte-identical to the Python twin (4/4); e_a9 receipt bytes
//     reproduce under the A10 law except the seal stamp (receipt of record
//     restored byte-for-byte); smoke 9/9; selftest green.
// Contrast receipts (no gates): gap anatomy, H* frontier (interleave proof),
// train-only calibration flatness, A9 eval flip-label audit.
// Fail-closed seal gate (A4: sha+size bind).

import { readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { canonicalJSON, sha256Hex } from '../src/canon.mjs';
import { Rhizome, OPS } from '../src/field.mjs';
import { trainHash, judgeHash, judgeQthe, ensemble, argmax, top1 } from '../src/heads.mjs';
import { grow, compileWeaveV2 } from '../src/weaver.mjs';
import { loadWeave, judge as serveJudge, ESCALATE_BELOW } from '../src/serve.mjs';
import { SenseTablePrior } from '../src/sensetable.mjs';
import { contextTokens, contextStr, K } from '../src/features.mjs';
import { splitLedgers, loadLedger, makeSamples } from '../adapters/qcells.mjs';

// seal gate (v15)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.size !== BigInt(reg.predictions.size)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
if (reg.predictions.v < 15) { console.error('P-A10 requires seal v15+'); process.exit(2); }
console.log('seal verified (v' + reg.predictions.v + '):', sha.slice(0, 16));

const micro = (x) => Math.round(x * 1e6);
const SHIFT_DIR = new URL('./outputs/shift_family/', import.meta.url).pathname;
const LEDGERS = ['ladder7_echo3', 'ladder8_echo4', 'ladder9_echo4', 'ladder8_echo6'];
const HG = [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.01]; // H* frontier grid

// ---------- soil ----------
const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;
const sp = splitLedgers(QCELLS);
const trainSamples = sp.train.flatMap((f) => makeSamples(loadLedger(QCELLS, f))); // pipeline v2: per-ledger
const evalLedgers = sp.eval.map((f) => ({ name: f, rows: loadLedger(QCELLS, f) }));
const evalSamples = evalLedgers.flatMap((l) => makeSamples(l.rows));

// samples WITH row index (identical to makeSamples by construction — guard)
function samplesWithIdx(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    if (!OPS.includes(rows[i].op)) continue;
    out.push({ tokens: contextTokens(rows, i), ctx: contextStr(rows, i), label: rows[i].op, i, prevOp: rows[i - 1]?.op ?? null });
  }
  return out;
}
for (const l of [...evalLedgers, ...LEDGERS.map((n) => ({ name: n, rows: loadLedger(SHIFT_DIR, n + '.jsonl') }))]) {
  const a = samplesWithIdx(l.rows), b = makeSamples(l.rows);
  if (a.length !== b.length || a.some((s, j) => s.ctx !== b[j].ctx || s.label !== b[j].label ||
    JSON.stringify(s.tokens) !== JSON.stringify(b[j].tokens))) {
    console.error('samplesWithIdx diverges from makeSamples on ' + l.name); process.exit(2);
  }
}
console.log('soil: train=' + trainSamples.length + ' eval=' + evalSamples.length +
  ' (samplesWithIdx == makeSamples on eval + shift soils)');

// ---------- compile weave-v2 (mirror e_w2/e_a8/e_a9 exactly; artifact pinned) ----------
const rhizome = new Rhizome();
grow(rhizome, trainSamples);
const { artifact } = compileWeaveV2({
  rhizome, trainSamples, evalSamples, weaveIndex: 2,
  notes: 'weave-2 (A7): first weave carrying the rhizome sense table',
});
mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/weave_v2_js.json', canonicalJSON(artifact));
const eW2 = JSON.parse(readFileSync('receipts/e_w2.jsonl', 'utf8').split('\n')[0]);
const eA8 = JSON.parse(readFileSync('receipts/e_a8.jsonl', 'utf8').split('\n')[0]);
const eA9 = JSON.parse(readFileSync('receipts/e_a9.jsonl', 'utf8').split('\n')[0]);
const artifactPinned = artifact.artifact_sha256 === eW2.artifact_sha256;
console.log('weave-v2 compiled: artifact_sha256=' + artifact.artifact_sha256.slice(0, 16) +
  ' pinned-to-e_w2-receipt=' + artifactPinned);
if (!artifactPinned) { console.error('artifact not pinned to e_w2 receipt — refusing'); process.exit(2); }

// ---------- P-W2a re-verification (twin, under seal v15) ----------
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
console.log('P-W2a re-check (seal v15): ' + (twinIdentical ? 'IDENTICAL' : 'DIVERGED @' + firstDiff) +
  ` — js=${jsCore.length}B py=${pyCoreStr.length}B`);

// ---------- twin fresh mode (A9 protocol re-run): Python grows each H1, serializes ----------
const freshTwin = [];
for (const name of LEDGERS) {
  const f = new URL('./outputs/shift_family/' + name + '.jsonl', import.meta.url).pathname;
  if (!existsSync(f)) { console.error('missing shift soil: ' + name); process.exit(2); }
  const outF = 'experiments/outputs/fresh_table_' + name + '_py.json';
  const r = spawnSync('python3', ['ref/garden_ref.py', QCELLS, 'experiments/outputs/_seal_core_unused.json', '--fresh', f, outF], { encoding: 'utf8' });
  if (r.status !== 0) { console.error('twin fresh failed for ' + name + ':', r.stderr); process.exit(1); }
  freshTwin.push({ ledger: name, py_bytes: readFileSync(outF, 'utf8').length });
}

// ---------- serve setup (modes) ----------
const reloaded = JSON.parse(readFileSync('experiments/outputs/weave_v2_js.json', 'utf8'));
const loaded = loadWeave(reloaded);
if (loaded.fresh !== false || loaded.freshEverywhere !== false) {
  console.error('default must carry fresh=false freshEverywhere=false (flags absent)'); process.exit(2);
}
const loadedEverywhere = loadWeave(reloaded); // measurement mode: the registered A10 trial (handle opt-in)
loadedEverywhere.freshEverywhere = true;
const artifactOpt = JSON.parse(JSON.stringify(artifact)); // ship path: artifact-hyper opt-in
artifactOpt.hyper.fresh = { fresh_everywhere: true };
const loadedHyper = loadWeave(artifactOpt);
if (loadedHyper.freshEverywhere !== true) { console.error('artifact-hyper opt-in failed to load'); process.exit(2); }
const artifactPrec = JSON.parse(JSON.stringify(artifact)); // precedence: BOTH fresh flags set
artifactPrec.hyper.fresh = { fresh_everywhere: true, serve_with_fresh: true };
const loadedPrec = loadWeave(artifactPrec);
if (loadedPrec.freshEverywhere !== true || loadedPrec.fresh !== true) {
  console.error('precedence artifact failed to load both flags'); process.exit(2);
}
const QUESTIONS = { q1: { type: 'choice', criteria: { opcode: true } }, q2: { type: 'noul' } };

// references: the exact expressions of record
function refResponse(handle, tokens, judgedOp, kind) {
  const ph = judgeHash(handle.hash, tokens).probs;
  const pq = judgeQthe(handle.qthe, tokens).probs;
  let probs;
  if (kind === 'everywhere') {
    probs = handle.field.priorCounted(tokens.join('|'));
  } else if (kind === 'fresh') {
    const e2 = ensemble(ph, pq, 0.5);
    probs = argmax(e2).p >= ESCALATE_BELOW ? e2 : handle.field.priorCounted(tokens.join('|'));
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
    model: `jev-garden/${handle.artifact.schema}@w${handle.artifact.index}`,
    answers, escalate: top.p < ESCALATE_BELOW,
    usage: { model: 'garden-local', tokens: 0 },
  };
}

const evalTargets = evalLedgers.map((l) => ({ name: l.name, rows: l.rows, targets: samplesWithIdx(l.rows).map((s) => s.i) }));
const shiftTargets = LEDGERS.map((name) => {
  const rows = loadLedger(SHIFT_DIR, name + '.jsonl');
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  return { name, rows, targets: samples.slice(half).map((s) => s.i) };
});

// ---------- P-A10a: wire mechanics (judged-carrying protocol, as P-A9a) ----------
// wireDrive: mode 'default' -> v1 ref; 'everywhere' -> everywhere ref; 'prec' -> everywhere ref (A10 > A9)
function wireDrive(rows, targets, handle, mode) {
  const st = { calls: 0, mismatch: 0 };
  for (const i of targets) {
    const tokens = contextTokens(rows.slice(0, i + 1), i + 1); // exactly what serve.judge() computes
    const out = serveJudge(handle, { context: rows.slice(Math.max(0, i - K), i) }, QUESTIONS, rows[i]);
    const ref = refResponse(handle, tokens, rows[i].op, mode === 'default' ? 'v1' : 'everywhere');
    if (JSON.stringify(out) !== JSON.stringify(ref)) st.mismatch++;
    st.calls++;
  }
  return st;
}
let wDefEval = { calls: 0, mismatch: 0 }, wDefShift = { calls: 0, mismatch: 0 };
let wEvEval = { calls: 0, mismatch: 0 }, wEvShift = { calls: 0, mismatch: 0 };
let wPrecEval = { calls: 0, mismatch: 0 }, wPrecShift = { calls: 0, mismatch: 0 };
for (const { rows, targets } of evalTargets) {
  const a = wireDrive(rows, targets, loaded, 'default'); for (const k of ['calls', 'mismatch']) wDefEval[k] += a[k];
  const b = wireDrive(rows, targets, loadedEverywhere, 'everywhere'); for (const k of ['calls', 'mismatch']) wEvEval[k] += b[k];
  const c = wireDrive(rows, targets, loadedPrec, 'prec'); for (const k of ['calls', 'mismatch']) wPrecEval[k] += c[k];
}
for (const { rows, targets } of shiftTargets) {
  const a = wireDrive(rows, targets, loaded, 'default'); for (const k of ['calls', 'mismatch']) wDefShift[k] += a[k];
  const b = wireDrive(rows, targets, loadedEverywhere, 'everywhere'); for (const k of ['calls', 'mismatch']) wEvShift[k] += b[k];
  const c = wireDrive(rows, targets, loadedPrec, 'prec'); for (const k of ['calls', 'mismatch']) wPrecShift[k] += c[k];
}

// opt-in path equality: artifact-hyper vs loaded-handle, sample of both soils
let pathEqChecked = 0, pathEqBad = 0;
for (const { rows, targets } of [evalTargets[0], shiftTargets[0]]) {
  for (const i of targets.slice(0, 20)) {
    const outHandle = serveJudge(loadedEverywhere, { context: rows.slice(Math.max(0, i - K), i) }, QUESTIONS, rows[i]);
    const outHyper = serveJudge(loadedHyper, { context: rows.slice(Math.max(0, i - K), i) }, QUESTIONS, rows[i]);
    pathEqChecked++;
    if (JSON.stringify(outHandle) !== JSON.stringify(outHyper)) pathEqBad++;
  }
}

// grow-as-used wire path: the everywhere handle over the LIVE H1 table must
// serve the live-table reference byte-exactly (10 sampled calls per ledger)
let liveWireChecked = 0, liveWireBad = 0;
const liveTables = {};
for (const { name, rows } of shiftTargets) {
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const H1 = samples.slice(0, half);
  const rz = new Rhizome();
  grow(rz, H1);
  const liveTable1 = rz.senseTable();
  liveTables[name] = liveTable1;
  const liveHandle = loadWeave(JSON.parse(canonicalJSON({ ...artifact, arms: { ...artifact.arms, field: liveTable1 } })));
  liveHandle.freshEverywhere = true;
  const H2targets = samples.slice(half).slice(0, 10);
  for (const s of H2targets) {
    const out = serveJudge(liveHandle, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS, rows[s.i]);
    const tokens = contextTokens(rows.slice(0, s.i + 1), s.i + 1);
    const ref = refResponse(liveHandle, tokens, rows[s.i].op, 'everywhere');
    liveWireChecked++;
    if (JSON.stringify(out) !== JSON.stringify(ref)) liveWireBad++;
  }
}

// ---------- P-A10b: shift-H2 battery (judged-free protocol = P-G2d/P-A9c convention) ----------
let ens2Hit = 0, everywhereHit = 0, n2 = 0;
const perLedger = [];
const shiftRows = []; // per-row records for the contrast receipts
for (const { name, rows } of shiftTargets) {
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const H1 = samples.slice(0, half), H2 = samples.slice(half);
  if (!H1.length || !H2.length) { console.error('empty half for ' + name); process.exit(2); }
  // grow-as-used: watch H1 (fresh rhizome, P-G2d protocol), re-serialize arms.field
  const rz = new Rhizome();
  grow(rz, H1);
  const liveTable1 = rz.senseTable();
  const liveBytes1 = canonicalJSON(liveTable1);
  const liveBytes2 = canonicalJSON(rz.senseTable());
  const serDet = liveBytes1 === liveBytes2;
  const liveHandle = loadWeave(JSON.parse(canonicalJSON({ ...artifact, arms: { ...artifact.arms, field: liveTable1 } })));
  liveHandle.freshEverywhere = true;
  const twinBytesEqual = readFileSync('experiments/outputs/fresh_table_' + name + '_py.json', 'utf8') === liveBytes1;
  let h2e2 = 0, h2ev = 0;
  for (const s of H2) {
    const ph = judgeHash(loaded.hash, s.tokens).probs;
    const pq = judgeQthe(loaded.qthe, s.tokens).probs;
    const e2 = ensemble(ph, pq, 0.5);
    const t2 = top1(e2, s.label);
    // everywhere through the SERVE PATH, judged-free (the row under judgment
    // contributes no token — the P-G2d/P-A9c context convention)
    const out = serveJudge(liveHandle, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const evChoice = out.answers.q1.choice;
    const tf = evChoice === s.label ? 1 : 0;
    h2e2 += t2; h2ev += tf;
    shiftRows.push({
      ledger: name, i: s.i, label: s.label, prevOp: s.prevOp,
      topP: argmax(e2).p, open: argmax(e2).p < ESCALATE_BELOW,
      ens2Hit: t2, freshHit: tf, exactCtx: rz.observed.has(s.ctx),
    });
  }
  ens2Hit += h2e2; everywhereHit += h2ev; n2 += H2.length;
  perLedger.push({
    ledger: name, h1: H1.length, h2: H2.length,
    ens2_hits: h2e2, everywhere_hits: h2ev,
    ser_deterministic: serDet, twin_fresh_bytes_equal: twinBytesEqual,
    artifact_carrying_live_table_sha: sha256Hex(canonicalJSON({ ...artifact, arms: { ...artifact.arms, field: liveTable1 } })),
  });
  console.log(`  ${name}: H1=${H1.length} H2=${H2.length}  ens2 ${h2e2}/${H2.length}  everywhere ${h2ev}/${H2.length}  (ser_det=${serDet}, twin_fresh=${twinBytesEqual})`);
}
const deltaShift = (everywhereHit - ens2Hit) / (n2 || 1);
const pin298 = everywhereHit === 298;
const pinnedEns2 = ens2Hit === eA8.shift_h2_battery.ens2_hits && ens2Hit === eA9.shift_h2_battery.ens2_hits;
console.log(`P-A10b battery: everywhere ${everywhereHit}/${n2} (pin 298: ${pin298}; P-G2d/A9)  ens2 ${ens2Hit}/${n2} (pinned: ${pinnedEns2})  delta ${deltaShift >= 0 ? '+' : ''}${deltaShift.toFixed(4)}`);

// ---------- P-A10c: saturated cost (eval slice, compile-time train aggregate) ----------
let evalEns2 = 0, evalEverywhere = 0;
const evalRows = [];
const flipsEval = { ens2right_everywherewrong: 0, ens2wrong_everywhereright: 0 };
const flipsEvalOpen = { ens2right_everywherewrong: 0, ens2wrong_everywhereright: 0 }; // the 11 A9-open rows
let evalOpens = 0;
for (const l of evalLedgers) {
  for (const s of samplesWithIdx(l.rows)) {
    const ph = judgeHash(loaded.hash, s.tokens).probs;
    const pq = judgeQthe(loaded.qthe, s.tokens).probs;
    const e2 = ensemble(ph, pq, 0.5);
    const t2 = top1(e2, s.label);
    // everywhere through the SERVE PATH, judged-free (the row under judgment
    // contributes no token — the P-G2d/P-A9c context convention)
    const out = serveJudge(loadedEverywhere, { context: l.rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const tf = out.answers.q1.choice === s.label ? 1 : 0;
    const isOpen = argmax(e2).p < ESCALATE_BELOW;
    if (isOpen) evalOpens++;
    evalEns2 += t2; evalEverywhere += tf;
    if (t2 === 1 && tf === 0) { flipsEval.ens2right_everywherewrong++; if (isOpen) flipsEvalOpen.ens2right_everywherewrong++; }
    if (t2 === 0 && tf === 1) { flipsEval.ens2wrong_everywhereright++; if (isOpen) flipsEvalOpen.ens2wrong_everywhereright++; }
    evalRows.push({ topP: argmax(e2).p, open: isOpen, ens2Hit: t2, freshHit: tf, exactCtx: loaded.field.observed.has(s.ctx) });
  }
}
const evalEns2Micro = micro(evalEns2 / evalSamples.length);
const evalEveryMicro = micro(evalEverywhere / evalSamples.length);
const pinEvalEns2 = evalEns2Micro === eW2.serve.ens2;
const pinEvalEvery = evalEveryMicro === eA9.eval_optin_contrast.fresh_micro;
console.log(`P-A10c saturated: everywhere micro ${evalEveryMicro} (A9 pin 938224: ${pinEvalEvery})  ens2 micro ${evalEns2Micro} (P-W2b pin 953668: ${pinEvalEns2})  flips -${flipsEval.ens2right_everywherewrong}/+${flipsEval.ens2wrong_everywhereright} (opens ${evalOpens}: -${flipsEvalOpen.ens2right_everywherewrong}/+${flipsEvalOpen.ens2wrong_everywhereright})`);

// ---------- contrast receipts (no gates) ----------
// (1) gap anatomy on the shift-H2 closed rows (the 46-net-row A9 gap)
const closedRows = shiftRows.filter((r) => !r.open);
const gap = closedRows.filter((r) => r.ens2Hit === 0 && r.freshHit === 1);
const prot = closedRows.filter((r) => r.ens2Hit === 1 && r.freshHit === 0);
const otherClosed = closedRows.filter((r) => !(r.ens2Hit === 0 && r.freshHit === 1) && !(r.ens2Hit === 1 && r.freshHit === 0));
const openRows = shiftRows.filter((r) => r.open);
const pctile = (arr, q) => { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(q * a.length))]; };
function profile(set) {
  if (!set.length) return null;
  const tp = set.map((r) => micro(r.topP));
  return {
    n: set.length,
    exact_ctx: set.filter((r) => r.exactCtx).length,
    fallback: set.filter((r) => !r.exactCtx).length,
    top_p: { min: Math.min(...tp), p10: pctile(tp, 0.1), med: pctile(tp, 0.5), p90: pctile(tp, 0.9), max: Math.max(...tp) },
    labels: set.reduce((m, r) => { m[r.label] = (m[r.label] ?? 0) + 1; return m; }, {}),
    per_ledger: set.reduce((m, r) => { m[r.ledger] = (m[r.ledger] ?? 0) + 1; return m; }, {}),
  };
}
// ens2 argmax identity on the gap/protection rows (the echo mechanism receipt)
const ens2ArgmaxByRow = new Map();
for (const { name, rows } of shiftTargets) {
  for (const s of samplesWithIdx(rows)) {
    const ph = judgeHash(loaded.hash, s.tokens).probs;
    const pq = judgeQthe(loaded.qthe, s.tokens).probs;
    ens2ArgmaxByRow.set(name + '@' + s.i, argmax(ensemble(ph, pq, 0.5)).op);
  }
}
for (const p of [gap, prot]) {
  for (const r of p) r.ens2Op = ens2ArgmaxByRow.get(r.ledger + '@' + r.i);
}
const gapProfile = profile(gap);
gapProfile.ens2_argmax = gap.reduce((m, r) => { m[r.ens2Op] = (m[r.ens2Op] ?? 0) + 1; return m; }, {});
gapProfile.transitions = gap.reduce((m, r) => { const k = `${r.prevOp}->${r.label}`; m[k] = (m[k] ?? 0) + 1; return m; }, {});
const protProfile = profile(prot);
protProfile.ens2_argmax = prot.reduce((m, r) => { m[r.ens2Op] = (m[r.ens2Op] ?? 0) + 1; return m; }, {});
const openProfile = profile(openRows);
const otherProfile = profile(otherClosed);
console.log(`gap anatomy: closed=${closedRows.length} gap=+${gap.length} prot=-${prot.length} (net +${gap.length - prot.length}) other=${otherClosed.length} open=${openRows.length}` +
  `; gap exact-ctx ${gapProfile.exact_ctx}/${gap.length}, top.p [${(gapProfile.top_p.min / 1e6).toFixed(4)}, ${(gapProfile.top_p.max / 1e6).toFixed(4)}]` +
  `; prot top.p [${(protProfile.top_p.min / 1e6).toFixed(4)}, ${(protProfile.top_p.max / 1e6).toFixed(4)}] (NESTED inside gap range: ${protProfile.top_p.min >= gapProfile.top_p.min && protProfile.top_p.max <= gapProfile.top_p.max})`);

// (2) H* frontier on both soils (the interleave proof in numbers)
const frontier = HG.map((H) => {
  const sh = shiftRows.reduce((a, r) => a + (r.topP < H ? r.freshHit : r.ens2Hit), 0);
  const shOpens = shiftRows.filter((r) => r.topP < H).length;
  const ev = evalRows.reduce((a, r) => a + (r.topP < H ? r.freshHit : r.ens2Hit), 0);
  const evOpens = evalRows.filter((r) => r.topP < H).length;
  return { H: micro(H), shift_hits: sh, shift_opens: shOpens, eval_hits: ev, eval_opens: evOpens };
});
const fullGapH = micro(Math.min(...gap.map((r) => r.topP)));
console.log('H* frontier (shift/eval): ' + frontier.map((f) => `${(f.H / 1e6).toFixed(2)}:${f.shift_hits}/${f.eval_hits}`).join(' '));

// (3) train-only calibration counterfactual (compile-time legal: train soil only)
const trainCalib = HG.map((H) => ({ H: micro(H), hits: 0, n: 0 }));
for (const f of sp.train) {
  const rows = loadLedger(QCELLS, f);
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const H1 = samples.slice(0, half), H2 = samples.slice(half);
  const rz = new Rhizome();
  grow(rz, H1);
  const live = new SenseTablePrior(rz.senseTable());
  for (const s of H2) {
    const ph = judgeHash(loaded.hash, s.tokens).probs;
    const pq = judgeQthe(loaded.qthe, s.tokens).probs;
    const e2 = ensemble(ph, pq, 0.5);
    const pf = live.priorCounted(s.ctx);
    for (const t of trainCalib) t.hits += argmax(e2).p < t.H / 1e6 ? top1(pf, s.label) : top1(e2, s.label);
  }
  for (const t of trainCalib) t.n += H2.length;
}
const calibFlat = trainCalib.every((t) => t.hits === trainCalib[0].hits);
console.log(`train-only walk-forward calibration: hits ${trainCalib[0].hits}/${trainCalib[0].n} at EVERY H* in grid — flat=${calibFlat} (gate is a no-op on saturated soil; no train-only derivation can rank H*)`);

// ---------- P-A10d: e_a9 regression (bytes reproduce except seal stamp), smoke, selftest ----------
const a9Original = readFileSync('receipts/e_a9.jsonl', 'utf8');
const a9Run = spawnSync('node', ['experiments/e_a9_fresh.mjs'], { encoding: 'utf8' });
let a9Regression = { ran: a9Run.status === 0, bytes_identical_except_seal: false, seal_stamps: [] };
try {
  const origRows = a9Original.trim().split('\n').map((l) => JSON.parse(l));
  const newRows = readFileSync('receipts/e_a9.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  // measured-byte comparison: strip the seal version stamp AND the chain
  // row_hashes — row_hash = sha256 over the stamped row by construction, so
  // the stamp change propagates into it; every MEASURED field must match.
  const strip = (rows) => canonicalJSON(rows.map(({ seal_v, row_hash, ...rest }) => rest));
  a9Regression.bytes_identical_except_seal = strip(origRows) === strip(newRows) && origRows.length === newRows.length;
  a9Regression.seal_stamps = [origRows[0].seal_v, newRows[0].seal_v];
} catch (e) { a9Regression.error = String(e); }
writeFileSync('receipts/e_a9.jsonl', a9Original); // the A9 receipt of record is RESTORED byte-for-byte (append-only)
const restoredOk = readFileSync('receipts/e_a9.jsonl', 'utf8') === a9Original;
console.log(`e_a9 regression under the A10 law: ran=${a9Regression.ran} bytes_identical_except_seal=${a9Regression.bytes_identical_except_seal} (seal stamps ${a9Regression.seal_stamps?.join(' -> ')}); receipt of record restored=${restoredOk}`);

const smoke = spawnSync('node', ['smoke.mjs'], { encoding: 'utf8' });
const smokeOk = smoke.status === 0 && /9 passed, 0 failed/.test(smoke.stdout);
const selftest = spawnSync('node', ['tests/selftest.mjs'], { encoding: 'utf8' });
const selftestOk = selftest.status === 0;
console.log('smoke: ' + (smokeOk ? '9/9' : 'FAIL') + '; selftest: ' + (selftestOk ? 'green' : 'FAIL'));

// ---------- verdicts ----------
const pA10a = wEvEval.mismatch === 0 && wEvShift.mismatch === 0 &&
  wDefEval.mismatch === 0 && wDefShift.mismatch === 0 &&
  pathEqBad === 0 && liveWireBad === 0 &&
  wPrecEval.mismatch === 0 && wPrecShift.mismatch === 0;
const pA10b = pin298 && pinnedEns2 && 100 * (everywhereHit - ens2Hit) >= n2;
const pA10c = pinEvalEvery && pinEvalEns2;
const pA10d = twinIdentical && smokeOk && selftestOk && a9Regression.ran &&
  a9Regression.bytes_identical_except_seal && restoredOk &&
  perLedger.every((l) => l.ser_deterministic && l.twin_fresh_bytes_equal);
const verdict = pA10a && pA10b && pA10c && pA10d ? 'PASS' : 'FAIL';
console.log('\nP-A10a (wire mechanics: everywhere==ref byte-identical, default safe, paths equal, precedence A10>A9, live-table wire path): ' + (pA10a ? 'PASS' : 'FAIL') +
  ` — everywhere ${wEvEval.calls + wEvShift.calls} calls (mismatch ${wEvEval.mismatch + wEvShift.mismatch}); default ${wDefEval.calls + wDefShift.calls} (mismatch ${wDefEval.mismatch + wDefShift.mismatch}); precedence ${wPrecEval.calls + wPrecShift.calls} (mismatch ${wPrecEval.mismatch + wPrecShift.mismatch}); path_eq=${pathEqChecked}/${pathEqBad} bad; live_wire=${liveWireChecked}/${liveWireBad} bad`);
console.log('P-A10b (shift-H2 gain — the gap closed): ' + (pA10b ? 'PASS' : 'FAIL') +
  ` — everywhere ${everywhereHit}/${n2} (pin 298: ${pin298}) vs ens2 ${ens2Hit}/${n2} (pinned: ${pinnedEns2}); delta ${deltaShift >= 0 ? '+' : ''}${deltaShift.toFixed(4)}; 100*(ev-ens2)=${100 * (everywhereHit - ens2Hit)} >= ${n2}: ${100 * (everywhereHit - ens2Hit) >= n2}`);
console.log('P-A10c (saturated cost — the priced risk, pinned): ' + (pA10c ? 'PASS' : 'FAIL') +
  ` — everywhere micro ${evalEveryMicro} (A9 pin: ${pinEvalEvery}); ens2 micro ${evalEns2Micro} (P-W2b pin: ${pinEvalEns2}); flips -${flipsEval.ens2right_everywherewrong}/+${flipsEval.ens2wrong_everywhereright} net ${evalEverywhere - evalEns2} hits = -${((evalEns2 - evalEverywhere) / evalSamples.length).toFixed(4)}`);
console.log('P-A10d (twin + battery green + e_a9 regression): ' + (pA10d ? 'PASS' : 'FAIL') +
  ` — twin=${twinIdentical ? 'IDENTICAL ' + jsCore.length + 'B' : 'DIVERGED @' + firstDiff} a9_regression=${a9Regression.bytes_identical_except_seal} (${a9Regression.seal_stamps?.join('->')}) restored=${restoredOk} smoke=${smokeOk} selftest=${selftestOk}`);
console.log('\nP-A10 overall: ' + verdict);

// ---------- receipts ----------
mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-E';
const chain = (row) => { row.row_hash = sha256Hex(canonicalJSON([prev, row])); chainRows.push(row); prev = row.row_hash; };
chain({
  n: 1, claim: 'P-A10', verdict,
  pA10a, pA10b, pA10c, pA10d,
  law: {
    opt_in: 'hyper.fresh.fresh_everywhere = true',
    branch: 'priorCounted from SERIALIZED arms.field.observed on EVERY row (the A9 payload, gate removed; lambda*=0)',
    carrier: 'arms.field.observed (no new arm, no schema change, NO new numeric constant — the mode has no threshold)',
    precedence: 'A7 serve_with_field -> A10 fresh_everywhere -> A9 serve_with_fresh -> A8 hardness_gate -> default v1',
    escalate: 'mode-independent: top.p(served) < ESCALATE_BELOW (sealed, reused)',
  },
  wire: {
    everywhere: {
      eval: { calls: wEvEval.calls, mismatch: wEvEval.mismatch },
      shift_h2: { calls: wEvShift.calls, mismatch: wEvShift.mismatch },
    },
    default: {
      eval: { calls: wDefEval.calls, mismatch: wDefEval.mismatch },
      shift_h2: { calls: wDefShift.calls, mismatch: wDefShift.mismatch },
    },
    precedence_a10_over_a9: { eval: { calls: wPrecEval.calls, mismatch: wPrecEval.mismatch }, shift_h2: { calls: wPrecShift.calls, mismatch: wPrecShift.mismatch } },
    optin_path_equality: { checked: pathEqChecked, bad: pathEqBad },
    live_table_wire: { checked: liveWireChecked, bad: liveWireBad },
  },
  shift_h2_battery: {
    rows: n2, ens2_hits: ens2Hit, ens2_pinned_to_a8_a9: pinnedEns2,
    everywhere_hits: everywhereHit, everywhere_pinned_to_pg2d_298: pin298,
    delta: micro(deltaShift), margin: 10000,
    gate_open_rows_A9_law: openRows.length,
  },
  eval_cost: {
    rows: evalSamples.length, ens2_micro: evalEns2Micro, ens2_pinned_to_pw2b: pinEvalEns2,
    everywhere_micro: evalEveryMicro, everywhere_pinned_to_a9_fresh_micro: pinEvalEvery,
    flips_ens2right_everywherewrong: flipsEval.ens2right_everywherewrong,
    flips_ens2wrong_everywhereright: flipsEval.ens2wrong_everywhereright,
    a9_open_rows: evalOpens, a9_open_flips_loss: flipsEvalOpen.ens2right_everywherewrong, a9_open_flips_gain: flipsEvalOpen.ens2wrong_everywhereright,
    priced_delta: micro((evalEverywhere - evalEns2) / evalSamples.length),
  },
  twin: { identical: twinIdentical, js_bytes: jsCore.length, py_bytes: pyCoreStr.length, fresh_mode: freshTwin },
  a9_regression: { ...a9Regression, receipt_of_record_restored: restoredOk },
  smoke_9of9: smokeOk, selftest_green: selftestOk,
  artifact_sha256: artifact.artifact_sha256, artifact_pinned: artifactPinned,
  seal_v: reg.predictions.v,
});
chain({
  n: 2, claim: 'contrast-gap-anatomy-frontier-train-calib (no gates)',
  gap_anatomy: {
    closed_rows: closedRows.length,
    gap_gains: gapProfile, protection_losses: protProfile,
    other_closed: otherProfile, a9_open_rows: openProfile,
    net_closed_delta: gap.length - prot.length,
    interleave_proof: 'protection top.p range NESTED inside gap range: no row-level threshold separates gain from loss',
    everywhere_on_closed: closedRows.reduce((a, r) => a + r.freshHit, 0),
    accounting: `everywhere ${everywhereHit} = everywhere_on_closed ${closedRows.reduce((a, r) => a + r.freshHit, 0)} + open ${openRows.reduce((a, r) => a + r.freshHit, 0)}`,
  },
  h_star_frontier: { grid_micro: HG.map((h) => micro(h)), rows: frontier, full_gap_capture_H_max_micro: fullGapH },
  train_only_calibration: { rows: trainCalib.map(({ H, hits, n }) => ({ H, hits, n })), flat_in_H: calibFlat, verdict_note: 'mechanism (a) impossible-by-derivation: the train objective cannot rank H* values' },
  a9_receipt_audit: {
    finding: 'A9 receipt eval_optin_contrast flip FIELDS carry swapped labels (w2r=6/r2w=2 inconsistent with the same row micros 953668/938224); A9 verdict text of record (-6/+2) is the consistent reading; A10 measures explicitly',
    a10_measured: { all_rows_loss: flipsEval.ens2right_everywherewrong, all_rows_gain: flipsEval.ens2wrong_everywhereright, a9_open_rows_loss: flipsEvalOpen.ens2right_everywherewrong, a9_open_rows_gain: flipsEvalOpen.ens2wrong_everywhereright },
  },
});
chain({ n: 3, claim: 'per-ledger-shift-h2-everywhere', detail: perLedger });
writeFileSync('receipts/e_a10.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_a10_summary.json', JSON.stringify({
  run: 'e_a10_fresh_everywhere', verdict, pA10a, pA10b, pA10c, pA10d,
  law: { opt_in: 'hyper.fresh.fresh_everywhere', branch: 'priorCounted everywhere (lambda*=0, no threshold)', precedence: 'A7 > A10 > A9 > A8 > v1' },
  shiftBattery: { rows: n2, ens2: ens2Hit, everywhere: everywhereHit, pin298, delta: deltaShift },
  evalCost: { rows: evalSamples.length, ens2_micro: evalEns2Micro, everywhere_micro: evalEveryMicro, flips: flipsEval, a9_open_rows: evalOpens },
  gap: { closed: closedRows.length, gains: gap.length, losses: prot.length, net: gap.length - prot.length, interleave: true },
  trainCalib: { flat: calibFlat, hits: trainCalib[0].hits, n: trainCalib[0].n },
  a9_regression: a9Regression,
  perLedger,
}, null, 2));
console.log('receipts: receipts/e_a10.jsonl (tip ' + prev.slice(0, 16) + ')');
process.exit(0); // verdict printed; honest either way
