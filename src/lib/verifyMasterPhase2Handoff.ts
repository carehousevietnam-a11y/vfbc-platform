import type { VerifyServiceType } from "@/lib/restoreVerifyLead";

export type VerifyPhase2HandoffConfig = {
  snapshotStorageKey: string;
  documentsServiceParam: string;
  verifyReturnPath: string;
};

/** Admin L1801~1336 / documents phase2_upload — 서비스별 snapshot·route 분리 */
const VERIFY_PHASE2_HANDOFF: Partial<Record<VerifyServiceType, VerifyPhase2HandoffConfig>> = {
  verify_admin: {
    snapshotStorageKey: "vfbcai_admin_verify_phase2_snapshot",
    documentsServiceParam: "verify_admin",
    verifyReturnPath: "/verify/admin",
  },
  "verify_real-estate": {
    snapshotStorageKey: "vfbcai_real_estate_verify_phase2_snapshot",
    documentsServiceParam: "verify_real-estate",
    verifyReturnPath: "/verify/real-estate",
  },
  verify_tax: {
    snapshotStorageKey: "vfbcai_tax_verify_phase2_snapshot",
    documentsServiceParam: "verify_tax",
    verifyReturnPath: "/verify/tax",
  },
};

export const ADMIN_VERIFY_PHASE2_SNAPSHOT_STORAGE_KEY =
  VERIFY_PHASE2_HANDOFF.verify_admin!.snapshotStorageKey;

export function getVerifyPhase2HandoffConfig(
  serviceType: VerifyServiceType,
): VerifyPhase2HandoffConfig | null {
  return VERIFY_PHASE2_HANDOFF[serviceType] ?? null;
}

export type Phase2HandoffSnapshot = {
  leadId: string;
  answers: Record<string, string>;
  resultToken: string | null;
  serviceType: VerifyServiceType;
  packCaseId?: string;
  anyUploaded?: boolean;
};

export function writePhase2HandoffSnapshot(
  serviceType: VerifyServiceType,
  snapshot: Omit<Phase2HandoffSnapshot, "serviceType">,
): void {
  const cfg = getVerifyPhase2HandoffConfig(serviceType);
  if (!cfg || typeof window === "undefined") return;
  sessionStorage.setItem(
    cfg.snapshotStorageKey,
    JSON.stringify({ ...snapshot, serviceType }),
  );
}

export function readPhase2HandoffSnapshot(
  serviceType: VerifyServiceType,
): Phase2HandoffSnapshot | null {
  const cfg = getVerifyPhase2HandoffConfig(serviceType);
  if (!cfg || typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(cfg.snapshotStorageKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Phase2HandoffSnapshot;
    if (!parsed.leadId || !parsed.answers) return null;
    return { ...parsed, serviceType };
  } catch {
    return null;
  }
}

export function clearPhase2HandoffSnapshot(serviceType: VerifyServiceType): void {
  const cfg = getVerifyPhase2HandoffConfig(serviceType);
  if (!cfg || typeof window === "undefined") return;
  sessionStorage.removeItem(cfg.snapshotStorageKey);
}

export function buildPhase2DocumentsHandoffUrl(
  leadId: string,
  serviceType: VerifyServiceType,
  options?: { packCaseId?: string },
): string {
  const cfg = getVerifyPhase2HandoffConfig(serviceType);
  if (!cfg) throw new Error(`Unsupported verify phase2 handoff: ${serviceType}`);
  const params = new URLSearchParams({
    leadId,
    service: cfg.documentsServiceParam,
    mode: "phase2_upload",
  });
  if (options?.packCaseId) params.set("packCase", options.packCaseId);
  return `/documents?${params.toString()}`;
}
