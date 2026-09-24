/**
 * LEVEL 3 — CASE_01 bridge Phase1 gate (engine question plan).
 * Run: node tests/qa/case01-bridge-phase1-gate-spot.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

await import("./case01-bridge-phase1-gate-spot.impl.mjs");
