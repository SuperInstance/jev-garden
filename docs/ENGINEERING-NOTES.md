# jev-garden — Engineering Notes

## Architecture

The organism, in data-flow order. Everything inside the dashed box is
deterministic and offline; only the teacher organ touches the network.

```
   real soil                                  synthetic soil
   quilt-qcells ledgers                       smoke.mjs two-family rows
   (16 ledgers, 1418 rows)                         │
        │ adapters/qcells.mjs                      │
        │  splitLedgers (sealed 12/4)              │
        │  makeSamples (ctx k=3 kind|op → next op) │
        ▼                                          ▼
 ┌────────────────────────── rhizome (src/field.mjs) ──────────────────────────┐
 │ hex lattice 61 cells · deform(ctx) = soft deformation (growth)              │
 │ observe() = the ONLY collapse (supervision) · hash-chained growth journal   │
 │ context→cell: fnv1a-64(ctx) % 61 (DESIGN §4, pre-registered)                │
 └───────────────┬─────────────────────────────────────────────────────────────┘
                 │ idle time
                 ▼
 ┌────────────────────── weaver (src/weaver.mjs) ──────────────────────────────┐
 │ diff journal → train challenger heads on sealed train slice                 │
 │ promotionGate: PROMOTE ≥ +0.02 / REVIEW band / DISCARD ≤ −0.05 (receipted)  │
 │ compileWeave v1|v2 → chain-tipped, canonical, byte-deterministic artifact   │
 └───────────────┬─────────────────────────────────────────────────────────────┘
                 │ weave.json
                 ▼
 ┌────────────────────── serve (src/serve.mjs) ────────────────────────────────┐
 │ loadWeave (fail-closed: schema, journal-tip seal)                           │
 │ systemone wire: noul / choice / score + confidence                          │
 │ branch order A7 → A12 → A10 → A9 → A8 → v1 (strictest-freshest)             │
 │ confidence < 0.55 → escalate signal → makeEscalationBudget (A13, cap 32,    │
 │   arrival order, refusals counted) ─────────────┐                           │
 └─────────────────────────────────────────────────┼───────────────────────────┘
                                                   ▼
                                     teacher organ (src/teacher.mjs)
                                     typesafe.ai jev-latest · TYPESAFE_API_KEY
                                     usage receipt per call; the answer is
                                     appended to the journal as an observation
                                                   │
                                                   └──▶ back to the rhizome
                                                   (the garden grows from escalation)
```

Arms priced on identical soil (`evaluateArms`): `bigram` (floor), `qthe`
(integer split-channel prototypes + wormhole blend 0.3), `hash` (2048-bucket
features + SGD head), `field` (rhizome retrieval control), `ens`
(0.5·head + 0.5·rhizome prior). Cross-substrate twin: `ref/garden_ref.py`
reproduces the weave core byte-for-byte (P-W2a, 9960B == 9960B).

## Invariants

- **Field stays open; observations are the only collapses** — enforced in
  `src/field.mjs` (observe is the only prob_mass-zeroing path) and checked by
  smoke ("field stays open", "observations are the only collapses") and
  selftest.
- **Seal before run** — every experiment's first act: verify
  `registration.json` sha256+size of `docs/PREDICTIONS.md`; mismatch ⇒ exit 2
  (fail-closed). Enforced in each `experiments/e_*.mjs` runner.
- **Serve fail-closed** — `loadWeave` refuses unknown schemas and any weave
  whose journal-tip seal does not match the growth journal; unknown branch
  flags leave default behavior byte-identical (A9/A10/A12/A13 all prove
  default-identity with the flag absent).
- **Byte-identity across substrates** — P-W2a: JS weave core == Python twin
  core, byte for byte (integer micro-unit weights; epoch-quantised SGD). The
  current contract is `e_w2`'s; e_g5's 5450B PASS is a historical receipt of
  the wave-50-era core-v1 shape (stale runner, documented honestly).
- **Promotion gate bounds** — no weave replaces an incumbent without the
  sealed ≥ +0.02 / > −0.05 economics; DISCARD is receipted, never deleted.
- **Budget cap semantics (A13)** — cap 32, arrival-order grants, refusals
  counted with reason `budget_exhausted`, organ outside the served bytes,
  cap-independent escalate signal (all P-A13a/b clauses receipted PASS).

## Failure modes & blast radius

- **Seal mismatch** — all experiments refuse (exit 2); blast radius: the
  experiment suite halts until a lawful re-seal. This is the intended
  failure: it converts silent rule drift into a loud stop.
- **Weave/journal mismatch** — serve refuses the artifact; blast radius: one
  endpoint load fails; lanes fall back to the hosted teacher.
- **Twin divergence** — P-W2a FAIL prints the first differing byte; blast
  radius: the determinism claim is void until reconciled (the e_g5 staleness
  is exactly this failure mode, contained by keeping e_w2 as the contract).
- **Teacher channel down / key absent** — `src/teacher.mjs` throws a named
  error ("teacher channel closed (fail-closed)"); serve records the escalate
  signal; blast radius: no labels from escalation that walk, no fabricated
  ones. Usage receipts make the spend auditable.
- **Soil drift** — the A13 runner derives its pins from the A12 receipt and
  refuses if the pins moved ("pins moved -> cap derivation void -> refuse");
  blast radius: one run refused rather than a verdict computed on a different
  world.
- **CI push trigger dead** — garden.yml's `branches: ain]` filter matches no
  branch; the battery silently stops running on push (only
  `workflow_dispatch` fires). Blast radius: stale CI verdicts; the lane
  batteries remain the local contract.

## Performance & cost envelope

- Receipted measurements (G-line, pipeline v2, reproduced within noise in
  wave-69): full-journal compile ~575–636 ms (budget < 2 s, P-G3 PASS); serve
  ~0.055–0.056 ms per judgment (budget < 0.5 ms); grow ~25 ms for 136-row
  synthetic soil; twin byte-identity 9960 B (e_w2) at journal_len 2318,
  nnz 364.
- Teacher spend is the only metered cost: P-G6 receipt of record is 589+21
  tokens / 283 ms for one judgment; A13 caps escalation authority at 32
  grants per walk (2.3% of the 1418-step production walk — the shipped
  default's own load of record). Registrations carry their own M4 spend cap
  headers (A13's own: $0.00 / 0 calls / 0 tokens — deterministic local run).
- Everything else is free-tier: zero dependencies, no services, no database;
  CI is GitHub-hosted runners (garden-battery clones the soil fresh).

## Operations

- **Local**: the commands in USER-GUIDE; the only environment dependency is
  the sister repo `quilt-qcells` for real-soil runs (CI clones it with
  `git clone --depth 1`).
- **CI**: `forge.yml` delegates to the fleet's reusable workflow with
  `test-cmd: node tests/selftest.mjs`; `garden.yml` (garden-battery) is the
  idle-compile lane on GitHub compute — dispatched manually since the push
  filter is broken (`branches: ain]`, line 9 — a mangled `[main]`); it runs
  selftest → smoke → G-line → e_g5 → A8/A9 → uploads `receipts/` as
  artifacts. Note the determinism step still calls the stale e_g5 (exit 0
  either way; the honest FAIL prints).
- **Credentials model**: exactly one — `TYPESAFE_API_KEY` (teacher organ),
  read at call time, never logged into artifacts; usage receipts carry
  tokens/latency only. No keys in the tree; the moth-seal note in
  PREDICTIONS.md documents the labeled deterministic fallback when the
  certified-randomness channel under-delivered (wave-49 census finding).
- **Cross-repo posture**: soil comes from quilt-qcells (cloned fresh in CI —
  pin by running against a known tip if you need a byte-frozen re-run); the
  garden serves quilt lanes via the systemone wire with zero protocol change.

## Design decisions & why

1. **Vendored ExoJ `ledger` semantics for the rhizome** (not a new memory
   design): exoj's E-X1 crowned the commutative ledger policy; the garden
   inherits naturality instead of re-deriving it, and selftest pins the
   vendored semantics.
2. **Only observations supervise** (the ExoJ law): growth from unobserved
   judgments would let the model train on its own guesses; restricting
   supervision to recorded collapses makes the growth journal an honest
   label stream by construction.
3. **Sealed predictions with registered FAIL branches** (PREDICTIONS.md +
   registration.json v22): the ensembles' honest FAILs (P-G2/b/c) and
   P-A11's FAIL-then-A12-mechanism arc show why — a FAIL priced in advance
   becomes the next mechanism, not a scandal.
4. **Byte-identity over numerical tolerance** (integer micro-units,
   epoch-quantised SGD, canonical JSON): the twin law (P-W2a) turns
   "JS and Python agree" from an approximation into a checkable equality,
   which is what makes the determinism crown auditable by a stranger.
5. **Budget cap as a registered constant with pricing** (A13/M4/M10): the
   cap 32 was DERIVED from the shipped default's own measured escalate load,
   not chosen — new constants arrive with their pricing note or not at all.
6. **Escalation as growth** (teacher answers appended as observations): the
   hosted JEV becomes the labeling organ of the living model, so uncertainty
   is metabolized into training signal instead of being hidden from the user.
