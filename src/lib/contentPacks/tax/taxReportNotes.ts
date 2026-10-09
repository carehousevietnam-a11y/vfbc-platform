import { rgb, type PDFDocument, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { ADMIN_VERIFY_ANSWERS_META_JSON_KEY } from "@/lib/adminVerifyProfiling";
import { isVerifyAdminPaidAiReportPdfActivities, type CrmActivityLike } from "@/lib/adminVerifyMypageFields";
import { wrapMypageExecutiveParagraphLine } from "@/lib/mypagePdfExecutiveParagraphWrap";
import { TAX_CONTENT_FINAL } from "./taxContentFinal.data";
import { buildTaxProfile, selectedTaxRoute, taxAttachedFileNames } from "./taxPack";

type Guide = typeof TAX_CONTENT_FINAL.reportGuide;
type RouteKey = keyof Guide["routes"];

const HOT_DEADLINE = new Set(["passed_or_imminent", "possibly_passed_or_near"]);

export type TaxReportNoteModel = {
  paid: boolean;
  routeKey: RouteKey;
  showNotice: boolean;
  fileCount: number;
  usedSourceIds: string[];
};

function chipLabel(chips: readonly string[]): string {
  return chips.map((chip) => `[${chip}]`).join("");
}

function routeKeyOf(answers: Record<string, string>): RouteKey {
  const entry = answers[TAX_CONTENT_FINAL.entry.id]?.trim() ?? "";
  if (entry === "o2") return "trade";
  if (entry === "o3") return "company";
  if (entry === "o4") return "unsure";
  return "income";
}

function collectChips(route: Guide["routes"][RouteKey], paid: boolean, showNotice: boolean): string[] {
  const guide = TAX_CONTENT_FINAL.reportGuide;
  const ids = new Set<string>();
  const add = (chips: readonly string[]) => {
    for (const chip of chips) if (chip !== "일반 실무") ids.add(chip);
  };
  if (showNotice) {
    add(guide.notice.chips);
    for (const item of guide.notice.items) add(item.chips);
  }
  for (const row of route.checklist.rows) add(row.chips);
  add(route.order.chips);
  if (paid) {
    for (const row of route.compare.rows) add(row.chips);
    add(route.timeline.chips);
    add(route.timeline.noteChips);
    for (const item of route.misses.items) add(item.chips);
    for (const item of route.questions.items) add(item.chips);
  }
  return guide.sources.rows.map((row) => row.id).filter((id) => ids.has(id));
}

export function buildTaxReportNoteModel(activities: CrmActivityLike[]): TaxReportNoteModel | null {
  const answers = readAnswers(activities);
  if (!selectedTaxRoute(answers)) return null;
  const routeKey = routeKeyOf(answers);
  const profile = buildTaxProfile(answers);
  const deadlineHot = ["deadline_timing", "vat_deadline_timing", "corporate_deadline_timing"].some((field) =>
    HOT_DEADLINE.has(profile[field] ?? ""),
  );
  const noticeTrigger =
    profile.tax_issue_trigger === "notice_or_document_received" ||
    profile.vat_issue_trigger === "authority_or_counterparty_notice" ||
    profile.corporate_issue_trigger === "authority_request";
  const paid = isVerifyAdminPaidAiReportPdfActivities(activities);
  const showNotice = deadlineHot || noticeTrigger;
  return {
    paid,
    routeKey,
    showNotice,
    fileCount: taxAttachedFileNames(activities).length,
    usedSourceIds: collectChips(TAX_CONTENT_FINAL.reportGuide.routes[routeKey], paid, showNotice),
  };
}

function readAnswers(activities: CrmActivityLike[]): Record<string, string> {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const raw = (meta as Record<string, unknown>)[ADMIN_VERIFY_ANSWERS_META_JSON_KEY];
    if (typeof raw !== "string" || !raw.trim()) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      continue;
    }
  }
  return {};
}

export function drawTaxReportNotes(input: {
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
  const model = buildTaxReportNoteModel(input.activities);
  if (!model) return [];
  const guide = TAX_CONTENT_FINAL.reportGuide;
  const route = guide.routes[model.routeKey];
  const extraPages: PDFPage[] = [];
  const navy = rgb(0.09, 0.15, 0.35);
  const gray = rgb(0.52, 0.53, 0.57);
  const ink = rgb(0.22, 0.22, 0.24);
  const hairline = rgb(0.86, 0.865, 0.88);
  const band = rgb(0.965, 0.972, 0.988);
  const headFill = rgb(0.93, 0.94, 0.96);
  const contentWidth = input.pageWidth - input.marginX * 2;
  let page = input.startPage;
  let y = input.startY;

  function nextPage() {
    page = input.doc.addPage([input.pageWidth, input.pageHeight]);
    extraPages.push(page);
    page.drawRectangle({
      x: 0,
      y: input.pageHeight - 4,
      width: input.pageWidth,
      height: 4,
      color: navy,
    });
    page.drawImage(input.watermark, {
      x: (input.pageWidth - 260) / 2,
      y: input.pageHeight / 2 - 70,
      width: 260,
      height: 260,
      opacity: 0.035,
    });
    y = input.pageHeight - 48;
  }

  function ensure(height: number) {
    if (y - height < input.bodyMinY) nextPage();
  }

  function wrap(text: string, size: number, useFont: PDFFont, width: number): string[] {
    const lines = wrapMypageExecutiveParagraphLine(text, size, useFont, width);
    return lines.length > 0 ? lines : [""];
  }

  function drawLines(text: string, size: number, useFont: PDFFont, color: ReturnType<typeof rgb>, x: number, width: number, gap = 3) {
    const lines = wrap(text, size, useFont, width);
    const step = size + gap;
    ensure(lines.length * step);
    for (const line of lines) {
      page.drawText(line, { x, y: y - size, size, font: useFont, color });
      y -= step;
    }
  }

  function drawHeading(title: string) {
    ensure(20);
    y -= 6;
    page.drawRectangle({ x: input.marginX, y: y - 2, width: 3, height: 12, color: navy });
    page.drawText(title, { x: input.marginX + 9, y, size: 10.8, font: input.fontBold, color: navy });
    y -= 16;
  }

  function drawChipLine(text: string, chips: readonly string[]) {
    drawLines(text, 8, input.font, ink, input.marginX, contentWidth);
    drawLines(chipLabel(chips), 7, input.font, gray, input.marginX, contentWidth, 2);
    y -= 3;
  }

  function rowHeight(cells: { text: string; width: number }[], size: number): number {
    const lines = cells.map((cell) => wrap(cell.text, size, input.font, cell.width - 8).length);
    return 8 + Math.max(...lines) * (size + 2);
  }

  function drawRow(cells: { text: string; width: number; header?: boolean }[], height: number, fill: ReturnType<typeof rgb>) {
    let x = input.marginX;
    const top = y;
    page.drawRectangle({
      x,
      y: top - height,
      width: contentWidth,
      height,
      color: fill,
      borderColor: hairline,
      borderWidth: 0.4,
    });
    for (const cell of cells) {
      const lines = wrap(cell.text, 7.2, cell.header ? input.fontBold : input.font, cell.width - 8);
      let textY = top - 12;
      for (const line of lines) {
        page.drawText(line, {
          x: x + 4,
          y: textY,
          size: 7.2,
          font: cell.header ? input.fontBold : input.font,
          color: cell.header ? navy : ink,
        });
        textY -= 9.2;
      }
      x += cell.width;
    }
    y = top - height;
  }

  function drawTable(headers: string[], rows: string[][], rawWidths: number[]) {
    const widths = rawWidths.slice();
    widths[widths.length - 1] += contentWidth - widths.reduce((sum, width) => sum + width, 0);
    const headerCells = headers.map((text, index) => ({ text, width: widths[index], header: true }));
    const paintHeader = () => {
      const height = rowHeight(headerCells, 7.2);
      ensure(height);
      drawRow(headerCells, height, headFill);
    };
    paintHeader();
    for (const row of rows) {
      const cells = row.map((text, index) => ({ text, width: widths[index] }));
      const height = rowHeight(cells, 7.2);
      if (y - height < input.bodyMinY) {
        nextPage();
        paintHeader();
      }
      drawRow(cells, height, rgb(0.992, 0.992, 0.996));
    }
  }

  if (y < input.bodyMinY + 88) nextPage();
  drawLines(guide.title, 13, input.fontBold, navy, input.marginX, contentWidth, 4);
  drawLines(guide.subtitle, 8, input.font, ink, input.marginX, contentWidth);
  drawLines(guide.caption, 7, input.font, gray, input.marginX, contentWidth);
  y -= 6;

  if (model.showNotice) {
    const innerWidth = contentWidth - 20;
    const chunks = [
      wrap(guide.notice.title, 9, input.fontBold, innerWidth).length,
      wrap(guide.notice.flow, 8, input.font, innerWidth).length + 1,
      ...guide.notice.items.map((item) => wrap(item.text, 8, input.font, innerWidth).length + 1),
    ];
    const blockHeight = 14 + chunks.reduce((sum, count) => sum + count * 11, 0) + 6;
    ensure(blockHeight);
    const top = y;
    page.drawRectangle({
      x: input.marginX,
      y: top - blockHeight,
      width: contentWidth,
      height: blockHeight,
      color: band,
      borderColor: hairline,
      borderWidth: 0.6,
    });
    let innerY = top - 14;
    for (const line of wrap(guide.notice.title, 9, input.fontBold, innerWidth)) {
      page.drawText(line, { x: input.marginX + 10, y: innerY, size: 9, font: input.fontBold, color: navy });
      innerY -= 11;
    }
    for (const line of wrap(guide.notice.flow, 8, input.font, innerWidth)) {
      page.drawText(line, { x: input.marginX + 10, y: innerY, size: 8, font: input.font, color: ink });
      innerY -= 11;
    }
    page.drawText(chipLabel(guide.notice.chips), { x: input.marginX + 10, y: innerY, size: 7, font: input.font, color: gray });
    innerY -= 11;
    for (const item of guide.notice.items) {
      for (const line of wrap(item.text, 8, input.font, innerWidth)) {
        page.drawText(line, { x: input.marginX + 10, y: innerY, size: 8, font: input.font, color: ink });
        innerY -= 11;
      }
      page.drawText(chipLabel(item.chips), { x: input.marginX + 10, y: innerY, size: 7, font: input.font, color: gray });
      innerY -= 11;
    }
    y = top - blockHeight - 8;
  }

  drawHeading(route.checklist.title);
  const checkWidths = [168, contentWidth - 214, 46];
  drawTable(
    ["준비 자료", "왜 필요한가", "출처"],
    route.checklist.rows.map((row, index) => [
      index === 0 && model.showNotice ? `${guide.firstMark} ${row.name}` : row.name,
      row.why,
      chipLabel(row.chips),
    ]),
    checkWidths,
  );
  y -= 4;
  drawLines(guide.fileCountTemplate.replace("{n}", String(model.fileCount)), 8, input.font, ink, input.marginX, contentWidth);
  y -= 4;

  drawHeading(route.order.title);
  drawChipLine(route.order.flow, route.order.chips);

  if (model.paid) {
    drawHeading(route.compare.title);
    const compareWidths = [150, 130, contentWidth - 326, 46];
    drawTable(
      ["서류", "대조", "확인할 점", "출처"],
      route.compare.rows.map((row) => [row.left, row.right, row.point, chipLabel(row.chips)]),
      compareWidths,
    );
    y -= 6;
    drawHeading(route.timeline.title);
    drawChipLine(route.timeline.flow, route.timeline.chips);
    drawChipLine(route.timeline.note, route.timeline.noteChips);
    drawHeading(route.misses.title);
    for (const item of route.misses.items) drawChipLine(item.text, item.chips);
    drawHeading(route.questions.title);
    route.questions.items.forEach((item, index) => {
      drawChipLine(`${index + 1}. ${item.text}`, item.chips);
    });
  }

  drawHeading("근거·출처");
  const sourceRows = guide.sources.rows.filter((row) => model.usedSourceIds.includes(row.id));
  const sourceWidths = [28, contentWidth - 246, 90, 70, 58];
  if (sourceRows.length > 0) {
    drawTable(
      ["번호", "자료", "발행처", "성격", "확인일"],
      sourceRows.map((row) => {
        const extra = [...row.urls, row.note].filter(Boolean).join(" ");
        return [row.id, extra ? `${row.name} ${extra}` : row.name, row.publisher, row.kind, guide.sources.confirmedOn];
      }),
      sourceWidths,
    );
  }
  y -= 8;
  ensure(28);
  drawLines(guide.disclaimer, 7.5, input.font, gray, input.marginX, contentWidth);
  return extraPages;
}
