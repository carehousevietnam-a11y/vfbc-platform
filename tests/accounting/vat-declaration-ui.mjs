/**
 * VAT declaration UI — status i18n, author label, step5 no-txn warning (LESSON 150–152).
 */
import { ensureTsxRuntime } from "../qa/_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

import { ACCOUNTING_UI } from "../../src/lib/accounting/uiCatalog.ts";
import {
  VAT_AUTHOR_ROLE_CODES,
  VAT_DECLARATION_STATUS_CODES,
  isRawUserIdAuthorLabel,
  vatAuthorRoleMessageKey,
  vatDeclarationStatusMessageKey,
  vatPrecheckNeedsNoTxnWarning,
  vatPrecheckShowNoTxnBanner,
  vatPrecheckStep5ViewState,
} from "../../src/lib/accounting/vatPrecheckUi.ts";

const results = { pass: 0, fail: 0, cases: [] };
function record(name, ok, detail = "") {
  results.cases.push({ name, ok, detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

for (const status of VAT_DECLARATION_STATUS_CODES) {
  const key = vatDeclarationStatusMessageKey(status);
  const ko = ACCOUNTING_UI.ko[key];
  const vi = ACCOUNTING_UI.vi[key];
  record(`decl_status_i18n_${status}`, Boolean(ko && vi && ko !== status && vi !== status), ko ?? "missing");
}

for (const role of VAT_AUTHOR_ROLE_CODES) {
  const key = vatAuthorRoleMessageKey(role);
  record(`author_role_i18n_${role}`, Boolean(ACCOUNTING_UI.ko[key] && ACCOUNTING_UI.vi[key]));
}

record("author_id_fragment_detected", isRawUserIdAuthorLabel("29166335") && !isRawUserIdAuthorLabel("대표"));

record("(a) zero_txn_with_zero_computed", vatPrecheckNeedsNoTxnWarning(0));
record("(b) zero_txn_no_computed", vatPrecheckNeedsNoTxnWarning(0));
record("(c) has_txn_green_when_no_items", vatPrecheckStep5ViewState(false, 2, 0) === "green_none");
record("(d) has_txn_warning_off", !vatPrecheckNeedsNoTxnWarning(1));

record("step5_view_loading_not_green", vatPrecheckStep5ViewState(true, 0, 0) === "loading");
record("step5_view_zero_txn_only", vatPrecheckStep5ViewState(false, 0, 0) === "no_txn_only");
record("step5_banner_zero_txn", vatPrecheckShowNoTxnBanner(false, 0));
record(
  "step5_banner_zero_txn_with_precheck_items",
  vatPrecheckShowNoTxnBanner(false, 0) && vatPrecheckStep5ViewState(false, 0, 2) === "items",
);
record("step5_view_has_txn_green", vatPrecheckStep5ViewState(false, 2, 0) === "green_none");
record("step5_view_has_items", vatPrecheckStep5ViewState(false, 2, 1) === "items");

console.log(`vat-declaration-ui pass=${results.pass} fail=${results.fail}`);
if (results.fail > 0) {
  for (const c of results.cases.filter((x) => !x.ok)) {
    console.error("FAIL", c.name, c.detail);
  }
  process.exit(1);
}
