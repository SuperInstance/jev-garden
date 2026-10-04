# jev-garden — User Guide

## What you get

A JEV (judge/evaluator-verifier) that grows as it is used. You point it at a
receipt stream (its first duty: quilt-qcells CELL-MAPPING ledgers — predicting
the next row's opcode and flagging impact-sensitively corrupted rows), it
grows a non-collapsing field of judgments (the rhizome), trains tiny
deterministic heads over that soil, and — when idle — compiles everything into
a versioned **weave artifact** that the next inference starts from. The
served artifact speaks the TypeSafe `systemone` wire (`noul` / `choice` /
`score` + confidence), so anything that today calls the hosted JEV can point
at the garden with zero protocol changes, escalating low-confidence judgments
to the real teacher and growing from every answer. All learning is
deterministic: no torch, no floats in the qthe substrate, byte-reproducible
across JS and Python.

## Install

```bash
git clone https://github.com/SuperInstance/jev-garden
cd jev-garden
node --version          # >= 18; zero npm dependencies (no package.json)
node smoke.mjs          # expect: "smoke: 9 passed, 0 failed"
```

For the real-soil experiments, clone the sister repo as a sibling:

```bash
cd .. && git clone https://github.com/SuperInstance/quilt-qcells
cd jev-garden
node tests/selftest.mjs   # expect: "selftest: 30 passed, 0 failed"
```

## First success in 5 minutes

Grow a garden on the real soil and read the bake-off:

```bash
node experiments/e_g1_grow.mjs
```

Expected (reproduced in wave-69; timings vary, verdicts do not):

```
=== Task A: next-opcode bake-off (12 train / 4 eval ledgers) ===
...
P-G1 PASS  (hash 0.9614 > field 0.8958; qthe 0.9266 >= 0.1429; hash-bigram +0.0309)
P-G2 FAIL  (ens 0.9151 vs best single 0.9614)     <- honest negative, receipted
P-G3 PASS  (compile ~0.6s < 2s; serve ~0.056ms < 0.5ms per judgment)
P-G4 PASS  (AUC 0.9294 >= 0.90, FPR 0.0353 <= 0.10)
receipts: receipts/e_g1.jsonl (6 links, tip d92e4aba…), experiments/outputs/e_g1_summary.json
```

What you just saw: the parametric tissue (hashed features + 40-line SGD)
wins next-receipt prediction on this soil; the three ensemble forms were
pre-registered and honestly failed; the validator duty (flagging corrupted
rows) clears its AUC/FPR bars. The verdicts are hash-chained in
`receipts/e_g1.jsonl`.

## Everyday usage

### 1. Serve judgments on the systemone wire

```bash
node -e "
import('./src/serve.mjs').then((m) => {
  const artifact = JSON.parse(require('fs').readFileSync('experiments/outputs/weave_v2_js.json', 'utf8'));
  const sv = m.loadWeave(artifact);
  const r = m.judge(sv, { prev: [['gate','BIND'],['moment','TICK']] },
                    { op: { type: 'choice', criteria: { opcode: true } } },
                    { kind: 'gate', op: 'BIND' });
  console.log(JSON.stringify(r.answers.op, null, 2));
});"
# -> { "type": "choice", "choice": "LINK", "confidence": 0.4400…, "probabilities": { …7 opcodes… } }
```

`loadWeave(artifact)` is fail-closed on unknown schemas and journal-tip
mismatch; `judge(loaded, state, questions, judged)` returns the served
expression with the registered branch order (A7 → A12 → A10 → A9 → A8 → v1)
and sets the escalate signal for the teacher organ under confidence < 0.55.

### 2. Grow and compile (the weaver)

```js
import { Rhizome } from './src/field.mjs';
import { grow, weaveIfIdle } from './src/weaver.mjs';
import { makeSamples, loadLedger } from './adapters/qcells.mjs';

const samples = /* your judgment stream as (ctx, row, label) samples */;
const r = new Rhizome();
grow(r, samples);                    // every judgment = a soft deformation
const weave = weaveIfIdle(r, samples);  // idle-time compile; PROMOTE/REVIEW/DISCARD by sealed gate
```

The promotion gate is sealed: PROMOTE iff eval top-1 improves by ≥ +0.02
absolute and no eval slice degrades by > 0.05; otherwise REVIEW/DISCARD —
and a DISCARD is receipted, never deleted.

### 3. Verify the pre-registration before trusting any number

```bash
node tests/selftest.mjs    # includes fail-closed seal verification (registration.json v22)
```

Any experiment run first verifies the sha256+size seal of
`docs/PREDICTIONS.md`; mismatch ⇒ exit 2. If an experiment ran and produced a
verdict, it ran under the sealed rules.

### 4. Check cross-substrate determinism

```bash
node experiments/e_w2.mjs
# P-W2a (cross-substrate byte-identity, core-v2): PASS — js=9960B py=9960B
```

The Python twin (`ref/garden_ref.py`) reproduces the weave core byte for
byte; integer micro-unit weights and epoch-quantised SGD make float repr
irrelevant.

### 5. Escalate to the teacher (needs credentials)

The escalation organ routes low-confidence judgments to the hosted JEV
(`jev-latest`, typesafe.ai). It requires `TYPESAFE_API_KEY` in the
environment and network access; without them the channel fails closed.
Every call records a usage receipt (tokens, latency) — pricing-first law;
see the P-G6 receipt of record (noul 0.70, 589+21 tokens, 283 ms).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `SEAL MISMATCH — refusing to run (exit 2)` | `docs/PREDICTIONS.md` or `docs/DESIGN.md` changed after sealing | Append a dated addendum and re-seal per the append-only rule (new version in `registration.json` `seal_history`); never edit sealed text in place |
| `refuse: unknown weave schema …` | Weave artifact is v1/v2-foreign or hand-edited | Regenerate the weave with `weaveIfIdle`/the experiments; serve refuses anything whose journal-tip seal does not match |
| Experiments error: ledgers not found | Sister repo missing | `git clone https://github.com/SuperInstance/quilt-qcells` as a sibling of this checkout (CI does exactly this) |
| `npm test` → ENOENT | There is no package.json by design | Run `node tests/selftest.mjs` and `node smoke.mjs` |
| e_g5 prints FAIL (5450 vs 9960 bytes) | Stale experiment: the twin evolved to core-v2 (e_w2's shape) | Trust `e_w2` P-W2a for the current twin law; treat e_g5's committed PASS as its historical receipt of record |
| `TYPESAFE_API_KEY missing — teacher channel closed` | Escalation configured but no key | Provide the env var (note the spelling differs from exoj's) or run with escalation disabled; the organ records, never fabricates |
| Rerun overwrote a receipt file | Experiments write receipts in place by design | Measured bytes reproduce; stamps/timings move. `git checkout -- <file>` restores the committed receipt of record |
| garden-battery never runs on push | `.github/workflows/garden.yml` has `branches: ain]` (a mangled `[main]`) | Trigger manually via `workflow_dispatch`, or fix the YAML line |

## FAQ

**Why "a garden, not a factory"?** Nothing is trained once and shipped. The
garden observes what the quilt actually judges, grows where the wave collapses
(only explicit observations carry ground truth — the ExoJ law), metabolizes in
idle time (the weaver), and keeps an append-only gardener's ledger (weave
versions, promotion receipts) instead of a checkpoint zoo.

**What are the arms?** `qthe` (8-bit ternary hyper-embedding, integer
split-channel, no gradients — growth is new prototype cells), `hash` (hashed
n-gram features + zero-dep JS softmax SGD — torch-shaped, torch-free), `field`
(pure rhizome retrieval — no learning, the control), `bigram` (the honest
floor), and `ens` (head ⊕ rhizome prior — prices the "kinda both" claim).
On the real soil the honest headline was: the parametric tissue wins
(P-G1), the ensembles honestly failed (P-G2/b/c), and the qthe integer
substrate carries real signal.

**Can I use my own receipt stream instead of qcells?** Yes — the adapter
contract is small: turn rows into samples of (context = previous k=3 rows'
kind/op, target = next row's op) plus anomaly injection for validator duty.
`adapters/qcells.mjs` is the reference (windowMax concentration statistic for
detection, threshold chosen on TRAIN data only). Keep the pre-registration
discipline: seal your decision rules before the first run.

**What happens when the garden is unsure?** The served judgment carries its
confidence; below the registered 0.55 gate the escalation organ routes the
judgment to the hosted teacher, records a usage receipt, and appends the
teacher's answer to the growth journal as an observed outcome — the garden
grows from its own uncertainty.

**Is anything nondeterministic?** The judged artifacts are not: no
wall-clock inside artifacts, canonical JSON, chain-tipped weaves, seeded LCG
streams, byte-identical JS/Python twins. Wall-clock appears only in receipt
timestamps and measured timings, which are kept out of the deterministic
chain by design.
