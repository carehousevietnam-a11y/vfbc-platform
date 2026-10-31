import { createAccountingServerClient } from "@/lib/accounting/accountingServerClient";
import { listActiveStandardizedForms } from "@/lib/accounting/standardized/standardizedFormsEntry";
import { G9_STANDARDIZED_QUESTIONS, isStandardizedSubmitEnabled } from "@/lib/accounting/standardized/g9StandardizedPack";
import { validateG9StandardizedPack } from "@/lib/accounting/standardized/validateStandardizedPack";
import StandardizedFormsClient from "./StandardizedFormsClient";

export default async function StandardizedFormsPage() {
  const packCheck = validateG9StandardizedPack(G9_STANDARDIZED_QUESTIONS);
  if (!packCheck.ok) {
    throw new Error(`standardized pack invalid: ${packCheck.errors.join("; ")}`);
  }

  const supabase = await createAccountingServerClient();
  const listed = await listActiveStandardizedForms(supabase);

  const safeForms = (listed.ok ? listed.items : []).map((f) => ({
    id: f.id,
    form_code: f.form_code,
    name_ko: f.name_ko,
    name_vi: f.name_vi,
    verified_status: f.verified_status,
    submitEnabled: isStandardizedSubmitEnabled(f.field_map),
  }));

  return <StandardizedFormsClient forms={safeForms} loadError={listed.ok ? null : listed.error} />;
}
