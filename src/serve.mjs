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
  // arms.field from its own watched stream before serving. Branch order:
  // A7 serve_with_field -> A9 serve_with_fresh -> A8 hardness_gate -> v1.
  // Modes: default = v1 law; `serve_with_field` = unconditional ens3 (A7);
  // `serve_with_fresh: true` = the registered gated fresh law (A9, opt-in);
  // `hardness_gate: true` = the registered gated blend (A8, opt-in).
  let probs;
  if (loaded.field && loaded.ens3?.serve_with_field === true) {
    const pf = loaded.field.prior(tokens.join('|'));
    const { wh, wq, wf } = loaded.ens3;
    probs = {};
    for (const o of OPS) probs[o] = wh * ph[o] + wq * pq[o] + wf * pf[o];
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
