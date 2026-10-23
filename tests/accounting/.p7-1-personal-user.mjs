import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const st = {};
for (const line of execSync("npx supabase status -o env", { encoding: "utf8" }).split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) st[m[1]] = m[2].replace(/^"|"$/g, "");
}
const svc = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const email = "dev-personal@test.vfbcai.local";
const password = "Vfbcai-LocalDev-Accounting-2026!";
const { data: created, error: createErr } = await svc.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
let userId = created?.user?.id;
if (createErr?.message?.includes("already")) {
  const { data: list } = await svc.auth.admin.listUsers({ perPage: 200 });
  userId = list?.users?.find((u) => u.email === email)?.id;
}
if (!userId) throw new Error("personal user missing");
await svc.from("users").upsert(
  { id: userId, email, member_type: "personal", password_set: true },
  { onConflict: "id" },
);
const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
const { data, error } = await anon.auth.signInWithPassword({ email, password });
if (error || !data.session) throw error ?? new Error("sign in failed");
console.log(JSON.stringify({ access_token: data.session.access_token, refresh_token: data.session.refresh_token }));
