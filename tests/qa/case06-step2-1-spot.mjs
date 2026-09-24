/**
 * LEVEL 3 — CASE_06 STEP2-1 engine spot.
 * Run: node tests/qa/case06-step2-1-spot.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

await import("./case06-step2-1-spot.impl.mjs");
