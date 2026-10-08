import fs from "fs";
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

const all = [];
for (const caseId of CASES) {
  const keys = new Map();
  const tables = bundle.risks[caseId];
  for (const tier of ["special", "expert", "caution", "check"]) {
    for (const row of tables?.[tier] ?? []) {
      for (const { field, token } of parseTrigger(row.trigger)) {
        const r = matchOption(caseId, token);
        const f = field && field.startsWith("re0") ? field : r?.field ?? field;
        const val = r?.value ?? token;
        const label = r?.label ?? "";
        if (!f || !val) continue;
        keys.set(`${f}=${val}`, { field: f, value: val, label });
      }
    }
  }
  for (const [key, v] of keys) {
    all.push({ caseId, key, label: v.label, field: v.field, value: v.value });
  }
}
fs.writeFileSync("docs/content-packs/proposals/RE_PHASE2_FACT2_KEYS.json", JSON.stringify(all, null, 2));
console.log("wrote", all.length, "keys");
