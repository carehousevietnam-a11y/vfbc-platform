/**
 * C2.8 PDF harness impl (tsx runtime)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";
import { bindAdminVerifyPaidEvidenceMeasureFonts } from "../../src/lib/adminVerifyMypageFields.ts";
import { ensureMypageExecutivePdfMeasureFonts, getMypageExecutivePdfMeasureFontsSync } from "../../src/lib/mypagePdfExecutiveMeasureFonts.ts";
import { buildMypagePdfBytesForQaHarness } from "../../src/lib/mypagePdfExecutiveRender.ts";
import { buildRealEstateVerifyAiReportContentFromActivities } from "../../src/lib/contentPacks/realEstate/realEstateVerifyPdfContent.ts";

const LEAD_ID = "419dde51-96c2-4b4e-88d9-1407f0ca9992";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(path.join(repoRoot, "package.json"));
const { PDFParse } = require("pdf-parse");

function loadEnv() {
  const text = fs.readFileSync(path.join(repoRoot, ".env.local"), "utf8");
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
loadEnv();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: activities } = await supabase
  .from("crm_activities")
  .select("action, meta, created_at")
  .eq("lead_id", LEAD_ID)
  .order("created_at", { ascending: true });

const crmRows = (activities ?? []).map((a) => ({
  action: a.action,
  meta: a.meta,
  created_at: a.created_at,
}));

const verifyRow = [...crmRows].reverse().find((a) => a.action === "verify_lead");
const meta = verifyRow?.meta ?? {};
const summaryFull = typeof meta.real_estate_pack_phase2_summary === "string" ? meta.real_estate_pack_phase2_summary : "";

await ensureMypageExecutivePdfMeasureFonts();
bindAdminVerifyPaidEvidenceMeasureFonts(getMypageExecutivePdfMeasureFontsSync());

const harness = {
  leadId: LEAD_ID,
  serviceType: "verify_real-estate",
  result: "conditional",
  createdAt: "2026-01-01T00:00:00.000Z",
  activities: crmRows,
};

const bytes = await buildMypagePdfBytesForQaHarness(harness);
const parser = new PDFParse({ data: Buffer.from(bytes) });
const parsed = await parser.getText();
await parser.destroy();
const text = parsed.text ?? "";

const report = buildRealEstateVerifyAiReportContentFromActivities(crmRows, LEAD_ID);

const outDir = path.join(repoRoot, "tests", "qa", "_output");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "c28-pdf-419dde51.pdf"), Buffer.from(bytes));
fs.writeFileSync(path.join(outDir, "c28-text-419dde51.txt"), text, "utf8");

const norm = (s) => s.replace(/\s+/g, "");
const stats = {
  pdf_bytes: bytes.byteLength,
  pdf_sig: Buffer.from(bytes).subarray(0, 4).toString("utf8") === "%PDF",
  text_len: text.length,
  glyph_hits: /□|\uFFFD/.test(text) ? 1 : 0,
  receipt_vf: /VF419DDE51/i.test(text.replace(/\s/g, "")),
  summary_in_pdf: summaryFull ? norm(text).includes(norm(summaryFull.slice(0, 60))) : false,
  grade2_meta: meta.real_estate_pack_grade2,
  upload_refs_in_activities: crmRows.filter((a) => a.action === "document_upload").length,
  http_verified: false,
};

console.log(JSON.stringify({ stats, report_exec_first: report?.execSummary?.[0] }, null, 2));
