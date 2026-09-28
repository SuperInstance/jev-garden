#!/usr/bin/env python3
"""ref/garden_ref.py — the Python twin (P-G5 cross-substrate determinism).

Replicates the garden's JS pipeline EXACTLY for the hash-arm weave core:
fnv1a-64 (UTF-16 code units, low byte), canonical JSON (sorted keys, compact,
raw non-ASCII), the growth journal chain, arg-channel tokenisation (K=3),
hashed n-gram features (2^11, signed, L2), zero-init softmax SGD with
epoch quantisation (Math.round semantics: floor(v+0.5)), and weights
serialised as INTEGER MICRO-UNITS (micro = floor(w*1e6 + 0.5)) so that
float repr never crosses the substrate boundary.

Usage: python3 garden_ref.py <ledgers_dir> <out_json>
"""
import json, hashlib, math, sys, os
from pathlib import Path

M64 = (1 << 64) - 1

def fnv1a64(s: str) -> int:
    h = 0xcbf29ce484222325
    for ch in s:
        h ^= ord(ch) & 0xFF
        h = (h * 0x100000001B3) & M64
    return h

def canonical(v) -> str:
    if v is None or isinstance(v, (bool, int, float, str)):
        return json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    if isinstance(v, list):
        return '[' + ','.join(canonical(x) for x in v) + ']'
    keys = sorted(v.keys())
    return '{' + ','.join(json.dumps(k, ensure_ascii=False) + ':' + canonical(v[k]) for k in keys) + '}'

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

# ---------- tokenisation (arg channel, K=3) ----------
K = 3
PAD = '\u2400/\u2400'  # '␀/␀'

def token_of(row):
    arg = (row.get('args') or {}).get('op')
    return f"{row['kind']}/{row['op']}/{arg}" if arg else f"{row['kind']}/{row['op']}"

def context_tokens(rows, i):
    out = [token_of(rows[j]) for j in range(max(0, i - K), i)]
    while len(out) < K:
        out.insert(0, PAD)
    return out

# ---------- features ----------
HB = 2048

def hash_features(tokens):
    v = [0.0] * HB
    grams = []
    for i, t in enumerate(tokens):
        grams.append(t)
        if i + 1 < len(tokens):
            grams.append(t + '\u223c' + tokens[i + 1])  # '∼'
    for g in grams:
        b = fnv1a64(g) % HB
        sign = 1 if (fnv1a64('#' + g) & 1) == 0 else -1
        v[b] += sign
    nrm = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / nrm for x in v]

# ---------- SGD (identical op order; epoch quantisation) ----------
LR, EPOCHS, WD, CLIP = 0.5, 12, 1e-4, 5.0
OPS = ['LINK', 'BIND', 'TICK', 'EFFECT', 'VIEW', 'FORGET', 'PROOF']

def r6(x):
    return math.floor(x * 1e6 + 0.5) / 1e6  # Math.round semantics

def jnum(x):
    # r6 + integral-float canonicalization: JS JSON.stringify emits 1.0 as "1";
    # Python json.dumps emits "1.0". The twin must match JS byte-for-byte.
    x6 = r6(x)
    xi = int(x6)
    return xi if x6 == xi else x6

def micro(x):
    return math.floor(x * 1e6 + 0.5)  # integer micro-units (serialization)

def train_hash(samples):
    C = len(OPS)
    W = [[0.0] * HB for _ in range(C)]
    b = [0.0] * C
    X = [hash_features(s['tokens']) for s in samples]
    Y = [OPS.index(s['label']) for s in samples]
    for _ep in range(EPOCHS):
        for n in range(len(X)):
            x, y = X[n], Y[n]
            scores = []
            for c in range(C):
                s = b[c]
                w = W[c]
                for i in range(HB):
                    if x[i] != 0:
                        s += w[i] * x[i]
                scores.append(s)
            mxc = max(scores)
            exps = [math.exp(s - mxc) for s in scores]
            Z = 0.0
            for e in exps:
                Z += e
            for c in range(C):
                g = exps[c] / Z - (1.0 if c == y else 0.0)
                gc = max(-CLIP, min(CLIP, g))
                w = W[c]
                for i in range(HB):
                    if x[i] != 0:
                        w[i] -= LR * (gc * x[i] + WD * w[i])
                b[c] -= LR * gc
            # end per-sample
        for c in range(C):
            w = W[c]
            for i in range(HB):
                if w[i] != 0:
                    w[i] = r6(w[i])
            b[c] = r6(b[c])
    return W, b

# ---------- growth journal (deform + observe per sample) ----------
def context_cell(ctx):
    lattice = []
    for q in range(-4, 5):
        for r in range(-4, 5):
            if (abs(q) + abs(q + r) + abs(r)) // 2 <= 4:
                lattice.append(f"{q},{r}")
    return lattice[fnv1a64(ctx) % 61]

def grow_journal(samples):
    journal = []
    prev = 'JEVG-GENESIS'
    seq = 0
    cells = {}  # cellKey -> [G, aSum] — weave-2 (A7): sense-table accumulation
    for s in samples:
        seq += 1
        cell = context_cell(s['ctx'])
        c = cells.setdefault(cell, [0.0, 0.0])
        # deform law (field.mjs): alpha=0.4, gamma=0 -> G += 0.4*0, aSum += 0.4
        c[0] += 0.4 * 0
        c[1] += 0.4
        row = {'seq': seq, 'kind': 'deform', 'context': s['ctx'], 'cell': cell,
               'gamma': 0, 'eta': 1, 'delta': 0.5, 'tag': 'stream'}
        h = sha256_hex(canonical([prev, row]))
        row['row_hash'] = h
        journal.append(row)
        prev = h
        seq += 1
        row2 = {'seq': seq, 'kind': 'observe', 'context': s['ctx'], 'cell': context_cell(s['ctx']),
                'op': s['label'], 'source': 'receipt'}
        h2 = sha256_hex(canonical([prev, row2]))
        row2['row_hash'] = h2
        journal.append(row2)
        prev = h2
    return journal, prev, cells

def sense_table(cells, observed):
    """weave-2 (A7): same shape as field.mjs senseTable() — cells hosting
    >= 1 observed context carry {G, aSum} (r6, integral→int); observed is
    [ctx, {op: count}] sorted bytewise by context, op keys sorted by canonical()."""
    cells_with_obs = sorted({context_cell(ctx) for ctx in observed})
    cell_out = {}
    for k in cells_with_obs:
        G, aSum = cells.get(k, [0.0, 0.0])
        cell_out[k] = {'G': jnum(G), 'aSum': jnum(aSum)}
    obs_out = [[ctx, observed[ctx]] for ctx in sorted(observed)]
    return {'cells': cell_out, 'observed': obs_out}

# ---------- main ----------
def main():
    ledgers_dir, out_path = sys.argv[1], sys.argv[2]
    files = sorted(f for f in os.listdir(ledgers_dir) if f.endswith('.jsonl'))
    train_files, eval_files = files[:12], files[12:]
    samples = []
    for f in train_files:
        rows = [json.loads(l) for l in open(Path(ledgers_dir) / f) if l.strip()]
        for i in range(len(rows)):
            if rows[i]['op'] not in OPS:
                continue
            toks = context_tokens(rows, i)
            samples.append({'tokens': toks, 'ctx': '|'.join(toks), 'label': rows[i]['op'],
                            'prevOp': rows[i - 1]['op'] if i > 0 else '\u2400'})
    journal, tip, cells = grow_journal(samples)
    W, b = train_hash(samples)
    observed = {}
    for s in samples:
        m = observed.setdefault(s['ctx'], {})
        m[s['label']] = m.get(s['label'], 0) + 1
    st = sense_table(cells, observed)
    Wm = []
    for w in W:
        sparse = {}
        for i in range(HB):
            if w[i] != 0:
                sparse[str(i)] = micro(w[i])
        Wm.append(sparse)
    bm = [micro(x) for x in b]
    core = {
        'schema': 'jev-garden/weave-core-v2',
        'index': 1,
        'journal_tip': tip,
        'journal_len': len(journal),
        'hyper': {'lr': 0.5, 'epochs': 12, 'wd': 0.0001, 'clip': 5, 'K': 3, 'HB': 2048, 'ens_lambda': 0.5, 'wormhole_weight': 0.3, 'ens3': {'wf': 0.2, 'wh': 0.4, 'wq': 0.4}},
        'arms': {'hash': {'W': Wm, 'b': bm}, 'field': st},
    }
    Path(out_path).write_text(canonical(core), encoding='utf-8')
    print(f"twin wrote {out_path}: journal_len={len(journal)} tip={tip[:16]} nnz={sum(len(w) for w in Wm)}")

if __name__ == '__main__':
    main()
