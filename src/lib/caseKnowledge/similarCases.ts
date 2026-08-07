// src/lib/caseKnowledge/similarCases.ts
//
// STEP21 — 유사 사례 검색(읽기 전용). service_type/category/country/
// province/industry/result_status로 필터링하는 단순 검색이다. 지시서
// 7번("향후 Vector Search 연결 가능하도록 구조 설계")에 맞춰, 호출부
// 시그니처(SimilarCaseQuery in/CaseKnowledgeRow[] out)를 유지한 채
// 내부 구현만 나중에 임베딩 기반 유사도 검색으로 교체할 수 있도록
// 필터 조립과 실행을 분리해뒀다.
//
// is_published=true인 행만 반환한다 — PII 검토가 끝나지 않은 사례가
// 유사 사례 검색이나 AI 프롬프트에 노출되는 일을 코드 레벨에서 막는다.
// [STEP21-1] case_status='closed'도 함께 강제한다 — DB CHECK 제약
// (case_knowledge_publish_requires_closed)이 이미 "is_published=true면
// case_status는 반드시 closed"를 보장하지만, 여기서도 명시적으로 한 번
// 더 걸어 의도를 코드만 읽어도 알 수 있게 했다(지시서 5번: 진행 중인
// 사건은 통계/검색에서 제외).

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { CaseKnowledgeRow, SimilarCaseQuery } from "./types";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

export async function findSimilarCases(query: SimilarCaseQuery): Promise<CaseKnowledgeRow[]> {
  const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

  let builder = supabaseAdmin
    .from("case_knowledge")
    .select("*")
    .eq("is_published", true)
    .eq("case_status", "closed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (query.serviceType) builder = builder.eq("service_type", query.serviceType);
  if (query.category) builder = builder.eq("category", query.category);
  if (query.country) builder = builder.eq("country", query.country);
  if (query.province) builder = builder.eq("province", query.province);
  if (query.industry) builder = builder.eq("industry", query.industry);
  if (query.resultStatus) builder = builder.eq("result_status", query.resultStatus);

  const { data, error } = await builder;

  if (error) {
    console.error("findSimilarCases error:", error);
    return [];
  }

  return (data ?? []) as CaseKnowledgeRow[];
}
