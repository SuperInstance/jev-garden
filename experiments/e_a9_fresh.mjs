// experiments/e_a9_fresh.mjs — P-A9 (Addendum A9, seal v12): the fresh-memory
// serve law (grow-as-used). Registered law: opt-in hyper.fresh.serve_with_fresh;
// gate s = top.p(ens2), H* = ESCALATE_BELOW (both reused — zero new constants);
// gate-closed serves the exact v1 expression (byte-identical); gate-open serves
// priorCounted rebuilt from the SERIALIZED supervision aggregate (the exact
// field.mjs priorCounted law over arms.field.observed) — the P-G2d law of
// record (lambda* = 0: all fresh memory on the open branch).
//
// (a) P-A9a: opt-in wire mechanics — closed responses byte-identical to the
//     v1-law reference, open responses exactly the fresh law; artifact-hyper
//     opt-in path == loaded-handle opt-in path.
// (b) P-A9b: default law safe — flag ABSENT, every response on both soils
//     byte-identical to the pre-A9 v1-law reference.
// (c) P-A9c: fresh value on shift-H2 (battery protocol, grow-as-used: watch
//     H1 per ledger, re-serialize arms.field, serve H2): pooled fresh top-1
//     >= pooled ens2 top-1 + 0.01 (integer-exact: 100*(fresh-ens2) >= 343).
// (d) P-A9d: twin + battery green — core-v2 byte-identity re-verified; the A9
//     rebuild consumes the SERIALIZED aggregate (twin's table + live tables);
//     NEW twin mode: Python grows each ledger's H1 and serializes the fresh
//     table byte-identically; smoke 9/9; selftest green.
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

// seal gate (v12)
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const sha = sha256Hex(readFileSync('docs/PREDICTIONS.md'));
const stB = statSync('docs/PREDICTIONS.md', { bigint: true });
if (sha !== reg.predictions.sha256 || stB.size !== BigInt(reg.predictions.size)) {
  console.error('SEAL MISMATCH — refusing to run (fail-closed)');
  process.exit(2);
}
if (reg.predictions.v < 12) { console.error('P-A9 requires seal v12+'); process.exit(2); }
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

// samples WITH row index (identical to makeSamples by construction — guard)
function samplesWithIdx(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    if (!OPS.includes(rows[i].op)) continue;
    out.push({ tokens: contextTokens(rows, i), ctx: contextStr(rows, i), label: rows[i].op, i });
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

// ---------- compile weave-v2 (mirror e_w2/e_a8 exactly; artifact pinned to receipt) ----------
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
const artifactPinned = artifact.artifact_sha256 === eW2.artifact_sha256;
console.log('weave-v2 compiled: artifact_sha256=' + artifact.artifact_sha256.slice(0, 16) +
  ' pinned-to-e_w2-receipt=' + artifactPinned +
  ' observed_ctx=' + artifact.arms.field.observed.length);
if (!artifactPinned) { console.error('artifact not pinned to e_w2 receipt — refusing'); process.exit(2); }

// ---------- P-W2a re-verification (twin, under seal v12) ----------
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
console.log('P-W2a re-check (seal v12): ' + (twinIdentical ? 'IDENTICAL' : 'DIVERGED @' + firstDiff) +
  ` — js=${jsCore.length}B py=${pyCoreStr.length}B`);

// ---------- P-A9d (iii): NEW twin fresh mode — Python grows each H1, serializes ----------
const freshTwin = [];
for (const name of LEDGERS) {
  const f = new URL('./outputs/shift_family/' + name + '.jsonl', import.meta.url).pathname;
  if (!existsSync(f)) { console.error('missing shift soil: ' + name); process.exit(2); }
  const outF = 'experiments/outputs/fresh_table_' + name + '_py.json';
  const r = spawnSync('python3', ['ref/garden_ref.py', QCELLS, 'experiments/outputs/_seal_core_unused.json', '--fresh', f, outF], { encoding: 'utf8' });
  if (r.status !== 0) { console.error('twin fresh failed for ' + name + ':', r.stderr); process.exit(1); }
  freshTwin.push({ ledger: name, py_bytes: readFileSync(outF, 'utf8').length });
}

// ---------- serve setup ----------
const reloaded = JSON.parse(readFileSync('experiments/outputs/weave_v2_js.json', 'utf8'));
const loaded = loadWeave(reloaded);
if (loaded.fresh !== false) { console.error('default must carry fresh=false (flag absent)'); process.exit(2); }
const loadedOpt = loadWeave(reloaded); // measurement mode: the registered rule under test (handle opt-in)
loadedOpt.fresh = true;
// artifact-hyper opt-in path (the ship path)
const artifactOpt = JSON.parse(JSON.stringify(artifact));
artifactOpt.hyper.fresh = { serve_with_fresh: true };
const loadedHyper = loadWeave(artifactOpt);
if (loadedHyper.fresh !== true) { console.error('artifact-hyper opt-in failed to load'); process.exit(2); }
const QUESTIONS = { q1: { type: 'choice', criteria: { opcode: true } }, q2: { type: 'noul' } };

// references: pre-A9 v1 law / registered fresh law — the exact expressions of record
function refResponse(tokens, judgedOp, kind) {
  const ph = judgeHash(loaded.hash, tokens).probs;
  const pq = judgeQthe(loaded.qthe, tokens).probs;
  let probs;
  if (kind === 'fresh') {
    const e2 = ensemble(ph, pq, 0.5);
    probs = argmax(e2).p >= ESCALATE_BELOW
      ? e2
      : loaded.field.priorCounted(tokens.join('|'));
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

const priorCtxs = new Set();
// wireDrive: drives serve.judge() per target row; mode 'default' -> v1 ref always; 'optin' -> fresh/v1 ref by gate
function wireDrive(rows, targets, mode) {
  const st = { calls: 0, closed: 0, open: 0, mismatch: 0, minTopP: 1 };
  for (const i of targets) {
    const tokens = contextTokens(rows.slice(0, i + 1), i + 1); // exactly what serve.judge() computes
    const ph = judgeHash(loaded.hash, tokens).probs;
    const pq = judgeQthe(loaded.qthe, tokens).probs;
    const e2 = ensemble(ph, pq, 0.5);
    const topP = argmax(e2).p;
    const open = topP < ESCALATE_BELOW;
    const use = mode === 'default' ? loaded : loadedOpt;
    const out = serveJudge(use, { context: rows.slice(Math.max(0, i - K), i) }, QUESTIONS, rows[i]);
    const ref = refResponse(tokens, rows[i].op, mode === 'default' ? 'v1' : (open ? 'fresh' : 'v1'));
    if (JSON.stringify(out) !== JSON.stringify(ref)) st.mismatch++;
    st.calls++;
    if (open) st.open++; else st.closed++;
    if (topP < st.minTopP) st.minTopP = topP;
    priorCtxs.add(tokens.join('|'));
  }
  return st;
}

const evalTargets = evalLedgers.map((l) => ({ rows: l.rows, targets: samplesWithIdx(l.rows).map((s) => s.i) }));
const shiftTargets = LEDGERS.map((name) => {
  const rows = loadLedger(SHIFT_DIR, name + '.jsonl');
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  return { name, rows, targets: samples.slice(half).map((s) => s.i) };
});

// ---------- P-A9b: default law safe (both soils, flag absent) ----------
let defEval = { calls: 0, closed: 0, open: 0, mismatch: 0, minTopP: 1 };
for (const { rows, targets } of evalTargets) {
  const st = wireDrive(rows, targets, 'default');
  for (const k of ['calls', 'closed', 'open', 'mismatch']) defEval[k] += st[k];
  if (st.minTopP < defEval.minTopP) defEval.minTopP = st.minTopP;
}
let defShift = { calls: 0, closed: 0, open: 0, mismatch: 0, minTopP: 1 };
for (const { rows, targets } of shiftTargets) {
  const st = wireDrive(rows, targets, 'default');
  for (const k of ['calls', 'closed', 'open', 'mismatch']) defShift[k] += st[k];
  if (st.minTopP < defShift.minTopP) defShift.minTopP = st.minTopP;
}

// ---------- P-A9a: opt-in wire mechanics (both soils, flag on) ----------
let optEval = { calls: 0, closed: 0, open: 0, mismatch: 0, minTopP: 1 };
for (const { rows, targets } of evalTargets) {
  const st = wireDrive(rows, targets, 'optin');
  for (const k of ['calls', 'closed', 'open', 'mismatch']) optEval[k] += st[k];
  if (st.minTopP < optEval.minTopP) optEval.minTopP = st.minTopP;
}
let optShift = { calls: 0, closed: 0, open: 0, mismatch: 0, minTopP: 1 };
for (const { rows, targets } of shiftTargets) {
  const st = wireDrive(rows, targets, 'optin');
  for (const k of ['calls', 'closed', 'open', 'mismatch']) optShift[k] += st[k];
  if (st.minTopP < optShift.minTopP) optShift.minTopP = st.minTopP;
}

// opt-in path equality: artifact-hyper vs loaded-handle, sample of both soils
let pathEqChecked = 0, pathEqBad = 0;
for (const { rows, targets } of [evalTargets[0], shiftTargets[0]]) {
  for (const i of targets.slice(0, 20)) {
    const outHandle = serveJudge(loadedOpt, { context: rows.slice(Math.max(0, i - K), i) }, QUESTIONS, rows[i]);
    const outHyper = serveJudge(loadedHyper, { context: rows.slice(Math.max(0, i - K), i) }, QUESTIONS, rows[i]);
    pathEqChecked++;
    if (JSON.stringify(outHandle) !== JSON.stringify(outHyper)) pathEqBad++;
  }
}

// ---------- P-A9c: fresh value on shift-H2 (battery protocol, grow-as-used) ----------
let ens2Hit = 0, freshHit = 0, n2 = 0, openRows = 0, everywhereHit = 0;
const flips = { right2wrong: 0, wrong2right: 0 };
const coverage = { open_rows: 0, exact_hit: 0, fallback: 0 };
const perLedger = [];
for (const { name, rows } of shiftTargets.map((t, idx) => ({ name: t.name, rows: t.rows }))) {
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
  let gMax = 0;
  for (const c of rz.cells.values()) if (c.G > gMax) gMax = c.G;
  const liveField = new SenseTablePrior(liveTable1);
  // updated artifact sha (the grow-as-used update event)
  const updated = JSON.parse(JSON.stringify(artifact));
  updated.arms.field = liveTable1;
  updated.artifact_sha256 = sha256Hex(canonicalJSON(updated));

  let h2e2 = 0, h2f = 0, h2open = 0, h2ev = 0, exact = 0, fb = 0;
  for (const s of H2) {
    const ph = judgeHash(loaded.hash, s.tokens).probs;
    const pq = judgeQthe(loaded.qthe, s.tokens).probs;
    const e2 = ensemble(ph, pq, 0.5);
    const open = argmax(e2).p < ESCALATE_BELOW;
    const pf = liveField.priorCounted(s.ctx);
    priorCtxs.add(s.ctx);
    if (top1(pf, s.label)) h2ev++;
    let served = e2;
    if (open) {
      served = pf;
      h2open++;
      coverage.open_rows++;
      if (liveField.observed.has(s.ctx)) { exact++; coverage.exact_hit++; } else { fb++; coverage.fallback++; }
    }
    const t2 = top1(e2, s.label), tf = top1(served, s.label);
    h2e2 += t2; h2f += tf;
    if (open && t2 === 1 && tf === 0) flips.right2wrong++;
    if (open && t2 === 0 && tf === 1) flips.wrong2right++;
  }
  ens2Hit += h2e2; freshHit += h2f; everywhereHit += h2ev; n2 += H2.length; openRows += h2open;
  perLedger.push({
    ledger: name, h1: H1.length, h2: H2.length, gate_open: h2open,
    ens2_hits: h2e2, fresh_hits: h2f, everywhere_hits: h2ev,
    open_exact_ctx: exact, open_fallback: fb, ser_deterministic: serDet,
    g_max_after_watch: gMax, artifact_sha_after_watch: updated.artifact_sha256,
    twin_fresh_bytes_equal: readFileSync('experiments/outputs/fresh_table_' + name + '_py.json', 'utf8') === liveBytes1,
  });
  console.log(`  ${name}: H1=${H1.length} H2=${H2.length} gate_open=${h2open}  ens2 ${h2e2}/${H2.length}  fresh ${h2f}/${H2.length}  everywhere ${h2ev}/${H2.length}  (open exact-ctx ${exact}/${h2open}, Gmax=${gMax}, twin_fresh=${perLedger.at(-1).twin_fresh_bytes_equal})`);
}
const delta = (freshHit - ens2Hit) / (n2 || 1);
const pA9c = 100 * (freshHit - ens2Hit) >= n2;
const pinnedA8 = ens2Hit === eA8.shift_h2_battery.ens2_hits && openRows === eA8.shift_h2_battery.gate_open;
console.log(`P-A9c battery: ens2 ${ens2Hit}/${n2} (A8 receipt ${eA8.shift_h2_battery.ens2_hits}) open=${openRows} (A8 ${eA8.shift_h2_battery.gate_open}) pinned=${pinnedA8}` +
  `; fresh ${freshHit}/${n2} (delta ${delta >= 0 ? '+' : ''}${delta.toFixed(4)}); everywhere ${everywhereHit}/${n2} (P-G2d pin 298: ${everywhereHit === 298})`);

// ---------- saturated opt-in contrast (eval slice, compile-time train aggregate) ----------
let evalEns2 = 0, evalFresh = 0, evalOpen = 0, evalFlipR2W = 0, evalFlipW2R = 0;
for (const s of evalSamples) {
  const ph = judgeHash(loaded.hash, s.tokens).probs;
  const pq = judgeQthe(loaded.qthe, s.tokens).probs;
  const e2 = ensemble(ph, pq, 0.5);
  const open = argmax(e2).p < ESCALATE_BELOW;
  let served = e2;
  if (open) {
    evalOpen++;
    served = loaded.field.priorCounted(s.ctx); // compile-time train aggregate
    priorCtxs.add(s.ctx);
  }
  const t2 = top1(e2, s.label), tf = top1(served, s.label);
  evalEns2 += t2; evalFresh += tf;
  if (open && t2 === 1 && tf === 0) evalFlipR2W++;
  if (open && t2 === 0 && tf === 1) evalFlipW2R++;
}
const evalPinned = micro(evalEns2 / evalSamples.length) === eW2.serve.ens2 && evalOpen === eA8.wire.eval.open;
console.log(`saturated opt-in contrast: opens=${evalOpen} (A8 pin 11: ${evalOpen === eA8.wire.eval.open})` +
  ` ens2 ${(evalEns2 / evalSamples.length).toFixed(4)} (P-W2b pin ${evalPinned}) fresh ${(evalFresh / evalSamples.length).toFixed(4)}` +
  ` flips +${evalFlipW2R}/-${evalFlipR2W}`);

// ---------- P-A9d (ii): the A9 rebuild consumes the SERIALIZED aggregate ----------
const pyCore = JSON.parse(pyCoreStr);
const tableIdentical = canonicalJSON(pyCore.arms.field) === canonicalJSON(reloaded.arms.field);
const twinPrior = new SenseTablePrior(pyCore.arms.field);
let trainRebuildOk = tableIdentical, trainRebuildChecked = 0, trainRebuildBad = null;
for (const ctx of priorCtxs) {
  trainRebuildChecked++;
  const a = rhizome.priorCounted(ctx), b = twinPrior.priorCounted(ctx);
  if (JSON.stringify(a) !== JSON.stringify(b)) { trainRebuildOk = false; trainRebuildBad = ctx; break; }
}
let liveRebuildOk = true, liveRebuildChecked = 0, liveRebuildBad = null;
for (const { name, rows } of shiftTargets) {
  const samples = samplesWithIdx(rows);
  const half = Math.floor(samples.length / 2);
  const rz = new Rhizome();
  grow(rz, samples.slice(0, half));
  const rebuilt = new SenseTablePrior(rz.senseTable());
  for (const s of samples) {
    liveRebuildChecked++;
    const a = rz.priorCounted(s.ctx), b = rebuilt.priorCounted(s.ctx);
    if (JSON.stringify(a) !== JSON.stringify(b)) { liveRebuildOk = false; liveRebuildBad = name + '@' + s.ctx; break; }
  }
  if (!liveRebuildOk) break;
}

// ---------- smoke + selftest (battery green) ----------
const smoke = spawnSync('node', ['smoke.mjs'], { encoding: 'utf8' });
const smokeOk = smoke.status === 0 && /9 passed, 0 failed/.test(smoke.stdout);
const selftest = spawnSync('node', ['tests/selftest.mjs'], { encoding: 'utf8' });
const selftestOk = selftest.status === 0;
console.log('smoke: ' + (smokeOk ? '9/9' : 'FAIL') + '; selftest: ' + (selftestOk ? 'green' : 'FAIL'));

// ---------- verdicts ----------
const pA9a = optEval.mismatch === 0 && optShift.mismatch === 0 && pathEqBad === 0;
const pA9b = defEval.mismatch === 0 && defShift.mismatch === 0;
const pA9d = twinIdentical && tableIdentical && trainRebuildOk && liveRebuildOk && smokeOk && selftestOk &&
  perLedger.every((l) => l.ser_deterministic && l.twin_fresh_bytes_equal);
const verdict = pA9a && pA9b && pA9c && pA9d ? 'PASS' : 'FAIL';
console.log('\nP-A9a (opt-in wire mechanics: closed==v1 byte-identical, open==fresh law, opt-in paths equal): ' + (pA9a ? 'PASS' : 'FAIL') +
  ` — wire calls=${optEval.calls + optShift.calls} closed=${optEval.closed + optShift.closed} open=${optEval.open + optShift.open} (mismatch ${optEval.mismatch + optShift.mismatch}); path_eq=${pathEqChecked}/${pathEqBad} bad`);
console.log('P-A9b (default law safe, flag absent, both soils byte-identical to v1 reference): ' + (pA9b ? 'PASS' : 'FAIL') +
  ` — calls=${defEval.calls + defShift.calls} (mismatch ${defEval.mismatch + defShift.mismatch}; eval min top.p=${defEval.minTopP.toFixed(4)}, shift min=${defShift.minTopP.toFixed(4)})`);
console.log('P-A9c (fresh value on shift-H2, grow-as-used): ' + (pA9c ? 'PASS' : 'FAIL') +
  ` — fresh ${freshHit}/${n2} vs ens2 ${ens2Hit}/${n2} (delta ${delta >= 0 ? '+' : ''}${delta.toFixed(4)}, gate +0.01; gate_open=${openRows}; flips +${flips.wrong2right}/-${flips.right2wrong}; everywhere=${everywhereHit} vs P-G2d 298; open-row exact-ctx ${coverage.exact_hit}/${coverage.open_rows})`);
console.log('P-A9d (twin + serialized-aggregate rebuild + battery green): ' + (pA9d ? 'PASS' : 'FAIL') +
  ` — twin=${twinIdentical ? 'IDENTICAL ' + jsCore.length + 'B==' + pyCoreStr.length + 'B' : 'DIVERGED'} table=${tableIdentical} train_rebuild=${trainRebuildChecked}ctx/${trainRebuildOk} live_rebuild=${liveRebuildChecked}ctx/${liveRebuildOk} fresh_twin=4/${perLedger.filter((l) => l.twin_fresh_bytes_equal).length} smoke=${smokeOk} selftest=${selftestOk}`);
console.log('\nP-A9 overall: ' + verdict);

// ---------- receipts ----------
mkdirSync('receipts', { recursive: true });
const chainRows = [];
let prev = 'JEVG-EXP-GENESIS-D';
const chain = (row) => { row.row_hash = sha256Hex(canonicalJSON([prev, row])); chainRows.push(row); prev = row.row_hash; };
chain({
  n: 1, claim: 'P-A9', verdict,
  pA9a, pA9b, pA9c, pA9d,
  law: {
    opt_in: 'hyper.fresh.serve_with_fresh = true',
    gate: { signal: 'top.p(ens2)', op: '<', threshold: ESCALATE_BELOW, provenance: 'ESCALATE_BELOW (sealed, reused — no new constant)' },
    open_branch: 'priorCounted from SERIALIZED arms.field.observed (exact field.mjs law, lambda*=0 fresh memory)',
    carrier: 'arms.field.observed (no new arm, no schema change)',
  },
  wire: {
    default: {
      eval: { calls: defEval.calls, closed: defEval.closed, open: defEval.open, mismatch: defEval.mismatch, min_top_p: micro(defEval.minTopP) },
      shift_h2: { calls: defShift.calls, closed: defShift.closed, open: defShift.open, mismatch: defShift.mismatch, min_top_p: micro(defShift.minTopP) },
    },
    optin: {
      eval: { calls: optEval.calls, closed: optEval.closed, open: optEval.open, mismatch: optEval.mismatch, min_top_p: micro(optEval.minTopP) },
      shift_h2: { calls: optShift.calls, closed: optShift.closed, open: optShift.open, mismatch: optShift.mismatch, min_top_p: micro(optShift.minTopP) },
    },
    optin_path_equality: { checked: pathEqChecked, bad: pathEqBad },
  },
  shift_h2_battery: { rows: n2, gate_open: openRows, ens2_hits: ens2Hit, ens2_pinned_to_a8: pinnedA8, fresh_hits: freshHit, delta: micro(delta), margin: 10000, flips_wrong2right: flips.wrong2right, flips_right2wrong: flips.right2wrong, everywhere_hits: everywhereHit, everywhere_pinned_to_pg2d_298: everywhereHit === 298, open_exact_ctx: coverage.exact_hit, open_fallback: coverage.fallback },
  eval_optin_contrast: { rows: evalSamples.length, gate_open: evalOpen, ens2_micro: micro(evalEns2 / evalSamples.length), pinned: evalPinned, fresh_micro: micro(evalFresh / evalSamples.length), flips_wrong2right: evalFlipR2W, flips_right2wrong: evalFlipW2R },
  twin: { identical: twinIdentical, js_bytes: jsCore.length, py_bytes: pyCoreStr.length, table_identical: tableIdentical, train_rebuild_ctx: trainRebuildChecked, train_rebuild_ok: trainRebuildOk, live_rebuild_ctx: liveRebuildChecked, live_rebuild_ok: liveRebuildOk, fresh_mode: freshTwin },
  smoke_9of9: smokeOk, selftest_green: selftestOk,
  artifact_sha256: artifact.artifact_sha256, artifact_pinned: artifactPinned,
  gamma_channel: 'untouched (A9 took path (b); live cells G max = ' + Math.max(...perLedger.map((l) => l.g_max_after_watch)) + ')',
  seal_v: reg.predictions.v,
});
chain({ n: 2, claim: 'per-ledger-h2-grow-as-used', detail: perLedger });
writeFileSync('receipts/e_a9.jsonl', chainRows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync('experiments/outputs/e_a9_summary.json', JSON.stringify({
  run: 'e_a9_fresh', verdict, pA9a, pA9b, pA9c, pA9d,
  law: { opt_in: 'hyper.fresh.serve_with_fresh', gate_threshold: ESCALATE_BELOW, open_branch: 'pure priorCounted (lambda*=0)' },
  wire: { default: { eval: defEval, shift: defShift }, optin: { eval: optEval, shift: optShift }, path_equality: { checked: pathEqChecked, bad: pathEqBad } },
  shiftBattery: { rows: n2, gate_open: openRows, ens2: ens2Hit, fresh: freshHit, delta, everywhere: everywhereHit, coverage },
  evalContrast: { rows: evalSamples.length, gate_open: evalOpen, ens2_micro: micro(evalEns2 / evalSamples.length), fresh_micro: micro(evalFresh / evalSamples.length), flips: { w2r: evalFlipW2R, r2w: evalFlipR2W } },
  twin: { identical: twinIdentical, bytes: jsCore.length, train_rebuild_ctx: trainRebuildChecked, live_rebuild_ctx: liveRebuildChecked },
  perLedger,
}, null, 2));
console.log('receipts: receipts/e_a9.jsonl (tip ' + prev.slice(0, 16) + ')');
process.exit(0); // verdict printed; honest either way
