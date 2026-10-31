import TransactionDetailClient from "./TransactionDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function AccountingTransactionDetailPage({ params }: Props) {
  const { id } = await params;
  return <TransactionDetailClient txnId={id} />;
}
