/** §01·integrated narrative fragments — Layer G */

function key(caseCode: string, outlet: string, fieldId: string, slug: string): string {
  return `${caseCode}|${outlet}|${fieldId}|${slug}`;
}

export function buildLayerJIntegratedClauseMap(): Record<string, string> {
  const o = "§01·integrated";
  const m: Record<string, string> = {};
  const put = (c: string, fieldId: string, slug: string, clause: string) => {
    m[key(c, o, fieldId, slug)] = clause;
  };

  put("02", "case02_paymentStatus", "not_paid", "아직 이 납부 요구에 대해 납부하지 않은 상태이며");
  put("02", "case02_paymentStatus", "partial", "일부만 납부한 상태이며");
  put("02", "case02_paymentStatus", "paid_unverified", "납부했으나 기관 처리 여부가 확인되지 않은 상태이며");
  put("02", "case02_paymentStatus", "full", "요구 금액을 납부한 상태이며");
  put("02", "case02_paymentStatus", "paid_by_other", "다른 사람이 대신 납부한 상태이며");

  put("03", "case03_customerResponse", "none", "아직 출석·소명 등 공식 대응을 하지 않은 상태이며");
  put(
    "03",
    "case03_customerResponse",
    "phone_message",
    "전화·메시지 등으로 기관에 문의·설명한 상태이며",
  );
  put("03", "case03_customerResponse", "attendance", "직접 방문해 설명한 상태이며");
  put(
    "03",
    "case03_customerResponse",
    "explanation_with_docs",
    "설명과 함께 자료를 제출한 상태이며",
  );
  put("03", "case03_customerResponse", "other_method", "다른 방법으로 기관에 대응한 상태이며");

  put("04", "case04_customerResponse", "not_started", "아직 보완 제출을 시작하지 않은 상태이며");
  put("04", "case04_customerResponse", "preparing", "보완 자료를 준비 중인 상태이며");
  put("04", "case04_customerResponse", "submitted", "보완 자료를 제출한 상태이며");
  put("04", "case04_customerResponse", "inquired", "기관에 문의·확인한 상태이며");
  put("04", "case04_customerResponse", "other_method", "다른 방법으로 보완에 대응한 상태이며");

  put("05", "case05_customerResponse", "none", "아직 처분·통지에 대한 공식 대응을 하지 않은 상태이며");
  put("05", "case05_customerResponse", "inquired", "기관에 문의·확인한 상태이며");
  put("05", "case05_customerResponse", "explanation_submitted", "소명·의견을 제출한 상태이며");
  put("05", "case05_customerResponse", "documents_submitted", "서류·증빙을 제출한 상태이며");
  put("05", "case05_customerResponse", "appeal_requested", "이의·재검토를 요청한 상태이며");

  return m;
}
