// src/lib/funnelTrack.ts
//
// 퍼널 단계 진입 익명 기록(클라이언트). 실패해도 화면 동작에 영향 없음.
// 서비스 슬러그는 경로에서 도출: /verify/trc -> verify_trc, /check/wp -> check_wp.
// 개인정보·답변 내용은 보내지 않는다. 설계: docs/master/FUNNEL_TRACKING_DESIGN.md

const SESSION_KEY = "vfbcai_funnel_session";
const sent = new Set<string>();

function getSessionId(): string | null {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    // 서버가 접수 완료(submit)를 같은 세션에 이어 붙일 수 있도록 임의 UUID만 쿠키로 남긴다(개인정보 아님).
    document.cookie = `vfbcai_fs=${id}; path=/; max-age=7200; SameSite=Lax`;
    return id;
  } catch {
    return null;
  }
}

export function serviceFromPathname(pathname: string | null): { engine: string; service: string } | null {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  const engine = parts[0];
  if (engine !== "check" && engine !== "verify" && engine !== "register") return null;
  if (parts.length < 2) return null;
  const service = parts.join("_").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!service || service.length > 60) return null;
  return { engine, service };
}

export function trackFunnelView(pathname: string | null, step: number): void {
  try {
    const target = serviceFromPathname(pathname);
    if (!target) return;
    const key = `${target.service}:${step}`;
    if (sent.has(key)) return;
    sent.add(key);

    const sessionId = getSessionId();
    if (!sessionId) return;

    const htmlLang = document.documentElement.lang;
    void fetch("/api/funnel-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        session_id: sessionId,
        engine: target.engine,
        service: target.service,
        step,
        event: "view",
        device: window.innerWidth < 768 ? "mobile" : "desktop",
        lang: /^[a-z]{2}(-[A-Za-z]{2})?$/.test(htmlLang) ? htmlLang : null,
      }),
    }).catch(() => {});
  } catch {
    // 기록 실패는 무시
  }
}
