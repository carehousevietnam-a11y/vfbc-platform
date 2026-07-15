// src/lib/supabaseAdmin.ts
//
// 서버 컴포넌트·API route 전용. service role key를 사용하므로
// 절대 클라이언트 컴포넌트("use client")에서 import하지 말 것.
// 브라우저로 노출되면 RLS를 완전히 우회할 수 있는 키라 보안상 치명적.

import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
