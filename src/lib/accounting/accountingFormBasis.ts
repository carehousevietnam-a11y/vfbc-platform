/** §11 / P9-6 — form_versions 기반 서식 기준 문구 (확정 표현 금지). */

export type FormBasisKind = "vat_gtgt" | "ledger_tt99";

export type FormBasisPayload = {
  kind: FormBasisKind;
  status: string;
  legalBasis: string | null;
  verifiedAt: string | null;
};

export function formBasisMessageKey(payload: FormBasisPayload): {
  key:
    | "accounting.form_basis.vat.pending"
    | "accounting.form_basis.vat.verified"
    | "accounting.form_basis.ledger.reference";
  vars: Record<string, string>;
} {
  if (payload.kind === "ledger_tt99") {
    return { key: "accounting.form_basis.ledger.reference", vars: {} };
  }
  if (payload.status === "verified" && payload.verifiedAt && payload.kind === "vat_gtgt") {
    return {
      key: "accounting.form_basis.vat.verified",
      vars: {
        legalBasis: payload.legalBasis ?? "Thông tư 89/2026/TT-BTC",
        verifiedDate: payload.verifiedAt,
      },
    };
  }
  return {
    key: "accounting.form_basis.vat.pending",
    vars: { legalBasis: payload.legalBasis ?? "Thông tư 89/2026/TT-BTC" },
  };
}
