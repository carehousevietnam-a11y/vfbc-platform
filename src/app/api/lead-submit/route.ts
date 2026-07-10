import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendResultEmail } from "@/lib/notify/email";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function randomPassword() {
  return crypto.randomUUID() + crypto.randomUUID();
}

// authEmail로 이미 만들어진 Auth 계정의 id를 찾는다.
// (public.users에는 없지만 auth.users에는 있는 "고아 계정" 케이스 대비)
async function findAuthUserIdByEmail(authEmail: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) {
    console.error("listUsers error:", error);
    return null;
  }
  const found = data.users.find(
    (u) => u.email?.toLowerCase() === authEmail.toLowerCase()
  );
  return found ? found.id : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, name, phone, email, address } = body as {
      leadId: string;
      name: string;
      phone: string;
      email?: string;
      address?: string;
    };

    if (!leadId || !name || !phone) {
      return NextResponse.json(
        { error: "leadId, name, phone은 필수입니다." },
        { status: 400 }
      );
    }

    const authEmail = email && email.trim() ? email.trim() : `${phone}@vfbc.local`;

    // 1. 이 전화번호 "또는" 이메일로 이미 가입된 회원인지 확인
    const { data: existingUsers, error: findError } = await supabaseAdmin
      .from("users")
      .select("id, password_set")
      .or(`phone.eq.${phone},email.eq.${authEmail}`)
      .order("created_at", { ascending: true });

    if (findError) {
      console.error("existingUser lookup error:", findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    const existingUser =
      existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // public.users에 이미 프로필이 있는 회원 — 계정 재생성하지 않고 그대로 사용
      userId = existingUser.id;
    } else {
      // 2. 신규 회원 — auth 계정 생성 시도
      // 비밀번호는 사용자가 절대 알 필요 없는 랜덤 값으로 즉시 설정하고,
      // 이 시점에 이미 "완전히 가입된" 상태로 처리한다 (password_set: true).
      // 사용자에게는 회원가입 절차 자체를 노출하지 않으며,
      // 원하면 나중에 마이페이지에서 비밀번호를 직접 설정/변경할 수 있다.
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: authEmail,
          password: randomPassword(),
          email_confirm: true,
        });

      if (authError || !authData.user) {
        // 이메일이 auth 쪽엔 이미 있는데 public.users엔 프로필이 없는 "고아 계정" 케이스
        if (
          authError?.code === "email_exists" ||
          authError?.message?.includes("already been registered")
        ) {
          const foundId = await findAuthUserIdByEmail(authEmail);
          if (!foundId) {
            console.error("email_exists이지만 auth에서 id를 찾지 못함:", authError);
            return NextResponse.json(
              { error: "계정 조회 중 문제가 발생했습니다." },
              { status: 500 }
            );
          }
          userId = foundId;

          // 프로필이 정말 없는지 다시 한번 확인 후, 없으면 지금 생성
          const { data: profileCheck } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

          if (!profileCheck) {
            const { error: profileError } = await supabaseAdmin
              .from("users")
              .insert({
                id: userId,
                phone,
                email: email && email.trim() ? email.trim() : null,
                name,
                address: address ?? null,
                password_set: true,
              });
            if (profileError) {
              console.error("users insert error (orphan recovery):", profileError);
              return NextResponse.json(
                { error: profileError.message },
                { status: 500 }
              );
            }
          }
        } else {
          console.error("auth.admin.createUser error:", authError);
          return NextResponse.json(
            { error: authError?.message ?? "계정 생성 실패" },
            { status: 500 }
          );
        }
      } else {
        userId = authData.user.id;
        isNewUser = true;

        // 3. public.users 프로필 insert — 즉시 완전 가입 상태로 생성
        const { error: profileError } = await supabaseAdmin.from("users").insert({
          id: userId,
          phone,
          email: email && email.trim() ? email.trim() : null,
          name,
          address: address ?? null,
          password_set: true,
        });

        if (profileError) {
          console.error("users insert error:", profileError);
          return NextResponse.json({ error: profileError.message }, { status: 500 });
        }
      }
    }

    // 4. leads 테이블에 user_id 연결 + service_type/result 조회 (이메일 본문용)
    const { data: leadRow, error: leadUpdateError } = await supabaseAdmin
      .from("leads")
      .update({ user_id: userId })
      .eq("id", leadId)
      .select("service_type, result")
      .maybeSingle();

    if (leadUpdateError) {
      console.error("leads user_id update error:", leadUpdateError);
      // 치명적 에러는 아니므로 진행은 계속
    }

    // 5. result_token 발급
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("result_tokens")
      .insert({
        lead_id: leadId,
        user_id: userId,
      })
      .select("token")
      .single();

    if (tokenError || !tokenData) {
      console.error("result_tokens insert error:", tokenError);
      return NextResponse.json(
        { error: tokenError?.message ?? "토큰 생성 실패" },
        { status: 500 }
      );
    }

    // 6. 이메일이 있으면 결과 안내 메일 자동 발송 (실패해도 응답 자체는 정상 처리)
    const recipientEmail = email && email.trim() ? email.trim() : null;
    if (recipientEmail) {
      const emailResult = await sendResultEmail({
        to: recipientEmail,
        name,
        serviceType: leadRow?.service_type ?? "unknown",
        result: leadRow?.result ?? null,
        token: tokenData.token,
      });

      const { error: notifError } = await supabaseAdmin.from("notifications").insert({
        lead_id: leadId,
        user_id: userId,
        channel: "email",
        template: "result_ready_v1",
        status: emailResult.success ? "sent" : "failed",
        sent_at: emailResult.success ? new Date().toISOString() : null,
        payload: {
          to: recipientEmail,
          serviceType: leadRow?.service_type ?? null,
          result: leadRow?.result ?? null,
          error: emailResult.success ? null : emailResult.error,
        },
      });

      if (notifError) {
        console.error("notifications insert error:", notifError);
        // 알림 로그 실패는 치명적이지 않으므로 진행 계속
      }
    }

    return NextResponse.json({
      userId,
      token: tokenData.token,
      isNewUser,
    });
  } catch (err) {
    console.error("lead-submit route error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
