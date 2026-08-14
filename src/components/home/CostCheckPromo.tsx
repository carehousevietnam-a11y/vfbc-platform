import Link from "next/link";

export default function CostCheckPromo() {
  return (
    <div className="border-b border-gray-50 bg-white px-6 py-2.5 text-center">
      <Link
        href="/cost-check"
        className="text-xs text-gray-400 hover:text-blue-900 transition-colors"
      >
        행정비용 적정성 진단 바로가기 →
      </Link>
    </div>
  );
}
