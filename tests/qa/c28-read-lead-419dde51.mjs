/**
 * C2.8 — read-only DB + storage metadata for test lead 419dde51
 * Run: node tests/qa/c28-read-lead-419dde51.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const LEAD_ID = "419dde51-96c2-4b4e-88d9-1407f0ca9992";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(repoRoot, ".env.local");

const ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY = "admin_phase2_documents_upload_complete";
const REAL_ESTATE_PACK_GRADE2_META_KEY = "real_estate_pack_grade2";

function loadEnv() {
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
}

function findLatestMetaString(activities, key) {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const raw = meta[key];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

function listPhase2UploadRefs(activities, leadId) {
  const prefix = `document-upload/${leadId}/`;
  const refs = [];
  for (const row of activities) {
    if (row.action !== "document_upload") continue;
    const meta = row.meta && typeof row.meta === "object" ? row.meta : {};
    const storagePath = typeof meta.storagePath === "string" ? meta.storagePath : "";
    const fileName = typeof meta.fileName === "string" ? meta.fileName : "";
    if (!storagePath.startsWith(prefix) || !fileName.trim()) continue;
    refs.push({
      tag: typeof row.tag === "string" && row.tag.trim() ? row.tag : fileName,
      fileName,
      storagePath,
      documentLabel: typeof meta.documentLabel === "string" && meta.documentLabel.trim() ? meta.documentLabel.trim() : null,
    });
  }
  return refs;
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
  "storagePath",
  "file_name",
  "submitted_document",
];

function summarizeVerifyMeta(meta) {
  if (!meta || typeof meta !== "object") return null;
  const out = {};
  for (const key of META_KEYS) {
    if (key === "admin_verify_answers_json") {
      const raw = meta[key];
      if (typeof raw === "string") {
        try {
          out[key] = { key_count: Object.keys(JSON.parse(raw)).length };
        } catch {
          out[key] = { key_count: "parse_error" };
        }
      } else out[key] = null;
      continue;
    }
    out[key] = meta[key] ?? null;
  }
  return out;
}

loadEnv();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: lead } = await supabase.from("leads").select("id, service_type, created_at, user_id").eq("id", LEAD_ID).maybeSingle();

const { data: activities } = await supabase
  .from("crm_activities")
  .select("id, action, tag, meta, created_at")
  .eq("lead_id", LEAD_ID)
  .order("created_at", { ascending: true });

const verifyLeadRows = (activities ?? []).filter((a) => a.action === "verify_lead");
const latestVerify = verifyLeadRows[verifyLeadRows.length - 1];

const uploadRefs = listPhase2UploadRefs(activities ?? [], LEAD_ID);
const phase2Complete = findLatestMetaString(activities ?? [], ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY) === "1";
const gradeRaw = findLatestMetaString(activities ?? [], REAL_ESTATE_PACK_GRADE2_META_KEY);
const parsedGrade = gradeRaw ? Number.parseInt(gradeRaw, 10) : Number.NaN;

async function listPrefix(prefix) {
  const { data, error } = await supabase.storage.from("documents").list(prefix, { limit: 100 });
  if (error) return { prefix, error: error.message };
  return {
    prefix,
    objects: (data ?? []).map((o) => ({
      name: o.name,
      metadata: o.metadata ? { size: o.metadata.size, mimetype: o.metadata.mimetype } : undefined,
    })),
  };
}

const documentUploadListing = await listPrefix(`document-upload/${LEAD_ID}`);

const phase1Candidates = [];
for (const ext of ["pdf", "png", "jpg", "jpeg", "bin"]) {
  const objectPath = `verify-real-estate/${LEAD_ID}.${ext}`;
  const { data: head } = await supabase.storage.from("documents").list("verify-real-estate", {
    limit: 200,
    search: LEAD_ID,
  });
  if (head?.some((o) => o.name === `${LEAD_ID}.${ext}` || o.name.startsWith(LEAD_ID))) {
    phase1Candidates.push(objectPath);
  }
}
const { data: reList } = await supabase.storage.from("documents").list("verify-real-estate", { limit: 500 });
const phase1Matches = (reList ?? [])
  .filter((o) => o.name && (o.name === LEAD_ID || o.name.startsWith(`${LEAD_ID}.`)))
  .map((o) => ({
    path: `verify-real-estate/${o.name}`,
    metadata: o.metadata ? { size: o.metadata.size, mimetype: o.metadata.mimetype } : undefined,
  }));

const aiReport = (activities ?? []).filter((a) => a.action === "ai_report_request");

const out = {
  lead_id: LEAD_ID,
  queried_at: new Date().toISOString(),
  lead,
  verify_lead_count: verifyLeadRows.length,
  latest_verify_lead: latestVerify
    ? {
        id: latestVerify.id,
        created_at: latestVerify.created_at,
        meta_summary: summarizeVerifyMeta(latestVerify.meta),
      }
    : null,
  document_upload_rows: (activities ?? [])
    .filter((a) => a.action === "document_upload")
    .map((a) => ({
      id: a.id,
      tag: a.tag,
      created_at: a.created_at,
      meta_keys: a.meta && typeof a.meta === "object" ? Object.keys(a.meta) : [],
      storagePath: a.meta?.storagePath ?? null,
      fileName: a.meta?.fileName ?? null,
      documentLabel: a.meta?.documentLabel ?? null,
    })),
  phase2_upload_refs_parsed: uploadRefs,
  mypage_extras_derived: {
    phase2Complete,
    realEstatePackGrade2: Number.isFinite(parsedGrade) ? parsedGrade : null,
    mypage_grade_label:
      Number.isFinite(parsedGrade) ? (parsedGrade >= 2 ? "주의 요망" : "양호") : null,
  },
  ai_report_request: aiReport.map((a) => ({ id: a.id, created_at: a.created_at, tag: a.tag })),
  storage_listings: {
    document_upload_prefix: documentUploadListing,
    verify_real_estate_matches: phase1Matches,
    verify_real_estate_search_note: phase1Candidates,
  },
};

const outDir = path.join(repoRoot, "tests", "qa", "_output");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "c28-db-419dde51.json"), JSON.stringify(out, null, 2), "utf8");
console.log(JSON.stringify(out, null, 2));
