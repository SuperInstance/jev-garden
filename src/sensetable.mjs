// src/sensetable.mjs — weave-2 (Addendum A7): serve-time rebuild of the rhizome
// prior from the weave artifact's serialized sense table. The neighborhood law
// is EXACTLY field.mjs prior(): radius-2 hex neighbourhood, per-cell weight
// w = (gamma + 1e-9) / (1 + d) with gamma = G/aSum from the table, votes =
// observed op counts of contexts mapped to cells within the radius, add-uniform
// fallback when no votes. No mutation, no state.
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
}
