import { createClient } from "@supabase/supabase-js";
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

  const devUrl = process.env.ACCOUNTING_DEV_SUPABASE_URL;
  const devServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbHostForHarness = devUrl ? new URL(devUrl).host : null;
  const listed =
    devUrl && devServiceKey
      ? await listActiveStandardizedForms(
          createClient(devUrl, devServiceKey, { auth: { persistSession: false, autoRefreshToken: false } })
        )
      : await listActiveStandardizedForms(await createAccountingServerClient());
  const forms = listed.ok ? listed.items : [];

  const safeForms = forms.map((f) => ({
    id: f.id,
    form_code: f.form_code,
    name_ko: f.name_ko,
    name_vi: f.name_vi,
    verified_status: f.verified_status,
    submitEnabled: isStandardizedSubmitEnabled(f.field_map),
  }));

  return (
    <StandardizedFormsClient
      forms={safeForms}
      loadError={listed.ok ? null : listed.error}
      dbHostForHarness={dbHostForHarness}
    />
  );
}
