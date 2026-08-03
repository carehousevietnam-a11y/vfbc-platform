// src/lib/adminAuth/middlewareClient.ts
//
// 개인별 관리자 인증 STEP 1 — src/middleware.ts 전용 Supabase Auth
// 클라이언트 팩토리.
//
// [수정] 기존 구현은 setAll()에서 응답(response) 쿠키만 갱신하고
// 요청(request) 쿠키는 그대로 두었다. 이 경우 middleware가 토큰을
// refresh해도, 그 refresh된 값은 "브라우저로 내려가는 응답"에만 반영될 뿐
// 같은 요청이 이어서 도달하는 route.ts(Route Handler)에는 반영되지 않아,
// route.ts 쪽에서는 refresh 이전의 오래된 세션을 계속 읽게 되는 문제가
// 있었다.
//
// Supabase 공식 Next.js 미들웨어 패턴대로, setAll()에서
// 1) req.cookies.set(...)으로 "다음 단계로 전달될 요청" 자체를 먼저 갱신하고
// 2) 그 갱신된 req를 기준으로 NextResponse.next({ request: req })를 다시
//    만들어 응답 쿠키도 함께 갱신한다.
// 이렇게 만들어진 최종 응답은 getResponse()로 꺼내 middleware.ts가 그대로
// 반환해야 한다(그래야 req.cookies 갱신 내용이 route.ts로 전달되는 실제
// 요청에 반영된다).
//
// 고객용 src/lib/supabase.ts(anon key, 브라우저 전용 클라이언트)는 건드리지
// 않았고, 이 파일은 middleware.ts에서만 사용한다.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export function createAdminMiddlewareClient(req: NextRequest) {
  // setAll()이 호출될 때마다 갱신된 req를 기준으로 다시 만들어진다.
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1) 같은 요청 안에서 이어지는 처리(route.ts 포함)가 최신 쿠키를
          //    읽을 수 있도록 요청 자체의 쿠키를 먼저 갱신한다.
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });

          // 2) 갱신된 req를 기준으로 응답을 다시 만들고, 응답 쿠키에도
          //    동일하게 반영해 브라우저에도 최신 세션이 내려가게 한다.
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return {
    supabase,
    /** setAll() 호출 이후 최신 상태로 갱신된 NextResponse를 반환한다. */
    getResponse: () => response,
  };
}
