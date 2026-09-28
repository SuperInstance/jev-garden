// adapters/qcells.mjs — real receipt soil: SuperInstance/quilt-qcells
// CELL-MAPPING ledgers -> garden judgment streams. Also: the sealed split,
// sample building, and impact-sensitive anomaly injection (quilt-jepa
// design law (c)).

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { contextTokens, contextStr, qtheFeatures, K } from '../src/features.mjs';
import { OPS } from '../src/field.mjs';

export const QCELLS_DIR_DEFAULT = '../quilt-qcells/receipts/ledgers';

// Sealed split rule (PREDICTIONS.md): byte-order sort; first 12 train,
// last 4 eval. Pinned by selftest BEFORE any run.
export function splitLedgers(dir = QCELLS_DIR_DEFAULT) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort();
  return { train: files.slice(0, 12), eval: files.slice(12), all: files };
}

export function loadLedger(dir, file) {
  return readFileSync(join(dir, file), 'utf8')
    .split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

// Stream -> samples. Target = row.op; context = previous K rows' kind/op.
export function makeSamples(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    if (!OPS.includes(rows[i].op)) continue;
    out.push({
      tokens: contextTokens(rows, i),
      ctx: contextStr(rows, i),
      label: rows[i].op,
      rowSeq: rows[i].seq,
      prevOp: i > 0 ? rows[i - 1].op : '␀',
    });
  }
  return out;
}

// ---------- impact-sensitive anomalies (Task B) ----------
// Family (sealed in PREDICTIONS.md): each changes what the row MEANS, not
// just cosmetics. op-swap: BIND<->EFFECT on a gate row (semantic class flip);
// seq-break: seq skips; prev-break: prev points at a foreign id;
// arg-corrupt: gate name h<->cx (changes the micromoth oracle itself).
// Addendum A1 (P-G4b): families:'semantic' restricts to op-swap +
// arg-corrupt — the only families visible to the judge's channel;
// seq/prev breaks are DELEGATED to the chain reader (structural integrity
// is the chain's job, already 4254/4254 receipted in quilt-qcells).
export function injectAnomalies(rows, rng, { rate = 0.12, families = 'all' } = {}) {
  const out = rows.map((r) => ({ ...r, args: JSON.parse(JSON.stringify(r.args ?? {})) }));
  const flags = new Array(out.length).fill(false);
  const candidates = [];
  for (let i = 1; i < out.length; i++) {
    const r = out[i];
    if (r.kind === 'gate' || r.kind === 'readout' || r.kind === 'moment') candidates.push(i);
  }
  const nInject = Math.max(1, Math.round(candidates.length * rate));
  const chosen = new Set();
  let guard = 0;
  while (chosen.size < nInject && guard++ < 1000) {
    const i = candidates[rng.int(candidates.length)];
    if (chosen.has(i)) continue;
    chosen.add(i);
    flags[i] = true;
    const r = out[i];
    const roll = families === 'semantic' ? (rng.int(2) === 0 ? 0 : 3) : rng.int(4);
    if (roll === 0) {
      if (r.op === 'BIND') r.op = 'EFFECT'; else r.op = 'BIND';
    } else if (roll === 1) {
      r.seq = r.seq + 1; // skip
    } else if (roll === 2) {
      r.prev = 'forged' + (rng.int(1e6).toString(16));
    } else {
      if (r.args?.op === 'h') r.args.op = 'cx';
      else if (r.args?.op === 'cx') r.args.op = 'h';
      else r.args.corrupt = true;
    }
  }
  return { rows: out, flags };
}

// Surprise of a row under a judge: 1 - p_model(observed op | context).
// Concentration statistic (design law (b)): window MAX, not mean.
export function rowSurprise(judgeFn, rows) {
  const out = new Array(rows.length).fill(null);
  for (let i = 0; i < rows.length; i++) {
    if (!OPS.includes(rows[i].op)) { out[i] = null; continue; }
    const tokens = contextTokens(rows, i);
    const { probs } = judgeFn(tokens);
    out[i] = 1 - (probs[rows[i].op] ?? 0);
  }
  return out;
}

export function windowMax(surprises, w = 5) {
  const out = new Array(surprises.length).fill(0);
  for (let i = 0; i < surprises.length; i++) {
    let m = 0;
    for (let j = Math.max(0, i - w + 1); j <= i; j++) m = Math.max(m, surprises[j] ?? 0);
    out[i] = m;
  }
  return out;
}

export function percentile(sorted, p) {
  if (!sorted.length) return 1;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[idx];
}

// AUC via rank statistic (handles ties by average rank).
export function auc(pos, neg) {
  const all = [...pos.map((v) => ({ v, l: 1 })), ...neg.map((v) => ({ v, l: 0 }))]
    .sort((a, b) => a.v - b.v);
  let rankSumPos = 0, n1 = pos.length, n0 = neg.length, i = 0;
  while (i < all.length) {
    let j = i;
    while (j + 1 < all.length && all[j + 1].v === all[i].v) j++;
    const avgRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) if (all[k].l === 1) rankSumPos += avgRank;
    i = j + 1;
  }
  if (n1 === 0 || n0 === 0) return null;
  return (rankSumPos - n1 * (n1 + 1) / 2) / (n1 * n0);
}
