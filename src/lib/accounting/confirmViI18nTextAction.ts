"use server";

import { createAccountingServerClient } from "./accountingServerClient";
import { confirmAccountingViI18nText, type ConfirmViI18nInput } from "./confirmViI18nTextEntry";

export async function confirmAccountingViI18nTextAction(input: ConfirmViI18nInput) {
  const client = await createAccountingServerClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  const token = sessionData.session?.access_token;
  if (sessionError || !token) return { ok: false as const, error: "UNAUTHENTICATED" };
  return confirmAccountingViI18nText(client, token, input);
}
