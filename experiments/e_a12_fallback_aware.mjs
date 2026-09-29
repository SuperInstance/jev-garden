// experiments/e_a12_fallback_aware.mjs — P-A12 (Addendum A12, seal v19): the
// fallback-aware everywhere trial mode — the mechanism A11 priced from its
// honest FAIL. Registered law: opt-in
// hyper.fresh.fresh_everywhere_fallback_aware = true — serve the walk memory
// ONLY on exact-ctx steps (A11: EXACT-CTX NEUTRALITY, zero hit-outcome flips
// on all 1216 exact-ctx steps), and the EXACT v1 law on unseen contexts (A11:
// 100% of the everywhere damage sat on the 202 fallback steps). The
// exact-ctx test is the registered A11 classification — observed.has(token
// key), a MEMBERSHIP test, NOT a threshold: zero new constants. Both served
// expressions are existing registered pieces (the A10 payload priorCounted
// and the v1 ensemble). Branch order A7 > A12 > A10 > A9 > A8 > v1.
//
// (a) P-A12a: real-lane hit-identity — fallback-aware == default over the
//     1418 paired walk steps (0 hit mismatches); default reproduces the A11
//     pin 1378/1418; wire byte-exactness vs the A12 reference; channel
//     byte-identity (fallback steps == default bytes, exact-ctx steps ==
//     everywhere bytes); judged-carrying wire sample byte-identical.
// (b) P-A12b: shift-H2 class preservation — grow-as-used battery, pooled
//     fallback-aware >= 298/343 (the A10 pin held or improved; class bound)
//     AND ens2 == 242/343 (pinned). Contrast: class decomposition of the
//     everywhere-vs-default shift flips (closes where the 4 A10 protection
//     losses sit).
// (c) P-A12c: byte-safety — default byte-identical with the flag ABSENT
//     (walk + 602 battery calls); A10-only mode byte-identical (602);
//     precedence A12 > A10 and A12 > A9 (602 each); opt-in path equality
//     (sampled); eval pins 938224 / 953668 / flips -6/+2; escalate law on
//     every call; leakage probe 0 violations; walk semantics exact
//     (serialization determinism, regrow sample, continuity).
// (d) P-A12d: house bindings — core-v2 twin 9960B==9960B; artifact pinned to
//     the e_w2 receipt; real-ledger midpoint fresh twins 16/16; smoke 9/9;
//     selftest green; e_a11 predecessor regression (which re-runs e_a10,
//     which re-checks e_a9) with every MEASURED byte reproducing after the
//     STAMP-CLASS strip (top-level seal_v + chain row_hashes + nested
//     *_regression.seal_stamps — the exact stamp class the A11 P-A11d audit
//     enumerated, carved BEFORE the run); receipts of record restored
//     byte-for-byte.
// Contrast receipts (no gates): per-ledger walk table, hit-flip list
// (predicted EMPTY), A12 escalate load vs everywhere 20.9% / default 2.3%,
// cold-start receipts, eval-slice fallback-aware decomposition.
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

// seal gate (v19)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.size !== BigInt(reg.predictions.size)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
if (reg.predictions.v < 19) { console.error('P-A12 requires seal v19+'); process.exit(2); }
console.log('seal verified (v' + reg.predictions.v + '):', sha.slice(0, 16));

const micro = (x) => Math.round(x * 1e6);
const SHIFT_DIR = new URL('./outputs/shift_family/', import.meta.url).pathname;
const LEDGERS = ['ladder7_echo3', 'ladder8_echo4', 'ladder9_echo4', 'ladder8_echo6'];

// ---------- soil: the REAL lane (the registered A11 soil, unchanged) ----------
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

// ---------- compile weave-v2 (mirror e_w2/e_a8/e_a9/e_a10/e_a11 exactly; artifact pinned) ----------
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
const eA11 = JSON.parse(readFileSync('receipts/e_a11.jsonl', 'utf8').split('\n')[0]);
const artifactPinned = artifact.artifact_sha256 === eW2.artifact_sha256;
console.log('weave-v2 compiled: artifact_sha256=' + artifact.artifact_sha256.slice(0, 16) +
  ' pinned-to-e_w2-receipt=' + artifactPinned);
if (!artifactPinned) { console.error('artifact not pinned to e_w2 receipt — refusing'); process.exit(2); }

// ---------- serve setup (modes; flags exactly as committed) ----------
const reloaded = JSON.parse(readFileSync('experiments/outputs/weave_v2_js.json', 'utf8'));
const loadedDefault = loadWeave(reloaded); // v1 law, flags ABSENT
if (loadedDefault.fresh !== false || loadedDefault.freshEverywhere !== false || loadedDefault.freshAware !== false) {
  console.error('default must carry fresh=false freshEverywhere=false freshAware=false (flags absent)'); process.exit(2);
}
const QUESTIONS = { q1: { type: 'choice', criteria: { opcode: true } }, q2: { type: 'noul' } };
const altOp = (op) => OPS[(OPS.indexOf(op) + 1) % OPS.length]; // leakage-probe mutation

// references: the exact expressions of record, rebuilt from the RE-PARSED
// SERIALIZED table (the serialization round-trip is the registered carrier).
// kind 'fallback_aware': the A12 law — the classification uses the SAME
// re-parsed table the serve path holds (observed.has on the serve token key).
function refResponse(handle, tokens, judgedOp, kind, fieldTable) {
  const ph = judgeHash(handle.hash, tokens).probs;
  const pq = judgeQthe(handle.qthe, tokens).probs;
  let probs;
  if (kind === 'everywhere') {
    const refField = new SenseTablePrior(JSON.parse(canonicalJSON(fieldTable))); // re-parsed serialized aggregate
    probs = refField.priorCounted(tokens.join('|'));
  } else if (kind === 'fallback_aware') {
    const refField = new SenseTablePrior(JSON.parse(canonicalJSON(fieldTable)));
    probs = refField.observed.has(tokens.join('|'))
      ? refField.priorCounted(tokens.join('|'))
      : ensemble(ph, pq, 0.5); // the v1 law on unseen contexts
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

function loadHandleWithTable(fieldTable, mode) {
  const h = loadWeave(JSON.parse(canonicalJSON({ ...artifact, arms: { ...artifact.arms, field: fieldTable } })));
  if (mode === 'a12') h.freshAware = true;      // the A12 opt-in, loaded-handle path
  else if (mode === 'everywhere') h.freshEverywhere = true; // the A10 opt-in (byte-safety reference)
  else if (mode !== 'default') throw new Error('unknown mode ' + mode);
  return h;
}

// ---------- P-A12 walk: the real-lane production trial (the A11 machinery) ----------
let batCalls = 0, batMismatch = { a12: 0, default: 0, everywhere: 0, leakage: 0 };
let channelViolations = { fallback_vs_default: 0, exact_vs_everywhere: 0 };
let escalateAw = 0, escalateDef = 0, escalateEv = 0;
let awHit = 0, defHit = 0, evHit = 0;
let exactCtxSteps = 0, fallbackSteps = 0;
let serDetBad = 0, regrowChecked = 0, regrowBad = 0, finalContBad = 0;
let escLawBad = 0;
let wireChecked = 0, wireBadAw = 0, wireBadDef = 0; // judged-carrying sample, the SAME step's table
const flips = []; // fallback-aware vs default disagreements (predicted EMPTY — the honest per-row receipt)
const coldStart = [];
const perLedger = [];
const fallbackArgmaxUnused = null; // the prefix-marginal argmax receipt belongs to A11's everywhere arm; A12 never serves it

for (const { name, rows } of realLedgers) {
  const samples = samplesWithIdx(rows);
  const walkRz = new Rhizome(); // the lane's own watched stream (grows from receipts)
  let lAw = 0, lDef = 0, lEv = 0, lExact = 0, lFallback = 0, lEscAw = 0, lEscDef = 0, lEscEv = 0;
  for (let k = 0; k < samples.length; k++) {
    const s = samples[k], i = s.i;
    // (1) the lane re-serializes arms.field from its own receipted prefix [0..k)
    const liveTable1 = walkRz.senseTable();
    const liveBytesA = canonicalJSON(liveTable1);
    const liveBytesB = canonicalJSON(walkRz.senseTable());
    if (liveBytesA !== liveBytesB) serDetBad++;
    // (2) serve: judged-free, the P-G2d/P-A9c battery convention — three arms + leakage probe
    const handleAw = loadHandleWithTable(JSON.parse(liveBytesA), 'a12');
    const handleEv = loadHandleWithTable(JSON.parse(liveBytesA), 'everywhere');
    const ctxSlice = rows.slice(Math.max(0, i - K), i);
    const outAw = serveJudge(handleAw, { context: ctxSlice }, QUESTIONS);
    const outDef = serveJudge(loadedDefault, { context: ctxSlice }, QUESTIONS);
    const outEv = serveJudge(handleEv, { context: ctxSlice }, QUESTIONS);
    // (3) leakage probe on the TRIAL arm: the judgment must never read the row under judgment
    const rowsMut = rows.slice();
    rowsMut[i] = { ...rowsMut[i], op: altOp(rowsMut[i].op) };
    const outMut = serveJudge(handleAw, { context: rowsMut.slice(Math.max(0, i - K), i) }, QUESTIONS);
    // (4) references (rebuilt from the re-parsed serialized table / independent v1)
    const batTokens = contextTokens(rows, i); // == what the judged-free serve computes
    const refAw = refResponse(handleAw, batTokens, undefined, 'fallback_aware', liveTable1);
    const refDef = refResponse(loadedDefault, batTokens, undefined, 'v1', liveTable1);
    const refEv = refResponse(handleEv, batTokens, undefined, 'everywhere', liveTable1);
    if (JSON.stringify(outAw) !== JSON.stringify(refAw)) batMismatch.a12++;
    if (JSON.stringify(outDef) !== JSON.stringify(refDef)) batMismatch.default++;
    if (JSON.stringify(outEv) !== JSON.stringify(refEv)) batMismatch.everywhere++;
    if (JSON.stringify(outMut) !== JSON.stringify(outAw)) batMismatch.leakage++;
    batCalls++;
    // (5) channel byte-identity: the branch IS the selector between the two shipped expressions
    const exactCtx = handleAw.field.observed.has(s.ctx); // the registered A11 classification
    if (exactCtx) {
      if (JSON.stringify(outAw) !== JSON.stringify(outEv)) channelViolations.exact_vs_everywhere++;
      exactCtxSteps++; lExact++;
    } else {
      if (JSON.stringify(outAw) !== JSON.stringify(outDef)) channelViolations.fallback_vs_default++;
      fallbackSteps++; lFallback++;
    }
    // (6) judged-carrying wire sample: the endpoint shape over the SAME step's table
    if (k < 10) {
      const outAwW = serveJudge(handleAw, { context: ctxSlice }, QUESTIONS, rows[i]);
      const outDefW = serveJudge(loadedDefault, { context: ctxSlice }, QUESTIONS, rows[i]);
      const tokensW = contextTokens(rows.slice(0, i + 1), i + 1); // exactly what serve.judge() computes
      const refAwW = refResponse(handleAw, tokensW, rows[i].op, 'fallback_aware', liveTable1);
      const refDefW = refResponse(loadedDefault, tokensW, rows[i].op, 'v1', liveTable1);
      if (JSON.stringify(outAwW) !== JSON.stringify(refAwW)) wireBadAw++;
      if (JSON.stringify(outDefW) !== JSON.stringify(refDefW)) wireBadDef++;
      wireChecked++;
    }
    // (7) walk bookkeeping
    const e2 = ensemble(judgeHash(loadedDefault.hash, batTokens).probs, judgeQthe(loadedDefault.qthe, batTokens).probs, 0.5);
    const ta = outAw.answers.q1.choice === s.label ? 1 : 0;
    const td = outDef.answers.q1.choice === s.label ? 1 : 0;
    const te = outEv.answers.q1.choice === s.label ? 1 : 0;
    if (outAw.escalate !== (argmax(refAw.answers.q1.probabilities).p < ESCALATE_BELOW)) escLawBad++;
    if (outDef.escalate !== (argmax(refDef.answers.q1.probabilities).p < ESCALATE_BELOW)) escLawBad++;
    if (outEv.escalate !== (argmax(refEv.answers.q1.probabilities).p < ESCALATE_BELOW)) escLawBad++;
    if (outAw.escalate) { escalateAw++; lEscAw++; }
    if (outDef.escalate) { escalateDef++; lEscDef++; }
    if (outEv.escalate) { escalateEv++; lEscEv++; }
    awHit += ta; defHit += td; evHit += te; lAw += ta; lDef += td; lEv += te;
    if (ta !== td) flips.push({ ledger: name, k, i, label: s.label, prevOp: s.prevOp, exactCtx, fallback: !exactCtx, defaultHit: td, fallbackAwareHit: ta });
    if (k === 0) coldStart.push({ ledger: name, fallback_aware_choice: outAw.answers.q1.choice, default_choice: outDef.answers.q1.choice, everywhere_choice: outEv.answers.q1.choice, note: 'empty aggregate = fallback class: A12 serves the v1 law at k=0; everywhere served uniform (argmax LINK)' });
    // (8) incremental walk == prefix re-grow (sampled: every 16th step)
    if (k % 16 === 0) {
      const rz2 = new Rhizome();
      grow(rz2, samples.slice(0, k));
      regrowChecked++;
      if (canonicalJSON(rz2.senseTable()) !== liveBytesA) regrowBad++;
    }
    // (9) the receipt is observed — the walk grows (the only collapse)
    walkRz.deform(s.ctx, { gamma: 0, tag: 'stream' });
    walkRz.observe(s.ctx, s.label, { source: 'receipt' });
  }
  // (10) walk continuity: final table == full-ledger grow
  const rzFull = new Rhizome();
  grow(rzFull, samples);
  if (canonicalJSON(rzFull.senseTable()) !== canonicalJSON(walkRz.senseTable())) finalContBad++;
  perLedger.push({ ledger: name, samples: samples.length, ens2_hits: lDef, fallback_aware_hits: lAw, everywhere_hits: lEv, exact_ctx: lExact, fallback: lFallback, escalate_fallback_aware: lEscAw, escalate_default: lEscDef, escalate_everywhere: lEscEv });
  console.log(`  walk ${name}: n=${samples.length}  ens2 ${lDef}  fallback-aware ${lAw}  everywhere ${lEv}  (exact-ctx ${lExact}, fallback ${lFallback}, esc aw/def/ev ${lEscAw}/${lEscDef}/${lEscEv})`);
}
const awDelta = awHit - defHit;
console.log(`P-A12a walk: fallback-aware ${awHit}/${N_REAL}  ens2(default) ${defHit}/${N_REAL}  everywhere ${evHit}/${N_REAL}  hit-mismatches aw-vs-def ${flips.length} (delta ${awDelta >= 0 ? '+' : ''}${awDelta})`);
console.log(`walk anatomy: exact-ctx ${exactCtxSteps} fallback ${fallbackSteps}; escalate aw/def/ev ${escalateAw}/${escalateDef}/${escalateEv}; mismatches aw/def/ev/leak ${batMismatch.a12}/${batMismatch.default}/${batMismatch.everywhere}/${batMismatch.leakage}; channelViolations ${JSON.stringify(channelViolations)}; serDetBad ${serDetBad} regrow ${regrowBad}/${regrowChecked} continuityBad ${finalContBad} escLawBad ${escLawBad}`);
console.log(`wire sample (first 10 steps/ledger, judged-carrying, same-step table): ${wireChecked} calls — fallback-aware mismatch ${wireBadAw}, default mismatch ${wireBadDef}`);

// ---------- P-A12d twin: Python --fresh H1 tables on the REAL ledgers (16/16) ----------
let twinMidpointBad = 0;
const midTables = {};
for (const { name, rows } of realLedgers) {
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const rz = new Rhizome();
  grow(rz, samples.slice(0, half)); // the JS midpoint walk table
  const midBytes = canonicalJSON(rz.senseTable());
  midTables[name] = JSON.parse(midBytes);
  const outF = 'experiments/outputs/fresh_table_real_' + name.replace('.jsonl', '') + '_py.json';
  const r = spawnSync('python3', ['ref/garden_ref.py', QCELLS, 'experiments/outputs/_seal_core_unused.json', '--fresh', QCELLS + name, outF], { encoding: 'utf8', timeout: 300000 });
  if (r.status !== 0) { console.error('twin fresh failed for ' + name + ':', r.stderr); process.exit(1); }
  const ok = readFileSync(outF, 'utf8') === midBytes;
  if (!ok) twinMidpointBad++;
  perLedger.find((p) => p.ledger === name).twin_midpoint_fresh_bytes_equal = ok;
}
const twinMidpointAll = twinMidpointBad === 0;
console.log('midpoint fresh twins on the real ledgers: ' + (twinMidpointAll ? '16/16 byte-identical' : 'FAIL ' + twinMidpointBad));

// opt-in path equality (P-A12c iv): artifact-hyper A12 flag == loaded-handle A12 flag, sampled (midpoint tables)
const artifactOpt = JSON.parse(JSON.stringify(artifact)); // ship path: artifact-hyper opt-in
artifactOpt.hyper.fresh = { fresh_everywhere_fallback_aware: true };
let pathEqChecked = 0, pathEqBad = 0;
for (const { name, rows } of realLedgers) {
  const samples = samplesWithIdx(rows);
  const hyperWithTable = loadWeave(JSON.parse(canonicalJSON({ ...artifactOpt, arms: { ...artifactOpt.arms, field: midTables[name] } })));
  if (hyperWithTable.freshAware !== true) { console.error('artifact-hyper A12 opt-in failed to load'); process.exit(2); }
  const handleAw = loadHandleWithTable(JSON.parse(canonicalJSON(midTables[name])), 'a12');
  for (const s of [samples[0], samples[samples.length - 1]]) {
    const outHandle = serveJudge(handleAw, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const outHyper = serveJudge(hyperWithTable, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    pathEqChecked++;
    if (JSON.stringify(outHandle) !== JSON.stringify(outHyper)) pathEqBad++;
  }
}
console.log(`opt-in path equality (artifact-hyper == loaded-handle, A12 flag): ${pathEqChecked} checked, ${pathEqBad} bad`);

// ---------- P-A12c(v): eval slice pins (compile-time train aggregate) + A12 contrast ----------
const loadedEverywhere = loadWeave(reloaded);
loadedEverywhere.freshEverywhere = true;
const loadedAwEval = loadWeave(reloaded);
loadedAwEval.freshAware = true;
let evalEns2 = 0, evalEverywhere = 0, evalAw = 0;
let evalAwExact = 0, evalAwExactHit = 0, evalAwFallback = 0, evalAwFallbackHit = 0;
const flipsEval = { ens2right_everywherewrong: 0, ens2wrong_everywhereright: 0 };
for (const l of evalLedgers) {
  for (const s of samplesWithIdx(l.rows)) {
    const batTokens = contextTokens(l.rows, s.i);
    const e2 = ensemble(judgeHash(loadedDefault.hash, batTokens).probs, judgeQthe(loadedDefault.qthe, batTokens).probs, 0.5);
    const t2 = top1(e2, s.label);
    const out = serveJudge(loadedEverywhere, { context: l.rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const outA = serveJudge(loadedAwEval, { context: l.rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const tf = out.answers.q1.choice === s.label ? 1 : 0;
    const ta = outA.answers.q1.choice === s.label ? 1 : 0;
    const exact = loadedAwEval.field.observed.has(batTokens.join('|'));
    if (exact) { evalAwExact++; evalAwExactHit += ta; } else { evalAwFallback++; evalAwFallbackHit += ta; }
    evalEns2 += t2; evalEverywhere += tf; evalAw += ta;
    if (t2 === 1 && tf === 0) flipsEval.ens2right_everywherewrong++;
    if (t2 === 0 && tf === 1) flipsEval.ens2wrong_everywhereright++;
  }
}
const evalEns2Micro = micro(evalEns2 / evalSamples.length);
const evalEveryMicro = micro(evalEverywhere / evalSamples.length);
const pinEvalEvery = evalEveryMicro === eA9.eval_optin_contrast.fresh_micro;
const pinEvalEns2 = evalEns2Micro === eW2.serve.ens2;
const pinEvalFlips = flipsEval.ens2right_everywherewrong === 6 && flipsEval.ens2wrong_everywhereright === 2;
console.log(`P-A12c(v) eval pins: everywhere micro ${evalEveryMicro} (A9 pin 938224: ${pinEvalEvery})  ens2 micro ${evalEns2Micro} (P-W2b pin 953668: ${pinEvalEns2})  flips -${flipsEval.ens2right_everywherewrong}/+${flipsEval.ens2wrong_everywhereright} (pin -6/+2: ${pinEvalFlips})`);
console.log(`eval fallback-aware contrast: ${evalAw}/${evalSamples.length} (exact-ctx ${evalAwExactHit}/${evalAwExact}, fallback ${evalAwFallbackHit}/${evalAwFallback})`);

// ---------- P-A12b: shift-H2 battery (grow-as-used, the A10 protocol) ----------
const shiftTables = {};
let shiftEns2 = 0, shiftEverywhere = 0, shiftAw = 0, shiftN = 0;
const shiftClass = { gains: { exact_ctx: 0, fallback: 0 }, losses: { exact_ctx: 0, fallback: 0 } };
const shiftAwFlips = [];
for (const name of LEDGERS) {
  const rows = loadLedger(SHIFT_DIR, name + '.jsonl');
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const H1 = samples.slice(0, half), H2 = samples.slice(half);
  const rz = new Rhizome();
  grow(rz, H1); // grow-as-used: watch H1, re-serialize arms.field (P-G2d protocol)
  const table = JSON.parse(canonicalJSON(rz.senseTable()));
  shiftTables[name] = table;
  const handleAw = loadHandleWithTable(table, 'a12');
  const handleEv = loadHandleWithTable(table, 'everywhere');
  let h2e2 = 0, h2ev = 0, h2aw = 0;
  for (const s of H2) {
    const batTokens = contextTokens(rows, s.i);
    const e2 = ensemble(judgeHash(loadedDefault.hash, batTokens).probs, judgeQthe(loadedDefault.qthe, batTokens).probs, 0.5);
    const t2 = top1(e2, s.label);
    const outEv = serveJudge(handleEv, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const outAw = serveJudge(handleAw, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const te = outEv.answers.q1.choice === s.label ? 1 : 0;
    const ta = outAw.answers.q1.choice === s.label ? 1 : 0;
    const exact = handleAw.field.observed.has(batTokens.join('|'));
    if (t2 === 0 && te === 1) shiftClass.gains[exact ? 'exact_ctx' : 'fallback']++;
    if (t2 === 1 && te === 0) shiftClass.losses[exact ? 'exact_ctx' : 'fallback']++;
    if (ta !== t2) shiftAwFlips.push({ ledger: name, i: s.i, label: s.label, exactCtx: exact, defaultHit: t2, fallbackAwareHit: ta });
    h2e2 += t2; h2ev += te; h2aw += ta;
  }
  shiftEns2 += h2e2; shiftEverywhere += h2ev; shiftAw += h2aw; shiftN += H2.length;
  console.log(`  shift ${name}: H2=${H2.length} ens2 ${h2e2} everywhere ${h2ev} fallback-aware ${h2aw}`);
}
const pinShiftEv = shiftEverywhere === 298;
const pinShiftEns2 = shiftEns2 === eA10.shift_h2_battery.ens2_hits; // the committed receipt pin (242)
const shiftAwBound = shiftAw >= 298;
console.log(`P-A12b shift: fallback-aware ${shiftAw}/${shiftN} (>= 298 class bound: ${shiftAwBound})  everywhere ${shiftEverywhere}/${shiftN} (pin 298: ${pinShiftEv})  ens2 ${shiftEns2}/${shiftN} (pin ${eA10.shift_h2_battery.ens2_hits}: ${pinShiftEns2})`);
console.log(`shift class decomposition (everywhere-vs-default flips): gains ${JSON.stringify(shiftClass.gains)} losses ${JSON.stringify(shiftClass.losses)}`);

// ---------- P-A12c(iii): precedence — A12 > A10 and A12 > A9 on all 602 battery calls ----------
const artifactAwA10 = JSON.parse(JSON.stringify(artifact));
artifactAwA10.hyper.fresh = { fresh_everywhere_fallback_aware: true, fresh_everywhere: true };
const artifactAwA9 = JSON.parse(JSON.stringify(artifact));
artifactAwA9.hyper.fresh = { fresh_everywhere_fallback_aware: true, serve_with_fresh: true };
let precChecked = 0, precBad = 0;
// eval slice (compile-time table already in the artifact)
for (const l of evalLedgers) {
  const hA10 = loadWeave(JSON.parse(canonicalJSON(artifactAwA10)));
  const hA9 = loadWeave(JSON.parse(canonicalJSON(artifactAwA9)));
  for (const s of samplesWithIdx(l.rows)) {
    const outA = serveJudge(loadedAwEval, { context: l.rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    if (JSON.stringify(serveJudge(hA10, { context: l.rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS)) !== JSON.stringify(outA)) precBad++;
    if (JSON.stringify(serveJudge(hA9, { context: l.rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS)) !== JSON.stringify(outA)) precBad++;
    precChecked += 2;
  }
}
// shift battery (grow-as-used tables swapped into the artifact hyper)
for (const name of LEDGERS) {
  const rows = loadLedger(SHIFT_DIR, name + '.jsonl');
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const H2 = samples.slice(half);
  const hA10 = loadWeave(JSON.parse(canonicalJSON({ ...artifactAwA10, arms: { ...artifactAwA10.arms, field: shiftTables[name] } })));
  const hA9 = loadWeave(JSON.parse(canonicalJSON({ ...artifactAwA9, arms: { ...artifactAwA9.arms, field: shiftTables[name] } })));
  const handleAw = loadHandleWithTable(shiftTables[name], 'a12');
  for (const s of H2) {
    const outA = serveJudge(handleAw, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    if (JSON.stringify(serveJudge(hA10, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS)) !== JSON.stringify(outA)) precBad++;
    if (JSON.stringify(serveJudge(hA9, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS)) !== JSON.stringify(outA)) precBad++;
    precChecked += 2;
  }
}
console.log(`precedence (A12+A10 and A12+A9 artifacts serve the A12 law): ${precChecked} checked, ${precBad} bad`);

// ---------- P-A12d: twin core + battery green + predecessor regressions ----------
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

// predecessor regression: e_a11 re-runs under the A12 seal (it re-runs e_a10,
// which re-checks e_a9 — one spawn binds the whole predecessor chain).
// Registered strip: top-level seal_v + chain row_hashes + nested
// *_regression.seal_stamps (the stamp class the A11 P-A11d audit enumerated).
const originals = {
  a11: readFileSync('receipts/e_a11.jsonl', 'utf8'),
  a10: readFileSync('receipts/e_a10.jsonl', 'utf8'),
  a10Summary: readFileSync('experiments/outputs/e_a10_summary.json', 'utf8'),
  a11Summary: readFileSync('experiments/outputs/e_a11_summary.json', 'utf8'),
};
const a11Run = spawnSync('node', ['experiments/e_a11_real_lane.mjs'], { encoding: 'utf8', timeout: 600000 });
const stripStampsDeep = (rows) => canonicalJSON(rows.map((r) => {
  const del = (o) => {
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      for (const k of Object.keys(o)) {
        if (k === 'seal_stamps') delete o[k];
        else del(o[k]);
      }
    }
    return o;
  };
  const { seal_v, row_hash, ...rest } = r;
  return del(rest);
}));
const rowsOf = (txt) => txt.trim().split('\n').map((l) => JSON.parse(l));
const a11Regression = {
  ran: a11Run.status === 0,
  p_a11_verdict_of_record_stands: /P-A11 overall: FAIL/.test(a11Run.stdout),
  p_a11a_c_pass_reproduce: /P-A11a \(wire byte-exactness on the real-lane walk\): PASS/.test(a11Run.stdout) &&
    /P-A11b \(A9\/A10 pins through the A11 driver\): PASS/.test(a11Run.stdout) &&
    /P-A11c \(walk semantics exact \+ no leakage\): PASS/.test(a11Run.stdout),
  measured_bytes_identical: { a11_receipt: false, a10_receipt: false, a10_summary: false, a11_summary: false },
  seal_stamps: { a11: [], a10: [] },
};
try {
  const o11 = rowsOf(originals.a11), n11 = rowsOf(readFileSync('receipts/e_a11.jsonl', 'utf8'));
  a11Regression.measured_bytes_identical.a11_receipt = stripStampsDeep(o11) === stripStampsDeep(n11) && o11.length === n11.length;
  a11Regression.seal_stamps.a11 = [o11[0].seal_v, n11[0].seal_v];
  const o10 = rowsOf(originals.a10), n10 = rowsOf(readFileSync('receipts/e_a10.jsonl', 'utf8'));
  a11Regression.measured_bytes_identical.a10_receipt = stripStampsDeep(o10) === stripStampsDeep(n10) && o10.length === n10.length;
  a11Regression.seal_stamps.a10 = [o10[0].seal_v, n10[0].seal_v];
  a11Regression.measured_bytes_identical.a10_summary =
    stripStampsDeep([JSON.parse(originals.a10Summary)]).replace(/\n$/, '') ===
    stripStampsDeep([JSON.parse(readFileSync('experiments/outputs/e_a10_summary.json', 'utf8'))]).replace(/\n$/, '');
  a11Regression.measured_bytes_identical.a11_summary =
    originals.a11Summary === readFileSync('experiments/outputs/e_a11_summary.json', 'utf8');
} catch (e) { a11Regression.error = String(e); }
// receipts of record restored byte-for-byte (append-only)
writeFileSync('receipts/e_a11.jsonl', originals.a11);
writeFileSync('receipts/e_a10.jsonl', originals.a10);
writeFileSync('experiments/outputs/e_a10_summary.json', originals.a10Summary);
writeFileSync('experiments/outputs/e_a11_summary.json', originals.a11Summary);
const restoredOk = readFileSync('receipts/e_a11.jsonl', 'utf8') === originals.a11 &&
  readFileSync('receipts/e_a10.jsonl', 'utf8') === originals.a10 &&
  readFileSync('experiments/outputs/e_a10_summary.json', 'utf8') === originals.a10Summary &&
  readFileSync('experiments/outputs/e_a11_summary.json', 'utf8') === originals.a11Summary;
console.log(`e_a11 regression under the A12 law: ran=${a11Regression.ran} P-A11-verdict-of-record-stands=${a11Regression.p_a11_verdict_of_record_stands} (P-A11a/b/c PASS reproduced: ${a11Regression.p_a11a_c_pass_reproduce}); measured bytes identical a11/a10/a10sum/a11sum ${a11Regression.measured_bytes_identical.a11_receipt}/${a11Regression.measured_bytes_identical.a10_receipt}/${a11Regression.measured_bytes_identical.a10_summary}/${a11Regression.measured_bytes_identical.a11_summary} (seal stamps a11 ${a11Regression.seal_stamps.a11?.join('->')} a10 ${a11Regression.seal_stamps.a10?.join('->')}); receipts of record restored=${restoredOk}`);

const smoke = spawnSync('node', ['smoke.mjs'], { encoding: 'utf8' });
const smokeOk = smoke.status === 0 && /9 passed, 0 failed/.test(smoke.stdout);
const selftest = spawnSync('node', ['tests/selftest.mjs'], { encoding: 'utf8' });
const selftestOk = selftest.status === 0;
console.log('smoke: ' + (smokeOk ? '9/9' : 'FAIL') + '; selftest: ' + (selftestOk ? 'green' : 'FAIL'));

// ---------- verdicts (registered gates; honest either way) ----------
const pA12a = flips.length === 0 && defHit === 1378 &&
  batMismatch.a12 === 0 && channelViolations.fallback_vs_default === 0 && channelViolations.exact_vs_everywhere === 0 &&
  wireBadAw === 0;
const pA12b = shiftAwBound && pinShiftEns2;
const pA12c = batMismatch.default === 0 && batMismatch.everywhere === 0 && batMismatch.leakage === 0 &&
  precBad === 0 && pathEqBad === 0 && pinEvalEvery && pinEvalEns2 && pinEvalFlips &&
  escLawBad === 0 && serDetBad === 0 && regrowBad === 0 && finalContBad === 0;
const pA12d = twinIdentical && twinMidpointAll && smokeOk && selftestOk && a11Regression.ran &&
  a11Regression.p_a11_verdict_of_record_stands && a11Regression.p_a11a_c_pass_reproduce &&
  a11Regression.measured_bytes_identical.a11_receipt && a11Regression.measured_bytes_identical.a10_receipt &&
  a11Regression.measured_bytes_identical.a10_summary && a11Regression.measured_bytes_identical.a11_summary &&
  restoredOk;
const verdict = pA12a && pA12b && pA12c && pA12d ? 'PASS' : 'FAIL';
console.log('\nP-A12a (real-lane hit-identity): ' + (pA12a ? 'PASS' : 'FAIL') +
  ` — fallback-aware ${awHit}/${N_REAL} == default ${defHit}/${N_REAL} (pin 1378: ${defHit === 1378}); hit mismatches ${flips.length}; battery mismatch aw/leak ${batMismatch.a12}/${batMismatch.leakage}; channel violations ${JSON.stringify(channelViolations)}; wire sample ${wireChecked} (aw mismatch ${wireBadAw}, default contrast ${wireBadDef})`);
console.log('P-A12b (shift-H2 class preservation): ' + (pA12b ? 'PASS' : 'FAIL') +
  ` — fallback-aware ${shiftAw}/${shiftN} (>= 298 class bound: ${shiftAwBound}); ens2 ${shiftEns2}/${shiftN} (pin ${pinShiftEns2}); everywhere ${shiftEverywhere} (pin ${pinShiftEv}); flip classes ${JSON.stringify(shiftClass)}`);
console.log('P-A12c (byte-safety): ' + (pA12c ? 'PASS' : 'FAIL') +
  ` — default+everywhere battery mismatches ${batMismatch.default}/${batMismatch.everywhere}; leakage ${batMismatch.leakage}; precedence ${precChecked}/${precBad}; path-eq ${pathEqChecked}/${pathEqBad}; eval pins ${evalEveryMicro}/${evalEns2Micro}/${pinEvalFlips}; escLawBad ${escLawBad}; serDetBad ${serDetBad}; regrow ${regrowBad}/${regrowChecked}; continuityBad ${finalContBad}`);
console.log('P-A12d (house bindings): ' + (pA12d ? 'PASS' : 'FAIL') +
  ` — twin=${twinIdentical ? 'IDENTICAL ' + jsCore.length + 'B' : 'DIVERGED'}; midpoint twins ${twinMidpointAll ? '16/16' : 'FAIL'}; smoke=${smokeOk} selftest=${selftestOk}; e_a11=${a11Regression.ran}/${a11Regression.p_a11_verdict_of_record_stands}/measured ${a11Regression.measured_bytes_identical.a11_receipt}/${a11Regression.measured_bytes_identical.a10_receipt}/restored=${restoredOk}`);
console.log('\nP-A12 overall: ' + verdict);

// ---------- receipts ----------
mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-F';
const chain = (row) => { row.row_hash = sha256Hex(canonicalJSON([prev, row])); chainRows.push(row); prev = row.row_hash; };
chain({
  n: 1, claim: 'P-A12', verdict,
  pA12a, pA12b, pA12c, pA12d,
  law: {
    trial: 'fallback-aware everywhere (the A11-priced mechanism): the 16 git-pinned qcells ledgers (1418 rows) walked in arrival order through the SHIPPED serve path with the A12 opt-in; arms.field re-serialized from the lane\'s own receipted prefix [0..k) before every judged-free serve call (the registered A11 walk machinery)',
    opt_in: 'hyper.fresh.fresh_everywhere_fallback_aware = true (the A12 flag, the priced new branch)',
    selection_law: 'exact-ctx (observed.has(token key) — the registered A11 classification, a MEMBERSHIP test not a threshold) -> priorCounted (the EXACT A10 payload); fallback (unseen context) -> ensemble(ph, pq, 0.5) (the EXACT v1 law, NOT the prefix marginal)',
    growth: 'walk rhizome deform+observe per receipt, source receipt (field.mjs: observations are the only collapse); per-ledger chains; cold start = fallback class (the v1 law at k=0; everywhere served uniform — contrast receipted)',
    escalate: 'RECORDED not executed: top.p(served) < ESCALATE_BELOW (0.55 sealed, reused, mode-independent); teacher channel out of scope',
    precedence: 'A7 serve_with_field -> A12 fresh_everywhere_fallback_aware -> A10 fresh_everywhere -> A9 serve_with_fresh -> A8 hardness_gate -> default v1',
    zero_new_constants: true, source_change_scope: 'src/serve.mjs: ONE else-if branch + the one-line flag load (the priced mechanism); nothing else',
  },
  walk: {
    steps: N_REAL, fallback_aware_hits: awHit, default_hits: defHit, everywhere_hits: evHit,
    hit_mismatches_aw_vs_default: flips.length, delta_hits: awDelta, delta_micro: micro(awDelta / N_REAL),
    default_pinned_1378: defHit === 1378,
    exact_ctx_steps: exactCtxSteps, fallback_steps: fallbackSteps,
    escalate_fallback_aware: escalateAw, escalate_default: escalateDef, escalate_everywhere: escalateEv,
    cold_start: coldStart,
  },
  wire: {
    battery_arms: { fallback_aware: { mismatch: batMismatch.a12 }, default: { mismatch: batMismatch.default }, everywhere: { mismatch: batMismatch.everywhere }, leakage_probe: { mismatch: batMismatch.leakage } },
    channel_byte_identity: { fallback_vs_default_violations: channelViolations.fallback_vs_default, exact_vs_everywhere_violations: channelViolations.exact_vs_everywhere },
    judged_carrying_sample: { calls: wireChecked, fallback_aware_mismatch: wireBadAw, default_mismatch_contrast: wireBadDef },
    optin_path_equality: { checked: pathEqChecked, bad: pathEqBad },
    precedence: { checked: precChecked, bad: precBad, order: 'A12 > A10 and A12 > A9 on all 602 battery calls' },
  },
  pins: {
    eval_slice: { rows: evalSamples.length, everywhere_micro: evalEveryMicro, everywhere_pinned_938224: pinEvalEvery, ens2_micro: evalEns2Micro, ens2_pinned_953668: pinEvalEns2, flips: flipsEval, flips_pinned: pinEvalFlips,
      fallback_aware_contrast: { hits: evalAw, exact_ctx: { hit: evalAwExactHit, of: evalAwExact }, fallback: { hit: evalAwFallbackHit, of: evalAwFallback } } },
    shift_h2: { rows: shiftN, fallback_aware_hits: shiftAw, class_bound_ge_298: shiftAwBound, everywhere_hits: shiftEverywhere, everywhere_pinned_298: pinShiftEv, ens2_hits: shiftEns2, ens2_pinned_242: pinShiftEns2,
      everywhere_vs_default_flip_classes: shiftClass },
  },
  semantics: {
    serialization_determinism_bad: serDetBad,
    incremental_vs_regrow: { checked: regrowChecked, bad: regrowBad },
    final_continuity_bad: finalContBad,
    leakage_violations: batMismatch.leakage,
    escalate_law_violations: escLawBad,
  },
  twin: { identical: twinIdentical, js_bytes: jsCore.length, py_bytes: pyCoreStr.length, real_ledger_midpoint_16: twinMidpointAll },
  e_a11_regression: { ...a11Regression, stamp_strip: 'top-level seal_v + chain row_hashes + nested *_regression.seal_stamps (the stamp class the A11 P-A11d audit enumerated, carved before the run)', receipt_of_record_restored: restoredOk },
  smoke_9of9: smokeOk, selftest_green: selftestOk,
  artifact_sha256: artifact.artifact_sha256, artifact_pinned: artifactPinned,
  seal_v: reg.predictions.v,
});
chain({
  n: 2, claim: 'contrast-walk-anatomy (no gates)',
  per_ledger: perLedger,
  flips_fallback_aware_vs_default: flips,
  walk_coverage: { steps: N_REAL, exact_ctx: exactCtxSteps, fallback: fallbackSteps, exact_ctx_fraction: micro(exactCtxSteps / N_REAL) },
  escalate_load: { fallback_aware: escalateAw, fallback_aware_fraction: micro(escalateAw / N_REAL), default: escalateDef, default_fraction: micro(escalateDef / N_REAL), everywhere_of_record: eA11.walk.escalate_everywhere, everywhere_fraction_of_record: micro(eA11.walk.escalate_everywhere / N_REAL), law: 'A12 escalates exactly as the default does on fallback steps and exactly as everywhere does on exact-ctx steps (channel byte-identity)' },
  cold_start_law: 'k=0 steps serve the v1 law (empty aggregate = fallback class); A11 everywhere served uniform there (argmax LINK) — receipted in row 1 walk.cold_start',
  a11_damage_channel_removed: { everywhere_hits_of_record: eA11.walk.everywhere_hits, everywhere_loss_vs_default_of_record: (eA11.walk.default_hits - eA11.walk.everywhere_hits), fallback_aware_loss_vs_default: defHit - awHit },
});
chain({ n: 3, claim: 'shift-class-decomposition (no gates)', detail: { everywhere_vs_default_flip_classes: shiftClass, fallback_aware_vs_default_flips: shiftAwFlips, note: 'closes where the 4 A10 protection losses sit (exact-ctx vs fallback); the P-A12b class bound (>= 298) was derived from the A10 receipt that all 50 gains are exact-ctx' } });
writeFileSync('receipts/e_a12.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_a12_summary.json', JSON.stringify({
  run: 'e_a12_fallback_aware', verdict, pA12a, pA12b, pA12c, pA12d,
  law: { trial: 'fallback-aware everywhere: exact-ctx -> the A10 fresh payload (observed.has membership test), fallback -> the exact v1 law', opt_in: 'hyper.fresh.fresh_everywhere_fallback_aware', precedence: 'A7 > A12 > A10 > A9 > A8 > v1' },
  walkQuestion: { rows: N_REAL, fallback_aware: awHit, ens2_default: defHit, everywhere: evHit, hit_mismatches: flips.length },
  pins: { eval_everywhere_micro: evalEveryMicro, eval_ens2_micro: evalEns2Micro, shift_fallback_aware: shiftAw, shift_everywhere: shiftEverywhere, shift_ens2: shiftEns2, eval_fallback_aware_contrast: evalAw },
  coverage: { exact_ctx: exactCtxSteps, fallback: fallbackSteps, escalate_fallback_aware: escalateAw, escalate_default: escalateDef, escalate_everywhere: escalateEv },
  perLedger,
}, null, 2));
console.log('receipts: receipts/e_a12.jsonl (tip ' + prev.slice(0, 16) + ')');
process.exit(0); // verdict printed; honest either way
