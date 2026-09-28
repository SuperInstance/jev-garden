// src/heads.mjs — vessel heads: qthe prototype growth, hash-arm softmax SGD
// (torch-shaped, torch-free), bigram floor, ensemble. All deterministic:
// zero-init weights, sealed hyper-parameters, epoch-quantised weights
// (r6 after each epoch — cross-substrate weave stability, P-G5).

import { OPS } from './field.mjs';
import { hashFeatures, qtheFeatures, buildWormhole, wormholeBlend, WORMHOLE_WEIGHT, HB } from './features.mjs';
import { r6 } from './canon.mjs';

// ---------- qthe arm: growth is adding prototype cells (no gradients) ----------
export function trainQthe(trainSamples) {
  const prototypes = new Map(); // key: op|yR|yI -> {op, yR, yI, n}
  const feat = [];
  for (const s of trainSamples) {
    const f = qtheFeatures(s.tokens);
    feat.push({ abstain: f.abstain, label: s.label });
    const k = `${s.label}|${f.yR}|${f.yI}`;
    const p = prototypes.get(k);
    if (p) p.n += 1;
    else prototypes.set(k, { op: s.label, yR: f.yR, yI: f.yI, n: 1 });
  }
  const wormhole = buildWormhole(feat);
  return { kind: 'qthe', prototypes: [...prototypes.values()], wormhole };
}

export function judgeQthe(model, tokens) {
  const f = qtheFeatures(tokens);
  const scores = Object.fromEntries(OPS.map((o) => [o, 0]));
  let bestD = Infinity;
  for (const p of model.prototypes) {
    const d = Math.abs(p.yR - f.yR) + Math.abs(p.yI - f.yI);
    scores[p.op] += 1 / (1 + d);
    if (d < bestD) bestD = d;
  }
  let total = 0;
  for (const o of OPS) total += scores[o];
  if (total === 0) {
    const u = 1 / OPS.length;
    const probs = Object.fromEntries(OPS.map((o) => [o, u]));
    return { probs, tie: true };
  }
  const probs = Object.fromEntries(OPS.map((o) => [o, scores[o] / total]));
  const wb = wormholeBlend(model.wormhole, f.abstain, OPS);
  if (wb) for (const o of OPS) probs[o] = (1 - WORMHOLE_WEIGHT) * probs[o] + WORMHOLE_WEIGHT * wb[o];
  return { probs, tie: false, yR: f.yR, yI: f.yI };
}

// ---------- hash arm: softmax + SGD ----------
export const HYP = { lr: 0.5, epochs: 12, wd: 1e-4, clip: 5.0 }; // sealed

export function trainHash(trainSamples) {
  const W = Array.from({ length: OPS.length }, () => new Float64Array(HB));
  const b = new Float64Array(OPS.length);
  const X = trainSamples.map((s) => hashFeatures(s.tokens));
  const Y = trainSamples.map((s) => OPS.indexOf(s.label));
  for (let ep = 0; ep < HYP.epochs; ep++) {
    for (let n = 0; n < X.length; n++) {
      const x = X[n], y = Y[n];
      const scores = new Float64Array(OPS.length);
      for (let c = 0; c < OPS.length; c++) {
        let s = b[c];
        const w = W[c];
        for (let i = 0; i < HB; i++) if (x[i] !== 0) s += w[i] * x[i];
        scores[c] = s;
      }
      const mxc = Math.max(...scores);
      const exps = scores.map((s) => Math.exp(s - mxc));
      const Z = exps.reduce((a, c) => a + c, 0);
      for (let c = 0; c < OPS.length; c++) {
        const g = exps[c] / Z - (c === y ? 1 : 0);
        const gc = Math.max(-HYP.clip, Math.min(HYP.clip, g));
        const w = W[c];
        for (let i = 0; i < HB; i++) if (x[i] !== 0) w[i] -= HYP.lr * (gc * x[i] + HYP.wd * w[i]);
        b[c] -= HYP.lr * gc;
      }
    }
    // epoch quantisation: re-synchronise substrates every epoch (P-G5)
    for (let c = 0; c < OPS.length; c++) {
      const w = W[c];
      for (let i = 0; i < HB; i++) if (w[i] !== 0) w[i] = r6(w[i]);
      b[c] = r6(b[c]);
    }
  }
  return { kind: 'hash', W, b };
}

export function judgeHash(model, tokens) {
  const x = hashFeatures(tokens);
  const scores = new Array(OPS.length);
  for (let c = 0; c < OPS.length; c++) {
    let s = model.b[c];
    const w = model.W[c];
    for (let i = 0; i < HB; i++) if (x[i] !== 0) s += w[i] * x[i];
    scores[c] = s;
  }
  const mxc = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - mxc));
  const Z = exps.reduce((a, c) => a + c, 0);
  const probs = Object.fromEntries(OPS.map((o, c) => [o, exps[c] / Z]));
  return { probs };
}

// ---------- bigram floor ----------
export function trainBigram(trainLedgers) {
  const t = new Map(); // "prevOp" -> op -> count
  for (const rows of trainLedgers) {
    for (let i = 1; i < rows.length; i++) {
      const k = rows[i - 1].op;
      if (!t.has(k)) t.set(k, {});
      const m = t.get(k);
      m[rows[i].op] = (m[rows[i].op] ?? 0) + 1;
    }
  }
  return { kind: 'bigram', t };
}

export function judgeBigram(model, prevOp) {
  const m = model.t.get(prevOp) ?? {};
  let total = 0;
  for (const o of OPS) total += m[o] ?? 0;
  if (total === 0) return Object.fromEntries(OPS.map((o) => [o, 1 / OPS.length]));
  return Object.fromEntries(OPS.map((o) => [o, (m[o] ?? 0) / total]));
}

// ---------- ensemble (kinda-both: head ⊕ rhizome prior) ----------
export const ENS_LAMBDA = 0.5; // sealed in PREDICTIONS.md
export function ensemble(headProbs, rhizomeProbs, lambda = ENS_LAMBDA) {
  const out = {};
  for (const o of OPS) out[o] = lambda * (headProbs[o] ?? 0) + (1 - lambda) * (rhizomeProbs[o] ?? 0);
  return out;
}

export function argmax(probs) {
  let best = null, bv = -1;
  for (const [k, v] of Object.entries(probs)) if (v > bv) { bv = v; best = k; }
  return { op: best, p: bv };
}

export function top1(probs, truth) { return argmax(probs).op === truth ? 1 : 0; }

// ---------- weave artifact (byte-deterministic) ----------
export function weaveJSON(artifact) {
  const { canon } = artifact;
  return JSON.stringify(canon); // canonical string built by weaver
}
