#!/usr/bin/env node
/**
 * Layer J manifest coverage — catalog slug마다 clause 존재 확인.
 * Run: npx --yes tsx tests/qa/admin-verify-judgment-manifest-coverage.mjs
 */
import { assertLayerJManifestCoverage } from "../../src/lib/adminVerifyJudgmentManifest.ts";

try {
  assertLayerJManifestCoverage();
  console.log("PASS: Layer J manifest coverage");
} catch (e) {
  console.error(e);
  process.exit(1);
}
