/**
 * Local probe for the known G-4 golden failure.
 * Does not load env and does not open Supabase.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
let pdfParse = true;
try {
  require.resolve("pdf-parse");
} catch {
  pdfParse = false;
}
const golden = fs.existsSync(path.join(root, "tests/qa/_output/golden-other-32b0231.json"));
if (!pdfParse || !golden) {
  process.stderr.write("g4-golden known: pdf-parse or golden file is absent\n");
  process.exit(1);
}
process.exit(0);
