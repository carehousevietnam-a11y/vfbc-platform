"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackFunnelView } from "@/lib/funnelTrack";

/** 단계 화면이 보일 때 익명 진입 기록 1회(화면에는 아무것도 그리지 않음). */
export default function FunnelStepBeacon({ step }: { step: number }) {
  const pathname = usePathname();
  useEffect(() => {
    trackFunnelView(pathname, step);
  }, [pathname, step]);
  return null;
}
