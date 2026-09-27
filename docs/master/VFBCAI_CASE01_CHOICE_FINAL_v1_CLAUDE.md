# CASE_01 (교통위반 통지) 질문·선택지 최종본 v1 — Claude 작성

기준: VFBCAI_QUESTION_CHOICE_RULE_LOCK_FINAL.md + 대표 지시(2026-09-27): 선택지 최대 5개 + 직접 입력, 대표 실제 상황, 한 선택 = 여러 사건 정보, 조건 관계는 "A인지, 그렇다면 B인지"로 표현, 정제된 문장.
- 방법: 기존 선택지(새 문장 + 옛 문장이 섞여 8~9개)를 실제 상황별로 분해 → 대표 5개로 재구성. 같은 상황의 옛 slug는 대표 slug로 연결(§C).
- 대표 slug는 기존 판단 로직이 쓰는 값을 우선 선택(분류·라우팅 변경 없음).
- [ ] 안은 선택으로 얻는 사실(화면 표시 X). 목록형(여러 개 선택)은 짧은 이름 허용.

## A. 1차 공통

### case01_violationContent
Q: 교통국은 무엇이 문제라고 안내했나요?
- traffic: 특정 날짜와 장소에서 교통위반이 있었다는 안내를 받았고, 그 날짜와 장소가 적혀 있습니다. [대상: 특정 일시·장소 사건 / 기재 있음]
- other_stated: 신호·속도·주차 등 제가 운전하면서 한 특정 행동이 위반이라는 안내를 받았습니다. [대상: 운전 행동]
- administrative: 면허·차량 등록·차량 검사와 관련해 문제가 있다는 안내를 받았습니다. [대상: 면허·차량 등록]
- labor_tax: 제가 제출한 서류나 신고 내용에 문제가 있다는 안내를 받았습니다. [대상: 제출 서류·신고]
- explanation_unknown: 위반 통지는 받았지만, 무엇이 문제인지는 설명받지 못했습니다. [통지 받음 / 내용 모름]

### case01_factRelationship
Q: 교통국이 안내한 내용은 실제 있었던 일과 비교하면 어떤가요?
- match: 교통국이 안내한 내용이 실제 있었던 일과 거의 같습니다. [사실 일치]
- date_place_wrong: 비슷한 일은 있었지만, 날짜·시간·장소가 실제와 다릅니다. [사건 존재 / 일시·장소 불일치]
- deny_action: 안내받은 위반 행동을 저는 하지 않았고, 그 시간에는 다른 일을 하고 있었습니다. [행동 부인 / 다른 행적]
- partial_situation: 일부는 맞지만, 누가·무엇을 했는지 등 핵심 내용이 다르게 적혀 있습니다. [일부 일치 / 핵심 불일치]
- cannot_compare_yet: 안내는 받았지만, 지금은 실제와 같은지 다른지 비교하기 어렵습니다. [비교 불가 → 다음 질문에서 이유]

### case01_factCompareGap (factRelationship = cannot_compare_yet)
Q: 지금 실제와 비교하기 어려운 가장 큰 이유는 무엇인가요?
- gap_notice_incomplete: 통지서에 날짜·장소·행동 등 핵심 내용이 적혀 있지 않아, 무엇과 비교해야 할지 모릅니다. [통지 내용 부족]
- gap_memory_timeline: 문제가 된 일은 대략 알지만, 그때의 날짜와 장소가 정확히 기억나지 않습니다. [사건 인지 / 기억 흐림]
- gap_hearsay_channel: 교통국에서 직접 받지 않고, 지인이나 대행사를 통해서만 내용을 전해 들었습니다. [간접 전달 / 원문 없음]
- gap_records_not_found: 비교하려면 제 기록이 필요하지만, 제출 영수증이나 등록 내역을 아직 찾지 못했습니다. [기록 필요 / 미확보]
- gap_language_access: 통지는 받았지만, 베트남어라서 무엇이 문제라고 하는지 이해하지 못했습니다. [통지 받음 / 언어 장벽]

### case01_customerResponded
Q: 통지를 받은 뒤, 교통국에 연락하거나 대응한 적이 있나요?
- no_contact_yet: 통지만 받았고, 아직 교통국에 연락하거나 방문하지 않았습니다. [연락 X / 방문 X]
- has_responded: 교통국에 연락하거나 방문해, 상황을 설명하거나 서류를 제출한 적이 있습니다. [대응 함 → 다음 질문에서 상세]

### case01_deadline
Q: 대응해야 하는 기한은 어떻게 안내받으셨나요?
- deadline_day_known: 통지서나 문자에 적힌 정확한 날짜를 확인했습니다. [날짜 확정] → 날짜 입력
- deadline_window_only: '며칠 이내'처럼 기간만 안내받았고, 정확한 날짜는 받지 못했습니다. [기한 있음 / 기간만]
- asap: 날짜 없이, 가능한 한 빨리 대응하라는 안내만 받았습니다. [긴급 / 날짜 없음]
- no_stated: 기한에 대해서는 별도의 안내를 받지 못했습니다. [기한 안내 없음]
- unknown: 통지서가 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다. [언어 장벽 / 기한 미확인]

### case01_deadlineDate (날짜 입력)
Q: 안내받은 대응 기한은 언제인가요?
안내(placeholder): 통지서에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일까지

### case01_confirmGoal
Q: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- fit_and_facts: 이 통지가 제 상황에 해당하는지, 해당한다면 적힌 날짜와 행동이 사실과 맞는지 확인하고 싶습니다. [목표: 해당 여부 → 사실 대조]
- why_and_basis: 왜 이런 통지를 받았는지, 교통국이 어떤 기록을 근거로 판단했는지 확인하고 싶습니다. [목표: 이유·근거]
- what_to_do_now: 지금 해야 할 일이 있는지, 있다면 언제까지 어떻게 해야 하는지 확인하고 싶습니다. [목표: 할 일 → 기한·방법]
- after_my_response: 이미 대응한 결과가 어떻게 되었는지, 다음에 어떤 절차가 이어지는지 확인하고 싶습니다. [대응 함 / 목표: 결과·다음 절차]
- unsure: 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다. [복합 상황 / 목표: 순서]

## B. 2차 개인화

### case01_authorityDemand
Q: 교통국은 이 통지와 함께 구체적으로 무엇을 하라고 안내했나요?
- payment: 위반에 대한 벌금이나 비용을 납부하라는 안내를 받았습니다. [요구: 납부 → 다음 질문에서 성격]
- attendance: 교통국에 직접 방문하거나, 상황을 설명하라는 안내를 받았습니다. [요구: 방문·설명]
- supplement: 추가 서류를 제출하거나, 이미 낸 서류를 다시 제출하라는 안내를 받았습니다. [요구: 서류 제출 → 다음 질문에서 성격]
- correct_record: 등록 정보나 기존 기록이 맞는지 확인하고, 틀리면 수정하라는 안내를 받았습니다. [요구: 기록 확인·수정]
- demand_unclear: 통지는 받았지만, 구체적으로 무엇을 하라는지 안내받지 못했거나 이해하지 못했습니다. [요구 불명]

### case01_paymentDemandScope (authorityDemand = payment)
Q: 이번 납부 안내는 어떤 성격인가요?
- core_case: 이번 위반에 대한 벌금이고, 이번 일에서 가장 중요한 요구입니다. [핵심 요구: 벌금]
- included_with_other: 다른 안내와 함께 여러 금액이 적혀 있어, 어느 금액이 이번 일인지 분명하지 않습니다. [복합 안내 / 금액 불명확]
- additional_guidance: 중요한 요구는 따로 있고, 납부는 추가로 안내받은 내용입니다. [부가 요구]
- unsure: 납부 안내는 받았지만, 어떤 성격의 금액인지 이해하지 못했습니다. [성격 모름]

### case01_supplementDemandScope (authorityDemand = supplement)
Q: 이번 서류 제출 안내는 어떤 성격인가요?
- core_case: 서류를 다시 제출하는 것이 이번 일에서 가장 중요한 요구입니다. [핵심 요구: 서류]
- included_with_notice: 위반 통지 안에 서류 제출 요구가 함께 적혀 있습니다. [통지 포함]
- additional_guidance: 중요한 요구는 따로 있고, 서류 제출은 추가로 안내받은 내용입니다. [부가 요구]
- unsure: 서류 제출 안내는 받았지만, 왜 필요한지 이해하지 못했습니다. [이유 모름]

### case01_actualSituation
Q: 교통국의 안내와 별개로, 실제로는 어떤 일이 있었나요?
- accept_facts: 안내받은 행동이 실제로 있었고, 그 사실은 인정합니다. [사실 인정]
- partial_similar: 비슷한 일은 있었지만, 위반이 될 만한 중요한 부분은 다릅니다. [유사 사건 / 핵심 차이]
- deny: 안내받은 행동은 실제로 없었고, 당시 상황을 설명할 수 있습니다. [부인 / 설명 가능]
- partial: 일부는 맞지만, 전체 상황은 안내받은 내용과 다릅니다. [일부 인정]
- unsure: 시간이 오래 지났거나 기록이 없어, 당시 상황을 정확히 설명하기 어렵습니다. [설명 곤란]

### case01_responseDetail (customerResponded = has_responded)
Q: 교통국에 대응할 때 실제로 무엇을 하셨나요?
- explained_situation: 교통국에 방문하거나 연락해, 당시 상황을 직접 설명했습니다. [구두 설명]
- submitted_materials: 관련 서류나 자료를 준비해 교통국에 제출했습니다. [서류 제출]
- disputed_facts: 안내받은 내용이 사실과 다르다고 교통국에 분명히 말했습니다. [사실 다툼]
- fulfilled_demand: 안내받은 대로 벌금 납부나 서류 제출 등 요구를 처리했습니다. [요구 이행]

### case01_authorityResponse
Q: 대응한 뒤, 교통국에서는 어떤 답변이 있었나요?
- completed: 추가로 할 일은 없고, 처리가 끝났다는 안내를 받았습니다. [종결]
- more_required: 추가 서류나 자료를 제출하라는 안내를 받았습니다. [재요구: 서류]
- re_attendance: 다시 방문하거나, 추가로 설명하라는 안내를 받았습니다. [재요구: 방문·설명]
- payment_demand: 벌금이나 비용을 납부하라는 안내를 받았습니다. [요구: 납부]
- no_reply_yet: 아직 답변을 받지 못했거나, 받은 답변의 의미를 이해하지 못했습니다. [기관 반응 불명]

### case01_authorityDemandDetail
Q: 지금까지 받은 안내를 전체적으로 얼마나 이해하고 계신가요?
- clear_guidance: 무엇을 해야 하는지 분명하게 안내받았고, 그대로 진행할 수 있습니다. [이해 / 진행 가능]
- partial_guidance: 대략적인 내용은 알지만, 세부 방법이나 기한은 분명하지 않습니다. [부분 이해]
- understanding_unknown: 설명은 들었지만, 무엇을 해야 하는지 이해하지 못했습니다. [이해 못함]

### case01_evidence (목록형, 여러 개)
Q: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- notice: 교통국에서 받은 통지서나 안내문
- message: 교통국과 주고받은 문자·메시지·이메일
- submitted_docs: 제출·납부 영수증이나 접수 증빙
- photo_video: 당시 상황을 보여 주는 사진·영상(블랙박스 포함)
- none: 보관 중인 자료가 없습니다. [자료 없음 / 단독 선택]

### case01_blockage
Q: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- content_unclear: 받은 안내를 이해하지 못해, 제 상황에 해당하는지 판단하지 못하고 있습니다. [막힘: 이해 / 상태: 판단 보류]
- how_respond: 안내는 이해했지만, 어떻게 대응해야 할지 몰라 시작하지 못하고 있습니다. [막힘: 대응 방법 / 상태: 미착수]
- next_step: 이미 문의하거나 제출했지만, 다음에 무엇을 해야 할지 몰라 기다리고만 있습니다. [대응 함 / 막힘: 다음 절차 / 상태: 대기]
- facts_why: 무엇을 어떤 순서로 설명해야 할지 정리되지 않아, 대응을 미루고 있습니다. [막힘: 설명 정리 / 상태: 보류]
- evidence: 필요한 자료를 무엇으로 준비해야 할지 몰라, 준비가 멈춰 있습니다. [막힘: 자료 / 상태: 정지]

### case01_finalGoal
Q: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- situation_fit: 통지가 제 상황에 맞는지 확인하고, 맞지 않다면 바로잡고 싶습니다. [목표: 해당성 → 정정 의사]
- why_notice: 통지를 받은 이유를 정확히 알고, 같은 일이 다시 생기지 않게 하고 싶습니다. [목표: 이유 / 재발 방지]
- what_deadline: 해야 할 일과 기한을 확인해, 기한 안에 처리를 마치고 싶습니다. [목표: 기한 내 처리]
- followup: 이미 대응한 결과를 확인하고, 이 일을 마무리하고 싶습니다. [대응 함 / 목표: 종결]
- expert: 제 상황을 전문가에게 정확히 전달해, 대응을 맡기고 싶습니다. [목표: 전문가 위임]

## B-2. 2차 세부 확인(facet)

### case01_factConflictFacet
Q: 교통국이 안내한 내용과 실제가 가장 크게 다른 점은 무엇인가요?
- conflict_time: 교통국이 말한 날짜·시간이, 제가 기억하는 그날의 일정과 다릅니다. [불일치: 일시]
- conflict_place: 교통국이 말한 장소가, 그 시간에 제가 있었던 곳과 다릅니다. [불일치: 장소]
- conflict_violation_action: 그 자리에 있었던 것은 맞지만, 위반이라고 한 행동은 하지 않았습니다. [일시·장소 인정 / 행동 부인]
- conflict_vehicle_driver: 통지에 적힌 차량이 제 차가 아니거나, 그때 운전한 사람이 제가 아닙니다. [불일치: 차량·운전자]

### case01_spatiotemporalFacet
Q: 그 날짜와 장소에서 실제로 무엇을 했는지, 지금 어떻게 확인할 수 있나요?
- st_has_records: 사진·영수증·위치 기록 등 자료가 있고, 지금 바로 보여 줄 수 있습니다. [자료 있음 / 즉시 제시]
- st_has_records_pending: 자료가 있을 것 같지만, 아직 찾거나 모아 두지 못했습니다. [자료 있음 / 미확보]
- st_witness_only: 자료는 없지만, 당시 함께 있던 사람이 확인해 줄 수 있습니다. [자료 X / 증인 있음]
- st_memory_only: 자료나 증인은 없고, 제 기억으로만 설명할 수 있습니다. [기억만]
- st_cannot_verify: 찾아봤지만, 당시를 확인할 방법이 없습니다. [확인 불가]

### case01_compareRecordGap (목록형, 여러 개)
Q: 통지 내용과 비교하려면, 지금 없는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- cmp_missing_notice: 통지서나 안내문 사본
- cmp_missing_calendar: 그날의 일정이나 이동 기록
- cmp_missing_receipt: 제출·접수 영수증
- cmp_missing_messages: 교통국과 주고받은 연락 기록

### case01_languageAccessFact
Q: 통지 내용을 이해하는 과정은 어땠나요?
- lang_none: 통지 내용을 직접 읽고 이해했습니다. [직접 이해]
- lang_partial_understanding: 일부만 이해했지만, 원문을 가지고 있어 다시 확인할 수 있습니다. [부분 이해 / 원문 있음]
- lang_partial_no_source: 일부만 이해했고, 다시 확인할 원문도 가지고 있지 않습니다. [부분 이해 / 원문 없음]
- lang_need_interpreter: 베트남어라서 이해하지 못했고, 통역이 필요합니다. [이해 못함 / 통역 필요]
- lang_indirect_hearsay: 지인이나 대행사를 통해서만 전해 들었고, 교통국 통지를 직접 보지 못했습니다. [간접 전달 / 원문 미확인]

### case01_unclearDemandFact
Q: 교통국 안내에서 가장 분명하지 않은 부분은 무엇인가요?
- unclear_what_violation: 무엇을 위반했다는 것인지 분명하지 않습니다. [불명: 위반 내용]
- unclear_what_action: 위반 내용은 알지만, 지금 무엇을 해야 하는지 분명하지 않습니다. [위반 앎 / 불명: 할 일]
- unclear_deadline: 해야 할 일은 알지만, 언제까지 해야 하는지 분명하지 않습니다. [할 일 앎 / 불명: 기한]
- unclear_who_authority: 어느 기관이나 부서에 연락해야 하는지 분명하지 않습니다. [불명: 담당 기관]

### case01_noticeDeliveryFact
Q: 교통국 안내는 처음에 어떤 방법으로 받으셨나요?
- del_in_person: 단속 현장이나 교통국 창구에서 직접 안내를 받았습니다. [대면]
- del_phone_message: 전화나 문자·앱 알림으로 안내를 받았습니다. [전화·전자]
- del_written: 우편이나 직접 전달된 통지서 등 서면으로 받았습니다. [서면]
- del_not_received_yet: 아직 통지를 직접 받지 못했고, 다른 경로로 알게 되었습니다. [미수령 / 간접 인지]

### case01_procedureStageFact
Q: 이번 안내는 처음 받은 것인가요, 이전에도 받은 적이 있나요?
- stage_first_notice: 이번이 처음 받은 안내이고, 이전에 관련 연락은 없었습니다. [첫 통지]
- stage_followup_notice: 이전에도 같은 일로 안내를 받았고, 이번은 추가로 받은 안내입니다. [재통지]
- stage_unsure_first: 처음인지 확실하지 않지만, 다른 안내를 받은 기억은 없습니다. [단계 불명 / 이전 기억 없음]
- stage_unsure_many: 여러 번 안내를 받았지만, 지금이 어느 단계인지 모르겠습니다. [복수 통지 / 단계 불명]

### case01_officeIdentityFact
Q: 안내를 보낸 기관이나 부서는 어떻게 확인하고 있나요?
- office_named_clear: 기관과 부서 이름이 통지에 적혀 있어, 어디서 보냈는지 확실히 압니다. [기관 확인]
- office_name_only: 기관 이름은 알지만, 담당 부서나 연락처는 확인하지 못했습니다. [기관명만]
- office_unknown: 어느 기관에서 보낸 것인지 확인하지 못했습니다. [기관 불명]
- office_wrong_suspect: 교통국이 아닌 다른 기관의 안내일 수도 있다고 생각합니다. [기관 의심]

### case01_paymentInstructionFact
Q: 납부 안내는 어떤 금액이었나요?
- pay_type_fine: 교통위반에 대한 벌금을 내라는 안내였습니다. [벌금]
- pay_type_fee: 벌금이 아니라, 처리 수수료나 비용을 내라는 안내였습니다. [수수료]
- pay_type_mixed: 벌금과 수수료 등 여러 금액이 함께 적혀 있었습니다. [복합]
- pay_type_unclear: 금액은 적혀 있지만, 어떤 성격의 돈인지 이해하지 못했습니다. [성격 모름]

### case01_attendInstructionFact
Q: 방문·설명 안내에는 무엇이 적혀 있었나요?
- att_date_place_stated: 방문 날짜·시간·장소가 모두 적혀 있었습니다. [일정·장소 확정]
- att_date_place_partial: 날짜와 시간은 적혀 있지만, 장소는 확인하지 못했습니다. [일정 있음 / 장소 미확인]
- att_window_only: 정확한 날짜 없이 '며칠 이내'처럼 기간만 적혀 있었습니다. [기간만]
- att_place_unknown: 방문하라는 안내만 있고, 날짜와 장소는 적혀 있지 않았습니다. [일정·장소 없음]
- att_content_unclear: 일정은 알지만, 왜 방문해서 설명해야 하는지 이해하지 못했습니다. [일정 앎 / 이유 모름]

### case01_supplementInstructionFact
Q: 서류 제출 안내의 핵심은 무엇이었나요?
- sup_missing_docs_list: 추가로 낼 서류 목록을 받았고, 무엇을 준비할지 알고 있습니다. [목록 있음 / 준비 가능]
- sup_missing_docs_unclear: 서류 목록은 받았지만, 제 경우에 맞는지 확실하지 않습니다. [목록 있음 / 해당 불명]
- sup_replace_docs: 이미 낸 서류를 고치거나 바꿔서 다시 제출하라는 안내였습니다. [재제출]
- sup_content_add: 서류에 내용을 더 적거나, 설명을 추가하라는 안내였습니다. [내용 보강]
- sup_scope_unclear: 서류를 내라는 것은 알지만, 무엇을 내야 하는지 전체를 모르겠습니다. [범위 모름]

### case01_correctTargetFact
Q: 수정하라고 한 것은 어떤 정보인가요?
- tgt_identity_record: 이름·여권번호 등 제 신원이나 등록 정보를 수정하라는 안내였습니다. [대상: 신원·등록]
- tgt_submission_content: 제가 제출한 서류나 신청 내용을 수정하라는 안내였습니다. [대상: 제출 내용]
- tgt_vehicle_record: 차량 등록이나 운전 관련 기록을 수정하라는 안내였습니다. [대상: 차량·운전 기록]

### case01_authorityFollowUpKind
Q: 대응한 뒤, 교통국에서는 어떤 답변이나 추가 요구가 있었나요?
- completed: 추가 요구 없이, 처리나 검토가 그대로 진행된다는 안내를 받았습니다. [종결 방향]
- more_required: 추가 서류나 자료를 제출하라는 요청을 받았습니다. [재요구: 서류]
- re_attendance: 다시 방문하거나, 추가로 설명하라는 안내를 받았습니다. [재요구: 방문·설명]
- payment_demand: 벌금이나 비용을 납부하라는 안내를 받았습니다. [요구: 납부]
- no_reply_yet: 아직 답변을 받지 못했거나, 받은 답변의 의미를 이해하지 못했습니다. [기관 반응 불명]

## C. slug 연결 (옛 값 → 대표 값, adminVerifyChoiceSlugCanonical.ts 한 곳)
- case01_violationContent: traffic_spatiotemporal_dispute → traffic, conduct_denied_or_partial → other_stated, authority_explanation_missing → explanation_unknown
- case01_factRelationship: align_minor_gap → partial_situation, deny_with_alibi → deny_action, partial_core_dispute → partial_situation, unknown → cannot_compare_yet
- case01_customerResponded: none → no_contact_yet
- case01_deadline: confirmed → deadline_day_known, uncertain → deadline_window_only, no_deadline_stated → no_stated
- case01_confirmGoal: verify_applicability·fact_difference → fit_and_facts, why_notice → why_and_basis, what_when → what_to_do_now, procedure_followup → after_my_response
- case01_authorityDemand: pay_core_traffic·pay_bundled → payment, supplement_core → supplement, attend_explain → attendance
- case01_factConflictFacet: conflict_other → 원문 표시만
- case01_spatiotemporalFacet: st_witness_only_pending → st_witness_only, st_memory_only_fuzzy → st_memory_only, st_cannot_verify_tried → st_cannot_verify
- case01_languageAccessFact: lang_indirect_hearsay_copy → lang_indirect_hearsay
- case01_correctTargetFact: tgt_other → 원문 표시만
- case01_authorityFollowUpKind: more_required_vague → more_required, reply_unclear → no_reply_yet

## D. 판단 로직 정렬 (분류·라우팅 변경 없음, 대표 slug가 옛 slug와 같은 판단을 받도록)
- "통지서 기한" 미확인·위험 목록에 deadline_window_only 추가 (옛 uncertain과 같은 처리)
- 방문 요구 + "지금 할 일" 목표 판단에 what_to_do_now 추가 (옛 what_when과 같은 처리)
