/** Admin 동일: 마운트 시 `?restore=1` 일 때만 lead 복원 허용 */
export function shouldAllowVerifyMemberRestoreOnMount(search: string): boolean {
  return new URLSearchParams(search).get("restore") === "1";
}
