// 고객 노출용 전문가팀 브랜드 라벨 — 실명·외부조직명 없이 VFBCAI 자체 브랜드만 사용.

function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

const CHECK_SERVICE_TYPES = new Set(["wp", "trc", "tamtru", "driving-license"]);

function inferCategory(serviceType: string | null | undefined): string | null {
  if (!serviceType) return null;
  const normalized = serviceType.toLowerCase().replace(/-/g, "_");
  if (normalized === "consultation") return "consultation";
  if (normalized.startsWith("verify")) return "verify";
  if (normalized.startsWith("permit_") || normalized.startsWith("register_")) return "register";
  if (CHECK_SERVICE_TYPES.has(serviceType) || CHECK_SERVICE_TYPES.has(normalized)) return "check";
  return null;
}

/**
 * 서비스/카테고리에 맞는 VFBCAI 전문가팀 라벨을 반환한다.
 */
export function resolveExpertTeamLabel(
  category?: string | null,
  serviceType?: string | null,
): string {
  const cat = category ?? inferCategory(serviceType);
  const prefixKey = serviceType ? toPrefixKey(serviceType) : "";

  if (cat === "verify" || prefixKey.startsWith("verify")) {
    return "VFBCAI 법률전문가팀";
  }
  if (
    cat === "register" ||
    prefixKey.startsWith("permit_") ||
    prefixKey.startsWith("register_")
  ) {
    return "VFBCAI 인허가전문가팀";
  }
  if (
    cat === "check" ||
    CHECK_SERVICE_TYPES.has(serviceType ?? "") ||
    CHECK_SERVICE_TYPES.has(prefixKey)
  ) {
    return "VFBCAI 행정전문가팀";
  }
  return "VFBCAI 전문가팀";
}
