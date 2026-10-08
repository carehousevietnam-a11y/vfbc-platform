/**
 * C2.7 — find lead id starting with f718f264 (read-only)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(repoRoot, ".env.local");
const text = fs.readFileSync(envPath, "utf8");
for (const line of text.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const META_KEYS = [
  "real_estate_pack_v1",
  "real_estate_pack_case_id",
  "admin_verify_profile_phase",
  "admin_phase2_documents_upload_complete",
  "admin_phase2_documents_any_uploaded",
  "real_estate_pack_grade2",
  "real_estate_pack_phase2_summary",
  "real_estate_pack_headline",
];

const { data: leads } = await supabase
  .from("leads")
  .select("id, created_at, service_type")
  .eq("service_type", "verify_real-estate")
  .order("created_at", { ascending: false })
  .limit(400);

const matches = (leads ?? []).filter((r) => r.id.toLowerCase().startsWith("f718f264"));
const out = { match_count: matches.length, matches };

if (matches.length === 1) {
  const { data: act } = await supabase
    .from("crm_activities")
    .select("created_at, meta")
    .eq("lead_id", matches[0].id)
    .eq("action", "verify_lead")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const meta = act?.meta && typeof act.meta === "object" ? act.meta : {};
  const summary = {};
  for (const k of META_KEYS) summary[k] = meta[k] ?? null;
  let keyCount = null;
  if (typeof meta.admin_verify_answers_json === "string") {
    try {
      keyCount = Object.keys(JSON.parse(meta.admin_verify_answers_json)).length;
    } catch {
      keyCount = "parse_error";
    }
  }
  out.verify_lead = { created_at: act?.created_at, meta: summary, answers_key_count: keyCount };
}

console.log(JSON.stringify(out, null, 2));
