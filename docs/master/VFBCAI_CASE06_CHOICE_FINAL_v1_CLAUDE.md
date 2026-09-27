# CASE_06 (내용 불명확 통지) 질문·선택지 최종본 v1 — Claude 작성

기준: VFBCAI_QUESTION_CHOICE_RULE_LOCK_FINAL.md + 대표 지시(2026-09-27): "모른다"를 반복해서 묻지 않고, 무엇을 받았는지·어디서 막혔는지·왜 모르는지·무엇을 시도했는지를 고객 경험으로 확보. 선택지 최대 5개 + 직접 입력.
- 모든 질문이 이미 5개 이하 → 개수 변경 없음, slug 변경 없음. 문장만 교체.
- 짧은 단어형 선택지("맞음", "설명 못 받음" 등)를 고객 경험 문장으로 바꿈.
- CASE_06 routing·classification·bridge·Phase 2 STOP·snapshot·handoff 변경 없음.
- [ ] 안은 선택으로 얻는 사실(화면 표시 X).

## A. 1차 공통

### case06_requiredActionCandidate
Q: 문서나 설명을 통해, 교통국이 무엇을 하라고 한 것으로 이해하셨나요?
- pay_demand: 벌금이나 수수료 등, 어떤 돈을 내라는 내용으로 이해했습니다. [요구: 납부]
- attend_explain: 교통국 등에 직접 가서, 상황을 설명하라는 내용으로 이해했습니다. [요구: 방문·설명]
- submit_supplement: 서류를 새로 내거나, 빠진 내용을 채워서 다시 내라는 내용으로 이해했습니다. [요구: 제출·보완]
- disposition_notice: 면허 정지나 제재처럼, 이미 결정된 조치를 알리는 내용으로 이해했습니다. [통지: 결정된 조치]
- problem_action_unclear: 문제가 있다는 것은 알지만, 무엇을 해야 하는지는 알 수 없었습니다. [문제 인지 / 할 일 모름]

### case06_knowledgeSource
Q: 이 내용을 어떻게 확인하셨나요?
- doc_read_understood: 문서를 직접 읽었고, 적힌 내용을 대부분 이해했습니다. [문서 직접 / 이해]
- doc_read_not_understood: 문서는 직접 봤지만, 베트남어나 행정 용어 때문에 뜻을 이해하지 못했습니다. [문서 직접 / 이해 못함 / 원인: 언어]
- explained_without_doc: 문서는 보지 못했고, 기관이나 다른 사람의 설명으로만 알게 되었습니다. [문서 X / 설명만]
- memory_only_no_doc_now: 문서를 받았지만 지금은 가지고 있지 않아, 기억나는 내용만 알고 있습니다. [문서 있었음 / 지금 없음 / 기억만]
- path_unclear: 문서를 봤는지, 누구에게 들었는지 확인 경로가 분명하지 않습니다. [경로 불명]

### case06_sourceChannel
Q: 이 내용은 누구를 통해 전달받으셨나요?
- gov_document_direct: 교통국 등 정부기관이 보낸 문서나 공식 안내를 제가 직접 받았습니다. [기관 → 본인 / 서면]
- gov_contact_direct: 정부기관 담당자에게 전화·문자·방문으로 직접 안내받았습니다. [기관 → 본인 / 연락]
- via_agent_or_company: 회사나 대행사, 중개인이 기관 내용을 대신 전달해 주었습니다. [대리 전달]
- via_acquaintance_relay: 지인이 기관에서 들은 내용을 다시 설명해 주었습니다. [지인 전달]
- source_unknown: 어느 기관에서, 누구를 통해 나온 내용인지 알 수 없습니다. [출처 불명]

### case06_deadlineActionPair
Q: 언제까지 무엇을 하라는 안내를 받으셨나요?
- deadline_pay_by_date: 정해진 날짜까지 돈을 내라는 안내를 받았습니다. [할 일: 납부 / 날짜 있음] → 날짜 입력
- deadline_submit_by_date: 정해진 날짜까지 서류를 제출하거나 보완하라는 안내를 받았습니다. [할 일: 제출 / 날짜 있음] → 날짜 입력
- deadline_attend_by_date: 정해진 날짜에 직접 가서 설명하라는 안내를 받았습니다. [할 일: 방문 / 날짜 있음] → 날짜 입력
- action_unclear_timing: 해야 할 일은 있는 것 같지만, 무엇을 언제까지 해야 하는지 모릅니다. [할 일·기한 불명]
- no_deadline_stated: 날짜나 기한에 대한 안내는 받지 못했습니다. [기한 안내 없음]

### case06_deadlineDate (날짜 입력)
Q: 안내받은 날짜나 기한은 언제인가요?
안내(placeholder): 문서에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일까지

### case06_customerResponse
Q: 안내를 받은 뒤, 현재 어디까지 진행하셨나요?
- no_response_yet: 안내만 받았고, 아직 아무 대응도 하지 않았습니다. [대응 X]
- inquired_authority: 기관에 연락해 내용을 다시 물어봤지만, 아직 다른 조치는 하지 않았습니다. [문의 함 / 조치 X]
- prepared_or_submitted_docs: 요구받은 것으로 보이는 서류나 자료를 준비하거나 제출했습니다. [서류 준비·제출]
- paid_or_attempted_pay: 돈을 납부했거나, 납부하려고 시도했습니다. [납부·시도]
- attended_then_redemand: 직접 가서 설명했지만, 그 뒤 다시 추가 요구를 받았습니다. [방문 함 / 재요구]

## B-1. 2차: 납부

### case06_paymentNature
Q: 무엇에 대한 비용이라고 안내받으셨나요?
- violation_fine: 교통위반에 대한 벌금이나 과태료라고 안내받았습니다. [성격: 벌금]
- application_fee: 면허나 허가를 신청하면서 내야 하는 수수료라고 안내받았습니다. [성격: 수수료]
- prior_tax_or_debt: 예전에 발생한 세금이나 미납 비용이라고 안내받았습니다. [성격: 기존 미납]
- not_explained: 돈을 내라는 안내만 받았고, 무엇에 대한 비용인지는 설명받지 못했습니다. [성격 불명]

### case06_paymentAmountKnown
Q: 내야 할 금액은 어떻게 안내받으셨나요?
- exact_amount_known: 정확한 금액이 문서에 적혀 있거나, 담당자에게 분명히 들었습니다. [금액 명확] → 금액 입력
- approx_amount_known: 대략적인 금액만 들었고, 정확한 금액은 모릅니다. [대략]
- conflicting_amounts: 안내받을 때마다 금액이 달라, 어느 금액이 맞는지 모르겠습니다. [금액 상충]
- amount_not_given: 돈을 내라는 말은 들었지만, 금액은 아직 안내받지 못했습니다. [금액 미안내]

### case06_paymentAmountText (금액 입력)
Q: 안내받은 금액을 입력해 주세요.
안내(placeholder): 문서나 문자에 적힌 금액과 단위를 그대로 입력해 주세요. 예) 800,000동

### case06_paymentSituationMatch
Q: 그 금액과 이유는 실제 상황과 맞나요?
- match: 실제 있었던 일과 맞고, 내야 하는 돈이라고 생각합니다. [사실 일치 / 의무 인정]
- amount_or_reason_mismatch: 그런 일은 있었지만, 금액이나 이유가 실제와 다릅니다. [사건 인정 / 금액·이유 불일치]
- insufficient_info: 안내 내용이 부족해, 실제와 맞는지 판단하기 어렵습니다. [판단 정보 부족]
- redemand_after_paid: 이미 낸 적이 있는데, 같은 일로 다시 내라는 안내를 받았습니다. [납부 이력 / 재청구]

### case06_paymentAuthorityCheck
Q: 이 납부 안내에 대해 기관에 확인한 결과는 어땠나요?
- clear_answer: 기관에 확인했고, 무엇을 얼마나 내야 하는지 분명한 답을 받았습니다. [확인 함 / 명확]
- unclear_answer: 기관에 확인했지만, 답변이 분명하지 않았습니다. [확인 함 / 불명확]
- not_checked_yet: 아직 기관에 확인해 보지 않았습니다. [미확인]
- cannot_reach: 확인하려고 했지만, 기관과 연락이 닿지 않았습니다. [시도 / 연락 불가]

### case06_paymentResponse
Q: 지금까지 이 납부에 대해 어떻게 하셨나요?
- already_paid: 안내받은 금액을 이미 납부했습니다. [납부 완료]
- preparing_payment: 납부하려고 준비하고 있지만, 아직 내지는 않았습니다. [준비 중 / 미납]
- dispute_or_recheck: 내기 전에, 금액이나 이유를 다시 확인해 달라고 요청했습니다. [미납 / 재확인 요청]
- no_action: 아직 아무것도 하지 않았습니다. [대응 X]

### case06_paymentNonPaymentNotice
Q: 기한 안에 내지 않으면 어떻게 된다고 안내받으셨나요?
- enforcement_warning: 제재를 받거나 강제로 징수될 수 있다는 안내를 받았습니다. [미납 시: 제재·징수]
- interest_surcharge_warning: 기한이 지나면 가산금이나 이자가 붙는다는 안내를 받았습니다. [미납 시: 가산금]
- no_notice: 미납 시 어떻게 되는지는 안내받지 못했습니다. [안내 없음]

## B-2. 2차: 방문·설명

### case06_attendanceSubject
Q: 무엇에 대해 가서 설명하라고 했나요?
- specific_violation: 특정 위반 행위에 대해, 직접 설명하라고 했습니다. [대상: 위반]
- submitted_docs_review: 제출한 서류나 신청 내용에 확인할 부분이 있다고 했습니다. [대상: 제출 서류]
- ongoing_investigation: 진행 중인 조사와 관련해, 추가로 확인할 것이 있다고 했습니다. [대상: 진행 중 조사]
- not_explained: 가서 설명하라는 안내만 받았고, 무엇에 대한 것인지는 설명받지 못했습니다. [대상 불명]

### case06_attendanceFactMatch
Q: 기관이 문제로 보는 내용은 실제 있었던 일과 비교하면 어떤가요?
- match: 실제 있었던 일과 거의 같습니다. [사실 일치]
- partial: 일부는 맞지만, 중요한 부분이 실제와 다릅니다. [일부 일치]
- mismatch: 실제 있었던 일과 전혀 다릅니다. [불일치]
- insufficient_info: 무엇을 문제로 보는지 몰라, 비교하기 어렵습니다. [판단 불가]

### case06_attendanceNoticeDetail
Q: 언제, 어디로, 어떻게 가라는 안내를 받으셨나요?
- date_place_method_known: 날짜·장소·방법을 모두 정확히 안내받았습니다. [일정 확정] → 입력
- approx_time_only: 대략적인 시기만 들었고, 정확한 날짜와 장소는 모릅니다. [시기만]
- method_only: 어떤 방법으로 안내받았는지만 기억나고, 내용은 기억나지 않습니다. [경로만 기억]
- no_memory: 안내받은 내용이 전혀 기억나지 않습니다. [기억 없음]

### case06_attendanceNoticeText (입력)
Q: 안내받은 날짜·장소·방법을 입력해 주세요.
안내(placeholder): 기억나는 날짜와 시간, 장소를 입력해 주세요.

### case06_attendanceResponse
Q: 지금까지 어떻게 대응하셨나요?
- attended_or_explained: 이미 직접 가서 설명했습니다. [방문 함]
- submitted_docs: 가는 대신, 관련 서류나 자료를 제출했습니다. [서류 제출]
- no_response: 아직 아무 대응도 하지 않았습니다. [대응 X]
- cannot_due_to_unknown: 어떻게 해야 하는지 몰라, 대응하지 못하고 있습니다. [방법 모름 / 정지]

### case06_attendanceAuthorityReaction
Q: 그 뒤 기관에서는 어떤 답변이 있었나요?
- no_issue_reply: 문제가 없다는 답변을 받았습니다. [종결 방향]
- more_docs_or_reattend: 추가 자료를 내거나, 다시 와서 설명하라는 요구를 받았습니다. [재요구]
- no_reply_yet: 아직 답변을 받지 못했습니다. [무응답]
- adverse_notice: 오히려 불리한 조치를 하겠다는 통보를 받았습니다. [불리한 통보]

## B-3. 2차: 서류 제출·보완

### case06_submissionRequirement
Q: 기관은 어떤 서류나 내용을 다시 내라고 했나요?
- add_missing_docs: 처음에 내지 않은 서류를 추가로 제출하라고 했습니다. [요구: 추가 서류]
- correct_existing: 이미 낸 서류의 잘못된 내용을 고쳐서 다시 내라고 했습니다. [요구: 수정]
- retranslate_or_certify: 번역을 다시 하거나, 공증·인증을 다시 받아 오라고 했습니다. [요구: 번역·공증]
- extra_explanation_evidence: 내용을 뒷받침할 설명이나 증빙을 더 내라고 했습니다. [요구: 증빙 보강]
- not_explained: 다시 내라는 안내만 받았고, 무엇을 내야 하는지는 설명받지 못했습니다. [요구 불명]

### case06_submissionReason
Q: 다시 내야 하는 이유를 기관은 어떻게 설명했나요?
- requirements_insufficient: 신청할 때 필요한 조건이 처음부터 부족했다고 설명했습니다. [사유: 요건 부족]
- doc_error_mismatch: 제출한 서류에 오류가 있거나, 서류끼리 맞지 않는다고 설명했습니다. [사유: 오류·불일치]
- policy_change_extra: 규정이 바뀌어서, 추가 서류가 필요하다고 설명했습니다. [사유: 규정 변경]
- reason_not_explained: 이유는 구체적으로 설명하지 않았습니다. [사유 불명]

### case06_submissionRelation
Q: 그 설명은 실제 상황과 비교하면 어떤가요?
- match: 맞습니다. 실제로 서류가 부족했거나 잘못된 부분이 있었습니다. [지적 인정]
- partial: 지적받은 것 중 일부만 실제 문제입니다. [일부 인정]
- mismatch: 이미 제출했거나 문제가 없던 내용이라, 실제와 다릅니다. [지적 부인]
- insufficient_info: 판단할 정보가 부족해, 맞는지 알 수 없습니다. [판단 불가]

### case06_submissionResponse
Q: 안내를 받은 뒤, 실제로 무엇을 제출하셨나요?
- submitted_all: 요구받은 서류를 모두 준비해서 제출했습니다. [전부 제출]
- submitted_partial: 일부만 준비해서 제출했고, 나머지는 아직입니다. [일부 제출]
- not_submitted_yet: 아직 아무것도 제출하지 않았습니다. [미제출]
- blocked_unknown_how: 무엇을 어떻게 제출해야 할지 몰라, 제출하지 못했습니다. [방법 모름 / 정지]

### case06_submissionAuthorityReaction
Q: 그 뒤 기관에서는 어떤 답변이 있었나요?
- no_issue_reply: 문제가 없다는 답변을 받았습니다. [종결 방향]
- more_docs_requested: 추가 서류를 내거나, 다시 보완하라는 요구를 받았습니다. [재요구]
- no_reply_yet: 아직 답변을 받지 못했습니다. [무응답]
- adverse_notice: 신청이 거절되는 등 불리한 통보를 받았습니다. [불리한 통보]

### case06_submissionEvidence
Q: 이 내용을 확인할 수 있는 자료 중 가지고 계신 것은 무엇인가요?
- has_original_or_copy: 제출한 서류의 원본이나 사본을 가지고 있습니다. [서류 사본]
- has_messages: 기관과 주고받은 문자·이메일이나 메모가 있습니다. [연락 기록]
- has_call_record: 담당자와 통화하거나 상담한 기록이 있습니다. [통화 기록]
- no_evidence: 확인할 수 있는 자료가 없습니다. [자료 없음]

## B-4. 2차: 결정된 조치

### case06_dispositionTypeCandidate
Q: 어떤 조치라고 안내받으셨나요?
- business_suspension: 일정 기간 운행이나 영업을 할 수 없는 정지 조치라고 들었습니다. [조치: 정지]
- license_or_registration_revoked: 면허나 허가·등록이 취소되는 조치라고 들었습니다. [조치: 취소]
- fine_type_disposition: 벌금을 부과하는 조치라고 들었습니다. [조치: 벌금]
- adverse_unnamed: 조치 이름은 모르지만, 불리한 결정이라는 것만 알고 있습니다. [조치명 불명]

### case06_dispositionReason
Q: 그 조치의 이유를 기관은 어떻게 설명했나요?
- specific_violation: 특정 위반 행위 때문이라고 설명했습니다. [사유: 위반]
- docs_or_requirements_gap: 서류나 조건이 부족하기 때문이라고 설명했습니다. [사유: 서류·요건]
- heard_not_understood: 이유를 설명해 주었지만, 이해하지 못했습니다. [설명 있음 / 이해 못함]
- not_explained: 이유는 설명받지 못했습니다. [사유 불명]

### case06_dispositionFactMatch
Q: 그 이유는 실제 있었던 일과 비교하면 어떤가요?
- match: 실제 있었던 일과 거의 같습니다. [사실 일치]
- partial: 일부는 맞지만, 중요한 부분이 실제와 다릅니다. [일부 일치]
- mismatch: 실제 있었던 일과 전혀 다릅니다. [불일치]
- insufficient_info: 이유를 정확히 몰라, 비교하기 어렵습니다. [판단 불가]

### case06_dispositionEffectiveDate
Q: 이 조치는 언제부터 적용된다고 안내받으셨나요?
- exact_effective_date: 적용되는 정확한 날짜를 안내받았습니다. [날짜 확정] → 입력
- approx_effective_date: 대략적인 시기만 들었고, 정확한 날짜는 모릅니다. [시기만]
- already_effective: 이미 적용이 시작되었다고 들었습니다. [이미 적용]
- not_stated: 언제부터 적용되는지는 안내받지 못했습니다. [안내 없음]

### case06_dispositionEffectiveDateText (입력)
Q: 조치가 적용되는 날짜를 입력해 주세요.
안내(placeholder): 문서에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일부터

### case06_dispositionResponse
Q: 지금까지 이 조치에 어떻게 대응하셨나요?
- appeal_or_review_requested: 결정을 다시 검토해 달라고 요청했습니다. [재검토 요청]
- submitted_requested_docs: 기관이 요구한 서류나 자료를 제출했습니다. [서류 제출]
- no_action: 아직 아무것도 하지 않았습니다. [대응 X]
- appeal_method_unknown: 다시 검토를 요청하고 싶지만, 방법을 모릅니다. [재검토 의사 / 방법 모름]

## B-5. 2차: 내용 재확인

### case06_unclearContentRecheck
Q: 문서나 안내에서 교통국이 언급한 내용은 무엇에 가장 가까웠나요?
- signal_violation: 위반이나 문제가 있다는 내용이 언급되어 있었습니다. [신호: 위반]
- signal_payment: 돈이나 금액과 관련된 내용이 언급되어 있었습니다. [신호: 납부]
- signal_submission: 서류 제출과 관련된 내용이 언급되어 있었습니다. [신호: 제출]
- signal_attendance: 직접 오거나 설명하라는 내용이 언급되어 있었습니다. [신호: 방문]
- signal_disposition: 이미 결정된 조치에 대한 내용이 언급되어 있었습니다. [신호: 조치]

### case06_unclearFactRelation
Q: 교통국이 지적한 내용은 실제 있었던 일과 어떤 관계가 있나요?
- actually_related: 실제로 있었던 일과 관련된 내용입니다. [관련 있음]
- partially_related: 일부만 실제 있었던 일과 관련이 있습니다. [일부 관련]
- unrelated: 저와는 전혀 관계없는 일입니다. [무관]
- insufficient_info: 내용을 이해하지 못해, 관계를 판단할 수 없습니다. [판단 불가]

### case06_unclearResponse
Q: 지금까지 이 일에 대해 어떻게 하셨나요?
- inquired: 기관에 연락해서, 무슨 내용인지 물어봤습니다. [문의 함]
- prepared_docs: 필요할 것 같은 서류나 자료를 준비했습니다. [서류 준비]
- no_action: 아직 아무것도 하지 않았습니다. [대응 X]
- blocked_unknown_action: 무엇을 해야 할지 몰라, 아무것도 하지 못하고 있습니다. [할 일 모름 / 정지]
