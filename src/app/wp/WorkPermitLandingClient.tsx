"use client";

import { useEffect, useRef } from "react";
import { Outfit } from "next/font/google";
import { LANDING_HTML } from "./workPermitLandingHtml";
import { initWorkPermitLanding } from "./workPermitLandingScript";
import "./landing.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--lp-outfit" });

/** WorkPermit 랜딩. 마크업은 정적 문자열, 동작은 initWorkPermitLanding 이 붙인다. */
export default function WorkPermitLandingClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountedOnce = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // 개발 모드 StrictMode 재실행 시 이전 이벤트가 남지 않도록 마크업을 새로 깐다.
    if (mountedOnce.current) root.innerHTML = LANDING_HTML;
    mountedOnce.current = true;
    return initWorkPermitLanding();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`lp-root ${outfit.variable} antialiased`}
      dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
    />
  );
}
