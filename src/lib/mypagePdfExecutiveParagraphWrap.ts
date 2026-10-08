import type { PDFFont } from "pdf-lib";

/** EVIDENCE list in mypagePdfExecutiveRender left column. */
export const MYPAGE_PDF_EXECUTIVE_EVIDENCE_LIST_SIZE = 8.3;

export function mypageExecutivePdfFontForLine(
  line: string,
  regularFont: PDFFont,
  boldFont: PDFFont,
): PDFFont {
  if (line.startsWith("■")) return boldFont;
  if (line.startsWith("①") || line.startsWith("②") || line.startsWith("③")) {
    return boldFont;
  }
  if (line.startsWith("[HIGH")) return boldFont;
  if (line.startsWith("[MEDIUM")) return boldFont;
  if (line.startsWith("[LOW")) return boldFont;
  return regularFont;
}

export function wrapMypageExecutiveParagraphLine(
  text: string,
  size: number,
  useFont: PDFFont,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (useFont.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export function wrapMypageExecutiveParagraphListLine(
  line: string,
  size: number,
  regularFont: PDFFont,
  boldFont: PDFFont,
  maxWidth: number,
): string[] {
  const useFont = mypageExecutivePdfFontForLine(line, regularFont, boldFont);
  return wrapMypageExecutiveParagraphLine(line, size, useFont, maxWidth);
}

export function countMypageExecutiveParagraphListRenderLines(
  lines: string[],
  size: number,
  regularFont: PDFFont,
  boldFont: PDFFont,
  maxWidth: number,
): number {
  return lines.reduce(
    (sum, line) =>
      sum + wrapMypageExecutiveParagraphListLine(line, size, regularFont, boldFont, maxWidth).length,
    0,
  );
}
