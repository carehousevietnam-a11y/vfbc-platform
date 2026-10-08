# C2.5 PDF 경로 조사 — verify_real-estate vs verify_admin

## 고객용 My Page PDF

| 항목 | 위치 |
|------|------|
| HTTP | `src/app/api/mypage-pdf/route.ts` POST |
| 렌더 | `buildMypagePdfDocumentFromLeadAndActivities` → `src/lib/mypagePdfExecutiveRender.ts` |
| VERIFY 본문 | `buildVerifyMasterReportContent` (L172~) |
| Admin 본문 | `buildAdminVerifyAiReportContentFromActivities` — `src/lib/adminVerifyMypageFields.ts` L1149 |
| RE 본문 (C2.5) | `buildRealEstateVerifyAiReportContentFromActivities` — `src/lib/contentPacks/realEstate/realEstateVerifyPdfContent.ts` |
| 폰트 measure | `ensureMypageExecutivePdfMeasureFonts` + `bindAdminVerifyPaidEvidenceMeasureFonts` (L698–699, L-12) |
| 줄바꿈 | `mypagePdfExecutiveParagraphWrap.ts` |
| PDF 게이트 | `shouldGateVerifyExpertPageAiReportPdfFromActivities` (admin + RE) |

### serviceType 식별

| 저장값 | normalize | `buildVerifyMasterReportContent` 분기 |
|--------|-----------|--------------------------------------|
| `verify_admin` | `verify_admin` | `verify_admin` → case_resolution + admin answers |
| `verify_real-estate` | `verify_real-estate` | `verify_real_estate` → Pack meta (C2.5) |

### crm_activities.meta 키 (RE Pack, My Page·PDF 공용)

| meta 키 | PDF 섹션 |
|---------|----------|
| `admin_verify_answers_json` | 1·2차 답변 재계산 (parsePackAnswersFromActivities) |
| `admin_phase2_documents_upload_complete` = `1` | 유료(2차 완료) PDF 레이아웃 |
| `real_estate_pack_headline` | Executive headline / execSummary 결론 |
| `real_estate_pack_phase2_summary` | 2차 요약 문장 (My Page `phase2SummaryLines` 동일 소스) |
| `real_estate_pack_grade2` | Dashboard·등급 (카드와 동일) |
| `real_estate_pack_caution_count` | 위험 건수 참고 |
| `document-upload/*` (phase2) | EVIDENCE 제출 자료 bullet (`listAdminPhase2DocumentUploadRefs`) |

1차 요약: `buildRealEstatePhase1SummaryLinesFromActivities` → EVIDENCE ■ 1차  
2차 요약: `buildRealEstatePhase2SummaryLinesFromActivities` → EVIDENCE ■ 2차 (문자 단위 My Page 일치)

## 전문가용 Case PDF (관리자)

| 항목 | 위치 |
|------|------|
| HTTP | `src/app/api/admin/case-pdf/route.ts` |
| VERIFY | `VERIFY_CATEGORY_MAP` → `getVerifyDiagnosis` (`real-estate` category) |
| Admin Master 전용 본문 | **없음** (verify_admin도 case-pdf는 diagnosis 경로) |

C2.5: 고객 Executive PDF(`mypagePdfExecutiveRender`)를 Pack과 연결. case-pdf는 기존 verify 카테고리 매핑 유지(Admin·RE 동일 패턴).

## Phase2 handoff (d04744b 회귀)

| | Admin | RE |
|--|-------|-----|
| snapshot key | `vfbcai_admin_verify_phase2_snapshot` | `vfbcai_real_estate_verify_phase2_snapshot` |
| documents URL | `service=verify_admin&mode=phase2_upload` | `service=verify_real-estate&mode=phase2_upload` |
| snapshot JSON | `leadId`, `answers`, `resultToken` + additive `serviceType` | 동일 |

`src/lib/verifyMasterPhase2Handoff.ts`, `documents/page.tsx` — RE 분기는 snapshot `serviceType` 읽기만, Admin URL·키 변경 없음.
