import { Suspense } from "react";
import TransactionEntryClient from "./TransactionEntryClient";

export default function AccountingTransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionEntryClient />
    </Suspense>
  );
}
