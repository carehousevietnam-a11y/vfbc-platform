import { Suspense } from "react";
import AccountingHomeClient from "./AccountingHomeClient";

export default function AccountingHomePage() {
  return (
    <Suspense fallback={null}>
      <AccountingHomeClient />
    </Suspense>
  );
}
