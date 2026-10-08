/**
 * Lists risk trigger tokens vs phase2Fact2 keys (C2.3d audit).
 */
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import { REAL_ESTATE_FIRST_RESULT_PACK_META } from "../../src/lib/contentPacks/realEstate/generated/meta.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bundle = realEstatePackBundle();

function triggerTokens(trigger) {
  const out = [];
  for (const chunk of trigger.split("+")) {
    const t = chunk.trim().replace(/`/g, "");
    if (!t) continue;
    if (t.includes("=")) {
      const [lhs, rhs] = t.split("=").map((s) => s.trim());
      for (const v of (rhs ?? "").split("|")) {
        const x = v.trim();
        if (x) out.push({ key: `${lhs}=${x}`, token: x, field: lhs });
      }
    } else {
      out.push({ key: t, token: t, field: null });
    }
  }
  return out;
}

function phase2FieldIds(caseId) {
  return new Set((bundle.nodes[caseId] ?? []).filter((n) => n.phase === 2).map((n) => n.id));
}

for (const caseId of CASES) {
  const dict = REAL_ESTATE_FIRST_RESULT_PACK_META[caseId]?.phase2Fact2 ?? {};
  const p2fields = phase2FieldIds(caseId);
  const tables = bundle.risks[caseId];
  const needed = new Map();
  for (const tier of ["special", "expert", "caution", "check"]) {
    for (const row of tables?.[tier] ?? []) {
      for (const t of triggerTokens(row.trigger)) {
        const isP2 =
          (t.field && p2fields.has(t.field)) ||
          (!t.field && (bundle.nodes[caseId] ?? []).some((n) => n.phase === 2 && n.options?.some((o) => o.value === t.token)));
        if (!isP2 && t.field && !p2fields.has(t.field)) {
          const n1 = bundle.nodes[caseId]?.find((n) => n.phase === 1);
          if (!t.field.startsWith("re0")) continue;
        }
        needed.set(t.key, t);
      }
    }
  }
  let have = 0;
  const missing = [];
  for (const [key, t] of needed) {
    if (dict[key] || dict[t.token]) have++;
    else missing.push(key);
  }
  console.log(
    JSON.stringify({ caseId, trigger_keys: needed.size, have, missing_count: missing.length, missing: missing.slice(0, 30) }),
  );
}
