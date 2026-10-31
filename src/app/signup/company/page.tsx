import type { Metadata } from "next";
import CompanyMemberSignupClient from "./CompanyMemberSignupClient";

export const metadata: Metadata = {
  title: "기업회원 가입 | MY VIET CHECK",
  description: "VFBCAI 기업회원(세무·회계) 가입",
  robots: { index: false, follow: false },
};

export default function CompanyMemberSignupPage() {
  return <CompanyMemberSignupClient />;
}
