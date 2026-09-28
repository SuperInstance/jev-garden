// src/features.mjs — the three substrates (DESIGN.md §1.2).
//   qthe  : QTHE 8-bit ternary hyper-embedding, LAYER 0 integer split-channel
//           (SPEC facts 1-3, exhaustively testable, zero floats) + minimal
//           wormhole bridge for Abstain tokens.
//   hash  : hashed n-gram features into 2^11 buckets, L2-normalised.
//   field : pure rhizome retrieval (implemented in field.mjs prior()).

import { fnv1a64 } from './canon.mjs';

// ---------- tokenisation (shared) ----------
// Context = previous K rows as tokens. K=3, sealed.
// Addendum A1: tokens carry the ARG CHANNEL — "kind/op/argOp" (argOp =
// args.op when present) so the judge sees the channel that impact-sensitive
// arg corruption touches (P-G4b).
export const K = 3;
export function tokenOf(row) {
  const arg = row?.args?.op;
  return arg ? `${row.kind}/${row.op}/${arg}` : `${row.kind}/${row.op}`;
}
export function contextTokens(rows, i) {
  const out = [];
  for (let j = Math.max(0, i - K); j < i; j++) out.push(tokenOf(rows[j]));
  while (out.length < K) out.unshift('␀/␀');
  return out;
}
export function contextStr(rows, i) { return contextTokens(rows, i).join('|'); }

// ---------- QTHE LAYER 0 (the 8-bit primitive) ----------
// byte = [τ:2][d:6]; τ: 0 Ground, 1 Attract, 2 Repel, 3 Abstain.
// Split channel: y_R = Σ_{τ=1} d·x − Σ_{τ=2} d·x ; y_I = Σ_{τ=3} d·x.
export function qthePack(token) {
  const h = fnv1a64(token);
  const tau = Number((h >> 6n) & 3n);
  const d = Number(h & 63n);
  return { tau, d, byte: (tau << 6) | d };
}
export function qtheUnpack(byte) { return { tau: byte >> 6, d: byte & 63 }; }

// Position weights: the newest token carries weight 4, then 2, then 1
// (recency doubling — pre-registered). x_k ∈ {4,2,1} per position.
export const QTHE_POSITION_WEIGHTS = [4, 2, 1];

export function qtheFeatures(tokens) {
  // Integer channels per position + aggregate; plus wormhole coordinate list.
  const per = [];
  let yR = 0, yI = 0;
  const abstain = [];
  for (let i = 0; i < tokens.length; i++) {
    const { tau, d } = qthePack(tokens[i]);
    const x = QTHE_POSITION_WEIGHTS[i] ?? 1;
    const r = tau === 1 ? d * x : tau === 2 ? -d * x : 0;
    const im = tau === 3 ? d * x : 0;
    per.push({ tau, d, x, r, i });
    yR += r; yI += im;
    if (tau === 3) abstain.push(d);
  }
  return { yR, yI, per, abstain };
}

// Wormhole table: 64 slots; slot[d] = per-op counts of training contexts
// whose window contained an Abstain coordinate d. At inference, contexts
// carrying that coordinate blend the slot distribution (weight sealed 0.3).
export const WORMHOLE_WEIGHT = 0.3;
// feat: [{abstain: [d,...], label}]
export function buildWormhole(feat) {
  const slots = Array.from({ length: 64 }, () => ({}));
  for (const s of feat) {
    for (const d of s.abstain) {
      const slot = slots[d];
      slot[s.label] = (slot[s.label] ?? 0) + 1;
    }
  }
  return slots;
}
export function wormholeBlend(slots, abstain, OPS) {
  const out = Object.fromEntries(OPS.map((o) => [o, 0]));
  let total = 0;
  for (const d of abstain) {
    for (const op of OPS) {
      const c = slots[d]?.[op] ?? 0;
      out[op] += c; total += c;
    }
  }
  if (total === 0) return null;
  return Object.fromEntries(OPS.map((o) => [o, out[o] / total]));
}

// ---------- hash arm features ----------
export const HB = 2048; // 2^11 buckets, sealed
export function hashFeatures(tokens) {
  const v = new Float64Array(HB);
  const grams = [];
  for (let i = 0; i < tokens.length; i++) {
    grams.push(tokens[i]);
    if (i + 1 < tokens.length) grams.push(tokens[i] + '∼' + tokens[i + 1]);
  }
  for (const g of grams) {
    const h = Number(fnv1a64(g) % BigInt(HB));
    const sign = (fnv1a64('#' + g) & 1n) === 0n ? 1 : -1;
    v[h] += sign;
  }
  let nrm = 0;
  for (let i = 0; i < HB; i++) nrm += v[i] * v[i];
  nrm = Math.sqrt(nrm) || 1;
  for (let i = 0; i < HB; i++) v[i] /= nrm;
  return v;
}
