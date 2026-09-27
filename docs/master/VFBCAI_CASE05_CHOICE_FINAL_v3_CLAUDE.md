# CASE_05 (처분·조치 통지) 질문·선택지 최종본 v3 — Claude 작성

v3 (2026-09-27): v2 대체. 기준 = VFBCAI_QUESTION_CHOICE_RULE_LOCK_FINAL.md (최신 우선)
- 선택지 최대 5개 + 직접 입력 1개 (v2의 6개 질문 7개 → 5개로 병합)
- 선택지 하나 = 사실 2개(2층), 꼭 필요할 때만 3개(3층). [ ] 안은 얻는 사실(화면 표시 X)
- 정제된 문어체("냈다"→"제출했다", "기관"→"교통국" 등). 외국인이 판단해야 하는 행정 전문용어는 쓰지 않음
- slug 유지. 병합·의미 변경 slug는 §C. 질문 구조·표시 조건은 v2 그대로(제거된 3개 질문 계속 제거)

## A. 1차 공통

### case05_dispositionType
Q: 교통국으로부터 어떤 통지를 받으셨나요?
- application_denied: 신청한 허가나 등록이 승인되지 않았다는 통지를 받았습니다. [신청 함 / 결과: 불허]
- rights_ended: 이미 받은 면허나 허가가 정지되거나 취소된다는 통지를 받았습니다. [기존 권리 보유 / 정지·취소]
- business_suspended: 일정 기간 동안 운행이나 영업을 하지 말라는 통지를 받았습니다. [기간 제한 / 활동 금지]
- situation_mismatch: 통지를 받았지만, 적힌 내용이 실제 있었던 일과 다릅니다. [통지 받음 / 사실 불일치]
- disposition_unclear: 통지를 받았지만, 어떤 조치이고 무엇을 해야 하는지 이해하지 못했습니다. [통지 받음 / 이해 못함]

### case05_confirmGoal
Q: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- understand_reason: 이런 통지를 받은 이유를 알 수 없어, 그 이유부터 확인하고 싶습니다. [이유 모름 / 목표: 이유]
- understand_impact: 이 조치로 앞으로 무엇을 할 수 없게 되는지, 업무나 생활에 미치는 영향을 확인하고 싶습니다. [목표: 영향 / 범위: 업무·생활]
- appeal_possibility: 이 결정을 다시 검토해 달라고 요청할 수 있는지, 기한은 언제까지인지 확인하고 싶습니다. [목표: 재검토 가능성 / 기한]
- what_to_do: 서류 제출·납부·방문 등 지금 바로 해야 할 일을 확인하고 싶습니다. [목표: 즉시 조치]
- unsure: 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다. [복합 상황 / 목표: 순서]

### case05_customerResponse
Q: 통지를 받은 뒤, 현재 어디까지 진행하셨나요?
- none: 통지만 받았고, 아직 교통국에 문의하거나 서류를 제출하지 않았습니다. [문의 X / 제출 X]
- inquired: 교통국에 전화하거나 방문해 문의했지만, 서류나 요청서는 제출하지 않았습니다. [문의 함 / 제출 X]
- explanation_submitted: 제 사정을 서면으로 제출했거나, 직접 방문해 설명했습니다. [소명 함 / 방식: 서면·방문]
- documents_submitted: 교통국이 요청한 서류나 증빙을 준비해 제출했습니다. [요청 받음 / 제출 함]
- appeal_requested: 결정을 다시 검토해 달라고 교통국에 정식으로 요청했습니다. [재검토 요청 함]

### case05_deadline
Q: 이 일과 관련해 언제까지 무엇을 해야 하는지 안내받으셨나요?
- specific_date: 통지서나 안내문에 적힌 정확한 날짜를 확인했습니다. [기한 있음 / 날짜 확정] → 날짜 입력
- period_stated: '통지받은 날부터 며칠 이내'처럼 기간만 적혀 있어, 정확한 날짜는 계산하지 못했습니다. [기한 있음 / 기간만]
- uncertain: 기한이 있다는 안내는 받았지만, 정확한 날짜는 확인하지 못했습니다. [기한 있음 / 날짜 미확인]
- not_stated: 통지서를 확인했지만, 기한에 관한 내용은 찾지 못했습니다. [통지서 확인 / 기한 없음]
- unsure: 통지서가 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다. [언어 장벽 / 기한 미확인]

### case05_deadlineDate (날짜 입력)
Q: 안내받은 날짜를 입력해 주세요.
안내(placeholder): 통지서에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일까지

## B. 2차 개인화

### case05_factRelationship
Q: 통지서에 적힌 내용은 실제 있었던 일과 비교하면 어떤가요?
- match: 통지서에 적힌 내용이 실제 있었던 일과 거의 같습니다. [사실 일치]
- partial: 대부분 맞지만, 날짜·장소·금액 등 일부 내용이 실제와 다릅니다. [대부분 일치 / 일부 불일치]
- mismatch: 통지서에 적힌 일 자체가 실제 있었던 일과 크게 다릅니다. [전체 불일치]
- hard_to_judge: 기록이 없거나 시간이 오래 지나, 실제와 비교하기 어렵습니다. [기록 X / 비교 불가]
- unknown: 통지서의 내용을 이해하지 못해, 비교할 수 없습니다. [이해 못함 / 비교 불가]

### case05_factDetail
Q: 실제와 다른 부분은 무엇인가요?
- date_place_certain: 날짜·장소·상황이 실제와 다르며, 이를 분명히 기억하고 있습니다. [불일치: 일시·장소 / 기억 확실]
- date_place_fuzzy: 날짜·장소가 다른 것 같지만, 정확히 기억나지 않습니다. [불일치: 일시·장소 / 기억 불확실]
- content_differs_clear: 제 행동이나 사유가 다르게 적혀 있으며, 무엇이 다른지 설명할 수 있습니다. [불일치: 내용 / 설명 가능]
- content_differs_vague: 내용이 다른 것 같지만, 무엇이 다른지 아직 정리하지 못했습니다. [불일치: 내용 / 정리 안 됨]

### case05_dispositionReason (6 → 5)
Q: 통지서에는 조치 이유가 어떻게 적혀 있었나요?
- violation_claimed: 제가 특정 규정을 위반했다고 적혀 있습니다. [사유: 위반]
- document_issue: 제출한 서류나 신청 내용이 틀렸거나 빠졌다고 적혀 있습니다. [사유: 서류 오류·누락]
- requirement_not_met: 필요한 조건이나 자격을 갖추지 못했다고 적혀 있습니다. [사유: 요건 미충족]
- deadline_procedure: 정해진 기한이나 절차를 지키지 않았다고 적혀 있습니다. [사유: 기한·절차]
- no_clear_reason: 이유가 적혀 있지 않거나, 적혀 있어도 무슨 뜻인지 이해하지 못했습니다. [사유 불명 / 이해 못함]

### case05_dispositionDetail
Q: 이 조치로 실제로 무엇이 달라지는지 알고 계신가요?
- wording_unclear: 통지서 문구가 모호해서, 무엇이 금지되는지 알기 어렵습니다. [문구 모호 / 금지 내용 모름]
- scope_unclear: 금지되는 일은 알지만, 기간과 범위는 확인하지 못했습니다. [금지 내용 앎 / 기간·범위 모름]
- partially_understood: 일부는 이해했지만, 업무나 생활에 미치는 영향은 확실하지 않습니다. [일부 이해 / 영향 불확실]
- unsure: 이 조치로 무엇이 달라지는지 아직 전혀 알지 못합니다. [전혀 모름]

### case05_explanationDetail (6 → 5)
Q: 어떤 방법으로 설명하셨고, 교통국에서 접수 확인을 받으셨나요?
- written_no_receipt: 서면으로 제출했지만, 접수 확인이나 접수번호는 받지 못했습니다. [서면 / 접수 미확인]
- written_receipt_ok: 서면으로 제출했고, 접수 확인(접수번호 등)을 받았습니다. [서면 / 접수 확인]
- verbal_no_record: 전화나 방문으로 설명만 했고, 따로 남긴 기록은 없습니다. [구두 / 기록 X]
- verbal_with_record: 전화나 방문으로 설명했고, 설명한 내용을 메모해 두었습니다. [구두 / 기록 O]
- both_aligned: 서면으로도 제출하고 직접 설명도 했으며, 두 설명의 내용은 같습니다. [서면+구두 / 내용 일치]

### case05_submittedDocsDetail (목록형, 여러 개)
Q: 교통국에 제출한 서류를 모두 선택해 주세요. (여러 개 선택 가능)
- identity: 여권·신분증 같은 신분 서류
- financial: 통장 내역·영수증 같은 금액 관련 서류
- certificate: 기관이나 회사가 발급한 증명서·확인서
- unsure: 서류를 제출했지만, 어떤 서류였는지 정확히 알지 못합니다. [제출 함 / 종류 모름]

### case05_appealDetail (6 → 5)
Q: 재검토 요청은 현재 어디까지 진행되었나요?
- filed_no_receipt: 재검토 요청서를 제출했지만, 접수 확인은 아직 받지 못했습니다. [제출 함 / 접수 미확인]
- filed_no_schedule: 재검토 요청서가 접수되었지만, 결과가 언제 나오는지는 안내받지 못했습니다. [접수 / 일정 모름]
- filed_schedule_known: 재검토 요청서가 접수되었고, 결과가 나오는 시점도 안내받았습니다. [접수 / 일정 앎]
- preparing_deadline_unknown: 재검토 요청을 준비하고 있지만, 아직 제출하지 않았습니다. [준비 중 / 미제출]
- considering: 재검토를 요청할지 아직 결정하지 못했습니다. [미결정]

### case05_authorityFollowUp (6 → 5)
Q: 교통국에 문의하거나 서류를 제출한 뒤, 어떤 답변을 받으셨나요?
- maintained: 처음 결정을 그대로 유지한다는 답변을 받았습니다. [답변 받음 / 결정 유지]
- changed: 결정이 변경되었거나 취소되었다는 답변을 받았습니다. [답변 받음 / 결정 변경]
- wants_more: 서류를 추가로 제출하거나, 직접 방문해 설명하라는 안내를 받았습니다. [추가 요구 / 서류·출석]
- no_response: 아직 최종 답변은 받지 못했고, 결과를 기다리고 있습니다. [최종 답변 X / 대기]
- unsure: 답변을 받았지만, 무슨 의미인지 이해하지 못했습니다. [답변 받음 / 이해 못함]

### case05_blockage (6 → 5, 3층)
Q: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- why_disposition: 조치를 받은 이유를 이해하지 못해, 어떻게 대응할지 판단하지 못하고 있습니다. [막힘: 이유 / 상태: 판단 보류]
- what_disposition: 이 조치가 정확히 무엇인지 몰라, 어디서부터 시작해야 할지 모르겠습니다. [막힘: 조치 내용 / 상태: 미착수]
- fact_match: 통지 내용이 실제와 맞는지 확인할 방법이 없어, 진행이 멈춰 있습니다. [막힘: 사실 확인 / 상태: 정지]
- what_to_do: 해야 할 일과 준비해야 할 서류를 알지 못해, 진행하지 못하고 있습니다. [막힘: 할 일·서류 / 상태: 정지]
- next_response: 교통국의 답변을 기다리고 있거나, 받은 답변을 이해하지 못해 멈춰 있습니다. [막힘: 기관 답변 / 상태: 대기]

### case05_evidence (목록형, 여러 개, 6 → 5)
Q: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- disposition_notice: 교통국에서 받은 통지서나 안내문
- message_email: 교통국과 주고받은 문자·이메일·메신저
- submitted_docs: 제가 제출한 서류나 납부 영수증(사본 포함)
- photo_video: 당시 상황을 보여 주는 사진·영상
- none: 보관 중인 자료가 없습니다. [자료 없음 / 단독 선택]

### case05_finalGoal (6 → 5, 1차 confirmGoal과 다른 축: 확인 후 하고 싶은 것)
Q: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- why_disposition: 조치 이유를 정확히 확인하고, 제 잘못이 맞는지 판단하고 싶습니다. [목표: 이유 / 책임 판단]
- what_disposition: 이 조치로 달라지는 점을 확인하고, 업무나 생활을 미리 조정하고 싶습니다. [목표: 영향 / 대비]
- fact_match: 통지 내용이 사실과 맞는지 확인하고, 다르다면 바로잡고 싶습니다. [목표: 사실 확인 / 정정 의사]
- what_to_do: 해야 할 일과 준비할 서류를 순서대로 확인해, 기한 내에 처리하고 싶습니다. [목표: 할 일·서류 / 기한 내 처리]
- next_action: 결정을 다시 검토해 달라고 요청하는 방법을 확인하고, 진행하고 싶습니다. [목표: 재검토 / 진행 의사]
(A2와 같은 목표 제외 규칙은 v2대로 유지)

## C. slug 병합·의미 변경 (adminVerifyChoiceSlugCanonical.ts 한 곳)
병합 (옛 → 새):
- case05_dispositionReason: unsure → no_clear_reason
- case05_appealDetail: preparing_deadline_known → preparing_deadline_unknown
- case05_authorityFollowUp: under_review → no_response
- case05_blockage: evidence → what_to_do
- case05_evidence: payment_proof → submitted_docs
- case05_finalGoal: evidence → what_to_do
정확히 같은 뜻이 없어 원문 표시(판단 문장에 쓰지 않음):
- case05_explanationDetail: both_unverified
라벨 뜻이 바뀐 slug — 판단 문장(adminVerifyJudgmentClauses.data.ts)을 새 라벨 뜻에 맞출 것. 고객이 고르지 않은 사실(기한 앎/모름 등)을 문장에 넣지 않음:
- preparing_deadline_unknown (기한 내용 빠짐), no_response (검토 중 안내 포함), no_clear_reason, what_to_do(blockage·finalGoal), submitted_docs, finalGoal 전체(목표 문장 변경)
