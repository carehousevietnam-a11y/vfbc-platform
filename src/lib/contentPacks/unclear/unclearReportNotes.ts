import { rgb, type PDFDocument, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { drawTaxBaseGlyphText } from "@/lib/contentPacks/tax/taxReportNotes";
import type { CrmActivityLike } from "@/lib/adminVerifyMypageFields";
import { UNCLEAR_CONTENT_FINAL } from "./unclearContentFinal.data";
import { restoreUnclearAnswersFromVerifyMeta, selectedUnclearRoute } from "./unclearPack";

function answersOf(activities: CrmActivityLike[]): Record<string, string> {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const restored = restoreUnclearAnswersFromVerifyMeta(meta as Record<string, unknown>);
    if (restored) return restored;
  }
  return {};
}

export function drawUnclearReportNotes(input: {
  activities: CrmActivityLike[];
  doc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  startPage: PDFPage;
  startY: number;
  pageWidth: number;
  pageHeight: number;
  marginX: number;
  bodyMinY: number;
  watermark: PDFImage;
}): PDFPage[] {
  const route = selectedUnclearRoute(answersOf(input.activities));
  if (!route) return [];
  const guide = UNCLEAR_CONTENT_FINAL.reportGuide.routes[route];
  const lines = [
    UNCLEAR_CONTENT_FINAL.reportGuide.title,
    ...guide.checklist.rows.map((row) => `${row.name} — ${row.why}`),
    guide.order.flow,
    ...guide.questions.items.map((item) => item.text),
    UNCLEAR_CONTENT_FINAL.reportFixed.missingFileNotice,
  ];
  const page = input.doc.addPage([input.pageWidth, input.pageHeight]);
  page.drawImage(input.watermark, {
    x: input.pageWidth / 2 - 90,
    y: input.pageHeight / 2 - 90,
    width: 180,
    height: 180,
    opacity: 0.05,
  });
  let y = input.pageHeight - 72;
  const ink = rgb(0.22, 0.22, 0.24);
  for (const line of lines) {
    if (!line.trim() || y < input.bodyMinY) break;
    drawTaxBaseGlyphText(page, line.slice(0, 90), input.marginX, y, 9, input.font, ink);
    y -= 16;
  }
  return [page];
}
