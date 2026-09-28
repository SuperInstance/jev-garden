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

## Addendum A8 (2026-09-28, BEFORE the A8 run) — P-A8: the hardness-gated serve blend

A7 queued A8: "blend ens3 iff the context's soil is registered-hard (the
P-G2d +13.41pp regime), else ens2; registered BEFORE any run, with the
hardness meter from the unified law." This addendum registers the rule and
the prediction set. Runs execute under seal v10.

### The registered gate (serve law for weave-v2 artifacts carrying arms.field)

Saturation signal — the only per-context hardness proxy that exists at serve
time, where no labels are available: s(context) = top.p(ens2), the predictive
mass the v1 law puts on its own argmax (the `ensemble(ph, pq, 0.5)` expression
serve already evaluates). This is the serve-time instantiation of the L2 law
(A6: difficulty is measured by prediction, never by loss floors or entry
statistics): the escalation organ already treats top.p < ESCALATE_BELOW as
"not confident". A8 REUSES that sealed constant as the hardness threshold —
H* := ESCALATE_BELOW = 0.55 (serve.mjs, sealed pre-weave-1). NO new numeric
constant is registered; the gate reads the same sealed constant, so the gate
and the escalation organ can never disagree about which contexts are hard.

Registered rule: w(ens3) = 0 if s >= H* (saturated context — serve the v1
law EXACTLY: the gate-closed path IS the same `ensemble(ph, pq, 0.5)`
expression, byte-identical output), w(ens3) = 1 if s < H* (hard context —
serve the registered ens3 blend 0.4*ph + 0.4*pq + 0.2*pf, pf = the
sense-table prior rebuilt from the SERIALIZED artifact, the P-W2a-verified
rebuild). w is binary because the only blend weights with receipts are the
registered ens3 weights (A7); a ramp would be an unregistered continuum
(threshold surgery). Polarity follows the receipts: s measures SATURATION of
the ensemble's vote — w = 0 when saturation is at/above H*, w = 1 below it
(A6/P-G2d: memory pays on hard soil — gate open; A7/P-W2b: archived memory
is noise on saturated soil — gate closed). The gate rides as the DEFAULT
serve law for weave-v2 field artifacts; v1 artifacts (no field arm) are
untouched; the A7 unconditional opt-in (`serve_with_field`) is unchanged; an
artifact may opt OUT with hyper.ens3.hardness_gate = false.

### Predictions (pre-registered under seal v10)

- **P-A8a (conditional byte-identity, wire path)**: over every serve.judge()
  call on the two soils of record — the sealed eval slice (n=259 judged
  calls) and the shift-family H2 (n=343) — each gate-CLOSED call returns a
  response byte-identical (full-response JSON: model, answers,
  probabilities, escalate) to the pre-A8 v1-law reference, and each
  gate-OPEN call returns exactly the registered ens3 blend. PASS iff zero
  mismatches in both branches.
- **P-A8b (saturated closure)**: on the saturated soil of record (the sealed
  eval slice, driven through serve.judge() with the established serve
  protocol: state.context = ledger prefix, judged = the target row), the
  gate opens on ZERO of the 259 judged calls — the served default over the
  whole slice is byte-identical end-to-end to the current served default.
  PASS iff gate_open_count == 0. Registered FAIL branch: the served default
  reverts to unconditional ens2 (the gate ships behind explicit
  hyper.ens3.hardness_gate opt-in), the FAIL is the verdict of record, and
  the finding is priced: a per-row confidence gate cannot guarantee
  whole-slice closure, so A9 (compile-time soil-hardness calibration carried
  in the artifact, train-only, P-G2b pattern) becomes the candidate.
- **P-A8c (hard-soil margin, battery protocol)**: on the shift-family H2 —
  the non-saturated soil the repo has receipts for (P-G2d: pooled frozen-head
  73.47% < 0.90 gate HELD) — pooled gated top-1 >= pooled ens2 top-1 + 0.01
  over the 343 rows (battery windows per pipeline-v2; gate decided
  per-sample by the same rule on ens2 top.p; pf from the serve-rebuilt
  serialized table). PASS iff 100*(gated_hits − ens2_hits) >= 343 (the
  integer-exact form of delta >= 0.01). Honest either way: FAIL with the
  receipts means the ARCHIVED sense table does not carry the P-G2d
  fresh-memory value even behind a confidence gate — the hardness law
  narrows to "FRESH memory only", the served default stays the v1 law, and
  the finding is priced.
- **P-A8d (twin + battery green)**: (i) P-W2a re-verified under seal v10 —
  weave-core-v2 JS == Python byte-identical (exact bytes); (ii) the serve
  prior rebuild consumes the TWIN's serialized table — SenseTablePrior built
  from arms.field of weave_core_v2_py.json reproduces the JS-table prior
  vectors exactly (per-context JSON equality over every context evaluated on
  both soils); (iii) smoke stays 9/9; (iv) selftest green under the seal.
  PASS iff all four hold.

Contrast receipts (no gates): per-ledger gate-open rates, flip accounting
(opened rows: ens2-right→gated-wrong vs ens2-wrong→gated-right), arm top-1s
(hash, qthe, field alone) on H2, min ens2 top.p over the eval slice, and the
eval-slice battery-protocol ens2 top-1 pinned to the P-W2b receipt (953668
micro).

### A8 verdicts of record (run 2026-09-28, seal v10; receipts/e_a8.jsonl tip 1ac2699bffe07d6d)

- **P-A8a PASS** — the implementation IS the registered rule: over 602
  serve.judge() calls (259 eval-slice + 343 shift-H2), all 551 gate-closed
  responses were byte-identical to the pre-A8 v1-law reference and all 51
  gate-open responses exactly the registered ens3 blend (0 mismatches in
  both branches, full-response JSON equality).
- **P-A8b FAIL** — saturated closure does not hold: the gate opens on
  11/259 eval-slice calls (min ens2 top.p = 0.3921 < H* = 0.55). The damage
  is fully CONCENTRATED, not avoided: the battery-protocol gated slice
  scores 0.9459 — exactly the P-W2b unconditional number — i.e. every
  P-W2b flip happened on the 11 would-escalate rows (net -2). A per-row
  confidence gate cannot guarantee whole-slice closure. Per the registered
  FAIL branch: the served default reverts to the unconditional v1 law; the
  gate ships behind explicit hyper.ens3.hardness_gate opt-in only (commit
  carries the final law; the receipt bytes reproduce exactly under it).
  A9 candidate registered by this branch: compile-time soil-hardness
  calibration carried in the artifact (train-only, P-G2b pattern).
- **P-A8c FAIL** — on shift-family H2 the gated blend EXACTLY equals ens2:
  242/343 = 0.7055 both (delta +0.0000 against the +0.01 gate; 40/343
  gate-opens, ZERO flips either way). Mechanism receipt: under the stream
  grow() law every cell deforms with gamma=0 — all 43 serialized cells carry
  G=0 — so the rebuilt prior is a distance-tilted frequency of train-ledger
  op counts; 0.2*pf never crosses an ens2 argmax margin, and the field arm
  alone sits at 61.45-65.67% on H2, BELOW both heads (68.67-76.12%). The
  P-G2d +13.41pp came from priorCounted (exact-context memorization of
  FRESH H1 memory), not from the lattice prior. The hardness law narrows to
  "FRESH memory only": an ARCHIVED sense table carries no serve-time value
  on either soil. The served default stays the v1 law.
- **P-A8d PASS** — P-W2a re-verified under seal v10 (weave-core-v2
  9960B == 9960B, journal tip aaa3ce6ab0dcbc94; weave-v2 artifact pinned to
  the e_w2 receipt 1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519);
  the serve prior rebuild consumed the TWIN's serialized table and
  reproduced the JS prior vectors on all 47 evaluated contexts; smoke 9/9;
  selftest green. The re-run against the final (opt-in) serve law
  reproduced the receipt bytes exactly (pipeline determinism).

Verdict of record: P-A8 FAIL (2/4 — the conditional-identity and twin
predictions held; both blend-value predictions failed). The archived
lattice-prior blend is now falsified three ways (P-W2b unconditional,
P-A8b gated closure, P-A8c hard-soil value). Priced into A9: (i)
compile-time soil-hardness calibration carried in the artifact (train-only
fit, P-G2b pattern) since no per-row serve signal can guarantee saturated
closure; (ii) if serve-time living memory is ever to pay, the artifact must
carry FRESH stream memory (a table grown from the live lane's own
judgments — grow-as-used), and the gamma channel must be fed real
amplitudes (grow() currently deforms with gamma=0, structurally zeroing
the prior the gate would gate on).

## Addendum A9 (2026-09-28, BEFORE the A9 run) — P-A9: the fresh-memory serve law (grow-as-used)

The A8 verdicts falsified the ARCHIVED lattice prior three ways (P-W2b unconditional,
P-A8b gated closure, P-A8c hard-soil value) and priced A9: "if serve-time living memory
is ever to pay, the artifact must carry FRESH stream memory (a table grown from the live
lane's own judgments — grow-as-used)". This addendum registers the A9 mechanism BEFORE any
run. Runs execute under seal v12.

### Design choice (from the receipts; ONE mechanism taken)

The A8 candidate list was (a) real gamma amplitudes in grow() and (b) fresh-stream memory
in the artifact. Reading the code against the receipts: the +13.41pp payload (P-A8c
mechanism receipt: priorCounted, exact-context memorization of FRESH H1 memory) never
reads the lattice — it reads the supervision aggregate `observed`, which the weave-v2
artifact ALREADY serializes (`arms.field.observed`, 56 train contexts, twin-verified in
P-W2a). The missing piece is the SERVE LAW, not a payload: no registered serve path
consumes the serialized aggregate as priorCounted. Taking (a) would feed the channel the
receipts falsified three ways — and a CONSTANT gamma amplitude provably cancels in the
prior normalization (w = (gamma+1e-9)/(1+d): a cell-independent gamma scales every weight
alike and the normalized prior vector is byte-identical to the gamma=0 case), while a
VARYING amplitude needs the head inside grow() and predicts no transfer of archived mass
on shifted soil (the P-G2b/A8c family). A9 therefore takes (b): the fresh-memory serve
law, grow-as-used, twin-verified. The gamma channel stays structurally zero — that is
mechanism (a)'s home, left untouched and honestly priced for a later lane.

### The registered law (serve, opt-in only; default untouched)

- Carrier: `arms.field.observed` — the supervision aggregate the artifact already carries
  ([[ctx, {op: count}], ...] sorted bytewise). NO new arm, NO schema change, NO new blend
  constant: the compiled weave-v2 artifact bytes are UNCHANGED (artifact_sha256 stays
  pinned to the e_w2 receipt 1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519).
- Rebuild: SenseTablePrior gains `priorCounted(ctx)` — the EXACT field.mjs
  Rhizome.priorCounted law (add-1 smoothing toward the global observed distribution;
  unseen contexts fall back to the global distribution; OPS.length = 7) computed from the
  SERIALIZED aggregate. Integer counts only — exact cross-substrate.
- Serve branch (else-if chain: A7 serve_with_field -> A9 serve_with_fresh -> A8
  hardness_gate -> default v1; registered total order for artifacts setting multiple
  opt-ins): `hyper.fresh.serve_with_fresh === true` (explicit opt-in) AND the artifact
  carries arms.field -> registered fresh law: gate signal s = top.p(ens2), H* =
  ESCALATE_BELOW = 0.55 (both REUSED — zero new constants; the A8-proven gate, P-A8a),
  gate-CLOSED (s >= H*) serves the exact v1 expression `ensemble(ph, pq, 0.5)`
  (byte-identical), gate-OPEN (s < H*) serves `loaded.field.priorCounted(tokens.join('|'))`
  PURE — the P-G2d law of record (per-ledger lambda* = 0 everywhere: all fresh memory, no
  head mass on the open branch).
- Default law untouched: artifacts without hyper.fresh.serve_with_fresh behave exactly as
  the A8-era law (v1 default everywhere). The opt-in may ride the artifact hyper (set at
  compile) or the loaded handle; both must produce identical bytes.
- Grow-as-used semantics (the freshness): the live lane watches its own stream (deform +
  observe per judgment/receipt — grow()), then RE-SERIALIZES arms.field :=
  senseTable(live rhizome) and serves from the updated artifact. The update event is
  receipted with its own artifact sha. Freshness is temporal, not architectural: the
  fresh law consumes whatever the lane's own watching produced, never a compiled-only
  archive.

### Predictions (pre-registered under seal v12)

- **P-A9a (opt-in wire mechanics)**: over every serve.judge() call on the two soils of
  record (sealed eval slice n=259; shift-family H2 n=343; serve protocol, full-response
  JSON): with the fresh opt-in ON, every gate-closed response is byte-identical to the
  v1-law reference and every gate-open response is exactly the registered fresh law. The
  artifact-hyper opt-in path and the loaded-handle opt-in path produce identical bytes.
  PASS iff zero mismatches in both branches (and opt-in-path equality holds).
- **P-A9b (default law safe)**: with the fresh flag ABSENT (the served default), every
  serve.judge() call on both soils returns byte-identical full-response JSON to the
  pre-A9 v1-law reference — 259/259 on the saturated slice and 343/343 on shift-H2. PASS
  iff zero mismatches. (The house law: the served default stays the v1 law everywhere.)
- **P-A9c (fresh value on shift-H2)**: battery protocol (per-ledger windows,
  pipeline-v2), grow-as-used: watch H1 per shift ledger (fresh rhizome, P-G2d protocol),
  re-serialize arms.field from it, serve H2 under the opt-in fresh law. Registered gate:
  pooled fresh top-1 >= pooled ens2 top-1 + 0.01 over the 343 rows — integer-exact:
  100*(fresh_hits - ens2_hits) >= 343 (ens2 = 242 hits, the P-A8c receipt number, pinned;
  gate-open rows = 40, the A8 number). Direction registered: PASS predicted — the P-G2d
  mechanism transfers through the gate (fresh memorization 298/343 = 0.8688 vs ens2 242:
  +56 overall; the law replaces ens2 exactly on the 40 gate-open rows, ens2's weakest —
  point estimate ~+10..16 hits). Honest FAIL = the freshness value does not survive the
  gate/serve path; the served default stays the v1 law, the fresh law ships opt-in, the
  finding is priced.
- **P-A9d (twin + battery green)**: (i) P-W2a re-verified under seal v12 — weave-core-v2
  JS == Python byte-identical (exact bytes, 9960B); (ii) the A9 rebuild consumes the
  SERIALIZED aggregate: SenseTablePrior.priorCounted built from the TWIN's arms.field
  reproduces the JS train-rhizome priorCounted vectors exactly (per-context JSON equality
  over every context evaluated on both soils), and the JS rebuild from each serialized
  live H1 table reproduces the live rhizome's own priorCounted vectors exactly (over all
  H1+H2 contexts of that ledger); (iii) NEW twin mode: the Python twin grows the H1 slice
  of each shift ledger and serializes the fresh table — byte-identical to the JS live
  table (all 4 ledgers); (iv) smoke 9/9; (v) selftest green. PASS iff all five hold.

Contrast receipts (no gates): the ungated fresh-everywhere pooled H2 number pinned to the
P-G2d receipt (298/343 — rebuild faithfulness); H2 exact-context coverage (how many of
the 40 gate-open rows hit the fresh map vs fall back to global); the saturated opt-in
contrast (eval slice, compile-time train aggregate behind the opt-in: gate opens 11 — the
A8 number — fresh serves priorCounted(train) on those rows; receipted with flips, no
verdict); live-table re-serialization byte-determinism (two rebuilds identical); live
cells' G still 0 (mechanism receipt: A9 took path (b); the gamma channel is untouched);
the e_a8 receipt bytes reproduce exactly under the A9 law (CI regression).

### A9 verdicts of record (run 2026-09-28, seal v12; receipts/e_a9.jsonl tip 44cc228e7be4395a)

- **P-A9a PASS** — the implementation IS the registered fresh law: over 602
  serve.judge() calls with the opt-in ON (259 eval-slice + 343 shift-H2), all
  551 gate-closed responses byte-identical to the v1-law reference and all 51
  gate-open responses exactly the registered fresh law (0 mismatches); the
  artifact-hyper opt-in path and the loaded-handle opt-in path produced
  identical bytes on all 40 sampled calls (40/0 bad).
- **P-A9b PASS** — the served DEFAULT is safe: with the flag ABSENT, all 602
  calls on both soils returned byte-identical full-response JSON to the
  pre-A9 v1-law reference (0 mismatches; gate stats unchanged from A8: eval
  min top.p 0.3921, shift min 0.4043). The house law held end to end.
- **P-A9c PASS** — fresh value survives the gate/serve path: grow-as-used
  (watch H1 per shift ledger, re-serialize arms.field, serve H2) pooled
  fresh 252/343 = 0.7347 vs ens2 242/343 = 0.7055 (ens2 and gate_open=40
  both pinned to the P-A8c receipt) — delta +0.0292 over the +0.01 gate
  (integer-exact: 100*(252-242) = 1000 >= 343); flips +14 wrong2right /
  -4 right2wrong on the 40 gate-open rows (open-row exact-context coverage
  33/40, fallback 7). Inside the registered point-estimate band (+10..16).
  Rebuild-faithfulness pins: ungated fresh-everywhere = 298/343 — EXACTLY
  the P-G2d receipt number; the serve-rebuilt aggregate reproduces the live
  rhizome's priorCounted over all 686 shift contexts and the twin's table
  over all 46 evaluated train contexts (JSON-exact).
- **P-A9d PASS** — P-W2a re-verified under seal v12 (weave-core-v2 9960B ==
  9960B, journal tip aaa3ce6ab0dcbc94; compiled artifact still pinned to
  1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519 — no
  schema change, no new arm); the NEW twin fresh mode grew each ledger's H1
  and serialized the fresh table byte-identically to the JS live table
  (4/4 ledgers); live re-serialization byte-deterministic (4/4); live cells'
  G max = 0 (the gamma channel untouched — A9 took path (b), mechanism (a)
  remains honestly priced); smoke 9/9; selftest green. The e_a8 receipt
  re-ran under the A9 law and reproduced every measured byte exactly (the
  only field that changed is the seal version stamp, 10 -> 12, as it must).

Verdict of record: P-A9 PASS (4/4). The A8c mechanism receipt is CONFIRMED:
the archive pays exactly when it carries FRESH memory and the serve law
reads it as priorCounted — same gate A8 proved (P-A8a), same payload P-G2d
proved (+13.41pp), new composition: +0.0292 pooled on shift-H2 through the
wire path, default law byte-safe on both soils. The receipts also price the
gap the gate leaves: ungated fresh-everywhere is 298/343 (0.8688, the
P-G2d number) vs 252/343 gated — the gate trades value capture for
saturated-soil safety, and the saturated opt-in contrast shows why the
default must stay v1 (fresh over the ARCHIVED train aggregate on the
saturated slice: 0.9382 vs ens2 0.9537, flips -6/+2 — archived memory
behind the gate still damages new soil, the P-G2b pattern). Priced into
A10: whether a hardness meter can select fresh-everywhere on registered-hard
soil without reopening the saturated slice (compile-time soil calibration,
the remaining A8 candidate), and/or the real-lane trial (a quilt lane
feeding judgments + receipts to the endpoint so arms.field carries its own
freshness in production).

> Provenance note (seal v14, append-only): the A9 verdict of record was
> determined by the FIRST run, executed under seal v12 (receipt tip
> 44cc228e7be4395a, "seal verified (v12)" in the run log). The run was then
> repeated under the final seal v13 and every measured byte reproduced
> exactly (determinism; the committed receipts/e_a9.jsonl is that final
> re-run, tip 9aa5351090693e9d — the only field that differs from the
> v12-run receipt is the seal version stamp, as designed). The e_a8
> receipt of record remains the committed v10 run (tip 1ac2699bffe07d6d);
> its A9-law regression re-run is documented above, not re-committed.

## Addendum A10 (2026-09-28, BEFORE the A10 run) — P-A10: the fresh-everywhere trial mode (soil-level opt-in, risk priced)

A9's verdict priced the gap its gate leaves open: ungated fresh-everywhere =
298/343 (0.8688, the P-G2d pin) vs 252/343 gated — 46 NET rows where the gate
STAYS CLOSED but fresh memory would still pay. This addendum registers A9's
successor BEFORE any A10 run. Runs execute under seal v15.

### Characterization of the 46 gap rows (pre-registration analysis; receipted as A10 contrast rows, no verdicts)

Per-row anatomy of the 303 shift-H2 gate-closed rows (A9 battery protocol,
grow-as-used: watch H1 per ledger, serve H2; priorCounted from the live H1
table):

- GROSS gains 50 rows (gate closed, ens2 wrong, fresh right): ALL 50 are
  EXACT-CONTEXT rows in the fresh H1 table (fallback 0), and on all 50 the
  fresh argmax IS the label. Labels: TICK 36 / BIND 14; the ens2 argmax is
  EFFECT on 50/50; transitions BIND->TICK 21, VIEW->TICK 15, TICK->BIND 13 —
  the injected echo rhythm of the shift family (mid-stream readout/collapse
  cycles that do not occur in train soil). ens2 is CONFIDENTLY wrong there
  (top.p 0.5560-0.8514, median 0.6595) — its EFFECT-heavy continuation is a
  train bias; the fresh table memorized the echo.
- Gross losses 4 rows (gate closed, ens2 right, fresh wrong): all EFFECT
  rows, exact-context, top.p 0.7890-0.8514 — H1 saw those windows continue
  differently (ambiguity), the gate saves exactly these.
- Other closed rows 249 (fresh and ens2 agree on 243; 20 fallback rows).
- Accounting: everywhere-on-closed = 226 + 50 - 4 = 272; open-row fresh hits
  26/40; everywhere total 272 + 26 = 298 = the pin; gated 226 + 26 = 252.
- THE INTERLEAVE PROOF: protection rows' top.p range [0.7890, 0.8514] is
  NESTED INSIDE the gap rows' range [0.5560, 0.8514]; other-closed rows span
  [0.5777, 0.8514]. NO row-level threshold separates gain from loss: any H*
  low enough to open the gap rows (H* <= 0.5560) opens the 11 damaging eval
  rows too (eval damage -4 hits, the A9 measured cost); higher H* captures
  only part of the gap (H*=0.65 -> 270, H*=0.70 -> 290, H*=0.75 -> 300 —
  above everywhere only because the 4 protection rows stay closed — but
  costs the same -4 on eval; H* >= 0.80 -> 298 everywhere-equivalent).
  Full frontier receipted as a contrast row.
- The train-only calibration counterfactual (compile-time legal: train soil
  only): walk-forward over the 12 train ledgers (watch H1, serve H2, gated
  fresh law) gives 569/582 (0.9777) at EVERY H* in {0.40, 0.45, ..., 0.95,
  1.01} — the objective is EXACTLY FLAT in H*. On the only soil compile time
  sees, fresh H1-memory and ens2 agree row-for-row (the gate is a no-op on
  saturated soil), so no registered derivation from train soil can rank
  threshold values, let alone transfer them. Mechanism (a) — a compile-time
  calibration of H* — is IMPOSSIBLE-BY-DERIVATION on this soil, and the
  row-level signal is proven unable to separate the soils (interleave
  proof). The separating variable is the SOIL (echo rhythm present or not),
  which does not exist at compile time (shift_family_gen.py built it after
  training, receipted). This is the A6 law again, now with a proof shape:
  hardness is a property of the WORLD, not the row.
- Saturated cost of fresh-everywhere, priced from the A9 receipts: on the
  sealed eval slice the compile-time train aggregate served on ALL 259 rows
  scores 243/259 = 0.9382 = micro 938224 — EXACTLY the A9 receipt's
  eval fresh_micro (structural: on the 248 gate-closed eval rows,
  fresh(train) == ens2 hit-for-hit in aggregate, so gated == everywhere ==
  243). The A9 receipt therefore already pins the everywhere number; flips
  vs ens2 are -6/+2 (net -4 = -0.0154). Provenance audit note (append-only,
  honest): the committed A9 receipt's eval_optin_contrast flip FIELDS carry
  swapped labels (w2r=6/r2w=2 is inconsistent with the same row's pinned
  micros 953668/938224; the A9 verdict text of record "-6/+2" is the
  consistent reading; the A9 receipt of record stays untouched). A10
  receipts label flips explicitly.

### Design choice (ONE mechanism taken)

(a) compile-time calibration of H*: REFUTED pre-run by the flat train
objective + the interleave proof (above) — receipted, not shipped, and no
threshold surgery on the A9 mode (the A9 gate keeps H* = ESCALATE_BELOW =
0.55 byte-for-byte). (b) is taken: the FRESH-EVERYWHERE TRIAL MODE — the A9
fresh law with the gate removed, opt-in only. The selector is SOIL-LEVEL and
HONEST about it: the lane that has registered its soil hard (the P-G2d
hardness gate — pooled frozen-head accuracy < 0.90, a PREDICTION-accuracy
meter per the L2 law) — or is deliberately trialing — sets the flag and
accepts the priced saturated risk. The gap closes because the trial stops
pretending a per-row confidence signal can do a soil-level job.

### The registered law (serve, opt-in only; default untouched)

- Flag: `hyper.fresh.fresh_everywhere === true` (explicit opt-in), riding the
  artifact hyper (set at compile / re-serialization) or the loaded handle;
  both paths MUST produce identical bytes. NO new arm, NO schema change, NO
  new numeric constant — the mode has no threshold at all; the compiled
  weave-v2 artifact bytes are UNCHANGED (artifact_sha256 stays pinned to the
  e_w2 receipt 1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519).
- Serve branch: `loaded.field && loaded.freshEverywhere` -> probs =
  `loaded.field.priorCounted(tokens.join('|'))` — the EXACT A9 payload
  (priorCounted over the SERIALIZED arms.field.observed; the P-G2d law of
  record, lambda* = 0) served on EVERY row. The escalate organ is unchanged
  and mode-independent: escalate = (top.p of the SERVED distribution) <
  ESCALATE_BELOW — an everywhere judgment escalates exactly when the memory
  itself is not confident.
- Registered branch order (total, for artifacts setting multiple opt-ins):
  A7 serve_with_field -> A10 fresh_everywhere -> A9 serve_with_fresh -> A8
  hardness_gate -> default v1. (Strictest-freshest wins among fresh modes;
  A7's ens3 blend stays first for byte-compatibility with the A7-A9
  registered order. Artifacts setting only A9/A8 flags, or none, are
  byte-unchanged by construction — verified in P-A10a.)
- Default law untouched: artifacts without the flag behave exactly as the
  A9-era law (v1 default everywhere). Grow-as-used semantics unchanged:
  freshness is temporal, not architectural — the everywhere law consumes
  whatever the lane's own watching produced (the re-serialized live table),
  or the compile-time train aggregate if the lane has not re-serialized.

### Protocols of record

- Wire protocol (P-A10a): serve.judge() driven exactly as P-A9a — state.context
  = the K rows before the target, judged = the target row (tokens include the
  judged row's channel; the A8/A9 wire convention).
- Battery protocol (P-A10b/c): the P-G2d/P-A9c convention — the row under
  judgment contributes NO token (judged-free serve calls; priorCounted over
  the pre-judgment window), per-ledger windows (pipeline-v2), grow-as-used on
  the shift family.

### Predictions (pre-registered under seal v15)

- **P-A10a (wire mechanics + default safety + precedence)**: over every
  serve.judge() call on the two soils of record (sealed eval slice n=259;
  shift-family H2 n=343; wire protocol, full-response JSON): (i) with the
  everywhere opt-in ON, every response is byte-identical to the registered
  everywhere reference expression (priorCounted over the serve tokens —
  0 mismatches); (ii) with the flag ABSENT, all 602 calls are byte-identical
  to the pre-A10 v1-law reference (the default is untouched); (iii) the
  artifact-hyper opt-in path and the loaded-handle opt-in path produce
  identical bytes (sampled on both soils); (iv) precedence: an artifact
  setting BOTH fresh_everywhere and serve_with_fresh serves EVERYWHERE on
  every sampled call (A10 > A9 in the registered order). PASS iff zero
  mismatches in all four.
- **P-A10b (shift-H2 gain — the gap closed)**: battery protocol, grow-as-used
  (watch H1 per shift ledger, re-serialize arms.field, serve H2 under the
  everywhere opt-in): pooled everywhere top-1 == 298/343 EXACTLY (the
  P-G2d/A9 ungated pin reproduced through the serve path — rebuild
  faithfulness; any other number is a wire divergence) AND 100*(everywhere_hits
  - ens2_hits) >= 343 (ens2 pinned to 242, the P-A8c/A9 receipt number).
  PASS iff both. Registered cost note: everywhere pays 4 protection rows on
  shift (298 < the 302 an oracle-gated everywhere would score) — the priced
  price of dropping the row gate, receipted as contrast.
- **P-A10c (saturated cost — the priced risk, pinned)**: on the sealed eval
  slice (battery protocol; memory = the compile-time train aggregate),
  everywhere top-1 micro == 938224 (243/259 = 0.9382 — the A9 receipt pin)
  AND ens2 micro == 953668 (247/259, the P-W2b pin). PASS iff both pins
  hold. Interpretation of record: the saturation risk of fresh-everywhere is
  CONFIRMED at -0.0154 (net -4 hits: flips -6/+2) — the mode ships opt-in
  ONLY, the served default stays the v1 law, and the trial's contract is
  "price paid, receipt published". Honest FAIL = a pin moves (a real
  divergence receipt).
- **P-A10d (twin + battery green)**: (i) P-W2a re-verified under seal v15 —
  weave-core-v2 JS == Python byte-identical (9960B == 9960B); the compiled
  artifact stays pinned to the e_w2 receipt; (ii) the grow-as-used live
  tables remain byte-identical to the Python twin's fresh tables (4/4
  ledgers) and live re-serialization stays byte-deterministic (4/4) — A10
  adds zero new serialized state; (iii) the A9 experiment re-runs under the
  A10 law and reproduces every MEASURED byte of receipts/e_a9.jsonl —
  identical after stripping the seal version stamp and the chain row_hashes
  (row_hash = sha256 over the stamped row by construction, so the stamp
  change propagates into the hashes; every measured field must match) — the
  A9 verdict of record stands unchanged; the committed A9 receipt of record
  is restored byte-for-byte after the check (append-only); (iv) smoke 9/9;
  (v) selftest green. PASS iff all five hold.

Contrast receipts (no gates): the full gap anatomy (per-ledger counts, top.p
profiles, transition mix, exact-ctx coverage — the numbers cited above); the
H* frontier table on both soils (the interleave proof in numbers, incl. the
[0.50, 0.55) 4-row eval damage band and the H*=0.75 point 300/243); the
train-only calibration flatness receipt (569/582 at every grid point —
mechanism (a) impossible-by-derivation); the 4 shift protection rows
identified (the row gate's only remaining value); everywhere's open-row vs
closed-row hit decomposition on both soils; the A9 eval-contrast field-label
audit (w2r/r2w swapped in the committed A9 receipt row; verdict text of
record correct; both A9 micro pins reproduce exactly).
