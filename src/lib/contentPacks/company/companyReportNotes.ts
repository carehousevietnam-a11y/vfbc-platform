import { rgb, type PDFDocument, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { drawTaxBaseGlyphText } from "@/lib/contentPacks/tax/taxReportNotes";
import { isVerifyAdminPaidAiReportPdfActivities, type CrmActivityLike } from "@/lib/adminVerifyMypageFields";
import { COMPANY_CONTENT_FINAL } from "./companyContentFinal.data";
import {
  restoreCompanyAnswersFromVerifyMeta,
  companyAttachedFileNames,
  companyRiskSentences,
  companyTierRecommendation,
} from "./companyPack";

function answersOf(activities: CrmActivityLike[]): Record<string, string> {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const restored = restoreCompanyAnswersFromVerifyMeta(meta as Record<string, unknown>);
    if (restored) return restored;
  }
  return {};
}

export function drawCompanyReportNotes(input: {
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
  const answers = answersOf(input.activities);
  if (Object.keys(answers).length === 0) return [];
  const guide = COMPANY_CONTENT_FINAL.reportGuide;
  const paid = isVerifyAdminPaidAiReportPdfActivities(input.activities);
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
    page.drawRectangle({ x: 0, y: input.pageHeight - 4, width: input.pageWidth, height: 4, color: navy });
    page.drawImage(input.watermark, {
      x: (input.pageWidth - 260) / 2,
      y: input.pageHeight / 2 - 70,
      width: 260,
      height: 260,
      opacity: 0.035,
    });
    y = input.pageHeight - 48;
  }

  nextPage();

  function ensure(height: number) {
    if (y - height < input.bodyMinY) nextPage();
  }

  function noteWidth(text: string, size: number, useFont: PDFFont): number {
    let total = 0;
    for (const part of text.split(/([-:])/)) {
      if (part) total += useFont.widthOfTextAtSize(part, size);
    }
    return total;
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
        if (noteWidth(candidate, size, useFont) <= safeWidth) {
          current = candidate;
          return;
        }
        if (current) {
          lines.push(current);
          current = "";
        }
        if (noteWidth(piece, size, useFont) <= safeWidth) {
          current = piece;
          return;
        }
        let rest = piece;
        while (rest.length > 0) {
          let lo = 1;
          let hi = rest.length;
          while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2);
            if (noteWidth(rest.slice(0, mid), size, useFont) <= safeWidth) lo = mid;
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
      drawTaxBaseGlyphText(page, line, x, y - size, size, useFont, color);
      y -= step;
    }
  }

  function drawHeading(title: string, followHeight = 0) {
    const need = 22 + followHeight;
    const pageRoom = input.pageHeight - 48 - input.bodyMinY;
    if (y - need < input.bodyMinY && need <= pageRoom) nextPage();
    y -= 6;
    page.drawRectangle({ x: input.marginX, y: y - 2, width: 3, height: 12, color: navy });
    drawTaxBaseGlyphText(page, title, input.marginX + 9, y, 10.8, input.fontBold, navy);
    y -= 16;
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

  function tableOpenHeight(headers: string[], firstRow: string[], rawWidths: number[]): number {
    const widths = rawWidths.slice();
    widths[widths.length - 1] += contentWidth - widths.reduce((sum, width) => sum + width, 0);
    const headerHeight = rowHeight(headers.map((text, index) => ({ text, width: widths[index] })));
    const row = rowHeight(firstRow.map((text, index) => ({ text, width: widths[index] })));
    return headerHeight + row;
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
        drawTaxBaseGlyphText(page, line, x + 6, textY, cellSize, useFont, cell.header ? navy : ink);
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

  drawHeading("준비 순서", 24);
  COMPANY_CONTENT_FINAL.afterResultGuide.forEach((line, index) => {
    drawLines(`${index + 1}. ${line}`, 8, input.font, ink, input.marginX, contentWidth);
  });
  y -= 4;
  const fileCount = companyAttachedFileNames(input.activities).length;
  drawLines(
    fileCount > 0 ? `첨부된 서류 ${fileCount}건을 기준으로 확인합니다.` : COMPANY_CONTENT_FINAL.reportFixed.missingFileNotice,
    8,
    input.font,
    ink,
    input.marginX,
    contentWidth,
  );
  y -= 8;

  const risks = companyRiskSentences(answers);
  if (risks.length > 0) {
    drawHeading("확인할 점", 14);
    for (const line of risks) drawLines(`· ${line}`, 8, input.font, ink, input.marginX, contentWidth);
    y -= 6;
  }

  if (paid) {
    const tier = companyTierRecommendation(answers);
    drawHeading("추천 서비스 단계", 14);
    drawLines(`참고 · ${tier.label}`, 8.4, input.fontBold, navy, input.marginX, contentWidth);
    y -= 6;
  }

  const sourceHeaders = ["번호", "자료", "발행처", "성격", "확인일"];
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
  const disclaimerBlock = 10 + wrap(guide.disclaimer, 7.5, input.font, contentWidth).length * 10.5;
  const sourceTableRows = guide.sources.rows.map((row, index) => [
    String(index + 1),
    [row.name, ...row.urls].filter(Boolean).join("\n"),
    row.publisher,
    row.kind,
    guide.sources.confirmedOn,
  ]);
  const sourceOpen = sourceTableRows[0]
    ? tableOpenHeight(sourceHeaders, sourceTableRows[0], sourceWidths) + (sourceTableRows.length === 1 ? disclaimerBlock : 0)
    : disclaimerBlock;
  drawHeading("근거·출처", sourceOpen);
  if (sourceTableRows.length > 0) drawTable(sourceHeaders, sourceTableRows, sourceWidths, disclaimerBlock);
  y -= 10;
  drawLines(guide.disclaimer, 7.5, input.font, gray, input.marginX, contentWidth);
  return extraPages;
}
