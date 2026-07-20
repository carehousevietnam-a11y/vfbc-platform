// src/lib/notify/kakao.ts
//
// STEP6: 관리자 단계변경 → 카카오톡 자동 알림.
// 현재 코드베이스에는 카카오 비즈니스 API 연동이 전혀 없다(v21 핸드오프
// 확인 완료). 실제 API 키/발신프로필이 준비되기 전까지는 호출 시그니처와
// notifications 로그 패턴만 먼저 확정해두고, 발송 로직 자체는 TODO로
// 남긴다. 이렇게 해두면 나중에 이 파일 내부만 교체하면 되고, 호출부
// (stageChange.ts)는 수정할 필요가 없다.
//
// api/agency-confirm/route.ts에 이미 있던 주석("채널 확장 메모")과 동일한
// 방향으로 설계했다: leads.kakao_id가 있는 리드에만 시도한다.

export type KakaoSendResult =
  | { success: true; id?: string }
  | { success: false; error: string; notConfigured?: true };

type SendStageChangeKakaoParams = {
  kakaoId: string;
  name: string;
  serviceType: string;
  stageHeadline: string;
};

export async function sendStageChangeKakao(
  params: SendStageChangeKakaoParams
): Promise<KakaoSendResult> {
  // TODO(카카오 비즈니스 API 연동 필요 — 착수 전 Ace에게 아래 준비 여부 확인):
  // 1. 카카오 비즈니스 채널 발신프로필 등록 + 알림톡 템플릿 사전 승인
  // 2. 발급받은 키를 KAKAO_API_KEY / KAKAO_SENDER_KEY 등 환경변수로 추가
  //    (.env.local, Vercel 환경변수 — RESEND_API_KEY와 동일한 등록 방식)
  // 3. 아래에 실제 발송 API(fetch) 호출을 구현:
  //      const res = await fetch("https://<카카오 알림톡 발송 엔드포인트>", {
  //        method: "POST",
  //        headers: { Authorization: `Bearer ${process.env.KAKAO_API_KEY}` },
  //        body: JSON.stringify({
  //          to: params.kakaoId,
  //          template: "...",
  //          variables: { name: params.name, stage: params.stageHeadline },
  //        }),
  //      });
  // 4. 성공/실패에 따라 { success: true, id } 또는
  //    { success: false, error } 형태로 반환하도록 교체
  //
  // 지금은 API가 없으므로 항상 "미연동" 상태를 반환한다. 호출부(stageChange.ts)는
  // 이 결과를 notifications 테이블에 channel: "kakao", status: "skipped"로
  // 기록해 관리자가 "발송 실패"와 "아직 연동 안 됨"을 구분할 수 있게 한다.
  void params; // 실제 연동 전까지는 인자를 사용하지 않는다(시그니처만 확정)
  return { success: false, error: "카카오 API 미연동", notConfigured: true };
}
