/**
 * C2.8 — PDF from live DB activities for 419dde51 (harness, not HTTP)
 * Run: node tests/qa/c28-pdf-from-db-419dde51.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

await import("./c28-pdf-from-db-419dde51.impl.mjs");
