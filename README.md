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

---

## First harvest (wave 50, pipeline v2 — verdicts of record)

| Claim | Verdict | Numbers |
|-------|---------|---------|
| P-G0 selftest gate | GREEN | 30/30, fail-closed seal checks |
| P-G1 bake-off order | **PASS** | hash 96.14% > field 89.58%; qthe 92.66% ≥ chance 14.29%; hash − bigram = +3.09pp |
| P-G2 kinda-both ens (λ=0.5) | FAIL | 91.51% vs 96.14% — amplitude prior is noise (γ=0 deformations) |
| P-G2b count-prior ens, λ on train | FAIL | 95.37% vs 96.14% — archived memory doesn't transfer across circuit families |
| P-G2c growth-as-used (watch H1 → judge H2) | FAIL | λ*=0 on every ledger — the head saturates (~97%); fresh memory has no gap to fill |
| P-G3 streamlining | **PASS** | full-journal compile 636ms < 2s; serve 0.056ms/judgment < 0.5ms |
| P-G4 validator duty (all families) | **PASS** | AUC 0.9294 ≥ 0.90; FPR 0.0353 ≤ 0.10 |
| P-G4b semantic-only + delegation doctrine | **PASS** | AUC 0.9539; FPR 0.0551; seq/prev breaks delegated to the chain reader (qcells 4254/4254) |
| P-G5 cross-substrate weave | **PASS** | JS ⟷ Python byte-identical (5450 bytes; integer micro-unit weights; epoch-quantised SGD) |
| P-G6 teacher channel | **PASS** | jev-latest noul 0.70; usage receipted (589+21 tokens, 283ms) |

The honest headline: the **parametric tissue wins** on next-receipt
prediction (three ensemble forms refuted on saturated soil), the
**qthe integer substrate carries real signal**, the **semantic judge
works in its own channel** with structure delegated to the chain, and
the whole learned artifact is **byte-reproducible across substrates**.
The living loop is real: watch → deform → observe → idle-compile →
serve → escalate to the teacher (usage receipted) → grow.
Queued: P-G2d (hard-world variant — memory-priors should pay where the
head is weak), rhizome sense-table in weaves (weave-2), codespace
idle-compile lane.

---------------

## Documentation (wave-69 doc package)

Route by audience — all seven files live in `docs/` and were written against
this tree (every command verified by execution during wave-69):

- **New agent, zero context** → [docs/ONBOARDING.md](docs/ONBOARDING.md) —
  identity, verified commands (incl. what needs credentials), reading order,
  gotchas (seal gate, stale e_g5, broken CI trigger), open frontier.
- **End user of the capability** → [docs/USER-GUIDE.md](docs/USER-GUIDE.md) —
  install, first success (the bake-off), everyday tasks (serve, weave,
  verify seals, twin check, escalation), troubleshooting table, FAQ.
- **Developer extending the code** →
  [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md) — code layout, core
  concepts (rhizome / vessel heads / weave / promotion gate / seal
  discipline / A-line serve laws), how to extend (prediction, substrate,
  serve mode, escalation), testing, conventions, editor gotchas.
- **Engineer operating/reviewing** →
  [docs/ENGINEERING-NOTES.md](docs/ENGINEERING-NOTES.md) — architecture
  diagram, invariants, failure modes & blast radius, measured cost envelope,
  operations & credentials model, design decisions.
- **Executive deciding investment** → [docs/CTO-BRIEF.md](docs/CTO-BRIEF.md) —
  value, maturity with evidence, risks/mitigations, cost, strategic options.
- **Index of all deeper knowledge** →
  [docs/KNOWLEDGE-MAP.md](docs/KNOWLEDGE-MAP.md) — in-repo clusters,
  pre-existing docs, fleet relationships, journal Task IDs (50, 58-a, 61-a,
  61, 63-f, 66-b), receipts of record, search recipes.
