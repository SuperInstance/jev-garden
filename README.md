# jev-garden

> The living JEV training system, quilt-native. A garden, not a factory:
> the model grows from what flows through the quilt, and idle compute
> compiles its ExoJ into a more utile tool for the next inferencing.

## The one-line organism

A **JEV** (Joint Embedding Validator) that is *kinda both* — a non-parametric
**rhizome** (an ExoJ non-collapsing field that deforms with every judgment)
*and* a parametric **vessel head** (tiny deterministic trainers, no torch,
no gradient stack) — where **understanding emerges through distribution**:
every quilt lane that uses the garden feeds it, the idle-time **weaver**
compiles the accumulated exoj into versioned **weave artifacts**, and the
next inference starts from the distilled weave instead of the raw field.

## Why a garden

The pincher reflex answered with fixed instincts. The garden *tends*: it
observes what the quilt actually judges (receipt rows, escalations, teacher
answers), grows where the wave collapses (only explicit observations carry
ground truth — the ExoJ law), and metabolizes in idle time. Nothing is ever
"trained once": every weave is versioned, receipted, and promoted or
DISCARDed by a sealed gate (the jeviter lifecycle), so the model's history
is append-only — a gardener's ledger, not a checkpoint zoo.

## The bake-off the founder asked for

"I don't know if vector embedding or torch are exactly right" — so neither
is assumed. Three substrates are grown on identical soil and priced:

| Arm | Substrate | Learning |
|-----|-----------|----------|
| `qthe` | QTHE 8-bit ternary hyper-embedding (τ:2 + d:6, integer split-channel LAYER 0) | none — growth is adding prototype cells |
| `hash` | hashed n-gram features + softmax head | zero-dep JS SGD (torch-shaped, torch-free) |
| `field` | pure rhizome retrieval (amplitude-weighted nearest observation) | none — memory only |

Plus the `bigram` baseline as the honest floor, and the `ens` ensemble
(rhizome prior ⊕ head posterior) to price the "kinda both" claim.

## First judgment duty (real soil)

Receipt-chain validation over the real `quilt-qcells` CELL-MAPPING ledgers
(16 ledgers, 1418 rows, 7 opcodes LINK/BIND/TICK/EFFECT/VIEW/FORGET/PROOF):
predict the next row's opcode from the chain context (Task A), and flag
impact-sensitively-corrupted rows (Task B) using a concentration statistic,
not a global mean (quilt-jepa design law (b)). The served artifact speaks
the TypeSafe `systemone` wire shape (`noul`/`choice`/`score` + confidence)
so a quilt lane can swap the hosted JEV for the garden without protocol
changes — and escalates low-confidence judgments to the real teacher,
recording usage receipts for every gifted call (pricing-first).

## Layout

```
src/        canon, field (rhizome), features (qthe/hash/field), heads,
            weaver (idle compiler), serve (systemone wire), teacher bridge
adapters/   qcells.mjs — real receipt ledgers -> garden judgment streams
ref/        garden_ref.py — Python twin (cross-substrate determinism)
experiments/  e_g1_grow.mjs (tasks A+B, all arms), e_g5_determinism.mjs
docs/       DESIGN.md (organism), PREDICTIONS.md (pre-registered, sealed)
tests/      selftest.mjs — QTHE bijection/bounds, conservation, tamper
            localization, fail-closed seal verification
scouts/     receipted research (raw JSON + report)
```

## Run

```bash
node smoke.mjs              # end-to-end in one tiny garden
node tests/selftest.mjs     # unit battery, fail-closed
node experiments/e_g1_grow.mjs    # the bake-off on real qcells soil
node experiments/e_g5_determinism.mjs  # JS == Python twin, byte-exact
```

No dependencies beyond `node:crypto`/`node:fs`. No network at test time.
The teacher bridge is the only networked module and is never invoked by
tests (usage receipts are published under `receipts/`).

## Doctrine (inherited, not optional)

- Paired arms, identical worlds. Decision rules before the run.
- Pre-registered predictions, sha256+mtime sealed in `registration.json`;
  experiments verify the seal and refuse to run otherwise (fail-closed).
- Honest negatives are crown jewels; a FAIL is receipted, not repaired.
- Zero force-push, append-only journals, every weave chain-tipped.
