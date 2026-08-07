// src/lib/caseKnowledge/reviewWorkflow.ts
//
// STEP21-1 — 게시 승인 구조(지시서 6번). 관리자가 검토(필요시 내용 수정)
// → 게시 → 게시취소를 할 수 있도록 세 함수로 분리했다. "검토"와 "게시"를
// 하나의 액션으로 합치지 않은 이유: PII 자동 제거(piiRedaction.ts)가
// 완벽을 보장하지 않으므로(회사명 등은 놓칠 수 있음), 관리자가 내용을
// 실제로 읽고 필요하면 고친 뒤(review) 게시 여부를 별도로 결정(publish)
// 하는 2단계 구조가 안전하다 — case_knowledge/piiRedaction.ts 파일
// 상단 주석의 "정규식 + 후처리" 설계와 짝을 이룬다.
//
// 게시 규칙(코드로 강제):
//   - publish는 반드시 needs_manual_review=false(=검토를 거침) 상태에서만
//     가능하다 — 검토를 건너뛰고 바로 게시할 수 없다.
//   - publish는 case_status='closed'인 사건만 가능하다(DB CHECK 제약과
//     동일한 규칙을 애플리케이션에서도 한 번 더 확인해 더 친절한 에러
//     메시지를 준다).
//   - unpublish는 is_published만 false로 되돌리고, 검토 이력(reviewed_*)과
//     마지막 게시 이력(published_*)은 지우지 않는다 — "이전에 누가
//     검토·게시했었는지"는 감사 기록으로 남겨둔다.

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { redactPii, fetchKnownPii } from "./piiRedaction";
import type { CaseKnowledgeRow, CaseReviewInput } from "./types";

export type CaseKnowledgeActionResult =
  | { ok: true; row: CaseKnowledgeRow }
  | { ok: false; error: string };

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// 관리자가 내용을 다시 편집할 수 있는 후처리(post-processing) 단계.
// 넘긴 필드만 갱신하고(부분 업데이트), 넘긴 텍스트도 다시 한번 redactPii()를
// 통과시킨다 — 관리자가 직접 입력한 새 텍스트에 실수로 PII를 남겨도
// 최소한 알려진 값(known PII)/패턴은 한 번 더 걸러진다.
export async function reviewCaseKnowledge(
  id: string,
  input: CaseReviewInput
): Promise<CaseKnowledgeActionResult> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("case_knowledge")
    .select("lead_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "해당 사례 지식을 찾을 수 없습니다." };
  }

  const known = existing.lead_id ? await fetchKnownPii(existing.lead_id) : null;
  const redact = (text: string, max: number) =>
    truncate(known ? redactPii(text, known) : text, max);

  const patch: Record<string, unknown> = {
    needs_manual_review: false,
    reviewed_by: input.reviewedBy,
    reviewed_at: new Date().toISOString(),
  };
  if (typeof input.question === "string") patch.question = redact(input.question, 4000);
  if (typeof input.aiAnswer === "string") patch.ai_answer = redact(input.aiAnswer, 4000);
  if (typeof input.expertReview === "string")
    patch.expert_review = redact(input.expertReview, 4000);
  if (typeof input.finalResult === "string") patch.final_result = redact(input.finalResult, 2000);
  if (typeof input.rejectionReason === "string")
    patch.rejection_reason = redact(input.rejectionReason, 1000);

  const { data, error } = await supabaseAdmin
    .from("case_knowledge")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("reviewCaseKnowledge update error:", error);
    return { ok: false, error: "검토 내용을 저장하지 못했습니다." };
  }

  return { ok: true, row: data as CaseKnowledgeRow };
}

export async function publishCaseKnowledge(
  id: string,
  publishedBy: string
): Promise<CaseKnowledgeActionResult> {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("case_knowledge")
    .select("case_status, needs_manual_review")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "해당 사례 지식을 찾을 수 없습니다." };
  }
  if (existing.needs_manual_review) {
    return { ok: false, error: "먼저 검토(review)를 완료해야 게시할 수 있습니다." };
  }
  if (existing.case_status !== "closed") {
    return { ok: false, error: "종료된(closed) 사건만 게시할 수 있습니다." };
  }

  const { data, error } = await supabaseAdmin
    .from("case_knowledge")
    .update({
      is_published: true,
      published_by: publishedBy,
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("publishCaseKnowledge update error:", error);
    return { ok: false, error: "게시 처리에 실패했습니다." };
  }

  return { ok: true, row: data as CaseKnowledgeRow };
}

export async function unpublishCaseKnowledge(id: string): Promise<CaseKnowledgeActionResult> {
  const { data, error } = await supabaseAdmin
    .from("case_knowledge")
    .update({ is_published: false })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("unpublishCaseKnowledge update error:", error);
    return { ok: false, error: "게시취소 처리에 실패했습니다." };
  }

  return { ok: true, row: data as CaseKnowledgeRow };
}
