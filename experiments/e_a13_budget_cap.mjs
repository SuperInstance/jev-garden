// experiments/e_a13_budget_cap.mjs — P-A13 (Addendum A13, seal v21): the
// escalation organ under a pre-registered budget cap — the M10+M4 budget-cap
// header experiment (the wave-60 queue item 4 adoption hook; nearest_prior
// M4 with the governance-vs-executed delta). Registered law: opt-in
// hyper.serve.budget.escalate_max_per_walk = 32 — the cap value is the
// shipped v1 default's OWN real-lane escalate load of record (A12 receipt:
// escalate_default = 32/1418 = 2.3%, micro 22567): the A12 fallback-aware
// mode may not AUTHORIZE more teacher spend per production walk than the
// shipped default already justifies. The cap gates the ESCALATION ORGAN's
// spend authority — NEVER the served expression: judge() is untouched, the
// wire's escalate field stays the honest local signal (top.p(served) <
// ESCALATE_BELOW, 0.55 sealed, reused), and the grant/refuse decision rides
// OUTSIDE the response bytes. Grant law: ARRIVAL ORDER (a live lane cannot
// reorder its own future; a value-ordered grant law would be a different
// registration). Teacher channel OUT OF SCOPE (recorded not executed); the
// gain-side leg is priced, not pre-approved. M10 cost rule need-side
// (P-A13c): the 32 granted slots must buy at-least-as-much uncertainty
// coverage as the 96 refused signals they displace.
//
// (a) P-A13a: the cap binds + spend exactness — exactly 32 granted, exactly
//     96 refused (A12 pins: fallback-aware signals 128, default load 32);
//     every refusal carries the honest signal (escalate=true on the wire)
//     with reason budget_exhausted; the granted set is EXACTLY the first 32
//     signals in arrival order (a prefix of the signal stream); final
//     counters {spent: 32, refused: 96}.
// (b) P-A13b: the budget-cap law — capping does not degrade the gate metric,
//     stated threshold ZERO: capped responses byte-identical to uncapped on
//     ALL 1418 steps; capped == the A12 fallback-aware reference expression
//     and default == the v1 reference expression (the serve.mjs edit changed
//     no served byte); hit degradation exactly 0 (capped == uncapped ==
//     1378/1418, the registered pin); escalate SIGNAL cap-independent (0
//     violations); default arm untouched (flag absent, cap loads undefined);
//     escalate law 0 violations; leakage 0; opt-in path equality; judged-
//     carrying wire sample byte-identical C-vs-U.
// (c) P-A13c: the M10 cost rule, need-side — mean top.p of the 32 GRANTED
//     signals <= mean top.p of the 96 REFUSED signals (micro-rounded);
//     honest-FAIL branch registered: anti-concentration prices a value-
//     ordered grant law as a NEW registration (no threshold surgery).
// (d) P-A13d: house bindings — weave-core-v2 twin JS==Python byte-identical;
//     Python --fresh H1 midpoint twins on the REAL ledgers 16/16; smoke 9/9;
//     selftest green; e_a12 predecessor regression (which re-runs e_a11,
//     which re-runs e_a10, which re-checks e_a9 — one spawn binds the whole
//     predecessor chain) with every MEASURED byte reproducing after the
//     STAMP-CLASS strip (top-level seal_v + chain row_hashes + nested
//     *_regression.seal_stamps, carved BEFORE the run); receipts of record
//     restored byte-for-byte.
// Contrast receipts (no gates): the per-signal table (the honest per-row
// receipt), per-ledger grant/refuse table, granted-set ledger distribution,
// mean/median top.p granted vs refused vs all-128, the organ-spend fraction
// (32/1418 = 2.3% == the default's own load — the M4 header law as a
// measured number), the granted/refused class decomposition, and a pointer
// that A12's second priced candidate (the shift-soil composition default
// question) remains OPEN and needs its own registration.
// Fail-closed seal gate (A4: sha+size bind).

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { canonicalJSON, sha256Hex } from '../src/canon.mjs';
import { Rhizome, OPS } from '../src/field.mjs';
import { trainHash, judgeHash, judgeQthe, ensemble, argmax } from '../src/heads.mjs';
import { grow, compileWeaveV2 } from '../src/weaver.mjs';
import { loadWeave, judge as serveJudge, makeEscalationBudget, ESCALATE_BELOW } from '../src/serve.mjs';
import { SenseTablePrior } from '../src/sensetable.mjs';
import { contextTokens, contextStr, K } from '../src/features.mjs';
import { splitLedgers, loadLedger, makeSamples } from '../adapters/qcells.mjs';

// seal gate (v21)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.size !== BigInt(reg.predictions.size)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
if (reg.predictions.v < 21) { console.error('P-A13 requires seal v21+'); process.exit(2); }
console.log('seal verified (v' + reg.predictions.v + '):', sha.slice(0, 16));

const micro = (x) => Math.round(x * 1e6);

// ---------- soil: the REAL lane (the registered A11/A12 soil, unchanged) ----------
const QCELLS = new URL('../../quilt-qcells/receipts/ledgers/', import.meta.url).pathname;
const sp = splitLedgers(QCELLS);
const trainSamples = sp.train.flatMap((f) => makeSamples(loadLedger(QCELLS, f))); // pipeline v2: per-ledger
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
for (const l of realLedgers) {
  const a = samplesWithIdx(l.rows), b = makeSamples(l.rows);
  if (a.length !== b.length || a.some((s, j) => s.ctx !== b[j].ctx || s.label !== b[j].label ||
    JSON.stringify(s.tokens) !== JSON.stringify(b[j].tokens))) {
    console.error('samplesWithIdx diverges from makeSamples on ' + l.name); process.exit(2);
  }
}
const N_REAL = realLedgers.reduce((a, l) => a + makeSamples(l.rows).length, 0);
console.log('soil: real ledgers=16 samples=' + N_REAL + ' (samplesWithIdx == makeSamples on ALL real soils)');
if (N_REAL !== 1418) { console.error('real-lane soil moved: expected 1418 registered samples'); process.exit(2); }

// ---------- compile weave-v2 (mirror e_w2/e_a8..e_a12 exactly; artifact pinned) ----------
const rhizome = new Rhizome();
grow(rhizome, trainSamples);
const evalSamples = sp.eval.flatMap((f) => makeSamples(loadLedger(QCELLS, f)));
const { artifact } = compileWeaveV2({
  rhizome, trainSamples, evalSamples, weaveIndex: 2,
  notes: 'weave-2 (A7): first weave carrying the rhizome sense table',
});
mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/weave_v2_js.json', canonicalJSON(artifact));
const eW2 = JSON.parse(readFileSync('receipts/e_w2.jsonl', 'utf8').split('\n')[0]);
const eA12 = JSON.parse(readFileSync('receipts/e_a12.jsonl', 'utf8').split('\n')[0]);
const artifactPinned = artifact.artifact_sha256 === eW2.artifact_sha256;
console.log('weave-v2 compiled: artifact_sha256=' + artifact.artifact_sha256.slice(0, 16) +
  ' pinned-to-e_w2-receipt=' + artifactPinned);
if (!artifactPinned) { console.error('artifact not pinned to e_w2 receipt — refusing'); process.exit(2); }

// ---------- the registered cap (the M4 header, executed) ----------
const CAP = 32; // hyper.serve.budget.escalate_max_per_walk — the shipped default's own real-lane escalate load of record (A12 receipt)
const A12_SIGNALS = 128, A12_DEFAULT_LOAD = 32; // the A12 receipts of record
const A12_HITS = 1378; // the registered A11/A12 default pin
// fail-closed derivation check: the A13 constants are DERIVED from the A12
// receipt of record — if the pins moved, the derivation is void.
if (eA12.walk.escalate_fallback_aware !== A12_SIGNALS || eA12.walk.escalate_default !== A12_DEFAULT_LOAD ||
  eA12.walk.default_hits !== A12_HITS) {
  console.error('A12 pins of record moved — the A13 cap derivation is void, refusing (fail-closed)');
  process.exit(2);
}
console.log('cap derivation (from the A12 receipt of record): signals=' + eA12.walk.escalate_fallback_aware +
  ' default_load=' + eA12.walk.escalate_default + ' default_hits=' + eA12.walk.default_hits + ' -> cap B=' + CAP);

// ---------- serve setup (modes; flags exactly as committed) ----------
const reloaded = JSON.parse(readFileSync('experiments/outputs/weave_v2_js.json', 'utf8'));
const loadedDefault = loadWeave(reloaded); // v1 law, flags ABSENT
if (loadedDefault.fresh !== false || loadedDefault.freshEverywhere !== false || loadedDefault.freshAware !== false) {
  console.error('default must carry fresh=false freshEverywhere=false freshAware=false (flags absent)'); process.exit(2);
}
if (loadedDefault.escalateBudgetCap !== undefined) {
  console.error('default must load escalateBudgetCap undefined (flag absent)'); process.exit(2);
}
const QUESTIONS = { q1: { type: 'choice', criteria: { opcode: true } }, q2: { type: 'noul' } };
const altOp = (op) => OPS[(OPS.indexOf(op) + 1) % OPS.length]; // leakage-probe mutation

// references: the exact expressions of record, rebuilt from the RE-PARSED
// SERIALIZED table (the serialization round-trip is the registered carrier).
// kind 'fallback_aware': the A12 law; kind 'v1': the default law.
function refResponse(handle, tokens, judgedOp, kind, fieldTable) {
  const ph = judgeHash(handle.hash, tokens).probs;
  const pq = judgeQthe(handle.qthe, tokens).probs;
  let probs;
  if (kind === 'fallback_aware') {
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
  if (mode === 'a12_budget') {
    h.freshAware = true;        // the A12 opt-in (loaded-handle path)
    h.escalateBudgetCap = CAP;  // the A13 opt-in (loaded-handle path)
  } else if (mode === 'a12') {
    h.freshAware = true;        // the uncapped A12 reference arm
    if (h.escalateBudgetCap !== undefined) { console.error('uncapped arm must load cap undefined'); process.exit(2); }
  } else if (mode !== 'default') throw new Error('unknown mode ' + mode);
  return h;
}

// ---------- P-A13 walk: the real-lane production trial (the A11/A12 machinery) ----------
let batCalls = 0, byteMismatch = { c_vs_u: 0, c_vs_ref: 0, u_vs_ref: 0, d_vs_ref: 0, leakage: 0, wire_c_vs_u: 0, wire_c_vs_ref: 0 };
let signalIndependenceBad = 0, escLawBad = 0, serDetBad = 0, regrowChecked = 0, regrowBad = 0, finalContBad = 0;
let cHit = 0, uHit = 0, dHit = 0;
let exactCtxSteps = 0, fallbackSteps = 0;
let wireChecked = 0;
const organ = makeEscalationBudget(CAP); // ONE organ per production walk (the registered scope)
const signalSeq = [];   // every escalate signal of the trial arm, in arrival order (the honest per-row receipt)
const perLedger = [];
const eA12tipCheck = eA12.walk; // the A12 pins of record used below

for (const { name, rows } of realLedgers) {
  const samples = samplesWithIdx(rows);
  const walkRz = new Rhizome(); // the lane's own watched stream (grows from receipts)
  let lC = 0, lU = 0, lD = 0, lExact = 0, lFallback = 0, lSignals = 0, lGranted = 0, lRefused = 0;
  for (let k = 0; k < samples.length; k++) {
    const s = samples[k], i = s.i;
    // (1) the lane re-serializes arms.field from its own receipted prefix [0..k)
    const liveTable1 = walkRz.senseTable();
    const liveBytesA = canonicalJSON(liveTable1);
    const liveBytesB = canonicalJSON(walkRz.senseTable());
    if (liveBytesA !== liveBytesB) serDetBad++;
    // (2) serve: judged-free, the registered protocol — three arms + leakage probe
    const handleC = loadHandleWithTable(JSON.parse(liveBytesA), 'a12_budget');
    const handleU = loadHandleWithTable(JSON.parse(liveBytesA), 'a12');
    const ctxSlice = rows.slice(Math.max(0, i - K), i);
    const outC = serveJudge(handleC, { context: ctxSlice }, QUESTIONS);
    const outU = serveJudge(handleU, { context: ctxSlice }, QUESTIONS);
    const outD = serveJudge(loadedDefault, { context: ctxSlice }, QUESTIONS);
    // (3) the A13 organ: consumes ONLY the honest signal of the production call
    const granted = organ.grant(outC.escalate);
    // (4) leakage probe on the TRIAL arm: the judgment must never read the row under judgment
    const rowsMut = rows.slice();
    rowsMut[i] = { ...rowsMut[i], op: altOp(rowsMut[i].op) };
    const outMut = serveJudge(handleC, { context: rowsMut.slice(Math.max(0, i - K), i) }, QUESTIONS);
    // (5) references (rebuilt from the re-parsed serialized table / independent v1)
    const batTokens = contextTokens(rows, i); // == what the judged-free serve computes
    const refC = refResponse(handleC, batTokens, undefined, 'fallback_aware', liveTable1);
    const refU = refResponse(handleU, batTokens, undefined, 'fallback_aware', liveTable1);
    const refD = refResponse(loadedDefault, batTokens, undefined, 'v1', liveTable1);
    if (JSON.stringify(outC) !== JSON.stringify(outU)) byteMismatch.c_vs_u++;
    if (JSON.stringify(outC) !== JSON.stringify(refC)) byteMismatch.c_vs_ref++;
    if (JSON.stringify(outU) !== JSON.stringify(refU)) byteMismatch.u_vs_ref++;
    if (JSON.stringify(outD) !== JSON.stringify(refD)) byteMismatch.d_vs_ref++;
    if (JSON.stringify(outMut) !== JSON.stringify(outC)) byteMismatch.leakage++;
    if (outC.escalate !== outU.escalate) signalIndependenceBad++;
    batCalls++;
    // (6) signal receipt (arrival order; the organ's decision rides OUTSIDE the bytes)
    const exactCtx = handleU.field.observed.has(s.ctx); // the registered A11 classification
    if (outC.escalate) {
      const row = { ledger: name, k, i, exactCtx, fallback: !exactCtx, top_p_micro: micro(outC.answers.q1.confidence), escalate: true, granted };
      signalSeq.push(row); lSignals++;
      if (granted) lGranted++; else lRefused++;
    }
    // (7) judged-carrying wire sample: the endpoint shape over the SAME step's table
    if (k < 10) {
      const outCW = serveJudge(handleC, { context: ctxSlice }, QUESTIONS, rows[i]);
      const outUW = serveJudge(handleU, { context: ctxSlice }, QUESTIONS, rows[i]);
      const tokensW = contextTokens(rows.slice(0, i + 1), i + 1); // exactly what serve.judge() computes
      const refCW = refResponse(handleC, tokensW, rows[i].op, 'fallback_aware', liveTable1);
      if (JSON.stringify(outCW) !== JSON.stringify(outUW)) byteMismatch.wire_c_vs_u++;
      if (JSON.stringify(outCW) !== JSON.stringify(refCW)) byteMismatch.wire_c_vs_ref++;
      wireChecked++;
    }
    // (8) walk bookkeeping
    const tc = outC.answers.q1.choice === s.label ? 1 : 0;
    const tu = outU.answers.q1.choice === s.label ? 1 : 0;
    const td = outD.answers.q1.choice === s.label ? 1 : 0;
    if (outC.escalate !== (argmax(refC.answers.q1.probabilities).p < ESCALATE_BELOW)) escLawBad++;
    if (outU.escalate !== (argmax(refU.answers.q1.probabilities).p < ESCALATE_BELOW)) escLawBad++;
    if (outD.escalate !== (argmax(refD.answers.q1.probabilities).p < ESCALATE_BELOW)) escLawBad++;
    cHit += tc; uHit += tu; dHit += td; lC += tc; lU += tu; lD += td;
    if (exactCtx) { exactCtxSteps++; lExact++; } else { fallbackSteps++; lFallback++; }
    // (9) incremental walk == prefix re-grow (sampled: every 16th step)
    if (k % 16 === 0) {
      const rz2 = new Rhizome();
      grow(rz2, samples.slice(0, k));
      regrowChecked++;
      if (canonicalJSON(rz2.senseTable()) !== liveBytesA) regrowBad++;
    }
    // (10) the receipt is observed — the walk grows (the only collapse)
    walkRz.deform(s.ctx, { gamma: 0, tag: 'stream' });
    walkRz.observe(s.ctx, s.label, { source: 'receipt' });
  }
  // (11) walk continuity: final table == full-ledger grow
  const rzFull = new Rhizome();
  grow(rzFull, samples);
  if (canonicalJSON(rzFull.senseTable()) !== canonicalJSON(walkRz.senseTable())) finalContBad++;
  perLedger.push({ ledger: name, samples: samples.length, capped_hits: lC, uncapped_hits: lU, default_hits: lD, exact_ctx: lExact, fallback: lFallback, escalate_signals: lSignals, granted: lGranted, refused: lRefused });
  console.log(`  walk ${name}: n=${samples.length}  capped ${lC}  uncapped ${lU}  default ${lD}  (exact-ctx ${lExact}, fallback ${lFallback}, signals ${lSignals} granted ${lGranted} refused ${lRefused})`);
}

// ---------- P-A13a gates: the cap binds; spend exactness ----------
const grantedRows = signalSeq.filter((r) => r.granted);
const refusedRows = signalSeq.filter((r) => !r.granted);
const prefixLaw = grantedRows.length === CAP &&
  grantedRows.every((r, idx) => r === signalSeq[idx]); // the granted set IS the first 32 signals in arrival order
const countersExact = organ.cap === CAP && organ.spent === A12_DEFAULT_LOAD && organ.refused === signalSeq.length - A12_DEFAULT_LOAD;
const refusalsHonest = refusedRows.every((r) => r.escalate === true);
const capBinds = signalSeq.length === A12_SIGNALS && grantedRows.length === A12_DEFAULT_LOAD && refusedRows.length === A12_SIGNALS - A12_DEFAULT_LOAD;
const pA13a = capBinds && refusalsHonest && prefixLaw && countersExact && organ.reason === 'budget_exhausted';
console.log(`P-A13a: signals ${signalSeq.length} (A12 pin ${A12_SIGNALS}: ${signalSeq.length === A12_SIGNALS})  granted ${grantedRows.length} (pin ${A12_DEFAULT_LOAD})  refused ${refusedRows.length} (pin ${A12_SIGNALS - A12_DEFAULT_LOAD})  cap-binds=${capBinds} refusals-honest=${refusalsHonest} prefix-law=${prefixLaw} counters={cap:${organ.cap},spent:${organ.spent},refused:${organ.refused},reason:${organ.reason}} exact=${countersExact}`);

// ---------- P-A13b gates: the budget-cap law (no degradation, threshold ZERO) ----------
const hitsZeroDegradation = cHit === uHit && cHit === A12_HITS;
const pA13b = byteMismatch.c_vs_u === 0 && byteMismatch.c_vs_ref === 0 && byteMismatch.u_vs_ref === 0 &&
  byteMismatch.d_vs_ref === 0 && byteMismatch.leakage === 0 && byteMismatch.wire_c_vs_u === 0 &&
  byteMismatch.wire_c_vs_ref === 0 &&
  hitsZeroDegradation && signalIndependenceBad === 0 && escLawBad === 0 && serDetBad === 0 &&
  regrowBad === 0 && finalContBad === 0;
console.log(`P-A13b: hits capped ${cHit}/${N_REAL} uncapped ${uHit}/${N_REAL} default ${dHit}/${N_REAL} (pin ${A12_HITS}; zero-degradation ${hitsZeroDegradation})  byte mismatches c_vs_u/c_ref/u_ref/d_ref/leak/wire_cu/wire_cref ${byteMismatch.c_vs_u}/${byteMismatch.c_vs_ref}/${byteMismatch.u_vs_ref}/${byteMismatch.d_vs_ref}/${byteMismatch.leakage}/${byteMismatch.wire_c_vs_u}/${byteMismatch.wire_c_vs_ref}  signalIndependenceBad ${signalIndependenceBad}  escLawBad ${escLawBad}  serDetBad ${serDetBad}  regrow ${regrowBad}/${regrowChecked}  continuityBad ${finalContBad}  wire sample ${wireChecked}`);

// ---------- P-A13c: the M10 cost rule (need-side): granted uncertainty >= refused uncertainty ----------
const mean = (rows) => rows.reduce((a, r) => a + r.top_p_micro, 0) / rows.length;
const median = (rows) => { const v = rows.map((r) => r.top_p_micro).sort((a, b) => a - b); const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const meanGranted = mean(grantedRows), meanRefused = mean(refusedRows), meanAll = mean(signalSeq);
const costRuleHolds = micro(meanGranted) <= micro(meanRefused);
const pA13c = costRuleHolds;
console.log(`P-A13c (M10 need-side): mean top.p granted ${micro(meanGranted)} vs refused ${micro(meanRefused)} (all-128 ${micro(meanAll)}); medians ${median(grantedRows)}/${median(refusedRows)}; cost-rule holds=${costRuleHolds}`);

// ---------- P-A13b(viii) opt-in path equality: artifact-hyper A13 flag == loaded-handle A13 flag ----------
const artifactOpt = JSON.parse(JSON.stringify(artifact)); // ship path: artifact-hyper opt-in
artifactOpt.hyper.serve = { budget: { escalate_max_per_walk: CAP } };
artifactOpt.hyper.fresh = { fresh_everywhere_fallback_aware: true };
let pathEqChecked = 0, pathEqBad = 0;
for (const { name, rows } of realLedgers) {
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const rz = new Rhizome();
  grow(rz, samples.slice(0, half)); // midpoint table (same convention as the A12 path-equality sampling)
  const midTable = JSON.parse(canonicalJSON(rz.senseTable()));
  const hyperWithTable = loadWeave(JSON.parse(canonicalJSON({ ...artifactOpt, arms: { ...artifactOpt.arms, field: midTable } })));
  if (hyperWithTable.freshAware !== true || hyperWithTable.escalateBudgetCap !== CAP) {
    console.error('artifact-hyper A13 opt-in failed to load'); process.exit(2);
  }
  const handleCm = loadHandleWithTable(midTable, 'a12_budget');
  for (const s of [samples[0], samples[samples.length - 1]]) {
    const outHandle = serveJudge(handleCm, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    const outHyper = serveJudge(hyperWithTable, { context: rows.slice(Math.max(0, s.i - K), s.i) }, QUESTIONS);
    pathEqChecked++;
    if (JSON.stringify(outHandle) !== JSON.stringify(outHyper)) pathEqBad++;
  }
}
console.log(`opt-in path equality (artifact-hyper == loaded-handle, A12+A13 flags): ${pathEqChecked} checked, ${pathEqBad} bad`);

// ---------- P-A13d twin: Python --fresh H1 tables on the REAL ledgers (16/16) ----------
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

// ---------- P-A13d twin core ----------
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

// ---------- P-A13d predecessor regression: e_a12 re-runs under the A13 seal ----------
// (it re-runs e_a11, which re-runs e_a10, which re-checks e_a9 — one spawn
// binds the whole predecessor chain). Registered strip: top-level seal_v +
// chain row_hashes + nested *_regression.seal_stamps (the stamp class the
// A11 P-A11d audit enumerated, carved BEFORE the run).
const originals = {
  a12: readFileSync('receipts/e_a12.jsonl', 'utf8'),
  a11: readFileSync('receipts/e_a11.jsonl', 'utf8'),
  a10: readFileSync('receipts/e_a10.jsonl', 'utf8'),
  a10Summary: readFileSync('experiments/outputs/e_a10_summary.json', 'utf8'),
  a11Summary: readFileSync('experiments/outputs/e_a11_summary.json', 'utf8'),
  a12Summary: readFileSync('experiments/outputs/e_a12_summary.json', 'utf8'),
};
const a12Run = spawnSync('node', ['experiments/e_a12_fallback_aware.mjs'], { encoding: 'utf8', timeout: 600000 });
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
const a12Regression = {
  ran: a12Run.status === 0,
  p_a12_verdict_of_record_stands: /P-A12 overall: PASS/.test(a12Run.stdout),
  p_a12a_d_pass_reproduce: /P-A12a \(real-lane hit-identity\): PASS/.test(a12Run.stdout) &&
    /P-A12b \(shift-H2 class preservation\): PASS/.test(a12Run.stdout) &&
    /P-A12c \(byte-safety\): PASS/.test(a12Run.stdout) &&
    /P-A12d \(house bindings\): PASS/.test(a12Run.stdout),
  measured_bytes_identical: { a12_receipt: false, a11_receipt_restored: false, a10_receipt_restored: false, a10_summary: false, a11_summary: false, a12_summary: false },
  seal_stamps: { a12: [] },
};
try {
  const o12 = rowsOf(originals.a12), n12 = rowsOf(readFileSync('receipts/e_a12.jsonl', 'utf8'));
  a12Regression.measured_bytes_identical.a12_receipt = stripStampsDeep(o12) === stripStampsDeep(n12) && o12.length === n12.length;
  a12Regression.seal_stamps.a12 = [o12[0].seal_v, n12[0].seal_v];
  // e_a11/e_a10 are captured-and-restored inside e_a12's own registered
  // regression; the byte-for-byte restoration is verified HERE against the
  // originals captured before the spawn.
  a12Regression.measured_bytes_identical.a11_receipt_restored = readFileSync('receipts/e_a11.jsonl', 'utf8') === originals.a11;
  a12Regression.measured_bytes_identical.a10_receipt_restored = readFileSync('receipts/e_a10.jsonl', 'utf8') === originals.a10;
  a12Regression.measured_bytes_identical.a10_summary =
    stripStampsDeep([JSON.parse(originals.a10Summary)]).replace(/\n$/, '') ===
    stripStampsDeep([JSON.parse(readFileSync('experiments/outputs/e_a10_summary.json', 'utf8'))]).replace(/\n$/, '');
  a12Regression.measured_bytes_identical.a11_summary = originals.a11Summary === readFileSync('experiments/outputs/e_a11_summary.json', 'utf8');
  a12Regression.measured_bytes_identical.a12_summary = originals.a12Summary === readFileSync('experiments/outputs/e_a12_summary.json', 'utf8');
} catch (e) { a12Regression.error = String(e); }
// receipts of record restored byte-for-byte (append-only)
writeFileSync('receipts/e_a12.jsonl', originals.a12);
writeFileSync('receipts/e_a11.jsonl', originals.a11);
writeFileSync('receipts/e_a10.jsonl', originals.a10);
writeFileSync('experiments/outputs/e_a10_summary.json', originals.a10Summary);
writeFileSync('experiments/outputs/e_a11_summary.json', originals.a11Summary);
writeFileSync('experiments/outputs/e_a12_summary.json', originals.a12Summary);
const restoredOk = readFileSync('receipts/e_a12.jsonl', 'utf8') === originals.a12 &&
  readFileSync('receipts/e_a11.jsonl', 'utf8') === originals.a11 &&
  readFileSync('receipts/e_a10.jsonl', 'utf8') === originals.a10 &&
  readFileSync('experiments/outputs/e_a10_summary.json', 'utf8') === originals.a10Summary &&
  readFileSync('experiments/outputs/e_a11_summary.json', 'utf8') === originals.a11Summary &&
  readFileSync('experiments/outputs/e_a12_summary.json', 'utf8') === originals.a12Summary;
console.log(`e_a12 regression under the A13 law: ran=${a12Regression.ran} P-A12-verdict-of-record-stands=${a12Regression.p_a12_verdict_of_record_stands} (P-A12a-d PASS reproduced: ${a12Regression.p_a12a_d_pass_reproduce}); measured bytes identical a12/a11restored/a10restored/a10sum/a11sum/a12sum ${a12Regression.measured_bytes_identical.a12_receipt}/${a12Regression.measured_bytes_identical.a11_receipt_restored}/${a12Regression.measured_bytes_identical.a10_receipt_restored}/${a12Regression.measured_bytes_identical.a10_summary}/${a12Regression.measured_bytes_identical.a11_summary}/${a12Regression.measured_bytes_identical.a12_summary} (seal stamps a12 ${a12Regression.seal_stamps.a12?.join('->')}); receipts of record restored=${restoredOk}`);

const smoke = spawnSync('node', ['smoke.mjs'], { encoding: 'utf8' });
const smokeOk = smoke.status === 0 && /9 passed, 0 failed/.test(smoke.stdout);
const selftest = spawnSync('node', ['tests/selftest.mjs'], { encoding: 'utf8' });
const selftestOk = selftest.status === 0;
console.log('smoke: ' + (smokeOk ? '9/9' : 'FAIL') + '; selftest: ' + (selftestOk ? 'green' : 'FAIL'));

// ---------- verdicts (registered gates; honest either way) ----------
const pA13b_full = pA13b && pathEqBad === 0;
const pA13d = twinIdentical && twinMidpointAll && smokeOk && selftestOk && a12Regression.ran &&
  a12Regression.p_a12_verdict_of_record_stands && a12Regression.p_a12a_d_pass_reproduce &&
  a12Regression.measured_bytes_identical.a12_receipt && a12Regression.measured_bytes_identical.a11_receipt_restored &&
  a12Regression.measured_bytes_identical.a10_receipt_restored && a12Regression.measured_bytes_identical.a10_summary &&
  a12Regression.measured_bytes_identical.a11_summary && a12Regression.measured_bytes_identical.a12_summary &&
  restoredOk;
const verdict = pA13a && pA13b_full && pA13c && pA13d ? 'PASS' : 'FAIL';
console.log('\nP-A13a (the cap binds; spend exactness): ' + (pA13a ? 'PASS' : 'FAIL') +
  ` — signals ${signalSeq.length} (pin 128), granted ${grantedRows.length} (pin 32), refused ${refusedRows.length} (pin 96); refusals honest ${refusalsHonest}; prefix law ${prefixLaw}; counters {cap:${organ.cap}, spent:${organ.spent}, refused:${organ.refused}, reason:${organ.reason}}`);
console.log('P-A13b (the budget-cap law: zero degradation): ' + (pA13b_full ? 'PASS' : 'FAIL') +
  ` — hits capped/uncapped/default ${cHit}/${uHit}/${dHit} of ${N_REAL} (pin ${A12_HITS}); byte mismatches c_vs_u ${byteMismatch.c_vs_u}, c_vs_ref ${byteMismatch.c_vs_ref}, u_vs_ref ${byteMismatch.u_vs_ref}, d_vs_ref ${byteMismatch.d_vs_ref}, leak ${byteMismatch.leakage}, wire_cu ${byteMismatch.wire_c_vs_u}, wire_cref ${byteMismatch.wire_c_vs_ref}; signal independence ${signalIndependenceBad}; escLaw ${escLawBad}; serDet ${serDetBad}; regrow ${regrowBad}/${regrowChecked}; continuity ${finalContBad}; path-eq ${pathEqChecked}/${pathEqBad}; wire sample ${wireChecked}`);
console.log('P-A13c (M10 cost rule, need-side): ' + (pA13c ? 'PASS' : 'FAIL') +
  ` — mean top.p granted ${micro(meanGranted)} <= refused ${micro(meanRefused)}: ${costRuleHolds}; medians ${median(grantedRows)} vs ${median(refusedRows)}; all-128 mean ${micro(meanAll)}`);
console.log('P-A13d (house bindings): ' + (pA13d ? 'PASS' : 'FAIL') +
  ` — twin=${twinIdentical ? 'IDENTICAL ' + jsCore.length + 'B' : 'DIVERGED'}; midpoint twins ${twinMidpointAll ? '16/16' : 'FAIL'}; smoke=${smokeOk} selftest=${selftestOk}; e_a12=${a12Regression.ran}/${a12Regression.p_a12_verdict_of_record_stands}/measured ${a12Regression.measured_bytes_identical.a12_receipt}/restored=${restoredOk}`);
console.log('\nP-A13 overall: ' + verdict);

// ---------- receipts ----------
mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-F';
const chain = (row) => { row.row_hash = sha256Hex(canonicalJSON([prev, row])); chainRows.push(row); prev = row.row_hash; };
chain({
  n: 1, claim: 'P-A13', verdict,
  pA13a, pA13b: pA13b_full, pA13c, pA13d,
  law: {
    trial: 'the escalation organ under a pre-registered budget cap (the M10+M4 budget-cap header, the wave-60 queue item 4 adoption hook): the 16 git-pinned qcells ledgers (1418 rows) walked in arrival order through the SHIPPED serve path with the A12 opt-in + the A13 organ; arms.field re-serialized from the lane\'s own receipted prefix [0..k) before every judged-free serve call (the registered A11 walk machinery)',
    mine_citations: { M10: 'Regularized RSI (github.com/google-research/rrsi, arXiv:2609.24972): constrain HOW the search moves, not WHAT the harness may contain; cost rule = added inference cost must be paid for by measured gain', M4: 'budget/cost caps as selection pressure (weco AIDE-squared): per-lane budget caps become pre-registered constraints in every registration header' },
    nearest_prior: 'M4 (governance-level: registration hygiene across lanes); delta: A13 is the EXECUTED mechanism on the live garden serve path — organ-level spend authority with refusal semantics, byte-safety bindings, and a measured verdict; second prior M10 (the same cost rule at paper strength), delta: garden-strength instance (ONE organ, ONE production walk, deterministic need-side measurement)',
    opt_in: 'hyper.serve.budget.escalate_max_per_walk = 32 (the A13 flag, the priced new constant WITH its registered pricing note)',
    cap_derivation: '32 = the shipped v1 default\'s own real-lane escalate load of record (the A12 receipt, walk.escalate_default = 32/1418 = 2.3%, micro 22567): the A12 mode may not AUTHORIZE more teacher spend per production walk than the shipped default already justifies',
    organ_law: 'the organ consumes ONLY the honest escalate signal of the production call; grant = arrival order (the first 32 signals); a refusal is COUNTED with reason budget_exhausted and never swallowed; the decision rides OUTSIDE the response bytes — judge() untouched, served expression unchanged by construction',
    teacher: 'OUT OF SCOPE (recorded not executed, the A11/A12 convention); the gain-side leg (executing granted calls, measuring hit gain) requires the live channel and its own registration — priced, not pre-approved',
    own_spend: '$0.00 external API, 0 teacher calls, 0 tokens — deterministic local execution (the M4 header spend cap of this registration, stated against the verdict)',
    source_change_scope: 'src/serve.mjs: ONE one-line flag load (escalateBudgetCap) + ONE new export (makeEscalationBudget); judge() untouched; nothing else',
  },
  walk: {
    steps: N_REAL, capped_hits: cHit, uncapped_hits: uHit, default_hits: dHit, pin: A12_HITS,
    hit_degradation: cHit - uHit, zero_degradation: hitsZeroDegradation,
    exact_ctx_steps: exactCtxSteps, fallback_steps: fallbackSteps,
    escalate_signals: signalSeq.length, escalate_signals_pin: A12_SIGNALS,
    wire_sample_calls: wireChecked,
  },
  organ: {
    cap: organ.cap, spent: organ.spent, refused: organ.refused, final_reason: organ.reason,
    spend_fraction_micro: micro(organ.spent / N_REAL),
    default_load_of_record_micro: micro(A12_DEFAULT_LOAD / N_REAL),
    law: 'the capped arm\'s teacher spend authority == the shipped default\'s own real-lane load (32/1418 = 2.3%) — the M4 header law stated as a measured number',
  },
  byte_safety: {
    battery_arms: { capped_vs_uncapped: { mismatch: byteMismatch.c_vs_u }, capped_vs_reference: { mismatch: byteMismatch.c_vs_ref }, uncapped_vs_reference: { mismatch: byteMismatch.u_vs_ref }, default_vs_reference: { mismatch: byteMismatch.d_vs_ref }, leakage_probe: { mismatch: byteMismatch.leakage } },
    judged_carrying_wire_sample: { calls: wireChecked, capped_vs_uncapped_mismatch: byteMismatch.wire_c_vs_u, capped_vs_reference_mismatch: byteMismatch.wire_c_vs_ref },
    optin_path_equality: { checked: pathEqChecked, bad: pathEqBad },
    escalate_signal_independence_violations: signalIndependenceBad,
  },
  cost_rule: {
    claim: 'M10 need-side: granted spend buys at-least-as-much uncertainty coverage as the refused set it displaces',
    mean_top_p_micro: { granted: micro(meanGranted), refused: micro(meanRefused), all_signals: micro(meanAll) },
    median_top_p: { granted: median(grantedRows), refused: median(refusedRows) },
    holds: costRuleHolds,
    honest_fail_branch: 'anti-concentration prices a value-ordered grant law as a NEW registration (no threshold surgery)',
  },
  semantics: {
    serialization_determinism_bad: serDetBad,
    incremental_vs_regrow: { checked: regrowChecked, bad: regrowBad },
    final_continuity_bad: finalContBad,
    leakage_violations: byteMismatch.leakage,
    escalate_law_violations: escLawBad,
  },
  twin: { identical: twinIdentical, js_bytes: jsCore.length, py_bytes: pyCoreStr.length, real_ledger_midpoint_16: twinMidpointAll },
  e_a12_regression: { ...a12Regression, stamp_strip: 'top-level seal_v + chain row_hashes + nested *_regression.seal_stamps (the stamp class the A11 P-A11d audit enumerated, carved before the run)', receipt_of_record_restored: restoredOk },
  smoke_9of9: smokeOk, selftest_green: selftestOk,
  artifact_sha256: artifact.artifact_sha256, artifact_pinned: artifactPinned,
  seal_v: reg.predictions.v,
});
chain({
  n: 2, claim: 'contrast-per-signal-receipt (no gates)',
  signal_count: signalSeq.length,
  per_signal: signalSeq,
  per_ledger: perLedger,
  class_decomposition: {
    granted: { exact_ctx: grantedRows.filter((r) => r.exactCtx).length, fallback: grantedRows.filter((r) => !r.exactCtx).length },
    refused: { exact_ctx: refusedRows.filter((r) => r.exactCtx).length, fallback: refusedRows.filter((r) => !r.exactCtx).length },
  },
  granted_ledger_distribution: grantedRows.reduce((a, r) => { a[r.ledger] = (a[r.ledger] ?? 0) + 1; return a; }, {}),
  signal_ledger_distribution: signalSeq.reduce((a, r) => { a[r.ledger] = (a[r.ledger] ?? 0) + 1; return a; }, {}),
  open_question_pointer: 'A12\'s second priced candidate (the shift-soil composition default question: should a hardness-registered shift-soil lane default its opt-in to fallback-aware rather than plain everywhere) remains OPEN and needs its own registration — not measured here',
});
chain({
  n: 3, claim: 'contrast-walk-anatomy (no gates)',
  per_ledger_anatomy: perLedger,
  walk_coverage: { steps: N_REAL, exact_ctx: exactCtxSteps, fallback: fallbackSteps, exact_ctx_fraction: micro(exactCtxSteps / N_REAL) },
  signal_top_p_anatomy: { granted: grantedRows.map((r) => r.top_p_micro), refused_first_16: refusedRows.slice(0, 16).map((r) => r.top_p_micro), note: 'full refused list is row 2 per_signal; this row samples the refused tail for eyeball contrast' },
});
writeFileSync('receipts/e_a13.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_a13_summary.json', JSON.stringify({
  run: 'e_a13_budget_cap', verdict, pA13a, pA13b: pA13b_full, pA13c, pA13d,
  law: { trial: 'the escalation organ under a pre-registered budget cap: cap 32 = the shipped default\'s own real-lane escalate load of record; organ gates spend AUTHORITY never the served expression; grant law arrival order; teacher channel out of scope', mine_citations: 'M10 + M4 (header); nearest_prior M4 + delta (M1 novelty gate)', opt_in: 'hyper.serve.budget.escalate_max_per_walk' },
  walkQuestion: { rows: N_REAL, capped_hits: cHit, uncapped_hits: uHit, default_hits: dHit, hit_degradation: cHit - uHit },
  organ: { cap: organ.cap, spent: organ.spent, refused: organ.refused, signals: signalSeq.length },
  costRule: { mean_top_p_micro: { granted: micro(meanGranted), refused: micro(meanRefused) }, holds: costRuleHolds },
  byteSafety: { c_vs_u: byteMismatch.c_vs_u, c_vs_ref: byteMismatch.c_vs_ref, d_vs_ref: byteMismatch.d_vs_ref, leakage: byteMismatch.leakage, wire: byteMismatch.wire_c_vs_u, path_eq: pathEqBad },
  perLedger,
}, null, 2));
console.log('receipts: receipts/e_a13.jsonl (tip ' + prev.slice(0, 16) + ')');
process.exit(0); // verdict printed; honest either way
