// src/teacher.mjs — the escalation organ: hosted JEV (TypeSafe systemone
// wire, jev-quilt/JEV_TUTORIAL.md). The ONLY networked module; never
// invoked by tests. Every call records a usage receipt (pricing-first law):
// gifted compute must leave receipts.

const BASE = 'https://api.typesafe.ai';

export async function teacherJudge({ state, questions, model = 'jev-latest' }) {
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) throw new Error('TYPESAFE_API_KEY missing — teacher channel closed (fail-closed)');
  const t0 = process.hrtime.bigint();
  const res = await fetch(`${BASE}/v1/systemone`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, state, questions }),
  });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`teacher HTTP ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
    err.http = res.status;
    throw err;
  }
  const receipt = {
    model: body.model ?? model,
    usage: body.usage ?? null,
    latency_ms: Math.round(ms * 1000) / 1000,
    answers: body.answers ?? null,
  };
  return receipt; // caller appends receipt + answers to the growth journal
}
