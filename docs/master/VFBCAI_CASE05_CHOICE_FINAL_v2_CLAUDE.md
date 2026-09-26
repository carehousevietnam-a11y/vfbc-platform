# CASE_05 (처분·조치 통지) 질문·선택지 최종본 v2 — Claude 작성

| 항목 | 내용 |
|------|------|
| 작성 | Claude (검토자) 직접 작성, 2026-09-26. Cursor 창이 문구를 새로 짓지 않는다 |
| 기준 | 대표 고도화 작업 지시서(2026-09-26): 쉽게 ≠ 단순하게, 행정 용어 대신 고객 경험, 선택 1개 = 실제 사건 1개, 앞 선택을 이어받는 개인화 |
| 개수 | 내용 선택지 최대 6 + 직접 입력 1 ("위에 내용이 없거나 설명이 필요합니다 → 직접 입력") |
| 대체 | v1, v1.1, v1.2 재작성안의 CASE_05 선택지 문구는 이 파일로 대체 |
| 구현 원칙 | 아래 "화면 문구"를 글자 그대로 사용. slug는 기존 코드 slug 유지(표시 ★는 구조 변경) |

---

## A. 1차 (공통)

### A1. case05_dispositionType
질문: 기관에서 받은 통지나 안내는 어떤 내용이었나요?

| slug | 화면 문구 |
|------|-----------|
| application_denied | 신청하거나 요청한 것이 받아들여지지 않았다는 통지를 받았습니다. |
| rights_ended | 가지고 있던 허가·자격·등록(면허 포함)이 중단되거나 취소된다는 통지를 받았습니다. |
| business_suspended | 정해진 기간 동안 영업이나 특정 활동을 하지 말라는 통지를 받았습니다. |
| situation_mismatch | 통지를 받았는데, 적힌 내용이 제가 실제로 겪은 일과 다릅니다. |
| disposition_unclear | 통지를 받았지만, 어떤 조치인지·무엇을 하라는 것인지 알아보기 어렵습니다. |

### A2. case05_confirmGoal
질문: 이 일에서 지금 가장 먼저 알고 싶은 것은 무엇인가요?

| slug | 화면 문구 |
|------|-----------|
| understand_reason | 왜 이런 통지를 받았는지부터 알고 싶습니다. |
| understand_impact | 앞으로 무엇을 할 수 없게 되는지, 제 일이나 생활에 어떤 영향이 있는지 알고 싶습니다. |
| appeal_possibility | 이 결정을 다시 봐 달라고 요청할 수 있는지, 언제까지 해야 하는지 알고 싶습니다. |
| what_to_do | 지금 당장 무엇을 해야 하는지(서류 제출·납부·방문 등) 알고 싶습니다. |
| unsure | 무엇부터 알아봐야 할지 모르겠습니다. |

### A3. case05_customerResponse
질문: 통지를 받은 뒤, 지금까지 기관에 무엇을 해 보셨나요?

| slug | 화면 문구 |
|------|-----------|
| none | 아직 기관에 연락하거나, 서류를 내거나, 다시 봐 달라고 요청하지 않았습니다. |
| inquired | 기관에 전화하거나 찾아가서 물어봤지만, 서류나 요청서를 내지는 않았습니다. |
| explanation_submitted | 제 사정이나 입장을 글로 써서 냈거나, 직접 가서 말로 설명했습니다. |
| documents_submitted | 기관이 달라고 한 서류나 증빙을 냈습니다. |
| appeal_requested | 이 결정을 다시 봐 달라고 정식으로 요청했습니다(이의 신청 등). |

### A4. case05_deadline
질문: 이 일과 관련해 언제까지 무엇을 해야 하는지 알고 계신가요?

| slug | 화면 문구 |
|------|-----------|
| specific_date | 통지나 안내에 적힌 날짜를 확인했습니다. (다음 화면에서 날짜를 적어 주세요) |
| period_stated | "통지받은 날부터 며칠 이내"처럼 기간만 적혀 있어서, 정확한 날짜는 계산하지 못했습니다. |
| uncertain | 기한이 있다는 말은 들었지만, 날짜는 모릅니다. |
| not_stated | 통지를 읽어 봤지만, 기한에 대한 내용을 찾지 못했습니다. |
| unsure | 통지를 아직 자세히 읽지 못해서, 기한이 있는지 모르겠습니다. |

### A5. case05_deadlineDate (A4 = specific_date 일 때, 텍스트)
질문: 확인한 날짜를 적어 주세요.
안내: 통지에 적힌 그대로 적어 주세요. 예) 2026년 10월 15일까지

---

## B. 2차 (개인화 — 앞 선택을 이어받음)

### B1. case05_factRelationship
질문: 통지에 적힌 내용과 실제로 있었던 일을 비교하면 어떤가요?

| slug | 화면 문구 |
|------|-----------|
| match | 통지에 적힌 내용이 실제로 있었던 일과 거의 같습니다. |
| partial | 대부분은 맞지만, 날짜·장소·금액 같은 일부 내용이 실제와 다릅니다. |
| mismatch | 통지에 적힌 일 자체가 실제로 있었던 일과 크게 다릅니다. |
| hard_to_judge | 기록이 없거나 오래돼서, 실제로 어땠는지 비교하기 어렵습니다. |
| unknown | 통지에 무슨 내용이 적혀 있는지부터 이해하기 어렵습니다. |

### B2. case05_factDetail (B1 = partial 또는 mismatch 일 때만)
질문: 실제와 다른 부분은 어떤 것인가요?

| slug | 화면 문구 |
|------|-----------|
| date_place_certain | 날짜·장소·상황이 실제와 다르다는 것을 분명히 기억합니다. |
| date_place_fuzzy | 날짜·장소가 다른 것 같지만, 정확히 기억나지 않습니다. |
| content_differs_clear | 제가 한 일이나 이유가 다르게 적혀 있고, 무엇이 다른지 설명할 수 있습니다. |
| content_differs_vague | 내용이 다른 것 같지만, 무엇이 다른지 아직 정리하지 못했습니다. |

### B3. case05_dispositionReason
질문: 통지에는 왜 이런 조치를 한다고 적혀 있었나요?

| slug | 화면 문구 |
|------|-----------|
| violation_claimed | 제가 어떤 규정을 어겼다고 적혀 있습니다. |
| document_issue | 제가 낸 서류나 신청 내용이 틀렸거나 빠졌다고 적혀 있습니다. |
| requirement_not_met | 조건이나 자격이 맞지 않는다고 적혀 있습니다. |
| deadline_procedure | 정해진 기한이나 절차를 지키지 않았다고 적혀 있습니다. |
| no_clear_reason | 이유가 없거나, "규정에 따라"처럼 짧게만 적혀 있습니다. |
| unsure | 이유가 적혀 있는 것 같지만, 무슨 뜻인지 이해하지 못했습니다. |

### B4. case05_dispositionDetail
질문: 이 조치 때문에 실제로 무엇이 달라지는지 알고 계신가요?

| slug | 화면 문구 |
|------|-----------|
| wording_unclear | 무엇을 하면 안 되는지, 통지 문구가 애매해서 알기 어렵습니다. |
| scope_unclear | 하면 안 되는 일은 알겠지만, 언제까지·어디까지인지 모르겠습니다. |
| partially_understood | 일부는 알겠지만, 제 일이나 생활에 어떤 영향이 더 있을지 확실하지 않습니다. |
| unsure | 이 조치로 무엇이 달라지는지 아직 모르겠습니다. |

### B5. case05_explanationDetail (A3 = explanation_submitted 일 때만)
질문: 어떤 방법으로 설명하셨고, 기관에서 받았다는 확인을 받으셨나요?

| slug | 화면 문구 |
|------|-----------|
| written_no_receipt | 글로 써서 냈지만, 잘 받았다는 확인이나 번호는 아직 받지 못했습니다. |
| written_receipt_ok | 글로 써서 냈고, 잘 받았다는 확인(접수번호 등)을 받았습니다. |
| verbal_no_record | 전화나 방문으로 말로만 설명했고, 남겨 둔 기록은 없습니다. |
| verbal_with_record | 전화나 방문으로 설명했고, 무엇을 말했는지 메모해 두었습니다. |
| both_unverified | 글로도 내고 말로도 설명했는데, 두 내용이 같은지는 확인하지 못했습니다. |
| both_aligned | 글로도 내고 말로도 설명했고, 같은 내용으로 설명했습니다. |

### B6. case05_submittedDocsDetail (A3 = documents_submitted 일 때만, 목록형·여러 개 선택)
질문: 기관에 낸 서류는 어떤 것인가요? 해당하는 것을 모두 골라 주세요.

| slug | 화면 문구 |
|------|-----------|
| identity | 여권·신분증 등 신분 서류 |
| financial | 통장·영수증 등 돈과 관련된 서류 |
| certificate | 기관이나 회사가 발급한 증명서·확인서 |
| unsure | 무슨 서류였는지 정확히 모르겠습니다 |

### B7. case05_appealDetail (A3 = appeal_requested 일 때만) ★구조
질문: 다시 봐 달라는 요청은 지금 어디까지 진행되었나요?

| slug | 화면 문구 |
|------|-----------|
| filed_no_receipt | 요청서를 냈지만, 잘 받았다는 확인은 아직 받지 못했습니다. |
| filed_no_schedule | 요청서를 냈고 받았다는 확인도 받았지만, 결과가 언제 나오는지는 모릅니다. |
| filed_schedule_known | 요청서를 냈고, 결과나 다음 연락이 언제 오는지 안내받았습니다. |
| preparing_deadline_unknown | 요청하려고 준비 중인데, 언제까지 내야 하는지 모릅니다. |
| preparing_deadline_known | 요청하려고 준비 중이고, 언제까지 내야 하는지 알고 있습니다. |
| considering | 요청할지 아직 고민하고 있습니다. |

★ considering_rules_unread, considering_rules_read → considering 으로 합침 (옛 답은 considering 으로 복원)

### B8. case05_authorityFollowUp (A3 ≠ none 일 때만) ★구조
질문: 기관에 연락하거나 서류를 낸 뒤, 기관에서는 어떻게 답했나요?

| slug | 화면 문구 |
|------|-----------|
| maintained | 처음 결정은 그대로라는 답을 받았습니다. |
| changed | 결정이 바뀌었거나 취소되었다는 답을 받았습니다. |
| wants_more | 서류를 더 내라고 하거나, 직접 와서 설명하라고 했습니다. |
| under_review | 다시 검토하고 있으니 기다리라고 했습니다. |
| no_response | 아직 아무 답도 받지 못했습니다. |
| unsure | 답은 받았는데, 무슨 뜻인지 잘 모르겠습니다. |

★ 옛 slug 대응: modified·revoked → changed / more_docs·attendance_explanation → wants_more / payment_demand → 직접 입력 원문 표시(판단 문장 없음)
★ case05_dispositionOutcome, case05_repeatFollowUp 질문은 화면에서 제거 (B8과 같은 사실을 반복해서 묻던 질문). 저장된 옛 답은 복원만 하고 새로 묻지 않음
★ case05_plannedNextStep 질문 화면에서 제거 (앞으로의 계획을 묻는 의향 질문)

### B9. case05_blockage ★구조
질문: 지금 이 일을 진행하지 못하고 있다면, 가장 큰 이유는 무엇인가요?

| slug | 화면 문구 |
|------|-----------|
| why_disposition | 왜 이런 조치를 받았는지 이해가 안 돼서, 무엇을 해야 할지 판단하지 못하고 있습니다. |
| what_disposition | 이 조치가 정확히 무엇인지 몰라서, 어디서부터 시작해야 할지 모르겠습니다. |
| fact_match | 통지 내용이 실제와 맞는지 확인할 방법이 없어서 막혀 있습니다. |
| what_to_do | 무엇을 해야 하는지, 다시 봐 달라고 하려면 어떻게 해야 하는지 몰라서 진행하지 못하고 있습니다. |
| evidence | 어떤 서류나 증빙을 준비해야 하는지 몰라서 막혀 있습니다. |
| next_response | 기관의 답을 기다리고 있거나, 받은 답을 이해하지 못해서 멈춰 있습니다. |

★ 옛 slug 대응: appeal_method → what_to_do / deadline → 직접 입력 원문 표시(기한은 A4가 묻는 사실) / unsure → 직접 입력 원문 표시

### B10. case05_evidence (목록형·여러 개 선택) ★구조
질문: 지금 가지고 있는 자료를 모두 골라 주세요.

| slug | 화면 문구 |
|------|-----------|
| disposition_notice | 기관에서 받은 통지서나 안내문 |
| message_email | 기관과 주고받은 문자·이메일·메신저 |
| submitted_docs | 제가 기관에 낸 서류의 사본 |
| payment_proof | 돈을 낸 영수증이나 이체 기록 |
| photo_video | 당시 상황을 보여주는 사진·영상 |
| none | 가지고 있는 자료가 없습니다 (다른 항목과 함께 고를 수 없음) |

★ 옛 slug 대응: contract, unsure → 직접 입력 원문 표시

### B11. case05_finalGoal (A2와 같은 목표는 제외하고 표시 — 기존 중복 제외 규칙 유지) ★구조
질문: 지금까지 답해 주신 내용에서, 이번 검토로 가장 먼저 해결하고 싶은 것은 무엇인가요?

| slug | 화면 문구 |
|------|-----------|
| why_disposition | 왜 이런 조치를 받았는지 정확히 알고 싶습니다. |
| what_disposition | 이 조치로 무엇이 달라지는지 정확히 알고 싶습니다. |
| fact_match | 통지 내용이 실제와 맞는지 확인하고 싶습니다. |
| what_to_do | 지금 해야 할 일을 순서대로 알고 싶습니다. |
| next_action | 다시 봐 달라고 요청하거나 설명하는 다음 단계를 알고 싶습니다. |
| evidence | 준비해야 할 서류나 증빙을 알고 싶습니다. |

★ 옛 slug 대응: expert, unsure → 직접 입력 원문 표시 (전문가 연결은 결과 화면 버튼이 담당)

---

## C. 구현 체크 (1번창)
1. 위 "화면 문구"와 코드 label이 글자 단위로 같은지 비교하는 테스트 추가 (이 파일을 읽어서 비교)
2. ★ 구조 변경: 옛 slug 대응을 한 곳에 두고, 저장된 옛 답 복원·판단 문장·결과 연결이 새 slug로 이어지게. "직접 입력 원문 표시"는 판단 문장에 쓰지 않고 응답 요약에 옛 선택지 문구 그대로
3. 새 slug(changed, wants_more, considering)에 판단 문장과 방향 태그 추가
4. 선택지 개수 ≤ 6 검사 (테스트 D 기준을 6으로)
5. 제거한 질문 3개(dispositionOutcome, repeatFollowUp, plannedNextStep)가 어떤 경로에서도 화면에 나오지 않는지 확인
