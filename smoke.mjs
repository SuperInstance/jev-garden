// smoke.mjs — one tiny garden, end to end: grow on a synthetic ledger,
// train arms, weave, serve a systemone-wire judgment, verify the chain.
// Green on every commit (fleet law). ~1s, no network.

import { Rhizome, OPS } from './src/field.mjs';
import { grow, compileWeave, trainBigramFromSamples } from './src/weaver.mjs';
import { loadWeave, judge as serveJudge, ESCALATE_BELOW } from './src/serve.mjs';
import { makeSamples } from './adapters/qcells.mjs';
import { LCG } from './src/canon.mjs';
import { trainHash } from './src/heads.mjs';

let ok = 0, bad = 0;
const check = (name, cond) => { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name); } };

// synthetic soil: two "circuit families" with distinct rhythms
const rows = [];
const rng = new LCG('smoke');
for (let c = 0; c < 2; c++) {
  rows.push({ seq: rows.length, prev: '0', id: 'b' + c, kind: 'circuit-boundary', op: 'LINK', args: { name: 'fam' + c } });
  for (let i = 0; i < 30; i++) {
    const gate = c === 0 ? 'h' : 'cx';
    rows.push({ seq: rows.length, prev: 'x', id: 'g' + c + '_' + i, kind: 'gate', op: 'BIND', args: { op: gate, qubits: [0, 1] } });
    rows.push({ seq: rows.length, prev: 'x', id: 't' + c + '_' + i, kind: 'moment', op: 'TICK', args: { moment: i } });
    if (i % 5 === 4) rows.push({ seq: rows.length, prev: 'x', id: 'r' + c + '_' + i, kind: 'readout', op: 'EFFECT', args: { shots: 8 } });
  }
  rows.push({ seq: rows.length, prev: 'x', id: 'v' + c, kind: 'view', op: 'VIEW', args: {} });
}
const samples = makeSamples(rows);
console.log(`soil: ${rows.length} rows -> ${samples.length} samples`);

const rz = new Rhizome();
grow(rz, samples);
const hashM = trainHash(samples);
const bigramM = trainBigramFromSamples(samples);
const w = compileWeave({ rhizome: rz, trainSamples: samples, evalSamples: samples.slice(0, 10), incumbent: null, weaveIndex: 1, notes: 'smoke weave' });
check('weave promoted', w.gate.verdict === 'PROMOTE');

const loaded = loadWeave(JSON.parse(JSON.stringify(w.artifact)));
const ctx = rows.slice(0, 3);
const out = serveJudge(loaded, { context: ctx }, { q1: { type: 'noul' }, q2: { type: 'choice', criteria: { opcode: true } } }, { kind: 'moment', op: 'TICK' });
check('serve speaks systemone wire', !!(out.answers?.q1?.noul !== undefined && out.answers?.q2?.choice));
check('serve model tag carries weave', /jev-garden\/weave-v1@w1/.test(out.model));
check('escalation gate present', out.escalate === (out.answers.q2.confidence < ESCALATE_BELOW));

const jv = rz.verifyJournal();
check('growth journal verifies', jv.ok && jv.at === rz.journal.length);
const s = rz.sense();
check('field stays open (no collapse in stream)', s.prob_open > 0.99);
check('observations are the only collapses', rz.observations === samples.length);
check('sense conservation', Math.abs(s.gamma + s.eta - 1) < 1e-9);
check('OPS = 7 CELL-MAPPING opcodes', OPS.length === 7);

console.log(`\nsmoke: ${ok} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
