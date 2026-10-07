import { Suspense } from "react";
import RealEstateVerifyMasterPage from "./RealEstateVerifyMasterPage";

export default function VerifyRealEstatePage() {
  return (
    <Suspense fallback={null}>
      <RealEstateVerifyMasterPage />
    </Suspense>
  );
}
