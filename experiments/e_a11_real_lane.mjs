// experiments/e_a11_real_lane.mjs — P-A11 (Addendum A11, seal v17): the
// real-lane production trial. Registered law: drive the SHIPPED serve path
// (src/serve.mjs, zero source changes) with the REAL qcells receipt streams
// (16 ledgers, git-pinned 615ddcf) walked in arrival order; before each
// judged-free serve call the lane re-serializes arms.field from its own
// receipted prefix [0..k) (grow-as-used, the registered A10 law) and serves
// under the A10 opt-in hyper.fresh.fresh_everywhere = true. Zero new
// constants: H* = ESCALATE_BELOW (escalate organ, mode-independent), the A10
// flag reused, branch order A7>A10>A9>A8>v1 unchanged, artifact pinned to
// the e_w2 receipt. Default law = v1 everywhere.
//
// (a) P-A11a: wire byte-exactness on the real-lane walk — everywhere /
//     default / leakage-probe arms byte-identical to the registered reference
//     expressions (references rebuilt from the RE-PARSED SERIALIZED table —
//     the serialization round-trip is the carrier); judged-carrying wire
//     sample (first 10 steps per ledger, over the SAME step's serialized
//     table) byte-identical; opt-in path equality.
// (b) P-A11b: the A9/A10 pins through the A11 driver — eval slice
//     (compile-time train aggregate) everywhere micro 938224 / ens2 micro
//     953668 / flips -6/+2; shift-H2 battery everywhere 298/343, ens2 242.
// (c) P-A11c: walk semantics exact + no leakage — per-step serialization
//     determinism; incremental walk == prefix re-grow (sampled); leakage
//     probe 0 violations; escalate organ law on every call; final walk table
//     == full-ledger grow (continuity).
// (d) P-A11d: twin + battery green + predecessor regression — core-v2
//     9960B==9960B; Python --fresh H1 tables on the REAL ledgers byte-equal
//     the JS midpoint walk tables (16/16); smoke 9/9; selftest green;
//     e_a10 re-run under the A11 seal measured-identical except the seal
//     stamp, receipt of record restored byte-for-byte.
// (e) P-A11e: the production question — pooled everywhere-live >= pooled
//     ens2 over the 1418 real-lane walk samples. Registered FAIL branch:
//     mode stays opt-in trial, measured cost receipted, AND the safety
//     envelope must hold: (ens2-ev)/1418 <= 0.05 (the promotion gate's own
//     DISCARD bound, an EXISTING sealed constant; integer form gap <= 70).
// Contrast receipts (no gates): per-ledger table, flips decomposed
// (exact-ctx vs fallback), walk exact-ctx coverage, escalate counts per arm,
// cold-start receipts, fallback-argmax law receipt.
// Fail-closed seal gate (A4: sha+size bind).

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { canonicalJSON, sha256Hex } from '../src/canon.mjs';
import { Rhizome, OPS } from '../src/field.mjs';
import { trainHash, judgeHash, judgeQthe, ensemble, argmax, top1 } from '../src/heads.mjs';
import { grow, compileWeaveV2 } from '../src/weaver.mjs';
import { loadWeave, judge as serveJudge, ESCALATE_BELOW } from '../src/serve.mjs';
import { SenseTablePrior } from '../src/sensetable.mjs';
import { contextTokens, contextStr, K } from '../src/features.mjs';
import { splitLedgers, loadLedger, makeSamples } from '../adapters/qcells.mjs';

// seal gate (v17)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.size !== BigInt(reg.predictions.size)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
if (reg.predictions.v < 17) { console.error('P-A11 requires seal v17+'); process.exit(2); }
console.log('seal verified (v' + reg.predictions.v + '):', sha.slice(0, 16));

const micro = (x) => Math.round(x * 1e6);
const SHIFT_DIR = new URL('./outputs/shift_family/', import.meta.url).pathname;
const LEDGERS = ['ladder7_echo3', 'ladder8_echo4', 'ladder9_echo4', 'ladder8_echo6'];

// ---------- soil: the REAL lane ----------
const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;
const sp = splitLedgers(QCELLS);
const trainSamples = sp.train.flatMap((f) => makeSamples(loadLedger(QCELLS, f))); // pipeline v2: per-ledger
const evalLedgers = sp.eval.map((f) => ({ name: f, rows: loadLedger(QCELLS, f) }));
const evalSamples = evalLedgers.flatMap((l) => makeSamples(l.rows));
const realLedgers = sp.all.map((f) => ({ name: f, rows: loadLedger(QCELLS, f) }));

// samples WITH row index (identical to makeSamples by construction — guard)
function samplesWithIdx(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    if (!OPS.includes(rows[i].op)) continue;
    out.push({ tokens: contextTokens(rows, i), ctx: contextStr(rows, i), label: rows[i].op, i, prevOp: rows[i - 1]?.op ?? null });
  }
  return out;
}
for (const l of [...realLedgers, ...LEDGERS.map((n) => ({ name: n, rows: loadLedger(SHIFT_DIR, n + '.jsonl') }))]) {
  const a = samplesWithIdx(l.rows), b = makeSamples(l.rows);
  if (a.length !== b.length || a.some((s, j) => s.ctx !== b[j].ctx || s.label !== b[j].label ||
    JSON.stringify(s.tokens) !== JSON.stringify(b[j].tokens))) {
    console.error('samplesWithIdx diverges from makeSamples on ' + l.name); process.exit(2);
  }
}
const N_REAL = realLedgers.reduce((a, l) => a + makeSamples(l.rows).length, 0);
console.log('soil: real ledgers=16 samples=' + N_REAL + ' (train ' + trainSamples.length + ' / eval ' + evalSamples.length + '; samplesWithIdx == makeSamples on ALL real + shift soils)');
if (N_REAL !== 1418) { console.error('real-lane soil moved: expected 1418 registered samples'); process.exit(2); }

// ---------- compile weave-v2 (mirror e_w2/e_a8/e_a9/e_a10 exactly; artifact pinned) ----------
const rhizome = new Rhizome();
grow(rhizome, trainSamples);
const { artifact } = compileWeaveV2({
  rhizome, trainSamples, evalSamples, weaveIndex: 2,
  notes: 'weave-2 (A7): first weave carrying the rhizome sense table',
});
mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/weave_v2_js.json', canonicalJSON(artifact));
const eW2 = JSON.parse(readFileSync('receipts/e_w2.jsonl', 'utf8').split('\n')[0]);
const eA9 = JSON.parse(readFileSync('receipts/e_a9.jsonl', 'utf8').split('\n')[0]);
const eA10 = JSON.parse(readFileSync('receipts/e_a10.jsonl', 'utf8').split('\n')[0]);
const artifactPinned = artifact.artifact_sha256 === eW2.artifact_sha256;
console.log('weave-v2 compiled: artifact_sha256=' + artifact.artifact_sha256.slice(0, 16) +
  ' pinned-to-e_w2-receipt=' + artifactPinned);
if (!artifactPinned) { console.error('artifact not pinned to e_w2 receipt — refusing'); process.exit(2); }

// ---------- serve setup (modes; flags exactly as committed) ----------
const reloaded = JSON.parse(readFileSync('experiments/outputs/weave_v2_js.json', 'utf8'));
const loadedDefault = loadWeave(reloaded); // v1 law, flags ABSENT
if (loadedDefault.fresh !== false || loadedDefault.freshEverywhere !== false) {
  console.error('default must carry fresh=false freshEverywhere=false (flags absent)'); process.exit(2);
}
const QUESTIONS = { q1: { type: 'choice', criteria: { opcode: true } }, q2: { type: 'noul' } };
const altOp = (op) => OPS[(OPS.indexOf(op) + 1) % OPS.length]; // leakage-probe mutation

// references: the exact expressions of record, rebuilt from the RE-PARSED
// SERIALIZED table (the serialization round-trip is the registered carrier)
function refResponse(handle, tokens, judgedOp, kind, fieldTable) {
  const ph = judgeHash(handle.hash, tokens).probs;
  const pq = judgeQthe(handle.qthe, tokens).probs;
  let probs;
  if (kind === 'everywhere') {
    const refField = new SenseTablePrior(JSON.parse(canonicalJSON(fieldTable))); // re-parsed serialized aggregate
    probs = refField.priorCounted(tokens.join('|'));
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

function loadHandleWithTable(fieldTable) {
  const h = loadWeave(JSON.parse(canonicalJSON({ ...artifact, arms: { ...artifact.arms, field: fieldTable } })));
  h.freshEverywhere = true; // the A10 opt-in, loaded-handle path
  return h;
}

// ---------- P-A11 walk: the real-lane production trial ----------
let batCalls = 0, batMismatch = { everywhere: 0, default: 0, leakage: 0 };
let escalateEv = 0, escalateDef = 0;
let evHit = 0, defHit = 0;
let exactCtxSteps = 0, fallbackSteps = 0;
let serDetBad = 0, regrowChecked = 0, regrowBad = 0, finalContBad = 0;
let escLawBad = 0;
let wireChecked = 0, wireBadEv = 0, wireBadDef = 0; // judged-carrying sample, the SAME step's table
const flips = []; // everywhere vs ens2 disagreements (the honest per-row receipt)
const coldStart = [];
const fallbackArgmax = {};
const perLedger = [];

for (const { name, rows } of realLedgers) {
  const samples = samplesWithIdx(rows);
  const walkRz = new Rhizome(); // the lane's own watched stream (grows from receipts)
  let lEv = 0, lDef = 0, lExact = 0, lFallback = 0, lEscEv = 0, lEscDef = 0;
  for (let k = 0; k < samples.length; k++) {
    const s = samples[k], i = s.i;
    // (1) the lane re-serializes arms.field from its own receipted prefix [0..k)
    const liveTable1 = walkRz.senseTable();
    const liveBytesA = canonicalJSON(liveTable1);
    const liveBytesB = canonicalJSON(walkRz.senseTable());
    if (liveBytesA !== liveBytesB) serDetBad++;
    // (2) serve: judged-free, the P-G2d/P-A9c battery convention
    const handleEv = loadHandleWithTable(JSON.parse(liveBytesA));
    const ctxSlice = rows.slice(Math.max(0, i - K), i);
    const outEv = serveJudge(handleEv, { context: ctxSlice }, QUESTIONS);
    const outDef = serveJudge(loadedDefault, { context: ctxSlice }, QUESTIONS);
    // (3) leakage probe: the judgment must never read the row under judgment
    const rowsMut = rows.slice();
    rowsMut[i] = { ...rowsMut[i], op: altOp(rowsMut[i].op) };
    const outMut = serveJudge(handleEv, { context: rowsMut.slice(Math.max(0, i - K), i) }, QUESTIONS);
    // (4) references (rebuilt from the re-parsed serialized table / independent ens2)
    const batTokens = contextTokens(rows, i); // == what the judged-free serve computes
    const refEv = refResponse(handleEv, batTokens, undefined, 'everywhere', liveTable1);
    const refDef = refResponse(loadedDefault, batTokens, undefined, 'v1', liveTable1);
    if (JSON.stringify(outEv) !== JSON.stringify(refEv)) batMismatch.everywhere++;
    if (JSON.stringify(outDef) !== JSON.stringify(refDef)) batMismatch.default++;
    if (JSON.stringify(outMut) !== JSON.stringify(outEv)) batMismatch.leakage++;
    batCalls++;
    // (5) judged-carrying wire sample: the endpoint shape over the SAME step's table
    if (k < 10) {
      const outEvW = serveJudge(handleEv, { context: ctxSlice }, QUESTIONS, rows[i]);
      const outDefW = serveJudge(loadedDefault, { context: ctxSlice }, QUESTIONS, rows[i]);
      const tokensW = contextTokens(rows.slice(0, i + 1), i + 1); // exactly what serve.judge() computes
      const refEvW = refResponse(handleEv, tokensW, rows[i].op, 'everywhere', liveTable1);
      const refDefW = refResponse(loadedDefault, tokensW, rows[i].op, 'v1', liveTable1);
      if (JSON.stringify(outEvW) !== JSON.stringify(refEvW)) wireBadEv++;
      if (JSON.stringify(outDefW) !== JSON.stringify(refDefW)) wireBadDef++;
      wireChecked++;
    }
    // (6) walk bookkeeping
    const e2 = ensemble(judgeHash(loadedDefault.hash, batTokens).probs, judgeQthe(loadedDefault.qthe, batTokens).probs, 0.5);
    const t2 = top1(e2, s.label);
    const tf = outEv.answers.q1.choice === s.label ? 1 : 0;
    const td = outDef.answers.q1.choice === s.label ? 1 : 0;
    const exactCtx = handleEv.field.observed.has(s.ctx);
    if (exactCtx) { exactCtxSteps++; lExact++; } else {
      fallbackSteps++; lFallback++;
      fallbackArgmax[outEv.answers.q1.choice] = (fallbackArgmax[outEv.answers.q1.choice] ?? 0) + 1;
    }
    if (outEv.escalate !== (argmax(refEv.answers.q1.probabilities).p < ESCALATE_BELOW)) escLawBad++;
    if (outDef.escalate !== (argmax(refDef.answers.q1.probabilities).p < ESCALATE_BELOW)) escLawBad++;
    if (outEv.escalate) { escalateEv++; lEscEv++; }
    if (outDef.escalate) { escalateDef++; lEscDef++; }
    evHit += tf; defHit += td; lEv += tf; lDef += td;
    if (t2 !== tf) flips.push({ ledger: name, k, i, label: s.label, prevOp: s.prevOp, topP: micro(argmax(e2).p), exactCtx, fallback: !exactCtx, ens2Hit: t2, everywhereHit: tf });
    if (k === 0) coldStart.push({ ledger: name, everywhere_choice: outEv.answers.q1.choice, default_choice: outDef.answers.q1.choice, everywhere_escalate: outEv.escalate });
    // (7) incremental walk == prefix re-grow (sampled: every 16th step)
    if (k % 16 === 0) {
      const rz2 = new Rhizome();
      grow(rz2, samples.slice(0, k));
      regrowChecked++;
      if (canonicalJSON(rz2.senseTable()) !== liveBytesA) regrowBad++;
    }
    // (8) the receipt is observed — the walk grows (the only collapse)
    walkRz.deform(s.ctx, { gamma: 0, tag: 'stream' });
    walkRz.observe(s.ctx, s.label, { source: 'receipt' });
  }
  // (9) walk continuity: final table == full-ledger grow
  const rzFull = new Rhizome();
  grow(rzFull, samples);
  if (canonicalJSON(rzFull.senseTable()) !== canonicalJSON(walkRz.senseTable())) finalContBad++;
  perLedger.push({ ledger: name, samples: samples.length, ens2_hits: lDef, everywhere_hits: lEv, exact_ctx: lExact, fallback: lFallback, escalate_everywhere: lEscEv, escalate_default: lEscDef });
  console.log(`  walk ${name}: n=${samples.length}  ens2 ${lDef}  everywhere ${lEv}  (exact-ctx ${lExact}, fallback ${lFallback}, esc ev/def ${lEscEv}/${lEscDef})`);
}
const evDelta = evHit - defHit;
console.log(`P-A11e walk: everywhere-live ${evHit}/${N_REAL}  ens2(default) ${defHit}/${N_REAL}  delta ${evDelta >= 0 ? '+' : ''}${evDelta} (${(evDelta / N_REAL >= 0 ? '+' : '')}${(evDelta / N_REAL).toFixed(4)})`);
console.log(`walk anatomy: exact-ctx ${exactCtxSteps} fallback ${fallbackSteps}; escalate ev/def ${escalateEv}/${escalateDef}; mismatches ev/def/leak ${batMismatch.everywhere}/${batMismatch.default}/${batMismatch.leakage}; serDetBad ${serDetBad} regrow ${regrowBad}/${regrowChecked} continuityBad ${finalContBad} escLawBad ${escLawBad}`);
console.log(`wire sample (first 10 steps/ledger, judged-carrying, same-step table): ${wireChecked} calls — everywhere mismatch ${wireBadEv}, default mismatch ${wireBadDef}`);

// ---------- P-A11d twin: Python --fresh H1 tables on the REAL ledgers (16/16) ----------
let twinMidpointBad = 0;
for (const { name, rows } of realLedgers) {
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const rz = new Rhizome();
  grow(rz, samples.slice(0, half)); // the JS midpoint walk table
  const midBytes = canonicalJSON(rz.senseTable());
  const outF = 'experiments/outputs/fresh_table_real_' + name.replace('.jsonl', '') + '_py.json';
  const r = spawnSync('python3', ['ref/garden_ref.py', QCELLS, 'experiments/outputs/_seal_core_unused.json', '--fresh', QCELLS + name, outF], { encoding: 'utf8', timeout: 300000 });
  if (r.status !== 0) { console.error('twin fresh failed for ' + name + ':', r.stderr); process.exit(1); }
  const ok = readFileSync(outF, 'utf8') === midBytes;
  if (!ok) twinMidpointBad++;
  perLedger.find((p) => p.ledger === name).twin_midpoint_fresh_bytes_equal = ok;
}
const twinMidpointAll = twinMidpointBad === 0;
console.log('midpoint fresh twins on the real ledgers: ' + (twinMidpointAll ? '16/16 byte-identical' : 'FAIL ' + twinMidpointBad));

// opt-in path equality: artifact-hyper vs loaded-handle, sampled (midpoint tables)
const artifactOpt = JSON.parse(JSON.stringify(artifact)); // ship path: artifact-hyper opt-in
artifactOpt.hyper.fresh = { fresh_everywhere: true };
let pathEqChecked = 0, pathEqBad = 0;
for (const { name, rows } of realLedgers) {
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const rz = new Rhizome();
  grow(rz, samples.slice(0, half));
  const midTable = rz.senseTable();
  const hyperWithTable = loadWeave(JSON.parse(canonicalJSON({ ...artifactOpt, arms: { ...artifactOpt.arms, field: midTable } })));
  if (hyperWithTable.freshEverywhere !== true) { console.error('artifact-hyper opt-in failed to load'); process.exit(2); }
  const handleEv = loadHandleWithTable(JSON.parse(canonicalJSON(midTable)));
  for (const s of [samples[0], samples[samples.length - 1]]) {
    const outHandle = serveJudge(handleEv, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const outHyper = serveJudge(hyperWithTable, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    pathEqChecked++;
    if (JSON.stringify(outHandle) !== JSON.stringify(outHyper)) pathEqBad++;
  }
}
console.log(`opt-in path equality (artifact-hyper == loaded-handle): ${pathEqChecked} checked, ${pathEqBad} bad`);

// ---------- P-A11b(i): eval slice pins (compile-time train aggregate) ----------
const loadedEverywhere = loadWeave(reloaded); // the A10 measurement handle (no re-serialization)
loadedEverywhere.freshEverywhere = true;
let evalEns2 = 0, evalEverywhere = 0;
const flipsEval = { ens2right_everywherewrong: 0, ens2wrong_everywhereright: 0 };
for (const l of evalLedgers) {
  for (const s of samplesWithIdx(l.rows)) {
    const batTokens = contextTokens(l.rows, s.i);
    const e2 = ensemble(judgeHash(loadedDefault.hash, batTokens).probs, judgeQthe(loadedDefault.qthe, batTokens).probs, 0.5);
    const t2 = top1(e2, s.label);
    const out = serveJudge(loadedEverywhere, { context: l.rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const tf = out.answers.q1.choice === s.label ? 1 : 0;
    evalEns2 += t2; evalEverywhere += tf;
    if (t2 === 1 && tf === 0) flipsEval.ens2right_everywherewrong++;
    if (t2 === 0 && tf === 1) flipsEval.ens2wrong_everywhereright++;
  }
}
const evalEns2Micro = micro(evalEns2 / evalSamples.length);
const evalEveryMicro = micro(evalEverywhere / evalSamples.length);
const pinEvalEvery = evalEveryMicro === eA9.eval_optin_contrast.fresh_micro;
const pinEvalEns2 = evalEns2Micro === eW2.serve.ens2;
const pinEvalFlips = flipsEval.ens2right_everywherewrong === 6 && flipsEval.ens2wrong_everywhereright === 2;
console.log(`P-A11b(i) eval pins: everywhere micro ${evalEveryMicro} (A9 pin 938224: ${pinEvalEvery})  ens2 micro ${evalEns2Micro} (P-W2b pin 953668: ${pinEvalEns2})  flips -${flipsEval.ens2right_everywherewrong}/+${flipsEval.ens2wrong_everywhereright} (pin -6/+2: ${pinEvalFlips})`);

// ---------- P-A11b(ii): shift-H2 battery pins (grow-as-used, the A10 protocol) ----------
let shiftEns2 = 0, shiftEverywhere = 0, shiftN = 0;
for (const name of LEDGERS) {
  const rows = loadLedger(SHIFT_DIR, name + '.jsonl');
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const H1 = samples.slice(0, half), H2 = samples.slice(half);
  const rz = new Rhizome();
  grow(rz, H1); // grow-as-used: watch H1, re-serialize arms.field (P-G2d protocol)
  const handleEv = loadHandleWithTable(JSON.parse(canonicalJSON(rz.senseTable())));
  let h2e2 = 0, h2ev = 0;
  for (const s of H2) {
    const batTokens = contextTokens(rows, s.i);
    const e2 = ensemble(judgeHash(loadedDefault.hash, batTokens).probs, judgeQthe(loadedDefault.qthe, batTokens).probs, 0.5);
    h2e2 += top1(e2, s.label);
    const out = serveJudge(handleEv, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    h2ev += out.answers.q1.choice === s.label ? 1 : 0;
  }
  shiftEns2 += h2e2; shiftEverywhere += h2ev; shiftN += H2.length;
  console.log(`  shift ${name}: H2=${H2.length} ens2 ${h2e2} everywhere ${h2ev}`);
}
const pinShiftEv = shiftEverywhere === 298;
const pinShiftEns2 = shiftEns2 === eA10.shift_h2_battery.ens2_hits; // the committed receipt pin (242)
console.log(`P-A11b(ii) shift pins: everywhere ${shiftEverywhere}/${shiftN} (pin 298: ${pinShiftEv})  ens2 ${shiftEns2}/${shiftN} (pin ${eA10.shift_h2_battery.ens2_hits}: ${pinShiftEns2})`);

// ---------- P-A11d: twin core + battery green + e_a10 predecessor regression ----------
const hashM = trainHash(trainSamples);
const Wm = hashM.W.map((w) => {
  const sparse = {};
  for (let i = 0; i < w.length; i++) if (w[i] !== 0) sparse[String(i)] = Math.round(w[i] * 1e6);
  return sparse;
});
const core = {
  schema: 'jev-garden/weave-core-v2',
  index: 1,
  journal_tip: rhizome.journalTip(),
  journal_len: rhizome.journal.length,
  hyper: { lr: 0.5, epochs: 12, wd: 0.0001, clip: 5, K: 3, HB: 2048, ens_lambda: 0.5, wormhole_weight: 0.3, ens3: { wh: 0.4, wq: 0.4, wf: 0.2 } },
  arms: { hash: { W: Wm, b: Array.from(hashM.b, (x) => Math.round(x * 1e6)) }, field: rhizome.senseTable() },
};
writeFileSync('experiments/outputs/weave_core_v2_js.json', canonicalJSON(core));
const py = spawnSync('python3', ['ref/garden_ref.py', QCELLS, 'experiments/outputs/weave_core_v2_py.json'], { encoding: 'utf8', timeout: 300000 });
if (py.status !== 0) { console.error('twin failed:', py.stderr); process.exit(1); }
const jsCore = readFileSync('experiments/outputs/weave_core_v2_js.json', 'utf8');
const pyCoreStr = readFileSync('experiments/outputs/weave_core_v2_py.json', 'utf8');
const twinIdentical = jsCore === pyCoreStr;
console.log('twin core-v2: ' + (twinIdentical ? 'IDENTICAL ' + jsCore.length + 'B' : 'DIVERGED') + ` — js=${jsCore.length}B py=${pyCoreStr.length}B`);

const eA10Original = readFileSync('receipts/e_a10.jsonl', 'utf8');
const a10Run = spawnSync('node', ['experiments/e_a10_fresh_everywhere.mjs'], { encoding: 'utf8', timeout: 600000 });
let a10Regression = { ran: a10Run.status === 0, verdict_pass: /P-A10 overall: PASS/.test(a10Run.stdout), bytes_identical_except_seal: false, seal_stamps: [] };
try {
  const origRows = eA10Original.trim().split('\n').map((l) => JSON.parse(l));
  const newRows = readFileSync('receipts/e_a10.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const strip = (rows) => canonicalJSON(rows.map(({ seal_v, row_hash, ...rest }) => rest));
  a10Regression.bytes_identical_except_seal = strip(origRows) === strip(newRows) && origRows.length === newRows.length;
  a10Regression.seal_stamps = [origRows[0].seal_v, newRows[0].seal_v];
} catch (e) { a10Regression.error = String(e); }
writeFileSync('receipts/e_a10.jsonl', eA10Original); // the A10 receipt of record is RESTORED byte-for-byte (append-only)
const a10RestoredOk = readFileSync('receipts/e_a10.jsonl', 'utf8') === eA10Original;
console.log(`e_a10 regression under the A11 law: ran=${a10Regression.ran} P-A10=${a10Regression.verdict_pass ? 'PASS' : 'FAIL'} bytes_identical_except_seal=${a10Regression.bytes_identical_except_seal} (seal stamps ${a10Regression.seal_stamps?.join(' -> ')}); receipt of record restored=${a10RestoredOk}`);

const smoke = spawnSync('node', ['smoke.mjs'], { encoding: 'utf8' });
const smokeOk = smoke.status === 0 && /9 passed, 0 failed/.test(smoke.stdout);
const selftest = spawnSync('node', ['tests/selftest.mjs'], { encoding: 'utf8' });
const selftestOk = selftest.status === 0;
console.log('smoke: ' + (smokeOk ? '9/9' : 'FAIL') + '; selftest: ' + (selftestOk ? 'green' : 'FAIL'));

// ---------- verdicts (registered gates; honest either way) ----------
const pA11a = batMismatch.everywhere === 0 && batMismatch.default === 0 && batMismatch.leakage === 0 &&
  wireBadEv === 0 && pathEqBad === 0;
const pA11b = pinEvalEvery && pinEvalEns2 && pinEvalFlips && pinShiftEv && pinShiftEns2;
const pA11c = serDetBad === 0 && regrowBad === 0 && finalContBad === 0 &&
  batMismatch.leakage === 0 && escLawBad === 0;
const pA11d = twinIdentical && twinMidpointAll && smokeOk && selftestOk && a10Regression.ran &&
  a10Regression.verdict_pass && a10Regression.bytes_identical_except_seal && a10RestoredOk;
const envelopeOk = (defHit - evHit) <= 70 && Math.max(0, defHit - evHit) / N_REAL <= 0.05;
const pA11e = evHit >= defHit;
const verdict = pA11a && pA11b && pA11c && pA11d && pA11e ? 'PASS' : 'FAIL';
console.log('\nP-A11a (wire byte-exactness on the real-lane walk): ' + (pA11a ? 'PASS' : 'FAIL') +
  ` — battery ${batCalls} steps x3 arms (mismatch ev/def/leak ${batMismatch.everywhere}/${batMismatch.default}/${batMismatch.leakage}); wire sample ${wireChecked} (everywhere mismatch ${wireBadEv}, default contrast ${wireBadDef}); path_eq ${pathEqChecked}/${pathEqBad} bad`);
console.log('P-A11b (A9/A10 pins through the A11 driver): ' + (pA11b ? 'PASS' : 'FAIL') +
  ` — eval everywhere ${evalEveryMicro} (pin ${pinEvalEvery}) ens2 ${evalEns2Micro} (pin ${pinEvalEns2}) flips -6/+2 (${pinEvalFlips}); shift everywhere ${shiftEverywhere}/${shiftN} (pin ${pinShiftEv}) ens2 ${shiftEns2} (pin ${pinShiftEns2})`);
console.log('P-A11c (walk semantics exact + no leakage): ' + (pA11c ? 'PASS' : 'FAIL') +
  ` — serDetBad ${serDetBad}; regrow ${regrowBad}/${regrowChecked}; continuityBad ${finalContBad}; leakage violations ${batMismatch.leakage}; escalate-law violations ${escLawBad}`);
console.log('P-A11d (twin + battery green + predecessor regression): ' + (pA11d ? 'PASS' : 'FAIL') +
  ` — twin=${twinIdentical ? 'IDENTICAL ' + jsCore.length + 'B' : 'DIVERGED'}; midpoint twins ${twinMidpointAll ? '16/16' : 'FAIL'}; smoke=${smokeOk} selftest=${selftestOk} e_a10=${a10Regression.verdict_pass}/${a10Regression.bytes_identical_except_seal}/restored=${a10RestoredOk}`);
console.log('P-A11e (the production question: everywhere-live >= ens2 on the real-lane walk): ' + (pA11e ? 'PASS' : 'FAIL') +
  ` — everywhere-live ${evHit}/${N_REAL} vs ens2 ${defHit}/${N_REAL}; delta ${evDelta} (${(evDelta / N_REAL).toFixed(4)}); safety envelope (gap <= 70 = 0.05 DISCARD bound): ${envelopeOk ? 'HELD' : 'BREACHED'}`);
console.log('\nP-A11 overall: ' + verdict + (pA11e ? '' : ' (registered FAIL branch: mode stays opt-in trial; measured cost receipted)'));

// ---------- receipts ----------
mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-F';
const chain = (row) => { row.row_hash = sha256Hex(canonicalJSON([prev, row])); chainRows.push(row); prev = row.row_hash; };
chain({
  n: 1, claim: 'P-A11', verdict,
  pA11a, pA11b, pA11c, pA11d, pA11e,
  law: {
    trial: 'real-lane production trial: the 16 git-pinned qcells ledgers (1418 rows) walked in arrival order through the SHIPPED serve path; arms.field re-serialized from the lane\'s own receipted prefix [0..k) before every judged-free serve call',
    opt_in: 'hyper.fresh.fresh_everywhere = true (the A10 flag, reused)',
    growth: 'walk rhizome deform+observe per receipt, source receipt (field.mjs: observations are the only collapse); per-ledger chains; cold start = uniform (registered law, not special-cased)',
    escalate: 'RECORDED not executed: top.p(served) < ESCALATE_BELOW (0.55 sealed, reused, mode-independent); teacher channel out of scope',
    precedence: 'A7 serve_with_field -> A10 fresh_everywhere -> A9 serve_with_fresh -> A8 hardness_gate -> default v1 (unchanged)',
    zero_new_constants: true, source_changes: 0,
  },
  walk: {
    steps: N_REAL, everywhere_hits: evHit, default_hits: defHit, delta_hits: evDelta, delta_micro: micro(evDelta / N_REAL),
    production_question: pA11e ? 'PASS: fresh memory pays on the real lane under production grow-as-used' : 'FAIL: production grow-as-used does not pay on the real lane (mode stays opt-in trial)',
    safety_envelope: { bound: 'gap <= 70 hits (0.05 promotion-gate DISCARD bound, reused existing sealed constant)', gap: defHit - evHit, held: envelopeOk },
    exact_ctx_steps: exactCtxSteps, fallback_steps: fallbackSteps,
    escalate_everywhere: escalateEv, escalate_default: escalateDef,
    fallback_argmax_law: fallbackArgmax,
    cold_start: coldStart,
  },
  wire: {
    battery_arms: { everywhere: { mismatch: batMismatch.everywhere }, default: { mismatch: batMismatch.default }, leakage_probe: { mismatch: batMismatch.leakage } },
    judged_carrying_sample: { calls: wireChecked, everywhere_mismatch: wireBadEv, default_mismatch_contrast: wireBadDef },
    optin_path_equality: { checked: pathEqChecked, bad: pathEqBad },
  },
  pins: {
    eval_slice: { rows: evalSamples.length, everywhere_micro: evalEveryMicro, everywhere_pinned_938224: pinEvalEvery, ens2_micro: evalEns2Micro, ens2_pinned_953668: pinEvalEns2, flips: flipsEval, flips_pinned: pinEvalFlips },
    shift_h2: { rows: shiftN, everywhere_hits: shiftEverywhere, everywhere_pinned_298: pinShiftEv, ens2_hits: shiftEns2, ens2_pinned_242: pinShiftEns2 },
  },
  semantics: {
    serialization_determinism_bad: serDetBad,
    incremental_vs_regrow: { checked: regrowChecked, bad: regrowBad },
    final_continuity_bad: finalContBad,
    escalate_law_violations: escLawBad,
  },
  twin: { identical: twinIdentical, js_bytes: jsCore.length, py_bytes: pyCoreStr.length, real_ledger_midpoint_16: twinMidpointAll },
  e_a10_regression: { ...a10Regression, receipt_of_record_restored: a10RestoredOk },
  smoke_9of9: smokeOk, selftest_green: selftestOk,
  artifact_sha256: artifact.artifact_sha256, artifact_pinned: artifactPinned,
  seal_v: reg.predictions.v,
});
chain({
  n: 2, claim: 'contrast-walk-anatomy-flips (no gates)',
  per_ledger: perLedger,
  flips_everywhere_vs_ens2: flips,
  walk_coverage: { steps: N_REAL, exact_ctx: exactCtxSteps, fallback: fallbackSteps, exact_ctx_fraction: micro(exactCtxSteps / N_REAL) },
  fallback_law: 'unseen-context steps serve the prefix marginal, add-1 smoothed (the priorCounted fallback law); argmax distribution receipted in row 1 walk.fallback_argmax_law',
  cold_start_law: 'k=0 steps serve uniform (empty aggregate); argmax ties resolve in OPS order (LINK) — the registered cold-start behavior, not special-cased',
});
chain({ n: 3, claim: 'per-ledger-real-lane-walk', detail: perLedger });
writeFileSync('receipts/e_a11.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_a11_summary.json', JSON.stringify({
  run: 'e_a11_real_lane', verdict, pA11a, pA11b, pA11c, pA11d, pA11e,
  law: { trial: 'real-lane production grow-as-used walk, judged-free, zero source changes', opt_in: 'hyper.fresh.fresh_everywhere', precedence: 'A7 > A10 > A9 > A8 > v1' },
  walkQuestion: { rows: N_REAL, everywhere: evHit, ens2: defHit, delta: evDelta, envelope_held: envelopeOk },
  pins: { eval_everywhere_micro: evalEveryMicro, eval_ens2_micro: evalEns2Micro, shift_everywhere: shiftEverywhere, shift_ens2: shiftEns2 },
  coverage: { exact_ctx: exactCtxSteps, fallback: fallbackSteps, escalate_everywhere: escalateEv, escalate_default: escalateDef },
  perLedger,
}, null, 2));
console.log('receipts: receipts/e_a11.jsonl (tip ' + prev.slice(0, 16) + ')');
process.exit(0); // verdict printed; honest either way
