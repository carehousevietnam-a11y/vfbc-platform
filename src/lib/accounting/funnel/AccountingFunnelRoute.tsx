import { AccountingFunnelClient } from "./AccountingFunnelClient";
import { isAccountingFunnelEntryEnabled } from "./entryFlags";
import { loadAccountingFunnelEntryPack } from "./loadContentPacks";
import { loadAccountingFunnelEntryResultPack } from "./loadResultPacks";
import type { AccountingFunnelEntryId } from "./types";

type Props = {
  entryId: AccountingFunnelEntryId;
};

export function AccountingFunnelRoute({ entryId }: Props) {
  const enabled = isAccountingFunnelEntryEnabled(entryId);
  const pack = loadAccountingFunnelEntryPack(entryId);
  const resultPack = loadAccountingFunnelEntryResultPack(entryId);
  return (
    <AccountingFunnelClient entryId={entryId} enabled={enabled} pack={pack} resultPack={resultPack} />
  );
}
