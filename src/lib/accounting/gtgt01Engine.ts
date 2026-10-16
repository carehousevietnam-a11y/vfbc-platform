/** 01/GTGT (TT89) — G2_VAT_FORM_PACK.md §5 */

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
  prior43: bigint;
  inputs: Partial<Record<string, bigint>>;
  adjustments: GtgtAdjustmentRow[];
  fromTxns?: Partial<Record<string, { value: bigint; txn_ids: string[] }>>;
};

function cell(value: bigint, source: GtgtFieldSource, txn_ids?: string[]): GtgtFieldCell {
  return txn_ids?.length ? { value, source, txn_ids } : { value, source };
}

function sumAdjustments(adjustments: GtgtAdjustmentRow[], fieldCode: string): bigint {
  let s = ZERO;
  for (const a of adjustments) {
    if (a.field_code === fieldCode) s += a.amount;
  }
  return s;
}

function getIn(
  code: string,
  inputs: Partial<Record<string, bigint>>,
  fromTxns: Partial<Record<string, { value: bigint; txn_ids: string[] }>> | undefined
): GtgtFieldCell {
  if (inputs[code] !== undefined) {
    return cell(inputs[code]!, "input");
  }
  const tx = fromTxns?.[code];
  if (tx) {
    return cell(tx.value, "input", tx.txn_ids);
  }
  return cell(ZERO, "input");
}

export function computeGtgt01(input: GtgtComputeInput): GtgtComputedPayload {
  const warnings: string[] = [];
  const fields: Record<string, GtgtFieldCell> = {};
  const txn = input.fromTxns;

  const adj32a = sumAdjustments(input.adjustments, "32a");
  const adj32b = sumAdjustments(input.adjustments, "32b");
  const adj34a = sumAdjustments(input.adjustments, "34a");
  const adj37 = sumAdjustments(input.adjustments, "37");
  const adj38 = sumAdjustments(input.adjustments, "38");
  const adj42 = sumAdjustments(input.adjustments, "42");

  fields["22"] = cell(input.prior43, "input");

  fields["23"] = getIn("23", input.inputs, txn);
  fields["24"] = getIn("24", input.inputs, txn);
  fields["25"] = getIn("25", input.inputs, txn);
  fields["26"] = getIn("26", input.inputs, txn);
  if (fields["26"].value === ZERO && !input.inputs["26"] && !txn?.["26"]) {
    warnings.push("accounting.vat.warning.field26_expert_input");
  }

  fields["29"] = getIn("29", input.inputs, txn);
  fields["30"] = getIn("30", input.inputs, txn);
  fields["31"] = getIn("31", input.inputs, txn);
  fields["32"] = getIn("32", input.inputs, txn);
  fields["33"] = getIn("33", input.inputs, txn);

  fields["32a"] = cell(adj32a, "expert");
  fields["32b"] = cell(adj32b, "expert");
  fields["34a"] = cell(adj34a, "expert");

  const v27 =
    fields["29"].value +
    fields["30"].value +
    fields["32"].value +
    fields["32a"].value -
    fields["32b"].value;
  fields["27"] = cell(v27, "calc");

  const v28 = fields["31"].value + fields["33"].value;
  fields["28"] = cell(v28, "calc");

  const v34 = fields["26"].value + v27 + fields["34a"].value;
  fields["34"] = cell(v34, "calc");

  const v35 = v28;
  fields["35"] = cell(v35, "calc");

  const v25 = fields["25"].value;
  const v36 = v35 - v25;
  fields["36"] = cell(v36, "calc");

  fields["37"] = cell(adj37, "expert");
  fields["38"] = cell(adj38, "expert");

  const v22 = fields["22"].value;
  const net = v36 - v22 + adj37 - adj38;
  const v40a = net > ZERO ? net : ZERO;
  const v41 = net < ZERO ? -net : ZERO;
  fields["40a"] = cell(v40a, "calc");
  fields["40"] = cell(v40a, "calc");
  fields["41"] = cell(v41, "calc");
  fields["42"] = cell(adj42, "expert");
  fields["43"] = cell(v41 - adj42, "calc");

  if (v40a > ZERO && v41 > ZERO) {
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
