// src/lib/notify/zalo.ts
//
// STEP6: 관리자 단계변경 → 잘로(Zalo) 자동 알림.
// kakao.ts와 동일한 이유·동일한 패턴이다 — 현재 코드베이스에는 Zalo
// 비즈니스 API 연동이 전혀 없다. api/agency-confirm/route.ts에 이미 있던
// 주석("채널 확장 메모: kakao_id / zalo_id가 있는 경우에만 해당 채널로도
// 함께 발송")대로, 카카오와 잘로를 배타적으로 두지 않고 leads.zalo_id가
// 있는 리드에는 잘로도 병행 시도하도록 호출 시그니처만 먼저 확정한다.
// 실제 발송 로직은 TODO로 남기고, 이 파일 내부만 교체하면 되도록 설계했다.

export type ZaloSendResult =
  | { success: true; id?: string }
  | { success: false; error: string; notConfigured?: true };

type SendStageChangeZaloParams = {
  zaloId: string;
  name: string;
  serviceType: string;
  stageHeadline: string;
};

export async function sendStageChangeZalo(
  params: SendStageChangeZaloParams
): Promise<ZaloSendResult> {
  // TODO(Zalo 비즈니스 API 연동 필요 — 착수 전 Ace에게 아래 준비 여부 확인):
  // 1. Zalo Official Account(OA) 등록 + 알림 메시지(ZNS) 템플릿 사전 승인
  // 2. 발급받은 키를 ZALO_OA_ACCESS_TOKEN / ZALO_TEMPLATE_ID 등 환경변수로
  //    추가(.env.local, Vercel 환경변수 — RESEND_API_KEY와 동일한 등록 방식)
  // 3. 아래에 실제 발송 API(fetch) 호출을 구현:
  //      const res = await fetch("https://business.openapi.zalo.me/message/template", {
  //        method: "POST",
  //        headers: { access_token: process.env.ZALO_OA_ACCESS_TOKEN! },
  //        body: JSON.stringify({
  //          phone: params.zaloId,
  //          template_id: process.env.ZALO_TEMPLATE_ID,
  //          template_data: { name: params.name, stage: params.stageHeadline },
  //        }),
  //      });
  // 4. 성공/실패에 따라 { success: true, id } 또는
  //    { success: false, error } 형태로 반환하도록 교체
  //
  // 지금은 API가 없으므로 항상 "미연동" 상태를 반환한다. 호출부(stageChange.ts)는
  // 이 결과를 notifications 테이블에 channel: "zalo", status: "skipped"로
  // 기록해 관리자가 "발송 실패"와 "아직 연동 안 됨"을 구분할 수 있게 한다.
  void params; // 실제 연동 전까지는 인자를 사용하지 않는다(시그니처만 확정)
  return { success: false, error: "Zalo API 미연동", notConfigured: true };
}
