/**
 * Lock checks: standards hash, service-type coverage of the shared meta API.
 * Run alone: node scripts/harness-standards.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCKED = ["docs/master/STANDARDS.md", "docs/master/QUESTION_STANDARD.md"];
const HASH_FILE = "docs/master/.standards.sha256";

function sha(rel) {
  const text = fs.readFileSync(path.join(root, rel), "utf8").replace(/\r\n/g, "\n");
  return crypto.hash("sha256", text);
}

export function standardsLockHits() {
  const hits = [];
  const hashPath = path.join(root, HASH_FILE);
  if (!fs.existsSync(hashPath)) return [`missing ${HASH_FILE}`];
  const saved = new Map(
    fs
      .readFileSync(hashPath, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [hash, file] = line.split(/\s+/);
        return [file, hash];
      }),
  );
  for (const rel of LOCKED) {
    if (!fs.existsSync(path.join(root, rel))) {
      hits.push(`missing ${rel}`);
      continue;
    }
    if (saved.get(rel) !== sha(rel)) hits.push(`changed ${rel}`);
  }
  return hits;
}

export function writeStandardsHash() {
  const lines = LOCKED.map((rel) => `${sha(rel)} ${rel}`);
  fs.writeFileSync(path.join(root, HASH_FILE), `${lines.join("\n")}\n`, "utf8");
}

/** Every verify service page type must be allowed by the shared phase-2 API. */
export function serviceTypeCoverageHits() {
  const hits = [];
  const verifyDir = path.join(root, "src/app/verify");
  const route = fs.readFileSync(path.join(root, "src/app/api/admin-verify-meta/route.ts"), "utf8");
  for (const entry of fs.readdirSync(verifyDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const page = path.join(verifyDir, entry.name, "page.tsx");
    if (!fs.existsSync(page)) continue;
    const text = fs.readFileSync(page, "utf8");
    const match = text.match(/VERIFY_SERVICE_TYPE\s*=\s*"([^"]+)"/);
    if (!match) continue;
    if (!route.includes(`"${match[1]}"`)) hits.push(`service-type ${match[1]} not allowed in admin-verify-meta`);
  }
  return hits;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--write-hash") {
    writeStandardsHash();
    process.stdout.write("hash written\n");
  } else {
    const all = [...standardsLockHits(), ...serviceTypeCoverageHits()];
    process.stdout.write(all.length ? `FAIL ${all.join(" | ")}\n` : "PASS harness-standards\n");
    process.exit(all.length ? 1 : 0);
  }
}
