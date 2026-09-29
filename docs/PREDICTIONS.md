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

### A10 verdicts of record (run 2026-09-28, seal v15; receipts/e_a10.jsonl tip 5d8c77eb22d65e19)

- **P-A10a PASS** — the implementation IS the registered trial mode: over
  602 serve.judge() calls with the everywhere opt-in ON (259 eval-slice +
  343 shift-H2), every response byte-identical to the registered everywhere
  reference (0 mismatches); with the flag ABSENT, all 602 default responses
  byte-identical to the pre-A10 v1-law reference (0 mismatches); an artifact
  setting BOTH fresh flags served EVERYWHERE on all 602 precedence calls
  (A10 > A9, 0 mismatches); artifact-hyper opt-in path == loaded-handle
  opt-in path (40/40); the grow-as-used live-table handle served the
  live-table reference byte-exactly (40/40 sampled wire calls).
- **P-A10b PASS** — the gap is CLOSED: pooled fresh-everywhere 298/343 =
  0.8688, EXACTLY the P-G2d/A9 ungated pin reproduced through the serve path
  (judged-free battery protocol, grow-as-used per ledger); ens2 242/343
  pinned to the P-A8c/A9 receipts; delta +0.1633 (integer-exact:
  100*(298-242) = 5600 >= 343). Per-ledger everywhere 60/67, 73/83, 64/83,
  101/110 (ens2 49/59/56/78 — every ledger gains double digits).
- **P-A10c PASS** — the priced risk CONFIRMED at the pin: saturated eval
  everywhere micro 938224 == the A9 receipt's fresh_micro (243/259 = 0.9382);
  ens2 micro 953668 == the P-W2b pin. Flips -6/+2, net -4 hits = -0.0154,
  and the run localizes the damage COMPLETELY to the 11 A9-open rows
  (-6/+2 there; ZERO flips on the 248 gate-closed rows — fresh(train) and
  ens2 agree hit-for-hit there, the structural identity the pricing was
  derived from). The mode ships opt-in ONLY; the served default stays v1.
- **P-A10d PASS** — P-W2a re-verified under seal v15 (weave-core-v2 9960B ==
  9960B, journal tip aaa3ce6ab0dcbc94; compiled artifact still pinned to
  1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519 — no
  schema change, no new arm, no new constant); grow-as-used live tables
  byte-identical to the Python twin (4/4) and live re-serialization
  byte-deterministic (4/4); the e_a9 regression reproduced every MEASURED
  byte of the A9 receipt under the A10 law (identical after stripping the
  seal stamp 13->15 and the chain hashes that witness it — every measured
  field matched), and the committed A9 receipt of record was restored
  byte-for-byte after the check; smoke 9/9; selftest green.

Verdict of record: P-A10 PASS (4/4). The 298-vs-252 gap is closed honestly,
and the characterization survived contact with the run: (i) the 46-net gap
decomposes into 50 gross gains minus 4 protection losses, ALL on
exact-context rows — the gains are the echo rhythm (BIND->TICK 21,
VIEW->TICK 15, TICK->BIND 13; ens2's argmax is EFFECT on 50/50: confidently
wrong, top.p up to 0.8514), the losses are ambiguous windows the row gate
was saving; (ii) the INTERLEAVE PROOF held — protection top.p range
[0.7890, 0.8514] nested inside the gap range [0.5560, 0.8514]; the in-run H*
frontier (0.40: 242/247 ... 0.55: 252/243 ... 0.75: 300/243 ... 1.01:
298/243) shows no threshold captures the gap without the -4 eval damage;
(iii) mechanism (a) is impossible-by-derivation, CONFIRMED in-run: the
train-only walk-forward objective is exactly flat in H* (569/582 at every
grid point — the gate is a no-op on the only soil compile time sees);
(iv) the A9 receipt audit: the committed A9 eval-contrast flip FIELDS carry
swapped labels (w2r=6/r2w=2 inconsistent with the same row's micros); the
A9 verdict text of record (-6/+2) is the consistent reading and both A9
micro pins reproduce exactly. The A9 law itself is untouched byte-for-byte
(same receipts under the new seal stamp).

Unified law after A10: freshness pays on hard soil — and the MODE SELECTOR
must be soil-level, because per-row confidence provably cannot separate
"confidently right" (saturated) from "confidently wrong but memorized"
(shifted): compile-time calibration has a flat objective (no signal), the
row-level distributions interleave (no separator), so the fresh-everywhere
trial ships as an explicit LANE opt-in with the saturated risk pinned at
-0.0154 (4 hits/259) and the served default stays the v1 law everywhere.

Priced into A11: the real-lane trial (a quilt lane feeding judgments +
receipts to the endpoint so arms.field carries its own freshness in
production — queued since A9); the gamma channel (grow() still deforms with
gamma=0 — every live cell G max = 0; mechanism (a)'s home, honestly priced
since A9); the H*=0.50 dominance observation (shift 254 at ZERO eval damage
vs the A9 point 252/-4 — recorded as a contrast for a future registered run,
NOT threshold surgery on the A9 mode).

> Provenance note (seal v16, append-only): the A10 verdict of record was
> determined by the FIRST official run, executed under seal v15 immediately
> after the registration commit fce983c (receipt tip 5d8c77eb22d65e19, "seal
> verified (v15)" in the run log). Two uncommitted shakedown runs before
> that commit, under the same v15 seal content, and one re-run under the
> final seal v16 all reproduced every measured byte (the only differences
> anywhere are the seal version stamps and the chain hashes that witness
> them, as designed — pipeline determinism across four runs). The committed
> receipts/e_a10.jsonl is the final v16 re-run, tip 0ed10e49430dfeb1. During
> every run the e_a9 receipt was temporarily re-stamped by the in-run
> regression and restored byte-for-byte (restored=true receipted in the
> A9-regression receipt row).

## Addendum A11 (2026-09-28, BEFORE the A11 run) — P-A11: the real-lane production trial (fresh-everywhere under grow-as-used on the real qcells streams)

A9 queued and A10 priced "the real-lane trial (a quilt lane feeding judgments
+ receipts to the endpoint so arms.field carries its own freshness in
production)". A11 makes that definition concrete and testable, registers the
trial BEFORE any A11 run, and adds ZERO source changes (the A10 law already
ships; the trial drives it). Runs execute under seal v17.

### What "real lane" means (the testable definition, registered)

- **The real-lane soil**: the 16 qcells receipt ledgers ON DISK at
  `../quilt-qcells/receipts/ledgers/` — git-pinned in SuperInstance/quilt-qcells
  @ 615ddcf (ledger files byte-identical to HEAD; local mode-bit noise only,
  core.fileMode=false quarantine per the crab-traps precedent). 1418 rows
  total, every row an OPS opcode (1418 walk samples). Sealed split unchanged:
  byte-order sort, first 12 train / last 4 eval (train 908 samples / eval 510
  by construction — measured at registration: train bell 75, crossed_measure
  136, crx_case 138, forget_bell 75, ghz3 141, init_complex 73, init_flat 74,
  layers_depth 142, measure_only 20, noise_bell 137, ry_decomposition 74,
  swap_case 74; eval unsealed_bell 74, xx_return 41, y_decomposition 72,
  zt_decomposition 72). These are the PRODUCTION receipts the garden ships
  against — the soil the artifact was compiled from — NOT the synthetic shift
  family (shift_family_gen.py built those AFTER training).
- **The endpoint**: `src/serve.mjs judge()` — the exact serve path the garden
  ships, byte-for-byte as committed at e92d00d, law chain A7 serve_with_field
  > A10 fresh_everywhere > A9 serve_with_fresh > A8 hardness_gate > default v1.
- **Production semantics (grow-as-used, the registered A10 law)**: the lane
  walks its stream in arrival order; every row it has already judged and
  receipted is an observation (field.mjs law: observations are the only
  collapse, source 'receipt'); before serving sample k the lane re-serializes
  arms.field from its own watched prefix [0..k) and serves under the A10
  opt-in (priorCounted over the SERIALIZED aggregate — the exact A9/A10
  payload, lambda* = 0). Each ledger is its own chain (seq 0, prev
  0000000000000000): the walk is PER-LEDGER — cross-ledger pollution would be
  a design error, not a law. Cold start is the registered law, not
  special-cased: at k=0 the aggregate is empty and priorCounted serves
  uniform (argmax ties resolve in OPS order, LINK — the same behavior any
  production cold stream gets).
- **Escalation is RECORDED, not executed**: escalate = top.p(served) <
  ESCALATE_BELOW (0.55, sealed, reused, mode-independent) is receipted on
  every call; the hosted teacher channel (e_g6) is out of scope — A11 stays
  local and deterministic; the walk grows from the RECEIPTS (the ledger's
  actual ops), never from teacher answers.

Why this is a genuine trial and not a re-measurement: A9/A10 measured fresh
memory (i) as the FROZEN compile-time train aggregate over the eval slice
(saturated cost -0.0154, flips -6/+2) and (ii) as H1-watched memory on the
SYNTHETIC shift soil (+0.1633 through the serve path). NEITHER is the
production shape: production memory is the lane's OWN stream prefix — thinner
than the archive, fresher than any split, carrying the stream's own patterns.
The walk-forward everywhere-live number is a genuinely NEW measurement of the
shipped law on the shipped soil; its verdict is registered below as a
relation gate with a pre-priced safety envelope, honest either way (the A8
precedent: an honest FAIL is a pin that moves).

### Registered protocols (deterministic; zero new constants)

- **Walk protocol (the A11 headline)**: for each of the 16 real ledgers
  (sealed byte-order), for each sample k (0-based over the OPS-filtered
  samples): watched prefix = samples [0..k); live table = the walk rhizome's
  senseTable() (grown incrementally, deform+observe per receipt); handle =
  loadWeave(artifact with arms.field replaced by the live table) under the
  A10 opt-in hyper.fresh.fresh_everywhere = true; serve call judged-free
  (state.context = rows.slice(max(0, i_k − K), i_k), no judged row — the
  P-G2d/P-A9c battery convention); everywhere-live choice = answers.q1.choice;
  hit = (choice === label). After the call the receipt is observed — the walk
  grows. Sample row i_k of the ledger is identified by samplesWithIdx
  (byte-equal to makeSamples by construction, guarded in-run as in A10).
- **Default arm**: the identical walk with the flag ABSENT (v1 law) — the
  default byte-safety gate; reference expression ensemble(judgeHash,
  judgeQthe, 0.5) on every call.
- **Leakage probe (judged-free integrity)**: for every walk step, the serve
  call repeated with rows[i_k].op mutated to a different OPS value must
  return BYTE-IDENTICAL responses (the judgment must never read the row under
  judgment: the walk table is the prefix [0..k), the context slice is
  [i_k − K, i_k)).
- **Wire protocol sample (endpoint shape, P-A9a convention)**: 10 sampled
  calls per ledger (judged-carrying: state.context = the K rows before the
  target, judged = the target row), everywhere-live vs the registered
  reference expression over the same step's serialized table — byte-identity.
- **Pin re-measurement (the A9/A10 pins through the A11 driver)**: (i) the
  sealed eval slice (4 eval ledgers, 259 samples) served with the COMPILE-TIME
  train aggregate (the shipped no-re-serialization fallback): everywhere
  micro == 938224, ens2 micro == 953668, flips -6/+2; (ii) the shift-H2
  battery (4 shift ledgers, grow-as-used H1→H2): everywhere == 298/343, ens2
  == 242/343.
- **Predecessor regression**: experiments/e_a10_fresh_everywhere.mjs re-runs
  under the A11 seal; every MEASURED byte of receipts/e_a10.jsonl must
  reproduce (identical after stripping the seal stamp and the chain
  row_hashes that witness it); the committed A10 receipt of record is
  restored byte-for-byte after the check (append-only).

### Predictions (pre-registered under seal v17)

- **P-A11a (wire byte-exactness on the real-lane walk)**: over all 1418 walk
  steps × three arms (everywhere-live, default, leakage probe): every
  response byte-identical to the registered reference expression for its arm
  (leakage probe: byte-identical to the unmutated call) — 0 mismatches; the
  160 sampled judged-carrying wire calls byte-identical — 0 mismatches;
  artifact-hyper opt-in path == loaded-handle opt-in path on the sampled
  path-equality calls — 0 mismatches. PASS iff zero mismatches everywhere.
- **P-A11b (the A9/A10 pins hold through the A11 driver)**: eval slice
  everywhere micro == 938224 AND ens2 micro == 953668 AND flips -6/+2;
  shift-H2 everywhere == 298/343 AND ens2 == 242/343 (pinned to the committed
  receipts). PASS iff all five.
- **P-A11c (walk semantics exact + no leakage)**: (i) walk serialization
  byte-deterministic at EVERY step (double serialization, all 16 ledgers);
  (ii) incremental walk == prefix re-grow: at every 16th step (≥1 per ledger)
  the live table byte-equals a fresh rhizome grown on samples [0..k); (iii)
  leakage probe 0 violations over all 1418 steps; (iv) escalate ==
  (top.p(served) < 0.55) on every call; (v) each ledger's final walk table
  byte-equals the JS full-ledger grow (walk continuity). PASS iff all.
- **P-A11d (twin + battery green + predecessor regression)**: weave-core-v2
  JS == Python (9960B == 9960B); the Python twin's fresh H1 tables on the
  REAL ledgers byte-equal the JS midpoint walk tables (16/16 — the existing
  garden_ref.py --fresh tool, no ref changes); smoke 9/9; selftest green;
  e_a10 regression measured-identical + receipt of record restored. PASS iff
  all.
- **P-A11e (the production question — relation gate, FAIL branch registered
  NOW)**: pooled walk-forward everywhere-live hits >= pooled walk-forward
  ens2 hits over the 1418 real-lane samples. PASS iff the relation holds.
  Registered FAIL branch (no threshold surgery, decided before the run): if
  ens2 > everywhere-live, the trial's honest answer of record is
  "production grow-as-used does not pay on the real lane"; the mode stays
  opt-in trial (the served default stays v1 law regardless of the verdict —
  unchanged by construction); the measured cost is receipted; AND the safety
  envelope must hold: (ens2_hits − everywhere_hits) / 1418 <= 0.05 — the
  promotion gate's own DISCARD bound (weaver.mjs promotionGate discards a
  challenger degrading a tracked metric > 0.05; 0.05 is an EXISTING sealed
  constant, reused — zero new constants; integer form: gap <= 70 hits). If
  the envelope is breached, the walk exposes a failure mode beyond the
  compiler's own safety discipline and the production semantics must not
  ship even opt-in without a soil gate (A12 pricing).

Contrast receipts (no gates): per-ledger everywhere-live vs ens2 table with
flips decomposed (exact-ctx vs fallback rows); the walk's exact-ctx coverage
(how much of the stream the lane's own memory sees); escalate counts per arm;
cold-start (k=0) receipts; the fallback law receipt (unseen-context steps
serve the prefix marginal, add-1 smoothed — the priorCounted fallback law).

Operating point UNCHANGED: H* = ESCALATE_BELOW = 0.55 (escalate organ only,
mode-independent); ens3 weights untouched (0.4/0.4/0.2, the registered
weights); the A10 opt-in flag hyper.fresh.fresh_everywhere reused as-is;
branch order A7 > A10 > A9 > A8 > v1 unchanged; artifact_sha256 pinned to
1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519 (the e_w2
receipt pin); default law = v1 everywhere; NO new arm, NO schema change, NO
new numeric constant. A11 adds ZERO changes to src/.

### A11 verdicts of record (run 2026-09-28, seal v17; receipts/e_a11.jsonl tip 461faf80852d7b56)

- **P-A11a PASS** — the implementation IS the registered real-lane trial:
  over all 1418 walk steps × three arms, every response byte-identical to
  the registered reference expressions — everywhere-live vs the reference
  rebuilt from the RE-PARSED SERIALIZED walk table (0 mismatches), the
  default vs the independent v1 expression (0 mismatches), the leakage probe
  vs the unmutated call (0 mismatches — the judgment never reads the row
  under judgment); the 160 judged-carrying wire calls (first 10 steps per
  ledger, the SAME step's serialized table) byte-identical (0 everywhere
  mismatches; 0 default, receipted as contrast); artifact-hyper opt-in ==
  loaded-handle opt-in (32/0 bad).
- **P-A11b PASS** — the A9/A10 pins hold through the A11 driver: eval slice
  (compile-time train aggregate) everywhere micro 938224 == the A9 receipt
  pin, ens2 micro 953668 == the P-W2b pin, flips -6/+2 == the A10 receipt;
  shift-H2 grow-as-used battery everywhere 298/343 == the P-G2d/A9/A10 pin,
  ens2 242/343 pinned. The production driver drives the same serve path to
  the same bytes.
- **P-A11c PASS** — walk semantics exact: per-step serialization byte-
  deterministic (0 bad, double serialization at EVERY step of 16 ledgers);
  incremental walk == prefix re-grow (0/95 bad at every 16th step); final
  walk table == full-ledger grow on 16/16 ledgers (continuity); leakage
  probe 0 violations over 1418 steps; escalate == (top.p(served) < 0.55) on
  every call (0 violations).
- **P-A11d FAIL (literal strip) — receipted as a stamp-witness artifact,
  every measured field matched**: twin core-v2 IDENTICAL (9960B == 9960B);
  the Python --fresh H1 midpoint tables on the REAL ledgers byte-equal the
  JS walk tables 16/16; smoke 9/9; selftest green; e_a10 re-ran under the
  A11 seal with P-A10 overall PASS and its receipt of record restored
  byte-for-byte. The single failing component: the registered measured-byte
  strip of receipts/e_a10.jsonl (strip top-level seal_v + row_hashes)
  returned false. The post-run field-level audit enumerated ALL differing
  paths between the committed v16 receipt and the v17 re-run: row1.seal_v
  (16→17), row1.a9_regression.seal_stamps.1 (16→17), and the three
  propagated row_hashes — NOTHING else. The nested stamps field is a
  STAMP-CLASS WITNESS the A10 experiment itself introduced (it records which
  seal the inner e_a9 regression executed under); every MEASURED field
  matched. The registered strip did not carve out the nested witness; the
  FAIL of record stands exactly as executed (the lane does not touch its
  gates after the run); this audit is the receipt of why it is bookkeeping,
  not measurement. The same audit applies to the e_a10_summary.json nested
  stamps field (restored byte-for-byte after the check).
- **P-A11e FAIL — the production question answered NO, envelope BREACHED**:
  pooled walk-forward everywhere-live 1261/1418 (0.8893) vs ens2 default
  1378/1418 (0.9718); delta −117 hits = −0.0825. The registered safety
  envelope (gap ≤ 70 hits = the promotion gate's own 0.05 DISCARD bound) is
  BREACHED (117 > 70). Registered FAIL branch executes: the mode stays
  opt-in trial; the real lane must NOT set hyper.fresh.fresh_everywhere;
  the served default stays the v1 law (unchanged by construction); the
  measured cost is the receipt of record. P-A11 overall: FAIL.

Mechanism receipts (the science of the honest FAIL):

1. **EXACT-CTX NEUTRALITY**: zero hit-outcome flips on ALL 1216 exact-ctx
  steps (85.75% of the walk). When the lane's own memory HAS seen the exact
  3-window, its memorized continuation agrees with the compiled heads
  everywhere — fresh memory is never wrong on what it actually memorized;
  on the real lane it is merely never better (the compiled artifact already
  saturates its own training soil: ens2 walk 97.18%). This is the exact
  mirror of the shift soil, where the memorized echo was precisely where
  fresh WON (A10: all 50 gross gains exact-ctx).
2. **FALLBACK DAMAGE CONCENTRATION**: 100% of the A11 damage sits on the
  202 fallback steps (unseen context): 118 ens2-right→everywhere-wrong vs 1
  the other way. There priorCounted serves the prefix marginal (add-1): its
  argmax distribution across the walk was LINK 62 / BIND 99 / EFFECT 41 —
  a biased guesser; the 118 loss rows' true labels: EFFECT 49, BIND 28,
  TICK 26, PROOF 15; ens2 is confident on those rows (top.p 0.4578–0.9500,
  median 0.6821) and mostly right. The A9/A10 pricing said "archived memory
  still damages new soil" at −0.0154; production self-memory damages MORE
  (−0.0825) because the single-stream prefix marginal is weaker than the
  12-ledger archive on unseen windows.
3. **ESCALATE LOAD**: everywhere escalates 297/1418 = 20.9% of real-lane
  judgments vs the default's 32/1418 = 2.3% — a 9× teacher-load signal if
  the mode were enabled in production (escalation RECORDED, not executed,
  per the registered protocol).
4. **THE A6 LAW CONFIRMED FROM THE THIRD SOIL**: freshness value is a
  property of the WORLD. Shift soil (memorized echo, heads confidently
  wrong): fresh pays +0.1633. Saturated eval slice (archived memory on new
  soil): fresh costs −0.0154. The real lane walked in production (self-
  memory, saturated heads): fresh costs −0.0825, damage entirely in the
  fallback class. The soil-level selector law (the lane declares its soil;
  the served default never changes) is the only guard, and A11 measured
  exactly what it guards against on the production soil.

Erratum (append-only, honest): the A11 registration's split-total
parenthetical reads "train 908 / eval 510"; the correct totals are train
1159 / eval 259 — the per-ledger list in the same sentence is correct and
sums to 1159/259; the 1418 total and every registered gate are unaffected.
Receipted here, not silently fixed (the v17 registration bytes stand).

A12 pricing (from the A11 receipts, a NEW mechanism — no threshold surgery
on any shipped mode): the fallback-aware everywhere candidate — serve the
walk memory on exact-ctx steps, fall back to the v1 law (not the prefix
marginal) on unseen contexts. The joint receipts predict it keeps the
shift-soil gains (A10: the 50 gross gains are ALL exact-ctx rows) while
being hit-identical to the v1 default on the real-lane walk (A11: zero
exact-ctx flips ⇒ its real-lane hits == ens2's hits exactly). It requires a
new serve branch and a registered addendum with its own seals; A9's gate,
A10's everywhere, and the default stay byte-identical regardless.

> Provenance note (seal v18, append-only): the A11 verdict of record was
> determined by the FIRST official run, executed under seal v17 immediately
> after the registration commit 75fd8cf (receipt tip 461faf80852d7b56, "seal
> verified (v17)" in the run log). The committed receipts/e_a11.jsonl is the
> v18 re-run executed under this seal; its measured bytes are identical to
> the v17 run of record except the stamp-class fields (top-level seal_v, the
> chain row_hashes that witness them, and the nested
> e_a10_regression.seal_stamps array — the same stamp-class witness the
> P-A11d audit carves out). The e_a10 receipt of record and summary were
> restored byte-for-byte after every run.

## Addendum A12 (2026-09-28, BEFORE the A12 run) — P-A12: fallback-aware everywhere (the A11-priced mechanism, one new serve branch)

A11's honest FAIL priced this candidate from the joint receipts. The
pricing text of record (sealed v18): "the fallback-aware everywhere
candidate — serve the walk memory on exact-ctx steps, fall back to the v1
law (not the prefix marginal) on unseen contexts. The joint receipts
predict it keeps the shift-soil gains (A10: the 50 gross gains are ALL
exact-ctx rows) while being hit-identical to the v1 default on the
real-lane walk (A11: zero exact-ctx flips => its real-lane hits == ens2's
hits exactly). It requires a new serve branch and a registered addendum
with its own seals; A9's gate, A10's everywhere, and the default stay
byte-identical regardless." The mechanism receipts it is built from: (1)
EXACT-CTX NEUTRALITY — zero hit-outcome flips on ALL 1216 exact-ctx steps
(85.75% of the walk): fresh memory is never wrong on what it memorized and
never better on the real lane (the compiled artifact saturates its own soil
at 97.18%); (2) FALLBACK DAMAGE CONCENTRATION — 100% of the A11 damage sat
on the 202 unseen-context steps (118 ens2-right/everywhere-wrong vs 1 the
other way): the prefix-marginal argmax (LINK 62 / BIND 99 / EFFECT 41) is a
biased guesser against ens2's 97% heads; (3) ESCALATE LOAD — everywhere
escalated 20.9% of real-lane judgments vs the default's 2.3%. A12 removes
the damage channel while keeping the fresh channel exactly where A11
measured it harmless (and A10 measured it valuable on shift soil). Runs
execute under seal v19.

### The registered law (serve, opt-in only; everything shipped stays byte-identical)

- Flag: `hyper.fresh.fresh_everywhere_fallback_aware === true` (explicit
  opt-in), riding the artifact hyper (set at compile / re-serialization) or
  the loaded handle; both paths MUST produce identical bytes. NO new arm,
  NO schema change, NO new numeric constant. The compiled weave-v2 artifact
  bytes are UNCHANGED (artifact_sha256 stays pinned to the e_w2 receipt
  1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519).
- Serve branch (the priced new branch, built ENTIRELY from existing
  registered pieces): `loaded.field && freshAware` ->
  - exact-ctx (the memory has seen the exact token key:
    `observed.has(tokens.join('|'))` — the registered A11 exact-ctx
    classification, a MEMBERSHIP test, NOT a threshold): probs =
    `priorCounted(tokens.join('|'))` — the EXACT A10/A9 payload;
  - fallback (unseen context): probs = `ensemble(ph, pq, 0.5)` — the EXACT
    v1 law (the default path as shipped), NOT the prefix marginal.
  Every served expression is an existing registered piece; the branch only
  SELECTS between them per step by the A11 classification. The escalate
  organ is unchanged and mode-independent: escalate = (top.p of the SERVED
  distribution) < ESCALATE_BELOW (0.55, sealed, reused).
- Registered branch order (total, for artifacts setting multiple opt-ins):
  A7 serve_with_field -> A12 fresh_everywhere_fallback_aware -> A10
  fresh_everywhere -> A9 serve_with_fresh -> A8 hardness_gate -> default
  v1. (Strictest-freshest wins among fresh modes: A12 serves fresh on a
  SUBSET of A10's rows — the fallback-aware restriction beats plain
  everywhere; A7's ens3 blend stays first for byte-compatibility with the
  A7-A11 registered order. Artifacts setting only A10/A9/A8 flags, or
  none, are byte-unchanged by construction — verified in P-A12c.)
- Source-change scope of record: src/serve.mjs gains exactly ONE else-if
  branch + the one-line flag load (+ law comments) — nothing else in src/
  changes. This is the first src/ change since A10, and it IS the priced
  mechanism (the v18 pricing text of record prices exactly this new
  branch).

### Protocols of record (reused verbatim; zero new protocol constants)

- Real-lane walk: the REGISTERED A11 protocol, machinery byte-for-byte —
  the 16 git-pinned qcells ledgers (1418 rows) walked in arrival order
  through the shipped serve path; arms.field re-serialized from the lane's
  own receipted prefix [0..k) before every judged-free serve call
  (grow-as-used); per-ledger chains; cold start = the registered law (an
  empty aggregate is the FALLBACK class: A12 serves the v1 law at k=0,
  where the everywhere mode served uniform — receipted as contrast);
  escalation RECORDED not executed; leakage probe per step on the trial
  arm (the judgment must never read the row under judgment);
  judged-carrying wire sample = first 10 steps per ledger (the A8/A9 wire
  convention: tokens include the judged row's channel; the A12 exact-ctx
  test applies to the SAME key the fresh payload would serve from — the
  wire key differs from the battery key exactly as in A9/A10/A11).
- Shift-H2 battery: the A10/P-G2d protocol — 4 shift ledgers, grow-as-used
  watch H1, re-serialize arms.field, judged-free serve of H2.
- Eval-slice pins: the compile-time train aggregate (the shipped
  no-re-serialization fallback), the A9/A10/A11 pins.
- Predecessor regressions: e_a11_real_lane.mjs re-runs under the A12 seal
  (its own registered protocol already re-runs e_a10_fresh_everywhere.mjs,
  which re-checks the e_a9 receipt — one spawn binds the whole predecessor
  chain); every MEASURED byte of receipts/e_a11.jsonl and
  receipts/e_a10.jsonl must reproduce after stripping the STAMP-CLASS
  fields — top-level seal_v, the chain row_hashes that witness them, AND
  the nested *_regression.seal_stamps arrays (the exact stamp-class the
  A11 P-A11d field audit enumerated; the P-A11d literal-strip FAIL is the
  recorded lesson this strip corrects for — the registered strip of A12
  carves the witness class out BEFORE the run, so a stamp-only difference
  can never again read as a measured divergence); the committed receipts
  of record and the e_a10 summary of record are restored byte-for-byte
  after the check (append-only).

### Predictions (pre-registered under seal v19)

- **P-A12a (real-lane hit-identity — the production prediction)**: over
  the 1418-step real-lane walk (the A11 protocol), the fallback-aware arm
  and the default arm are judged on identical steps: (i) pooled
  fallback-aware hits == pooled default hits — 0 hit mismatches over the
  1418 paired steps (the pricing's "its real-lane hits == ens2's hits
  exactly"); (ii) the default arm reproduces the A11 run-of-record pin
  1378/1418 (hence fallback-aware == 1378); (iii) wire byte-exactness:
  every fallback-aware response byte-identical to the A12 reference
  expression (exact-ctx step -> priorCounted over the RE-PARSED serialized
  live table; fallback step -> ensemble(ph, pq, 0.5)) — 0 mismatches;
  (iv) channel byte-identity: on every fallback-class step the
  fallback-aware response is byte-identical to the default response, and
  on every exact-ctx-class step byte-identical to the everywhere (A10)
  response — 0 violations (the branch IS the selector between the two
  shipped expressions); (v) the judged-carrying wire sample (first 10
  steps per ledger, 160 calls) byte-identical to the A12 reference — 0
  mismatches. PASS iff all.
- **P-A12b (shift-H2 class preservation — the shift gains hold)**:
  battery protocol, grow-as-used H1->H2, fallback-aware opt-in: pooled
  fallback-aware top-1 >= 298/343 (the A10 pin held or improved — the
  registered class bound: A10's 50 gross gains are ALL exact-ctx rows, so
  the fresh channel still serves and wins there; any A10 protection loss
  sitting on a fallback row converts to the default answer, which can only
  add hits) AND ens2 == 242/343 (the pinned receipt). PASS iff both.
  Contrast receipts (no gates): the exact pooled number; the class
  decomposition of the everywhere-vs-default shift flips (gain/loss x
  exact-ctx/fallback — closes where the 4 A10 protection losses sit);
  per-ledger table.
- **P-A12c (byte-safety — everything shipped stays byte-identical)**:
  (i) with the A12 flag ABSENT, all 1418 walk default responses and all
  602 battery default responses (eval 259 + shift 343) byte-identical to
  the v1 reference expression — 0 mismatches; (ii) A10 mode unchanged:
  with ONLY the A10 opt-in set (loaded-handle path), all 602 battery
  responses byte-identical to the everywhere reference (priorCounted over
  the serve tokens) — 0 mismatches (the new branch must not perturb the
  shipped A10 mode; the artifact-hyper A10 path is bound byte-exact by the
  e_a10 predecessor regression); (iii) precedence: an artifact setting
  BOTH the A12 and A10 flags serves the A12 law on all 602 battery calls,
  and an artifact setting BOTH the A12 and A9 flags serves the A12 law
  (A12 > A10 > A9 in the registered order) — 0 mismatches; (iv) opt-in
  path equality: the artifact-hyper A12 flag == the loaded-handle A12 flag,
  byte-identical on sampled calls — 0 mismatches; (v) eval-slice pins
  through the A12 driver: everywhere micro == 938224, ens2 micro == 953668,
  flips -6/+2; (vi) escalate law: escalate == (top.p(served) < 0.55) on
  EVERY call of the run — 0 violations; (vii) leakage probe: 0 violations
  over the 1418 walk steps; (viii) walk semantics: per-step serialization
  byte-determinism (double serialization, all 16 ledgers), incremental
  walk == prefix re-grow (every 16th step), final walk table == full-ledger
  grow (continuity, 16/16). PASS iff all.
- **P-A12d (house-style bindings)**: (i) weave-core-v2 twin: JS == Python
  byte-identical (9960B == 9960B); the compiled artifact pinned to the
  e_w2 receipt; (ii) the Python --fresh H1 midpoint tables on the REAL
  ledgers byte-equal the JS walk tables 16/16 (the existing garden_ref.py
  --fresh tool, no ref changes); (iii) smoke 9/9; selftest green; (iv)
  predecessor regressions: e_a11 re-runs under the A12 seal with P-A11
  overall == the recorded verdict (FAIL — the honest FAIL of record
  STANDS) and every MEASURED byte of receipts/e_a11.jsonl +
  receipts/e_a10.jsonl reproducing after the stamp-class strip; committed
  receipts of record restored byte-for-byte. PASS iff all.

Contrast receipts (no gates): per-ledger walk table with the
exact-ctx/fallback decomposition; the hit-flip list fallback-aware vs
default (predicted EMPTY on the real lane); A12 escalate load vs the
everywhere 297/1418 = 20.9% and default 32/1418 = 2.3% (the fallback-aware
law escalates exactly as the default does on fallback steps and exactly as
everywhere does on exact-ctx steps); cold-start receipts (k=0 now serves
the v1 law; everywhere served uniform, argmax LINK); the eval-slice
fallback-aware number with its exact-ctx/fallback decomposition (the fresh
channel serves the 243-class outcomes on seen windows, the v1 law the
247-class on unseen — no gate); the shift class decomposition of the A10
protection losses.

Operating point UNCHANGED: H* = ESCALATE_BELOW = 0.55 (escalate organ
only, mode-independent); ens3 weights untouched (0.4/0.4/0.2, the
registered weights); the A7/A8/A9/A10 opt-in flags reused as-is; branch
order as registered above; artifact_sha256 pinned to
1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519; default
law = v1 everywhere. A12 adds ONE serve branch — the priced mechanism —
and nothing else.

Honest-FAIL branches (registered NOW, no threshold surgery): if P-A12a
fails (the real lane is NOT hit-identical), the A11 neutrality receipt was
incomplete — the fallback-aware law does NOT ship, the mode stays an
opt-in trial, and the divergence is receipted; if P-A12b fails (the shift
gains do not hold at the class bound), the class bound was wrong — same
law. In no case does the default law change, and no gate is edited after
the run. An honest FAIL is a pin that moves (the A8/A11 precedent).

### A12 verdicts of record (run 2026-09-28, seal v19; receipts/e_a12.jsonl tip ae294a28960f51fa)

- **P-A12a PASS — the A11-priced production prediction CONFIRMED**: over the
  1418-step real-lane walk (the registered A11 machinery), pooled
  fallback-aware hits == pooled default hits — **1378/1418 == 1378/1418, 0
  hit mismatches over the 1418 paired steps** (delta +0 = +0.0000); the
  default arm reproduces the A11 run-of-record pin 1378 exactly; wire
  byte-exactness: battery mismatches aw/def/ev/leak 0/0/0/0 over 1418 steps
  x4 arms (references rebuilt from the RE-PARSED serialized live table);
  channel byte-identity: 0 fallback-class violations vs the default bytes
  (202 steps) and 0 exact-ctx-class violations vs the everywhere bytes
  (1216 steps) — the branch IS the selector between the two shipped
  expressions, verified byte-for-byte at every step; judged-carrying wire
  sample 160 calls, 0 mismatches (default contrast 0).
- **P-A12b PASS — the shift gains hold at the class bound, and BEAT the
  pin**: grow-as-used shift-H2 battery, fallback-aware pooled **300/343 >=
  298/343** (the registered class bound); everywhere 298/343 (pin
  reproduced) and ens2 242/343 (pinned receipt) both reproduce. The class
  decomposition CLOSES the A10 protection-loss question: everywhere-vs-
  default flips = gains {exact_ctx 64, fallback 0} / losses {exact_ctx 6,
  fallback 2} — ZERO gains sat on fallback rows (the A10 class receipt
  confirmed verbatim), and 2 of the 8 protection losses sat on FALLBACK
  rows, which the fallback-aware law converts to default answers: 300 =
  298 + 2. Per-ledger fallback-aware 60/67, 73/83, 66/83, 101/110.
- **P-A12c PASS — everything shipped stays byte-identical**: with the A12
  flag ABSENT, all 1418 walk default responses + all 602 battery default
  responses byte-identical to the v1 reference (0 mismatches); A10-only
  mode: all 602 battery responses byte-identical to the everywhere
  reference (0 mismatches — the new branch does not perturb the shipped
  mode); precedence: artifacts setting BOTH A12+A10 and BOTH A12+A9 flags
  serve the A12 law on all 602 battery calls each (1204 checked, 0 bad —
  A12 > A10 > A9 as registered); opt-in path equality 32/0 bad; eval pins
  through the A12 driver: everywhere micro 938224 == the A9 receipt pin,
  ens2 micro 953668 == the P-W2b pin, flips -6/+2; escalate law 0
  violations on every call; leakage probe 0 violations over 1418 steps;
  walk semantics exact: serialization byte-determinism 0 bad (double
  serialization at every step), incremental == prefix re-grow 0/95 bad,
  final continuity 16/16.
- **P-A12d PASS — house bindings**: weave-core-v2 twin IDENTICAL (9960B ==
  9960B); artifact pinned to the e_w2 receipt
  (1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519);
  Python --fresh H1 midpoint tables on the REAL ledgers byte-equal the JS
  walk tables 16/16; smoke 9/9; selftest green; the e_a11 predecessor
  regression under the A12 seal: P-A11's verdict of record STANDS (FAIL —
  the honest FAIL is not erased by its repair), P-A11a/b/c PASS
  components reproduce, and every MEASURED byte of receipts/e_a11.jsonl +
  receipts/e_a10.jsonl + both summaries reproduces after the STAMP-CLASS
  strip (top-level seal_v + chain row_hashes + nested *_regression
  .seal_stamps — the exact stamp class the P-A11d audit enumerated, carved
  BEFORE the run: the P-A11d literal-strip lesson executed as registered);
  committed receipts of record restored byte-for-byte.

Verdict of record: **P-A12 PASS (4/4)** — the honest FAIL of A11 priced a
mechanism, the mechanism registered, and the mechanism delivered exactly
the priced prediction: hit-identical to the v1 default on the real lane
(0 flips over 1418), shift gains preserved and improved (300 >= 298),
zero perturbation of any shipped law, zero new constants.

Mechanism receipts (the science of the PASS):

1. **THE DAMAGE CHANNEL IS GONE**: A11's everywhere-live scored
   1261/1418 (reproduced exactly in-run as the byte-safety reference arm) —
   the fallback-aware law scores 1378/1418, byte-identical to the default
   on ALL 202 fallback steps. The −0.0825 production cost A11 measured
   exists ONLY in the prefix-marginal fallback, and A12 never serves it.
2. **SHIFT IMPROVEMENT, MECHANISM VISIBLE**: 300 vs everywhere's 298 —
   the +2 is exactly the 2 fallback-class protection losses converted to
   default answers; the fresh channel keeps every one of its 64
   exact-ctx-class gains (64 exact-ctx gains / 0 fallback gains, 6
   exact-ctx / 2 fallback losses — the A10 interleave story closes with
   the losses classified too).
3. **SATURATED RISK ELIMINATED ON EVAL**: fallback-aware eval slice
   247/259 == the ens2 pin (953668 class) vs everywhere 243/259 (938224):
   the A9/A10 priced cost of −0.0154 (archived memory damaging new soil)
   is also entirely a FALLBACK-class phenomenon on this slice (exact-ctx
   240/249, fallback 7/10). The fallback-aware law dominates plain
   everywhere on BOTH non-production soils measured (eval +4, shift +2)
   at ZERO real-lane cost.
4. **ESCALATE LOAD COLLAPSES (recorded, not executed)**: fallback-aware
   escalates 128/1418 = 9.03% vs everywhere's 297/1418 = 20.9% (default
   32/1418 = 2.3%) — the A11 9x teacher-load signal drops to ~4x, exactly
   as the channel law predicts (fallback steps escalate exactly as the
   default, exact-ctx steps exactly as everywhere). The remaining load is
   the A9 escalation organ operating on memorized-but-uncertain windows;
   receipted as the priced open question (an A13 candidate: whether the
   exact-ctx escalate signal carries teacher value on the real lane).
5. **THE SOIL-LEVEL SELECTOR LAW, NOW FULLY FACTORED**: freshness value is
   a property of the WORLD (A6), and the A12 law is the first serve mode
   that harvests it with zero new constants — the per-step selector is the
   A11 membership classification (has the lane's own memory seen this
   exact window), not a threshold, so no H* calibration question can
   arise: on the train-only soils the objective would be flat exactly as
   A10 proved, because the selector is not a number.

Registered next-step pricing (from the A12 receipts, NOT pre-approved):
A13 candidate — the exact-ctx escalate signal (128 real-lane judgments,
9.03%): teacher-value trial on the escalation organ, RECORDED-only here;
and the composition question — whether a shift-soil lane's registered
hardness declaration should default its opt-in to fallback-aware rather
than plain everywhere (A10's risk line: everywhere pays the 11 A9-open
eval rows -0.0154; fallback-aware pays 0 — the pricing says the
composition strictly dominates, but it is a NEW default question and
needs its own registration).

> Provenance note (seal v20, append-only): the A12 verdict of record was
> determined by the FIRST official run, executed under seal v19
> immediately after the registration commit 7109ea8 (receipt tip
> ae294a28960f51fa, "seal verified (v19)" in the run log). There were NO
> shakedown runs: the first execution of the runner was the run of
> record. The committed receipts/e_a12.jsonl is the v20 re-run executed
> under this seal; its measured bytes are identical to the v19 run of
> record except the stamp-class fields (top-level seal_v and the chain
> row_hashes that witness them — verified in-run before commit). The
> e_a10/e_a11 receipts of record and summaries were restored
> byte-for-byte by the runner itself after the in-run predecessor
> regressions (restored=true receipted in row 1).

## Addendum A13 (2026-09-29, BEFORE the A13 run) — P-A13: the escalation organ under a pre-registered budget cap (the M10+M4 budget-cap header)

**Mine citations in the header (lode mines.jsonl, the M1 novelty gate).**
This registration is the wave-60/61 queue item "jev-garden A13
registration cites M10+M4 for the budget-cap header" — M10's own adoption
hook of record ("lane": "fleet-seeds/lode/engine …; adoption hook:
jev-garden A13 registration (wave-60 queue item 4) cites M10 alongside
M4"). Header cites: **M10** (Regularized RSI, github.com/google-research/
rrsi, paper arXiv:2609.24972; mines.jsonl line 10) — "constrain HOW the
search moves, not WHAT the harness may contain"; its selection-side cost
rule is "added inference cost must be paid for by measured gain" (the
pricing-first law arriving independently at Google Research, externally
replicated PASS in the lode resolution). **M4** (weco AIDE-squared;
mines.jsonl line 4) — "per-lane budget caps become pre-registered
constraints in every registration header, not just policy"; cost-
constraint as selection pressure, the independent theoretical
justification of the pricing-first law.

**Nearest prior (M1 novelty gate): M4.** Delta: M4 is GOVERNANCE-LEVEL —
its measurable claim is registration hygiene across lanes (headers carry
caps; verdicts state spend; new constants need pricing notes), not an
executable mechanism. A13 instantiates the cap as an EXECUTABLE MECHANISM
on the garden's LIVE serve path: an organ-level spend-authority cap with
refusal semantics, byte-safety bindings, and a measured verdict — the
first EXECUTED budget cap in the fleet (M4's own prediction runs through
wave 62 and is measured against registration files, not serve traffic).
Second nearest prior: **M10** (the same cost rule at paper strength,
fleet/RSI scale); delta: A13 is the garden-strength instance — ONE organ,
ONE production walk, deterministic need-side measurement. This addendum
is also M4-compliant FOR ITSELF: its own pre-registered spend cap is
$0.00 external API, 0 teacher calls, 0 tokens — deterministic local
execution only — and the verdict of record must state spend against it.

A12 priced this candidate from its receipts (sealed v20): escalate load
collapsed 20.9% -> 9.03% (128/1418) under the fallback-aware law, and
"the remaining load is the priced A13 open question". The registered
reading: the 128 exact-ctx escalate signals are a spend AUTHORITY the
A12 mode would route to the hosted teacher — richer than the shipped
default's own 32 — and the budget-cap law (M4, M10) says that authority
must be capped and the cap's spend must earn its keep. A13 caps the
escalation organ at the shipped default's own real-lane load of record
and measures, deterministically, whether the capped spend still satisfies
the cost rule's need-side on this soil. The GAIN-side (executing the
granted teacher calls and measuring hit gain) requires the live channel
and its own registration — priced, NOT pre-approved, as the follow-up
candidate. Runs execute under seal v21.

### The registered law (escalation organ, opt-in only; everything shipped stays byte-identical)

- Flag: `hyper.serve.budget.escalate_max_per_walk = 32` — explicit opt-in,
  riding the artifact hyper or the loaded handle; both paths MUST expose
  the same cap value. NO new arm, NO schema change; the compiled weave-v2
  artifact bytes are UNCHANGED (artifact_sha256 stays pinned to the e_w2
  receipt 1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519).
- **The cap value 32 is a NEW constant, introduced WITH its registered
  pricing note (the M4-lawful path — M4's FAIL event is a new constant
  WITHOUT one): 32 = the shipped v1 default's own real-lane escalate load
  of record (the A12 receipt, walk.escalate_default = 32/1418 = 2.3%,
  micro 22567). The law of the cap: the A12 fallback-aware mode may not
  AUTHORIZE more teacher spend per production walk than the shipped
  default already justifies.** The budget is enforced per walk (one
  production stream = the 16-ledger real-lane walk of record), not per
  step.
- Mechanism scope: the cap gates the ESCALATION ORGAN (the teacher-
  routing decision) — NEVER the served expression. src/serve.mjs gains
  exactly (1) ONE one-line flag load (`loaded.escalateBudgetCap =
  artifact.hyper?.serve?.budget?.escalate_max_per_walk` — undefined
  unless pre-registered; artifacts without the flag are untouched) and
  (2) ONE new export, `makeEscalationBudget(cap)` — a fail-closed counter
  organ (`grant(signal)`: a refused grant is COUNTED with the honest
  reason budget_exhausted and never swallowed silently; non-integer or
  negative caps throw). `judge()` is UNTOUCHED: the wire's `escalate`
  field stays the honest local signal (top.p(served) < ESCALATE_BELOW,
  0.55 sealed, reused, mode-independent); the grant/refuse decision rides
  OUTSIDE the response bytes, so a capped organ cannot perturb a served
  judgment by construction.
- Grant law: ARRIVAL ORDER — the first 32 escalate signals of the
  production stream are granted, every later signal is refused with
  reason budget_exhausted. (A live lane cannot reorder its own future; a
  retrospective value-ordered grant law would be a DIFFERENT registration
  — this experiment's P-A13c measures whether arrival-order spend
  satisfies the M10 need-side and prices that law either way.)
- Teacher channel: OUT OF SCOPE (the A11/A12 convention: escalation
  RECORDED not executed). The organ governs spend AUTHORITY on the
  production stream (one judged-free judgment per step); protocol-
  verification calls (the judged-carrying wire sample, the leakage probe)
  are receipted but consume no budget — they are not production
  judgments.

### Protocols of record (reused verbatim; zero new protocol constants)

- Real-lane walk: the REGISTERED A11/A12 protocol, machinery
  byte-for-byte — the 16 git-pinned qcells ledgers (1418 rows) walked in
  arrival order through the shipped serve path; arms.field re-serialized
  from the lane's own receipted prefix [0..k) before every judged-free
  serve call (grow-as-used); per-ledger chains; cold start = the
  registered law (an empty aggregate is the FALLBACK class: the v1 law at
  k=0); judged-free, leakage probe per step on the trial arm (the
  judgment must never read the row under judgment); judged-carrying wire
  sample = first 10 steps per ledger (the A8/A9 wire convention);
  serialization byte-determinism, incremental walk == prefix re-grow
  (every 16th step), final table == full-ledger grow (continuity, 16/16).
- Arms: **arm C** = fallback-aware (the A12 opt-in, loaded-handle path) +
  the budget organ at cap 32 — the A13 trial arm; **arm U** =
  fallback-aware uncapped — recomputed in-run as the byte-safety
  reference (its pins must reproduce the A12 run of record); **arm D** =
  default (all flags ABSENT — must load escalateBudgetCap undefined).
- References rebuilt from the RE-PARSED serialized table (the registered
  A12 convention): the fallback_aware reference expression and the v1
  reference expression — proving in-run that the serve.mjs edit changed
  no served byte.
- Predecessor regression: e_a12_fallback_aware.mjs re-runs under the A13
  seal (its own registered protocol already re-runs e_a11_real_lane.mjs,
  which re-runs e_a10_fresh_everywhere.mjs, which re-checks the e_a9
  receipt — one spawn binds the whole predecessor chain); P-A12's
  verdict of record must STAND (PASS) with P-A12a–d PASS reproducing;
  every MEASURED byte of receipts/e_a12.jsonl, receipts/e_a11.jsonl and
  receipts/e_a10.jsonl must reproduce after stripping the STAMP-CLASS
  fields — top-level seal_v, the chain row_hashes that witness them, AND
  the nested *_regression.seal_stamps arrays (the exact stamp class the
  A11 P-A11d audit enumerated, carved BEFORE the run); the committed
  receipts of record and summaries are restored byte-for-byte after the
  check (append-only). Eval-slice pins are NOT re-registered here — the
  predecessor regression re-verifies them under the A13 seal.

### Predictions (pre-registered under seal v21)

- **P-A13a (the cap binds; spend exactness — the M4 header executed)**:
  over the 1418-step real-lane walk with cap B = 32: (i) the organ grants
  EXACTLY 32 escalations and refuses EXACTLY 96 (from the A12 receipts of
  record: fallback-aware escalate signals = 128, the default's own load =
  32, hence refused = 128 − 32 = 96 — the cap BINDS on this soil; a cap
  that did not bind would make the experiment vacuous); (ii) every
  refusal carries the honest wire signal (escalate = true) with grant =
  false and reason budget_exhausted — the cap never hides a signal; (iii)
  the granted set is EXACTLY the first 32 signals in arrival order (the
  registered grant law — a prefix of the signal stream); (iv) final organ
  counters exactly {spent: 32, refused: 96}. PASS iff all.
- **P-A13b (the budget-cap law: capping does not degrade the gate metric
  — the pre-stated threshold is ZERO)**: (i) the capped arm's responses
  are byte-identical to the uncapped arm's responses on ALL 1418 steps —
  0 mismatches (the organ gates the teacher decision, never the served
  expression); (ii) wire byte-exactness: every capped-arm response
  byte-identical to the A12 fallback-aware reference expression and every
  default-arm response byte-identical to the v1 reference expression —
  0 mismatches each (the serve.mjs edit changed no served byte); (iii)
  hit degradation EXACTLY 0: capped hits == uncapped hits == 1378/1418
  (the registered A11/A12 default pin) — the stated bound is 0 hit flips,
  the strictest honest bound (the cap must not perturb the judgment at
  all); (iv) the escalate SIGNAL is cap-independent: on every step,
  arm C's escalate field == arm U's escalate field — 0 violations; (v)
  the default arm is untouched: flag absent, escalateBudgetCap loads
  undefined, all 1418 default responses byte-identical to the v1
  reference; (vi) escalate law: escalate ⇔ top.p(served) < 0.55 on every
  call — 0 violations; (vii) leakage probe: 0 violations over the 1418
  walk steps; (viii) opt-in path equality: the artifact-hyper A13 flag ==
  the loaded-handle A13 flag (same loaded cap value; byte-identical
  responses on sampled calls); (ix) the judged-carrying wire sample
  (first 10 steps per ledger, 160 calls) byte-identical C-vs-U — 0
  mismatches. PASS iff all.
- **P-A13c (the M10 cost rule, need-side, on this soil)**: from the
  per-signal receipt (every escalate signal's top.p, exact-ctx class,
  granted/refused): mean top.p of the 32 GRANTED signals <= mean top.p of
  the 96 REFUSED signals (micro-rounded) — under a scarce budget the
  organ's granted spend must buy AT LEAST as much uncertainty coverage as
  the refused set it displaces (M10: added inference cost must be paid
  for by measured gain; with the gain leg priced separately, the
  deterministic need-leg is uncertainty concentration). PASS iff
  granted-uncertainty >= refused-uncertainty. Honest-FAIL branch
  registered NOW: if mean top.p(granted) > mean top.p(refused),
  arrival-order spend is ANTI-CONCENTRATED on this soil — the cap wastes
  its scarce slots on early, more-confident windows; the verdict FAILs
  and prices a value-ordered grant law as a NEW registration (no
  threshold surgery, no post-hoc re-grading, no grant-law edit after the
  run).
- **P-A13d (house-style bindings)**: (i) weave-core-v2 twin: JS ==
  Python byte-identical; the compiled artifact pinned to the e_w2
  receipt; (ii) the Python --fresh H1 midpoint tables on the REAL ledgers
  byte-equal the JS walk tables 16/16 (the existing garden_ref.py --fresh
  tool, no ref changes); (iii) smoke 9/9; selftest green; (iv)
  predecessor regressions: e_a12 re-runs under the A13 seal with P-A12
  overall == the recorded verdict (PASS stands, P-A12a–d PASS reproduce)
  and every MEASURED byte of receipts/e_a12.jsonl + receipts/e_a11.jsonl
  + receipts/e_a10.jsonl reproducing after the stamp-class strip;
  committed receipts of record restored byte-for-byte. PASS iff all.

Contrast receipts (no gates): the per-signal table (ledger, k, i,
exact-ctx class, top.p micro, granted) — the honest per-row receipt;
per-ledger grant/refuse table; the granted-set ledger distribution vs the
signal-set distribution; mean/median top.p over granted vs refused vs all
128 signals; the organ-spend fraction of the capped arm (32/1418 = 2.3%
micro 22567 == the default's own load of record — the cap makes the trial
arm cost the SAME teacher load the shipped default already pays, the M4
header law stated as a measured number); the class decomposition of
granted vs refused (exact-ctx counts); a pointer receipt that A12's
second priced candidate (the shift-soil composition default question)
remains OPEN and needs its own registration.

Operating point UNCHANGED: H* = ESCALATE_BELOW = 0.55 (escalate SIGNAL
only, mode-independent); ens3 weights untouched (0.4/0.4/0.2); the
A7/A8/A9/A10/A12 opt-in flags reused as-is; branch order as registered in
A12; artifact_sha256 pinned to
1bbc4fa7cc7a69726db28378507dafad9679d391ff9555bee98d110fe5902519; default
law = v1 everywhere. A13 adds ONE organ export + ONE flag load — the
priced mechanism — and nothing else.

Honest-FAIL branches (registered NOW, no threshold surgery): if P-A13a
fails (the cap does not bind or the spend counters drift), the organ
machinery is wrong — fix is a NEW registration, never an edit; if P-A13b
fails (capping perturbs a served byte or a hit), the organ leaks into the
serve path — the A13 law is refuted as implemented and the mechanism is
withdrawn from any ship consideration; if P-A13c fails (arrival-order
spend is anti-concentrated), the M10 need-side is NOT satisfied by this
grant law and a value-ordered grant law is priced. In no case does the
default law change, and no gate is edited after the run. An honest FAIL
is a pin that moves (the A8/A11 precedent).

### A13 verdicts of record (run of record 2026-09-29, seal v21, tip
d46a0a1c711f1dd1; committed receipt = the v22 re-run, tip 8feac72e248b7c3f —
see the receipt-of-record provenance note)

> Provenance note (append-only): the first execution of the runner (immediately
> after registration commit 244b9cc, seal v21) was killed by a sandbox
> infrastructure timeout mid-predecessor-regression — no receipt, no summary,
> no measured artifact was written, the working tree stayed clean, and NO gate
> was touched (the registered gates are immutable in 244b9cc, predating every
> execution). The run of record is the first COMPLETED execution, also under
> seal v21, with zero code changes between the two executions (git-verified).
> Receipts and the summary are written in the runner's final step, so an
> infra-kill mid-run writes nothing — a kill cannot leave a partial artifact.
>
> Provenance note (seal v22, append-only — receipt-of-record): the committed
> receipts/e_a13.jsonl is the v22 re-run executed under this seal (tip
> 8feac72e248b7c3f, row-1 seal_v 22 — the stamp class re-keys the chain vs the
> v21 run of record, exactly the A12 v19→v20 pattern). Its measured bytes are
> identical to the v21 run of record except the stamp-class fields (top-level
> seal_v, the chain row_hashes that witness them, and the nested
> e_a12_regression.seal_stamps — verified by the registered strip, carved
> before the comparison; the v21 tip d46a0a1c711f1dd1 was independently
> re-reproduced by a v21-state re-run of the unchanged committed runner). A
> further independent v22 execution reproduced the committed receipt
> byte-for-byte (receipt file sha256 95c937ccdda80ce4…). No gate, threshold,
> or registered constant was touched at any point.

- **P-A13a PASS — the cap binds; spend exactness (the M4 header, executed)**:
  over the 1418-step real-lane walk the organ received exactly the **128**
  escalate signals of the A12 record and, at cap B = 32, granted **exactly 32**
  and refused **exactly 96** (128 − 32, the registered derivation); every
  refusal carried the honest wire signal (escalate = true) with reason
  **budget_exhausted** (never swallowed); the granted set is EXACTLY the first
  32 signals in arrival order (prefix law true); final counters exactly
  {cap: 32, spent: 32, refused: 96, reason: budget_exhausted}. The cap BINDS
  on this soil — the experiment is not vacuous.
- **P-A13b PASS — the budget-cap law: capping does not degrade the gate
  metric, at the pre-stated threshold of ZERO**: the capped arm's responses
  are byte-identical to the uncapped arm's on ALL 1418 steps (0 mismatches) —
  the organ gates the teacher decision, never the served expression, exactly
  as registered; wire byte-exactness: capped == the A12 fallback-aware
  reference expression and default == the v1 reference expression (0
  mismatches each — the serve.mjs edit changed no served byte); **hit
  degradation exactly 0: capped == uncapped == default == 1378/1418** (the
  registered pin reproduced through the A13 driver); the escalate SIGNAL is
  cap-independent (0 violations over 1418 paired arms); the default arm is
  untouched (flag absent, escalateBudgetCap loads undefined); escalate law 0
  violations; leakage 0 over 1418 steps; serialization determinism 0 bad;
  incremental walk == prefix re-grow 0/95 bad; final continuity 0 bad (16/16);
  opt-in path equality (artifact-hyper == loaded-handle, A12+A13 flags) 32
  checked / 0 bad; judged-carrying wire sample 160 calls, 0 mismatches
  (c-vs-u and c-vs-reference).
- **P-A13c PASS — the M10 cost rule (need-side) holds on this soil**:
  mean top.p of the 32 GRANTED signals **0.425716** <= mean top.p of the 96
  REFUSED signals **0.428008** (all-128 mean 0.427435) — the arrival-order
  granted spend bought AT LEAST as much uncertainty coverage as the displaced
  set. Honest mechanism receipts (no gates): (a) the granted slots live in
  the walk's EARLY ledgers (bell 8, crossed_measure 7, crx_case 7, forget_bell
  8, ghz3 2 — then exhaustion; the arrival-order law made visible), and on
  THIS soil the early windows are slightly more uncertain than the later ones,
  so the mean rule holds — a SOIL FACT, not a law guarantee; a different soil
  could flip it, which is exactly what the registered FAIL branch priced; (b)
  the MEDIAN runs the other way (granted 0.456173 vs refused 0.454545) — the
  registered gate is the mean, the median is receipted honestly as contrast,
  no gate was moved; (c) the class mix is perfectly proportional: granted
  {exact-ctx 24, fallback 8} == refused {exact-ctx 72, fallback 24} == the
  signal population's own 3:1 mix — arrival order sampled the population
  fairly on this soil.
- **P-A13d PASS — house bindings**: weave-core-v2 twin JS == Python
  byte-identical (9960B == 9960B); the compiled artifact pinned to the e_w2
  receipt; Python --fresh H1 midpoint tables on the REAL ledgers byte-equal
  the JS walk tables 16/16; smoke 9/9; selftest green; e_a12 predecessor
  regression under the A13 seal: P-A12 verdict of record (PASS) STANDS with
  P-A12a–d PASS reproducing; every MEASURED byte of receipts/e_a12.jsonl +
  receipts/e_a11.jsonl + receipts/e_a10.jsonl + the three summaries
  reproduces after the stamp-class strip (seal stamps a12 20 → 21 — the only
  differences are the registered stamp class); committed receipts of record
  restored byte-for-byte (restored = true).

**The M4 header law, stated as a measured number**: the capped arm's teacher
spend authority is 32/1418 = 2.3% (micro 22567) — EXACTLY the shipped v1
default's own real-lane escalate load of record (micro 22567): the richer
A12 signal is brought to the same teacher budget the shipped default already
justifies, at zero judgment cost (hit degradation exactly 0) and with the
granted spend satisfying the M10 need-side on this soil. **Spend against
this registration's own cap (M4 compliance): $0.00 external API, 0 teacher
calls, 0 tokens — deterministic local execution only; cap not approached
(0/0).** The fallback-aware mode still ships OPT-IN; the served default
stays the v1 law; the escalation organ's budget rides as a pre-registered
artifact constant, undefined unless a lane opts in. Priced next (NOT
pre-approved): (1) the GAIN-side leg — executing the 32 granted teacher
calls (live channel, usage-receipted) and measuring hit gain against the
walk, its own registration; (2) A12's composition default question (receipted
open above). Verdict of record: **P-A13 PASS (4/4)** — the budget-cap header
is no longer policy: it is an executed, receipted, byte-safe mechanism, and
the first fleet budget cap with a measured verdict.
