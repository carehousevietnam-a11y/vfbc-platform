import { Suspense } from "react";
import VatDeclarationClient from "./VatDeclarationClient";

export default function AccountingVatPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-[#3D4B63]">불러오는 중입니다.</div>
      }
    >
      <VatDeclarationClient />
    </Suspense>
  );
}
