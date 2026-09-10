import type { ReactNode } from "react";
import SiteHeader from "@/components/home/SiteHeader";

export default function CheckLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
