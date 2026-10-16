import { supabase } from "@/lib/supabase";

export async function uploadAccountingFunnelPhase1Evidence(
  entryId: string,
  leadId: string,
  evidenceFile: File,
): Promise<{ ok: true; storagePath: string } | { ok: false }> {
  const rawExt = evidenceFile.name.split(".").pop() || "";
  const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `verify-accounting-funnel/${entryId}/${leadId}.${safeExt}`;
  const { error: uploadError } = await supabase.storage.from("documents").upload(path, evidenceFile);
  if (uploadError) {
    console.error(uploadError);
    return { ok: false };
  }
  return { ok: true, storagePath: path };
}
