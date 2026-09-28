// src/canon.mjs — canonical JSON, hashing, fnv1a-64 (the crab/qcells chain basis),
// and the LCG fallback stream. No wall-clock, no Math.random anywhere.

import { createHash } from 'node:crypto';

export function canonicalJSON(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return '[' + value.map(canonicalJSON).join(',') + ']';
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJSON(value[k])).join(',') + '}';
}

export function sha256Hex(s) {
  return createHash('sha256').update(s).digest('hex');
}

export function chainHash(row, prevHash) {
  const { row_hash, ...rest } = row;
  return sha256Hex(canonicalJSON([prevHash, rest]));
}

// FNV-1a 64-bit (BigInt) — the fleet's chain basis (crab-traps / qcells).
export function fnv1a64(str) {
  let h = 0xcbf29ce484222325n;
  const p = 0x100000001b3n;
  const m = (1n << 64n) - 1n;
  for (let i = 0; i < str.length; i++) {
    h ^= BigInt(str.charCodeAt(i) & 0xff);
    h = (h * p) & m;
  }
  return h;
}

// Deterministic fallback stream (moth-seal LABELED fallback — no quantum
// provenance claimed; the comet cert channel returned incomplete payloads
// in wave 49, receipted there).
export class LCG {
  constructor(seedHex = '00000000jevgarden') {
    this.s = fnv1a64(String(seedHex)) & ((1n << 64n) - 1n);
  }
  next() {
    this.s = (this.s * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n);
    return Number(this.s >> 33n) / 2 ** 31; // [0,1)
  }
  int(n) { return Math.floor(this.next() * n); }
}

// Round to 6 decimals (epoch-quantisation: cross-substrate weave stability).
export function r6(x) { return Math.round(x * 1e6) / 1e6; }
