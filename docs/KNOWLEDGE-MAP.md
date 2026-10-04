# jev-garden — Knowledge Map
> The index of indexes. Everything deeper than this doc set, with one line each.

## In this repo

- `src/field.mjs` — the rhizome: 61-cell hex lattice, deform/observe (observe
  = only collapse), hash-chained growth journal, amplitude-weighted priors,
  sense tables.
- `src/features.mjs` + `src/heads.mjs` — the vessel tissue: qthe byte packing
  (τ:2 × d:6 integer split-channel + wormhole 0.3), hashed n-grams (k=3,
  2048 buckets), the zero-dep SGD head, bigram floor, judge functions.
- `src/weaver.mjs` — idle compiler: `grow`, `weaveIfIdle`, `compileWeave`
  (v1/v2), `promotionGate` (+0.02/−0.05 economics), `evaluateArms`.
- `src/serve.mjs` — the judge: fail-closed `loadWeave`, systemone wire,
  branch order A7→A12→A10→A9→A8→v1, ESCALATE_BELOW 0.55, A13
  `makeEscalationBudget` (cap 32, arrival order, counted refusals).
- `src/teacher.mjs` — the ONLY networked module (typesafe.ai, jev-latest,
  TYPESAFE_API_KEY); usage receipts per call.
- `src/sensetable.mjs` — weave-2 living-memory arm (A7).
- `src/canon.mjs` — canonical JSON + sha256 (journals, seals, artifacts).
- `adapters/qcells.mjs` — real-soil adapter: sealed 12/4 `splitLedgers`,
  `makeSamples`, impact-sensitive anomaly injection, `windowMax`
  concentration statistic.
- `ref/garden_ref.py` — the Python twin (byte-identical weave core;
  `--fresh` midpoint-twin mode).
- `experiments/` — G-line (bake-off `e_g1_grow`, `e_g1b`, `e_g2c`,
  `e_g2d`, stale `e_g5`, teacher `e_g6`), W-line (`e_w2` core-v2 twin + ens3),
  A-line (`e_a8`…`e_a13`); `shift_family_gen.py`; `outputs/` (summaries +
  weave artifacts + replication JSONs).
- `receipts/` — 13 hash-chained JSONL verdict ledgers (e_g1…e_w2, e_a8…e_a13).
- `tests/selftest.mjs` — 30 checks (QTHE bijection/bounds, conservation,
  tamper localization, fail-closed seals, split pin).
- `smoke.mjs` — 9 checks on synthetic two-family soil.
- `registration.json` — the seal (v22) + append-only 22-version
  `seal_history` (per-addendum provenance notes).
- `docs/DESIGN.md` — the organism charter (tissues, integration map,
  fail-closed discipline, pre-registered context→lattice mapping).
- `docs/PREDICTIONS.md` — the sealed predictions: P-G1…P-G6 (+b/c/d),
  P-W2, P-A7…P-A13, with exact decision rules and registered FAIL branches.
- `scouts/` — `2026-09-28-living-jev-research.md` + `raw/` receipted research.
- `.github/workflows/` — `forge.yml` (selftest on push) + `garden.yml`
  (garden-battery; push trigger broken: `branches: ain]`).

## Pre-existing docs (before wave-69)

- `README.md` — the organism, the bake-off arms table, the wave-50 harvest
  verdict table (PASS and FAIL of record), doctrine, run commands.
- `docs/DESIGN.md` — charter with the honest interpretation register (what
  the founder's directive meant, sourced from fleet repos).
- `docs/PREDICTIONS.md` — 1679 lines of sealed predictions and addenda;
  includes the moth-seal fallback note (wave-49 census) and the
  mtime-ns-precision reseal lesson.
- `registration.json` — machine-readable seal + history (also documentation:
  its notes narrate every addendum).
- `scouts/2026-09-28-living-jev-research.md` — the research receipt that
  preceded the build.

## In the fleet

- `exoj` — upstream: rhizome semantics vendored from exoj/core.mjs (`ledger`
  policy); the garden is the first large consumer of ExoJ's field law.
- `quilt-qcells` — soil + first served customer: 16 CELL-MAPPING ledgers,
  1418 rows, 7 opcodes; cloned fresh by CI.
- `qthe` — upstream substrate: SPEC facts 1–3 implemented exactly
  (integer split-channel), exhaustively tested.
- `jeviter` — upstream vocabulary: PROMOTE / REVIEW / DISCARD lifecycle used
  by the promotion gate.
- `jev-quilt` — upstream wire: systemone shape + the hosted JEV (jev-latest)
  as the labeling organ.
- `quilt-jepa` — upstream design laws: hard world, concentration statistic
  (windowMax, not window mean), impact-sensitive corruption.
- `quilt-pincher` — the thing the garden goes beyond (fixed instincts).
- `quilt-codespace` + codespace-worker — the fleet idle-compute harness
  (weave in a codespace; wave-50 50-c receipted).
- `fleet-seeds` — the intake lane that chartered the wave (Task 50 directive)
  and the pre-registration primitive lineage (`docs/PREREGISTER.md` cites
  the garden's seal as census input #2).
- `MicroMoth-quilt` — upstream of qcells; the judgment target family.
- `quilt-arch` — cross-substrate determinism discipline (the twin law's home
  standard).

## In the journal (SuperInstance/superinstance-lab → worklog.md, grep 'jev-garden')

- **Task 50** (wave-50 seal, keeper) — the directive and the build wave:
  50-b built the garden (rhizome/substrates/weaver/serve/teacher/adapter,
  charter + PREDICTIONS sealed before runs, pushed cda7c09 → c2faea6);
  50-c receipted the codespace lane (repo-scoped endpoint works; the
  garden-battery workflow born there; the ssh path blocked and receipted).
- **Task 58-a** — A12: fallback-aware everywhere (registration commit 244b9cc
  seal v19 → results commit b4589fd, P-A12 PASS 4/4; the A11 damage channel
  closed; branch order registered).
- **Task 61-a** — A13: found the prior incarnation's registration (seal v21,
  M10+M4 budget-cap header), resumed the interrupted results stage per the
  resume-first law, re-sealed v22 with receipt-of-record provenance; P-A13
  PASS 4/4 (the cap BINDS: 32 granted / 96 refused, arrival order, zero
  degradation).
- **Task 61** (keeper) — carried the A13 lane in the wave-61 queue.
- **Task 63-f** — wave-63 entry touching the repo.
- **Task 66-b** — the wave-66 decomposition: studied the garden line-by-line
  (field/weaver/serve/adapter evidence cited per part), dog-fed it headless
  (selftest 30/30 + smoke 9/9 PASS at d05e1d9, teacher never invoked), and
  wrote its 26-part decomposition into the atlas (honest P-G2/b/c FAILs kept
  as failure_modes).

## Receipts of record

- `receipts/e_g1.jsonl` — the bake-off verdicts (P-G1 PASS hash 96.14% >
  field 89.58%, qthe 92.66% ≥ chance 14.29%, hash−bigram +3.09pp; P-G2 FAIL
  ens 91.51%; P-G3 PASS compile/serve budgets; P-G4 PASS AUC 0.9294 /
  FPR 0.0353) + `experiments/outputs/e_g1_summary.json`.
- `receipts/e_w2.jsonl` — the CURRENT twin law (P-W2a PASS 9960B==9960B,
  artifact_sha256 1bbc4fa7…; P-W2b FAIL ens3 −0.0077) — superseded-contract
  evidence for stale e_g5.
- `receipts/e_g5.jsonl` — the wave-50-era PASS (5450/5450) retained as the
  historical receipt; the runner now diverges from it (documented).
- `receipts/e_g6.jsonl` — the teacher channel receipt (P-G6 PASS: noul 0.70,
  589+21 tokens, 283 ms).
- `receipts/e_a12.jsonl` + `e_a13.jsonl` — the A-line mechanism receipts
  (fallback-aware dominance; cap BINDS with exact counters).
- `registration.json` — the seal chain itself: 22 versions, each binding the
  exact PREDICTIONS.md bytes a verdict ran under.
- `experiments/outputs/e_g2d_replication_wave53.json` — the shift-soil
  replication artifact.

## How to search further

```bash
grep -rn "jev-garden" /home/z/my-project/worklog.md     # journal mentions (Task IDs above)
grep -rn "ESCALATE_BELOW\|escalate_max_per_walk" src/ docs/   # the escalation law sites
grep -l "verdict" receipts/*.jsonl                      # every verdict ledger
node -e "const r=require('./registration.json'); console.log(r.predictions.v, r.seal_history.length)"
rg -n "P-A1[0-3]|P-G[0-9]|P-W2" docs/PREDICTIONS.md | head -30   # the prediction index
node experiments/e_w2.mjs 2>&1 | tail -6                # live twin check (rewrites its receipt)
```
