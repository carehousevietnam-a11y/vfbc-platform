/**
 * C2.3e — list canonical field=value keys + option labels for manual fact2.
 */
import { realEstatePackBundle } from "../src/lib/contentPacks/realEstate/packBundle.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bundle = realEstatePackBundle();

function matchOption(caseId, token) {
  for (const n of bundle.nodes[caseId] ?? []) {
    for (const o of n.options ?? []) {
      const v = o.value;
      const short = v.replace(/^r[0-9]+_/, "");
      if (v === token || short === token || v.endsWith(`_${token}`)) {
        return { field: n.id, value: v, label: o.label, phase: n.phase };
      }
    }
  }
  return null;
}

function parseTrigger(trigger) {
  const out = [];
  const cleaned = trigger.replace(/`/g, "").replace(/\s*=\s*/g, "=");
  if (cleaned.includes("직접 입력")) return out;
  for (const chunk of cleaned.split("+")) {
    for (const part of chunk.split(",")) {
      const t = part.trim();
      if (!t) continue;
      if (t.includes("=")) {
        const eq = t.indexOf("=");
        const field = t.slice(0, eq).trim();
        const rhs = t.slice(eq + 1).trim();
        for (const v of rhs.split("|")) {
          const val = v.trim();
          if (val && /^[a-z0-9_]+$/i.test(val)) out.push({ field, token: val });
        }
      } else if (/^[a-z0-9_]+$/i.test(t)) {
        out.push({ field: null, token: t });
      }
    }
  }
  return out;
}

for (const caseId of CASES) {
  const keys = new Map();
  for (const n of bundle.nodes[caseId] ?? []) {
    if (n.phase !== 2) continue;
    for (const o of n.options ?? []) {
      keys.set(`${n.id}=${o.value}`, { field: n.id, value: o.value, label: o.label });
    }
  }
  const tables = bundle.risks[caseId];
  for (const tier of ["special", "expert", "caution", "check"]) {
    for (const row of tables?.[tier] ?? []) {
      for (const { field, token } of parseTrigger(row.trigger)) {
        const resolved = matchOption(caseId, token);
        if (resolved) {
          keys.set(`${resolved.field}=${resolved.value}`, {
            field: resolved.field,
            value: resolved.value,
            label: resolved.label,
          });
        } else if (field) {
          keys.set(`${field}=${token}`, { field, value: token, label: "" });
        } else {
          const r = matchOption(caseId, token);
          if (r) keys.set(`${r.field}=${r.value}`, { field: r.field, value: r.value, label: r.label });
          else keys.set(token, { field: "", value: token, label: "" });
        }
      }
    }
  }
  console.log(caseId, "keys", keys.size);
  for (const [k, v] of [...keys.entries()].sort()) {
    console.log(JSON.stringify({ key: k, label: v.label?.slice(0, 80) }));
  }
}
