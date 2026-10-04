# jev-garden — Developer Guide

## Code layout

| Path | What it is |
|---|---|
| `src/canon.mjs` | Canonical JSON + sha256 (the content-addressing basis for journals, seals, weave artifacts). |
| `src/field.mjs` | The rhizome: hex lattice (radius 4, 61 cells), `deform`/`observe` (observe is the ONLY collapse), hash-chained growth journal, amplitude-weighted `prior`/`priorCounted`/`senseTable`. ExoJ `ledger`-policy semantics vendored. |
| `src/features.mjs` | Substrate featurizers: qthe byte packing (τ:2 timbre × d:6 coordinate, integer split-channel LAYER 0: `y_R`, `y_I`), hashed n-grams (k=3 context, 2^11 buckets, L2-normalised). |
| `src/heads.mjs` | The vessel heads: `trainHash` (zero-dep SGD: lr 0.5, epochs 12, weight decay 1e-4, clip 5, deterministic init), qthe prototype nearest-match, bigram baseline, judge functions returning full probability tables. |
| `src/weaver.mjs` | The idle cambium: `grow` (journal → deformation stream), `weaveIfIdle`, `compileWeave` (v1/v2 chain-tipped artifacts), `promotionGate` (PROMOTE ≥ +0.02 / REVIEW band / DISCARD > −0.05 degradation), `evaluateArms`. |
| `src/serve.mjs` | The judge: `loadWeave` (fail-closed on schema/journal-tip), systemone wire (`noul`/`choice`/`score` + confidence), the registered branch order A7→A12→A10→A9→A8→v1, `ESCALATE_BELOW = 0.55`, A13 `makeEscalationBudget` (fail-closed counter organ, cap 32, arrival order, refusals counted with reason `budget_exhausted`). |
| `src/teacher.mjs` | The escalation organ: hosted JEV via typesafe.ai (`jev-latest`); the ONLY networked module; requires `TYPESAFE_API_KEY`; every call returns a usage receipt. |
| `src/sensetable.mjs` | The weave-2 living-memory arm: serialized rhizome sense table → serve-time prior (A7). |
| `adapters/qcells.mjs` | Real soil: `splitLedgers` (the sealed 12/4 rule: sorted listdir), `loadLedger`, `makeSamples` (context = previous k rows' kind/op, target = next op), impact-sensitive anomaly injection (semantic op swaps, seq/prev breaks, oracle-changing arg corruption), `windowMax` concentration statistic. |
| `ref/garden_ref.py` | The Python twin: reproduces the weave core byte-for-byte (integer micro-unit weights, epoch-quantised SGD); `--fresh` midpoint-twin mode. |
| `experiments/` | The sealed runs: G-line (`e_g1_grow` bake-off, `e_g1b`, `e_g2c`, `e_g2d`, `e_g5`, `e_g6` teacher), W-line (`e_w2` core-v2 twin + ens3), A-line (`e_a8_gate`, `e_a9_fresh`, `e_a10_fresh_everywhere`, `e_a11_real_lane`, `e_a12_fallback_aware`, `e_a13_budget_cap`); `shift_family_gen.py` (shift-soil generator); `outputs/` (summaries + weave artifacts). |
| `receipts/` | One hash-chained JSONL per experiment — the verdicts of record. |
| `tests/selftest.mjs` | 30 checks: QTHE bijection/bounds, conservation, tamper localization, fail-closed seal verification, splitLedgers pin, rowSurprise/windowMax exports. |
| `smoke.mjs` | 9 checks, synthetic two-family soil: weave promoted, wire speaks, escalation gate present, growth journal verifies, field stays open, observations are the only collapses, sense conservation, 7 CELL-MAPPING opcodes. |
| `docs/DESIGN.md` | The charter (tissues, integration map, fail-closed discipline, context→lattice mapping). |
| `docs/PREDICTIONS.md` | The sealed predictions + exact decision rules + registered FAIL branches (1679 lines, 109161 bytes at seal v22). |
| `registration.json` | The seal: sha256+size of PREDICTIONS.md and DESIGN.md, v22, append-only `seal_history` (22 versions with per-addendum notes). |
| `scouts/` | Receipted living-JEV research (report + raw JSON). |
| `.github/workflows/` | `forge.yml` (reusable fleet workflow, `test-cmd: node tests/selftest.mjs`) and `garden.yml` (garden-battery: clones quilt-qcells, runs selftest/smoke/G-line/A8/A9; push trigger currently broken — see gotchas). |

## Core concepts

- **Rhizome** — non-parametric memory as an ExoJ field. Judgments append soft
  deformations to the cell indexed by `fnv1a-64(context) % 61` (DESIGN §4,
  pre-registered); observed outcomes call `observe()` — the only collapse,
  therefore the only supervision. The journal is append-only and hash-chained.
- **Vessel heads** — parametric tissue trained by the weaver over the sealed
  train slice; deterministic, integer-serializable (micro-units), no torch.
- **Weave artifact** — the compiled organism state (`jev-garden/weave-v1|v2`):
  feature tables, head weights, (v2) rhizome sense table, the journal tip it
  was compiled from. Serve refuses artifacts whose tip does not match the
  growth journal.
- **Promotion gate** — the jeviter lifecycle applied to heads: PROMOTE iff
  eval top-1 improves ≥ +0.02 absolute with no slice degrading > 0.05;
  otherwise REVIEW or DISCARD, always receipted.
- **Seal discipline** — `registration.json` binds the prediction/design docs
  (sha256 + size, mtime as witness); every experiment verifies at startup
  (exit 2 on mismatch); amendments are dated addenda producing a new seal
  version, never edits of sealed text.
- **The A-line serve laws** — A7 (sense table in weave), A8 (hardness-gated
  blend), A9 (fresh-memory opt-in), A10 (fresh-everywhere trial), A11 (honest
  FAIL that priced the mechanism), A12 (fallback-aware everywhere; the
  exact-ctx membership test, not a threshold), A13 (escalation budget cap 32,
  arrival order). Branch order in serve is A7→A12→A10→A9→A8→v1 — strictest-
  freshest wins.

## How to extend

### Add a prediction (the only sanctioned way to change behavior)

1. Append a dated addendum to `docs/PREDICTIONS.md` (bottom, never edit
   sealed text): the prediction, the exact decision rule, the honest-FAIL
   branch, and the pricing note for any new constant (the M4 law: a new
   constant must ship WITH its registered pricing; A13's cap 32 is the model —
   derived from the A12 receipt, not invented).
2. Respawn the seal: bump `registration.json` (`predictions.v`, new sha256 +
   size, append the addendum note to `seal_history`).
3. Write the experiment runner following `experiments/e_a13_budget_cap.mjs`:
   seal gate first (exit 2 on mismatch), pins derived from prior receipts
   (A13 refuses if the A12 pins moved), verdicts computed from telemetry only.
4. Run, commit receipts + summary. The commit is the timestamp.

### Add a substrate (arm)

1. Featurizer in `src/features.mjs`, judge function in `src/heads.mjs`
   returning a full probability table over the 7 opcodes.
2. Register the arm in `evaluateArms` (`src/weaver.mjs`) and in the bake-off
   driver; add a PREDICTIONS addendum if the arm's competitiveness is a claim.
3. If the arm is learned, keep it deterministic: seeded init, quantised
   serialization (integer micro-units), and update BOTH the JS weaver and
   `ref/garden_ref.py` in the same change — then re-verify the twin with
   `node experiments/e_w2.mjs` (P-W2a must PASS byte-identical).

### Serve a new mode (an A-line pattern)

Copy the A12 pattern exactly: opt-in flag under `artifact.hyper`, ZERO new
constants (selectors are membership tests, not thresholds), a registered
branch order slot, default behavior byte-identical when the flag is absent,
and a driver proving default-identity (A12: "default byte-identical with the
flag ABSENT, 0 mismatches over the 1418 walk"). Serve `loadWeave` loads the
flag; the branch order slot decides precedence.

### Touch the escalation organ

A13 owns it. `makeEscalationBudget` is fail-closed: non-integer/negative caps
throw at construction, refusals are counted (never swallowed), the organ rides
OUTSIDE the served bytes (`judge()` untouched). The cap value itself is a
registered constant — changing it is a new registration with its own pricing
note, not an edit.

## Testing

```bash
node smoke.mjs             # 9 checks, synthetic soil, no network, no sister repo needed
node tests/selftest.mjs    # 30 checks; fail-closed seal verification included
```

Real-soil batteries (require `../../quilt-qcells`; these are what CI runs):

```bash
node experiments/e_g1_grow.mjs       # P-G1 PASS / P-G2 FAIL / P-G3 PASS / P-G4 PASS
node experiments/e_g1b_addendum.mjs
node experiments/e_g2c_growth.mjs
node experiments/e_w2.mjs            # P-W2a PASS (twin), P-W2b FAIL (ens3) — both are verdicts of record
node experiments/e_a8_gate.mjs
node experiments/e_a9_fresh.mjs
```

"Green" means: every pre-registered clause reports its exact number, PASS and
FAIL alike land as receipted verdicts, the twin is byte-identical (e_w2), and
the seal gates refuse tampering. CI: `forge.yml` runs selftest on push;
`garden.yml` (garden-battery) clones quilt-qcells and runs the fuller battery
on `workflow_dispatch` — its push trigger is currently broken
(`branches: ain]`), receipted in ONBOARDING.

## Conventions

- **Verdicts live in receipts, not prose.** README tables cite the receipt of
  record; never update a verdict in the README without the receipt behind it.
- **Determinism crown.** No wall-clock inside artifacts; canonical JSON;
  seeded LCG streams (`seed = (seed*6364136223846793005n + 1442695040888963407n) mod 2^64`,
  top bits `>> 33n`); timings live in summary files OUTSIDE the chain.
- **Honest negatives are crown jewels** — P-G2/b/c, P-W2b, P-A11 stay
  FAIL-of-record in receipts and README tables; do not "repair" them.
- **Spend receipts.** Every teacher call records tokens/latency; registrations
  carry their own M4 spend cap headers.
- **No package.json, no dependencies.** `node:` builtins only; Python twin is
  stdlib-only.
- **Commit style** (from history): lane-prefixed subjects with dense
  verdict-laden bodies ("a12 (58-a): results — P-A12 PASS 4/4 (…)"). The body
  IS the receipt narrative; the registration/results split is one commit each.

## Gotchas for editors

- **Editing `docs/PREDICTIONS.md` or `docs/DESIGN.md` without a reseal**
  bricks every experiment (exit 2). The reseal is an append-only act with a
  note in `seal_history` — see registration.json's own notes for the two
  historical hand-reseal incidents (v9/v10).
- **The twin must move with the weaver.** Any change to head training or
  serialization that is not mirrored in `ref/garden_ref.py` breaks P-W2a.
  This is exactly how e_g5 went stale — the twin evolved (5450→9960 bytes)
  and e_g5 was not retired or re-registered.
- **`adapters/qcells.mjs`'s split is load-bearing.** `splitLedgers` (sorted
  listdir 12/4) is pinned by selftest BEFORE any run; "improving" it invalidates
  every receipt of record.
- **Seal stamps vs measured bytes.** Receipt rows carry `seal_v`; reruns
  reproduce measured bytes but stamps/row_hashes move. The A-line's
  "stamp-class strip" audit discipline exists for this; do not treat a stamp
  diff as tampering, and do not commit an accidental rerun's receipt (restore
  with `git checkout --`).
- **`garden.yml`'s push trigger is broken** (`branches: ain]`). Fix it as
  `[main]` if you touch the workflow — but say so in the commit, because the
  battery's push-trigger silence was receipted in wave-69 docs.
- **Two key spellings live in the fleet**: this repo uses
  `TYPESAFE_API_KEY`; exoj uses `TYPESAFEAI_KEY`/`TYPESAFE_KEY`. Do not
  "normalize" either without checking both consumers.
