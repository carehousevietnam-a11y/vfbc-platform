/**
 * C2.7 V1 — read-only Supabase lead meta (no secrets in stdout)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(repoRoot, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8");
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
    if (!process.env[key]) process.env[key] = val;
  }
  return true;
}

const META_KEYS = [
  "real_estate_pack_v1",
  "real_estate_pack_case_id",
  "admin_verify_answers_json",
  "admin_verify_profile_phase",
  "admin_phase2_documents_upload_complete",
  "admin_phase2_documents_any_uploaded",
  "real_estate_pack_grade2",
  "real_estate_pack_phase2_summary",
  "real_estate_pack_caution_count",
  "real_estate_pack_headline",
];

function summarizeMeta(meta) {
  if (!meta || typeof meta !== "object") return { error: "meta_missing" };
  const out = {};
  for (const key of META_KEYS) {
    const raw = meta[key];
    if (raw === undefined || raw === null) {
      out[key] = null;
      continue;
    }
    if (key === "admin_verify_answers_json" && typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        out[key] = { key_count: Object.keys(parsed).length };
      } catch {
        out[key] = { key_count: "parse_error" };
      }
      continue;
    }
    out[key] = raw;
  }
  return out;
}

async function latestVerifyLeadMeta(supabase, leadId) {
  const { data, error } = await supabase
    .from("crm_activities")
    .select("id, action, created_at, meta")
    .eq("lead_id", leadId)
    .eq("action", "verify_lead")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "no_verify_lead_activity" };
  return {
    activity_id: data.id,
    created_at: data.created_at,
    meta_summary: summarizeMeta(data.meta),
  };
}

async function findLeadByPrefix(supabase, hex8Prefix) {
  const { data, error } = await supabase
    .from("leads")
    .select("id, service_type, created_at, user_id")
    .ilike("id", `${hex8Prefix}%`)
    .limit(5);
  if (error) return { error: error.message };
  return data ?? [];
}

const envLoaded = loadEnvFile(envPath);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const result = {
  env_local_loaded: envLoaded,
  supabase_configured: Boolean(url && serviceKey),
  queried_at: new Date().toISOString(),
  protected_leads: {},
  errors: [],
};

if (!url || !serviceKey) {
  result.errors.push("missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BAF_ID = "baf27218-d562-4722-b665-77e1064bf981";
result.protected_leads.baf27218 = await latestVerifyLeadMeta(supabase, BAF_ID);

const f718 = await findLeadByPrefix(supabase, "f718f264");
result.protected_leads.vff718f264_search = f718;
if (Array.isArray(f718) && f718.length === 1) {
  result.protected_leads.vff718f264 = await latestVerifyLeadMeta(supabase, f718[0].id);
} else if (Array.isArray(f718) && f718.length > 1) {
  result.protected_leads.vff718f264 = { ambiguous: f718.map((r) => r.id) };
}

const c389 = "c3891ac4-3eca-4a58-b2b4-1df45c940bef";
result.protected_leads.c3891ac4_exists = await supabase
  .from("leads")
  .select("id")
  .eq("id", c389)
  .maybeSingle();

console.log(JSON.stringify(result, null, 2));
