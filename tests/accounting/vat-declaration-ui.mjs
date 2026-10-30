/**
 * VAT declaration UI — status i18n, author label, step5 no-txn warning (LESSON 150).
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
record(
  "precheck_no_txn_zero_confirmed",
  vatPrecheckNeedsNoTxnWarning(0, { "33": { value: "0" } }),
);
record(
  "precheck_clear_with_txns_and_computed",
  !vatPrecheckNeedsNoTxnWarning(2, { "33": { value: "100", txn_ids: ["a"] } }),
);
record(
  "precheck_no_txn_empty_computed",
  vatPrecheckNeedsNoTxnWarning(1, {}),
);

console.log(`vat-declaration-ui pass=${results.pass} fail=${results.fail}`);
if (results.fail > 0) {
  for (const c of results.cases.filter((x) => !x.ok)) {
    console.error("FAIL", c.name, c.detail);
  }
  process.exit(1);
}
