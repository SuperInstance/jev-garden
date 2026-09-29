// src/serve.mjs — the Judge: local JEV endpoint speaking the TypeSafe
// systemone wire shape (jev-quilt/JEV_TUTORIAL.md). A quilt lane can swap
// the hosted JEV for the garden without protocol changes. Low-confidence
// judgments carry escalate=true — the escalation organ routes to the
// hosted teacher, whose answer becomes an observation (the garden grows
// from every escalation).

import { OPS } from './field.mjs';
import { judgeHash, judgeQthe, ensemble, argmax } from './heads.mjs';
import { contextTokens } from './features.mjs';
import { SenseTablePrior } from './sensetable.mjs';

export const ESCALATE_BELOW = 0.55; // sealed

export function loadWeave(artifact) {
  if (artifact.schema !== 'jev-garden/weave-v1' && artifact.schema !== 'jev-garden/weave-v2') {
    throw new Error(`refuse: unknown weave schema ${artifact.schema}`);
  }
  const hash = {
    kind: 'hash',
    W: artifact.arms.hash.W.map((sparse) => {
      const w = new Float64Array(2048);
      for (const [i, v] of Object.entries(sparse)) w[Number(i)] = v;
      return w;
    }),
    b: Float64Array.from(artifact.arms.hash.b),
  };
  const qthe = { kind: 'qthe', prototypes: artifact.arms.qthe.prototypes, wormhole: artifact.arms.qthe.wormhole };
  const loaded = { artifact, hash, qthe };
  // weave-2 (A7): the sense table rides in the artifact — rebuild the
  // living-memory arm for serve. v1 artifacts carry no field arm (unchanged).
  // A9 (addendum A9, seal v12): the fresh-memory opt-in rides the artifact
  // hyper — no new arm, no schema change; artifacts without the flag behave
  // exactly as the A8-era law (v1 default everywhere).
  if (artifact.schema === 'jev-garden/weave-v2' && artifact.arms.field) {
    loaded.field = new SenseTablePrior(artifact.arms.field);
    loaded.ens3 = artifact.hyper.ens3 ?? { wh: 0.4, wq: 0.4, wf: 0.2 };
    loaded.fresh = artifact.hyper?.fresh?.serve_with_fresh === true;
    // A10 (addendum A10, seal v15): the fresh-everywhere trial mode — the A9
    // fresh law with the gate REMOVED, opt-in only. Zero new constants: the
    // mode has no threshold at all. Artifacts without the flag are untouched.
    loaded.freshEverywhere = artifact.hyper?.fresh?.fresh_everywhere === true;
    // A12 (addendum A12, seal v19): the fallback-aware everywhere trial mode —
    // the mechanism A11 priced from its honest FAIL. Opt-in only. The
    // exact-ctx test is the registered A11 classification (a membership test
    // on the serialized aggregate, not a threshold): zero new constants.
    // Artifacts without the flag are untouched.
    loaded.freshAware = artifact.hyper?.fresh?.fresh_everywhere_fallback_aware === true;
    // A13 (addendum A13, seal v21): the pre-registered escalation budget cap
    // (the M10+M4 budget-cap header). Opt-in only: undefined unless the
    // artifact pre-registers hyper.serve.budget.escalate_max_per_walk. The
    // cap gates the ESCALATION ORGAN's spend AUTHORITY (see
    // makeEscalationBudget below) — NEVER the served expression: judge() is
    // untouched, the wire's escalate field stays the honest local signal.
    loaded.escalateBudgetCap = artifact.hyper?.serve?.budget?.escalate_max_per_walk;
  }
  return loaded;
}

// state: { context: [ {kind, op}, ... ] }  (the chain so far)
// questions: { name: { type: 'noul'|'choice'|'score', ... } }
// judged: the row under judgment {kind, op} (optional for noul-free calls)
export function judge(loaded, state, questions, judged) {
  const rows = [...(state?.context ?? [])];
  const answers = {};
  if (judged) rows.push(judged);
  const tokens = contextTokens(rows, rows.length);
  const ph = judgeHash(loaded.hash, tokens).probs;
  const pq = judgeQthe(loaded.qthe, tokens).probs;
  // weave-1 law: served judgment = ens of the two compiled arms (0.5/0.5).
  // weave-2 (A7): the sense table rides in the artifact as `field`. P-W2b
  // VERDICT OF RECORD: the registered ens3 blend FAILED on the saturated eval
  // slice (0.9459 vs ens2 0.9537, delta -0.0077 < -0.005) — the hardness law
  // predicted exactly this (amplitude memory prior = noise on saturated soil).
  // A8 (P-A8, addendum A8, seal v10) VERDICT OF RECORD: the registered
  // hardness gate (saturation s = top.p(ens2), H* = ESCALATE_BELOW = 0.55
  // reused) FAILED 2 of 4 — P-A8b: the gate opens on 11/259 saturated eval
  // calls (every P-W2b flip sits on a would-escalate row; a per-row
  // confidence gate cannot guarantee whole-slice closure); P-A8c: on shift
  // H2 the gated blend EXACTLY equals ens2 (0.7055, 40 opens, zero flips —
  // the stream grow law deforms with gamma=0, so the archived table's prior
  // is a distance-tilted frequency that never crosses a margin). Registered
  // FAIL branch executed: the served DEFAULT stays the v1 law everywhere;
  // the gate ships OPT-IN only (hyper.ens3.hardness_gate = true).
  // A9 (P-A9, addendum A9, seal v12): the FRESH-memory serve law (grow-as-
  // used) — the registered answer to the A8c mechanism receipt (the P-G2d
  // +13.41pp came from priorCounted FRESH H1 memory, and the supervision
  // aggregate the artifact already serializes is exactly its payload).
  // Opt-in only (hyper.fresh.serve_with_fresh = true): gate s = top.p(ens2),
  // H* = ESCALATE_BELOW (reused); gate-closed serves the exact v1 expression
  // (byte-identical); gate-open serves priorCounted rebuilt from the
  // SERIALIZED aggregate — the P-G2d law of record (lambda* = 0: all fresh
  // memory on the open branch). Grow-as-used: the lane re-serializes
  // arms.field from its own watched stream before serving.
  // A10 (P-A10, addendum A10, seal v15): the FRESH-EVERYWHERE trial mode —
  // the A9 law with the gate removed, opt-in only
  // (hyper.fresh.fresh_everywhere = true). A9 priced the gap it leaves:
  // ungated fresh-everywhere = 298/343 on shift-H2 vs 252 gated (+46 net rows
  // the gate stays closed on); characterization PROVED no train-only H* can
  // capture that gap without reopening the saturated slice (gap rows and
  // protection rows INTERLEAVE in top.p; the train walk-forward objective is
  // exactly flat in H* — 569/582 at every grid point — so a compile-time
  // calibration cannot rank thresholds). The selector is therefore SOIL-LEVEL
  // (the A6 law: hardness is a property of the world, not the row): the lane
  // that has registered its soil hard opts in, with the saturated risk
  // PRICED at the A9 receipt pin (eval slice: 0.9382 vs v1 0.9537, flips
  // -6/+2 — archived memory still damages new soil, the P-G2b pattern).
  // Serves priorCounted from the SERIALIZED aggregate on EVERY row (the exact
  // A9 payload, gate removed; zero new constants — the mode has no
  // threshold). Registered branch order: A7 serve_with_field -> A12
  // fresh_everywhere_fallback_aware -> A10 fresh_everywhere -> A9
  // serve_with_fresh -> A8 hardness_gate -> default v1 (strictest-freshest
  // wins among fresh modes: the A12 fallback-aware restriction serves fresh
  // on a SUBSET of A10's rows, so it beats plain everywhere; A7's ens3 blend
  // kept first for byte-compat with the A7-A11 registered order).
  // A12 (P-A12, addendum A12, seal v19): the FALLBACK-AWARE everywhere trial
  // mode — the mechanism priced by A11's honest FAIL (seal v18 pricing text
  // of record): serve the walk memory ONLY on exact-ctx steps (where A11
  // measured EXACT-CTX NEUTRALITY: zero hit-outcome flips on all 1216
  // exact-ctx steps — fresh memory is never wrong on what it memorized), and
  // the v1 law on unseen contexts (where A11 concentrated 100% of the
  // everywhere damage: the prefix-marginal argmax LINK 62/BIND 99/EFFECT 41
  // lost 118 rows vs 1 against ens2's heads on the 202 fallback steps).
  // The exact-ctx test is `observed.has(token key)` — the registered A11
  // classification, a MEMBERSHIP test, not a threshold: zero new constants.
  // Both served expressions are existing registered pieces (the A10 payload
  // and the v1 law); the branch only SELECTS between them per step.
  // Modes: default = v1 law; `serve_with_field` = unconditional ens3 (A7);
  // `fresh_everywhere_fallback_aware: true` = the fallback-aware everywhere
  // trial (A12, opt-in);
  // `fresh_everywhere: true` = the fresh-everywhere trial (A10, opt-in);
  // `serve_with_fresh: true` = the registered gated fresh law (A9, opt-in);
  // `hardness_gate: true` = the registered gated blend (A8, opt-in).
  let probs;
  if (loaded.field && loaded.ens3?.serve_with_field === true) {
    const pf = loaded.field.prior(tokens.join('|'));
    const { wh, wq, wf } = loaded.ens3;
    probs = {};
    for (const o of OPS) probs[o] = wh * ph[o] + wq * pq[o] + wf * pf[o];
  } else if (loaded.field && loaded.freshAware === true) {
    // A12 branch: exact-ctx -> the EXACT A10 payload (priorCounted over the
    // SERIALIZED aggregate); fallback (unseen context) -> the EXACT v1 law
    // (NOT the prefix marginal A11 measured as the whole of the everywhere
    // damage, -0.0825, envelope-breaching on the real lane).
    if (loaded.field.observed.has(tokens.join('|'))) {
      probs = loaded.field.priorCounted(tokens.join('|'));
    } else {
      probs = ensemble(ph, pq, 0.5); // the v1 law — the A11 fallback repair
    }
  } else if (loaded.field && loaded.freshEverywhere === true) {
    probs = loaded.field.priorCounted(tokens.join('|'));
  } else if (loaded.field && loaded.fresh === true) {
    const e2 = ensemble(ph, pq, 0.5); // gate-closed path is THIS expression
    if (argmax(e2).p >= ESCALATE_BELOW) {
      probs = e2;
    } else {
      probs = loaded.field.priorCounted(tokens.join('|'));
    }
  } else if (loaded.field && loaded.ens3?.hardness_gate === true) {
    const e2 = ensemble(ph, pq, 0.5); // v1 law — the gate-closed path is THIS expression
    if (argmax(e2).p >= ESCALATE_BELOW) {
      probs = e2;
    } else {
      const pf = loaded.field.prior(tokens.join('|'));
      const { wh, wq, wf } = loaded.ens3;
      probs = {};
      for (const o of OPS) probs[o] = wh * ph[o] + wq * pq[o] + wf * pf[o];
    }
  } else {
    probs = ensemble(ph, pq, 0.5);
  }
  const top = argmax(probs);
  for (const [name, q] of Object.entries(questions)) {
    if (q.type === 'choice' && q.criteria?.opcode) {
      answers[name] = { type: 'choice', choice: top.op, confidence: top.p, probabilities: probs };
    } else if (q.type === 'noul') {
      // "in-pattern": probability mass on the judged row's claimed op; if no
      // judged row given, mass on the argmax (the model's own expectation).
      const claimed = judged?.op ?? top.op;
      const p = probs[claimed] ?? 0;
      answers[name] = { type: 'noul', noul: p, confidence: top.p, probabilities: probs };
    } else if (q.type === 'score') {
      answers[name] = { type: 'score', score: 1 + 4 * top.p, confidence: top.p, probabilities: probs };
    }
  }
  const escalate = top.p < ESCALATE_BELOW;
  return {
    model: `jev-garden/${loaded.artifact.schema}@w${loaded.artifact.index}`,
    answers, escalate,
    usage: { model: 'garden-local', tokens: 0 },
  };
}

// A13 (addendum A13, seal v21): the budget-gated escalation organ — the M10+M4
// budget-cap mechanism, EXECUTED. The organ holds the lane's spend authority
// for ONE production walk: the first `cap` honest escalate signals are granted
// (routed to the teacher), every later signal is refused and COUNTED with the
// honest reason budget_exhausted — a refusal is never swallowed silently. The
// organ consumes only the SIGNAL: it never sees or changes the served bytes
// (judge() is untouched), so a capped organ cannot perturb a judgment by
// construction. Fail-closed: a non-integer or negative cap throws at
// construction, not mid-walk.
export function makeEscalationBudget(cap) {
  if (!Number.isInteger(cap) || cap < 0) {
    throw new Error(`refuse: escalate_max_per_walk must be a non-negative integer, got ${cap}`);
  }
  return {
    cap,
    spent: 0,
    refused: 0,
    reason: null,
    grant(escalateSignal) {
      if (!escalateSignal) return false; // no signal — the organ is not consulted
      if (this.spent < this.cap) { this.spent += 1; return true; }
      this.refused += 1;
      this.reason = 'budget_exhausted';
      return false;
    },
  };
}
