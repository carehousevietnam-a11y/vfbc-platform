/**
 * C2.4b — VERIFY 회원 복원 게이트 (Admin 동일 규칙)
 */
import fs from "fs";
import { shouldAllowVerifyMemberRestoreOnMount } from "../../src/lib/verifyMemberRestorePolicy.ts";

const ADMIN_PAGE = fs.readFileSync("src/app/verify/admin/page.tsx", "utf8");
const RE_PAGE = fs.readFileSync(
  "src/app/verify/real-estate/RealEstateVerifyMasterPage.tsx",
  "utf8",
);

const stats = {
  policy_restore_param: 0,
  policy_plain_entry: 0,
  re_mount_uses_restore_gate: 0,
  re_mount_no_literal_allow_true: 0,
  re_landing_allow_restore: 0,
  admin_mount_uses_restore_gate: 0,
  admin_landing_allow_restore: 0,
  load_state_gate_documented: 0,
  phase2_return_preserved: 0,
  fail: 0,
};

if (shouldAllowVerifyMemberRestoreOnMount("?restore=1&foo=bar")) stats.policy_restore_param++;
if (!shouldAllowVerifyMemberRestoreOnMount("") && !shouldAllowVerifyMemberRestoreOnMount("?tab=review")) {
  stats.policy_plain_entry++;
}

const mountBlock = RE_PAGE.match(
  /async function initMemberState\(\)[\s\S]*?void initMemberState\(\)/,
)?.[0];
if (mountBlock?.includes("shouldAllowVerifyMemberRestoreOnMount")) {
  stats.re_mount_uses_restore_gate++;
}
if (mountBlock && !mountBlock.includes("allowRestore: true")) {
  stats.re_mount_no_literal_allow_true++;
}

if (
  RE_PAGE.includes("handleLandingContinue") &&
  RE_PAGE.match(/handleLandingContinue[\s\S]*?allowRestore:\s*true/)
) {
  stats.re_landing_allow_restore++;
}

if (ADMIN_PAGE.match(/applyMemberEntryState[\s\S]*?params\.get\("restore"\)\s*===\s*"1"/)) {
  stats.admin_mount_uses_restore_gate++;
}
if (ADMIN_PAGE.match(/handleLandingContinue[\s\S]*?allowRestore:\s*true/)) {
  stats.admin_landing_allow_restore++;
}

if (
  fs.readFileSync("src/lib/restoreVerifyLead.ts", "utf8").includes(
    "loggedIn && allowRestore",
  )
) {
  stats.load_state_gate_documented++;
}

if (
  RE_PAGE.includes('params.get("phase2_upload_return") !== "1"') &&
  RE_PAGE.includes("setAdminVerifyPhase2UploadComplete(true)")
) {
  stats.phase2_return_preserved++;
}

const checks = [
  stats.policy_restore_param === 1,
  stats.policy_plain_entry === 1,
  stats.re_mount_uses_restore_gate === 1,
  stats.re_mount_no_literal_allow_true === 1,
  stats.re_landing_allow_restore === 1,
  stats.admin_mount_uses_restore_gate === 1,
  stats.admin_landing_allow_restore === 1,
  stats.load_state_gate_documented === 1,
  stats.phase2_return_preserved === 1,
];
if (!checks.every(Boolean)) stats.fail = 1;

console.log(
  JSON.stringify(
    {
      ...stats,
      comparison: {
        mount_restore_gate: "Admin params restore=1 ↔ RE shouldAllowVerifyMemberRestoreOnMount",
        landing_restore: "Both handleLandingContinue allowRestore: true",
        plain_entry: "allowRestore false → restored null (loadVerifyMemberEntryState)",
        upload_return: "phase2_upload_return=1 only sets upload complete on mount",
      },
      fail: stats.fail,
    },
    null,
    2,
  ),
);

process.exit(stats.fail);
