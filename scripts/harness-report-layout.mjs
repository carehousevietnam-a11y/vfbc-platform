/**
 * Fraud/unclear report PDF layout check (no database, no network).
 * Page 1 must keep KEY RISKS and RECOMMENDED ACTIONS (no "…" clipping) and a clean summary sentence.
 * Run: node scripts/harness-report-layout.mjs
 */
import { ensureTsxRuntime } from "../tests/qa/_ensure-tsx-runtime.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

ensureTsxRuntime(import.meta.url);

const { buildMypagePdfBytesForQaHarness } = await import("../src/lib/mypagePdfExecutiveRender.ts");
const fraud = await import("../src/lib/contentPacks/fraud/fraudPack.ts");
const unclear = await import("../src/lib/contentPacks/unclear/unclearPack.ts");
const trc = await import("../src/lib/contentPacks/trc/trcPack.ts");
const wp = await import("../src/lib/contentPacks/wp/wpPack.ts");
const tamtru = await import("../src/lib/contentPacks/tamtru/tamtruPack.ts");
const license = await import("../src/lib/contentPacks/license/licensePack.ts");
const company = await import("../src/lib/contentPacks/company/companyPack.ts");
const restaurant = await import("../src/lib/contentPacks/restaurant/restaurantPack.ts");
const { ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY } = await import("../src/lib/adminVerifyProfiling.ts");

const leadId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const createdAt = "2026-01-01T00:00:00.000Z";
const jobs = [
  ["fraud", "verify_fraud", fraud.FRAUD_CONTENT_FINAL, fraud.buildFraudPhase2PersistMeta],
  ["unclear", "verify_unclear", unclear.UNCLEAR_CONTENT_FINAL, unclear.buildUnclearPhase2PersistMeta],
  ["trc", "verify_trc", trc.TRC_CONTENT_FINAL, trc.buildTrcPhase2PersistMeta],
  ["wp", "verify_wp", wp.WP_CONTENT_FINAL, wp.buildWpPhase2PersistMeta],
  ["tamtru", "verify_tamtru", tamtru.TAMTRU_CONTENT_FINAL, tamtru.buildTamtruPhase2PersistMeta],
  ["license", "verify_license", license.LICENSE_CONTENT_FINAL, license.buildLicensePhase2PersistMeta],
  ["company", "verify_company", company.COMPANY_CONTENT_FINAL, company.buildCompanyPhase2PersistMeta],
  ["restaurant", "verify_restaurant", restaurant.RESTAURANT_CONTENT_FINAL, restaurant.buildRestaurantPhase2PersistMeta],
];

function pageOneText(pdfPath) {
  const py = [
    "import sys",
    "from pypdf import PdfReader",
    "r = PdfReader(sys.argv[1])",
    "sys.stdout.buffer.write((r.pages[0].extract_text() or '').encode('utf-8'))",
  ].join("\n");
  const result = spawnSync("python", ["-c", py, pdfPath], { env: { ...process.env, PYTHONUTF8: "1" } });
  if (result.status !== 0) throw new Error(String(result.stderr || "pypdf failed"));
  return result.stdout.toString("utf8");
}

const only = process.argv[2] ?? "";
const hits = [];
const DENSITY_MAX_LINES = 14; // actions/risks block, wrapped lines
const work = fs.mkdtempSync(path.join(os.tmpdir(), "vfbcai-report-layout-"));
try {
  for (const [name, serviceType, content, build] of jobs) {
    const routes = [...new Set(content.questions.map((q) => q.route))];
    for (const route of routes) {
      const entry = content.entry ? content.entry.choices.find((c) => c.route === route) : null;
      for (const paid of [false, true]) {
        const answers = entry ? { [content.entry.id]: entry.value } : {};
        for (const q of content.questions) {
          if (q.route !== route) continue;
          if (!paid && q.phase !== 1) continue;
          answers[q.id] = q.choices[0].value;
        }
        const tag0 = `${name}-${route}-${paid ? "paid" : "free"}`;
        if (only && !tag0.startsWith(only)) continue;
        const meta = build(answers, paid ? 2 : 1);
        if (paid) meta[ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY] = "1";
        const bytes = await buildMypagePdfBytesForQaHarness({
          leadId, serviceType, result: "conditional", createdAt,
          activities: [{ action: "verify_lead", meta, created_at: createdAt }],
        });
        const file = path.join(work, `${name}-${route}-${paid ? "paid" : "free"}.pdf`);
        fs.writeFileSync(file, bytes);
        const text = pageOneText(file);
        const tag = `${name}-${route}-${paid ? "paid" : "free"}`;
        const lines = text.split(/\r?\n/).map((l) => l.trim());
        if (lines.some((l) => l === "…")) hits.push(`${tag} clipped`);
        const at = lines.findIndex((l) => l === "RECOMMENDED ACTIONS");
        if (at < 0 || !lines.slice(at + 2).some((l) => l && !l.startsWith("EXECUTIVE DASHBOARD"))) {
          hits.push(`${tag} no-actions`);
        }
        if (/습니다입니다|다입니다\./.test(text)) hits.push(`${tag} summary-grammar`);
        // A14 information density: key blocks must stay short (long filler loses readers).
        const rk = lines.findIndex((l) => l === "KEY RISKS & GAPS");
        if (rk >= 0 && at > rk && at - rk - 2 > DENSITY_MAX_LINES) hits.push(`${tag} risks-too-long`);
        if (at >= 0) {
          const rest = lines.slice(at + 2);
          const stop = rest.findIndex((l) => l === "MANDATORY DOCUMENTS");
          const tail = (stop >= 0 ? rest.slice(0, stop) : rest).filter((l) => l && !l.startsWith("EXECUTIVE DASHBOARD"));
          if (tail.length > DENSITY_MAX_LINES) hits.push(`${tag} actions-too-long`);
        }
      }
    }
  }
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
process.stdout.write(hits.length ? `FAIL ${hits.join(" | ")}\n` : "PASS harness-report-layout\n");
process.exit(hits.length ? 1 : 0);
