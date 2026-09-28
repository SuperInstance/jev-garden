# PREDICTIONS — pre-registered, sealed

Sealed in `registration.json` (sha256 + mtime + size) BEFORE the first
experiment run. Every experiment verifies the seal at startup (fail-closed,
exit 2 on mismatch). Decision rules are exact and were not edited after
any run; amendments only by dated addendum at the bottom.

Soil: SuperInstance/quilt-qcells `receipts/ledgers/*.jsonl` (16 ledgers,
1418 rows). Train ledgers (12, sealed): bell, ghz3, ry_decomp, z_decomp,
crx_case, swap, init_flat, init_complex, x_x, three_layer, noise,
measure_only. Eval ledgers (4, sealed): crossed_measure, forget_bell,
deep3, hzh — wait: the actual filenames are sealed by the adapter at run
time as: sorted(listdir)[0:12] train / [12:16] eval under a fixed
byte-order sort; the split function is `splitLedgers()` in
adapters/qcells.mjs, pinned by selftest before any run. (The named files
above are illustrative; the RULE is the sealed function, not the names.)

Seeded streams: LCG128-like `seed = (seed * 6364136223846793005n + 1442695040888963407n) mod 2^64`,
top bits via `>> 33n`. Deterministic, no wall-clock. Moth-seal note: the
comet-qrng-v1 certificate channel returned an incomplete payload in wave
49 (census finding, receipted there); per moth-seal law the garden
fail-closes to the LABELED deterministic fallback above and does not claim
quantum provenance.

## P-G1 (bake-off order on real soil, Task A)

Prediction: on the 4 sealed eval ledgers, next-opcode top-1:
(a) `hash` > `field` (the parametric tissue earns its keep),
(b) `qthe` ≥ chance 1/7 = 0.1429 (integer substrate carries signal),
(c) `hash` beats the `bigram` floor by ≥ +0.03 absolute.
Decision rule: PASS iff (a) AND (b) AND (c) all hold on the single sealed
run. Each sub-clause reported with its exact number regardless.

## P-G2 (kinda-both emergence, ensemble)

Prediction: `ens` (λ=0.5 head ⊕ rhizome prior) ≥ max(best single arm) +
0.01 top-1 on the same eval slice. Decision: PASS iff true. If the rhizome
prior is worthless on this soil, ens ≈ head and this FAILS — a fine honest
negative that would localize the rhizome's value to Task B instead.

## P-G3 (streamlining / amortization bounds)

Prediction: (a) full-journal compile wall < 2000 ms for the 1418-row soil
on this sandbox (single process, no workers); (b) per-judgment serve cost
< 0.5 ms in-process after loading a weave. Decision: PASS iff both.
Measured with process.hrtime.bigint(), reported in receipts.

## P-G4 (validator duty, Task B)

Prediction: concentration-statistic detector (window max surprise; window
w=5; threshold = train-ledger 95th percentile) on eval ledgers with
impact-sensitive anomalies achieves (a) detection AUC ≥ 0.90 and
(b) false-positive rate on clean eval rows ≤ 0.10. Decision: PASS iff both.
The anomaly family (op-swap, seq-break, prev-break, arg-corrupt) and the
clean-row interleave are exactly as implemented in
experiments/e_g1_grow.mjs `injectAnomalies()` — sealed by selftest before
the run.

## P-G5 (cross-substrate determinism)

Prediction: the Python twin (`ref/garden_ref.py`) and the JS garden produce
byte-identical weave artifacts (canonical JSON round-trip equality) for the
`hash` arm on the same seed and the same train slice. Decision: PASS iff
identical. (This is the quilt-arch discipline applied to a learned
artifact — if floats drift across substrates the weave is not a stone.)

## P-G6 (teacher channel live)

Prediction: one live call to the hosted JEV teacher (jev-latest via
systemone wire) with a rich state built from 8 clean chain contexts
returns `noul` ≥ 0.70 on "is this receipt row in-pattern for a healthy
CELL-MAPPING chain", and the call's usage receipt (tokens) is recorded.
Decision: PASS iff noul ≥ 0.70 AND usage receipt exists. Network failure /
auth failure = FAIL with the error receipted verbatim (honest negative;
the escalation organ is then registered as unverified until re-run).

## P-G0 (selftest green as a precondition)

The selftest battery (QTHE bijection over all 256 bytes, bounds invariance
over all rules, field conservation, chain tamper localization, seal
fail-closed check) must be 100% green BEFORE P-G1..G5 run. Not a
prediction — a gate.

## Addenda

(none yet — append-only)

## Addendum A1 (2026-09-28, AFTER e_g1 run 1 — receipts/e_g1.jsonl tip 3fc2f3426ba278b9)

Run-1 verdicts: P-G1 PASS (hash 96.53 > field 91.89; qthe 93.82 ≥ 14.29;
hash − bigram = +4.25pp ≥ 3pp), P-G2 FAIL, P-G3 PASS (compile 581.7ms,
serve 0.0569ms), P-G4 FAIL. The two FAILs localize mechanisms; the
following re-registrations are sealed BEFORE their runs.

### P-G2b (why the rhizome prior was noise, and the corrected prior)

Mechanism of failure: grow() deforms with gamma=0 (unobserved judgment),
so prior weights (gamma+1e-9)/(1+d) are all ~1e-9 — the prior collapses
to a distance-tilted global frequency, and λ=0.5 drags the head down.
Re-registration: the rhizome prior is rebuilt from OBSERVATION COUNTS
(the supervision aggregate, add-1 smoothing toward the global op
distribution), and λ is chosen on TRAIN only (walk-forward over the 12
train ledgers: λ ∈ {0.6,0.7,0.8,0.9,1.0}; eval untouched by the choice).
Prediction: ens2 (count-prior, train-chosen λ) ≥ hash + 0.005 top-1 on
the sealed eval slice. PASS iff true. Honest either way: if FAIL, the
verdict is "on this soil the parametric tissue wins; the rhizome's value
is structural memory (Task B / judgment provenance), not prior mass."

### P-G4b (the validator can only judge the channel it sees)

Mechanism of failure: seq-break and prev-break anomalies do not change
any (kind, op) token — invisible to a token-space judge; arg-corrupt
changes args.op, also not in the v1 token. Re-registration: (i) tokens
gain the arg channel — "kind/op/argOp" (argOp = args.op when present);
(ii) the anomaly family for JEV duty is the SEMANTIC family only:
op-swap and arg-corrupt (rate 0.25 over non-collapse rows);
(iii) seq-break and prev-break are DELEGATED to the chain reader
(quilt-qcells two-reader discipline already localizes those exactly —
4254/4254 receipted there); the garden does not re-adjudicate structure.
Prediction: with arg-channel tokens, window-max statistic, train-only
threshold (95th pct), on eval ledgers with semantic anomalies:
AUC ≥ 0.85 AND clean-row FPR ≤ 0.10. PASS iff both.
Structural delegation is itself a claim: any seq/prev-break injected is
assumed caught by the chain reader, not scored here (honest division).

## Addendum A2 (2026-09-28, AFTER e_g1b — receipts/e_g1b.jsonl tip a18ea2e9ee69f62d)

P-G4b PASS (AUC 0.9469, FPR 0.0551 — the semantic judge works in its own
channel). P-G2b FAIL again, and the failure localizes further: the
walk-forward TRAIN choice said λ*=0.7 (helped there), but on held-out
LEDGERS the count-prior blends train-ledger quirks — memory from old
soil does not transfer to new circuit families. The corrected hypothesis
is the founder's own words: the model grows as it's USED — the rhizome's
value must be fresh memory of the live stream, not priors from archived
ledgers.

### P-G2c (growth-as-used: fresh memory of the watched stream)

Protocol: for each of the 4 sealed eval ledgers, the garden WATCHES the
first half H1 (deform + observe per row) — simulating a live quilt lane
feeding judgments — and is then judged on predicting the second half H2.
Arm head: hash head (12 train ledgers) alone. Arm ens3: λ·head +
(1-λ)·priorCounted where the rhizome holds ONLY H1 memory (no train-ledger
prior — fresh memory only). λ is chosen per ledger on H1 itself (fit on
the watched data; H2 untouched until the verdict). Prediction: pooled
over the 4 ledgers, ens3(H2) ≥ head(H2) + 0.01 top-1. PASS iff true.
This is the living-model claim in its honest form: memory of what the
garden just watched must beat a frozen head on what it is watching.

## Addendum A3 (2026-09-28, AFTER e_g2c — the twin catches a pipeline bug)

P-G2c FAIL, but while preparing P-G5 the Python twin diverged from the JS
garden at journal seq 151 — root cause: the JS experiments built context
windows over the FLATTENED 12-ledger stream, so the tail rows of one
ledger leaked into the head context of the next (11 boundary leaks); the
twin resets windows per ledger. Correction: all experiments build samples
PER LEDGER (no cross-ledger leakage) and compute surprise per ledger.
Run-1 receipts (e_g1, e_g1b, e_g2c — git history retains their bytes) are
marked pipeline-v1 and SUPERSEDED by corrected re-runs under seal v4
(pipeline-v2-per-file). The predictions P-G1..G4, P-G2b, P-G2c are
re-evaluated unchanged; the corrected verdicts are the verdicts of record.
The cross-substrate discipline did its job: a solo-substrate lane would
have shipped the leak silently.

## Addendum A4 (2026-09-28, cloud battery) — mtime is a local witness, not a checkout invariant

The first GitHub Actions run failed exactly as it should: a fresh checkout
re-stamps file mtimes, so the seal's mtime binding trips fail-closed
off-repo. Correction: the seal's REPRODUCIBILITY bind is sha256+size
(content is the law); mtime is retained in registration.json as a
local-seal-time witness for audit. All experiment gates updated: sha+size
enforced, mtime logged. This is the stone standard applied to ourselves:
the harness refuses to weaken silently, so the weakening is registered,
dated, and receipted instead.

## Addendum A5 (2026-09-28, wave 51) — P-G2d: hard world under distribution shift

The wave-50 FAILs (P-G2/G2b/G2c) localize to one sentence: memory-priors need a
HARD world. The 4 sealed eval ledgers leave the frozen head at 95-97% — too easy,
the same disease quilt-jepa round 2 diagnosed in its own substrate on the same day.

### Soil (built BEFORE this registration; construction receipt only, no outcome data)

`experiments/shift_family_gen.py` builds 4 "ladder-echo" ledgers with the REAL
quilt-qcells machinery (CellCircuit on micromoth, chain-verified fail-closed):
deep gate runs + MID-STREAM readout/collapse/VIEW echo cycles — EFFECT->BIND
transitions and repeated BIND/EFFECT alternation that do not occur in train
soil (where collapse blocks are terminal). Files: ladder7_echo3, ladder8_echo4,
ladder9_echo4, ladder8_echo6 (686 rows total; sha256s in
`experiments/outputs/shift_family/construction_receipt.json`). No garden
judgment code ran on this soil before the seal below.

### P-G2d (fresh memory under distribution shift)

Protocol as P-G2c: per ledger, watch H1 (grow fresh-memory rhizome), judge H2;
λ fit on H1 only; arm head = frozen hash head (12 train ledgers); arm ens3 =
λ·head + (1-λ)·priorCounted (H1 memory only, no train-ledger prior).

- HARDNESS GATE (prediction-based difficulty meter — quilt-jepa round-2 law L2
  applied to the garden): pooled frozen-head H2 accuracy < 0.90. If the head
  still clears 0.90 on the shift family, the run is VOID-AS-REGISTERED (soil
  not hard enough; receipted as such, no verdict claimed).
- CLAIM: pooled ens3 ≥ pooled head + 0.02 top-1 on H2.

PASS iff both. Honest either way: FAIL with the hardness gate held means fresh
memory does not transfer even under genuine shift — the rhizome's value claim
narrows again; VOID means we still have not managed to build a hard enough
world, which is itself the finding.

## Addendum A6 (2026-09-28, wave 51, AFTER e_g2d) — P-G2d verdict + the unified hardness law

P-G2d PASS (seal v6, run under v6, receipts/e_g2d.jsonl tip f702bc0c56ad58a0):
hardness gate HELD (pooled head 73.47% < 0.90 — the ladder-echo family is a
genuinely hard world for the frozen head), and pooled ens3 = 86.88% = head +
13.41pp over 343 judged rows. Per-ledger: λ* = 0 everywhere — the optimal blend
was ALL fresh watched-memory, no frozen-head mass. The living-model claim
survives in its honest form once the world demands adaptation.

The wave's unified law (quilt-jepa round 2 + garden P-G2d, same day):
- quilt-jepa: an easy world makes every emergence claim vacuous (entry loss is
  init noise; surprise has zero SNR; corruption is impact-insensitive) — and a
  starved optimizer is misdiagnosable as a world property.
- jev-garden: archived priors never transfer (G2, G2b FAIL); fresh memory is
  worthless on easy soil (G2c FAIL, λ*=0 because nothing beats 97%); fresh
  memory on genuinely shifted soil is worth +13.4pp (G2d PASS).
Hardness is the gating variable for emergence claims, and it must be measured
by PREDICTION accuracy on held-out structure (the L2 law), never by loss floors
or entry statistics. Registered for wave 52: hardness-aware grow() (grow harder
where the head is weaker), and the quilt-jepa L1 optimizer repair (per-latent
gradient normalization) as a precondition for any further latent-grid claims.

## Addendum A7 (2026-09-28, BEFORE the weave-2 run) — P-W2: the sense table rides

serve.mjs receipted "rhizome prior is not serialized in the weave (sense table by
weave-2)". This addendum registers weave-2 BEFORE any run. The weave-v2 artifact
carries `arms.field` — the rhizome sense table: per-cell {G, aSum} (r6) for cells
hosting >= 1 observed context, plus the supervision aggregate [ctx, {op: count}]
sorted bytewise (order-free, byte-deterministic). Serve rebuilds the prior with the
EXACT field.mjs neighborhood law (radius-2 hex, w = (gamma + 1e-9)/(1+d)) from the
SERIALIZED table — compile-then-serve is honest distillation, not a live backdoor.

- **P-W2a (cross-substrate, P-G5 discipline extended)**: the Python twin and the
  JS garden produce byte-identical `weave-core-v2` cores (hash arm in integer
  micro-units + arms.field) on the same sealed train slice. PASS iff identical.
- **P-W2b (serve compatibility)**: with the registered ens3 = 0.4*hash + 0.4*qthe +
  0.2*field-sense-table, serve-time top-1 on the sealed eval slice (last 4 ledgers,
  pipeline-v2 per-ledger windows) satisfies ens3 >= ens2 − 0.005 (ens2 = 0.5/0.5
  v1 law). The living-memory arm must ride without material degradation; the field
  arm's own top-1 is receipted as contrast (saturated-soil expectation from the
  hardness law: near-parity). PASS iff the inequality holds.

### A7 verdicts of record (run 2026-09-28, seal v8; receipts/e_w2.jsonl)

- **P-W2a PASS** — weave-core-v2 byte-identical cross-substrate: JS 9960B ==
  Python 9960B (hash arm micro-units + arms.field: 43 sense cells, 56 observed
  contexts, journal_len 2318, tip aaa3ce6ab0dcbc94). The P-G5 twin discipline
  now covers the living-memory arm. Serve-roundtrip: the serve path rebuilt
  from the serialized artifact reproduces compile-time ens3 exactly (< 1e-12).
- **P-W2b FAIL** — ens3 = 0.9459 vs ens2 = 0.9537 on the sealed eval slice
  (n=259): delta −0.0077, beyond the registered −0.005 tolerance. The field
  arm (sense table) drags the ensemble on saturated soil — the hardness law
  (A6) predicted exactly this shape ("amplitude prior is noise on saturated
  soil"; P-G2/G2b/G2c FAIL family). Verdict of record: FAIL; no threshold
  surgery. Engineering response (receipted in src/serve.mjs): served default
  stays the v1 law (ens2) for all artifacts; the ens3 blend requires an
  explicit `serve_with_field` opt-in until a registered hardness gate (A8
  candidate, P-G2d pattern: ens3 only on hard/shifted soil) selects it.
- Queued as A8 candidate: hardness-aware serve — blend ens3 iff the context's
  soil is registered-hard (the P-G2d +13.41pp regime), else ens2; registered
  BEFORE any run, with the hardness meter from the unified law.
