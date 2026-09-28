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
