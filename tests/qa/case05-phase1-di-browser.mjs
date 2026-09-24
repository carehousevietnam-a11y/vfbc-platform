/**
 * CASE_05 Phase1 DI + specific_date text (LEVEL 3).
 * Run: node tests/qa/case05-phase1-di-browser.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

await import("./case05-phase1-di-browser.impl.mjs");
