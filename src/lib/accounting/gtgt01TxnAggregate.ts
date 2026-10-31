/** Confirmed transaction lines → Pack §5 in-fields [23]–[33], [29]–[33]. */

export type ConfirmedTxnLine = {
  txn_id: string;
  type: "sale" | "purchase" | "expense" | "payroll";
  amount_net: number;
  vat_rate: number | null;
  vat_amount: number;
};

export type TxnAggBucket = { value: bigint; txn_ids: string[] };

function vnd(n: number): bigint {
  return BigInt(Math.trunc(n));
}

function addBucket(
  map: Partial<Record<string, TxnAggBucket>>,
  code: string,
  txnId: string,
  delta: bigint
) {
  if (delta === BigInt(0)) return;
  const cur = map[code] ?? { value: BigInt(0), txn_ids: [] };
  cur.value += delta;
  if (!cur.txn_ids.includes(txnId)) cur.txn_ids.push(txnId);
  map[code] = cur;
}

/** Pack: purchase+expense domestic → [23] net, [24] VAT; [25]=[24] with G6 expert flag (no auto eligibility). */
export function aggregateConfirmedTxnLines(
  lines: ConfirmedTxnLine[]
): { fromTxns: Partial<Record<string, TxnAggBucket>>; warnings: string[] } {
  const fromTxns: Partial<Record<string, TxnAggBucket>> = {};
  const warnings: string[] = [];
  let hasPurchaseVat = false;

  for (const line of lines) {
    const net = vnd(line.amount_net);
    const vat = vnd(line.vat_amount);
    const rate = line.vat_rate;

    if (line.type === "purchase" || line.type === "expense") {
      addBucket(fromTxns, "23", line.txn_id, net);
      addBucket(fromTxns, "24", line.txn_id, vat);
      addBucket(fromTxns, "25", line.txn_id, vat);
      if (vat !== BigInt(0)) hasPurchaseVat = true;
      continue;
    }

    if (line.type !== "sale") continue;

    if (rate === 0) {
      addBucket(fromTxns, "29", line.txn_id, net);
    } else if (rate === 5) {
      addBucket(fromTxns, "30", line.txn_id, net);
      addBucket(fromTxns, "31", line.txn_id, vat);
    } else if (rate === 10) {
      addBucket(fromTxns, "32", line.txn_id, net);
      addBucket(fromTxns, "33", line.txn_id, vat);
    }
  }

  if (hasPurchaseVat) {
    warnings.push("accounting.vat.warning.field25_expert_review");
  }

  return { fromTxns, warnings };
}
