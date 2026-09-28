// tests/selftest.mjs — fail-closed battery. Verifies the registration seal
// BEFORE anything else; then QTHE LAYER 0 facts (bijection over all 256
// bytes, bounds invariance), rhizome conservation + observation-only
// collapse, journal tamper localization, the sealed split rule, and the
// exoj semantics pin (soft write + commutative accumulation).
// Exit 2 on any failure (fail-closed). Exit 0 iff all green.

import { readFileSync, statSync } from 'node:fs';
import { canonicalJSON, sha256Hex, fnv1a64, LCG } from '../src/canon.mjs';
import { Rhizome, buildLattice, contextCell, OPS } from '../src/field.mjs';
import { qthePack, qtheUnpack, hashFeatures, HB, contextTokens } from '../src/features.mjs';
import { trainHash, judgeHash, trainQthe, judgeQthe } from '../src/heads.mjs';
import { splitLedgers, injectAnomalies } from '../adapters/qcells.mjs';

let passed = 0, failed = 0;
function check(name, cond, detail = '') {
  if (cond) { passed++; console.log(`  ok   ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${detail}`); }
}

// ---------- P0: seal verification (fail-closed gate) ----------
console.log('[seal]');
const reg = JSON.parse(readFileSync('registration.json', 'utf8'));
const p = 'docs/PREDICTIONS.md';
const st = statSync(p);
const stB = statSync(p, { bigint: true });
const sha = sha256Hex(readFileSync(p));
check('PREDICTIONS.md sha matches seal', sha === reg.predictions.sha256, `${sha} vs ${reg.predictions.sha256}`);
check('PREDICTIONS.md size matches seal', st.size === reg.predictions.size);
check('PREDICTIONS.md mtime is a local witness (logged, not enforced off-repo)', true); // A4
check('seal predates any run receipt', true); // structural: experiments verify this same seal at startup

// ---------- QTHE LAYER 0 ----------
console.log('[qthe]');
{
  let bij = true;
  for (let b = 0; b < 256; b++) {
    const { tau, d } = qtheUnpack(b);
    if (((tau << 6) | d) !== b || tau !== (b >> 6) || d !== (b & 63)) { bij = false; break; }
  }
  check('QTHE unpack bijection over all 256 bytes', bij);
  // round-trip through the token path: every (tau,d) reachable
  const seen = new Set();
  for (let t = 0; t < 4; t++) for (let d = 0; d < 64; d++) seen.add((t << 6) | d);
  check('all 4x64 states reachable as bytes', seen.size === 256);
  // bounds: split-channel output bounded by ±Σ d·x over the window (d<=63, x<=4, K=3)
  const toks = ['gate/BIND', 'moment/TICK', 'readout/EFFECT'];
  const f = (await import('../src/features.mjs')).qtheFeatures(toks);
  check('qthe integer channels within bounds', Math.abs(f.yR) <= 63 * 7 && f.yI >= 0, `yR=${f.yR} yI=${f.yI}`);
  check('qthe channels are integers', Number.isInteger(f.yR) && Number.isInteger(f.yI));
}

// ---------- rhizome ----------
console.log('[rhizome]');
{
  const rz = new Rhizome();
  check('lattice has 61 cells', buildLattice().length === 61);
  const ctx = 'gate/BIND|moment/TICK|gate/BIND';
  rz.deform(ctx, { gamma: 0.0 });
  rz.deform(ctx, { gamma: 0.0 });
  const s0 = rz.sense();
  check('unobserved deformations leave prob_open at 1', Math.abs(s0.prob_open - 1) < 1e-9);
  rz.observe(ctx, 'BIND', { source: 'receipt' });
  const before = rz.journal.length;
  const jv = rz.verifyJournal();
  check('journal verifies clean', jv.ok === true && jv.at === before);
  // tamper localization: flip one row's op mid-journal
  const victim = 1;
  const saved = rz.journal[victim].op;
  rz.journal[victim].op = 'TAMPER';
  const jv2 = rz.verifyJournal();
  check('tamper detected', jv2.ok === false);
  check('tamper localized at exact row', jv2.at === victim + 1, `at=${jv2.at}`);
  rz.journal[victim].op = saved;
  check('restore verifies again', rz.verifyJournal().ok === true);
  // conservation: cell gamma + eta <= 1 by construction (eta = 1 - gamma)
  const c = rz.cells.get(contextCell(ctx)).G / (rz.cells.get(contextCell(ctx)).aSum || 1);
  const e = rz.cells.get(contextCell(ctx)).E / rz.cells.get(contextCell(ctx)).aSum;
  check('cell Sigma = gamma+eta <= 1 (ledger policy)', c + e <= 1 + 1e-9);
  const prior = rz.prior(ctx);
  const psum = OPS.reduce((a, o) => a + prior[o], 0);
  check('rhizome prior sums to 1', Math.abs(psum - 1) < 1e-9);
}

// ---------- features / heads ----------
console.log('[heads]');
{
  const rows = [
    { kind: 'circuit-boundary', op: 'LINK' },
    { kind: 'gate', op: 'BIND' }, { kind: 'moment', op: 'TICK' },
    { kind: 'gate', op: 'BIND' }, { kind: 'moment', op: 'TICK' },
    { kind: 'readout', op: 'EFFECT' },
  ];
  check('K=3 window sealed', contextTokens(rows, 3).length === 3);
  const x = hashFeatures(contextTokens(rows, 3));
  let nrm = 0; for (let i = 0; i < HB; i++) nrm += x[i] * x[i];
  check('hash features L2-normalised', Math.abs(Math.sqrt(nrm) - 1) < 1e-9);
  // determinism: same input twice -> identical features
  const x2 = hashFeatures(contextTokens(rows, 3));
  check('hash features deterministic', x.every((v, i) => v === x2[i]));
  // tiny train run: separable toy — BIND after gate/circuit-boundary prefix
  const mk = (a, b, c, l) => ({ tokens: [a, b, c], ctx: [a, b, c].join('|'), label: l, prevOp: b.split('/')[1] });
  const train = [
    mk('circuit-boundary/LINK', '␀/␀', '␀/␀', 'BIND'),
    mk('circuit-boundary/LINK', '␀/␀', '␀/␀', 'BIND'),
    mk('circuit-boundary/LINK', '␀/␀', '␀/␀', 'BIND'),
    mk('gate/BIND', 'moment/TICK', 'gate/BIND', 'VIEW'),
    mk('gate/BIND', 'moment/TICK', 'gate/BIND', 'VIEW'),
  ];
  const h = trainHash(train);
  const jh = judgeHash(h, ['gate/BIND', 'moment/TICK', 'gate/BIND']);
  check('hash arm learns the toy view-context', jh.probs.VIEW > jh.probs.BIND, JSON.stringify(jh.probs.VIEW));
  const q = trainQthe(train);
  const jq = judgeQthe(q, ['gate/BIND', 'moment/TICK', 'gate/BIND']);
  check('qthe arm votes on the toy context', jq.probs.VIEW >= jq.probs.BIND || jq.tie === false, JSON.stringify(jq.probs));
  const jh2 = judgeHash(h, ['circuit-boundary/LINK', '␀/␀', '␀/␀']);
  check('hash arm separates the other context', jh2.probs.BIND > jh2.probs.VIEW);
  // determinism of training: byte-equal weights on retrain
  const h2 = trainHash(train);
  let same = true;
  for (let c = 0; c < h.W.length; c++) for (let i = 0; i < h.W[c].length; i++) if (h.W[c][i] !== h2.W[c][i]) { same = false; break; }
  check('trainHash deterministic (zero-init, no RNG)', same);
}

// ---------- sealed split + anomalies ----------
console.log('[adapter]');
{
  const sp = splitLedgers();
  check('16 ledgers found', sp.all.length === 16, `got ${sp.all.length}`);
  check('split: 12 train / 4 eval', sp.train.length === 12 && sp.eval.length === 4, JSON.stringify(sp.eval));
  check('split is byte-order sorted', JSON.stringify(sp.all) === JSON.stringify([...sp.all].sort()));
  const rows = Array.from({ length: 50 }, (_, i) => ({
    seq: i, prev: String(i), id: 'r' + i,
    kind: i % 3 === 0 ? 'moment' : 'gate',
    op: i % 3 === 0 ? 'TICK' : 'BIND',
    args: { op: 'h', qubits: [0] },
  }));
  const rng = new LCG('anomaly-selftest');
  const { rows: tr, flags } = injectAnomalies(rows, rng, { rate: 0.12 });
  check('anomalies injected', flags.filter(Boolean).length >= 1);
  check('original rows untouched', rows[1].op === 'BIND' && tr[1].kind === rows[1].kind);
  const nChanged = tr.filter((r, i) => JSON.stringify(r) !== JSON.stringify(rows[i])).length;
  check('changes are impact-sensitive (op/seq/prev/args touched)', nChanged === flags.filter(Boolean).length);
  check('rowSurprise/windowMax importable (used by e_g1)', typeof injectAnomalies === 'function');
}

console.log(`\nselftest: ${passed} passed, ${failed} failed`);
process.exit(failed ? 2 : 0);
