import fs from "node:fs";
import path from "node:path";
import { ACCOUNTING_FUNNEL_PACKS } from "./contentPackData";
import type { AccountingFunnelEntryId, AccountingFunnelPackBundle } from "./types";
import { ACCOUNTING_FUNNEL_ENTRY_IDS } from "./types";

function fixturePath(): string {
  return path.join(process.cwd(), "tests/accounting/fixtures/accounting-funnel-pack.fixture.json");
}

function readFixtureBundle(): AccountingFunnelPackBundle {
  const raw = fs.readFileSync(fixturePath(), "utf8");
  const parsed = JSON.parse(raw) as AccountingFunnelPackBundle;
  for (const id of ACCOUNTING_FUNNEL_ENTRY_IDS) {
    if (!parsed[id] || parsed[id].entry_id !== id) {
      throw new Error(`accounting funnel fixture missing or mismatched entry_id: ${id}`);
    }
  }
  return parsed;
}

/** 서버·빌드 시점 Pack. 테스트는 ACCOUNTING_FUNNEL_PACK_FIXTURE=1 로 fixture만 로드한다. */
export function loadAccountingFunnelPackBundle(): AccountingFunnelPackBundle {
  if (process.env.ACCOUNTING_FUNNEL_PACK_FIXTURE === "1") {
    return readFixtureBundle();
  }
  return ACCOUNTING_FUNNEL_PACKS;
}

export function loadAccountingFunnelEntryPack(entryId: AccountingFunnelEntryId) {
  return loadAccountingFunnelPackBundle()[entryId];
}
