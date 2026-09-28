// src/field.mjs — the Rhizome: an ExoJ-compatible field living at the 'ledger'
// naturality policy (exoj/core.mjs semantics, vendored + pin-checked in
// selftest): per-cell commutative α-weighted accumulation, sense-time
// normalisation, never mutating the ledger. Only observe() collapses.
//
// Growth journal: append-only, hash-chained, content-addressed. The field
// IS the proof object (exoj law). Deformations = judgment events;
// observations = the only place supervision exists.

import { canonicalJSON, sha256Hex, fnv1a64 } from './canon.mjs';

export const GENESIS = 'JEVG-GENESIS';
export const OPS = ['LINK', 'BIND', 'TICK', 'EFFECT', 'VIEW', 'FORGET', 'PROOF'];
export const HEX_RADIUS = 4;

export function hexDist(q1, r1, q2, r2) {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

const key = (q, r) => `${q},${r}`;

export function buildLattice(radius = HEX_RADIUS) {
  const cells = [];
  for (let q = -radius; q <= radius; q++)
    for (let r = -radius; r <= radius; r++)
      if (hexDist(q, r, 0, 0) <= radius) cells.push(key(q, r));
  return cells; // 61 cells
}

// Context -> lattice mapping (DESIGN.md §4, pre-registered): fnv1a-64 over
// the canonical context string, modulo 61 cells.
export function contextCell(contextStr, cells = null) {
  const lattice = cells ?? buildLattice();
  return lattice[Number(fnv1a64(contextStr) % 61n)];
}

export class Rhizome {
  constructor() {
    this.lattice = buildLattice();
    this.cells = new Map(this.lattice.map((k) => [k, { G: 0, E: 0, D: 0, aSum: 0, n: 0, touched: 0, strength: 0, prob: 1.0 }]));
    this.seq = 0;
    this.journal = [];      // append-only, hash-chained
    this.observed = new Map(); // contextStr -> op -> count  (the supervision aggregate)
    this.deformations = 0;
    this.observations = 0;
  }

  // JEV step: emit a soft deformation for a judgment context. Never a
  // definite token. gamma' = observed confidence (0 if unobserved),
  // eta' = 1 - gamma', delta' = creative-band centre unless surprise given.
  deform(contextStr, { gamma = 0, surprise = 0, tag = '' } = {}) {
    const cellKey = contextCell(contextStr, this.lattice);
    const cell = this.cells.get(cellKey);
    const alpha = 0.4;
    const eta = 1 - gamma;
    const delta = surprise > 0 ? 0.4 + 0.2 * (1 - Math.min(surprise, 1)) : 0.5;
    cell.G += alpha * gamma; cell.E += alpha * eta; cell.D += alpha * delta;
    cell.aSum += alpha; cell.touched += 1; cell.n += 1;
    cell.strength = Math.max(cell.strength, gamma);
    cell.prob = Math.min(1.0, cell.prob * 0.98 + 0.02);
    this.seq += 1; this.deformations += 1;
    const row = {
      seq: this.seq, kind: 'deform', context: contextStr, cell: cellKey,
      gamma, eta, delta, tag,
    };
    this.append(row);
    return row;
  }

  // The only collapse (exoj law): an observed outcome — receipt stream label,
  // teacher answer, or human REVIEW. This is where supervision exists.
  observe(contextStr, op, { source = 'receipt' } = {}) {
    const cellKey = contextCell(contextStr, this.lattice);
    this.seq += 1; this.observations += 1;
    const row = { seq: this.seq, kind: 'observe', context: contextStr, cell: cellKey, op, source };
    this.append(row);
    const m = this.observed.get(contextStr) ?? new Map();
    m.set(op, (m.get(op) ?? 0) + 1);
    this.observed.set(contextStr, m);
    return row;
  }

  append(row) {
    const prev = this.journal.length ? this.journal[this.journal.length - 1].row_hash : GENESIS;
    const { row_hash, ...rest } = row; // eslint-disable-line
    row.row_hash = sha256Hex(canonicalJSON([prev, row]));
    this.journal.push(row);
  }

  journalTip() {
    return this.journal.length ? this.journal[this.journal.length - 1].row_hash : GENESIS;
  }

  verifyJournal() {
    let prev = GENESIS;
    for (const row of this.journal) {
      const { row_hash, ...rest } = row; // eslint-disable-line
      if (sha256Hex(canonicalJSON([prev, rest])) !== row.row_hash) return { ok: false, at: row.seq };
      prev = row.row_hash;
    }
    return { ok: true, at: this.journal.length };
  }

  // Sense-time aggregates (pure, never mutate): amplitude-weighted vote of
  // observed outcomes in the lattice neighbourhood of a context cell.
  // This is the rhizome prior used by the `field` arm and the ensemble.
  prior(contextStr, radius = 2) {
    const cellKey = contextCell(contextStr, this.lattice);
    const [cq, cr] = cellKey.split(',').map(Number);
    const votes = Object.fromEntries(OPS.map((o) => [o, 0]));
    let total = 0;
    for (const k of this.lattice) {
      const [q, r] = k.split(',').map(Number);
      const d = hexDist(cq, cr, q, r);
      if (d > radius) continue;
      const cell = this.cells.get(k);
      const w = cell.touched > 0 ? (cell.G / (cell.aSum || 1)) / (1 + d) : 0;
      if (w <= 0) continue;
      const m = null; // per-cell op votes are derived from journal (below)
      void m; void cell;
    }
    // per-cell op votes come from the supervision aggregate keyed by context,
    // mapped through the cell index (commutative, order-free).
    for (const [ctx, m] of this.observed) {
      const c2 = contextCell(ctx, this.lattice);
      const [q, r] = c2.split(',').map(Number);
      const d = hexDist(cq, cr, q, r);
      if (d > radius) continue;
      const cell = this.cells.get(c2);
      const gamma = cell.aSum > 0 ? cell.G / cell.aSum : 0;
      const w = (gamma + 1e-9) / (1 + d);
      for (const [op, c] of m) { votes[op] += w * c; total += w * c; }
    }
    if (total <= 0) {
      const u = 1 / OPS.length;
      return Object.fromEntries(OPS.map((o) => [o, u]));
    }
    return Object.fromEntries(OPS.map((o) => [o, votes[o] / total]));
  }

  // Addendum A1 (P-G2b): count-based memory prior. From the supervision
  // aggregate (observed op counts per exact context), add-1 smoothed toward
  // the global observed distribution; unseen contexts fall back to the
  // global distribution blended with uniform. The prior memorizes exact
  // contexts; the head generalizes — ens2 blends the two.
  priorCounted(contextStr2) {
    const globalCounts = new Map();
    let totalObs = 0;
    for (const [, m] of this.observed) for (const [op, c] of m) { globalCounts.set(op, (globalCounts.get(op) ?? 0) + c); totalObs += c; }
    const m = this.observed.get(contextStr2);
    const probs = {};
    if (m) {
      let tot = 0;
      for (const o of OPS) tot += m.get(o) ?? 0;
      for (const o of OPS) probs[o] = ((m.get(o) ?? 0) + 1) / (tot + OPS.length);
    } else {
      for (const o of OPS) probs[o] = totalObs > 0 ? ((globalCounts.get(o) ?? 0) + 1) / (totalObs + OPS.length) : 1 / OPS.length;
    }
    return probs;
  }

  sense() {
    let g = 0, e = 0, d = 0, active = 0, zone = 0, open = 0;
    for (const c of this.cells.values()) {
      if (c.touched === 0) continue;
      active += 1;
      const gamma = c.G / c.aSum, eta = c.E / c.aSum;
      const delta = c.D / c.aSum;
      g += gamma; e += eta; d += delta;
      if (delta >= 0.4 && delta <= 0.6) zone += 1;
      open += c.prob;
    }
    const n = active || 1;
    return {
      gamma: g / n, eta: e / n, delta: d / n, active,
      zone: zone / n, prob_open: open / n,
      deformations: this.deformations, observations: this.observations,
    };
  }
}
