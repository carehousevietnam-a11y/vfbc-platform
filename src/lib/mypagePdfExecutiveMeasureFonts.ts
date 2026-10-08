import { PDFDocument, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

export type MypageExecutivePdfMeasureFonts = {
  regular: PDFFont;
  bold: PDFFont;
};

let fontsPromise: Promise<MypageExecutivePdfMeasureFonts> | null = null;
let fontsSyncCache: MypageExecutivePdfMeasureFonts | null = null;

async function loadFonts(): Promise<MypageExecutivePdfMeasureFonts> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regularBytes = fs.readFileSync(
    path.join(process.cwd(), "public/fonts/Pretendard-Regular.ttf"),
  );
  const boldBytes = fs.readFileSync(path.join(process.cwd(), "public/fonts/Pretendard-Bold.ttf"));
  const regular = await doc.embedFont(regularBytes);
  const bold = await doc.embedFont(boldBytes);
  return { regular, bold };
}

export async function ensureMypageExecutivePdfMeasureFonts(): Promise<MypageExecutivePdfMeasureFonts> {
  if (fontsSyncCache) return fontsSyncCache;
  if (!fontsPromise) {
    fontsPromise = loadFonts().then((fonts) => {
      fontsSyncCache = fonts;
      return fonts;
    });
  }
  return fontsPromise;
}

export function getMypageExecutivePdfMeasureFontsSync(): MypageExecutivePdfMeasureFonts {
  if (!fontsSyncCache) {
    throw new Error(
      "Mypage executive PDF measure fonts not loaded — call ensureMypageExecutivePdfMeasureFonts() first",
    );
  }
  return fontsSyncCache;
}
