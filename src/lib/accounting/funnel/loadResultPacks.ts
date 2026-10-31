import fs from "node:fs";
import path from "node:path";
import type { AccountingFunnelEntryId, AccountingFunnelResultBundle } from "./types";
import { ACCOUNTING_FUNNEL_ENTRY_IDS } from "./types";

function resultPackPath(): string {
  return path.join(process.cwd(), "docs/master/content/RESULT_PACK_FUNNEL.json");
}

export function loadAccountingFunnelResultBundle(): AccountingFunnelResultBundle {
  const raw = fs.readFileSync(resultPackPath(), "utf8");
  const parsed = JSON.parse(raw) as AccountingFunnelResultBundle;
  for (const id of ACCOUNTING_FUNNEL_ENTRY_IDS) {
    if (!parsed[id] || parsed[id].entry_id !== id) {
      throw new Error(`accounting funnel result pack missing or mismatched entry_id: ${id}`);
    }
  }
  return parsed;
}

export function loadAccountingFunnelEntryResultPack(entryId: AccountingFunnelEntryId) {
  return loadAccountingFunnelResultBundle()[entryId];
}
