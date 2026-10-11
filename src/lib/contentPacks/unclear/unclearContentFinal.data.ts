/* Generated from docs/master/content/UNCLEAR_CONTENT_V2.md. Do not edit sentences. */
export const UNCLEAR_CONTENT_FINAL = {
  "entry": {
    "code": "A-0",
    "id": "unclear_entry",
    "route": "ENTRY",
    "phase": 0,
    "prompt": "받은 서류나 안내가 무엇을 하라는 내용 같으신가요?",
    "subtitle": "가장 가까운 것을 골라 주세요. 잘 모르겠다면 내용을 알아보는 경로로 시작합니다.",
    "choices": [
      {
        "value": "o1",
        "label": "돈을 내라는 내용 같습니다",
        "description": "입금, 납부, 수수료, 벌금 같은 표현이 있습니다.",
        "fields": {
          "unclear_actionHint": "pay",
          "unclear_routeSelectionMode": "selected"
        },
        "route": "M"
      },
      {
        "value": "o2",
        "label": "서류를 내거나 출석하라는 내용 같습니다",
        "description": "제출, 보완, 방문, 출석 같은 표현이 있습니다.",
        "fields": {
          "unclear_actionHint": "submit_or_appear",
          "unclear_routeSelectionMode": "selected"
        },
        "route": "D"
      },
      {
        "value": "o3",
        "label": "알리는 내용 같습니다",
        "description": "무엇을 하라는 말은 없고 알려 주는 내용처럼 보입니다.",
        "fields": {
          "unclear_actionHint": "notice_only",
          "unclear_routeSelectionMode": "selected"
        },
        "route": "N"
      },
      {
        "value": "o4",
        "label": "잘 모르겠습니다",
        "description": "",
        "fields": {
          "unclear_actionHint": "unsure",
          "unclear_routeSelectionMode": "unsure"
        },
        "route": "N"
      }
    ],
    "directFields": {
      "unclear_actionHint": "direct_input",
      "unclear_routeSelectionMode": "direct_input"
    },
    "directRoute": "N"
  },
  "questions": [
    {
      "code": "Q1-M",
      "id": "unclear_q1_m",
      "route": "M",
      "phase": 1,
      "prompt": "받은 서류나 안내는 어떤 형태인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "직인과 문서번호가 있는 종이 공문입니다",
          "fields": {
            "unclear_documentForm": "paper_official",
            "unclear_formGroup": "form_formal"
          }
        },
        {
          "value": "o2",
          "label": "청구서나 고지서 양식입니다",
          "fields": {
            "unclear_documentForm": "bill_form",
            "unclear_formGroup": "form_formal"
          }
        },
        {
          "value": "o3",
          "label": "이메일로 받았습니다",
          "fields": {
            "unclear_documentForm": "email_body",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o4",
          "label": "문자나 메신저로 받았습니다",
          "fields": {
            "unclear_documentForm": "chat_message",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o5",
          "label": "링크나 큐알 코드로 안내받았습니다",
          "fields": {
            "unclear_documentForm": "link_code",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o6",
          "label": "전화나 방문으로 말로만 들었습니다",
          "fields": {
            "unclear_documentForm": "verbal_only",
            "unclear_formGroup": "form_oral"
          }
        }
      ],
      "directFields": {
        "unclear_documentForm": "direct_input",
        "unclear_formGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q2-M",
      "id": "unclear_q2_m",
      "route": "M",
      "phase": 1,
      "prompt": "서류에 보낸 곳으로 적힌 곳은 어디인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "세무기관(세무서·세무총국)입니다",
          "fields": {
            "unclear_senderClaim": "tax_authority",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o2",
          "label": "공안·경찰·검찰·법원입니다",
          "fields": {
            "unclear_senderClaim": "police_court",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o3",
          "label": "구·시·성 등 지방 행정기관입니다",
          "fields": {
            "unclear_senderClaim": "local_admin",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o4",
          "label": "출입국·노동 등 외국인 관련 기관입니다",
          "fields": {
            "unclear_senderClaim": "foreign_agency",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o5",
          "label": "은행이나 금융회사입니다",
          "fields": {
            "unclear_senderClaim": "bank_claim",
            "unclear_senderGroup": "grp_finance"
          }
        },
        {
          "value": "o6",
          "label": "회사·통신사·택배사·쇼핑 플랫폼입니다",
          "fields": {
            "unclear_senderClaim": "company_claim",
            "unclear_senderGroup": "grp_private"
          }
        },
        {
          "value": "o7",
          "label": "보낸 곳이 적혀 있지 않거나 개인입니다",
          "fields": {
            "unclear_senderClaim": "unnamed_claim",
            "unclear_senderGroup": "grp_unnamed"
          }
        }
      ],
      "directFields": {
        "unclear_senderClaim": "direct_input",
        "unclear_senderGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q3-M",
      "id": "unclear_q3_m",
      "route": "M",
      "phase": 1,
      "prompt": "이 연락은 어떻게 이어져 왔나요?",
      "choices": [
        {
          "value": "o1",
          "label": "오늘이나 어제 처음 한 번 받았습니다",
          "fields": {
            "unclear_contactPattern": "first_contact",
            "unclear_contactFlow": "flow_single"
          }
        },
        {
          "value": "o2",
          "label": "며칠 전에 한 번 받고 그 뒤 연락은 없습니다",
          "fields": {
            "unclear_contactPattern": "once_earlier",
            "unclear_contactFlow": "flow_single"
          }
        },
        {
          "value": "o3",
          "label": "같은 내용을 여러 번 반복해서 받았습니다",
          "fields": {
            "unclear_contactPattern": "repeated_same",
            "unclear_contactFlow": "flow_repeat"
          }
        },
        {
          "value": "o4",
          "label": "받을수록 표현이 점점 강해졌습니다",
          "fields": {
            "unclear_contactPattern": "escalating_tone",
            "unclear_contactFlow": "flow_escalate"
          }
        },
        {
          "value": "o5",
          "label": "전화나 방문을 받은 뒤에 이어서 받았습니다",
          "fields": {
            "unclear_contactPattern": "after_visit",
            "unclear_contactFlow": "flow_followup"
          }
        },
        {
          "value": "o6",
          "label": "제가 신청하거나 문의한 뒤에 받았습니다",
          "fields": {
            "unclear_contactPattern": "after_request",
            "unclear_contactFlow": "flow_expected"
          }
        }
      ],
      "directFields": {
        "unclear_contactPattern": "direct_input",
        "unclear_contactFlow": "direct_input_detail"
      }
    },
    {
      "code": "Q4-M",
      "id": "unclear_q4_m",
      "route": "M",
      "phase": 1,
      "prompt": "지금 가장 크게 걱정되는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "진짜 서류인지 모르겠습니다",
          "fields": {
            "unclear_mainConcern": "doubt_genuine",
            "unclear_firstAction": "next_sender"
          }
        },
        {
          "value": "o2",
          "label": "정말 내야 하는 돈인지 모르겠습니다",
          "fields": {
            "unclear_mainConcern": "doubt_owed",
            "unclear_firstAction": "next_basis"
          }
        },
        {
          "value": "o3",
          "label": "금액이 맞는지 모르겠습니다",
          "fields": {
            "unclear_mainConcern": "doubt_amount",
            "unclear_firstAction": "next_basis"
          }
        },
        {
          "value": "o4",
          "label": "기한을 놓칠까 걱정됩니다",
          "fields": {
            "unclear_mainConcern": "doubt_deadline",
            "unclear_firstAction": "next_deadline"
          }
        },
        {
          "value": "o5",
          "label": "이미 응했거나 알려 줘서 불안합니다",
          "fields": {
            "unclear_mainConcern": "doubt_done",
            "unclear_firstAction": "next_stop"
          }
        },
        {
          "value": "o6",
          "label": "크게 걱정되지는 않고 확인만 하고 싶습니다",
          "fields": {
            "unclear_mainConcern": "doubt_none",
            "unclear_firstAction": "next_keep"
          }
        }
      ],
      "directFields": {
        "unclear_mainConcern": "direct_input",
        "unclear_firstAction": "direct_input_detail"
      }
    },
    {
      "code": "Q1-D",
      "id": "unclear_q1_d",
      "route": "D",
      "phase": 1,
      "prompt": "받은 서류나 안내는 어떤 형태인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "직인과 문서번호가 있는 종이 공문입니다",
          "fields": {
            "unclear_documentForm": "paper_official",
            "unclear_formGroup": "form_formal"
          }
        },
        {
          "value": "o2",
          "label": "청구서나 고지서 양식입니다",
          "fields": {
            "unclear_documentForm": "bill_form",
            "unclear_formGroup": "form_formal"
          }
        },
        {
          "value": "o3",
          "label": "이메일로 받았습니다",
          "fields": {
            "unclear_documentForm": "email_body",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o4",
          "label": "문자나 메신저로 받았습니다",
          "fields": {
            "unclear_documentForm": "chat_message",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o5",
          "label": "링크나 큐알 코드로 안내받았습니다",
          "fields": {
            "unclear_documentForm": "link_code",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o6",
          "label": "전화나 방문으로 말로만 들었습니다",
          "fields": {
            "unclear_documentForm": "verbal_only",
            "unclear_formGroup": "form_oral"
          }
        }
      ],
      "directFields": {
        "unclear_documentForm": "direct_input",
        "unclear_formGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q2-D",
      "id": "unclear_q2_d",
      "route": "D",
      "phase": 1,
      "prompt": "서류에 보낸 곳으로 적힌 곳은 어디인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "세무기관(세무서·세무총국)입니다",
          "fields": {
            "unclear_senderClaim": "tax_authority",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o2",
          "label": "공안·경찰·검찰·법원입니다",
          "fields": {
            "unclear_senderClaim": "police_court",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o3",
          "label": "구·시·성 등 지방 행정기관입니다",
          "fields": {
            "unclear_senderClaim": "local_admin",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o4",
          "label": "출입국·노동 등 외국인 관련 기관입니다",
          "fields": {
            "unclear_senderClaim": "foreign_agency",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o5",
          "label": "은행이나 금융회사입니다",
          "fields": {
            "unclear_senderClaim": "bank_claim",
            "unclear_senderGroup": "grp_finance"
          }
        },
        {
          "value": "o6",
          "label": "회사·통신사·택배사·쇼핑 플랫폼입니다",
          "fields": {
            "unclear_senderClaim": "company_claim",
            "unclear_senderGroup": "grp_private"
          }
        },
        {
          "value": "o7",
          "label": "보낸 곳이 적혀 있지 않거나 개인입니다",
          "fields": {
            "unclear_senderClaim": "unnamed_claim",
            "unclear_senderGroup": "grp_unnamed"
          }
        }
      ],
      "directFields": {
        "unclear_senderClaim": "direct_input",
        "unclear_senderGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q3-D",
      "id": "unclear_q3_d",
      "route": "D",
      "phase": 1,
      "prompt": "이 연락은 어떻게 이어져 왔나요?",
      "choices": [
        {
          "value": "o1",
          "label": "오늘이나 어제 처음 한 번 받았습니다",
          "fields": {
            "unclear_contactPattern": "first_contact",
            "unclear_contactFlow": "flow_single"
          }
        },
        {
          "value": "o2",
          "label": "며칠 전에 한 번 받고 그 뒤 연락은 없습니다",
          "fields": {
            "unclear_contactPattern": "once_earlier",
            "unclear_contactFlow": "flow_single"
          }
        },
        {
          "value": "o3",
          "label": "같은 내용을 여러 번 반복해서 받았습니다",
          "fields": {
            "unclear_contactPattern": "repeated_same",
            "unclear_contactFlow": "flow_repeat"
          }
        },
        {
          "value": "o4",
          "label": "받을수록 표현이 점점 강해졌습니다",
          "fields": {
            "unclear_contactPattern": "escalating_tone",
            "unclear_contactFlow": "flow_escalate"
          }
        },
        {
          "value": "o5",
          "label": "전화나 방문을 받은 뒤에 이어서 받았습니다",
          "fields": {
            "unclear_contactPattern": "after_visit",
            "unclear_contactFlow": "flow_followup"
          }
        },
        {
          "value": "o6",
          "label": "제가 신청하거나 문의한 뒤에 받았습니다",
          "fields": {
            "unclear_contactPattern": "after_request",
            "unclear_contactFlow": "flow_expected"
          }
        }
      ],
      "directFields": {
        "unclear_contactPattern": "direct_input",
        "unclear_contactFlow": "direct_input_detail"
      }
    },
    {
      "code": "Q4-D",
      "id": "unclear_q4_d",
      "route": "D",
      "phase": 1,
      "prompt": "지금 가장 크게 걱정되는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "진짜 서류인지 모르겠습니다",
          "fields": {
            "unclear_mainConcern": "doubt_genuine",
            "unclear_firstAction": "next_sender"
          }
        },
        {
          "value": "o2",
          "label": "무엇을 내야 하는지 모르겠습니다",
          "fields": {
            "unclear_mainConcern": "doubt_what",
            "unclear_firstAction": "next_basis"
          }
        },
        {
          "value": "o3",
          "label": "직접 가야 하는지, 안 가면 어떻게 되는지 걱정됩니다",
          "fields": {
            "unclear_mainConcern": "doubt_appear",
            "unclear_firstAction": "next_basis"
          }
        },
        {
          "value": "o4",
          "label": "기한을 놓칠까 걱정됩니다",
          "fields": {
            "unclear_mainConcern": "doubt_deadline",
            "unclear_firstAction": "next_deadline"
          }
        },
        {
          "value": "o5",
          "label": "개인정보를 내도 되는지 걱정됩니다",
          "fields": {
            "unclear_mainConcern": "doubt_privacy",
            "unclear_firstAction": "next_sender"
          }
        },
        {
          "value": "o6",
          "label": "이미 일부를 냈거나 답했습니다",
          "fields": {
            "unclear_mainConcern": "doubt_done",
            "unclear_firstAction": "next_stop"
          }
        },
        {
          "value": "o7",
          "label": "크게 걱정되지는 않고 확인만 하고 싶습니다",
          "fields": {
            "unclear_mainConcern": "doubt_none",
            "unclear_firstAction": "next_keep"
          }
        }
      ],
      "directFields": {
        "unclear_mainConcern": "direct_input",
        "unclear_firstAction": "direct_input_detail"
      }
    },
    {
      "code": "Q1-N",
      "id": "unclear_q1_n",
      "route": "N",
      "phase": 1,
      "prompt": "받은 서류나 안내는 어떤 형태인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "직인과 문서번호가 있는 종이 공문입니다",
          "fields": {
            "unclear_documentForm": "paper_official",
            "unclear_formGroup": "form_formal"
          }
        },
        {
          "value": "o2",
          "label": "청구서나 고지서 양식입니다",
          "fields": {
            "unclear_documentForm": "bill_form",
            "unclear_formGroup": "form_formal"
          }
        },
        {
          "value": "o3",
          "label": "이메일로 받았습니다",
          "fields": {
            "unclear_documentForm": "email_body",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o4",
          "label": "문자나 메신저로 받았습니다",
          "fields": {
            "unclear_documentForm": "chat_message",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o5",
          "label": "링크나 큐알 코드로 안내받았습니다",
          "fields": {
            "unclear_documentForm": "link_code",
            "unclear_formGroup": "form_digital"
          }
        },
        {
          "value": "o6",
          "label": "전화나 방문으로 말로만 들었습니다",
          "fields": {
            "unclear_documentForm": "verbal_only",
            "unclear_formGroup": "form_oral"
          }
        }
      ],
      "directFields": {
        "unclear_documentForm": "direct_input",
        "unclear_formGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q2-N",
      "id": "unclear_q2_n",
      "route": "N",
      "phase": 1,
      "prompt": "서류에 보낸 곳으로 적힌 곳은 어디인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "세무기관(세무서·세무총국)입니다",
          "fields": {
            "unclear_senderClaim": "tax_authority",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o2",
          "label": "공안·경찰·검찰·법원입니다",
          "fields": {
            "unclear_senderClaim": "police_court",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o3",
          "label": "구·시·성 등 지방 행정기관입니다",
          "fields": {
            "unclear_senderClaim": "local_admin",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o4",
          "label": "출입국·노동 등 외국인 관련 기관입니다",
          "fields": {
            "unclear_senderClaim": "foreign_agency",
            "unclear_senderGroup": "grp_public"
          }
        },
        {
          "value": "o5",
          "label": "은행이나 금융회사입니다",
          "fields": {
            "unclear_senderClaim": "bank_claim",
            "unclear_senderGroup": "grp_finance"
          }
        },
        {
          "value": "o6",
          "label": "회사·통신사·택배사·쇼핑 플랫폼입니다",
          "fields": {
            "unclear_senderClaim": "company_claim",
            "unclear_senderGroup": "grp_private"
          }
        },
        {
          "value": "o7",
          "label": "보낸 곳이 적혀 있지 않거나 개인입니다",
          "fields": {
            "unclear_senderClaim": "unnamed_claim",
            "unclear_senderGroup": "grp_unnamed"
          }
        }
      ],
      "directFields": {
        "unclear_senderClaim": "direct_input",
        "unclear_senderGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q3-N",
      "id": "unclear_q3_n",
      "route": "N",
      "phase": 1,
      "prompt": "이 연락은 어떻게 이어져 왔나요?",
      "choices": [
        {
          "value": "o1",
          "label": "오늘이나 어제 처음 한 번 받았습니다",
          "fields": {
            "unclear_contactPattern": "first_contact",
            "unclear_contactFlow": "flow_single"
          }
        },
        {
          "value": "o2",
          "label": "며칠 전에 한 번 받고 그 뒤 연락은 없습니다",
          "fields": {
            "unclear_contactPattern": "once_earlier",
            "unclear_contactFlow": "flow_single"
          }
        },
        {
          "value": "o3",
          "label": "같은 내용을 여러 번 반복해서 받았습니다",
          "fields": {
            "unclear_contactPattern": "repeated_same",
            "unclear_contactFlow": "flow_repeat"
          }
        },
        {
          "value": "o4",
          "label": "받을수록 표현이 점점 강해졌습니다",
          "fields": {
            "unclear_contactPattern": "escalating_tone",
            "unclear_contactFlow": "flow_escalate"
          }
        },
        {
          "value": "o5",
          "label": "전화나 방문을 받은 뒤에 이어서 받았습니다",
          "fields": {
            "unclear_contactPattern": "after_visit",
            "unclear_contactFlow": "flow_followup"
          }
        },
        {
          "value": "o6",
          "label": "제가 신청하거나 문의한 뒤에 받았습니다",
          "fields": {
            "unclear_contactPattern": "after_request",
            "unclear_contactFlow": "flow_expected"
          }
        }
      ],
      "directFields": {
        "unclear_contactPattern": "direct_input",
        "unclear_contactFlow": "direct_input_detail"
      }
    },
    {
      "code": "Q4-N",
      "id": "unclear_q4_n",
      "route": "N",
      "phase": 1,
      "prompt": "지금 가장 크게 걱정되는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "무슨 뜻인지 모르겠습니다",
          "fields": {
            "unclear_mainConcern": "doubt_meaning",
            "unclear_firstAction": "next_understand"
          }
        },
        {
          "value": "o2",
          "label": "진짜 서류인지 모르겠습니다",
          "fields": {
            "unclear_mainConcern": "doubt_genuine",
            "unclear_firstAction": "next_sender"
          }
        },
        {
          "value": "o3",
          "label": "응해야 하는지 보관만 해도 되는지 모르겠습니다",
          "fields": {
            "unclear_mainConcern": "doubt_respond",
            "unclear_firstAction": "next_understand"
          }
        },
        {
          "value": "o4",
          "label": "놓친 내용이 있을까 걱정됩니다",
          "fields": {
            "unclear_mainConcern": "doubt_missing",
            "unclear_firstAction": "next_deadline"
          }
        },
        {
          "value": "o5",
          "label": "이미 답장했거나 응했습니다",
          "fields": {
            "unclear_mainConcern": "doubt_done",
            "unclear_firstAction": "next_stop"
          }
        },
        {
          "value": "o6",
          "label": "크게 걱정되지는 않고 무슨 서류인지만 알고 싶습니다",
          "fields": {
            "unclear_mainConcern": "doubt_none",
            "unclear_firstAction": "next_keep"
          }
        }
      ],
      "directFields": {
        "unclear_mainConcern": "direct_input",
        "unclear_firstAction": "direct_input_detail"
      }
    },
    {
      "code": "Q5-M",
      "id": "unclear_q5_m",
      "route": "M",
      "phase": 2,
      "prompt": "서류에 적힌 내 정보는 어떻게 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "이름·회사명·주소가 모두 정확합니다",
          "fields": {
            "unclear_identityMatch": "id_exact",
            "unclear_aimHint": "aim_specific"
          }
        },
        {
          "value": "o2",
          "label": "이름은 맞지만 주소나 번호가 일부 다릅니다",
          "fields": {
            "unclear_identityMatch": "id_partial",
            "unclear_aimHint": "aim_partial"
          }
        },
        {
          "value": "o3",
          "label": "이름 없이 일반 호칭만 적혀 있습니다",
          "fields": {
            "unclear_identityMatch": "id_generic",
            "unclear_aimHint": "aim_generic"
          }
        },
        {
          "value": "o4",
          "label": "다른 사람이나 다른 회사 이름이 적혀 있습니다",
          "fields": {
            "unclear_identityMatch": "id_other",
            "unclear_aimHint": "aim_misdirected"
          }
        },
        {
          "value": "o5",
          "label": "적힌 정보를 아직 확인하지 않았습니다",
          "fields": {
            "unclear_identityMatch": "id_unchecked",
            "unclear_aimHint": "aim_unchecked"
          }
        }
      ],
      "directFields": {
        "unclear_identityMatch": "direct_input",
        "unclear_aimHint": "direct_input_detail"
      }
    },
    {
      "code": "Q6-M",
      "id": "unclear_q6_m",
      "route": "M",
      "phase": 2,
      "prompt": "서류나 연락에서 확인되는 요소는 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "기관명·문서번호·날짜·직인이 모두 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_full",
            "unclear_formality": "fm_formal"
          }
        },
        {
          "value": "o2",
          "label": "그중 일부만 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_partial",
            "unclear_formality": "fm_partial"
          }
        },
        {
          "value": "o3",
          "label": "모두 없고 문장만 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_none",
            "unclear_formality": "fm_informal"
          }
        },
        {
          "value": "o4",
          "label": "연락처가 개인 번호나 일반 이메일 주소입니다",
          "fields": {
            "unclear_authenticityMark": "mark_personal_contact",
            "unclear_formality": "fm_informal"
          }
        },
        {
          "value": "o5",
          "label": "링크나 큐알 코드로만 안내합니다",
          "fields": {
            "unclear_authenticityMark": "mark_link_only",
            "unclear_formality": "fm_link"
          }
        },
        {
          "value": "o6",
          "label": "문장이 번역투이거나 어색합니다",
          "fields": {
            "unclear_authenticityMark": "mark_odd_text",
            "unclear_formality": "fm_odd"
          }
        }
      ],
      "directFields": {
        "unclear_authenticityMark": "direct_input",
        "unclear_formality": "direct_input_detail"
      }
    },
    {
      "code": "Q7-M",
      "id": "unclear_q7_m",
      "route": "M",
      "phase": 2,
      "prompt": "서류가 요구하는 돈의 성격은 무엇이라고 적혀 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "세금이나 세무 관련 비용입니다",
          "fields": {
            "unclear_moneyNature": "nature_tax",
            "unclear_moneyReviewLink": "link_tax"
          }
        },
        {
          "value": "o2",
          "label": "벌금·과태료·행정 수수료입니다",
          "fields": {
            "unclear_moneyNature": "nature_fine",
            "unclear_moneyReviewLink": "link_admin"
          }
        },
        {
          "value": "o3",
          "label": "서비스 이용료나 요금입니다",
          "fields": {
            "unclear_moneyNature": "nature_fee",
            "unclear_moneyReviewLink": "link_trade"
          }
        },
        {
          "value": "o4",
          "label": "채무나 거래 대금입니다",
          "fields": {
            "unclear_moneyNature": "nature_debt",
            "unclear_moneyReviewLink": "link_trade"
          }
        },
        {
          "value": "o5",
          "label": "보증금·선납금·예치금입니다",
          "fields": {
            "unclear_moneyNature": "nature_deposit",
            "unclear_moneyReviewLink": "link_property"
          }
        },
        {
          "value": "o6",
          "label": "명목이 적혀 있지 않습니다",
          "fields": {
            "unclear_moneyNature": "nature_unstated",
            "unclear_moneyReviewLink": "link_none"
          }
        }
      ],
      "directFields": {
        "unclear_moneyNature": "direct_input",
        "unclear_moneyReviewLink": "direct_input_detail"
      }
    },
    {
      "code": "Q8-M",
      "id": "unclear_q8_m",
      "route": "M",
      "phase": 2,
      "prompt": "요구하는 금액은 어느 정도인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "100만 동 미만입니다",
          "fields": {
            "unclear_amountScale": "amt_under1m",
            "unclear_amountTier": "tier_small"
          }
        },
        {
          "value": "o2",
          "label": "100만 동 이상 1천만 동 미만입니다",
          "fields": {
            "unclear_amountScale": "amt_1m_10m",
            "unclear_amountTier": "tier_medium"
          }
        },
        {
          "value": "o3",
          "label": "1천만 동 이상 1억 동 미만입니다",
          "fields": {
            "unclear_amountScale": "amt_10m_100m",
            "unclear_amountTier": "tier_large"
          }
        },
        {
          "value": "o4",
          "label": "1억 동 이상입니다",
          "fields": {
            "unclear_amountScale": "amt_over100m",
            "unclear_amountTier": "tier_xlarge"
          }
        },
        {
          "value": "o5",
          "label": "금액이 적혀 있지 않습니다",
          "fields": {
            "unclear_amountScale": "amt_unstated",
            "unclear_amountTier": "tier_unknown"
          }
        }
      ],
      "directFields": {
        "unclear_amountScale": "direct_input",
        "unclear_amountTier": "direct_input_detail"
      }
    },
    {
      "code": "Q9-M",
      "id": "unclear_q9_m",
      "route": "M",
      "phase": 2,
      "prompt": "돈을 어디로 보내라고 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "기관 이름으로 된 계좌입니다",
          "fields": {
            "unclear_payee": "payee_institution",
            "unclear_paymentGroup": "pay_account"
          }
        },
        {
          "value": "o2",
          "label": "회사 이름으로 된 계좌입니다",
          "fields": {
            "unclear_payee": "payee_company",
            "unclear_paymentGroup": "pay_account"
          }
        },
        {
          "value": "o3",
          "label": "개인 이름으로 된 계좌입니다",
          "fields": {
            "unclear_payee": "payee_person",
            "unclear_paymentGroup": "pay_account"
          }
        },
        {
          "value": "o4",
          "label": "링크·큐알 코드·앱으로 결제하라고 합니다",
          "fields": {
            "unclear_payee": "payee_online",
            "unclear_paymentGroup": "pay_online"
          }
        },
        {
          "value": "o5",
          "label": "현금이나 상품권으로 내라고 합니다",
          "fields": {
            "unclear_payee": "payee_cash",
            "unclear_paymentGroup": "pay_cash"
          }
        },
        {
          "value": "o6",
          "label": "계좌나 방법이 적혀 있지 않습니다",
          "fields": {
            "unclear_payee": "payee_unstated",
            "unclear_paymentGroup": "pay_none"
          }
        }
      ],
      "directFields": {
        "unclear_payee": "direct_input",
        "unclear_paymentGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q10-M",
      "id": "unclear_q10_m",
      "route": "M",
      "phase": 2,
      "prompt": "서류나 연락에 어떤 압박이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "압박 없이 안내만 있습니다",
          "fields": {
            "unclear_pressureType": "press_none",
            "unclear_pressureLevel": "lvl_none"
          }
        },
        {
          "value": "o2",
          "label": "기한 안에 하라는 안내만 있습니다",
          "fields": {
            "unclear_pressureType": "press_deadline",
            "unclear_pressureLevel": "lvl_low"
          }
        },
        {
          "value": "o3",
          "label": "연체료·가산금이나 법적 조치를 예고합니다",
          "fields": {
            "unclear_pressureType": "press_legal",
            "unclear_pressureLevel": "lvl_mid"
          }
        },
        {
          "value": "o4",
          "label": "지금 바로 하지 않으면 안 된다고 재촉합니다",
          "fields": {
            "unclear_pressureType": "press_rush",
            "unclear_pressureLevel": "lvl_mid"
          }
        },
        {
          "value": "o5",
          "label": "계좌 동결·체포·출국 금지 같은 강한 불이익을 말합니다",
          "fields": {
            "unclear_pressureType": "press_threat",
            "unclear_pressureLevel": "lvl_high"
          }
        },
        {
          "value": "o6",
          "label": "다른 사람에게 말하지 말고 비밀로 하라고 합니다",
          "fields": {
            "unclear_pressureType": "press_secret",
            "unclear_pressureLevel": "lvl_high"
          }
        }
      ],
      "directFields": {
        "unclear_pressureType": "direct_input",
        "unclear_pressureLevel": "direct_input_detail"
      }
    },
    {
      "code": "Q11-M",
      "id": "unclear_q11_m",
      "route": "M",
      "phase": 2,
      "prompt": "서류나 안내의 기한은 어떻게 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "기한이 적혀 있지 않습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_none",
            "unclear_deadlineSource": "dls_none"
          }
        },
        {
          "value": "o2",
          "label": "서류에 날짜가 적혀 있고 아직 여유가 있습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_far",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o3",
          "label": "서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_near",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o4",
          "label": "서류에 적힌 기한이 이미 지났습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_passed",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o5",
          "label": "메시지나 말로만 기한을 알려 줬습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_verbal",
            "unclear_deadlineSource": "dls_message"
          }
        },
        {
          "value": "o6",
          "label": "기한이 있는 것 같은데 정확히 모릅니다",
          "fields": {
            "unclear_deadlineStatus": "dl_unclear",
            "unclear_deadlineSource": "dls_unknown"
          }
        }
      ],
      "directFields": {
        "unclear_deadlineStatus": "direct_input",
        "unclear_deadlineSource": "direct_input_detail"
      }
    },
    {
      "code": "Q12-M",
      "id": "unclear_q12_m",
      "route": "M",
      "phase": 2,
      "prompt": "지금까지 이 서류와 관련해 한 일이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "아무것도 하지 않았습니다",
          "fields": {
            "unclear_actionTaken": "act_nothing",
            "unclear_exposureLevel": "exp_none"
          }
        },
        {
          "value": "o2",
          "label": "보낸 곳에 문의만 했습니다",
          "fields": {
            "unclear_actionTaken": "act_asked",
            "unclear_exposureLevel": "exp_low"
          }
        },
        {
          "value": "o3",
          "label": "링크를 열었거나 앱을 설치했습니다",
          "fields": {
            "unclear_actionTaken": "act_clicked",
            "unclear_exposureLevel": "exp_mid"
          }
        },
        {
          "value": "o4",
          "label": "개인정보나 서류를 이미 보냈습니다",
          "fields": {
            "unclear_actionTaken": "act_sent_info",
            "unclear_exposureLevel": "exp_info"
          }
        },
        {
          "value": "o5",
          "label": "돈을 일부 또는 전부 보냈습니다",
          "fields": {
            "unclear_actionTaken": "act_sent_money",
            "unclear_exposureLevel": "exp_money"
          }
        },
        {
          "value": "o6",
          "label": "답장을 했거나 통화를 했습니다",
          "fields": {
            "unclear_actionTaken": "act_replied",
            "unclear_exposureLevel": "exp_contact"
          }
        }
      ],
      "directFields": {
        "unclear_actionTaken": "direct_input",
        "unclear_exposureLevel": "direct_input_detail"
      }
    },
    {
      "code": "Q13-M",
      "id": "unclear_q13_m",
      "route": "M",
      "phase": 2,
      "prompt": "남아 있는 자료는 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "서류 원본을 가지고 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_original",
            "unclear_evidenceState": "evs_strong"
          }
        },
        {
          "value": "o2",
          "label": "사진이나 캡처만 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_photo",
            "unclear_evidenceState": "evs_medium"
          }
        },
        {
          "value": "o3",
          "label": "문자·메신저·통화 기록이 남아 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_chat",
            "unclear_evidenceState": "evs_medium"
          }
        },
        {
          "value": "o4",
          "label": "송금 내역이나 영수증이 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_payment",
            "unclear_evidenceState": "evs_strong"
          }
        },
        {
          "value": "o5",
          "label": "일부를 잃어버렸거나 지웠습니다",
          "fields": {
            "unclear_evidenceKind": "ev_partial",
            "unclear_evidenceState": "evs_weak"
          }
        },
        {
          "value": "o6",
          "label": "남은 자료가 없습니다",
          "fields": {
            "unclear_evidenceKind": "ev_none",
            "unclear_evidenceState": "evs_weak"
          }
        }
      ],
      "directFields": {
        "unclear_evidenceKind": "direct_input",
        "unclear_evidenceState": "direct_input_detail"
      }
    },
    {
      "code": "Q5-D",
      "id": "unclear_q5_d",
      "route": "D",
      "phase": 2,
      "prompt": "서류에 적힌 내 정보는 어떻게 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "이름·회사명·주소가 모두 정확합니다",
          "fields": {
            "unclear_identityMatch": "id_exact",
            "unclear_aimHint": "aim_specific"
          }
        },
        {
          "value": "o2",
          "label": "이름은 맞지만 주소나 번호가 일부 다릅니다",
          "fields": {
            "unclear_identityMatch": "id_partial",
            "unclear_aimHint": "aim_partial"
          }
        },
        {
          "value": "o3",
          "label": "이름 없이 일반 호칭만 적혀 있습니다",
          "fields": {
            "unclear_identityMatch": "id_generic",
            "unclear_aimHint": "aim_generic"
          }
        },
        {
          "value": "o4",
          "label": "다른 사람이나 다른 회사 이름이 적혀 있습니다",
          "fields": {
            "unclear_identityMatch": "id_other",
            "unclear_aimHint": "aim_misdirected"
          }
        },
        {
          "value": "o5",
          "label": "적힌 정보를 아직 확인하지 않았습니다",
          "fields": {
            "unclear_identityMatch": "id_unchecked",
            "unclear_aimHint": "aim_unchecked"
          }
        }
      ],
      "directFields": {
        "unclear_identityMatch": "direct_input",
        "unclear_aimHint": "direct_input_detail"
      }
    },
    {
      "code": "Q6-D",
      "id": "unclear_q6_d",
      "route": "D",
      "phase": 2,
      "prompt": "서류나 연락에서 확인되는 요소는 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "기관명·문서번호·날짜·직인이 모두 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_full",
            "unclear_formality": "fm_formal"
          }
        },
        {
          "value": "o2",
          "label": "그중 일부만 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_partial",
            "unclear_formality": "fm_partial"
          }
        },
        {
          "value": "o3",
          "label": "모두 없고 문장만 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_none",
            "unclear_formality": "fm_informal"
          }
        },
        {
          "value": "o4",
          "label": "연락처가 개인 번호나 일반 이메일 주소입니다",
          "fields": {
            "unclear_authenticityMark": "mark_personal_contact",
            "unclear_formality": "fm_informal"
          }
        },
        {
          "value": "o5",
          "label": "링크나 큐알 코드로만 안내합니다",
          "fields": {
            "unclear_authenticityMark": "mark_link_only",
            "unclear_formality": "fm_link"
          }
        },
        {
          "value": "o6",
          "label": "문장이 번역투이거나 어색합니다",
          "fields": {
            "unclear_authenticityMark": "mark_odd_text",
            "unclear_formality": "fm_odd"
          }
        }
      ],
      "directFields": {
        "unclear_authenticityMark": "direct_input",
        "unclear_formality": "direct_input_detail"
      }
    },
    {
      "code": "Q7-D",
      "id": "unclear_q7_d",
      "route": "D",
      "phase": 2,
      "prompt": "서류가 요구하는 것은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "신분증·여권·체류 관련 서류입니다",
          "fields": {
            "unclear_requestTarget": "tgt_id_docs",
            "unclear_targetGroup": "grp_personal"
          }
        },
        {
          "value": "o2",
          "label": "사업자·회사 관련 서류입니다",
          "fields": {
            "unclear_requestTarget": "tgt_business_docs",
            "unclear_targetGroup": "grp_business"
          }
        },
        {
          "value": "o3",
          "label": "계약서나 거래 서류입니다",
          "fields": {
            "unclear_requestTarget": "tgt_contract_docs",
            "unclear_targetGroup": "grp_contract"
          }
        },
        {
          "value": "o4",
          "label": "경위서·설명서 같은 진술입니다",
          "fields": {
            "unclear_requestTarget": "tgt_statement",
            "unclear_targetGroup": "grp_statement"
          }
        },
        {
          "value": "o5",
          "label": "직접 출석하거나 방문하라는 것입니다",
          "fields": {
            "unclear_requestTarget": "tgt_appear",
            "unclear_targetGroup": "grp_appear"
          }
        },
        {
          "value": "o6",
          "label": "사이트 접속이나 앱 설치입니다",
          "fields": {
            "unclear_requestTarget": "tgt_online",
            "unclear_targetGroup": "grp_online"
          }
        }
      ],
      "directFields": {
        "unclear_requestTarget": "direct_input",
        "unclear_targetGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q8-D",
      "id": "unclear_q8_d",
      "route": "D",
      "phase": 2,
      "prompt": "요구 내용은 얼마나 구체적으로 적혀 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "서류 목록과 제출 양식이 모두 있습니다",
          "fields": {
            "unclear_requestSpecificity": "spec_full",
            "unclear_listQuality": "list_clear"
          }
        },
        {
          "value": "o2",
          "label": "목록은 있지만 양식은 없습니다",
          "fields": {
            "unclear_requestSpecificity": "spec_list_only",
            "unclear_listQuality": "list_partial"
          }
        },
        {
          "value": "o3",
          "label": "'관련 서류' 정도로만 적혀 있습니다",
          "fields": {
            "unclear_requestSpecificity": "spec_vague",
            "unclear_listQuality": "list_vague"
          }
        },
        {
          "value": "o4",
          "label": "무엇을 내야 하는지 적혀 있지 않습니다",
          "fields": {
            "unclear_requestSpecificity": "spec_none",
            "unclear_listQuality": "list_none"
          }
        },
        {
          "value": "o5",
          "label": "서류 요구 없이 연락하라고만 합니다",
          "fields": {
            "unclear_requestSpecificity": "spec_contact_only",
            "unclear_listQuality": "list_contact"
          }
        }
      ],
      "directFields": {
        "unclear_requestSpecificity": "direct_input",
        "unclear_listQuality": "direct_input_detail"
      }
    },
    {
      "code": "Q9-D",
      "id": "unclear_q9_d",
      "route": "D",
      "phase": 2,
      "prompt": "제출이나 출석은 어떤 방법으로 하라고 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "지정된 장소에 직접 방문하는 것입니다",
          "fields": {
            "unclear_deliveryMethod": "deliver_visit",
            "unclear_deliveryGroup": "dgrp_formal"
          }
        },
        {
          "value": "o2",
          "label": "우편이나 창구 접수입니다",
          "fields": {
            "unclear_deliveryMethod": "deliver_post",
            "unclear_deliveryGroup": "dgrp_formal"
          }
        },
        {
          "value": "o3",
          "label": "이메일이나 메신저로 보내라는 것입니다",
          "fields": {
            "unclear_deliveryMethod": "deliver_chat",
            "unclear_deliveryGroup": "dgrp_digital"
          }
        },
        {
          "value": "o4",
          "label": "웹사이트에 올리라는 것입니다",
          "fields": {
            "unclear_deliveryMethod": "deliver_upload",
            "unclear_deliveryGroup": "dgrp_digital"
          }
        },
        {
          "value": "o5",
          "label": "전화나 화상 통화로 하라는 것입니다",
          "fields": {
            "unclear_deliveryMethod": "deliver_call",
            "unclear_deliveryGroup": "dgrp_digital"
          }
        },
        {
          "value": "o6",
          "label": "방법이 적혀 있지 않습니다",
          "fields": {
            "unclear_deliveryMethod": "deliver_unstated",
            "unclear_deliveryGroup": "dgrp_unspecified"
          }
        }
      ],
      "directFields": {
        "unclear_deliveryMethod": "direct_input",
        "unclear_deliveryGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q10-D",
      "id": "unclear_q10_d",
      "route": "D",
      "phase": 2,
      "prompt": "서류나 연락에 어떤 압박이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "압박 없이 안내만 있습니다",
          "fields": {
            "unclear_pressureType": "press_none",
            "unclear_pressureLevel": "lvl_none"
          }
        },
        {
          "value": "o2",
          "label": "기한 안에 하라는 안내만 있습니다",
          "fields": {
            "unclear_pressureType": "press_deadline",
            "unclear_pressureLevel": "lvl_low"
          }
        },
        {
          "value": "o3",
          "label": "연체료·가산금이나 법적 조치를 예고합니다",
          "fields": {
            "unclear_pressureType": "press_legal",
            "unclear_pressureLevel": "lvl_mid"
          }
        },
        {
          "value": "o4",
          "label": "지금 바로 하지 않으면 안 된다고 재촉합니다",
          "fields": {
            "unclear_pressureType": "press_rush",
            "unclear_pressureLevel": "lvl_mid"
          }
        },
        {
          "value": "o5",
          "label": "계좌 동결·체포·출국 금지 같은 강한 불이익을 말합니다",
          "fields": {
            "unclear_pressureType": "press_threat",
            "unclear_pressureLevel": "lvl_high"
          }
        },
        {
          "value": "o6",
          "label": "다른 사람에게 말하지 말고 비밀로 하라고 합니다",
          "fields": {
            "unclear_pressureType": "press_secret",
            "unclear_pressureLevel": "lvl_high"
          }
        }
      ],
      "directFields": {
        "unclear_pressureType": "direct_input",
        "unclear_pressureLevel": "direct_input_detail"
      }
    },
    {
      "code": "Q11-D",
      "id": "unclear_q11_d",
      "route": "D",
      "phase": 2,
      "prompt": "서류나 안내의 기한은 어떻게 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "기한이 적혀 있지 않습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_none",
            "unclear_deadlineSource": "dls_none"
          }
        },
        {
          "value": "o2",
          "label": "서류에 날짜가 적혀 있고 아직 여유가 있습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_far",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o3",
          "label": "서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_near",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o4",
          "label": "서류에 적힌 기한이 이미 지났습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_passed",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o5",
          "label": "메시지나 말로만 기한을 알려 줬습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_verbal",
            "unclear_deadlineSource": "dls_message"
          }
        },
        {
          "value": "o6",
          "label": "기한이 있는 것 같은데 정확히 모릅니다",
          "fields": {
            "unclear_deadlineStatus": "dl_unclear",
            "unclear_deadlineSource": "dls_unknown"
          }
        }
      ],
      "directFields": {
        "unclear_deadlineStatus": "direct_input",
        "unclear_deadlineSource": "direct_input_detail"
      }
    },
    {
      "code": "Q12-D",
      "id": "unclear_q12_d",
      "route": "D",
      "phase": 2,
      "prompt": "지금까지 이 서류와 관련해 한 일이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "아무것도 하지 않았습니다",
          "fields": {
            "unclear_actionTaken": "act_nothing",
            "unclear_exposureLevel": "exp_none"
          }
        },
        {
          "value": "o2",
          "label": "보낸 곳에 문의만 했습니다",
          "fields": {
            "unclear_actionTaken": "act_asked",
            "unclear_exposureLevel": "exp_low"
          }
        },
        {
          "value": "o3",
          "label": "링크를 열었거나 앱을 설치했습니다",
          "fields": {
            "unclear_actionTaken": "act_clicked",
            "unclear_exposureLevel": "exp_mid"
          }
        },
        {
          "value": "o4",
          "label": "개인정보나 서류를 이미 보냈습니다",
          "fields": {
            "unclear_actionTaken": "act_sent_info",
            "unclear_exposureLevel": "exp_info"
          }
        },
        {
          "value": "o5",
          "label": "돈을 일부 또는 전부 보냈습니다",
          "fields": {
            "unclear_actionTaken": "act_sent_money",
            "unclear_exposureLevel": "exp_money"
          }
        },
        {
          "value": "o6",
          "label": "답장을 했거나 통화를 했습니다",
          "fields": {
            "unclear_actionTaken": "act_replied",
            "unclear_exposureLevel": "exp_contact"
          }
        }
      ],
      "directFields": {
        "unclear_actionTaken": "direct_input",
        "unclear_exposureLevel": "direct_input_detail"
      }
    },
    {
      "code": "Q13-D",
      "id": "unclear_q13_d",
      "route": "D",
      "phase": 2,
      "prompt": "남아 있는 자료는 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "서류 원본을 가지고 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_original",
            "unclear_evidenceState": "evs_strong"
          }
        },
        {
          "value": "o2",
          "label": "사진이나 캡처만 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_photo",
            "unclear_evidenceState": "evs_medium"
          }
        },
        {
          "value": "o3",
          "label": "문자·메신저·통화 기록이 남아 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_chat",
            "unclear_evidenceState": "evs_medium"
          }
        },
        {
          "value": "o4",
          "label": "송금 내역이나 영수증이 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_payment",
            "unclear_evidenceState": "evs_strong"
          }
        },
        {
          "value": "o5",
          "label": "일부를 잃어버렸거나 지웠습니다",
          "fields": {
            "unclear_evidenceKind": "ev_partial",
            "unclear_evidenceState": "evs_weak"
          }
        },
        {
          "value": "o6",
          "label": "남은 자료가 없습니다",
          "fields": {
            "unclear_evidenceKind": "ev_none",
            "unclear_evidenceState": "evs_weak"
          }
        }
      ],
      "directFields": {
        "unclear_evidenceKind": "direct_input",
        "unclear_evidenceState": "direct_input_detail"
      }
    },
    {
      "code": "Q5-N",
      "id": "unclear_q5_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류에 적힌 내 정보는 어떻게 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "이름·회사명·주소가 모두 정확합니다",
          "fields": {
            "unclear_identityMatch": "id_exact",
            "unclear_aimHint": "aim_specific"
          }
        },
        {
          "value": "o2",
          "label": "이름은 맞지만 주소나 번호가 일부 다릅니다",
          "fields": {
            "unclear_identityMatch": "id_partial",
            "unclear_aimHint": "aim_partial"
          }
        },
        {
          "value": "o3",
          "label": "이름 없이 일반 호칭만 적혀 있습니다",
          "fields": {
            "unclear_identityMatch": "id_generic",
            "unclear_aimHint": "aim_generic"
          }
        },
        {
          "value": "o4",
          "label": "다른 사람이나 다른 회사 이름이 적혀 있습니다",
          "fields": {
            "unclear_identityMatch": "id_other",
            "unclear_aimHint": "aim_misdirected"
          }
        },
        {
          "value": "o5",
          "label": "적힌 정보를 아직 확인하지 않았습니다",
          "fields": {
            "unclear_identityMatch": "id_unchecked",
            "unclear_aimHint": "aim_unchecked"
          }
        }
      ],
      "directFields": {
        "unclear_identityMatch": "direct_input",
        "unclear_aimHint": "direct_input_detail"
      }
    },
    {
      "code": "Q6-N",
      "id": "unclear_q6_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류나 연락에서 확인되는 요소는 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "기관명·문서번호·날짜·직인이 모두 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_full",
            "unclear_formality": "fm_formal"
          }
        },
        {
          "value": "o2",
          "label": "그중 일부만 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_partial",
            "unclear_formality": "fm_partial"
          }
        },
        {
          "value": "o3",
          "label": "모두 없고 문장만 있습니다",
          "fields": {
            "unclear_authenticityMark": "mark_none",
            "unclear_formality": "fm_informal"
          }
        },
        {
          "value": "o4",
          "label": "연락처가 개인 번호나 일반 이메일 주소입니다",
          "fields": {
            "unclear_authenticityMark": "mark_personal_contact",
            "unclear_formality": "fm_informal"
          }
        },
        {
          "value": "o5",
          "label": "링크나 큐알 코드로만 안내합니다",
          "fields": {
            "unclear_authenticityMark": "mark_link_only",
            "unclear_formality": "fm_link"
          }
        },
        {
          "value": "o6",
          "label": "문장이 번역투이거나 어색합니다",
          "fields": {
            "unclear_authenticityMark": "mark_odd_text",
            "unclear_formality": "fm_odd"
          }
        }
      ],
      "directFields": {
        "unclear_authenticityMark": "direct_input",
        "unclear_formality": "direct_input_detail"
      }
    },
    {
      "code": "Q7-N",
      "id": "unclear_q7_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류 내용을 얼마나 이해하셨나요?",
      "choices": [
        {
          "value": "o1",
          "label": "대부분 이해했습니다",
          "fields": {
            "unclear_understandingLevel": "und_most",
            "unclear_readability": "read_ok"
          }
        },
        {
          "value": "o2",
          "label": "절반쯤 이해했습니다",
          "fields": {
            "unclear_understandingLevel": "und_half",
            "unclear_readability": "read_ok"
          }
        },
        {
          "value": "o3",
          "label": "거의 이해하지 못했습니다",
          "fields": {
            "unclear_understandingLevel": "und_little",
            "unclear_readability": "read_hard"
          }
        },
        {
          "value": "o4",
          "label": "외국어라 읽기 어렵습니다",
          "fields": {
            "unclear_understandingLevel": "und_language",
            "unclear_readability": "read_lang"
          }
        },
        {
          "value": "o5",
          "label": "사진이 흐리거나 잘려 읽을 수 없습니다",
          "fields": {
            "unclear_understandingLevel": "und_blurry",
            "unclear_readability": "read_blurry"
          }
        }
      ],
      "directFields": {
        "unclear_understandingLevel": "direct_input",
        "unclear_readability": "direct_input_detail"
      }
    },
    {
      "code": "Q8-N",
      "id": "unclear_q8_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류에서 가장 눈에 띄는 것은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "법령 이름이나 조항 번호입니다",
          "fields": {
            "unclear_keyElement": "key_law",
            "unclear_elementGroup": "eg_legal"
          }
        },
        {
          "value": "o2",
          "label": "기관 이름입니다",
          "fields": {
            "unclear_keyElement": "key_agency",
            "unclear_elementGroup": "eg_agency"
          }
        },
        {
          "value": "o3",
          "label": "문서번호·사건번호·세금번호 같은 번호입니다",
          "fields": {
            "unclear_keyElement": "key_numbers",
            "unclear_elementGroup": "eg_numbers"
          }
        },
        {
          "value": "o4",
          "label": "금액이나 계좌번호입니다",
          "fields": {
            "unclear_keyElement": "key_money",
            "unclear_elementGroup": "eg_money"
          }
        },
        {
          "value": "o5",
          "label": "날짜나 기한입니다",
          "fields": {
            "unclear_keyElement": "key_date",
            "unclear_elementGroup": "eg_date"
          }
        },
        {
          "value": "o6",
          "label": "링크나 전화번호뿐입니다",
          "fields": {
            "unclear_keyElement": "key_contact",
            "unclear_elementGroup": "eg_contact"
          }
        }
      ],
      "directFields": {
        "unclear_keyElement": "direct_input",
        "unclear_elementGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q9-N",
      "id": "unclear_q9_n",
      "route": "N",
      "phase": 2,
      "prompt": "읽어 본 느낌으로는 무엇을 요구하는 것 같나요?",
      "choices": [
        {
          "value": "o1",
          "label": "돈을 내라는 것 같습니다",
          "fields": {
            "unclear_impliedRequest": "imp_money",
            "unclear_requestHint": "hint_pay"
          }
        },
        {
          "value": "o2",
          "label": "서류를 내거나 출석하라는 것 같습니다",
          "fields": {
            "unclear_impliedRequest": "imp_submit",
            "unclear_requestHint": "hint_submit"
          }
        },
        {
          "value": "o3",
          "label": "그냥 알려 주는 내용 같습니다",
          "fields": {
            "unclear_impliedRequest": "imp_notice",
            "unclear_requestHint": "hint_notice"
          }
        },
        {
          "value": "o4",
          "label": "연락하라는 말뿐입니다",
          "fields": {
            "unclear_impliedRequest": "imp_contact",
            "unclear_requestHint": "hint_contact"
          }
        },
        {
          "value": "o5",
          "label": "판단하기 어렵습니다",
          "fields": {
            "unclear_impliedRequest": "imp_unknown",
            "unclear_requestHint": "hint_unknown"
          }
        }
      ],
      "directFields": {
        "unclear_impliedRequest": "direct_input",
        "unclear_requestHint": "direct_input_detail"
      }
    },
    {
      "code": "Q10-N",
      "id": "unclear_q10_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류나 연락에 어떤 압박이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "압박 없이 안내만 있습니다",
          "fields": {
            "unclear_pressureType": "press_none",
            "unclear_pressureLevel": "lvl_none"
          }
        },
        {
          "value": "o2",
          "label": "기한 안에 하라는 안내만 있습니다",
          "fields": {
            "unclear_pressureType": "press_deadline",
            "unclear_pressureLevel": "lvl_low"
          }
        },
        {
          "value": "o3",
          "label": "연체료·가산금이나 법적 조치를 예고합니다",
          "fields": {
            "unclear_pressureType": "press_legal",
            "unclear_pressureLevel": "lvl_mid"
          }
        },
        {
          "value": "o4",
          "label": "지금 바로 하지 않으면 안 된다고 재촉합니다",
          "fields": {
            "unclear_pressureType": "press_rush",
            "unclear_pressureLevel": "lvl_mid"
          }
        },
        {
          "value": "o5",
          "label": "계좌 동결·체포·출국 금지 같은 강한 불이익을 말합니다",
          "fields": {
            "unclear_pressureType": "press_threat",
            "unclear_pressureLevel": "lvl_high"
          }
        },
        {
          "value": "o6",
          "label": "다른 사람에게 말하지 말고 비밀로 하라고 합니다",
          "fields": {
            "unclear_pressureType": "press_secret",
            "unclear_pressureLevel": "lvl_high"
          }
        }
      ],
      "directFields": {
        "unclear_pressureType": "direct_input",
        "unclear_pressureLevel": "direct_input_detail"
      }
    },
    {
      "code": "Q11-N",
      "id": "unclear_q11_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류나 안내의 기한은 어떻게 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "기한이 적혀 있지 않습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_none",
            "unclear_deadlineSource": "dls_none"
          }
        },
        {
          "value": "o2",
          "label": "서류에 날짜가 적혀 있고 아직 여유가 있습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_far",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o3",
          "label": "서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_near",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o4",
          "label": "서류에 적힌 기한이 이미 지났습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_passed",
            "unclear_deadlineSource": "dls_doc"
          }
        },
        {
          "value": "o5",
          "label": "메시지나 말로만 기한을 알려 줬습니다",
          "fields": {
            "unclear_deadlineStatus": "dl_verbal",
            "unclear_deadlineSource": "dls_message"
          }
        },
        {
          "value": "o6",
          "label": "기한이 있는 것 같은데 정확히 모릅니다",
          "fields": {
            "unclear_deadlineStatus": "dl_unclear",
            "unclear_deadlineSource": "dls_unknown"
          }
        }
      ],
      "directFields": {
        "unclear_deadlineStatus": "direct_input",
        "unclear_deadlineSource": "direct_input_detail"
      }
    },
    {
      "code": "Q12-N",
      "id": "unclear_q12_n",
      "route": "N",
      "phase": 2,
      "prompt": "지금까지 이 서류와 관련해 한 일이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "아무것도 하지 않았습니다",
          "fields": {
            "unclear_actionTaken": "act_nothing",
            "unclear_exposureLevel": "exp_none"
          }
        },
        {
          "value": "o2",
          "label": "보낸 곳에 문의만 했습니다",
          "fields": {
            "unclear_actionTaken": "act_asked",
            "unclear_exposureLevel": "exp_low"
          }
        },
        {
          "value": "o3",
          "label": "링크를 열었거나 앱을 설치했습니다",
          "fields": {
            "unclear_actionTaken": "act_clicked",
            "unclear_exposureLevel": "exp_mid"
          }
        },
        {
          "value": "o4",
          "label": "개인정보나 서류를 이미 보냈습니다",
          "fields": {
            "unclear_actionTaken": "act_sent_info",
            "unclear_exposureLevel": "exp_info"
          }
        },
        {
          "value": "o5",
          "label": "돈을 일부 또는 전부 보냈습니다",
          "fields": {
            "unclear_actionTaken": "act_sent_money",
            "unclear_exposureLevel": "exp_money"
          }
        },
        {
          "value": "o6",
          "label": "답장을 했거나 통화를 했습니다",
          "fields": {
            "unclear_actionTaken": "act_replied",
            "unclear_exposureLevel": "exp_contact"
          }
        }
      ],
      "directFields": {
        "unclear_actionTaken": "direct_input",
        "unclear_exposureLevel": "direct_input_detail"
      }
    },
    {
      "code": "Q13-N",
      "id": "unclear_q13_n",
      "route": "N",
      "phase": 2,
      "prompt": "남아 있는 자료는 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "서류 원본을 가지고 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_original",
            "unclear_evidenceState": "evs_strong"
          }
        },
        {
          "value": "o2",
          "label": "사진이나 캡처만 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_photo",
            "unclear_evidenceState": "evs_medium"
          }
        },
        {
          "value": "o3",
          "label": "문자·메신저·통화 기록이 남아 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_chat",
            "unclear_evidenceState": "evs_medium"
          }
        },
        {
          "value": "o4",
          "label": "송금 내역이나 영수증이 있습니다",
          "fields": {
            "unclear_evidenceKind": "ev_payment",
            "unclear_evidenceState": "evs_strong"
          }
        },
        {
          "value": "o5",
          "label": "일부를 잃어버렸거나 지웠습니다",
          "fields": {
            "unclear_evidenceKind": "ev_partial",
            "unclear_evidenceState": "evs_weak"
          }
        },
        {
          "value": "o6",
          "label": "남은 자료가 없습니다",
          "fields": {
            "unclear_evidenceKind": "ev_none",
            "unclear_evidenceState": "evs_weak"
          }
        }
      ],
      "directFields": {
        "unclear_evidenceKind": "direct_input",
        "unclear_evidenceState": "direct_input_detail"
      }
    }
  ],
  "firstResult": {
    "M": {
      "cards": [
        {
          "questionCode": "Q1-M",
          "title": "서류의 형태",
          "sentences": {
            "unclear_documentForm=paper_official|unclear_formGroup=form_formal": "종이 공문 형태로 받은 납부 관련 서류입니다",
            "unclear_documentForm=bill_form|unclear_formGroup=form_formal": "청구서·고지서 양식으로 받은 납부 관련 서류입니다",
            "unclear_documentForm=email_body|unclear_formGroup=form_digital": "이메일로 받은 납부 관련 서류입니다",
            "unclear_documentForm=chat_message|unclear_formGroup=form_digital": "문자나 메신저로 받은 납부 관련 서류입니다",
            "unclear_documentForm=link_code|unclear_formGroup=form_digital": "링크나 큐알 코드로 안내받은 납부 관련 서류입니다",
            "unclear_documentForm=verbal_only|unclear_formGroup=form_oral": "말로만 전해 들은 납부 관련 서류입니다"
          }
        },
        {
          "questionCode": "Q2-M",
          "title": "보낸 곳",
          "sentences": {
            "unclear_senderClaim=tax_authority|unclear_senderGroup=grp_public": "세무기관 이름으로 온 납부 관련 서류입니다",
            "unclear_senderClaim=police_court|unclear_senderGroup=grp_public": "공안·경찰·검찰·법원 이름으로 온 납부 관련 서류입니다",
            "unclear_senderClaim=local_admin|unclear_senderGroup=grp_public": "지방 행정기관 이름으로 온 납부 관련 서류입니다",
            "unclear_senderClaim=foreign_agency|unclear_senderGroup=grp_public": "출입국·노동 관련 기관 이름으로 온 납부 관련 서류입니다",
            "unclear_senderClaim=bank_claim|unclear_senderGroup=grp_finance": "은행·금융회사 이름으로 온 납부 관련 서류입니다",
            "unclear_senderClaim=company_claim|unclear_senderGroup=grp_private": "회사·통신·택배사 이름으로 온 납부 관련 서류입니다",
            "unclear_senderClaim=unnamed_claim|unclear_senderGroup=grp_unnamed": "보낸 곳이 분명하지 않은 납부 관련 서류입니다"
          }
        },
        {
          "questionCode": "Q3-M",
          "title": "연락이 이어진 흐름",
          "sentences": {
            "unclear_contactPattern=first_contact|unclear_contactFlow=flow_single": "오늘이나 어제 처음 받은 납부 관련 서류입니다",
            "unclear_contactPattern=once_earlier|unclear_contactFlow=flow_single": "며칠 전 한 번 받고 연락이 끊긴 납부 관련 서류입니다",
            "unclear_contactPattern=repeated_same|unclear_contactFlow=flow_repeat": "같은 내용이 반복해서 온 납부 관련 서류입니다",
            "unclear_contactPattern=escalating_tone|unclear_contactFlow=flow_escalate": "표현이 점점 강해진 납부 관련 서류입니다",
            "unclear_contactPattern=after_visit|unclear_contactFlow=flow_followup": "전화·방문 뒤에 이어서 받은 납부 관련 서류입니다",
            "unclear_contactPattern=after_request|unclear_contactFlow=flow_expected": "내가 신청·문의한 뒤에 받은 납부 관련 서류입니다"
          }
        }
      ],
      "verdicts": {
        "unclear_mainConcern=doubt_genuine|unclear_firstAction=next_sender": {
          "headline": "진짜 여부 확인이 먼저 필요한 납부 요구입니다",
          "body": "보낸 곳이 공식 자료와 같은지 확인하기 전에는 돈을 보내지 않는 것이 안전합니다. 서류에 적힌 번호가 아니라 공식 자료의 연락처로 확인해 보세요."
        },
        "unclear_mainConcern=doubt_owed|unclear_firstAction=next_basis": {
          "headline": "납부 의무의 근거 확인이 필요한 요구입니다",
          "body": "내야 하는 돈인지는 서류에 적힌 근거(조항·계약·부과 내역)로 따져 볼 수 있습니다. 근거가 적혀 있지 않다면 보낸 곳에 근거를 글로 요청해 보세요."
        },
        "unclear_mainConcern=doubt_amount|unclear_firstAction=next_basis": {
          "headline": "금액의 계산 근거 확인이 필요한 요구입니다",
          "body": "금액이 어떻게 계산되었는지 내역서나 계약과 대조해 보세요. 내역이 없다면 공식 경로로 산출 근거를 요청할 수 있습니다."
        },
        "unclear_mainConcern=doubt_deadline|unclear_firstAction=next_deadline": {
          "headline": "기한의 근거 확인이 급한 납부 요구입니다",
          "body": "기한이 서류에 적혀 있는지, 언제까지인지부터 확인하세요. 기한이 임박해도 확인 없이 송금하는 것은 피하고 날짜를 기록해 두세요."
        },
        "unclear_mainConcern=doubt_done|unclear_firstAction=next_stop": {
          "headline": "이미 응한 뒤라 추가 피해를 막는 것이 우선입니다",
          "body": "추가 요구가 오더라도 응하지 말고 송금·제출 내역과 대화를 그대로 보관하세요. 상황에 따라 은행·공식 기관 문의와 전문가 확인을 함께 살펴보세요."
        },
        "unclear_mainConcern=doubt_none|unclear_firstAction=next_keep": {
          "headline": "급하지 않게 차분히 확인해 볼 수 있는 서류입니다",
          "body": "요구 사항이 있는지부터 읽어 보고, 없다면 보관해 두어도 됩니다. 나중에 필요할 수 있으니 받은 날짜와 경로를 적어 두세요."
        }
      },
      "verdictQuestionCode": "Q4-M",
      "risks": {
        "rules": [
          {
            "clauses": [
              {
                "field": "unclear_actionTaken",
                "values": [
                  "act_sent_money",
                  "act_sent_info",
                  "act_clicked"
                ]
              },
              {
                "field": "unclear_exposureLevel",
                "values": [
                  "exp_money",
                  "exp_info",
                  "exp_mid"
                ]
              },
              {
                "field": "unclear_firstAction",
                "values": [
                  "next_stop"
                ]
              }
            ],
            "excludes": [],
            "sentence": "이미 돈이나 개인정보를 보냈거나 링크를 열었다면 추가 피해를 막는 조치가 가장 급합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_payee",
                "values": [
                  "payee_person",
                  "payee_online",
                  "payee_cash"
                ]
              },
              {
                "field": "unclear_paymentGroup",
                "values": [
                  "pay_online",
                  "pay_cash"
                ]
              }
            ],
            "excludes": [],
            "sentence": "개인 계좌·링크·현금으로 내라는 요구는 기관의 공식 납부 방법과 같은지 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_pressureType",
                "values": [
                  "press_threat",
                  "press_secret",
                  "press_rush"
                ]
              },
              {
                "field": "unclear_pressureLevel",
                "values": [
                  "lvl_high"
                ]
              },
              {
                "field": "unclear_contactFlow",
                "values": [
                  "flow_escalate",
                  "flow_repeat"
                ]
              }
            ],
            "excludes": [],
            "sentence": "강한 불이익을 말하거나 비밀·재촉을 요구하는 방식은 서두르게 만드는 신호일 수 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_senderGroup",
                "values": [
                  "grp_unnamed"
                ]
              },
              {
                "field": "unclear_formality",
                "values": [
                  "fm_informal",
                  "fm_link"
                ]
              },
              {
                "field": "unclear_identityMatch",
                "values": [
                  "id_generic",
                  "id_other"
                ]
              },
              {
                "field": "unclear_authenticityMark",
                "values": [
                  "mark_none",
                  "mark_personal_contact"
                ]
              },
              {
                "field": "unclear_aimHint",
                "values": [
                  "aim_misdirected"
                ]
              }
            ],
            "excludes": [],
            "sentence": "보낸 곳이나 내 정보가 분명하지 않아 진짜 서류인지부터 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_deadlineStatus",
                "values": [
                  "dl_near",
                  "dl_passed",
                  "dl_verbal"
                ]
              },
              {
                "field": "unclear_deadlineSource",
                "values": [
                  "dls_message"
                ]
              },
              {
                "field": "unclear_mainConcern",
                "values": [
                  "doubt_deadline"
                ]
              }
            ],
            "excludes": [],
            "sentence": "기한이 가깝거나 지났거나 말로만 전해졌다면 기한의 근거 서류부터 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_amountTier",
                "values": [
                  "tier_large",
                  "tier_xlarge",
                  "tier_unknown"
                ]
              },
              {
                "field": "unclear_amountScale",
                "values": [
                  "amt_over100m"
                ]
              },
              {
                "field": "unclear_moneyNature",
                "values": [
                  "nature_unstated"
                ]
              }
            ],
            "excludes": [],
            "sentence": "금액이 크거나 적혀 있지 않아 계산 근거를 서류로 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_evidenceState",
                "values": [
                  "evs_weak"
                ]
              },
              {
                "field": "unclear_evidenceKind",
                "values": [
                  "ev_none",
                  "ev_partial"
                ]
              }
            ],
            "excludes": [],
            "sentence": "남은 자료가 부족해 지금 가진 자료를 먼저 보관해 두어야 합니다"
          }
        ],
        "fallback": "입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 돈을 보내기 전에 보낸 곳과 근거를 확인하세요",
        "max": 4
      }
    },
    "D": {
      "cards": [
        {
          "questionCode": "Q1-D",
          "title": "서류의 형태",
          "sentences": {
            "unclear_documentForm=paper_official|unclear_formGroup=form_formal": "종이 공문 형태로 받은 제출·출석 관련 서류입니다",
            "unclear_documentForm=bill_form|unclear_formGroup=form_formal": "청구서·고지서 양식으로 받은 제출·출석 관련 서류입니다",
            "unclear_documentForm=email_body|unclear_formGroup=form_digital": "이메일로 받은 제출·출석 관련 서류입니다",
            "unclear_documentForm=chat_message|unclear_formGroup=form_digital": "문자나 메신저로 받은 제출·출석 관련 서류입니다",
            "unclear_documentForm=link_code|unclear_formGroup=form_digital": "링크나 큐알 코드로 안내받은 제출·출석 관련 서류입니다",
            "unclear_documentForm=verbal_only|unclear_formGroup=form_oral": "말로만 전해 들은 제출·출석 관련 서류입니다"
          }
        },
        {
          "questionCode": "Q2-D",
          "title": "보낸 곳",
          "sentences": {
            "unclear_senderClaim=tax_authority|unclear_senderGroup=grp_public": "세무기관 이름으로 온 제출·출석 관련 서류입니다",
            "unclear_senderClaim=police_court|unclear_senderGroup=grp_public": "공안·경찰·검찰·법원 이름으로 온 제출·출석 관련 서류입니다",
            "unclear_senderClaim=local_admin|unclear_senderGroup=grp_public": "지방 행정기관 이름으로 온 제출·출석 관련 서류입니다",
            "unclear_senderClaim=foreign_agency|unclear_senderGroup=grp_public": "출입국·노동 관련 기관 이름으로 온 제출·출석 관련 서류입니다",
            "unclear_senderClaim=bank_claim|unclear_senderGroup=grp_finance": "은행·금융회사 이름으로 온 제출·출석 관련 서류입니다",
            "unclear_senderClaim=company_claim|unclear_senderGroup=grp_private": "회사·통신·택배사 이름으로 온 제출·출석 관련 서류입니다",
            "unclear_senderClaim=unnamed_claim|unclear_senderGroup=grp_unnamed": "보낸 곳이 분명하지 않은 제출·출석 관련 서류입니다"
          }
        },
        {
          "questionCode": "Q3-D",
          "title": "연락이 이어진 흐름",
          "sentences": {
            "unclear_contactPattern=first_contact|unclear_contactFlow=flow_single": "오늘이나 어제 처음 받은 제출·출석 관련 서류입니다",
            "unclear_contactPattern=once_earlier|unclear_contactFlow=flow_single": "며칠 전 한 번 받고 연락이 끊긴 제출·출석 관련 서류입니다",
            "unclear_contactPattern=repeated_same|unclear_contactFlow=flow_repeat": "같은 내용이 반복해서 온 제출·출석 관련 서류입니다",
            "unclear_contactPattern=escalating_tone|unclear_contactFlow=flow_escalate": "표현이 점점 강해진 제출·출석 관련 서류입니다",
            "unclear_contactPattern=after_visit|unclear_contactFlow=flow_followup": "전화·방문 뒤에 이어서 받은 제출·출석 관련 서류입니다",
            "unclear_contactPattern=after_request|unclear_contactFlow=flow_expected": "내가 신청·문의한 뒤에 받은 제출·출석 관련 서류입니다"
          }
        }
      ],
      "verdicts": {
        "unclear_mainConcern=doubt_genuine|unclear_firstAction=next_sender": {
          "headline": "진짜 여부 확인이 먼저 필요한 제출·출석 요구입니다",
          "body": "서류를 보내거나 방문하기 전에 보낸 곳이 공식 자료와 같은지 확인하세요. 서류에 적힌 연락처가 아니라 공식 자료의 연락처를 쓰는 것이 안전합니다."
        },
        "unclear_mainConcern=doubt_what|unclear_firstAction=next_basis": {
          "headline": "요구 내용의 범위 확인이 필요한 제출 요구입니다",
          "body": "필요한 서류가 목록으로 적혀 있는지 먼저 확인하세요. 목록이 없다면 보낸 곳에 무엇을 내야 하는지 공식 경로로 문의할 수 있습니다."
        },
        "unclear_mainConcern=doubt_appear|unclear_firstAction=next_basis": {
          "headline": "출석 요구의 근거와 일정 확인이 필요한 상황입니다",
          "body": "출석 일시와 장소가 서류에 적혀 있는지, 공식 안내와 같은지 확인하세요. 안 갔을 때의 결과는 서류에 적힌 근거에 따라 달라지므로 내용을 정확히 읽어 보세요."
        },
        "unclear_mainConcern=doubt_deadline|unclear_firstAction=next_deadline": {
          "headline": "기한의 근거 확인이 급한 제출·출석 요구입니다",
          "body": "제출이나 출석 기한이 서류에 적혀 있는지부터 확인하세요. 기한이 가깝다면 서류 준비와 전문가 확인을 함께 살펴보세요."
        },
        "unclear_mainConcern=doubt_privacy|unclear_firstAction=next_sender": {
          "headline": "개인정보 제출 전에 요구가 공식인지 확인이 필요한 상황입니다",
          "body": "신분증이나 계좌 정보는 요구한 곳이 공식인지 확인하기 전에는 보내지 않는 것이 안전합니다. 꼭 필요한 항목만 내도 되는지도 문의해 보세요."
        },
        "unclear_mainConcern=doubt_done|unclear_firstAction=next_stop": {
          "headline": "이미 응한 뒤라 추가 응답 전에 정리가 필요한 상황입니다",
          "body": "무엇을 언제 보냈는지 사본과 함께 정리하고 추가 요구에는 응하기 전에 확인하세요. 필요하면 전문가와 함께 다음 단계를 살펴보세요."
        },
        "unclear_mainConcern=doubt_none|unclear_firstAction=next_keep": {
          "headline": "차분히 요구 내용을 확인해 볼 수 있는 서류입니다",
          "body": "무엇을 언제까지 하라는 것인지 읽어 보고 정리해 두세요. 나중에 필요하니 받은 날짜와 경로를 적어 두세요."
        }
      },
      "verdictQuestionCode": "Q4-D",
      "risks": {
        "rules": [
          {
            "clauses": [
              {
                "field": "unclear_actionTaken",
                "values": [
                  "act_sent_money",
                  "act_sent_info",
                  "act_clicked"
                ]
              },
              {
                "field": "unclear_exposureLevel",
                "values": [
                  "exp_money",
                  "exp_info",
                  "exp_mid"
                ]
              },
              {
                "field": "unclear_firstAction",
                "values": [
                  "next_stop"
                ]
              }
            ],
            "excludes": [],
            "sentence": "이미 개인정보나 서류를 보냈거나 링크를 열었다면 추가 피해를 막는 조치가 먼저입니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_requestTarget",
                "values": [
                  "tgt_id_docs"
                ]
              },
              {
                "field": "unclear_targetGroup",
                "values": [
                  "grp_personal"
                ]
              },
              {
                "field": "unclear_deliveryGroup",
                "values": [
                  "dgrp_digital"
                ]
              },
              {
                "field": "unclear_deliveryMethod",
                "values": [
                  "deliver_chat",
                  "deliver_call"
                ]
              }
            ],
            "excludes": [],
            "sentence": "신분 자료를 메신저나 온라인으로 내라는 요구라면 요구한 곳이 공식인지 먼저 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_pressureType",
                "values": [
                  "press_threat",
                  "press_secret",
                  "press_rush"
                ]
              },
              {
                "field": "unclear_pressureLevel",
                "values": [
                  "lvl_high"
                ]
              },
              {
                "field": "unclear_contactFlow",
                "values": [
                  "flow_escalate",
                  "flow_repeat"
                ]
              }
            ],
            "excludes": [],
            "sentence": "강한 불이익이나 비밀·재촉이 있는 요구는 서두르게 만드는 신호일 수 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_senderGroup",
                "values": [
                  "grp_unnamed"
                ]
              },
              {
                "field": "unclear_formality",
                "values": [
                  "fm_informal",
                  "fm_link"
                ]
              },
              {
                "field": "unclear_identityMatch",
                "values": [
                  "id_generic",
                  "id_other"
                ]
              },
              {
                "field": "unclear_authenticityMark",
                "values": [
                  "mark_none",
                  "mark_personal_contact"
                ]
              },
              {
                "field": "unclear_aimHint",
                "values": [
                  "aim_misdirected"
                ]
              }
            ],
            "excludes": [],
            "sentence": "보낸 곳이나 내 정보가 분명하지 않아 진짜 요구인지부터 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_requestSpecificity",
                "values": [
                  "spec_vague",
                  "spec_none",
                  "spec_contact_only"
                ]
              },
              {
                "field": "unclear_listQuality",
                "values": [
                  "list_vague",
                  "list_none",
                  "list_contact"
                ]
              },
              {
                "field": "unclear_mainConcern",
                "values": [
                  "doubt_what"
                ]
              }
            ],
            "excludes": [],
            "sentence": "무엇을 내야 하는지 분명하지 않아 공식 경로로 먼저 문의할 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_deadlineStatus",
                "values": [
                  "dl_near",
                  "dl_passed",
                  "dl_verbal",
                  "dl_unclear"
                ]
              },
              {
                "field": "unclear_deadlineSource",
                "values": [
                  "dls_message",
                  "dls_unknown"
                ]
              },
              {
                "field": "unclear_mainConcern",
                "values": [
                  "doubt_deadline"
                ]
              }
            ],
            "excludes": [],
            "sentence": "제출이나 출석 기한이 가깝거나 지났거나 불분명해 기한의 근거를 먼저 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_requestTarget",
                "values": [
                  "tgt_appear",
                  "tgt_online"
                ]
              }
            ],
            "excludes": [],
            "sentence": "직접 방문이나 사이트 접속을 요구하고 있어 장소와 주소가 공식 자료와 같은지 확인이 필요합니다"
          }
        ],
        "fallback": "입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 제출하기 전에 요구가 공식인지 확인하세요",
        "max": 4
      }
    },
    "N": {
      "cards": [
        {
          "questionCode": "Q1-N",
          "title": "서류의 형태",
          "sentences": {
            "unclear_documentForm=paper_official|unclear_formGroup=form_formal": "종이 공문 형태로 받은 내용이 불분명한 서류입니다",
            "unclear_documentForm=bill_form|unclear_formGroup=form_formal": "청구서·고지서 양식으로 받은 내용이 불분명한 서류입니다",
            "unclear_documentForm=email_body|unclear_formGroup=form_digital": "이메일로 받은 내용이 불분명한 서류입니다",
            "unclear_documentForm=chat_message|unclear_formGroup=form_digital": "문자나 메신저로 받은 내용이 불분명한 서류입니다",
            "unclear_documentForm=link_code|unclear_formGroup=form_digital": "링크나 큐알 코드로 안내받은 내용이 불분명한 서류입니다",
            "unclear_documentForm=verbal_only|unclear_formGroup=form_oral": "말로만 전해 들은 내용이 불분명한 서류입니다"
          }
        },
        {
          "questionCode": "Q2-N",
          "title": "보낸 곳",
          "sentences": {
            "unclear_senderClaim=tax_authority|unclear_senderGroup=grp_public": "세무기관 이름으로 온 내용이 불분명한 서류입니다",
            "unclear_senderClaim=police_court|unclear_senderGroup=grp_public": "공안·경찰·검찰·법원 이름으로 온 내용이 불분명한 서류입니다",
            "unclear_senderClaim=local_admin|unclear_senderGroup=grp_public": "지방 행정기관 이름으로 온 내용이 불분명한 서류입니다",
            "unclear_senderClaim=foreign_agency|unclear_senderGroup=grp_public": "출입국·노동 관련 기관 이름으로 온 내용이 불분명한 서류입니다",
            "unclear_senderClaim=bank_claim|unclear_senderGroup=grp_finance": "은행·금융회사 이름으로 온 내용이 불분명한 서류입니다",
            "unclear_senderClaim=company_claim|unclear_senderGroup=grp_private": "회사·통신·택배사 이름으로 온 내용이 불분명한 서류입니다",
            "unclear_senderClaim=unnamed_claim|unclear_senderGroup=grp_unnamed": "보낸 곳이 분명하지 않은 내용이 불분명한 서류입니다"
          }
        },
        {
          "questionCode": "Q3-N",
          "title": "연락이 이어진 흐름",
          "sentences": {
            "unclear_contactPattern=first_contact|unclear_contactFlow=flow_single": "오늘이나 어제 처음 받은 내용이 불분명한 서류입니다",
            "unclear_contactPattern=once_earlier|unclear_contactFlow=flow_single": "며칠 전 한 번 받고 연락이 끊긴 내용이 불분명한 서류입니다",
            "unclear_contactPattern=repeated_same|unclear_contactFlow=flow_repeat": "같은 내용이 반복해서 온 내용이 불분명한 서류입니다",
            "unclear_contactPattern=escalating_tone|unclear_contactFlow=flow_escalate": "표현이 점점 강해진 내용이 불분명한 서류입니다",
            "unclear_contactPattern=after_visit|unclear_contactFlow=flow_followup": "전화·방문 뒤에 이어서 받은 내용이 불분명한 서류입니다",
            "unclear_contactPattern=after_request|unclear_contactFlow=flow_expected": "내가 신청·문의한 뒤에 받은 내용이 불분명한 서류입니다"
          }
        }
      ],
      "verdicts": {
        "unclear_mainConcern=doubt_meaning|unclear_firstAction=next_understand": {
          "headline": "내용을 이해하는 것이 먼저 필요한 서류입니다",
          "body": "무슨 뜻인지 모르는 서류에는 일단 응하지 않고 내용을 이해하는 것이 먼저입니다. 제목, 보낸 곳, 날짜 세 가지부터 정리해 보세요."
        },
        "unclear_mainConcern=doubt_genuine|unclear_firstAction=next_sender": {
          "headline": "진짜 여부 확인이 필요한 불분명한 서류입니다",
          "body": "보낸 곳이 공식 자료와 같은지 확인하기 전에는 링크나 번호로 연락하지 않는 것이 안전합니다. 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요."
        },
        "unclear_mainConcern=doubt_respond|unclear_firstAction=next_understand": {
          "headline": "요구 사항이 있는지 구분하는 것이 필요한 서류입니다",
          "body": "서류에 해야 할 일이 적혀 있는지부터 구분해 보세요. 요구가 없다면 보관만 해도 되는 경우가 많습니다."
        },
        "unclear_mainConcern=doubt_missing|unclear_firstAction=next_deadline": {
          "headline": "놓친 내용이 없는지 앞뒤 자료와 함께 확인이 필요한 상황입니다",
          "body": "이 서류와 이어지는 이전 절차나 문의 기록이 있는지 함께 놓고 보세요. 날짜와 번호가 이어지는지 확인하면 연결이 보일 수 있습니다."
        },
        "unclear_mainConcern=doubt_done|unclear_firstAction=next_stop": {
          "headline": "이미 응한 뒤라 추가 응답 전에 확인이 필요한 상황입니다",
          "body": "무엇을 언제 보냈는지 정리해 두고 추가 연락에는 응하기 전에 확인하세요. 필요하면 전문가와 함께 살펴볼 수 있습니다."
        },
        "unclear_mainConcern=doubt_none|unclear_firstAction=next_keep": {
          "headline": "차분히 서류를 분류해 볼 수 있는 상황입니다",
          "body": "걱정이 크지 않다면 서류를 보관하고 어떤 서류인지 차근차근 분류해 보세요. 요구 사항이 없다면 급하게 움직일 필요는 없습니다."
        }
      },
      "verdictQuestionCode": "Q4-N",
      "risks": {
        "rules": [
          {
            "clauses": [
              {
                "field": "unclear_actionTaken",
                "values": [
                  "act_sent_money",
                  "act_sent_info",
                  "act_clicked"
                ]
              },
              {
                "field": "unclear_exposureLevel",
                "values": [
                  "exp_money",
                  "exp_info",
                  "exp_mid"
                ]
              },
              {
                "field": "unclear_firstAction",
                "values": [
                  "next_stop"
                ]
              }
            ],
            "excludes": [],
            "sentence": "이미 돈이나 정보를 보냈거나 링크를 열었다면 추가 응답 전에 상황 정리가 먼저입니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_senderGroup",
                "values": [
                  "grp_unnamed"
                ]
              },
              {
                "field": "unclear_formality",
                "values": [
                  "fm_informal",
                  "fm_link"
                ]
              },
              {
                "field": "unclear_identityMatch",
                "values": [
                  "id_generic",
                  "id_other"
                ]
              },
              {
                "field": "unclear_authenticityMark",
                "values": [
                  "mark_none",
                  "mark_personal_contact"
                ]
              },
              {
                "field": "unclear_aimHint",
                "values": [
                  "aim_misdirected"
                ]
              }
            ],
            "excludes": [],
            "sentence": "보낸 곳과 내 정보가 분명하지 않은 서류라 응하기 전에 발신처부터 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_understandingLevel",
                "values": [
                  "und_little",
                  "und_language",
                  "und_blurry"
                ]
              },
              {
                "field": "unclear_readability",
                "values": [
                  "read_hard",
                  "read_lang",
                  "read_blurry"
                ]
              },
              {
                "field": "unclear_mainConcern",
                "values": [
                  "doubt_meaning"
                ]
              }
            ],
            "excludes": [],
            "sentence": "내용을 충분히 이해하지 못한 상태라 핵심 부분부터 풀이하거나 번역받을 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_pressureType",
                "values": [
                  "press_threat",
                  "press_secret",
                  "press_rush",
                  "press_legal"
                ]
              },
              {
                "field": "unclear_contactFlow",
                "values": [
                  "flow_escalate",
                  "flow_repeat"
                ]
              }
            ],
            "excludes": [],
            "sentence": "경고 문구나 재촉이 있어 서두르지 말고 근거를 확인할 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_impliedRequest",
                "values": [
                  "imp_money",
                  "imp_submit",
                  "imp_contact"
                ]
              },
              {
                "field": "unclear_requestHint",
                "values": [
                  "hint_pay",
                  "hint_submit",
                  "hint_contact"
                ]
              },
              {
                "field": "unclear_elementGroup",
                "values": [
                  "eg_money",
                  "eg_contact"
                ]
              }
            ],
            "excludes": [],
            "sentence": "안내문처럼 보여도 돈·제출·연락을 요구하는 내용이 숨어 있을 수 있어 요구 사항을 따로 확인하세요"
          },
          {
            "clauses": [
              {
                "field": "unclear_deadlineStatus",
                "values": [
                  "dl_near",
                  "dl_passed",
                  "dl_verbal",
                  "dl_unclear"
                ]
              }
            ],
            "excludes": [],
            "sentence": "기한이 분명하지 않거나 가깝다면 서류에서 기한의 근거부터 찾아야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_evidenceState",
                "values": [
                  "evs_weak"
                ]
              },
              {
                "field": "unclear_evidenceKind",
                "values": [
                  "ev_none",
                  "ev_partial"
                ]
              }
            ],
            "excludes": [],
            "sentence": "남은 자료가 부족해 서류의 제목·보낸 곳·날짜를 먼저 글로 정리해 두어야 합니다"
          }
        ],
        "fallback": "입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 서류를 보관하고 어떤 서류인지 먼저 분류해 보세요",
        "max": 4
      }
    }
  },
  "phase2Result": {
    "M": [
      {
        "questionCode": "Q5-M",
        "title": "내 정보의 기재",
        "sentences": {
          "unclear_identityMatch=id_exact|unclear_aimHint=aim_specific": "내 정보가 정확히 적혀 있다면 실제 절차나 거래와 이어지는지 확인해 보세요. 정확하다고 해서 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요.",
          "unclear_identityMatch=id_partial|unclear_aimHint=aim_partial": "일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 어디서 나온 정보인지 보낸 쪽에 공식 경로로 물어볼 수 있습니다.",
          "unclear_identityMatch=id_generic|unclear_aimHint=aim_generic": "받는 사람이 특정되지 않은 서류는 여러 사람에게 같은 내용이 간 것일 수 있습니다. 내 사정과 맞는 내용인지부터 따져 보세요.",
          "unclear_identityMatch=id_other|unclear_aimHint=aim_misdirected": "다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요.",
          "unclear_identityMatch=id_unchecked|unclear_aimHint=aim_unchecked": "이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모해 두는 것이 확인의 시작입니다."
        }
      },
      {
        "questionCode": "Q6-M",
        "title": "공식 문서 요소",
        "sentences": {
          "unclear_authenticityMark=mark_full|unclear_formality=fm_formal": "공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 보낸 곳은 공식 자료로 대조하세요.",
          "unclear_authenticityMark=mark_partial|unclear_formality=fm_partial": "빠진 요소가 무엇인지 적어 두세요. 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다.",
          "unclear_authenticityMark=mark_none|unclear_formality=fm_informal": "공식 요소가 하나도 없는 문서는 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다.",
          "unclear_authenticityMark=mark_personal_contact|unclear_formality=fm_informal": "기관 대표 번호나 공식 주소가 아니라면 같은 이름의 기관이 맞는지 확인이 필요합니다. 기관의 공식 사이트에 나온 연락처와 비교하세요.",
          "unclear_authenticityMark=mark_link_only|unclear_formality=fm_link": "링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요.",
          "unclear_authenticityMark=mark_odd_text|unclear_formality=fm_odd": "공식 문서에는 보통 정해진 문체가 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요."
        }
      },
      {
        "questionCode": "Q7-M",
        "title": "돈의 성격",
        "sentences": {
          "unclear_moneyNature=nature_tax|unclear_moneyReviewLink=link_tax": "세금 명목이라면 납세 통지나 세무기관 공식 안내와 대조해 보세요. 세금 검토에서 이어서 확인할 수 있습니다.",
          "unclear_moneyNature=nature_fine|unclear_moneyReviewLink=link_admin": "부과 근거와 이의 제기 방법이 서류에 있는지 확인하세요. 행정문서 검토에서 이어서 볼 수 있습니다.",
          "unclear_moneyNature=nature_fee|unclear_moneyReviewLink=link_trade": "어떤 서비스에 대한 요금인지 계약이나 이용 내역과 맞는지 확인하세요. 이용한 적이 없다면 근거를 요청할 수 있습니다.",
          "unclear_moneyNature=nature_debt|unclear_moneyReviewLink=link_trade": "거래 서류와 입금 기록을 대조해 이미 낸 돈은 없는지 확인하세요. 확인 전에 서둘러 보내지 마세요.",
          "unclear_moneyNature=nature_deposit|unclear_moneyReviewLink=link_property": "약속한 계약이 서류로 있는지가 우선입니다. 임대나 매매와 관련되어 보이면 부동산 검토에서 이어서 확인할 수 있습니다.",
          "unclear_moneyNature=nature_unstated|unclear_moneyReviewLink=link_none": "명목 없이 돈만 요구한다면 무엇에 대한 돈인지 먼저 확인이 필요합니다. 명목을 글로 요청하고 답이 없다면 응하지 않는 것이 안전합니다."
        }
      },
      {
        "questionCode": "Q8-M",
        "title": "금액 규모",
        "sentences": {
          "unclear_amountScale=amt_under1m|unclear_amountTier=tier_small": "금액이 크지 않아도 근거 없이 내는 습관은 피하세요. 소액으로 시작해 점점 올리는 방식도 있어 근거 확인은 같습니다.",
          "unclear_amountScale=amt_1m_10m|unclear_amountTier=tier_medium": "중간 정도의 금액이라면 부과 근거와 계산 내역을 서류에서 먼저 확인하세요. 내역이 없다면 공식 경로로 요청하세요.",
          "unclear_amountScale=amt_10m_100m|unclear_amountTier=tier_large": "큰 금액은 송금 전에 근거 서류와 계약, 입금 기록을 모두 대조하는 것이 좋습니다. 확인이 끝나기 전에는 송금을 미루세요.",
          "unclear_amountScale=amt_over100m|unclear_amountTier=tier_xlarge": "매우 큰 금액은 단독으로 판단하지 말고 전문가 확인을 권합니다. 근거 서류와 상대 정보를 먼저 정리하세요.",
          "unclear_amountScale=amt_unstated|unclear_amountTier=tier_unknown": "금액이 없는 납부 요구는 계산 근거부터 확인이 필요합니다. 금액을 글로 요청하고 구두로 들은 금액은 날짜와 함께 기록하세요."
        }
      },
      {
        "questionCode": "Q9-M",
        "title": "입금 방식",
        "sentences": {
          "unclear_payee=payee_institution|unclear_paymentGroup=pay_account": "계좌 명의가 보낸 기관과 같은지, 공식 안내의 납부 방법과 같은지 확인하세요. 공식 안내는 해당 기관의 사이트에서 찾을 수 있습니다.",
          "unclear_payee=payee_company|unclear_paymentGroup=pay_account": "회사 계좌라면 그 회사와 실제 거래가 있었는지, 사업자 정보가 확인되는지 살펴보세요. 계약이나 청구 이력과 대조하세요.",
          "unclear_payee=payee_person|unclear_paymentGroup=pay_account": "기관이나 회사 명의가 아닌 개인 계좌로 보내라는 요구는 특히 확인이 필요합니다. 보내기 전에 보낸 곳의 공식 납부 방법을 확인하세요.",
          "unclear_payee=payee_online|unclear_paymentGroup=pay_online": "링크나 앱 결제는 열기 전에 주소와 설치 경로가 공식인지 확인이 필요합니다. 공식 사이트에 직접 접속해 같은 결제 안내가 있는지 보세요.",
          "unclear_payee=payee_cash|unclear_paymentGroup=pay_cash": "현금이나 상품권은 되돌리기 어렵고 기록이 남지 않아 신중해야 합니다. 보내기 전에 공식 경로로 확인하고 전문가 확인을 살펴보세요.",
          "unclear_payee=payee_unstated|unclear_paymentGroup=pay_none": "받는 곳이 없다면 연락을 유도하는 방식일 수 있어 주의가 필요합니다. 연락하기 전에 보낸 곳을 먼저 확인하세요."
        }
      },
      {
        "questionCode": "Q10-M",
        "title": "압박의 방식",
        "sentences": {
          "unclear_pressureType=press_none|unclear_pressureLevel=lvl_none": "압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요.",
          "unclear_pressureType=press_deadline|unclear_pressureLevel=lvl_low": "기한만 안내한 경우에는 그 기한의 근거가 서류에 있는지 확인하면 됩니다. 날짜를 기록해 두세요.",
          "unclear_pressureType=press_legal|unclear_pressureLevel=lvl_mid": "불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다.",
          "unclear_pressureType=press_rush|unclear_pressureLevel=lvl_mid": "재촉은 확인할 시간을 주지 않으려는 방식일 수 있어 주의가 필요합니다. 시간이 급해 보여도 보낸 곳 확인을 먼저 하세요.",
          "unclear_pressureType=press_threat|unclear_pressureLevel=lvl_high": "강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 응하기 전에 공식 연락처로 확인하고 대화는 그대로 보관하세요.",
          "unclear_pressureType=press_secret|unclear_pressureLevel=lvl_high": "비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의해 보세요."
        }
      },
      {
        "questionCode": "Q11-M",
        "title": "기한",
        "sentences": {
          "unclear_deadlineStatus=dl_none|unclear_deadlineSource=dls_none": "기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요.",
          "unclear_deadlineStatus=dl_far|unclear_deadlineSource=dls_doc": "서류에 기한이 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요.",
          "unclear_deadlineStatus=dl_near|unclear_deadlineSource=dls_doc": "기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 응하기 어려운 부분은 기한 연장이 가능한지 공식 경로로 문의하세요.",
          "unclear_deadlineStatus=dl_passed|unclear_deadlineSource=dls_doc": "기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요.",
          "unclear_deadlineStatus=dl_verbal|unclear_deadlineSource=dls_message": "서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요.",
          "unclear_deadlineStatus=dl_unclear|unclear_deadlineSource=dls_unknown": "기한이 분명하지 않다면 서류에서 날짜나 기간 표현을 먼저 찾아보세요. 찾을 수 없다면 보낸 곳에 기한이 있는지 확인이 필요합니다."
        }
      },
      {
        "questionCode": "Q12-M",
        "title": "이미 한 조치",
        "sentences": {
          "unclear_actionTaken=act_nothing|unclear_exposureLevel=exp_none": "아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요.",
          "unclear_actionTaken=act_asked|unclear_exposureLevel=exp_low": "문의만 했다면 문의한 날짜와 방법, 받은 답을 기록해 두세요. 서류에 적힌 연락처로 물었다면 그 연락처가 맞는지도 확인이 필요합니다.",
          "unclear_actionTaken=act_clicked|unclear_exposureLevel=exp_mid": "링크를 열었거나 앱을 설치했다면 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하세요.",
          "unclear_actionTaken=act_sent_info|unclear_exposureLevel=exp_info": "보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요.",
          "unclear_actionTaken=act_sent_money|unclear_exposureLevel=exp_money": "송금 내역과 받는 계좌 정보를 그대로 보관하고 가능한 한 빨리 은행에 문의하세요. 추가로 보내라는 요구가 와도 응하지 말고 사기 검토에서 이어서 확인할 수 있습니다.",
          "unclear_actionTaken=act_replied|unclear_exposureLevel=exp_contact": "무엇을 말했는지 날짜와 함께 정리해 두세요. 이후 연락이 오더라도 요구에 응하기 전에 보낸 곳 확인이 먼저입니다."
        }
      },
      {
        "questionCode": "Q13-M",
        "title": "남은 자료",
        "sentences": {
          "unclear_evidenceKind=ev_original|unclear_evidenceState=evs_strong": "원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 사용하세요.",
          "unclear_evidenceKind=ev_photo|unclear_evidenceState=evs_medium": "사진은 글자가 모두 보이고 날짜가 확인되도록 다시 정리해 두면 좋습니다. 가능하면 원본 확보 방법도 알아보세요.",
          "unclear_evidenceKind=ev_chat|unclear_evidenceState=evs_medium": "대화와 통화 기록은 날짜와 상대 번호가 보이게 그대로 보관하세요. 삭제하지 말고 화면을 순서대로 캡처해 두면 도움이 됩니다.",
          "unclear_evidenceKind=ev_payment|unclear_evidenceState=evs_strong": "송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 이후 확인과 문의에서 가장 중요하게 쓰입니다.",
          "unclear_evidenceKind=ev_partial|unclear_evidenceState=evs_weak": "잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요.",
          "unclear_evidenceKind=ev_none|unclear_evidenceState=evs_weak": "자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다."
        }
      }
    ],
    "D": [
      {
        "questionCode": "Q5-D",
        "title": "내 정보의 기재",
        "sentences": {
          "unclear_identityMatch=id_exact|unclear_aimHint=aim_specific": "내 정보가 정확히 적혀 있다면 실제 절차나 거래와 이어지는지 확인해 보세요. 정확하다고 해서 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요.",
          "unclear_identityMatch=id_partial|unclear_aimHint=aim_partial": "일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 어디서 나온 정보인지 보낸 쪽에 공식 경로로 물어볼 수 있습니다.",
          "unclear_identityMatch=id_generic|unclear_aimHint=aim_generic": "받는 사람이 특정되지 않은 서류는 여러 사람에게 같은 내용이 간 것일 수 있습니다. 내 사정과 맞는 내용인지부터 따져 보세요.",
          "unclear_identityMatch=id_other|unclear_aimHint=aim_misdirected": "다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요.",
          "unclear_identityMatch=id_unchecked|unclear_aimHint=aim_unchecked": "이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모해 두는 것이 확인의 시작입니다."
        }
      },
      {
        "questionCode": "Q6-D",
        "title": "공식 문서 요소",
        "sentences": {
          "unclear_authenticityMark=mark_full|unclear_formality=fm_formal": "공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 보낸 곳은 공식 자료로 대조하세요.",
          "unclear_authenticityMark=mark_partial|unclear_formality=fm_partial": "빠진 요소가 무엇인지 적어 두세요. 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다.",
          "unclear_authenticityMark=mark_none|unclear_formality=fm_informal": "공식 요소가 하나도 없는 문서는 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다.",
          "unclear_authenticityMark=mark_personal_contact|unclear_formality=fm_informal": "기관 대표 번호나 공식 주소가 아니라면 같은 이름의 기관이 맞는지 확인이 필요합니다. 기관의 공식 사이트에 나온 연락처와 비교하세요.",
          "unclear_authenticityMark=mark_link_only|unclear_formality=fm_link": "링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요.",
          "unclear_authenticityMark=mark_odd_text|unclear_formality=fm_odd": "공식 문서에는 보통 정해진 문체가 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요."
        }
      },
      {
        "questionCode": "Q7-D",
        "title": "요구하는 것",
        "sentences": {
          "unclear_requestTarget=tgt_id_docs|unclear_targetGroup=grp_personal": "신분 자료는 요구한 곳이 공식인지 확인한 뒤 필요한 항목만 내는 것이 안전합니다. 사본에는 용도를 적어 두는 방법도 있습니다.",
          "unclear_requestTarget=tgt_business_docs|unclear_targetGroup=grp_business": "사업 서류는 요구한 기관이 해당 서류를 요구할 권한이 있는지 확인하세요. 제출 전에 사본을 만들어 두세요.",
          "unclear_requestTarget=tgt_contract_docs|unclear_targetGroup=grp_contract": "계약·거래 서류 요구는 그 거래의 상대가 맞는지 확인하는 것이 먼저입니다. 부동산 거래와 관련되어 보이면 부동산 검토에서 이어서 확인할 수 있습니다.",
          "unclear_requestTarget=tgt_statement|unclear_targetGroup=grp_statement": "진술은 한번 내면 바꾸기 어려울 수 있어 내용을 신중히 정리하세요. 작성한 내용은 사본을 남기고 낼 곳을 먼저 확인하세요.",
          "unclear_requestTarget=tgt_appear|unclear_targetGroup=grp_appear": "일시와 장소가 공식 자료와 맞는지 확인하세요. 혼자 가기 어렵다면 동행이나 통역을 구하는 것도 방법입니다.",
          "unclear_requestTarget=tgt_online|unclear_targetGroup=grp_online": "접속 주소와 앱 설치 경로가 공식인지 먼저 확인하세요. 공식 사이트에 직접 접속해 같은 안내가 있는지 보세요."
        }
      },
      {
        "questionCode": "Q8-D",
        "title": "요구의 구체성",
        "sentences": {
          "unclear_requestSpecificity=spec_full|unclear_listQuality=list_clear": "목록과 양식이 갖춰져 있다면 같은 양식이 공식 자료에도 있는지 대조해 보세요. 빠진 서류가 없는지 내 보관 서류와 비교하세요.",
          "unclear_requestSpecificity=spec_list_only|unclear_listQuality=list_partial": "양식이 없다면 형식을 어떻게 맞출지 보낸 곳에 공식 경로로 확인하세요. 문의 내용은 기록해 두세요.",
          "unclear_requestSpecificity=spec_vague|unclear_listQuality=list_vague": "무엇을 내야 하는지 불분명한 요구는 구체적인 목록을 글로 요청하세요. 막연한 요구에 서류를 한꺼번에 보내는 것은 피하세요.",
          "unclear_requestSpecificity=spec_none|unclear_listQuality=list_none": "요구 내용이 없다면 요구의 근거부터 확인해야 합니다. 서류의 목적과 담당자를 글로 요청해 보세요.",
          "unclear_requestSpecificity=spec_contact_only|unclear_listQuality=list_contact": "연락만 하라는 서류는 연락을 유도하는 방식일 수 있습니다. 서류의 번호가 아닌 공식 연락처로 사실 여부를 먼저 확인하세요."
        }
      },
      {
        "questionCode": "Q9-D",
        "title": "제출·출석 방법",
        "sentences": {
          "unclear_deliveryMethod=deliver_visit|unclear_deliveryGroup=dgrp_formal": "방문 장소가 공식 자료에 나온 주소와 같은지 확인하세요. 방문 전에 필요한 서류와 시간을 다시 확인하세요.",
          "unclear_deliveryMethod=deliver_post|unclear_deliveryGroup=dgrp_formal": "우편이나 창구 접수라면 접수 증빙을 받아 두세요. 보낸 날짜와 수령 확인 자료를 보관하는 것이 좋습니다.",
          "unclear_deliveryMethod=deliver_chat|unclear_deliveryGroup=dgrp_digital": "이메일이나 메신저 제출은 받는 주소가 공식인지 확인이 필요합니다. 공식 자료에 나온 주소와 같은지 비교하세요.",
          "unclear_deliveryMethod=deliver_upload|unclear_deliveryGroup=dgrp_digital": "접속 주소가 공식 사이트인지 먼저 확인하세요. 공식 사이트에서 직접 찾아 들어가 같은 절차가 있는지 보세요.",
          "unclear_deliveryMethod=deliver_call|unclear_deliveryGroup=dgrp_digital": "통화로 서류나 정보를 말하는 것은 기록이 남지 않아 신중해야 합니다. 통화 요구는 서류로 다시 받을 수 있는지 요청하세요.",
          "unclear_deliveryMethod=deliver_unstated|unclear_deliveryGroup=dgrp_unspecified": "방법이 없다면 공식 방법을 먼저 확인해야 합니다. 보낸 곳의 공식 연락처로 제출 방법을 문의하세요."
        }
      },
      {
        "questionCode": "Q10-D",
        "title": "압박의 방식",
        "sentences": {
          "unclear_pressureType=press_none|unclear_pressureLevel=lvl_none": "압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요.",
          "unclear_pressureType=press_deadline|unclear_pressureLevel=lvl_low": "기한만 안내한 경우에는 그 기한의 근거가 서류에 있는지 확인하면 됩니다. 날짜를 기록해 두세요.",
          "unclear_pressureType=press_legal|unclear_pressureLevel=lvl_mid": "불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다.",
          "unclear_pressureType=press_rush|unclear_pressureLevel=lvl_mid": "재촉은 확인할 시간을 주지 않으려는 방식일 수 있어 주의가 필요합니다. 시간이 급해 보여도 보낸 곳 확인을 먼저 하세요.",
          "unclear_pressureType=press_threat|unclear_pressureLevel=lvl_high": "강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 응하기 전에 공식 연락처로 확인하고 대화는 그대로 보관하세요.",
          "unclear_pressureType=press_secret|unclear_pressureLevel=lvl_high": "비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의해 보세요."
        }
      },
      {
        "questionCode": "Q11-D",
        "title": "기한",
        "sentences": {
          "unclear_deadlineStatus=dl_none|unclear_deadlineSource=dls_none": "기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요.",
          "unclear_deadlineStatus=dl_far|unclear_deadlineSource=dls_doc": "서류에 기한이 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요.",
          "unclear_deadlineStatus=dl_near|unclear_deadlineSource=dls_doc": "기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 응하기 어려운 부분은 기한 연장이 가능한지 공식 경로로 문의하세요.",
          "unclear_deadlineStatus=dl_passed|unclear_deadlineSource=dls_doc": "기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요.",
          "unclear_deadlineStatus=dl_verbal|unclear_deadlineSource=dls_message": "서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요.",
          "unclear_deadlineStatus=dl_unclear|unclear_deadlineSource=dls_unknown": "기한이 분명하지 않다면 서류에서 날짜나 기간 표현을 먼저 찾아보세요. 찾을 수 없다면 보낸 곳에 기한이 있는지 확인이 필요합니다."
        }
      },
      {
        "questionCode": "Q12-D",
        "title": "이미 한 조치",
        "sentences": {
          "unclear_actionTaken=act_nothing|unclear_exposureLevel=exp_none": "아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요.",
          "unclear_actionTaken=act_asked|unclear_exposureLevel=exp_low": "문의만 했다면 문의한 날짜와 방법, 받은 답을 기록해 두세요. 서류에 적힌 연락처로 물었다면 그 연락처가 맞는지도 확인이 필요합니다.",
          "unclear_actionTaken=act_clicked|unclear_exposureLevel=exp_mid": "링크를 열었거나 앱을 설치했다면 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하세요.",
          "unclear_actionTaken=act_sent_info|unclear_exposureLevel=exp_info": "보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요.",
          "unclear_actionTaken=act_sent_money|unclear_exposureLevel=exp_money": "송금 내역과 받는 계좌 정보를 그대로 보관하고 가능한 한 빨리 은행에 문의하세요. 추가로 보내라는 요구가 와도 응하지 말고 사기 검토에서 이어서 확인할 수 있습니다.",
          "unclear_actionTaken=act_replied|unclear_exposureLevel=exp_contact": "무엇을 말했는지 날짜와 함께 정리해 두세요. 이후 연락이 오더라도 요구에 응하기 전에 보낸 곳 확인이 먼저입니다."
        }
      },
      {
        "questionCode": "Q13-D",
        "title": "남은 자료",
        "sentences": {
          "unclear_evidenceKind=ev_original|unclear_evidenceState=evs_strong": "원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 사용하세요.",
          "unclear_evidenceKind=ev_photo|unclear_evidenceState=evs_medium": "사진은 글자가 모두 보이고 날짜가 확인되도록 다시 정리해 두면 좋습니다. 가능하면 원본 확보 방법도 알아보세요.",
          "unclear_evidenceKind=ev_chat|unclear_evidenceState=evs_medium": "대화와 통화 기록은 날짜와 상대 번호가 보이게 그대로 보관하세요. 삭제하지 말고 화면을 순서대로 캡처해 두면 도움이 됩니다.",
          "unclear_evidenceKind=ev_payment|unclear_evidenceState=evs_strong": "송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 이후 확인과 문의에서 가장 중요하게 쓰입니다.",
          "unclear_evidenceKind=ev_partial|unclear_evidenceState=evs_weak": "잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요.",
          "unclear_evidenceKind=ev_none|unclear_evidenceState=evs_weak": "자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다."
        }
      }
    ],
    "N": [
      {
        "questionCode": "Q5-N",
        "title": "내 정보의 기재",
        "sentences": {
          "unclear_identityMatch=id_exact|unclear_aimHint=aim_specific": "내 정보가 정확히 적혀 있다면 실제 절차나 거래와 이어지는지 확인해 보세요. 정확하다고 해서 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요.",
          "unclear_identityMatch=id_partial|unclear_aimHint=aim_partial": "일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 어디서 나온 정보인지 보낸 쪽에 공식 경로로 물어볼 수 있습니다.",
          "unclear_identityMatch=id_generic|unclear_aimHint=aim_generic": "받는 사람이 특정되지 않은 서류는 여러 사람에게 같은 내용이 간 것일 수 있습니다. 내 사정과 맞는 내용인지부터 따져 보세요.",
          "unclear_identityMatch=id_other|unclear_aimHint=aim_misdirected": "다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요.",
          "unclear_identityMatch=id_unchecked|unclear_aimHint=aim_unchecked": "이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모해 두는 것이 확인의 시작입니다."
        }
      },
      {
        "questionCode": "Q6-N",
        "title": "공식 문서 요소",
        "sentences": {
          "unclear_authenticityMark=mark_full|unclear_formality=fm_formal": "공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 보낸 곳은 공식 자료로 대조하세요.",
          "unclear_authenticityMark=mark_partial|unclear_formality=fm_partial": "빠진 요소가 무엇인지 적어 두세요. 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다.",
          "unclear_authenticityMark=mark_none|unclear_formality=fm_informal": "공식 요소가 하나도 없는 문서는 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다.",
          "unclear_authenticityMark=mark_personal_contact|unclear_formality=fm_informal": "기관 대표 번호나 공식 주소가 아니라면 같은 이름의 기관이 맞는지 확인이 필요합니다. 기관의 공식 사이트에 나온 연락처와 비교하세요.",
          "unclear_authenticityMark=mark_link_only|unclear_formality=fm_link": "링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요.",
          "unclear_authenticityMark=mark_odd_text|unclear_formality=fm_odd": "공식 문서에는 보통 정해진 문체가 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요."
        }
      },
      {
        "questionCode": "Q7-N",
        "title": "이해 정도",
        "sentences": {
          "unclear_understandingLevel=und_most|unclear_readability=read_ok": "대부분 이해했다면 이해되지 않는 나머지 부분을 표시해 두세요. 그 부분이 핵심일 수 있어 확인이 필요합니다.",
          "unclear_understandingLevel=und_half|unclear_readability=read_ok": "이해한 부분과 모르는 부분을 나누어 적어 보세요. 모르는 부분만 전문가에게 가져가면 시간이 줄어듭니다.",
          "unclear_understandingLevel=und_little|unclear_readability=read_hard": "이해하지 못한 서류에는 응하지 않고 먼저 내용을 풀이받는 것이 안전합니다. 제목과 번호, 날짜를 먼저 정리하세요.",
          "unclear_understandingLevel=und_language|unclear_readability=read_lang": "중요한 부분부터 번역을 받아 원본과 함께 보관하세요. 번역은 한 부분씩 나누어 받으면 확인하기 쉽습니다.",
          "unclear_understandingLevel=und_blurry|unclear_readability=read_blurry": "글자가 모두 보이도록 밝은 곳에서 다시 찍어 두세요. 원본이 있다면 다시 확인할 수 있게 보관하세요."
        }
      },
      {
        "questionCode": "Q8-N",
        "title": "눈에 띄는 요소",
        "sentences": {
          "unclear_keyElement=key_law|unclear_elementGroup=eg_legal": "법령이나 조항 번호가 나온다면 그 조항이 무엇을 요구하는지 공식 자료로 확인해 보세요. 어떤 분야의 서류인지 분류에 도움이 됩니다.",
          "unclear_keyElement=key_agency|unclear_elementGroup=eg_agency": "기관 이름이 있다면 그 기관의 공식 연락처로 서류가 맞는지 확인할 수 있습니다. 서류에 적힌 연락처는 쓰지 마세요.",
          "unclear_keyElement=key_numbers|unclear_elementGroup=eg_numbers": "번호가 무엇의 번호인지부터 구분해 표시해 두세요. 번호는 이후 확인에서 가장 큰 단서가 됩니다.",
          "unclear_keyElement=key_money|unclear_elementGroup=eg_money": "금액이나 계좌가 보이는 서류는 돈을 요구하는 내용일 수 있습니다. 송금 전에 근거를 먼저 확인하세요.",
          "unclear_keyElement=key_date|unclear_elementGroup=eg_date": "날짜가 보인다면 기한인지, 단순 발행일인지 구분해 보세요. 기한이라면 그 근거부터 확인하세요.",
          "unclear_keyElement=key_contact|unclear_elementGroup=eg_contact": "내용 없이 연락처만 있다면 연락을 유도하는 방식일 수 있습니다. 연락하기 전에 공식 자료로 먼저 확인하세요."
        }
      },
      {
        "questionCode": "Q9-N",
        "title": "요구의 느낌",
        "sentences": {
          "unclear_impliedRequest=imp_money|unclear_requestHint=hint_pay": "돈을 요구하는 것 같다면 납부 관련 서류로 보고 보낸 곳과 근거를 먼저 확인하세요. 확인 전에는 송금하지 마세요.",
          "unclear_impliedRequest=imp_submit|unclear_requestHint=hint_submit": "제출이나 출석을 요구하는 것 같다면 무엇을 언제까지 해야 하는지 서류에서 찾아보세요. 공식 연락처로 사실 여부를 확인하세요.",
          "unclear_impliedRequest=imp_notice|unclear_requestHint=hint_notice": "안내 성격이라면 요구 사항이 없는지 한 번 더 읽어 보세요. 요구가 없다면 보관해 두어도 충분합니다.",
          "unclear_impliedRequest=imp_contact|unclear_requestHint=hint_contact": "연락만 하라는 서류는 연락하기 전에 보낸 곳 확인이 먼저입니다. 서류의 연락처가 아닌 공식 연락처를 쓰세요.",
          "unclear_impliedRequest=imp_unknown|unclear_requestHint=hint_unknown": "판단이 어렵다면 서류를 그대로 보관하고 제목·보낸 곳·날짜부터 정리하세요. 이후 전문가 진행에서 함께 분류할 수 있습니다."
        }
      },
      {
        "questionCode": "Q10-N",
        "title": "압박의 방식",
        "sentences": {
          "unclear_pressureType=press_none|unclear_pressureLevel=lvl_none": "압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요.",
          "unclear_pressureType=press_deadline|unclear_pressureLevel=lvl_low": "기한만 안내한 경우에는 그 기한의 근거가 서류에 있는지 확인하면 됩니다. 날짜를 기록해 두세요.",
          "unclear_pressureType=press_legal|unclear_pressureLevel=lvl_mid": "불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다.",
          "unclear_pressureType=press_rush|unclear_pressureLevel=lvl_mid": "재촉은 확인할 시간을 주지 않으려는 방식일 수 있어 주의가 필요합니다. 시간이 급해 보여도 보낸 곳 확인을 먼저 하세요.",
          "unclear_pressureType=press_threat|unclear_pressureLevel=lvl_high": "강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 응하기 전에 공식 연락처로 확인하고 대화는 그대로 보관하세요.",
          "unclear_pressureType=press_secret|unclear_pressureLevel=lvl_high": "비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의해 보세요."
        }
      },
      {
        "questionCode": "Q11-N",
        "title": "기한",
        "sentences": {
          "unclear_deadlineStatus=dl_none|unclear_deadlineSource=dls_none": "기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요.",
          "unclear_deadlineStatus=dl_far|unclear_deadlineSource=dls_doc": "서류에 기한이 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요.",
          "unclear_deadlineStatus=dl_near|unclear_deadlineSource=dls_doc": "기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 응하기 어려운 부분은 기한 연장이 가능한지 공식 경로로 문의하세요.",
          "unclear_deadlineStatus=dl_passed|unclear_deadlineSource=dls_doc": "기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요.",
          "unclear_deadlineStatus=dl_verbal|unclear_deadlineSource=dls_message": "서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요.",
          "unclear_deadlineStatus=dl_unclear|unclear_deadlineSource=dls_unknown": "기한이 분명하지 않다면 서류에서 날짜나 기간 표현을 먼저 찾아보세요. 찾을 수 없다면 보낸 곳에 기한이 있는지 확인이 필요합니다."
        }
      },
      {
        "questionCode": "Q12-N",
        "title": "이미 한 조치",
        "sentences": {
          "unclear_actionTaken=act_nothing|unclear_exposureLevel=exp_none": "아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요.",
          "unclear_actionTaken=act_asked|unclear_exposureLevel=exp_low": "문의만 했다면 문의한 날짜와 방법, 받은 답을 기록해 두세요. 서류에 적힌 연락처로 물었다면 그 연락처가 맞는지도 확인이 필요합니다.",
          "unclear_actionTaken=act_clicked|unclear_exposureLevel=exp_mid": "링크를 열었거나 앱을 설치했다면 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하세요.",
          "unclear_actionTaken=act_sent_info|unclear_exposureLevel=exp_info": "보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요.",
          "unclear_actionTaken=act_sent_money|unclear_exposureLevel=exp_money": "송금 내역과 받는 계좌 정보를 그대로 보관하고 가능한 한 빨리 은행에 문의하세요. 추가로 보내라는 요구가 와도 응하지 말고 사기 검토에서 이어서 확인할 수 있습니다.",
          "unclear_actionTaken=act_replied|unclear_exposureLevel=exp_contact": "무엇을 말했는지 날짜와 함께 정리해 두세요. 이후 연락이 오더라도 요구에 응하기 전에 보낸 곳 확인이 먼저입니다."
        }
      },
      {
        "questionCode": "Q13-N",
        "title": "남은 자료",
        "sentences": {
          "unclear_evidenceKind=ev_original|unclear_evidenceState=evs_strong": "원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 사용하세요.",
          "unclear_evidenceKind=ev_photo|unclear_evidenceState=evs_medium": "사진은 글자가 모두 보이고 날짜가 확인되도록 다시 정리해 두면 좋습니다. 가능하면 원본 확보 방법도 알아보세요.",
          "unclear_evidenceKind=ev_chat|unclear_evidenceState=evs_medium": "대화와 통화 기록은 날짜와 상대 번호가 보이게 그대로 보관하세요. 삭제하지 말고 화면을 순서대로 캡처해 두면 도움이 됩니다.",
          "unclear_evidenceKind=ev_payment|unclear_evidenceState=evs_strong": "송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 이후 확인과 문의에서 가장 중요하게 쓰입니다.",
          "unclear_evidenceKind=ev_partial|unclear_evidenceState=evs_weak": "잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요.",
          "unclear_evidenceKind=ev_none|unclear_evidenceState=evs_weak": "자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다."
        }
      }
    ]
  },
  "labels": {
    "act_asked": "보낸 곳에 문의함",
    "act_clicked": "링크 열람·앱 설치",
    "act_nothing": "아무것도 하지 않음",
    "act_replied": "답장·통화함",
    "act_sent_info": "개인정보·서류 제출",
    "act_sent_money": "송금함",
    "after_request": "내가 신청·문의한 뒤에 받음",
    "after_visit": "전화·방문 뒤에 받음",
    "aim_generic": "불특정 다수 대상일 수 있음",
    "aim_misdirected": "엉뚱한 수신일 수 있음",
    "aim_partial": "일부만 특정됨",
    "aim_specific": "나를 특정한 서류",
    "aim_unchecked": "확인 전",
    "amt_10m_100m": "1천만 동 이상 1억 동 미만",
    "amt_1m_10m": "100만 동 이상 1천만 동 미만",
    "amt_over100m": "1억 동 이상",
    "amt_under1m": "100만 동 미만",
    "amt_unstated": "금액이 적혀 있지 않음",
    "bank_claim": "은행·금융회사",
    "bill_form": "청구서·고지서 양식",
    "chat_message": "문자·메신저",
    "company_claim": "회사·통신·택배·플랫폼",
    "deliver_call": "전화·화상 통화",
    "deliver_chat": "이메일·메신저로 전달",
    "deliver_post": "우편·창구 접수",
    "deliver_unstated": "방법이 적혀 있지 않음",
    "deliver_upload": "웹사이트 업로드",
    "deliver_visit": "지정 장소 방문",
    "dgrp_digital": "전자 전달",
    "dgrp_formal": "대면·우편 접수",
    "dgrp_unspecified": "방법 불명",
    "direct_input": "직접 입력",
    "direct_input_detail": "직접 입력(상세)",
    "dl_far": "기한이 여유 있음",
    "dl_near": "기한이 가까움",
    "dl_none": "기한 표시 없음",
    "dl_passed": "기한이 이미 지남",
    "dl_unclear": "기한이 분명하지 않음",
    "dl_verbal": "말·메시지로만 기한을 들음",
    "dls_doc": "서류에 적혀 있음",
    "dls_message": "메시지·구두로만 들음",
    "dls_none": "어디에도 없음",
    "dls_unknown": "출처를 모름",
    "doubt_amount": "금액이 맞는지 모르겠음",
    "doubt_appear": "출석 여부가 걱정됨",
    "doubt_deadline": "기한을 놓칠까 걱정함",
    "doubt_done": "이미 응해서 불안함",
    "doubt_genuine": "진짜인지 모르겠음",
    "doubt_meaning": "무슨 뜻인지 모르겠음",
    "doubt_missing": "놓친 내용이 있을까 걱정함",
    "doubt_none": "크게 걱정하지 않음",
    "doubt_owed": "내야 하는지 모르겠음",
    "doubt_privacy": "개인정보 제출이 걱정됨",
    "doubt_respond": "응해야 하는지 모르겠음",
    "doubt_what": "무엇을 내야 하는지 모르겠음",
    "eg_agency": "기관 관련",
    "eg_contact": "연락처 관련",
    "eg_date": "기한 관련",
    "eg_legal": "법령 관련",
    "eg_money": "금전 관련",
    "eg_numbers": "번호 관련",
    "email_body": "이메일",
    "escalating_tone": "점점 강한 표현으로 바뀜",
    "ev_chat": "대화·통화 기록",
    "ev_none": "남은 자료 없음",
    "ev_original": "원본 보관",
    "ev_partial": "일부를 잃어버림",
    "ev_payment": "송금 내역·영수증",
    "ev_photo": "사진·캡처만 있음",
    "evs_medium": "자료가 일부 있음",
    "evs_strong": "자료가 충분함",
    "evs_weak": "자료가 부족함",
    "exp_contact": "연락이 이어진 상태",
    "exp_info": "개인정보 노출",
    "exp_low": "노출 적음",
    "exp_mid": "정보 노출 가능성",
    "exp_money": "금전 피해 가능성",
    "exp_none": "노출 없음",
    "first_contact": "처음 한 번 받음",
    "flow_escalate": "강도가 높아짐",
    "flow_expected": "내 요청과 이어짐",
    "flow_followup": "연락 뒤에 이어짐",
    "flow_repeat": "반복해서 받음",
    "flow_single": "한 번만 받음",
    "fm_formal": "형식을 갖춤",
    "fm_informal": "형식이 없음",
    "fm_link": "링크로만 연결됨",
    "fm_odd": "문체가 어색함",
    "fm_partial": "형식이 일부 부족함",
    "foreign_agency": "출입국·노동 관련 기관",
    "form_digital": "전자 메시지 형태",
    "form_formal": "정식 서류 형태",
    "form_oral": "말로만 전달됨",
    "grp_appear": "출석·방문",
    "grp_business": "사업 자료",
    "grp_contract": "계약·거래 자료",
    "grp_finance": "금융회사",
    "grp_online": "온라인 접속",
    "grp_personal": "개인 신분 자료",
    "grp_private": "민간 업체",
    "grp_public": "공공기관",
    "grp_statement": "설명·진술",
    "grp_unnamed": "보낸 곳이 불분명",
    "hint_contact": "연락 유도",
    "hint_notice": "안내 성격",
    "hint_pay": "납부 요구 가능성",
    "hint_submit": "제출·출석 요구 가능성",
    "hint_unknown": "판단 어려움",
    "id_exact": "내 정보가 정확히 맞음",
    "id_generic": "일반 호칭만 있음",
    "id_other": "다른 사람·회사 이름",
    "id_partial": "이름만 맞고 일부 다름",
    "id_unchecked": "아직 확인하지 않음",
    "imp_contact": "연락하라는 말뿐",
    "imp_money": "돈을 내라는 것 같음",
    "imp_notice": "알려 주는 내용 같음",
    "imp_submit": "서류·출석 요구 같음",
    "imp_unknown": "무엇을 요구하는지 모르겠음",
    "key_agency": "기관 이름",
    "key_contact": "링크·전화번호뿐",
    "key_date": "날짜·기한",
    "key_law": "법령 이름·조항 번호",
    "key_money": "금액·계좌번호",
    "key_numbers": "문서·사건·세금번호",
    "link_admin": "행정문서 검토와 연결",
    "link_code": "링크·큐알 코드 안내",
    "link_none": "연결할 분야가 불분명",
    "link_property": "부동산·계약 검토와 연결",
    "link_tax": "세금 검토와 연결",
    "link_trade": "계약·이용 내역 대조",
    "list_clear": "구체적",
    "list_contact": "연락 유도",
    "list_none": "없음",
    "list_partial": "일부만 구체적",
    "list_vague": "모호함",
    "local_admin": "지방 행정기관",
    "lvl_high": "높음",
    "lvl_low": "낮음",
    "lvl_mid": "중간",
    "lvl_none": "없음",
    "mark_full": "기관명·번호·날짜·직인이 모두 있음",
    "mark_link_only": "링크·큐알 코드로만 안내",
    "mark_none": "공식 요소가 없음",
    "mark_odd_text": "문장이 어색함",
    "mark_partial": "일부 요소만 있음",
    "mark_personal_contact": "개인 번호·일반 이메일",
    "nature_debt": "채무·거래 대금",
    "nature_deposit": "보증금·선납금·예치금",
    "nature_fee": "서비스 이용료·요금",
    "nature_fine": "벌금·과태료·행정 수수료",
    "nature_tax": "세금·세무 관련",
    "nature_unstated": "명목이 적혀 있지 않음",
    "next_basis": "먼저 근거 확인",
    "next_deadline": "먼저 기한 확인",
    "next_keep": "차분히 보관하고 확인",
    "next_sender": "먼저 보낸 곳 확인",
    "next_stop": "추가 응답을 멈추고 확인",
    "next_understand": "먼저 내용 이해",
    "notice_only": "알리는 내용 같음",
    "once_earlier": "며칠 전에 한 번 받음",
    "paper_official": "종이 공문",
    "pay": "돈을 내라는 내용 같음",
    "pay_account": "계좌 이체",
    "pay_cash": "현금성 수단",
    "pay_none": "방법 불명",
    "pay_online": "온라인 결제",
    "payee_cash": "현금·상품권",
    "payee_company": "회사 이름 계좌",
    "payee_institution": "기관 이름 계좌",
    "payee_online": "링크·큐알·앱 결제",
    "payee_person": "개인 이름 계좌",
    "payee_unstated": "받는 곳이 적혀 있지 않음",
    "police_court": "공안·경찰·검찰·법원",
    "press_deadline": "기한 안내",
    "press_legal": "법적 조치·가산금 예고",
    "press_none": "압박 없음",
    "press_rush": "지금 바로 하라고 재촉",
    "press_secret": "비밀 유지 요구",
    "press_threat": "계좌 동결·체포 등 강한 불이익",
    "read_blurry": "화질 문제",
    "read_hard": "읽기 어려움",
    "read_lang": "언어 장벽",
    "read_ok": "읽는 데 문제 없음",
    "repeated_same": "같은 내용을 반복해서 받음",
    "selected": "직접 선택함",
    "spec_contact_only": "연락만 요구",
    "spec_full": "목록·양식이 모두 있음",
    "spec_list_only": "목록만 있음",
    "spec_none": "내용이 적혀 있지 않음",
    "spec_vague": "'관련 서류'로만 적힘",
    "submit_or_appear": "서류 제출·출석 요구 같음",
    "tax_authority": "세무기관",
    "tgt_appear": "직접 출석·방문",
    "tgt_business_docs": "사업자·회사 서류",
    "tgt_contract_docs": "계약서·거래 서류",
    "tgt_id_docs": "신분증·여권·체류 서류",
    "tgt_online": "사이트 접속·앱 설치",
    "tgt_statement": "경위서·설명서",
    "tier_large": "큰 금액",
    "tier_medium": "중간 금액",
    "tier_small": "소액",
    "tier_unknown": "금액 불명",
    "tier_xlarge": "매우 큰 금액",
    "und_blurry": "사진이 흐리거나 잘림",
    "und_half": "절반쯤 이해함",
    "und_language": "외국어라 읽기 어려움",
    "und_little": "거의 이해하지 못함",
    "und_most": "대부분 이해함",
    "unnamed_claim": "보낸 곳이 없거나 개인",
    "unsure": "잘 모르겠음",
    "verbal_only": "전화·방문으로 말로 들음"
  },
  "connections": [
    {
      "name": "세금 검토",
      "condition": "`unclear_senderClaim` ∈ {tax_authority} 또는 `unclear_moneyReviewLink` ∈ {link_tax}",
      "sentence": "세금과 관련된 서류로 보인다면 세금 검토에서 이어서 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_senderClaim",
          "values": [
            "tax_authority"
          ]
        },
        {
          "field": "unclear_moneyReviewLink",
          "values": [
            "link_tax"
          ]
        }
      ]
    },
    {
      "name": "행정문서 검토",
      "condition": "`unclear_senderClaim` ∈ {local_admin, foreign_agency} 또는 `unclear_moneyReviewLink` ∈ {link_admin} 또는 `unclear_contactPattern` ∈ {after_request}",
      "sentence": "행정 절차와 관련된 서류로 보인다면 행정문서 검토에서 이어서 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_senderClaim",
          "values": [
            "local_admin",
            "foreign_agency"
          ]
        },
        {
          "field": "unclear_moneyReviewLink",
          "values": [
            "link_admin"
          ]
        },
        {
          "field": "unclear_contactPattern",
          "values": [
            "after_request"
          ]
        }
      ]
    },
    {
      "name": "부동산 검토",
      "condition": "`unclear_moneyReviewLink` ∈ {link_property} 또는 `unclear_requestTarget` ∈ {tgt_contract_docs}",
      "sentence": "부동산·계약과 관련된 서류로 보인다면 부동산 검토에서 이어서 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_moneyReviewLink",
          "values": [
            "link_property"
          ]
        },
        {
          "field": "unclear_requestTarget",
          "values": [
            "tgt_contract_docs"
          ]
        }
      ]
    },
    {
      "name": "사기 검토",
      "condition": "`unclear_senderClaim` ∈ {police_court} 또는 `unclear_exposureLevel` ∈ {exp_money, exp_info} 또는 `unclear_pressureLevel` ∈ {lvl_high}",
      "sentence": "사기나 사칭이 의심되는 상황일 수 있으니 사기 검토에서 이어서 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_senderClaim",
          "values": [
            "police_court"
          ]
        },
        {
          "field": "unclear_exposureLevel",
          "values": [
            "exp_money",
            "exp_info"
          ]
        },
        {
          "field": "unclear_pressureLevel",
          "values": [
            "lvl_high"
          ]
        }
      ]
    },
    {
      "name": "전문가 진행",
      "condition": "`unclear_deadlineStatus` ∈ {dl_passed} 또는 `unclear_amountTier` ∈ {tier_xlarge} 또는 `unclear_understandingLevel` ∈ {und_little, und_language}",
      "sentence": "기한이 지났거나 금액이 크거나 내용을 이해하기 어렵다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_deadlineStatus",
          "values": [
            "dl_passed"
          ]
        },
        {
          "field": "unclear_amountTier",
          "values": [
            "tier_xlarge"
          ]
        },
        {
          "field": "unclear_understandingLevel",
          "values": [
            "und_little",
            "und_language"
          ]
        }
      ]
    },
    {
      "name": "서류 첨부",
      "condition": "모든 결과 화면",
      "sentence": "받으신 서류를 첨부하면 더 정확히 확인할 수 있습니다.",
      "mode": "always",
      "clauses": []
    }
  ],
  "afterResultGuide": {
    "pre": [],
    "post": []
  },
  "directNotice": "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.",
  "reportFixed": {
    "missingFileNotice": "서류를 첨부하면 더 정확히 확인할 수 있습니다"
  },
  "reportGuide": {
    "title": "참고 사항",
    "subtitle": "고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.",
    "caption": "확인 기준일 2026.10.10 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.",
    "disclaimer": "위 내용은 일반 참고 정보이며, 서류의 진위나 법적 효력, 개별 사안의 책임을 판단하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다.",
    "firstMark": "먼저 확인",
    "fileCountTemplate": "접수된 자료: {n}건",
    "notice": {
      "title": "서류에 응하기 전에 먼저 할 것",
      "flow": "서류 원본 보관 → 날짜·기한 표시 확인 → 공식 연락처로 발신처 확인 → 응하기 전 전문가 확인",
      "chips": [
        "일반 실무"
      ],
      "items": [
        {
          "text": "받은 서류의 날짜, 보낸 곳, 기한 표시를 먼저 확인해 두세요.",
          "chips": [
            "3"
          ]
        },
        {
          "text": "서류에 적힌 번호나 링크가 아니라 공식 자료에 나온 연락처로 사실 여부를 확인하세요.",
          "chips": [
            "4"
          ]
        },
        {
          "text": "확인이 끝나기 전에는 돈이나 개인정보를 보내지 마세요.",
          "chips": [
            "일반 실무"
          ]
        }
      ]
    },
    "routes": {
      "M": {
        "checklist": {
          "title": "① 준비 자료 체크",
          "rows": [
            {
              "name": "받은 서류 원본 또는 캡처",
              "why": "금액, 계좌, 기한이 적힌 부분을 그대로 보존합니다.",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "name": "발신처 확인 기록",
              "why": "공식 연락처로 확인한 날짜와 답변을 남깁니다.",
              "chips": [
                "4"
              ]
            },
            {
              "name": "관련 계약서나 이용 내역",
              "why": "요구하는 돈이 실제 약속과 맞는지 대조합니다.",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "name": "세금 관련일 경우 세무기관 안내",
              "why": "납세 통지 내용과 비교합니다.",
              "chips": [
                "5",
                "6"
              ]
            },
            {
              "name": "이미 낸 돈이 있다면 송금 내역",
              "why": "날짜와 금액을 함께 정리합니다.",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        },
        "order": {
          "title": "② 확인 순서",
          "flow": "서류 보관 → 발신처 확인 → 금액 근거 확인 → 응하기 전 전문가에게 전달",
          "chips": [
            "일반 실무"
          ]
        },
        "compare": {
          "title": "③ 서류 간 대조표",
          "rows": [
            {
              "left": "서류의 발신 기관",
              "right": "공식 자료의 기관 정보",
              "point": "이름과 연락처가 같은지",
              "chips": [
                "4"
              ]
            },
            {
              "left": "요구 금액",
              "right": "계약·이용 내역",
              "point": "금액의 근거가 있는지",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "left": "입금 계좌 명의",
              "right": "발신 기관 이름",
              "point": "같은 곳인지",
              "chips": [
                "4"
              ]
            },
            {
              "left": "서류의 기한",
              "right": "받은 날짜",
              "point": "기한이 합리적인지",
              "chips": [
                "1"
              ]
            }
          ]
        },
        "timeline": {
          "title": "④ 시점별 정리",
          "flow": "서류를 받은 날 → 처음 연락한 날 → 요구한 기한 → 지금까지 한 조치",
          "chips": [
            "일반 실무"
          ],
          "note": "날짜를 순서대로 적어 두면 기한이 새로 생겼는지 알 수 있습니다.",
          "noteChips": [
            "일반 실무"
          ]
        },
        "misses": {
          "title": "⑤ 자주 놓치는 점",
          "items": [
            {
              "text": "기한이 가깝다는 말에 근거 서류를 확인하지 않고 송금한 경우",
              "chips": [
                "4"
              ]
            },
            {
              "text": "서류에 적힌 연락처로만 확인해 사실을 가리지 못한 경우",
              "chips": [
                "4"
              ]
            },
            {
              "text": "세무기관을 사칭한 납부 요구를 공식 경로로 확인하지 않은 경우",
              "chips": [
                "5",
                "6"
              ]
            }
          ]
        },
        "questions": {
          "title": "⑥ 전문가에게 가져갈 질문",
          "items": [
            {
              "text": "제가 받은 납부 요구가 진짜인지 어떤 순서로 확인하면 되나요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "이 금액의 근거가 맞는지 어떤 자료로 대조할 수 있나요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "이미 일부를 냈다면 어떤 자료를 가져가야 하나요?",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        }
      },
      "D": {
        "checklist": {
          "title": "① 준비 자료 체크",
          "rows": [
            {
              "name": "받은 서류 원본",
              "why": "제출·출석 요구가 적힌 부분과 기한을 그대로 보존합니다.",
              "chips": [
                "3"
              ]
            },
            {
              "name": "발신처 확인 기록",
              "why": "공식 연락처로 확인한 날짜와 답변을 남깁니다.",
              "chips": [
                "4"
              ]
            },
            {
              "name": "요구한 서류 목록",
              "why": "무엇을 어디에 내야 하는지 정리합니다.",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "name": "제출할 서류의 사본",
              "why": "내기 전에 사본을 먼저 만들어 둡니다.",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "name": "처분이나 결정이 있다면 결정서",
              "why": "이행 기간과 불복 기간 확인에 쓰입니다.",
              "chips": [
                "1",
                "2"
              ]
            }
          ]
        },
        "order": {
          "title": "② 확인 순서",
          "flow": "서류 보관 → 발신처 확인 → 요구 내용과 기한 확인 → 제출·출석 전 전문가에게 전달",
          "chips": [
            "일반 실무"
          ]
        },
        "compare": {
          "title": "③ 서류 간 대조표",
          "rows": [
            {
              "left": "서류의 발신 기관",
              "right": "공식 자료의 기관 정보",
              "point": "이름과 연락처가 같은지",
              "chips": [
                "4"
              ]
            },
            {
              "left": "서류의 구성 요소",
              "right": "공문의 기본 구성",
              "point": "기관명, 번호, 날짜, 직인이 있는지",
              "chips": [
                "3"
              ]
            },
            {
              "left": "출석 일시·장소",
              "right": "공식 안내",
              "point": "같은 곳인지",
              "chips": [
                "4"
              ]
            },
            {
              "left": "요구 서류 목록",
              "right": "내 보관 서류",
              "point": "빠진 것이 없는지",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        },
        "timeline": {
          "title": "④ 시점별 정리",
          "flow": "서류를 받은 날 → 확인한 날 → 제출·출석 기한 → 준비한 서류 → 낸 날",
          "chips": [
            "일반 실무"
          ],
          "note": "처분이 있는 서류라면 받은 날부터 이행·불복 기간을 따져야 할 수 있어 날짜가 중요합니다.",
          "noteChips": [
            "1",
            "2"
          ]
        },
        "misses": {
          "title": "⑤ 자주 놓치는 점",
          "items": [
            {
              "text": "무엇을 내야 하는지 분명하지 않은데 확인하지 않고 서류를 보낸 경우",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "서류의 기한이 가까운데 날짜를 기록하지 않은 경우",
              "chips": [
                "1"
              ]
            },
            {
              "text": "처분 서류를 받고 불복 기간을 확인하지 않은 경우",
              "chips": [
                "2"
              ]
            }
          ]
        },
        "questions": {
          "title": "⑥ 전문가에게 가져갈 질문",
          "items": [
            {
              "text": "이 제출·출석 요구가 공식인지 어떻게 확인하나요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "제출해야 할 서류와 낼 곳은 어디인가요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "기한이 지났다면 어떤 방법이 있나요?",
              "chips": [
                "1"
              ]
            }
          ]
        }
      },
      "N": {
        "checklist": {
          "title": "① 준비 자료 체크",
          "rows": [
            {
              "name": "받은 서류 원본 또는 캡처",
              "why": "제목, 보낸 곳, 날짜가 보이게 보존합니다.",
              "chips": [
                "3"
              ]
            },
            {
              "name": "서류에 나온 번호들",
              "why": "문서번호, 계좌, 사건번호를 구분해 표시합니다.",
              "chips": [
                "3"
              ]
            },
            {
              "name": "눈에 띄는 용어의 뜻",
              "why": "법령이나 기관 이름이 있으면 따로 적어 둡니다.",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "name": "번역본(필요한 경우)",
              "why": "중요한 부분부터 번역을 받아 원본과 함께 보관합니다.",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "name": "받은 경위 기록",
              "why": "언제 어디서 받았는지 적어 둡니다.",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        },
        "order": {
          "title": "② 확인 순서",
          "flow": "서류 보관 → 제목·보낸 곳·날짜 정리 → 분야 분류 → 해당 검토로 이어서 확인",
          "chips": [
            "일반 실무"
          ]
        },
        "compare": {
          "title": "③ 서류 간 대조표",
          "rows": [
            {
              "left": "서류의 제목",
              "right": "내용",
              "point": "무엇에 대한 서류인지",
              "chips": [
                "3"
              ]
            },
            {
              "left": "서류의 보낸 곳",
              "right": "공식 자료의 기관 정보",
              "point": "같은 곳인지",
              "chips": [
                "4"
              ]
            },
            {
              "left": "서류의 번호",
              "right": "내가 아는 사건·거래",
              "point": "연결되는 것이 있는지",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        },
        "timeline": {
          "title": "④ 시점별 정리",
          "flow": "서류를 받은 날 → 받기 전의 일 (절차, 문의, 거래) → 지금까지 한 일",
          "chips": [
            "일반 실무"
          ],
          "note": "받기 전의 일과 연결해 보면 어떤 분야의 서류인지 짐작할 수 있습니다.",
          "noteChips": [
            "일반 실무"
          ]
        },
        "misses": {
          "title": "⑤ 자주 놓치는 점",
          "items": [
            {
              "text": "내용을 모르는 서류의 링크를 눌러 개인정보를 입력한 경우",
              "chips": [
                "4"
              ]
            },
            {
              "text": "기한이 없는 안내문을 긴급한 요구로 오해해 서둘러 대응한 경우",
              "chips": [
                "4"
              ]
            },
            {
              "text": "받은 경위와 날짜를 기록하지 않은 경우",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        },
        "questions": {
          "title": "⑥ 전문가에게 가져갈 질문",
          "items": [
            {
              "text": "이 서류는 어떤 분야의 서류인가요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "응해야 하는 서류인지, 보관만 하면 되는지 어떻게 구분하나요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "번역이 필요하다면 어느 부분부터 받아야 하나요?",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        }
      }
    },
    "sources": {
      "confirmedOn": "2026.10.10",
      "rows": [
        {
          "id": "1",
          "name": "행정처리법 제15/2012/QH13호 제73조(결정의 이행: 받은 날부터 10일 이내)",
          "publisher": "베트남 국회",
          "kind": "법령(이차 자료로 확인)",
          "urls": [],
          "note": "원문 대조 필요. 제74조는 확인하지 못해 사용하지 않음"
        },
        {
          "id": "2",
          "name": "민원법 제02/2011/QH13호 제9조(민원 제기 기간 90일)",
          "publisher": "베트남 국회",
          "kind": "법령(이차 자료로 확인)",
          "urls": [
            "https://apolatlegal.com/laws/law-on-complaints-2011/"
          ],
          "note": "원문 대조 필요. 사안별 기간이 다를 수 있음"
        },
        {
          "id": "3",
          "name": "정부령 제30/2020/ND-CP호 제8조(공문의 구성 요소)",
          "publisher": "베트남 정부",
          "kind": "법령(이차 자료로 확인)",
          "urls": [],
          "note": "원문 대조 필요"
        },
        {
          "id": "4",
          "name": "공안부 사이버범죄 대응 부서(A05) 사기 수법 안내 (2020.10.13 기사)",
          "publisher": "베트남 공안부",
          "kind": "공식 기관 안내(기사 인용)",
          "urls": [],
          "note": "인증번호 요구 등 주의 안내. 원문 대조 필요"
        },
        {
          "id": "5",
          "name": "조세관리법 제38/2019/QH14호 제17조(납세자의 책임)",
          "publisher": "베트남 국회",
          "kind": "법령",
          "urls": [
            "https://english.luatvietnam.vn/aw-no-38-2019-qh14-dated-june-13-2019-of-the-national-assembly-on-tax-administration-174969-Doc1.html"
          ],
          "note": "세금 확정본 출처 2와 같은 자료"
        },
        {
          "id": "6",
          "name": "세무기관 사칭 사기 주의 안내 (세무총국 공문 제1353/TCT-DNNCN호 인용)",
          "publisher": "베트남 세무총국 (세관 신문 영문판 게재)",
          "kind": "공식 기관 안내",
          "urls": [
            "https://english.haiquanonline.com.vn/continue-to-warn-about-forms-of-fraud-against-taxpayers-30696.html"
          ],
          "note": "게재일 미표시. 공식 앱·포털·공개 연락처로만 확인"
        }
      ]
    }
  }
} as const;
