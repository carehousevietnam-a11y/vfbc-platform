/**
 * LEVEL 3 — CASE_03 STEP2-1 engine spot (+ optional browser in case03-step2-1-browser.mjs).
 * Run: node tests/qa/case03-step2-1-spot.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

await import("./case03-step2-1-spot.impl.mjs");
