import fs from 'fs';
const env = {};
for (const l of fs.readFileSync(process.argv[2], 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const m = l.match(/^([A-Za-z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
const r = await fetch(`${url}/rest/v1/funnel_events?select=service,step,event,device,occurred_at,session_id,lead_id&limit=10000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
if (!r.ok) { console.log('HTTP', r.status, (await r.text()).slice(0, 200)); process.exit(); }
const rows = await r.json();
console.log('total rows', rows.length);
const times = rows.map(x => x.occurred_at).sort();
console.log('range', times[0], '~', times.at(-1));
console.log('sessions', new Set(rows.map(x => x.session_id)).size);
const by = {};
for (const x of rows) { const k = x.service; by[k] ??= { view: 0, submit: 0, maxStep: 0, sessions: new Set() }; by[k][x.event]++; by[k].maxStep = Math.max(by[k].maxStep, x.step); by[k].sessions.add(x.session_id); }
for (const [k, v] of Object.entries(by).sort()) console.log(k.padEnd(28), 'view', v.view, 'submit', v.submit, 'maxStep', v.maxStep, 'sessions', v.sessions.size);
const dev = {}; for (const x of rows) dev[x.device] = (dev[x.device] || 0) + 1; console.log('device', JSON.stringify(dev));
console.log('submit with lead_id', rows.filter(x => x.event === 'submit' && x.lead_id).length, '/ submit', rows.filter(x => x.event === 'submit').length);
