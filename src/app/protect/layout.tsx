import type { ReactNode } from "react";
import SiteHeader from "@/components/home/SiteHeader";

export default function ProtectLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
