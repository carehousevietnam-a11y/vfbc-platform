import { rgb, type PDFDocument, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { ADMIN_VERIFY_ANSWERS_META_JSON_KEY } from "@/lib/adminVerifyProfiling";
import { isVerifyAdminPaidAiReportPdfActivities, type CrmActivityLike } from "@/lib/adminVerifyMypageFields";
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
    const safeWidth = Math.max(12, width);
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push("");
        continue;
      }
      let current = "";
      const pushFitted = (piece: string) => {
        const candidate = current ? `${current} ${piece}` : piece;
        if (useFont.widthOfTextAtSize(candidate, size) <= safeWidth) {
          current = candidate;
          return;
        }
        if (current) {
          lines.push(current);
          current = "";
        }
        if (useFont.widthOfTextAtSize(piece, size) <= safeWidth) {
          current = piece;
          return;
        }
        let rest = piece;
        while (rest.length > 0) {
          let lo = 1;
          let hi = rest.length;
          while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2);
            if (useFont.widthOfTextAtSize(rest.slice(0, mid), size) <= safeWidth) lo = mid;
            else hi = mid - 1;
          }
          lines.push(rest.slice(0, Math.max(1, lo)));
          rest = rest.slice(Math.max(1, lo));
        }
      };
      for (const word of words) pushFitted(word);
      if (current) lines.push(current);
    }
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

  const cellSize = 7.2;
  const cellStep = 10.4;
  const cellPadTop = 7;
  const cellPadBottom = 6;

  function cellTextWidth(width: number): number {
    return Math.max(8, width - 14);
  }

  function rowHeight(cells: { text: string; width: number }[]): number {
    const lines = cells.map((cell) => wrap(cell.text, cellSize, input.font, cellTextWidth(cell.width)).length);
    return cellPadTop + cellPadBottom + Math.max(1, ...lines) * cellStep;
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
      const useFont = cell.header ? input.fontBold : input.font;
      const lines = wrap(cell.text, cellSize, useFont, cellTextWidth(cell.width));
      let textY = top - cellPadTop - cellSize;
      for (const line of lines) {
        page.drawText(line, {
          x: x + 6,
          y: textY,
          size: cellSize,
          font: useFont,
          color: cell.header ? navy : ink,
        });
        textY -= cellStep;
      }
      x += cell.width;
    }
    y = top - height;
  }

  function drawTable(headers: string[], rows: string[][], rawWidths: number[], tailReserve = 0) {
    if (rows.length === 0) return;
    const widths = rawWidths.slice();
    widths[widths.length - 1] += contentWidth - widths.reduce((sum, width) => sum + width, 0);
    const headerCells = headers.map((text, index) => ({ text, width: widths[index], header: true }));
    const headerHeight = rowHeight(headerCells);
    let headerOnPage = false;
    const paintHeader = () => {
      drawRow(headerCells, headerHeight, headFill);
      headerOnPage = true;
    };
    rows.forEach((row, index) => {
      const cells = row.map((text, cellIndex) => ({ text, width: widths[cellIndex] }));
      const height = rowHeight(cells);
      const reserve = index === rows.length - 1 ? tailReserve : 0;
      const need = (headerOnPage ? 0 : headerHeight) + height + reserve;
      if (y - need < input.bodyMinY) {
        nextPage();
        headerOnPage = false;
      }
      if (!headerOnPage) paintHeader();
      drawRow(cells, height, rgb(0.992, 0.992, 0.996));
    });
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
  const checkWidths = [156, contentWidth - 220, 64];
  drawTable(
    ["준비 자료", "왜 필요한가", "출처"],
    route.checklist.rows.map((row, index) => [
      index === 0 && model.showNotice ? `${guide.firstMark} ${row.name}` : row.name,
      row.why,
      chipLabel(row.chips),
    ]),
    checkWidths,
  );
  y -= 6;
  drawLines(guide.fileCountTemplate.replace("{n}", String(model.fileCount)), 8, input.font, ink, input.marginX, contentWidth);
  y -= 6;

  drawHeading(route.order.title);
  drawChipLine(route.order.flow, route.order.chips);

  if (model.paid) {
    drawHeading(route.compare.title);
    const compareWidths = [146, 122, contentWidth - 328, 60];
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

  const sourceRows = guide.sources.rows.filter((row) => model.usedSourceIds.includes(row.id));
  const publisherWidth = 128;
  const kindWidth = 72;
  const dateWidth = 62;
  const numberWidth = 36;
  const sourceWidths = [
    numberWidth,
    contentWidth - numberWidth - publisherWidth - kindWidth - dateWidth,
    publisherWidth,
    kindWidth,
    dateWidth,
  ];
  if (sourceRows.length > 0) {
    const headerProbe = ["번호", "자료", "발행처", "성격", "확인일"].map((text, index) => ({
      text,
      width: sourceWidths[index],
    }));
    const first = sourceRows[0];
    const firstMaterial = [first.name, ...first.urls, first.note].filter(Boolean).join("\n");
    const firstProbe = [first.id, firstMaterial, first.publisher, first.kind, guide.sources.confirmedOn].map(
      (text, index) => ({ text, width: sourceWidths[index] }),
    );
    if (y - 28 - rowHeight(headerProbe) - rowHeight(firstProbe) < input.bodyMinY) nextPage();
  }
  drawHeading("근거·출처");
  const disclaimerStep = 7.5 + 3;
  const disclaimerLines = wrap(guide.disclaimer, 7.5, input.font, contentWidth).length;
  const disclaimerBlock = 10 + disclaimerLines * disclaimerStep;
  if (sourceRows.length > 0) {
    drawTable(
      ["번호", "자료", "발행처", "성격", "확인일"],
      sourceRows.map((row) => {
        const material = [row.name, ...row.urls, row.note].filter(Boolean).join("\n");
        return [row.id, material, row.publisher, row.kind, guide.sources.confirmedOn];
      }),
      sourceWidths,
      disclaimerBlock,
    );
  } else if (y - disclaimerBlock < input.bodyMinY) {
    nextPage();
  }
  y -= 10;
  drawLines(guide.disclaimer, 7.5, input.font, gray, input.marginX, contentWidth);
  return extraPages;
}
