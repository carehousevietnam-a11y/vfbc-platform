/** 01/GTGT (TT89) draft calculation — pure functions. Rules: docs/master/forms/G2_VAT_FORM_PACK.md §5 */

const ZERO = BigInt(0);

export type GtgtFieldSource = "calc" | "input" | "expert";

export type GtgtFieldCell = {
  value: bigint;
  source: GtgtFieldSource;
  txn_ids?: string[];
};

export type GtgtComputedPayload = {
  fields: Record<string, GtgtFieldCell>;
  warnings: string[];
};

export type GtgtAdjustmentRow = {
  field_code: string;
  amount: bigint;
  reason_code: string | null;
};

export type GtgtComputeInput = {
  /** Prior-period [43] for [22] */
  prior43: bigint;
  /** Expert/input overrides (e.g. [26], pack test fixtures) */
  inputs: Partial<Record<string, bigint>>;
  adjustments: GtgtAdjustmentRow[];
  /** Aggregated from confirmed txns when present */
  fromTxns?: Partial<Record<string, { value: bigint; txn_ids: string[] }>>;
};

function cell(
  value: bigint,
  source: GtgtFieldSource,
  txn_ids?: string[]
): GtgtFieldCell {
  return txn_ids?.length ? { value, source, txn_ids } : { value, source };
}

function sumAdjustments(adjustments: GtgtAdjustmentRow[], fieldCode: string): bigint {
  let s = ZERO;
  for (const a of adjustments) {
    if (a.field_code === fieldCode) s += a.amount;
  }
  return s;
}

function getBig(
  code: string,
  inputs: Partial<Record<string, bigint>>,
  fromTxns: Partial<Record<string, { value: bigint; txn_ids: string[] }>> | undefined,
  source: GtgtFieldSource
): GtgtFieldCell {
  if (inputs[code] !== undefined) {
    return cell(inputs[code]!, "input");
  }
  const tx = fromTxns?.[code];
  if (tx) {
    return cell(tx.value, source, tx.txn_ids);
  }
  return cell(ZERO, source);
}

export function computeGtgt01(input: GtgtComputeInput): GtgtComputedPayload {
  const warnings: string[] = [];
  const fields: Record<string, GtgtFieldCell> = {};

  const adj32a = sumAdjustments(input.adjustments, "32a");
  const adj32b = sumAdjustments(input.adjustments, "32b");
  const adj34a = sumAdjustments(input.adjustments, "34a");
  const adj37 = sumAdjustments(input.adjustments, "37");
  const adj38 = sumAdjustments(input.adjustments, "38");
  const adj42 = sumAdjustments(input.adjustments, "42");

  fields["22"] = cell(input.prior43, "calc");

  const txn = input.fromTxns;
  fields["23"] = getBig("23", input.inputs, txn, "calc");
  fields["24"] = getBig("24", input.inputs, txn, "calc");
  fields["25"] = getBig("25", input.inputs, txn, "calc");
  fields["26"] = getBig("26", input.inputs, txn, "input");
  if (fields["26"].value === ZERO && !input.inputs["26"] && !txn?.["26"]) {
    warnings.push("accounting.vat.warning.field26_expert_input");
  }

  fields["29"] = getBig("29", input.inputs, txn, "calc");
  fields["30"] = getBig("30", input.inputs, txn, "calc");
  fields["31"] = getBig("31", input.inputs, txn, "calc");
  fields["32"] = getBig("32", input.inputs, txn, "calc");
  fields["33"] = getBig("33", input.inputs, txn, "calc");
  fields["32a"] = cell(adj32a, adj32a !== ZERO ? "expert" : "calc");
  fields["32b"] = cell(adj32b, adj32b !== ZERO ? "expert" : "calc");
  fields["34a"] = cell(adj34a, adj34a !== ZERO ? "expert" : "calc");

  const v31 = fields["31"].value;
  const v33 = fields["33"].value;
  const v35 =
    input.inputs["35"] !== undefined
      ? input.inputs["35"]!
      : v31 + v33 + fields["32"].value;
  fields["35"] = cell(v35, input.inputs["35"] !== undefined ? "input" : "calc");

  const v25 = fields["25"].value;
  const v36 = v35 - v25;
  fields["36"] = cell(v36, "calc");

  fields["37"] = cell(adj37, "expert");
  fields["38"] = cell(adj38, "expert");

  fields["39a"] = cell(ZERO, "input");
  fields["40b"] = cell(ZERO, "input");

  const v22 = fields["22"].value;
  const net = v36 - v22 + adj37 - adj38 - ZERO;
  const v40a = net > ZERO ? net : ZERO;
  const v41 = net < ZERO ? -net : ZERO;
  fields["40a"] = cell(v40a, "calc");
  const v40 = v40a - ZERO;
  fields["40"] = cell(v40, "calc");
  fields["41"] = cell(v41, "calc");
  fields["42"] = cell(adj42, "expert");
  fields["43"] = cell(v41 - adj42, "calc");

  if (v40 > ZERO && v41 > ZERO) {
    throw new Error("GTGT_40_41_BOTH_POSITIVE");
  }
  if (adj42 > v41) {
    throw new Error("GTGT_42_EXCEEDS_41");
  }

  return { fields, warnings };
}

export function gtgtFieldsToJson(payload: GtgtComputedPayload): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [code, c] of Object.entries(payload.fields)) {
    fields[code] = {
      value: c.value.toString(),
      source: c.source,
      ...(c.txn_ids ? { txn_ids: c.txn_ids } : {}),
    };
  }
  return { fields, warnings: payload.warnings };
}

export function parseGtgtFieldsFromJson(computed: Record<string, unknown>): GtgtComputedPayload | null {
  const rawFields = computed.fields;
  if (!rawFields || typeof rawFields !== "object") return null;
  const fields: Record<string, GtgtFieldCell> = {};
  for (const [code, v] of Object.entries(rawFields as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const value = BigInt(String(o.value ?? "0"));
    const source = (o.source as GtgtFieldSource) ?? "calc";
    fields[code] = {
      value,
      source,
      ...(Array.isArray(o.txn_ids) ? { txn_ids: o.txn_ids as string[] } : {}),
    };
  }
  const warnings = Array.isArray(computed.warnings) ? (computed.warnings as string[]) : [];
  return { fields, warnings };
}
