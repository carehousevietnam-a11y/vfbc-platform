"use client";

import { useEffect, useRef } from "react";
import { Outfit } from "next/font/google";
import { COMPANY_LANDING_HTML } from "./companyLandingHtml";
import { initCompanyLanding } from "./companyLandingScript";
import "./landing.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--lp-outfit" });

/** 법인설립 랜딩. 마크업은 정적 문자열, 동작은 initCompanyLanding 이 붙인다. */
export default function CompanyLandingClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountedOnce = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // 개발 모드 StrictMode 재실행 시 이전 이벤트가 남지 않도록 마크업을 새로 깐다.
    if (mountedOnce.current) root.innerHTML = COMPANY_LANDING_HTML;
    mountedOnce.current = true;
    return initCompanyLanding();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`lp-root ${outfit.variable} antialiased`}
      dangerouslySetInnerHTML={{ __html: COMPANY_LANDING_HTML }}
    />
  );
}
