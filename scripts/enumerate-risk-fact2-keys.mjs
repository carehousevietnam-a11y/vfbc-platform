import { realEstatePackBundle } from "../src/lib/contentPacks/realEstate/packBundle.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bundle = realEstatePackBundle();

function matchOption(caseId, token) {
  for (const n of bundle.nodes[caseId] ?? []) {
    for (const o of n.options ?? []) {
      const v = o.value;
      const short = v.replace(/^r[0-9]+_/, "");
      if (v === token || short === token || v.endsWith(`_${token}`)) {
        return { field: n.id, value: v, label: o.label };
      }
    }
  }
  return null;
}

function parseTrigger(trigger) {
  const out = [];
  const cleaned = trigger.replace(/`/g, "").replace(/\s*=\s*/g, "=");
  if (cleaned.includes("직접 입력") || cleaned.includes("조합일 때")) return out;
  for (const chunk of cleaned.split("+")) {
    for (const part of chunk.split(",")) {
      const t = part.trim();
      if (!t || !/^[a-z0-9_=|]+$/i.test(t.replace(/=/g, ""))) continue;
      if (t.includes("=")) {
        const eq = t.indexOf("=");
        const field = t.slice(0, eq).trim();
        const rhs = t.slice(eq + 1).trim();
        for (const v of rhs.split("|")) {
          const val = v.trim();
          if (val && /^[a-z0-9_]+$/i.test(val)) out.push({ field, token: val });
        }
      } else if (/^[a-z0-9_]+$/i.test(t)) out.push({ field: null, token: t });
    }
  }
  return out;
}

let total = 0;
for (const caseId of CASES) {
  const keys = new Map();
  const tables = bundle.risks[caseId];
  for (const tier of ["special", "expert", "caution", "check"]) {
    for (const row of tables?.[tier] ?? []) {
      for (const { field, token } of parseTrigger(row.trigger)) {
        const resolved = field ? matchOption(caseId, token) ?? { field, value: token, label: "" } : matchOption(caseId, token);
        if (!resolved && field) {
          keys.set(`${field}=${token}`, { label: "" });
        } else if (resolved) {
          const f = field && field.startsWith("re0") ? field : resolved.field;
          const val = resolved.value ?? token;
          keys.set(`${f}=${val}`, { label: resolved.label ?? "" });
          keys.set(val, { label: resolved.label ?? "", alias: true });
        } else {
          keys.set(token, { label: "", alias: true });
        }
      }
    }
  }
  const canonical = [...keys.keys()].filter((k) => k.includes("="));
  console.log(caseId, "canonical", canonical.length, "with_aliases", keys.size);
  total += canonical.length;
}
console.log("total canonical", total);
