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
  if (artifact.schema === 'jev-garden/weave-v2' && artifact.arms.field) {
    loaded.field = new SenseTablePrior(artifact.arms.field);
    loaded.ens3 = artifact.hyper.ens3 ?? { wh: 0.4, wq: 0.4, wf: 0.2 };
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
  // Engineering response (receipted, NOT threshold surgery): the served
  // default stays the v1 law (ens2) until a registered hardness gate selects
  // the blend (A8 candidate: ens3 only on hard/shifted soil, P-G2d pattern).
  // The ens3 blend remains available explicitly via loaded.ens3 for lanes
  // that opt in (e.g. hardness-gated callers).
  let probs;
  if (loaded.field && loaded.ens3?.serve_with_field === true) {
    const pf = loaded.field.prior(tokens.join('|'));
    const { wh, wq, wf } = loaded.ens3;
    probs = {};
    for (const o of OPS) probs[o] = wh * ph[o] + wq * pq[o] + wf * pf[o];
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
