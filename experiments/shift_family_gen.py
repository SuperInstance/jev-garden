#!/usr/bin/env python3
"""shift_family_gen.py — P-G2d SOIL GENERATOR (construction receipt only, no outcome data).

The wave-50 honest FAILs (P-G2/G2b/G2c) localized: memory-priors need a HARD world.
The 4 sealed eval ledgers give a 95-97% head — too easy (same disease quilt-jepa
round-2 diagnosed in its own substrate). This script builds a NEW circuit family
with transition structure ABSENT from the train soil:

  "ladder echo": deep gate runs interleaved with MID-STREAM readout+sample
  cycles (gate -> measure -> 16-shot collapse block -> gates -> ...), so
  EFFECT->BIND transitions (rare in train, where collapses are terminal)
  and BIND/EFFECT alternation dominate. Multiple VIEW rows mid-stream.

The ledgers are built by the REAL quilt-qcells machinery (CellCircuit on
micromoth), verified by verify_ledger fail-closed, and receipted with
sha256 + row counts. NO judgment code runs here (predictions for P-G2d are
sealed before any garden run touches this soil).
"""
import sys, os, json, hashlib

QCELLS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "quilt-qcells")
sys.path.insert(0, QCELLS)
import qcells  # noqa: E402
from qcells import CellCircuit, verify_ledger, sha256_hex  # noqa: E402
import conformance  # noqa: E402  (carries MICROMOTH_SHA256 + pin-check side effects)

MICROMOTH_SHA256 = conformance.MICROMOTH_SHA256

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs", "shift_family")
os.makedirs(OUT, exist_ok=True)


def ladder_echo(cc, depth, echoes, seed, shots_each=16):
    """Deep entangling ladder interleaved with mid-stream echo sampling cycles.
    micromoth law: a measured qubit accepts no further gates — so echoes measure
    the LAST qubit (aux) while gate blocks continue on the remaining qubits."""
    nq = cc.qc.num_qubits
    q0, q1, aux = 0, min(1, nq - 1), nq - 1
    # deep opening run (no measure) — longer than any train circuit
    cc.h(q0)
    for d in range(depth):
        if d % 3 == 2:
            cc.crx(0.7 + 0.1 * d, q0, q1) if q0 != q1 else cc.x(q0)
        else:
            cc.cx(q0, q1) if q0 != q1 else cc.x(q0)
        cc.rz(0.5 + 0.05 * d, d % (nq - 1 if nq > 1 else 1))
        if d % 4 == 1:
            cc.swap(q0, q1) if q0 != q1 else cc.x(q0)
    for e in range(echoes):
        # mid-stream echo: measure aux, collapse block, then MORE gates on the
        # non-aux qubits (train soil never continues gating after a collapse block)
        cc.measure(aux, e % cc.qc.num_clbits)
        cc.sample(shots_each, seed=seed + e)
        for d in range(2):
            t = (d + e) % (nq - 1) if nq > 1 else 0
            cc.x(t) if (d + e) % 2 == 0 else cc.h(t)
            cc.rz(0.3 + 0.1 * (e + d), t)
        if e % 2 == 1 and nq > 2:
            cc.swap(q0, q1)
        elif e % 2 == 1:
            cc.x(q0)
    cc.measure(q0, 0)
    cc.sample(shots_each, seed=seed + 1000)


SPECS = [
    {"name": "ladder7_echo3",  "n": 2, "m": 2, "depth": 7, "echoes": 3, "seed": 101},
    {"name": "ladder8_echo4",  "n": 2, "m": 2, "depth": 8, "echoes": 4, "seed": 103},
    {"name": "ladder9_echo4",  "n": 3, "m": 3, "depth": 9, "echoes": 4, "seed": 107},
    {"name": "ladder8_echo6",  "n": 2, "m": 2, "depth": 8, "echoes": 6, "seed": 109},
]

receipt = {"generator": "shift_family_gen.py", "family": "ladder-echo",
           "machinery": "quilt-qcells CellCircuit + verify_ledger",
           "micromoth_sha256": MICROMOTH_SHA256, "ledgers": []}
for spec in SPECS:
    cc = CellCircuit(spec["n"], spec["m"], name=spec["name"],
                     shots_plan={"shots": None, "seed_policy": "sealed"},
                     simulator_sha256=MICROMOTH_SHA256)
    ladder_echo(cc, spec["depth"], spec["echoes"], spec["seed"])
    cc.seal()
    cc.proof(precision=12)
    data = cc.ledger.export()
    ok = verify_ledger(data)
    if not ok:
        print(f"FAIL verify: {spec['name']}"); sys.exit(2)
    path = os.path.join(OUT, spec["name"] + ".jsonl")
    with open(path, "wb") as f:
        f.write(data)
    rows = [json.loads(l) for l in data.decode().split("\n") if l.strip()]
    from collections import Counter
    ops = Counter(r["op"] for r in rows)
    receipt["ledgers"].append({
        "name": spec["name"], "file": spec["name"] + ".jsonl",
        "sha256": hashlib.sha256(data).hexdigest(), "rows": len(rows),
        "op_counts": dict(ops), "verify": "PASS",
    })
    print(f"{spec['name']}: rows={len(rows)} ops={dict(ops)} verify=PASS")

with open(os.path.join(OUT, "construction_receipt.json"), "w") as f:
    json.dump(receipt, f, indent=1)
print("construction receipt written (no outcome data — predictions still unsealed)")
