// STEP12-1: 공통 UI 컴포넌트에서 사용하는 최소 classNames 결합 유틸.
// 외부 패키지(clsx 등) 추가 없이 동작.
export function cn(
  ...classes: Array<string | number | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
