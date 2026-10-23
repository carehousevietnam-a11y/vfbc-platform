/**
 * 배포 Content Pack 슬롯 검증. 비어 있으면 통과, 내용이 있으면 규칙 위반 시 exit 1.
 */
import { ensureTsxRuntime } from "../tests/qa/_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

const { ACCOUNTING_FUNNEL_PACKS } = await import("../src/lib/accounting/funnel/contentPackData.ts");
const { validateAccountingFunnelBundle } = await import("../src/lib/accounting/funnel/validateContentPack.ts");

const result = validateAccountingFunnelBundle(ACCOUNTING_FUNNEL_PACKS);
if (!result.ok) {
  console.error("accounting funnel pack validation failed");
  for (const [id, r] of Object.entries(result.byEntry)) {
    if (!r.ok) console.error(id, r.errors.join("; "));
  }
  process.exit(1);
}
