/**
 * Admin VERIFY — engine-driven strict browser QA (product code frozen)
 * Phase1/2 clicks from Engine option labels only — no blind clickFirstStitch
 *
 * Run: node tests/qa/admin-verify-strict-full-v2.mjs
 * (auto re-invokes via npx tsx for src/lib/*.ts imports)
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

await import("./admin-verify-strict-full-v2.impl.mjs");
