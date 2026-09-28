// src/weaver.mjs — the cambium: idle-time compiler. Diffs the growth
// journal, trains challenger heads, runs the promotion gate (jeviter
// lifecycle: PROMOTE / REVIEW / DISCARD), emits a byte-deterministic
// weave artifact chain-tipped to the journal.

import { canonicalJSON, sha256Hex, r6 } from './canon.mjs';
import { OPS } from './field.mjs';
import { trainQthe, judgeQthe, trainHash, judgeHash, trainBigram, judgeBigram, top1 } from './heads.mjs';

// Grow the rhizome from a sample stream: one deformation per judgment
// event, one observation per labeled receipt (the only collapse).
export function grow(rhizome, samples) {
  for (const s of samples) {
    rhizome.deform(s.ctx, { gamma: 0, tag: 'stream' });
    rhizome.observe(s.ctx, s.label, { source: 'receipt' });
  }
  return rhizome;
}

export function evaluateArms(models, samples, rhizome) {
  const names = ['bigram', 'qthe', 'hash', 'field', 'ens'];
  const hit = Object.fromEntries(names.map((n) => [n, 0]));
  for (const s of samples) {
    const pb = judgeBigram(models.bigram, s.prevOp);
    const pq = judgeQthe(models.qthe, s.tokens).probs;
    const ph = judgeHash(models.hash, s.tokens).probs;
    const pf = rhizome.prior(s.ctx);
    const pe = { };
    for (const o of OPS) pe[o] = 0.5 * ph[o] + 0.5 * pf[o];
    if (top1(pb, s.label)) hit.bigram++;
    if (top1(pq, s.label)) hit.qthe++;
    if (top1(ph, s.label)) hit.hash++;
    if (top1(pf, s.label)) hit.field++;
    if (top1(pe, s.label)) hit.ens++;
  }
  const n = samples.length || 1;
  return Object.fromEntries(names.map((k) => [k, hit[k] / n]));
}

// Promotion gate (PREDICTIONS.md / DESIGN.md §1.3): challenger vs incumbent.
// No incumbent -> PROMOTE (first fruit). Else promote iff top1 improves
// >= +0.02 AND no tracked metric degrades > 0.05. Ties -> REVIEW.
export function promotionGate(challengerEval, incumbentEval) {
  if (!incumbentEval) return { verdict: 'PROMOTE', reason: 'first weave' };
  const tracked = ['hash', 'ens'];
  let worst = 0, bestGain = Infinity;
  for (const k of tracked) {
    const gain = challengerEval[k] - incumbentEval[k];
    bestGain = Math.min(bestGain, gain);
    if (gain < -0.05) return { verdict: 'DISCARD', reason: `${k} degrades by ${(-gain).toFixed(4)} > 0.05` };
    worst = Math.max(worst, gain);
  }
  if (worst >= 0.02) return { verdict: 'PROMOTE', reason: `gain ${worst.toFixed(4)} >= 0.02` };
  return { verdict: 'REVIEW', reason: `max gain ${worst.toFixed(4)} in [ -0.05, 0.02 )` };
}

// Build the weave artifact. Floats quantised r6; canonical JSON; chain-tipped.
export function compileWeave({ rhizome, trainSamples, evalSamples, incumbent, weaveIndex, notes }) {
  const t0 = process.hrtime.bigint();
  const qtheM = trainQthe(trainSamples);
  const hashM = trainHash(trainSamples);
  const t1 = process.hrtime.bigint();

  const evalMetrics = evaluateArms(
    {
      bigram: trainBigramFromSamples(trainSamples),
      qthe: qtheM, hash: hashM,
    },
    evalSamples, rhizome,
  );

  const gate = promotionGate(evalMetrics, incumbent?.evalMetrics ?? null);

  // Serialize hash arm compactly: sparse non-zero weights only.
  const W = hashM.W.map((w) => {
    const sparse = {};
    for (let i = 0; i < w.length; i++) if (w[i] !== 0) sparse[i] = r6(w[i]);
    return sparse;
  });
  const b = Array.from(hashM.b, (x) => r6(x));

  const artifact = {
    schema: 'jev-garden/weave-v1',
    index: weaveIndex,
    journal_tip: rhizome.journalTip(),
    journal_len: rhizome.journal.length,
    hyper: { lr: 0.5, epochs: 12, wd: 0.0001, clip: 5, K: 3, HB: 2048, ens_lambda: 0.5, wormhole_weight: 0.3 },
    arms: {
      hash: { W, b },
      qthe: { prototypes: qtheM.prototypes, wormhole: qtheM.wormhole },
    },
    evalMetrics: Object.fromEntries(Object.entries(evalMetrics).map(([k, v]) => [k, r6(v)])),
    gate,
    notes: notes ?? '',
  };
  artifact.artifact_sha256 = sha256Hex(canonicalJSON(artifact));
  return {
    artifact, evalMetrics, gate,
    compileMs: Number(t1 - t0) / 1e6,
  };
}

// bigram trained on sample streams (prevOp -> label)
export function trainBigramFromSamples(samples) {
  const t = new Map();
  for (const s of samples) {
    if (!t.has(s.prevOp)) t.set(s.prevOp, {});
    const m = t.get(s.prevOp);
    m[s.label] = (m[s.label] ?? 0) + 1;
  }
  return { kind: 'bigram', t };
}
