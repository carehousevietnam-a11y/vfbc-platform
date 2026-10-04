/** WalletSection document slot title — legibility (F-11: no vertical clip, up to 2 lines). */
export const MYPAGE_WALLET_SLOT_TITLE_CLASS =
  "line-clamp-2 min-h-[2.75rem] text-[14px] font-extrabold leading-snug break-keep text-slate-900";

export function mypageWalletSlotTitleClassIsLegible(className: string): boolean {
  if (className.includes("truncate")) return false;
  if (className.includes("leading-none")) return false;
  if (className.includes("overflow-hidden") && !className.includes("line-clamp-2")) return false;
  return className.includes("leading-snug") || className.includes("leading-normal");
}
