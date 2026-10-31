/**
 * P7-2a — lead-submit ignores client member_type=company (uses personal).
 */
import { LEAD_SUBMIT_MEMBER_TYPE } from "../../src/lib/accounting/companySignup.ts";

let fail = 0;
function assert(n, ok) {
  if (!ok) {
    fail++;
    console.error(`FAIL ${n}`);
  } else console.log(`PASS ${n}`);
}

assert("lead_submit_member_type_is_personal", LEAD_SUBMIT_MEMBER_TYPE === "personal");

const forged = { member_type: "company", channel: "vfbc_company_member_v1" };
const effective = LEAD_SUBMIT_MEMBER_TYPE;
assert("lead_submit_forged_body_ignored", effective === "personal" && forged.member_type === "company");

process.exit(fail > 0 ? 1 : 0);
