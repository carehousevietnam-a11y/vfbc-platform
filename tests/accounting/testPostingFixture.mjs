/** Shared TEST-* chart + posting rule for local accounting harness only. */
export async function seedTestPostingRule(service, txnType = "sale") {
  const eff = "2026-01-01";
  await service.from("accounting_chart_of_accounts").upsert(
    [
      {
        code: "TEST-DB-SALE",
        name_vi: "TEST debit",
        name_ko: "TEST 차변",
        regime: "TT133",
        effective_from: eff,
        verified_status: "unverified",
      },
      {
        code: "TEST-CR-SALE",
        name_vi: "TEST credit",
        name_ko: "TEST 대변",
        regime: "TT133",
        effective_from: eff,
        verified_status: "unverified",
      },
      {
        code: "TEST-THROW-FAIL",
        name_vi: "TEST throw",
        name_ko: "TEST throw",
        regime: "TT133",
        effective_from: eff,
        verified_status: "unverified",
      },
    ],
    { onConflict: "code,effective_from" }
  );
  const { count } = await service
    .from("accounting_posting_rules")
    .select("id", { count: "exact", head: true })
    .eq("txn_type", txnType)
    .eq("debit_code", "TEST-DB-SALE");
  if ((count ?? 0) === 0) {
    const { error } = await service.from("accounting_posting_rules").insert({
      txn_type: txnType,
      condition: {},
      debit_code: "TEST-DB-SALE",
      credit_code: "TEST-CR-SALE",
      effective_from: eff,
      verified_status: "unverified",
    });
    if (error) throw new Error(error.message);
  }
}
