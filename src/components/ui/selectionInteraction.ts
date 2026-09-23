import { cn } from "@/lib/cn";

/** 선택 카드/칩 공통 — border-2, hover·selected lift, font-medium + ~85% 텍스트 선명도 */
export function selectionSurfaceClasses(
  selected: boolean,
  opts?: { disabled?: boolean; rounded?: string },
) {
  const rounded = opts?.rounded ?? "rounded-xl";

  return cn(
    "border-2 bg-white transition-all duration-200 ease-out",
    rounded,
    selected
      ? "-translate-y-0.5 border-[#0B2A6B] bg-[#F8FAFF] shadow-[0_4px_14px_rgba(11,42,107,0.16)]"
      : "translate-y-0 border-[#E5E7EB] hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0_2px_10px_rgba(15,23,42,0.08)]",
    opts?.disabled &&
      "cursor-not-allowed opacity-50 hover:translate-y-0 hover:border-[#E5E7EB] hover:shadow-none",
  );
}

export function selectionTitleClasses(selected: boolean) {
  return cn(
    "break-keep font-medium leading-snug",
    selected ? "text-[#0F172A]/85" : "text-[#334155]",
  );
}

export function selectionDescClasses(selected: boolean) {
  return cn(
    "break-keep leading-[1.45] font-normal",
    selected ? "text-[#556070]/85" : "text-[#556070]",
  );
}

/** 예/아니오 등 compact 선택 칩 */
export function selectionChipClasses(selected: boolean, disabled?: boolean) {
  return cn(
    "font-medium",
    selectionSurfaceClasses(selected, { disabled, rounded: "rounded-[6px]" }),
    selected ? "text-[#0F172A]/85" : "text-[#475569]",
  );
}

const ACTION_BASE =
  "inline-flex w-full items-center justify-center transition-all duration-200 ease-out";

/** 주요 CTA — 내 상황 검토하기 */
export function selectionPrimaryActionClasses(disabled?: boolean) {
  return cn(
    ACTION_BASE,
    "min-h-11 rounded-[8px] border-2 border-[#0B2A6B] bg-[#0B2A6B] px-4 text-[13px] font-medium text-white/95 sm:min-h-10 sm:text-[12.5px]",
    disabled
      ? "cursor-not-allowed opacity-70 hover:translate-y-0 hover:shadow-none"
      : "hover:-translate-y-0.5 hover:bg-[#082258] hover:shadow-[0_4px_14px_rgba(11,42,107,0.16)]",
  );
}

/** VERIFY Stitch SCREEN — 내 상황 검토하기 */
export function selectionStitchPrimaryActionClasses(disabled?: boolean) {
  return cn(
    ACTION_BASE,
    "min-h-11 rounded-lg border border-transparent bg-slate-900 px-4 text-[13.5px] font-medium text-white shadow-sm sm:min-h-11",
    disabled
      ? "cursor-not-allowed opacity-70 hover:translate-y-0 hover:shadow-none"
      : "hover:bg-slate-800 active:bg-slate-950",
  );
}

/** VERIFY Stitch SCREEN — 자세히 보기 */
export function selectionStitchSecondaryActionClasses(disabled?: boolean) {
  return cn(
    ACTION_BASE,
    "min-h-10 rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-normal text-slate-700 sm:min-h-10",
    disabled
      ? "cursor-not-allowed opacity-70 hover:translate-y-0 hover:shadow-none"
      : "hover:border-slate-300",
  );
}

/** 보조 CTA — 이 결과 공유하기 */
export function selectionSecondaryActionClasses(disabled?: boolean) {
  return cn(
    ACTION_BASE,
    "min-h-10 rounded-[8px] border-2 border-[#E5E7EB] bg-white px-4 text-[12.5px] font-medium text-[#0B2A6B]/85 sm:min-h-9 sm:text-[12px]",
    disabled
      ? "cursor-not-allowed opacity-70 hover:translate-y-0 hover:shadow-none"
      : "hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0_2px_10px_rgba(15,23,42,0.08)]",
  );
}

/** 헤더 GNB 엔진 탭 — 선택 시 밑줄만, hover/active 때만 배경·색 변화 */
export function selectionHeaderEngineClasses(selected: boolean) {
  return cn(
    "border-b-2 bg-transparent font-medium transition-colors duration-150 ease-out",
    selected
      ? "border-[#0B2A6B] text-[#0B2A6B]/85"
      : cn(
          "border-transparent text-[#475569]",
          "hover:bg-slate-50/80 hover:border-[#CBD5E1] hover:text-[#334155]",
          "active:bg-slate-100/90 active:border-[#CBD5E1] active:text-[#0B2A6B]/85",
        ),
  );
}

/** 헤더 2단 서비스 링크 */
export function selectionHeaderServiceClasses(selected: boolean) {
  return cn(
    "inline-flex min-h-[32px] items-center justify-center px-2 text-center text-[12.5px] leading-snug",
    selectionChipClasses(selected),
  );
}

/** 아이콘+링크 카드 — hover lift */
export function selectionIconNavClasses(extra?: string) {
  return cn(
    "group no-underline border-2 border-[#E5E7EB] bg-white transition-all duration-200 ease-out",
    "hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0_2px_10px_rgba(15,23,42,0.08)]",
    extra,
  );
}

export function selectionIconNavTitleClasses() {
  return "font-medium text-[#334155] group-hover:text-[#0F172A]/85";
}

export function selectionIconNavDescClasses() {
  return "text-[#64748B] group-hover:text-[#556070]/85";
}

export function selectionIconNavCtaClasses(toneClass = "text-[#0B2A6B]/85") {
  return cn("font-medium", toneClass);
}

/** 아이콘 탭 버튼 — active + hover lift */
export function selectionIconTabClasses(active: boolean, extra?: string) {
  return cn(
    "font-medium transition-all duration-200 ease-out",
    active
      ? "-translate-y-0.5 border-2 border-[#0B2A6B]/30 bg-[#F8FAFF] text-[#0B2A6B]/85 shadow-[0_2px_10px_rgba(11,42,107,0.03)]"
      : "translate-y-0 border-2 border-[#E5E7EB] bg-white text-[#475569] hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]",
    extra,
  );
}

/** 헤더/메뉴 링크 — boxed chip */
export function selectionNavLinkClasses(active: boolean, extra?: string) {
  return cn(selectionChipClasses(active), extra);
}
