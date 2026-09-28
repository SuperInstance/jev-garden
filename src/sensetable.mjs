// src/sensetable.mjs — weave-2 (Addendum A7): serve-time rebuild of the rhizome
// prior from the weave artifact's serialized sense table. The neighborhood law
// is EXACTLY field.mjs prior(): radius-2 hex neighbourhood, per-cell weight
// w = (gamma + 1e-9) / (1 + d) with gamma = G/aSum from the table, votes =
// observed op counts of contexts mapped to cells within the radius, add-uniform
// fallback when no votes. No mutation, no state.
//
// A9 (Addendum A9, seal v12): priorCounted(ctx) — the EXACT field.mjs
// Rhizome.priorCounted law rebuilt from the SERIALIZED supervision aggregate
// (arms.field.observed). The A8c mechanism receipt: the P-G2d +13.41pp came
// from priorCounted fresh memory, not the lattice prior; this rebuild gives
// the serve path the exact-context law behind the registered fresh opt-in.
// Integer counts only — exact cross-substrate.
import { OPS, buildLattice, contextCell, hexDist } from './field.mjs';

export class SenseTablePrior {
  constructor(table) {
    this.lattice = buildLattice();
    this.cells = table.cells;        // cellKey -> {G, aSum}
    this.observed = new Map();       // ctx -> Map(op -> count)
    for (const [ctx, ops] of table.observed) {
      this.observed.set(ctx, new Map(Object.entries(ops)));
    }
    this.cellOfCtx = new Map();
    for (const ctx of this.observed.keys()) this.cellOfCtx.set(ctx, contextCell(ctx, this.lattice));
  }

  prior(contextStr, radius = 2) {
    const cellKey = contextCell(contextStr, this.lattice);
    const [cq, cr] = cellKey.split(',').map(Number);
    const votes = Object.fromEntries(OPS.map((o) => [o, 0]));
    let total = 0;
    for (const [ctx, m] of this.observed) {
      const c2 = this.cellOfCtx.get(ctx);
      const [q, r] = c2.split(',').map(Number);
      const d = hexDist(cq, cr, q, r);
      if (d > radius) continue;
      const cellG = this.cells[c2]?.G ?? 0;
      const cellASum = this.cells[c2]?.aSum ?? 0;
      const gamma = cellASum > 0 ? cellG / cellASum : 0;
      const w = (gamma + 1e-9) / (1 + d);
      for (const [op, c] of m) { votes[op] += w * c; total += w * c; }
    }
    if (total <= 0) {
      const u = 1 / OPS.length;
      return Object.fromEntries(OPS.map((o) => [o, u]));
    }
    return Object.fromEntries(OPS.map((o) => [o, votes[o] / total]));
  }

  // A9 (Addendum A9, seal v12): the fresh-memory prior — the EXACT field.mjs
  // Rhizome.priorCounted law over the serialized supervision aggregate.
  // add-1 smoothing toward the global observed distribution; unseen contexts
  // fall back to the global distribution; empty aggregate -> uniform.
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
}
