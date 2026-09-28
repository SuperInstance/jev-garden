# DESIGN — the organism

Status: charter. Written BEFORE the first experiment (see PREDICTIONS.md
and registration.json seals). The design may be amended only by append
(dated addenda), never by editing verdicts after the fact.

## 0. Names and lineage (honest interpretation register)

The founder's directive said: "the ultimate jev model training system,
streamlined for quilt architecture, that grows as it's used in quilt and
uses idle compute time to compile its exoj into a more utile tool for
their next inferencing... a living model that's kinda both [vector
embedding and torch] but through distribution reasoning and understanding
emerges... beyond the pincher idea."

Registered readings, with sources from our own repos:

- **JEV** = Joint Embedding Validator (jev-quilt/JEV_TUTORIAL.md): answers
  `noul` / `choice` / `score` about a state with probabilities. In exoj's
  charter the JEV is *also* "the inference engine that only ever emits soft
  deformations" into the field. The garden implements both roles as one
  organism: judging = emitting a soft deformation; only explicit
  observation collapses.
- **exoj** = the external non-collapsing scratch-paper (SuperInstance/exoj,
  seed charter verbatim in its README): hex lattice, amplitudes
  (γ crystallisation, η possibility, Δ creativity), conservation Σ≤1,
  creative band Δ∈[0.4,0.6], soft parallel writes, content-addressed
  deformations, field-as-proof-object.
- **pincher** = SuperInstance/quilt-pincher, "a reflex engine built entirely
  from Quilt cells" — fixed instincts. The garden goes beyond: instincts
  that grow from use and are priced against sealed alternatives.
- **idle compute** = two senses, both used: (1) in-process idle time (the
  weaver compiles when the garden is not serving), (2) fleet idle compute
  (GitHub Codespaces exercised through the fleet's own
  codespace-worker.sh harness — receipted separately).
- **"kinda both"** = the rhizome IS the embedding (but relational and
  non-collapsing, not a frozen vector) and the vessel head IS the torch
  (but a 40-line deterministic SGD, not a framework). Neither orthodoxy
  is assumed; the bake-off prices them.

## 1. Tissues

### 1.1 Rhizome (non-parametric memory) — `src/field.mjs`

An ExoJ-compatible field (vendored semantics from exoj/core.mjs, with the
`ledger` naturality policy that exoj's own E-X1 experiment crowned: per-cell
commutative α-weighted accumulation, sense-time normalisation, never
mutating the ledger). Cells sit on a hex lattice radius 4 (61 cells).

Growth law: every judgment event appends a deformation to the cell indexed
by a hash of the judgment context (context → lattice coordinate by
pre-registered mapping, §4). Every *observed* outcome (a ground-truth label
arriving from a receipt stream, a teacher answer, or a human REVIEW) calls
`observe()` — the only collapse, and therefore the only place supervision
exists. The stream of deformations/observations is the growth journal:
append-only, hash-chained, content-addressed (the field is the proof
object — exoj law).

Why not vectors: the rhizome stores *deformation events*, not embeddings.
Retrieval is amplitude-weighted (γ mass, creative-band membership) over
lattice neighbourhoods. Memory grows by accretion, never re-indexed.

### 1.2 Vessel heads (parametric tissue) — `src/features.mjs`, `src/heads.mjs`

Tiny heads compiled by the weaver over the growth journal. Substrates:

- **qthe arm**: context symbols are packed into QTHE bytes (τ:2 timbre —
  Ground/Attract/Repel/Abstain; d:6 coordinate). LAYER 0 aggregation is the
  exact integer split-channel: `y_R = Σ_{τ=1} d·x − Σ_{τ=2} d·x`,
  `y_I = Σ_{τ=3} d·x` (QTHE SPEC facts 1-3; exhaustively testable, no
  floats). Judgment = nearest prototype in (y_R, y_I) space; growth = new
  prototype cells, no gradients anywhere.
- **hash arm**: hashed n-gram features (context window k, feature hashing
  into 2^11 buckets, L2-normalised) + softmax head trained by zero-dep JS
  SGD: clipped gradient, weight decay 1e-4, deterministic init (sealed
  seed). Torch-shaped (forward, loss, backward) without torch.
- **field arm** (control): pure rhizome retrieval — amplitude-weighted
  nearest observation votes the opcode. No learning. If this arm is
  competitive, the parametric tissue is earning nothing, and the honest
  verdict says so.
- **bigram baseline** (floor): opcode transition counts. The honest enemy.
- **ens ensemble**: `p = λ·p_head + (1-λ)·p_rhizome_prior`, λ sealed at
  0.5 BEFORE the run. Prices the "kinda both" emergence claim (P-G2).

### 1.3 Weaver (idle cambium) — `src/weaver.mjs`

Runs when the garden is idle (in-process: explicit `weaveIfIdle()`;
fleet-level: codespace-worker harness, receipted separately). Protocol:

1. Diff growth journal since last weave tip (append-only walk).
2. Train challenger heads on the sealed train slice.
3. **Promotion gate** (jeviter lifecycle vocabulary): challenger vs
   incumbent on the sealed eval slice; PROMOTE iff eval top-1 improves by
   ≥ +0.02 absolute AND no eval slice degrades by > 0.05; else DISCARD
   (receipted, kept in the journal — a discarded weave is still a fact).
4. Emit **weave artifact**: self-contained JSON (feature table, head
   weights, rhizome sense table, seal of the journal tip it was compiled
   from). Byte-deterministic: no wall-clock, canonical JSON, chain-tipped.
5. Serve reads weaves for the NEXT inferencing (amortisation: the field's
   accumulated understanding arrives pre-distilled).

### 1.4 Judge (serve) — `src/serve.mjs`

Local JEV endpoint with the TypeSafe `systemone` wire shape:

```json
POST { "state": {...}, "questions": { "q1": {"type":"noul", ...} } }
-> { "answers": { "q1": {"type":"noul", "noul": 0.94, "confidence": 0.81,
     "probabilities": {...} } }, "usage": {"model":"jev-garden/weave-3"} }
```

- `noul` "in-pattern": probability mass the weave puts on the judged row's
  opcode being what a healthy chain produces (1 − anomaly mass).
- `choice` "opcode": argmax over the 7 CELL-MAPPING opcodes with full
  probability table.
- Escalation hook: confidence < 0.55 → route to the hosted teacher
  (jev-quilt wire, `jev-latest`) via `src/teacher.mjs`; the teacher's
  answer is appended to the growth journal as an observed outcome. **The
  garden grows from every escalation** — the hosted JEV becomes the
  labeling organ of the living model. Usage receipts (tokens, cost basis)
  recorded per call, pricing-first law.

### 1.5 Judgment duty — `adapters/qcells.mjs`

Real soil: SuperInstance/quilt-qcells CELL-MAPPING receipt ledgers (16
ledgers, 1418 rows; kinds census: collapse 1264, gate 35, moment 32,
readout 28, view 26, statevector-witness 16, circuit-boundary 16, forget 1;
opcodes LINK/BIND/TICK/EFFECT/VIEW/FORGET/PROOF).

- **Task A (next-opcode)**: walk each ledger; context = previous k=3 rows'
  (kind, op); target = next row's op. Splits: 12 train ledgers, 4 held-out
  eval ledgers (sealed list in PREDICTIONS.md). Small-data honesty: the
  absolute numbers are registered as scale-limited; what is priced is the
  arm ORDER and the ensemble claim, not raw SOTA.
- **Task B (validator duty)**: on copies of the 4 eval ledgers, inject
  impact-sensitive anomalies (quilt-jepa design law (c)): semantic op
  swaps (BIND→EFFECT), seq breaks, prev-hash breaks, arg corruption that
  changes the oracle (e.g. gate name swap on a non-collapse row). Clean
  rows interleaved unchanged. Detector = concentration statistic over a
  window (max per-row surprise in the window, NOT the window mean —
  design law (b)); threshold chosen on TRAIN ledgers only.

## 2. Integration map (the quilt harness)

| Repo | Role in the garden |
|------|--------------------|
| exoj | rhizome semantics (vendored, pin-checked in selftest) |
| quilt-qcells | real receipt soil + first served customer (receipt validation) |
| qthe | the qthe substrate (SPEC facts 1-3 implemented exactly, tested exhaustively) |
| jeviter | promotion lifecycle vocabulary (PROMOTE / REVIEW / DISCARD) |
| jev-quilt | teacher wire (systemone shape) + the hosted JEV as labeling organ |
| quilt-jepa | three design laws: hard world, concentration statistic, impact-sensitive corruption |
| quilt-codespace + codespace-worker | fleet idle-compute harness (weave in a codespace; receipted) |
| quilt-arch | cross-substrate determinism discipline (JS ⟷ Python twin) |
| MicroMoth-quilt | upstream of qcells; the garden's judgment target family |

## 3. Fail-closed discipline

- `registration.json` seals PREDICTIONS.md (sha256 + mtime + size) BEFORE
  any experiment runs; every experiment verifies the seal at startup and
  refuses (exit 2) on mismatch.
- Weaves are chain-tipped; a weave whose journal-tip seal does not match
  the growth journal is refused by serve (fail-closed).
- No wall-clock in artifacts; determinism crown applies to weave bytes.

## 4. Context → lattice mapping (pre-registered)

Context key `kind|op` pairs of the previous k=3 rows are hashed
(fnv1a-64 over canonical string, the crab/qcells chain basis) to a lattice
cell: `cell = cells[ H % 61 ]`. Deformation targets `(γ',η',Δ')`:
γ′ = observed-confidence of the emitting lane (0 if unobserved), η′ = 1−γ′,
Δ′ = 0.5 exactly (creative band centre) unless the event carries a measured
surprise, in which case Δ′ = 0.4 + 0.2·(1 − min(surprise,1)). Fixed BEFORE
runs; amended only by dated addendum.

## Addenda

(none yet — append-only)
