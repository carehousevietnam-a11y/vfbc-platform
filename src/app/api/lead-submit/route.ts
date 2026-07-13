import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendResultEmail } from "@/lib/notify/email";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// "정보만 입력한 시점"에는 이메일을 보내지 않는다. 실제로 사용자가 행동
// (포털 클릭=직접신청 선택, 대행신청 확정)을 취했을 때만 /api/agency-confirm에서
// 이메일(추후 SNS도 함께)을 보낸다.
// - possible/conditional/impossible: TRC/WP 진단 결과 (아직 아무 행동 안 함)
// - self: 땀주 등 "셀프로 진행하겠다"고 선택만 한 상태 (아직 포털 클릭 전)
// "agency"는 여기 포함하지 않는다 — 대행 폼 제출 자체가 이미 확정 행동이라
// 즉시 발송이 맞다.
const DEFERRED_RESULTS = ["possible", "conditional", "impossible", "self"];

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

    // 6. 이메일 발송 여부 결정
    //    - 진단 결과 단계, 셀프 선택만 한 단계는 아직 실제 행동이 아니므로
    //      이메일을 보내지 않는다 (피로도 방지). 실제 포털 클릭·대행 확정 시점에
    //      /api/agency-confirm이 대신 발송한다 (추후 SNS 채널도 여기서 함께 처리).
    //    - "agency"(대행 폼 직접 제출)는 그 자체가 확정 행동이므로 즉시 발송한다.
    const recipientEmail = email && email.trim() ? email.trim() : null;
    const isDeferred = DEFERRED_RESULTS.includes(leadRow?.result ?? "");

    if (recipientEmail && !isDeferred) {
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
