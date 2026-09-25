/**
 * LEVEL 3 — CASE_01 STEP2-1 engine spot.
 * Run: node tests/qa/case01-step2-1-spot.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

await import("./case01-step2-1-spot.impl.mjs");
