# jev-garden — Agent Onboarding
> Zero-shot entry point. Clone → competent in ~10 minutes.

## Identity (2 sentences)

jev-garden is the fleet's **living JEV training system** — "a garden, not a
factory": a JEV (Joint Embedding Validator) that is *kinda both* a
non-parametric rhizome (an ExoJ-compatible non-collapsing field that deforms
with every judgment) and a parametric vessel head (tiny deterministic SGD, no
torch), grown from the receipt streams the quilt actually judges. An idle-time
weaver compiles the accumulated field into versioned, chain-tipped **weave
artifacts**, and the served artifact speaks the TypeSafe `systemone` wire so
any quilt lane can swap the hosted JEV for the garden without protocol changes.

## Why it exists (the fleet problem it solves)

The founder's directive (journal Task 50): build the ultimate JEV training
system, quilt-native, that grows as it is used and idle-compiles its exoj into
a more utile tool — beyond the pincher's fixed instincts. The garden answers
with an organism: judgments are soft deformations (growth), explicit
observations are the only collapses (supervision), the weaver promotes or
DISCARDs heads by a sealed promotion gate (jeviter lifecycle vocabulary), and
every claim is pre-registered with a sha256+mtime+size seal
(`registration.json`, v22 with an append-only 22-version seal history) that
experiments verify at startup and refuse to run without (exit 2). Built in
wave-50 (50-b), extended by the A-line (A7 sense tables → A13 escalation
budget cap), decomposed into the wave-66 atlas (Task 66-b).

## Verify it works (exact commands)

Executed against this tree in wave-69; all green. Node ≥ 18, **zero npm
dependencies** (no package.json — run with `node` directly), no network at
test time.

```bash
node smoke.mjs               # 9 passed, 0 failed — one tiny garden end-to-end on synthetic soil
node tests/selftest.mjs      # 30 passed, 0 failed — QTHE bijection/bounds, conservation,
                             #   tamper localization, fail-closed seal verification
```

Experiments on the REAL soil (the sister repo `quilt-qcells` must exist at
`../../quilt-qcells` relative to this checkout — its 16 ledgers / 1418 rows
are the garden's judgment duty; CI clones it fresh):

```bash
node experiments/e_g1_grow.mjs        # the bake-off: P-G1 PASS, P-G2 FAIL, P-G3 PASS, P-G4 PASS (reproduced wave-69)
node experiments/e_w2.mjs             # the CURRENT cross-substrate twin law: P-W2a PASS (JS 9960B == PY 9960B)
```

Two honest warnings the docs must not hide:

- `node experiments/e_g5_determinism.mjs` is **stale**: its committed receipt
  of record says P-G5 PASS 5450/5450 (wave-50 era), but a re-run today prints
  FAIL (JS 5450B vs PY 9960B) because the Python twin evolved to the
  weave-core-v2 shape measured by `e_w2`. The current byte-identity contract
  is `e_w2`'s, per the A12/A13 receipts; `garden.yml` still calls e_g5 (it
  exits 0 either way — "verdict printed; honest either way").
- Experiments write their receipts in place (`receipts/*.jsonl`, summary
  JSONs). A rerun regenerates them; measured bytes are identical but seal
  stamps/timings move — restore with `git checkout --` if you only meant to
  verify.

The teacher channel CANNOT run without credentials you will not have:

```bash
# src/teacher.mjs requires TYPESAFE_API_KEY (note: different name from exoj's
# TYPESAFEAI_KEY) and network access to api.typesafe.ai. Without it the channel
# fails closed. Proof it ran: receipts of record — README P-G6 row (noul 0.70,
# 589+21 tokens, 283 ms) and the A-line usage receipts. Tests never invoke it.
```

## Reading order (paths, not vibes)

1. `README.md` — the organism, the bake-off table, the wave-50 harvest
   verdicts of record (including the honest FAILs P-G2/b/c).
2. `docs/DESIGN.md` — the charter: tissues (rhizome / vessel heads / weaver /
   serve / judgment duty), integration map, fail-closed discipline, the
   pre-registered context→lattice mapping. Amendable only by dated addenda.
3. `docs/PREDICTIONS.md` — the sealed predictions with exact decision rules
   (P-G1…, A7…A13), plus the honest-FAIL branches registered in advance.
4. `registration.json` — the seal itself (v22) and the append-only
   seal_history (the provenance of every verdict).
5. `src/field.mjs` → `src/weaver.mjs` → `src/serve.mjs` — the organism's
   body: rhizome, idle compiler + promotion gate, systemone endpoint with the
   registered branch order A7→A12→A10→A9→A8→v1 and ESCALATE_BELOW 0.55.
6. `adapters/qcells.mjs` — the real soil adapter (windowMax concentration
   law, impact-sensitive anomaly injection, the sealed 12/4 ledger split).
7. `receipts/` — one JSONL per experiment; the verdicts live there, not in
   prose.

## The things that will bite you (gotchas)

- **No package.json.** There is no `npm test`; CI runs
  `node tests/selftest.mjs` (forge.yml) and the garden-battery workflow runs
  the batteries directly. Type `npm test` and you get ENOENT.
- **The seal gate is real.** Every experiment verifies
  `registration.json`'s sha256+size of `docs/PREDICTIONS.md` at startup and
  exits 2 on mismatch. Editing PREDICTIONS.md without a documented reseal
  (append-only, new version in seal_history) bricks the experiment suite.
- **Real-soil experiments need the sister repo.** `../../quilt-qcells/` must
  exist; the 12/4 train/eval split is `sorted(listdir)[0:12]/[12:16]` in
  `adapters/qcells.mjs` (the RULE is the pinned function, not ledger names).
- **The garden.yml push trigger is broken.** `branches: ain]` (line 9) is a
  mangled `[main]` — the filter matches no branch, so garden-battery only
  runs via `workflow_dispatch`. Finding receipted in wave-69 docs; fix is a
  one-character-class YAML edit.
- **e_g5 is stale (see above).** Do not "fix" it by editing the twin back —
  the twin's current contract is e_w2; either re-register e_g5 under a new
  seal or retire it deliberately.
- **Seal stamps move on rerun.** Receipts carry `seal_v` and row hashes;
  measured bytes are stable, stamps are not (the A12 "stamp-class strip"
  discipline exists because of this).
- **The teacher env var is TYPESAFE_API_KEY** — not TYPESAFEAI_KEY as in exoj.
  Two adjacent repos, two spellings; check the header of `src/teacher.mjs`.
- **Escalation is the growth organ, not an error path**: serve confidence
  < 0.55 routes to the hosted teacher and the teacher's answer is appended to
  the growth journal as an observed outcome. Suppressing escalation starves
  the garden.

## Where deeper knowledge lives

- Knowledge map: [docs/KNOWLEDGE-MAP.md](./KNOWLEDGE-MAP.md)
- Fleet journal: SuperInstance/superinstance-lab → worklog.md (grep
  'jev-garden'; Task IDs 50, 58-a, 61-a, 61, 63-f, 66-b touch this repo).
- `docs/PREDICTIONS.md` — every decision rule with its exact threshold and
  its registered FAIL branch.
- `receipts/e_*.jsonl` + `experiments/outputs/*_summary.json` — verdicts of
  record per experiment (hash-chained rows).
- `scouts/2026-09-28-living-jev-research.md` (+ raw/) — the receipted
  research that shaped the organism.
- Sister repos: `quilt-qcells` (soil), `exoj` (rhizome semantics vendored),
  `qthe` (substrate), `jeviter` (promotion vocabulary), `jev-quilt` (teacher
  wire), `quilt-jepa` (three design laws).

## Current frontier (what is open right now)

- **P-G2d (hard-world variant)** — memory-priors should pay where the head is
  weak; queued in the README (the G-line ran on saturated soil; e_g2d exists
  and its shift-soil verdict is receipted — the open item is the composition
  default question A12 left OPEN).
- **A12's open question** — the shift-soil composition default (whether
  fallback-aware should become the served default) was receipted OPEN and
  needs its own registration.
- **Teacher gain-side leg** — A13 priced the teacher's value-add leg as NOT
  pre-approved; a registration proposing it must cite the A13 receipt.
- **Codespace idle-compile lane** — the fleet-level weaver (weave in a
  codespace, receipted in wave-50 50-c) is wired but the standing cadence is
  not automated beyond the garden-battery workflow.
