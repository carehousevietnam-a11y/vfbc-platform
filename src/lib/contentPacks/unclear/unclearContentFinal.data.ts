/* Generated from docs/master/content/UNCLEAR_CONTENT_FINAL.md. Do not edit sentences. */
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
      "prompt": "받은 서류는 어떤 모양이고, 돈에 대해 무엇이 적혀 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "공문 같은 통지서 형태이고, 금액이 적혀 있습니다",
          "fields": {
            "unclear_documentForm": "official_letter",
            "unclear_moneyMention": "amount_stated"
          }
        },
        {
          "value": "o2",
          "label": "청구서나 고지서 형태이고, 입금 계좌가 안내되어 있습니다",
          "fields": {
            "unclear_documentForm": "bill_like",
            "unclear_moneyMention": "account_given"
          }
        },
        {
          "value": "o3",
          "label": "문자나 메신저 내용이고, 금액이 분명하지 않습니다",
          "fields": {
            "unclear_documentForm": "message_text",
            "unclear_moneyMention": "amount_vague"
          }
        },
        {
          "value": "o4",
          "label": "이메일 내용이고, 수수료나 벌금 같은 표현이 있습니다",
          "fields": {
            "unclear_documentForm": "email_text",
            "unclear_moneyMention": "fee_hinted"
          }
        },
        {
          "value": "o5",
          "label": "형식을 알 수 없고, 금액이 적혀 있습니다",
          "fields": {
            "unclear_documentForm": "other_form",
            "unclear_moneyMention": "amount_stated"
          }
        }
      ],
      "directFields": {
        "unclear_documentForm": "direct_input",
        "unclear_moneyMention": "direct_input_detail"
      }
    },
    {
      "code": "Q2-M",
      "id": "unclear_q2_m",
      "route": "M",
      "phase": 1,
      "prompt": "이 서류는 누가, 어떤 방법으로 보낸 것 같나요?",
      "choices": [
        {
          "value": "o1",
          "label": "공공기관이 우편으로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "gov_office",
            "unclear_receivedChannel": "paper_mail"
          }
        },
        {
          "value": "o2",
          "label": "은행이나 금융회사가 이메일로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "bank_or_finance",
            "unclear_receivedChannel": "email"
          }
        },
        {
          "value": "o3",
          "label": "회사나 업체가 문자로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "company",
            "unclear_receivedChannel": "text_msg"
          }
        },
        {
          "value": "o4",
          "label": "개인에게 직접 전달받았습니다",
          "fields": {
            "unclear_senderType": "individual",
            "unclear_receivedChannel": "handed_over"
          }
        },
        {
          "value": "o5",
          "label": "누가 보냈는지 모르고, 메신저로 받았습니다",
          "fields": {
            "unclear_senderType": "unknown_origin",
            "unclear_receivedChannel": "messenger_app"
          }
        }
      ],
      "directFields": {
        "unclear_senderType": "direct_input",
        "unclear_receivedChannel": "direct_input_detail"
      }
    },
    {
      "code": "Q3-M",
      "id": "unclear_q3_m",
      "route": "M",
      "phase": 1,
      "prompt": "이 서류를 언제, 어떤 식으로 받으셨나요?",
      "choices": [
        {
          "value": "o1",
          "label": "오늘이나 어제 처음 받았습니다",
          "fields": {
            "unclear_receivedTime": "today_or_yesterday",
            "unclear_receivedPattern": "first_time"
          }
        },
        {
          "value": "o2",
          "label": "일주일 이내에 같은 내용을 반복해서 받았습니다",
          "fields": {
            "unclear_receivedTime": "within_week",
            "unclear_receivedPattern": "repeated"
          }
        },
        {
          "value": "o3",
          "label": "한 달 이내에 점점 강한 표현으로 바뀌었습니다",
          "fields": {
            "unclear_receivedTime": "within_month",
            "unclear_receivedPattern": "escalating"
          }
        },
        {
          "value": "o4",
          "label": "한 달이 넘었고, 전화나 방문 뒤에 받았습니다",
          "fields": {
            "unclear_receivedTime": "over_month",
            "unclear_receivedPattern": "after_call"
          }
        },
        {
          "value": "o5",
          "label": "일주일 이내에 받았고, 예상하고 있던 내용입니다",
          "fields": {
            "unclear_receivedTime": "within_week",
            "unclear_receivedPattern": "expected"
          }
        }
      ],
      "directFields": {
        "unclear_receivedTime": "direct_input",
        "unclear_receivedPattern": "direct_input_detail"
      }
    },
    {
      "code": "Q4-M",
      "id": "unclear_q4_m",
      "route": "M",
      "phase": 1,
      "prompt": "이 서류를 왜 받게 되었다고 생각하시나요? 가장 걱정되는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "예고 없이 받았고, 가짜일까 걱정됩니다",
          "fields": {
            "unclear_trigger": "arrived_unexpectedly",
            "unclear_worry": "worried_about_fake"
          }
        },
        {
          "value": "o2",
          "label": "어떤 절차를 한 뒤에 받았고, 내지 않으면 불이익이 있을까 걱정됩니다",
          "fields": {
            "unclear_trigger": "after_procedure",
            "unclear_worry": "worried_about_nonpayment"
          }
        },
        {
          "value": "o3",
          "label": "분쟁이나 문의 뒤에 받았고, 금액이 맞는지 걱정됩니다",
          "fields": {
            "unclear_trigger": "after_dispute",
            "unclear_worry": "worried_about_amount"
          }
        },
        {
          "value": "o4",
          "label": "사업이나 거래와 관련해 받았고, 기한을 놓칠까 걱정됩니다",
          "fields": {
            "unclear_trigger": "related_business",
            "unclear_worry": "worried_about_deadline"
          }
        },
        {
          "value": "o5",
          "label": "왜 받았는지 모르지만, 크게 걱정하지는 않습니다",
          "fields": {
            "unclear_trigger": "unknown_reason",
            "unclear_worry": "not_worried"
          }
        }
      ],
      "directFields": {
        "unclear_trigger": "direct_input",
        "unclear_worry": "direct_input_detail"
      }
    },
    {
      "code": "Q1-D",
      "id": "unclear_q1_d",
      "route": "D",
      "phase": 1,
      "prompt": "받은 서류는 어떤 모양이고, 무엇을 하라고 하나요?",
      "choices": [
        {
          "value": "o1",
          "label": "공문 같은 통지서 형태이고, 서류를 제출하라고 합니다",
          "fields": {
            "unclear_documentForm": "official_letter",
            "unclear_requestedAction": "submit_docs"
          }
        },
        {
          "value": "o2",
          "label": "청구서나 고지서 형태이고, 직접 출석하라고 합니다",
          "fields": {
            "unclear_documentForm": "bill_like",
            "unclear_requestedAction": "appear_in_person"
          }
        },
        {
          "value": "o3",
          "label": "문자나 메신저 내용이고, 서류를 고쳐서 다시 내라고 합니다",
          "fields": {
            "unclear_documentForm": "message_text",
            "unclear_requestedAction": "fix_docs"
          }
        },
        {
          "value": "o4",
          "label": "이메일 내용이고, 답장을 달라고 합니다",
          "fields": {
            "unclear_documentForm": "email_text",
            "unclear_requestedAction": "reply_needed"
          }
        },
        {
          "value": "o5",
          "label": "형식을 알 수 없고, 사이트에 접속하라고 합니다",
          "fields": {
            "unclear_documentForm": "other_form",
            "unclear_requestedAction": "visit_site"
          }
        }
      ],
      "directFields": {
        "unclear_documentForm": "direct_input",
        "unclear_requestedAction": "direct_input_detail"
      }
    },
    {
      "code": "Q2-D",
      "id": "unclear_q2_d",
      "route": "D",
      "phase": 1,
      "prompt": "이 서류는 누가, 어떤 방법으로 보낸 것 같나요?",
      "choices": [
        {
          "value": "o1",
          "label": "공공기관이 우편으로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "gov_office",
            "unclear_receivedChannel": "paper_mail"
          }
        },
        {
          "value": "o2",
          "label": "은행이나 금융회사가 이메일로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "bank_or_finance",
            "unclear_receivedChannel": "email"
          }
        },
        {
          "value": "o3",
          "label": "회사나 업체가 문자로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "company",
            "unclear_receivedChannel": "text_msg"
          }
        },
        {
          "value": "o4",
          "label": "개인에게 직접 전달받았습니다",
          "fields": {
            "unclear_senderType": "individual",
            "unclear_receivedChannel": "handed_over"
          }
        },
        {
          "value": "o5",
          "label": "누가 보냈는지 모르고, 메신저로 받았습니다",
          "fields": {
            "unclear_senderType": "unknown_origin",
            "unclear_receivedChannel": "messenger_app"
          }
        }
      ],
      "directFields": {
        "unclear_senderType": "direct_input",
        "unclear_receivedChannel": "direct_input_detail"
      }
    },
    {
      "code": "Q3-D",
      "id": "unclear_q3_d",
      "route": "D",
      "phase": 1,
      "prompt": "이 서류를 언제, 어떤 식으로 받으셨나요?",
      "choices": [
        {
          "value": "o1",
          "label": "오늘이나 어제 처음 받았습니다",
          "fields": {
            "unclear_receivedTime": "today_or_yesterday",
            "unclear_receivedPattern": "first_time"
          }
        },
        {
          "value": "o2",
          "label": "일주일 이내에 같은 내용을 반복해서 받았습니다",
          "fields": {
            "unclear_receivedTime": "within_week",
            "unclear_receivedPattern": "repeated"
          }
        },
        {
          "value": "o3",
          "label": "한 달 이내에 점점 강한 표현으로 바뀌었습니다",
          "fields": {
            "unclear_receivedTime": "within_month",
            "unclear_receivedPattern": "escalating"
          }
        },
        {
          "value": "o4",
          "label": "한 달이 넘었고, 전화나 방문 뒤에 받았습니다",
          "fields": {
            "unclear_receivedTime": "over_month",
            "unclear_receivedPattern": "after_call"
          }
        },
        {
          "value": "o5",
          "label": "일주일 이내에 받았고, 예상하고 있던 내용입니다",
          "fields": {
            "unclear_receivedTime": "within_week",
            "unclear_receivedPattern": "expected"
          }
        }
      ],
      "directFields": {
        "unclear_receivedTime": "direct_input",
        "unclear_receivedPattern": "direct_input_detail"
      }
    },
    {
      "code": "Q4-D",
      "id": "unclear_q4_d",
      "route": "D",
      "phase": 1,
      "prompt": "이 서류를 왜 받게 되었다고 생각하시나요? 가장 걱정되는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "예고 없이 받았고, 가짜일까 걱정됩니다",
          "fields": {
            "unclear_trigger": "arrived_unexpectedly",
            "unclear_worry": "worried_about_fake"
          }
        },
        {
          "value": "o2",
          "label": "어떤 절차를 한 뒤에 받았고, 따르지 않으면 불이익이 있을까 걱정됩니다",
          "fields": {
            "unclear_trigger": "after_procedure",
            "unclear_worry": "worried_about_noncompliance"
          }
        },
        {
          "value": "o3",
          "label": "분쟁이나 문의 뒤에 받았고, 어떤 서류를 내야 할지 걱정됩니다",
          "fields": {
            "unclear_trigger": "after_dispute",
            "unclear_worry": "worried_about_paper"
          }
        },
        {
          "value": "o4",
          "label": "사업이나 거래와 관련해 받았고, 기한을 놓칠까 걱정됩니다",
          "fields": {
            "unclear_trigger": "related_business",
            "unclear_worry": "worried_about_deadline"
          }
        },
        {
          "value": "o5",
          "label": "왜 받았는지 모르지만, 크게 걱정하지는 않습니다",
          "fields": {
            "unclear_trigger": "unknown_reason",
            "unclear_worry": "not_worried"
          }
        }
      ],
      "directFields": {
        "unclear_trigger": "direct_input",
        "unclear_worry": "direct_input_detail"
      }
    },
    {
      "code": "Q1-N",
      "id": "unclear_q1_n",
      "route": "N",
      "phase": 1,
      "prompt": "받은 서류는 어떤 모양이고, 내용은 얼마나 이해되나요?",
      "choices": [
        {
          "value": "o1",
          "label": "공문 같은 통지서 형태이고, 내용은 이해됩니다",
          "fields": {
            "unclear_documentForm": "official_letter",
            "unclear_contentClarity": "clear_notice"
          }
        },
        {
          "value": "o2",
          "label": "청구서나 고지서 형태이고, 일부만 이해됩니다",
          "fields": {
            "unclear_documentForm": "bill_like",
            "unclear_contentClarity": "partly_clear"
          }
        },
        {
          "value": "o3",
          "label": "문자나 메신저 내용이고, 어려운 용어가 많습니다",
          "fields": {
            "unclear_documentForm": "message_text",
            "unclear_contentClarity": "hard_terms"
          }
        },
        {
          "value": "o4",
          "label": "이메일 내용이고, 외국어로 되어 있습니다",
          "fields": {
            "unclear_documentForm": "email_text",
            "unclear_contentClarity": "foreign_language"
          }
        },
        {
          "value": "o5",
          "label": "형식을 알 수 없고, 읽기 어렵습니다",
          "fields": {
            "unclear_documentForm": "other_form",
            "unclear_contentClarity": "unreadable"
          }
        }
      ],
      "directFields": {
        "unclear_documentForm": "direct_input",
        "unclear_contentClarity": "direct_input_detail"
      }
    },
    {
      "code": "Q2-N",
      "id": "unclear_q2_n",
      "route": "N",
      "phase": 1,
      "prompt": "이 서류는 누가, 어떤 방법으로 보낸 것 같나요?",
      "choices": [
        {
          "value": "o1",
          "label": "공공기관이 우편으로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "gov_office",
            "unclear_receivedChannel": "paper_mail"
          }
        },
        {
          "value": "o2",
          "label": "은행이나 금융회사가 이메일로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "bank_or_finance",
            "unclear_receivedChannel": "email"
          }
        },
        {
          "value": "o3",
          "label": "회사나 업체가 문자로 보낸 것 같습니다",
          "fields": {
            "unclear_senderType": "company",
            "unclear_receivedChannel": "text_msg"
          }
        },
        {
          "value": "o4",
          "label": "개인에게 직접 전달받았습니다",
          "fields": {
            "unclear_senderType": "individual",
            "unclear_receivedChannel": "handed_over"
          }
        },
        {
          "value": "o5",
          "label": "누가 보냈는지 모르고, 메신저로 받았습니다",
          "fields": {
            "unclear_senderType": "unknown_origin",
            "unclear_receivedChannel": "messenger_app"
          }
        }
      ],
      "directFields": {
        "unclear_senderType": "direct_input",
        "unclear_receivedChannel": "direct_input_detail"
      }
    },
    {
      "code": "Q3-N",
      "id": "unclear_q3_n",
      "route": "N",
      "phase": 1,
      "prompt": "이 서류를 언제, 어떤 식으로 받으셨나요?",
      "choices": [
        {
          "value": "o1",
          "label": "오늘이나 어제 처음 받았습니다",
          "fields": {
            "unclear_receivedTime": "today_or_yesterday",
            "unclear_receivedPattern": "first_time"
          }
        },
        {
          "value": "o2",
          "label": "일주일 이내에 같은 내용을 반복해서 받았습니다",
          "fields": {
            "unclear_receivedTime": "within_week",
            "unclear_receivedPattern": "repeated"
          }
        },
        {
          "value": "o3",
          "label": "한 달 이내에 점점 강한 표현으로 바뀌었습니다",
          "fields": {
            "unclear_receivedTime": "within_month",
            "unclear_receivedPattern": "escalating"
          }
        },
        {
          "value": "o4",
          "label": "한 달이 넘었고, 전화나 방문 뒤에 받았습니다",
          "fields": {
            "unclear_receivedTime": "over_month",
            "unclear_receivedPattern": "after_call"
          }
        },
        {
          "value": "o5",
          "label": "일주일 이내에 받았고, 예상하고 있던 내용입니다",
          "fields": {
            "unclear_receivedTime": "within_week",
            "unclear_receivedPattern": "expected"
          }
        }
      ],
      "directFields": {
        "unclear_receivedTime": "direct_input",
        "unclear_receivedPattern": "direct_input_detail"
      }
    },
    {
      "code": "Q4-N",
      "id": "unclear_q4_n",
      "route": "N",
      "phase": 1,
      "prompt": "이 서류를 왜 받게 되었다고 생각하시나요? 가장 걱정되는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "예고 없이 받았고, 무슨 뜻인지 몰라 걱정됩니다",
          "fields": {
            "unclear_trigger": "arrived_unexpectedly",
            "unclear_worry": "worried_about_meaning"
          }
        },
        {
          "value": "o2",
          "label": "어떤 절차를 한 뒤에 받았고, 가짜일까 걱정됩니다",
          "fields": {
            "unclear_trigger": "after_procedure",
            "unclear_worry": "worried_about_fake"
          }
        },
        {
          "value": "o3",
          "label": "분쟁이나 문의 뒤에 받았고, 놓치는 것이 있을까 걱정됩니다",
          "fields": {
            "unclear_trigger": "after_dispute",
            "unclear_worry": "worried_about_missing"
          }
        },
        {
          "value": "o4",
          "label": "사업이나 거래와 관련해 받았고, 기한을 놓칠까 걱정됩니다",
          "fields": {
            "unclear_trigger": "related_business",
            "unclear_worry": "worried_about_deadline"
          }
        },
        {
          "value": "o5",
          "label": "왜 받았는지 모르지만, 크게 걱정하지는 않습니다",
          "fields": {
            "unclear_trigger": "unknown_reason",
            "unclear_worry": "not_worried"
          }
        }
      ],
      "directFields": {
        "unclear_trigger": "direct_input",
        "unclear_worry": "direct_input_detail"
      }
    },
    {
      "code": "Q5-M",
      "id": "unclear_q5_m",
      "route": "M",
      "phase": 2,
      "prompt": "서류를 보낸 곳은 어디까지 확인되었나요?",
      "choices": [
        {
          "value": "o1",
          "label": "발신처가 확인되었고, 공식 연락처로 직접 확인했습니다",
          "fields": {
            "unclear_senderCheck": "confirmed_sender",
            "unclear_senderCheckBasis": "official_contact_checked"
          }
        },
        {
          "value": "o2",
          "label": "일부만 확인되었고, 인터넷으로 찾아봤습니다",
          "fields": {
            "unclear_senderCheck": "partly_confirmed",
            "unclear_senderCheckBasis": "search_checked"
          }
        },
        {
          "value": "o3",
          "label": "확인되지 않았고, 보낸 쪽에 직접 물어봤습니다",
          "fields": {
            "unclear_senderCheck": "unconfirmed_sender",
            "unclear_senderCheckBasis": "asked_sender"
          }
        },
        {
          "value": "o4",
          "label": "가짜가 의심되는데, 아직 확인하지 않았습니다",
          "fields": {
            "unclear_senderCheck": "fake_suspected",
            "unclear_senderCheckBasis": "not_checked_yet"
          }
        },
        {
          "value": "o5",
          "label": "누가 보냈는지 확인되지 않았고, 아직 확인해 보지 않았습니다",
          "fields": {
            "unclear_senderCheck": "unconfirmed_sender",
            "unclear_senderCheckBasis": "not_checked_yet"
          }
        }
      ],
      "directFields": {
        "unclear_senderCheck": "direct_input",
        "unclear_senderCheckBasis": "direct_input_detail"
      }
    },
    {
      "code": "Q6-M",
      "id": "unclear_q6_m",
      "route": "M",
      "phase": 2,
      "prompt": "서류의 모양이나 문구에서 눈에 띄는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "직인과 문서번호가 있고, 형식이 갖춰져 있습니다",
          "fields": {
            "unclear_documentFeatures": "has_seal_number",
            "unclear_featureDetail": "formal_layout"
          }
        },
        {
          "value": "o2",
          "label": "직인이나 문서번호가 없고, 문장이 어색합니다",
          "fields": {
            "unclear_documentFeatures": "missing_seal_number",
            "unclear_featureDetail": "odd_wording"
          }
        },
        {
          "value": "o3",
          "label": "불이익을 경고하는 문구가 있고, 개인정보를 요구합니다",
          "fields": {
            "unclear_documentFeatures": "has_threat",
            "unclear_featureDetail": "personal_data_asked"
          }
        },
        {
          "value": "o4",
          "label": "링크나 전화번호만 안내하고, 별다른 특징은 없습니다",
          "fields": {
            "unclear_documentFeatures": "has_link_phone",
            "unclear_featureDetail": "no_detail"
          }
        },
        {
          "value": "o5",
          "label": "일반 안내문 형태이고, 형식은 갖춰져 있습니다",
          "fields": {
            "unclear_documentFeatures": "plain_notice",
            "unclear_featureDetail": "formal_layout"
          }
        }
      ],
      "directFields": {
        "unclear_documentFeatures": "direct_input",
        "unclear_featureDetail": "direct_input_detail"
      }
    },
    {
      "code": "Q7-M",
      "id": "unclear_q7_m",
      "route": "M",
      "phase": 2,
      "prompt": "요구하는 돈은 어떤 성격이고, 규모는 어느 정도인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "세금처럼 보이고, 100만 동 미만입니다",
          "fields": {
            "unclear_moneyNature": "tax_like",
            "unclear_amountScale": "amount_small"
          }
        },
        {
          "value": "o2",
          "label": "벌금이나 과태료처럼 보이고, 100만 동 이상 1천만 동 미만입니다",
          "fields": {
            "unclear_moneyNature": "fine_like",
            "unclear_amountScale": "amount_medium"
          }
        },
        {
          "value": "o3",
          "label": "수수료나 요금처럼 보이고, 100만 동 미만입니다",
          "fields": {
            "unclear_moneyNature": "fee_like",
            "unclear_amountScale": "amount_small"
          }
        },
        {
          "value": "o4",
          "label": "빚이나 대금처럼 보이고, 1천만 동 이상입니다",
          "fields": {
            "unclear_moneyNature": "debt_like",
            "unclear_amountScale": "amount_large"
          }
        },
        {
          "value": "o5",
          "label": "보증금이나 선납금처럼 보이고, 금액은 모릅니다",
          "fields": {
            "unclear_moneyNature": "deposit_like",
            "unclear_amountScale": "amount_unknown"
          }
        }
      ],
      "directFields": {
        "unclear_moneyNature": "direct_input",
        "unclear_amountScale": "direct_input_detail"
      }
    },
    {
      "code": "Q8-M",
      "id": "unclear_q8_m",
      "route": "M",
      "phase": 2,
      "prompt": "서류나 안내에 기한이 있나요? 있다면 어디에 적혀 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "기한 표시가 없고, 어디에도 적혀 있지 않습니다",
          "fields": {
            "unclear_deadlineStatus": "no_deadline",
            "unclear_deadlineSource": "not_stated"
          }
        },
        {
          "value": "o2",
          "label": "기한이 여유 있고, 서류에 적혀 있습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_far",
            "unclear_deadlineSource": "written_in_doc"
          }
        },
        {
          "value": "o3",
          "label": "기한이 가깝고, 메시지에만 적혀 있습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_near",
            "unclear_deadlineSource": "message_only"
          }
        },
        {
          "value": "o4",
          "label": "서류에 적힌 기한이 이미 지났습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_passed",
            "unclear_deadlineSource": "written_in_doc"
          }
        },
        {
          "value": "o5",
          "label": "기한이 분명하지 않고, 전화로만 들었습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_unclear",
            "unclear_deadlineSource": "said_by_phone"
          }
        }
      ],
      "directFields": {
        "unclear_deadlineStatus": "direct_input",
        "unclear_deadlineSource": "direct_input_detail"
      }
    },
    {
      "code": "Q9-M",
      "id": "unclear_q9_m",
      "route": "M",
      "phase": 2,
      "prompt": "지금까지 이 서류와 관련해 해 본 일이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "아직 아무것도 하지 않았습니다",
          "fields": {
            "unclear_actionTaken": "nothing_done",
            "unclear_actionResult": "na_result"
          }
        },
        {
          "value": "o2",
          "label": "보낸 쪽에 문의했지만 답을 받지 못했습니다",
          "fields": {
            "unclear_actionTaken": "contacted_sender",
            "unclear_actionResult": "no_answer"
          }
        },
        {
          "value": "o3",
          "label": "주변에 물어봤고 설명을 들었습니다",
          "fields": {
            "unclear_actionTaken": "asked_others",
            "unclear_actionResult": "got_explained"
          }
        },
        {
          "value": "o4",
          "label": "인터넷으로 찾아봤는데 서로 다른 말을 봤습니다",
          "fields": {
            "unclear_actionTaken": "searched_online",
            "unclear_actionResult": "conflicting_info"
          }
        },
        {
          "value": "o5",
          "label": "이미 답장했고, 결과는 아직 모릅니다",
          "fields": {
            "unclear_actionTaken": "replied",
            "unclear_actionResult": "unsure_result"
          }
        }
      ],
      "directFields": {
        "unclear_actionTaken": "direct_input",
        "unclear_actionResult": "direct_input_detail"
      }
    },
    {
      "code": "Q10-M",
      "id": "unclear_q10_m",
      "route": "M",
      "phase": 2,
      "prompt": "어떤 분야와 관련 있어 보이나요? 서류는 어떻게 가지고 계신가요?",
      "choices": [
        {
          "value": "o1",
          "label": "세금 관련 같고, 원본을 보관하고 있습니다",
          "fields": {
            "unclear_domainHint": "tax_related",
            "unclear_evidenceAvailable": "original_kept"
          }
        },
        {
          "value": "o2",
          "label": "행정 절차 관련 같고, 사진이나 캡처만 있습니다",
          "fields": {
            "unclear_domainHint": "admin_related",
            "unclear_evidenceAvailable": "photo_only"
          }
        },
        {
          "value": "o3",
          "label": "부동산 관련 같고, 일부를 잃어버렸습니다",
          "fields": {
            "unclear_domainHint": "property_related",
            "unclear_evidenceAvailable": "partly_lost"
          }
        },
        {
          "value": "o4",
          "label": "사기나 사칭이 의심되고, 사진이나 캡처만 있습니다",
          "fields": {
            "unclear_domainHint": "fraud_suspected",
            "unclear_evidenceAvailable": "photo_only"
          }
        },
        {
          "value": "o5",
          "label": "어떤 분야인지 모르고, 남은 것이 없습니다",
          "fields": {
            "unclear_domainHint": "domain_unknown",
            "unclear_evidenceAvailable": "nothing_kept"
          }
        }
      ],
      "directFields": {
        "unclear_domainHint": "direct_input",
        "unclear_evidenceAvailable": "direct_input_detail"
      }
    },
    {
      "code": "Q5-D",
      "id": "unclear_q5_d",
      "route": "D",
      "phase": 2,
      "prompt": "서류를 보낸 곳은 어디까지 확인되었나요?",
      "choices": [
        {
          "value": "o1",
          "label": "발신처가 확인되었고, 공식 연락처로 직접 확인했습니다",
          "fields": {
            "unclear_senderCheck": "confirmed_sender",
            "unclear_senderCheckBasis": "official_contact_checked"
          }
        },
        {
          "value": "o2",
          "label": "일부만 확인되었고, 인터넷으로 찾아봤습니다",
          "fields": {
            "unclear_senderCheck": "partly_confirmed",
            "unclear_senderCheckBasis": "search_checked"
          }
        },
        {
          "value": "o3",
          "label": "확인되지 않았고, 보낸 쪽에 직접 물어봤습니다",
          "fields": {
            "unclear_senderCheck": "unconfirmed_sender",
            "unclear_senderCheckBasis": "asked_sender"
          }
        },
        {
          "value": "o4",
          "label": "가짜가 의심되는데, 아직 확인하지 않았습니다",
          "fields": {
            "unclear_senderCheck": "fake_suspected",
            "unclear_senderCheckBasis": "not_checked_yet"
          }
        },
        {
          "value": "o5",
          "label": "누가 보냈는지 확인되지 않았고, 아직 확인해 보지 않았습니다",
          "fields": {
            "unclear_senderCheck": "unconfirmed_sender",
            "unclear_senderCheckBasis": "not_checked_yet"
          }
        }
      ],
      "directFields": {
        "unclear_senderCheck": "direct_input",
        "unclear_senderCheckBasis": "direct_input_detail"
      }
    },
    {
      "code": "Q6-D",
      "id": "unclear_q6_d",
      "route": "D",
      "phase": 2,
      "prompt": "서류의 모양이나 문구에서 눈에 띄는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "직인과 문서번호가 있고, 형식이 갖춰져 있습니다",
          "fields": {
            "unclear_documentFeatures": "has_seal_number",
            "unclear_featureDetail": "formal_layout"
          }
        },
        {
          "value": "o2",
          "label": "직인이나 문서번호가 없고, 문장이 어색합니다",
          "fields": {
            "unclear_documentFeatures": "missing_seal_number",
            "unclear_featureDetail": "odd_wording"
          }
        },
        {
          "value": "o3",
          "label": "불이익을 경고하는 문구가 있고, 개인정보를 요구합니다",
          "fields": {
            "unclear_documentFeatures": "has_threat",
            "unclear_featureDetail": "personal_data_asked"
          }
        },
        {
          "value": "o4",
          "label": "링크나 전화번호만 안내하고, 별다른 특징은 없습니다",
          "fields": {
            "unclear_documentFeatures": "has_link_phone",
            "unclear_featureDetail": "no_detail"
          }
        },
        {
          "value": "o5",
          "label": "일반 안내문 형태이고, 형식은 갖춰져 있습니다",
          "fields": {
            "unclear_documentFeatures": "plain_notice",
            "unclear_featureDetail": "formal_layout"
          }
        }
      ],
      "directFields": {
        "unclear_documentFeatures": "direct_input",
        "unclear_featureDetail": "direct_input_detail"
      }
    },
    {
      "code": "Q7-D",
      "id": "unclear_q7_d",
      "route": "D",
      "phase": 2,
      "prompt": "요구하는 것은 구체적으로 무엇이고, 얼마나 분명하게 적혀 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "신분증이나 증명 서류를 달라고 하고, 필요한 서류가 목록으로 있습니다",
          "fields": {
            "unclear_requestDetail": "id_docs",
            "unclear_requestSpecificity": "items_listed"
          }
        },
        {
          "value": "o2",
          "label": "사업 관련 서류를 달라고 하고, 무엇을 내야 할지 분명하지 않습니다",
          "fields": {
            "unclear_requestDetail": "business_docs",
            "unclear_requestSpecificity": "items_vague"
          }
        },
        {
          "value": "o3",
          "label": "양식을 작성하라고 하고, 낼 곳이 적혀 있습니다",
          "fields": {
            "unclear_requestDetail": "form_fill",
            "unclear_requestSpecificity": "where_stated"
          }
        },
        {
          "value": "o4",
          "label": "경위서나 설명서를 내라고 하고, 낼 곳이 분명하지 않습니다",
          "fields": {
            "unclear_requestDetail": "statement",
            "unclear_requestSpecificity": "where_unclear"
          }
        },
        {
          "value": "o5",
          "label": "출석하라고 하고, 필요한 서류가 목록으로 있습니다",
          "fields": {
            "unclear_requestDetail": "attendance",
            "unclear_requestSpecificity": "items_listed"
          }
        }
      ],
      "directFields": {
        "unclear_requestDetail": "direct_input",
        "unclear_requestSpecificity": "direct_input_detail"
      }
    },
    {
      "code": "Q8-D",
      "id": "unclear_q8_d",
      "route": "D",
      "phase": 2,
      "prompt": "서류나 안내에 기한이 있나요? 있다면 어디에 적혀 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "기한 표시가 없고, 어디에도 적혀 있지 않습니다",
          "fields": {
            "unclear_deadlineStatus": "no_deadline",
            "unclear_deadlineSource": "not_stated"
          }
        },
        {
          "value": "o2",
          "label": "기한이 여유 있고, 서류에 적혀 있습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_far",
            "unclear_deadlineSource": "written_in_doc"
          }
        },
        {
          "value": "o3",
          "label": "기한이 가깝고, 메시지에만 적혀 있습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_near",
            "unclear_deadlineSource": "message_only"
          }
        },
        {
          "value": "o4",
          "label": "서류에 적힌 기한이 이미 지났습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_passed",
            "unclear_deadlineSource": "written_in_doc"
          }
        },
        {
          "value": "o5",
          "label": "기한이 분명하지 않고, 전화로만 들었습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_unclear",
            "unclear_deadlineSource": "said_by_phone"
          }
        }
      ],
      "directFields": {
        "unclear_deadlineStatus": "direct_input",
        "unclear_deadlineSource": "direct_input_detail"
      }
    },
    {
      "code": "Q9-D",
      "id": "unclear_q9_d",
      "route": "D",
      "phase": 2,
      "prompt": "지금까지 이 서류와 관련해 해 본 일이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "아직 아무것도 하지 않았습니다",
          "fields": {
            "unclear_actionTaken": "nothing_done",
            "unclear_actionResult": "na_result"
          }
        },
        {
          "value": "o2",
          "label": "보낸 쪽에 문의했지만 답을 받지 못했습니다",
          "fields": {
            "unclear_actionTaken": "contacted_sender",
            "unclear_actionResult": "no_answer"
          }
        },
        {
          "value": "o3",
          "label": "주변에 물어봤고 설명을 들었습니다",
          "fields": {
            "unclear_actionTaken": "asked_others",
            "unclear_actionResult": "got_explained"
          }
        },
        {
          "value": "o4",
          "label": "인터넷으로 찾아봤는데 서로 다른 말을 봤습니다",
          "fields": {
            "unclear_actionTaken": "searched_online",
            "unclear_actionResult": "conflicting_info"
          }
        },
        {
          "value": "o5",
          "label": "이미 답장했고, 결과는 아직 모릅니다",
          "fields": {
            "unclear_actionTaken": "replied",
            "unclear_actionResult": "unsure_result"
          }
        }
      ],
      "directFields": {
        "unclear_actionTaken": "direct_input",
        "unclear_actionResult": "direct_input_detail"
      }
    },
    {
      "code": "Q10-D",
      "id": "unclear_q10_d",
      "route": "D",
      "phase": 2,
      "prompt": "어떤 분야와 관련 있어 보이나요? 서류는 어떻게 가지고 계신가요?",
      "choices": [
        {
          "value": "o1",
          "label": "세금 관련 같고, 원본을 보관하고 있습니다",
          "fields": {
            "unclear_domainHint": "tax_related",
            "unclear_evidenceAvailable": "original_kept"
          }
        },
        {
          "value": "o2",
          "label": "행정 절차 관련 같고, 사진이나 캡처만 있습니다",
          "fields": {
            "unclear_domainHint": "admin_related",
            "unclear_evidenceAvailable": "photo_only"
          }
        },
        {
          "value": "o3",
          "label": "부동산 관련 같고, 일부를 잃어버렸습니다",
          "fields": {
            "unclear_domainHint": "property_related",
            "unclear_evidenceAvailable": "partly_lost"
          }
        },
        {
          "value": "o4",
          "label": "사기나 사칭이 의심되고, 사진이나 캡처만 있습니다",
          "fields": {
            "unclear_domainHint": "fraud_suspected",
            "unclear_evidenceAvailable": "photo_only"
          }
        },
        {
          "value": "o5",
          "label": "어떤 분야인지 모르고, 남은 것이 없습니다",
          "fields": {
            "unclear_domainHint": "domain_unknown",
            "unclear_evidenceAvailable": "nothing_kept"
          }
        }
      ],
      "directFields": {
        "unclear_domainHint": "direct_input",
        "unclear_evidenceAvailable": "direct_input_detail"
      }
    },
    {
      "code": "Q5-N",
      "id": "unclear_q5_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류를 보낸 곳은 어디까지 확인되었나요?",
      "choices": [
        {
          "value": "o1",
          "label": "발신처가 확인되었고, 공식 연락처로 직접 확인했습니다",
          "fields": {
            "unclear_senderCheck": "confirmed_sender",
            "unclear_senderCheckBasis": "official_contact_checked"
          }
        },
        {
          "value": "o2",
          "label": "일부만 확인되었고, 인터넷으로 찾아봤습니다",
          "fields": {
            "unclear_senderCheck": "partly_confirmed",
            "unclear_senderCheckBasis": "search_checked"
          }
        },
        {
          "value": "o3",
          "label": "확인되지 않았고, 보낸 쪽에 직접 물어봤습니다",
          "fields": {
            "unclear_senderCheck": "unconfirmed_sender",
            "unclear_senderCheckBasis": "asked_sender"
          }
        },
        {
          "value": "o4",
          "label": "가짜가 의심되는데, 아직 확인하지 않았습니다",
          "fields": {
            "unclear_senderCheck": "fake_suspected",
            "unclear_senderCheckBasis": "not_checked_yet"
          }
        },
        {
          "value": "o5",
          "label": "누가 보냈는지 확인되지 않았고, 아직 확인해 보지 않았습니다",
          "fields": {
            "unclear_senderCheck": "unconfirmed_sender",
            "unclear_senderCheckBasis": "not_checked_yet"
          }
        }
      ],
      "directFields": {
        "unclear_senderCheck": "direct_input",
        "unclear_senderCheckBasis": "direct_input_detail"
      }
    },
    {
      "code": "Q6-N",
      "id": "unclear_q6_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류의 모양이나 문구에서 눈에 띄는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "직인과 문서번호가 있고, 형식이 갖춰져 있습니다",
          "fields": {
            "unclear_documentFeatures": "has_seal_number",
            "unclear_featureDetail": "formal_layout"
          }
        },
        {
          "value": "o2",
          "label": "직인이나 문서번호가 없고, 문장이 어색합니다",
          "fields": {
            "unclear_documentFeatures": "missing_seal_number",
            "unclear_featureDetail": "odd_wording"
          }
        },
        {
          "value": "o3",
          "label": "불이익을 경고하는 문구가 있고, 개인정보를 요구합니다",
          "fields": {
            "unclear_documentFeatures": "has_threat",
            "unclear_featureDetail": "personal_data_asked"
          }
        },
        {
          "value": "o4",
          "label": "링크나 전화번호만 안내하고, 별다른 특징은 없습니다",
          "fields": {
            "unclear_documentFeatures": "has_link_phone",
            "unclear_featureDetail": "no_detail"
          }
        },
        {
          "value": "o5",
          "label": "일반 안내문 형태이고, 형식은 갖춰져 있습니다",
          "fields": {
            "unclear_documentFeatures": "plain_notice",
            "unclear_featureDetail": "formal_layout"
          }
        }
      ],
      "directFields": {
        "unclear_documentFeatures": "direct_input",
        "unclear_featureDetail": "direct_input_detail"
      }
    },
    {
      "code": "Q7-N",
      "id": "unclear_q7_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류 내용을 얼마나 이해하셨나요? 눈에 띄는 용어가 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "대부분 이해했고, 법령 이름이 나옵니다",
          "fields": {
            "unclear_understandingLevel": "understood_most",
            "unclear_keyTermsSeen": "law_terms"
          }
        },
        {
          "value": "o2",
          "label": "절반쯤 이해했고, 기관 이름이 나옵니다",
          "fields": {
            "unclear_understandingLevel": "understood_half",
            "unclear_keyTermsSeen": "agency_names"
          }
        },
        {
          "value": "o3",
          "label": "거의 이해하지 못했고, 숫자나 번호만 나옵니다",
          "fields": {
            "unclear_understandingLevel": "understood_little",
            "unclear_keyTermsSeen": "numbers_only"
          }
        },
        {
          "value": "o4",
          "label": "번역이 필요하고, 눈에 띄는 용어가 없습니다",
          "fields": {
            "unclear_understandingLevel": "needs_translation",
            "unclear_keyTermsSeen": "no_key_terms"
          }
        },
        {
          "value": "o5",
          "label": "거의 이해하지 못했고, 기관 이름이 나옵니다",
          "fields": {
            "unclear_understandingLevel": "understood_little",
            "unclear_keyTermsSeen": "agency_names"
          }
        }
      ],
      "directFields": {
        "unclear_understandingLevel": "direct_input",
        "unclear_keyTermsSeen": "direct_input_detail"
      }
    },
    {
      "code": "Q8-N",
      "id": "unclear_q8_n",
      "route": "N",
      "phase": 2,
      "prompt": "서류나 안내에 기한이 있나요? 있다면 어디에 적혀 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "기한 표시가 없고, 어디에도 적혀 있지 않습니다",
          "fields": {
            "unclear_deadlineStatus": "no_deadline",
            "unclear_deadlineSource": "not_stated"
          }
        },
        {
          "value": "o2",
          "label": "기한이 여유 있고, 서류에 적혀 있습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_far",
            "unclear_deadlineSource": "written_in_doc"
          }
        },
        {
          "value": "o3",
          "label": "기한이 가깝고, 메시지에만 적혀 있습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_near",
            "unclear_deadlineSource": "message_only"
          }
        },
        {
          "value": "o4",
          "label": "서류에 적힌 기한이 이미 지났습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_passed",
            "unclear_deadlineSource": "written_in_doc"
          }
        },
        {
          "value": "o5",
          "label": "기한이 분명하지 않고, 전화로만 들었습니다",
          "fields": {
            "unclear_deadlineStatus": "deadline_unclear",
            "unclear_deadlineSource": "said_by_phone"
          }
        }
      ],
      "directFields": {
        "unclear_deadlineStatus": "direct_input",
        "unclear_deadlineSource": "direct_input_detail"
      }
    },
    {
      "code": "Q9-N",
      "id": "unclear_q9_n",
      "route": "N",
      "phase": 2,
      "prompt": "지금까지 이 서류와 관련해 해 본 일이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "아직 아무것도 하지 않았습니다",
          "fields": {
            "unclear_actionTaken": "nothing_done",
            "unclear_actionResult": "na_result"
          }
        },
        {
          "value": "o2",
          "label": "보낸 쪽에 문의했지만 답을 받지 못했습니다",
          "fields": {
            "unclear_actionTaken": "contacted_sender",
            "unclear_actionResult": "no_answer"
          }
        },
        {
          "value": "o3",
          "label": "주변에 물어봤고 설명을 들었습니다",
          "fields": {
            "unclear_actionTaken": "asked_others",
            "unclear_actionResult": "got_explained"
          }
        },
        {
          "value": "o4",
          "label": "인터넷으로 찾아봤는데 서로 다른 말을 봤습니다",
          "fields": {
            "unclear_actionTaken": "searched_online",
            "unclear_actionResult": "conflicting_info"
          }
        },
        {
          "value": "o5",
          "label": "이미 답장했고, 결과는 아직 모릅니다",
          "fields": {
            "unclear_actionTaken": "replied",
            "unclear_actionResult": "unsure_result"
          }
        }
      ],
      "directFields": {
        "unclear_actionTaken": "direct_input",
        "unclear_actionResult": "direct_input_detail"
      }
    },
    {
      "code": "Q10-N",
      "id": "unclear_q10_n",
      "route": "N",
      "phase": 2,
      "prompt": "어떤 분야와 관련 있어 보이나요? 서류는 어떻게 가지고 계신가요?",
      "choices": [
        {
          "value": "o1",
          "label": "세금 관련 같고, 원본을 보관하고 있습니다",
          "fields": {
            "unclear_domainHint": "tax_related",
            "unclear_evidenceAvailable": "original_kept"
          }
        },
        {
          "value": "o2",
          "label": "행정 절차 관련 같고, 사진이나 캡처만 있습니다",
          "fields": {
            "unclear_domainHint": "admin_related",
            "unclear_evidenceAvailable": "photo_only"
          }
        },
        {
          "value": "o3",
          "label": "부동산 관련 같고, 일부를 잃어버렸습니다",
          "fields": {
            "unclear_domainHint": "property_related",
            "unclear_evidenceAvailable": "partly_lost"
          }
        },
        {
          "value": "o4",
          "label": "사기나 사칭이 의심되고, 사진이나 캡처만 있습니다",
          "fields": {
            "unclear_domainHint": "fraud_suspected",
            "unclear_evidenceAvailable": "photo_only"
          }
        },
        {
          "value": "o5",
          "label": "어떤 분야인지 모르고, 남은 것이 없습니다",
          "fields": {
            "unclear_domainHint": "domain_unknown",
            "unclear_evidenceAvailable": "nothing_kept"
          }
        }
      ],
      "directFields": {
        "unclear_domainHint": "direct_input",
        "unclear_evidenceAvailable": "direct_input_detail"
      }
    }
  ],
  "firstResult": {
    "M": {
      "cards": [
        {
          "questionCode": "Q1-M",
          "title": "받은 서류의 형태",
          "sentences": {
            "unclear_documentForm=official_letter|unclear_moneyMention=amount_stated": "공문 형태이고 낼 금액이 적힌 서류입니다",
            "unclear_documentForm=bill_like|unclear_moneyMention=account_given": "청구서 형태이고 입금 계좌가 안내된 서류입니다",
            "unclear_documentForm=message_text|unclear_moneyMention=amount_vague": "문자·메신저로 온 내용이고 금액이 분명하지 않습니다",
            "unclear_documentForm=email_text|unclear_moneyMention=fee_hinted": "이메일로 온 내용이고 수수료·벌금 같은 표현이 있습니다",
            "unclear_documentForm=other_form|unclear_moneyMention=amount_stated": "형식이 분명하지 않지만 낼 금액이 적혀 있습니다"
          }
        },
        {
          "questionCode": "Q2-M",
          "title": "보낸 곳과 받은 경로",
          "sentences": {
            "unclear_senderType=gov_office|unclear_receivedChannel=paper_mail": "공공기관 쪽에서 온 것으로 보이며 우편으로 받은 납부 관련 서류입니다",
            "unclear_senderType=bank_or_finance|unclear_receivedChannel=email": "은행·금융회사 쪽에서 온 것으로 보이며 이메일로 받은 납부 관련 서류입니다",
            "unclear_senderType=company|unclear_receivedChannel=text_msg": "회사·업체 쪽에서 온 것으로 보이며 문자로 받은 납부 관련 서류입니다",
            "unclear_senderType=individual|unclear_receivedChannel=handed_over": "개인 쪽에서 온 것으로 보이며 직접 건네받은 납부 관련 서류입니다",
            "unclear_senderType=unknown_origin|unclear_receivedChannel=messenger_app": "보낸 곳을 알 수 없으며 메신저로 받은 납부 관련 서류입니다"
          }
        },
        {
          "questionCode": "Q3-M",
          "title": "받은 시기와 받은 형태",
          "sentences": {
            "unclear_receivedTime=today_or_yesterday|unclear_receivedPattern=first_time": "오늘이나 어제 처음 받은 납부 관련 서류입니다",
            "unclear_receivedTime=within_week|unclear_receivedPattern=repeated": "일주일 이내에 같은 내용을 반복해서 받은 납부 관련 서류입니다",
            "unclear_receivedTime=within_month|unclear_receivedPattern=escalating": "한 달 이내에 표현이 점점 강해진 납부 관련 서류입니다",
            "unclear_receivedTime=over_month|unclear_receivedPattern=after_call": "한 달이 넘었고 전화나 방문 뒤에 받은 납부 관련 서류입니다",
            "unclear_receivedTime=within_week|unclear_receivedPattern=expected": "일주일 이내에 받았고 예상하고 있던 납부 관련 서류입니다"
          }
        }
      ],
      "verdicts": {
        "unclear_trigger=arrived_unexpectedly|unclear_worry=worried_about_fake": {
          "headline": "갑자기 받은 납부 요구라 가짜 여부 확인이 먼저 필요한 상황입니다",
          "body": "예고 없이 온 납부 요구는 보낸 곳을 확인하기 전에는 돈을 보내지 않는 것이 안전합니다. 공식 연락처로 사실 여부를 먼저 확인해 보세요."
        },
        "unclear_trigger=after_procedure|unclear_worry=worried_about_nonpayment": {
          "headline": "진행한 절차와 관련된 납부 안내로 보이며 불이익이 걱정되는 상황입니다",
          "body": "관련 절차의 안내라면 기한과 금액을 서류에서 먼저 확인할 수 있습니다. 불이익은 서류에 적힌 기준에 따라 달라지므로 내용을 정확히 읽어 보세요."
        },
        "unclear_trigger=after_dispute|unclear_worry=worried_about_amount": {
          "headline": "분쟁이나 문의 뒤에 받은 금액 안내로 금액 근거 확인이 필요한 상황입니다",
          "body": "금액이 어떤 계산으로 나왔는지 서류에 근거가 있는지 확인해 보세요. 근거가 없다면 보낸 쪽에 공식 경로로 설명을 요청할 수 있습니다."
        },
        "unclear_trigger=related_business|unclear_worry=worried_about_deadline": {
          "headline": "사업·거래와 관련된 납부 안내로 기한 확인이 급한 상황입니다",
          "body": "기한이 서류에 적혀 있는지, 언제까지인지 가장 먼저 확인하세요. 기한이 가깝다면 확인과 함께 전문가 진행도 함께 살펴볼 수 있습니다."
        },
        "unclear_trigger=unknown_reason|unclear_worry=not_worried": {
          "headline": "받은 이유를 알 수 없는 납부 안내로 이유부터 확인할 상황입니다",
          "body": "이유를 모르는 납부 요구는 걱정이 적더라도 확인 없이 따르지 않는 것이 좋습니다. 서류에 적힌 근거와 보낸 곳부터 확인해 보세요."
        }
      },
      "verdictQuestionCode": "Q4-M",
      "risks": {
        "rules": [
          {
            "clauses": [
              {
                "field": "unclear_senderCheck",
                "values": [
                  "fake_suspected",
                  "unconfirmed_sender"
                ]
              },
              {
                "field": "unclear_domainHint",
                "values": [
                  "fraud_suspected"
                ]
              }
            ],
            "excludes": [],
            "sentence": "보낸 곳이 확인되지 않았거나 가짜가 의심되어 돈을 보내기 전에 발신처 확인이 먼저 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_deadlineStatus",
                "values": [
                  "deadline_near",
                  "deadline_passed"
                ]
              }
            ],
            "excludes": [],
            "sentence": "기한이 가깝거나 지났다면 근거 서류가 있는지 확인하고 빨리 대응 방법을 알아봐야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_documentFeatures",
                "values": [
                  "has_threat",
                  "has_link_phone"
                ]
              },
              {
                "field": "unclear_receivedPattern",
                "values": [
                  "repeated",
                  "escalating"
                ]
              }
            ],
            "excludes": [],
            "sentence": "불이익 경고나 반복되는 독촉이 있어 서두르지 말고 근거를 확인할 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_featureDetail",
                "values": [
                  "personal_data_asked"
                ]
              },
              {
                "field": "unclear_actionTaken",
                "values": [
                  "replied"
                ]
              }
            ],
            "excludes": [],
            "sentence": "개인정보를 요구받았거나 이미 답장한 상태라 추가 요구에 응하기 전에 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_amountScale",
                "values": [
                  "amount_large",
                  "amount_unknown"
                ]
              },
              {
                "field": "unclear_moneyMention",
                "values": [
                  "amount_vague"
                ]
              }
            ],
            "excludes": [],
            "sentence": "금액이 크거나 분명하지 않아 계산 근거를 서류에서 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_documentFeatures",
                "values": [
                  "missing_seal_number"
                ]
              },
              {
                "field": "unclear_documentForm",
                "values": [
                  "message_text",
                  "other_form"
                ]
              }
            ],
            "excludes": [],
            "sentence": "공식 문서의 기본 구성이 부족해 보여 진짜 서류인지 비교 확인이 필요합니다"
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
          "title": "받은 서류의 형태",
          "sentences": {
            "unclear_documentForm=official_letter|unclear_requestedAction=submit_docs": "공문 형태이고 서류 제출을 요구하는 내용입니다",
            "unclear_documentForm=bill_like|unclear_requestedAction=appear_in_person": "고지서 형태이고 직접 출석을 요구하는 내용입니다",
            "unclear_documentForm=message_text|unclear_requestedAction=fix_docs": "문자·메신저로 온 보완 요구 내용입니다",
            "unclear_documentForm=email_text|unclear_requestedAction=reply_needed": "이메일로 온 답장 요구 내용입니다",
            "unclear_documentForm=other_form|unclear_requestedAction=visit_site": "형식이 분명하지 않고 사이트 접속을 요구하는 내용입니다"
          }
        },
        {
          "questionCode": "Q2-D",
          "title": "보낸 곳과 받은 경로",
          "sentences": {
            "unclear_senderType=gov_office|unclear_receivedChannel=paper_mail": "공공기관 쪽에서 온 것으로 보이며 우편으로 받은 제출·출석 관련 서류입니다",
            "unclear_senderType=bank_or_finance|unclear_receivedChannel=email": "은행·금융회사 쪽에서 온 것으로 보이며 이메일로 받은 제출·출석 관련 서류입니다",
            "unclear_senderType=company|unclear_receivedChannel=text_msg": "회사·업체 쪽에서 온 것으로 보이며 문자로 받은 제출·출석 관련 서류입니다",
            "unclear_senderType=individual|unclear_receivedChannel=handed_over": "개인 쪽에서 온 것으로 보이며 직접 건네받은 제출·출석 관련 서류입니다",
            "unclear_senderType=unknown_origin|unclear_receivedChannel=messenger_app": "보낸 곳을 알 수 없으며 메신저로 받은 제출·출석 관련 서류입니다"
          }
        },
        {
          "questionCode": "Q3-D",
          "title": "받은 시기와 받은 형태",
          "sentences": {
            "unclear_receivedTime=today_or_yesterday|unclear_receivedPattern=first_time": "오늘이나 어제 처음 받은 제출·출석 관련 서류입니다",
            "unclear_receivedTime=within_week|unclear_receivedPattern=repeated": "일주일 이내에 같은 내용을 반복해서 받은 제출·출석 관련 서류입니다",
            "unclear_receivedTime=within_month|unclear_receivedPattern=escalating": "한 달 이내에 표현이 점점 강해진 제출·출석 관련 서류입니다",
            "unclear_receivedTime=over_month|unclear_receivedPattern=after_call": "한 달이 넘었고 전화나 방문 뒤에 받은 제출·출석 관련 서류입니다",
            "unclear_receivedTime=within_week|unclear_receivedPattern=expected": "일주일 이내에 받았고 예상하고 있던 제출·출석 관련 서류입니다"
          }
        }
      ],
      "verdicts": {
        "unclear_trigger=arrived_unexpectedly|unclear_worry=worried_about_fake": {
          "headline": "갑자기 받은 제출·출석 요구라 진짜인지 확인이 먼저 필요한 상황입니다",
          "body": "예고 없는 제출·출석 요구는 서류를 보내거나 방문하기 전에 보낸 곳을 확인하는 것이 안전합니다. 공식 자료에 나온 연락처로 사실 여부를 먼저 확인하세요."
        },
        "unclear_trigger=after_procedure|unclear_worry=worried_about_noncompliance": {
          "headline": "진행한 절차에 이어 받은 제출·출석 요구로 불이익이 걱정되는 상황입니다",
          "body": "절차에 이어진 요구라면 무엇을 언제까지 해야 하는지 서류에서 먼저 확인할 수 있습니다. 불이익 내용은 서류에 적힌 기준을 정확히 읽어 보세요."
        },
        "unclear_trigger=after_dispute|unclear_worry=worried_about_paper": {
          "headline": "분쟁이나 문의 뒤에 받은 요구로 필요한 서류 확인이 필요한 상황입니다",
          "body": "필요한 서류가 목록으로 적혀 있는지 먼저 확인하세요. 목록이 없다면 보낸 곳에 무엇을 내야 하는지 공식 경로로 문의할 수 있습니다."
        },
        "unclear_trigger=related_business|unclear_worry=worried_about_deadline": {
          "headline": "사업·거래와 관련된 제출·출석 요구로 기한 확인이 급한 상황입니다",
          "body": "제출이나 출석 기한이 서류에 적혀 있는지 가장 먼저 확인하세요. 기한이 가깝다면 서류 준비와 함께 전문가 진행도 살펴볼 수 있습니다."
        },
        "unclear_trigger=unknown_reason|unclear_worry=not_worried": {
          "headline": "받은 이유를 알 수 없는 제출·출석 요구로 이유부터 확인할 상황입니다",
          "body": "이유를 모르는 요구는 걱정이 적더라도 내용을 확인하기 전에 따르지 않는 것이 좋습니다. 무엇에 대한 요구인지 서류에서 근거를 찾아보세요."
        }
      },
      "verdictQuestionCode": "Q4-D",
      "risks": {
        "rules": [
          {
            "clauses": [
              {
                "field": "unclear_senderCheck",
                "values": [
                  "fake_suspected",
                  "unconfirmed_sender"
                ]
              },
              {
                "field": "unclear_domainHint",
                "values": [
                  "fraud_suspected"
                ]
              }
            ],
            "excludes": [],
            "sentence": "보낸 곳이 확인되지 않았거나 가짜가 의심되어 서류를 내거나 방문하기 전에 발신처 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_deadlineStatus",
                "values": [
                  "deadline_near",
                  "deadline_passed",
                  "deadline_unclear"
                ]
              }
            ],
            "excludes": [],
            "sentence": "제출이나 출석 기한이 가깝거나 지났거나 불분명해 기한의 근거를 먼저 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_featureDetail",
                "values": [
                  "personal_data_asked"
                ]
              },
              {
                "field": "unclear_requestDetail",
                "values": [
                  "id_docs"
                ]
              }
            ],
            "excludes": [],
            "sentence": "신분증이나 개인정보를 요구받고 있어 제출 전에 요구가 공식인지 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_requestSpecificity",
                "values": [
                  "items_vague",
                  "where_unclear"
                ]
              }
            ],
            "excludes": [],
            "sentence": "무엇을 어디에 내야 하는지 분명하지 않아 공식 경로로 먼저 문의할 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_requestedAction",
                "values": [
                  "visit_site",
                  "appear_in_person"
                ]
              },
              {
                "field": "unclear_documentFeatures",
                "values": [
                  "has_link_phone"
                ]
              }
            ],
            "excludes": [],
            "sentence": "사이트 접속이나 직접 방문을 요구하고 있어 링크와 장소가 공식 자료와 같은지 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_actionTaken",
                "values": [
                  "replied"
                ]
              }
            ],
            "excludes": [],
            "sentence": "이미 답장했다면 보낸 내용을 정리하고 추가 요구에 응하기 전에 확인이 필요합니다"
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
          "title": "받은 서류의 형태",
          "sentences": {
            "unclear_documentForm=official_letter|unclear_contentClarity=clear_notice": "공문 형태이고 내용은 이해되는 서류입니다",
            "unclear_documentForm=bill_like|unclear_contentClarity=partly_clear": "고지서 형태이고 일부만 이해되는 서류입니다",
            "unclear_documentForm=message_text|unclear_contentClarity=hard_terms": "문자·메신저 내용이고 어려운 용어가 많은 서류입니다",
            "unclear_documentForm=email_text|unclear_contentClarity=foreign_language": "이메일로 온 외국어 내용의 서류입니다",
            "unclear_documentForm=other_form|unclear_contentClarity=unreadable": "형식이 분명하지 않고 읽기 어려운 서류입니다"
          }
        },
        {
          "questionCode": "Q2-N",
          "title": "보낸 곳과 받은 경로",
          "sentences": {
            "unclear_senderType=gov_office|unclear_receivedChannel=paper_mail": "공공기관 쪽에서 온 것으로 보이며 우편으로 받은 내용이 불분명한 서류입니다",
            "unclear_senderType=bank_or_finance|unclear_receivedChannel=email": "은행·금융회사 쪽에서 온 것으로 보이며 이메일로 받은 내용이 불분명한 서류입니다",
            "unclear_senderType=company|unclear_receivedChannel=text_msg": "회사·업체 쪽에서 온 것으로 보이며 문자로 받은 내용이 불분명한 서류입니다",
            "unclear_senderType=individual|unclear_receivedChannel=handed_over": "개인 쪽에서 온 것으로 보이며 직접 건네받은 내용이 불분명한 서류입니다",
            "unclear_senderType=unknown_origin|unclear_receivedChannel=messenger_app": "보낸 곳을 알 수 없으며 메신저로 받은 내용이 불분명한 서류입니다"
          }
        },
        {
          "questionCode": "Q3-N",
          "title": "받은 시기와 받은 형태",
          "sentences": {
            "unclear_receivedTime=today_or_yesterday|unclear_receivedPattern=first_time": "오늘이나 어제 처음 받은 내용이 불분명한 서류입니다",
            "unclear_receivedTime=within_week|unclear_receivedPattern=repeated": "일주일 이내에 같은 내용을 반복해서 받은 내용이 불분명한 서류입니다",
            "unclear_receivedTime=within_month|unclear_receivedPattern=escalating": "한 달 이내에 표현이 점점 강해진 내용이 불분명한 서류입니다",
            "unclear_receivedTime=over_month|unclear_receivedPattern=after_call": "한 달이 넘었고 전화나 방문 뒤에 받은 내용이 불분명한 서류입니다",
            "unclear_receivedTime=within_week|unclear_receivedPattern=expected": "일주일 이내에 받았고 예상하고 있던 내용이 불분명한 서류입니다"
          }
        }
      ],
      "verdicts": {
        "unclear_trigger=arrived_unexpectedly|unclear_worry=worried_about_meaning": {
          "headline": "갑자기 받은 서류인데 무슨 뜻인지 알 수 없는 상황입니다",
          "body": "무슨 뜻인지 모르는 서류에는 일단 응하지 않고 내용을 이해하는 것이 먼저입니다. 서류의 제목, 보낸 곳, 날짜 세 가지부터 정리해 보세요."
        },
        "unclear_trigger=after_procedure|unclear_worry=worried_about_fake": {
          "headline": "진행한 절차 뒤에 받은 불분명한 서류로 진짜 여부가 걱정되는 상황입니다",
          "body": "절차와 이어진 서류라면 그 절차의 담당 기관에 공식 경로로 문의해 확인할 수 있습니다. 서류에 적힌 연락처보다 공식 자료의 연락처를 쓰세요."
        },
        "unclear_trigger=after_dispute|unclear_worry=worried_about_missing": {
          "headline": "분쟁이나 문의 뒤에 받은 서류로 놓친 내용이 없는지 확인이 필요한 상황입니다",
          "body": "앞선 문의나 분쟁의 기록과 이 서류를 함께 놓고 보면 연결이 보일 수 있습니다. 두 자료의 날짜와 이름이 이어지는지 확인해 보세요."
        },
        "unclear_trigger=related_business|unclear_worry=worried_about_deadline": {
          "headline": "사업·거래와 관련해 받은 불분명한 서류로 기한 확인이 필요한 상황입니다",
          "body": "기한 표시가 있는지 먼저 찾아보세요. 내용을 모르는 상태에서는 기한이 있어도 확인을 먼저 하는 것이 안전합니다."
        },
        "unclear_trigger=unknown_reason|unclear_worry=not_worried": {
          "headline": "받은 이유도 내용도 모르는 서류로 천천히 분류해 볼 상황입니다",
          "body": "걱정이 크지 않다면 서류를 보관하고 어떤 서류인지 차근차근 분류해 보세요. 요구 사항이 없다면 급하게 움직일 필요는 없습니다."
        }
      },
      "verdictQuestionCode": "Q4-N",
      "risks": {
        "rules": [
          {
            "clauses": [
              {
                "field": "unclear_senderCheck",
                "values": [
                  "fake_suspected",
                  "unconfirmed_sender"
                ]
              },
              {
                "field": "unclear_domainHint",
                "values": [
                  "fraud_suspected"
                ]
              }
            ],
            "excludes": [],
            "sentence": "보낸 곳이 확인되지 않았거나 가짜가 의심되어 응하기 전에 발신처 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_understandingLevel",
                "values": [
                  "understood_little",
                  "needs_translation"
                ]
              },
              {
                "field": "unclear_contentClarity",
                "values": [
                  "hard_terms",
                  "foreign_language",
                  "unreadable"
                ]
              }
            ],
            "excludes": [],
            "sentence": "내용을 충분히 이해하지 못한 상태라 핵심 부분부터 쉽게 풀이하거나 번역받을 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_deadlineStatus",
                "values": [
                  "deadline_unclear",
                  "deadline_near",
                  "deadline_passed"
                ]
              }
            ],
            "excludes": [],
            "sentence": "기한이 분명하지 않거나 가깝다면 서류에서 기한의 근거부터 찾아야 합니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_documentFeatures",
                "values": [
                  "has_threat",
                  "has_link_phone"
                ]
              },
              {
                "field": "unclear_receivedPattern",
                "values": [
                  "repeated",
                  "escalating"
                ]
              }
            ],
            "excludes": [],
            "sentence": "경고 문구나 반복되는 연락이 있어 서두르지 말고 근거를 확인할 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_keyTermsSeen",
                "values": [
                  "law_terms",
                  "agency_names"
                ]
              },
              {
                "field": "unclear_domainHint",
                "values": [
                  "tax_related",
                  "admin_related",
                  "property_related"
                ]
              }
            ],
            "excludes": [],
            "sentence": "법령이나 기관 이름이 나오므로 관련 분야를 정해 해당 검토로 이어서 확인할 수 있습니다"
          },
          {
            "clauses": [
              {
                "field": "unclear_featureDetail",
                "values": [
                  "personal_data_asked"
                ]
              }
            ],
            "excludes": [],
            "sentence": "개인정보를 요구하는 문구가 있어 내용을 이해하기 전에는 응하지 않는 것이 좋습니다"
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
        "title": "발신처 확인",
        "sentences": {
          "unclear_senderCheck=confirmed_sender|unclear_senderCheckBasis=official_contact_checked": "공식 연락처로 직접 확인한 점은 가장 믿을 만한 방법입니다. 확인한 날짜와 답변 내용을 기록해 두세요.",
          "unclear_senderCheck=partly_confirmed|unclear_senderCheckBasis=search_checked": "인터넷 검색만으로는 보낸 곳이 맞는지 알기 어려울 수 있습니다. 서류에 적힌 번호가 아니라 공식 자료에 나온 연락처로 다시 확인해 보세요.",
          "unclear_senderCheck=unconfirmed_sender|unclear_senderCheckBasis=asked_sender": "서류에 적힌 연락처로 물어본 것이라면 그 연락처가 맞는지부터 확인이 필요합니다. 물어본 내용과 받은 답은 그대로 저장해 두세요.",
          "unclear_senderCheck=fake_suspected|unclear_senderCheckBasis=not_checked_yet": "가짜가 의심된다면 서류의 링크나 번호로 연락하기 전에 공식 자료로 먼저 확인하세요. 개인정보나 돈은 확인이 끝날 때까지 보내지 마세요.",
          "unclear_senderCheck=unconfirmed_sender|unclear_senderCheckBasis=not_checked_yet": "보낸 곳을 모르는 서류에는 응하기 전에 먼저 보낸 곳을 확인하는 것이 순서입니다. 서류의 이름과 번호를 공식 자료에서 찾아보세요."
        }
      },
      {
        "questionCode": "Q6-M",
        "title": "서류의 특징",
        "sentences": {
          "unclear_documentFeatures=has_seal_number|unclear_featureDetail=formal_layout": "직인과 문서번호가 있고 형식이 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식만으로는 진짜 여부를 알 수 없으니 발신처 확인을 함께 하세요.",
          "unclear_documentFeatures=missing_seal_number|unclear_featureDetail=odd_wording": "공식 문서의 기본 구성이 빠져 있고 문장이 어색하다면 신중하게 볼 필요가 있습니다. 같은 기관의 다른 문서와 비교해 보세요.",
          "unclear_documentFeatures=has_threat|unclear_featureDetail=personal_data_asked": "불이익 경고와 개인정보 요구가 함께 있으면 서두르게 만드는 방식일 수 있어 주의가 필요합니다. 요구에 응하기 전에 공식 경로로 사실을 확인하세요.",
          "unclear_documentFeatures=has_link_phone|unclear_featureDetail=no_detail": "구체적인 내용 없이 링크나 번호로만 안내한다면 그 링크를 누르기 전에 확인이 필요합니다. 링크 대신 공식 사이트에 직접 접속해 확인해 보세요.",
          "unclear_documentFeatures=plain_notice|unclear_featureDetail=formal_layout": "일반 안내문 형태라면 요구 사항이 있는지부터 읽어 보세요. 요구 사항이 없다면 보관만 해 두어도 충분할 수 있습니다."
        }
      },
      {
        "questionCode": "Q7-M",
        "title": "돈의 성격과 규모",
        "sentences": {
          "unclear_moneyNature=tax_like|unclear_amountScale=amount_small": "세금처럼 보이는 요구라면 세금 검토에서 이어서 확인할 수 있습니다. 금액이 크지 않아도 납부 전에 근거를 확인하세요.",
          "unclear_moneyNature=fine_like|unclear_amountScale=amount_medium": "벌금·과태료로 보인다면 부과 근거와 이의 제기 방법이 서류에 있는지 확인하세요. 행정문서 검토에서 이어서 볼 수 있습니다.",
          "unclear_moneyNature=fee_like|unclear_amountScale=amount_small": "수수료·요금이라면 어떤 서비스에 대한 것인지 계약이나 이용 내역과 맞는지 확인하세요.",
          "unclear_moneyNature=debt_like|unclear_amountScale=amount_large": "금액이 크고 빚이나 대금으로 보인다면 거래 서류와 입금 기록을 대조해 보세요. 확인 전에 서둘러 보내지 마세요.",
          "unclear_moneyNature=deposit_like|unclear_amountScale=amount_unknown": "보증금·선납금 요구는 약속한 계약이 서류로 있는지 확인이 우선입니다. 금액을 모르는 상태에서는 보내지 않는 것이 좋습니다."
        }
      },
      {
        "questionCode": "Q8-M",
        "title": "기한",
        "sentences": {
          "unclear_deadlineStatus=no_deadline|unclear_deadlineSource=not_stated": "기한이 어디에도 없다면 서두를 이유가 서류에서는 확인되지 않는 상태입니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요.",
          "unclear_deadlineStatus=deadline_far|unclear_deadlineSource=written_in_doc": "서류에 기한이 적혀 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요.",
          "unclear_deadlineStatus=deadline_near|unclear_deadlineSource=message_only": "기한이 가까운데 메시지에만 있다면 그 근거 서류가 있는지 먼저 확인이 필요합니다. 기한을 이유로 서두르게 하는 경우일 수 있어 주의하세요.",
          "unclear_deadlineStatus=deadline_passed|unclear_deadlineSource=written_in_doc": "기한이 지났더라도 바로 포기하지 말고 어떤 조치가 가능한지 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관해 두세요.",
          "unclear_deadlineStatus=deadline_unclear|unclear_deadlineSource=said_by_phone": "전화로만 들은 기한은 근거가 없는 상태입니다. 서류나 공식 안내로 기한이 있는지 다시 확인해 보세요."
        }
      },
      {
        "questionCode": "Q9-M",
        "title": "이미 한 조치",
        "sentences": {
          "unclear_actionTaken=nothing_done|unclear_actionResult=na_result": "아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 공식 자료로 확인부터 해 보세요.",
          "unclear_actionTaken=contacted_sender|unclear_actionResult=no_answer": "답이 없다면 문의한 날짜와 방법을 기록하고 공식 연락처로 다시 확인해 보세요.",
          "unclear_actionTaken=asked_others|unclear_actionResult=got_explained": "주변 설명은 참고가 되지만 서류에 적힌 내용과 맞는지는 별도로 확인해야 합니다. 들은 설명도 날짜와 함께 적어 두세요.",
          "unclear_actionTaken=searched_online|unclear_actionResult=conflicting_info": "인터넷 정보가 서로 다르면 공식 기관의 안내를 기준으로 확인해야 합니다. 어떤 글을 봤는지 주소를 기록해 두세요.",
          "unclear_actionTaken=replied|unclear_actionResult=unsure_result": "이미 답장했다면 어떤 내용을 보냈는지 정리해 두고, 추가 요구가 오면 응하기 전에 확인하세요."
        }
      },
      {
        "questionCode": "Q10-M",
        "title": "관련 분야와 남은 자료",
        "sentences": {
          "unclear_domainHint=tax_related|unclear_evidenceAvailable=original_kept": "세금과 관련되어 보이고 원본이 있어 세금 검토에서 이어서 확인하기 좋은 상태입니다. 원본은 그대로 보관하세요.",
          "unclear_domainHint=admin_related|unclear_evidenceAvailable=photo_only": "행정 절차와 관련되어 보이면 행정문서 검토에서 이어서 확인할 수 있습니다. 사진은 글자가 모두 보이도록 다시 찍어 두는 것이 좋습니다.",
          "unclear_domainHint=property_related|unclear_evidenceAvailable=partly_lost": "부동산과 관련되어 보이면 부동산 검토에서 이어서 확인할 수 있습니다. 잃어버린 부분은 발급처에 다시 요청할 수 있는지 알아보세요.",
          "unclear_domainHint=fraud_suspected|unclear_evidenceAvailable=photo_only": "사기나 사칭이 의심된다면 사기 검토에서 이어서 확인하는 방법이 있습니다. 캡처는 날짜와 보낸 사람이 보이게 보관하세요.",
          "unclear_domainHint=domain_unknown|unclear_evidenceAvailable=nothing_kept": "분야를 모르고 자료도 남아 있지 않다면 기억나는 내용을 먼저 글로 적어 두세요. 전문가 진행에서 함께 정리할 수 있습니다."
        }
      }
    ],
    "D": [
      {
        "questionCode": "Q5-D",
        "title": "발신처 확인",
        "sentences": {
          "unclear_senderCheck=confirmed_sender|unclear_senderCheckBasis=official_contact_checked": "공식 연락처로 직접 확인한 점은 가장 믿을 만한 방법입니다. 확인한 날짜와 답변 내용을 기록해 두세요.",
          "unclear_senderCheck=partly_confirmed|unclear_senderCheckBasis=search_checked": "인터넷 검색만으로는 보낸 곳이 맞는지 알기 어려울 수 있습니다. 서류에 적힌 번호가 아니라 공식 자료에 나온 연락처로 다시 확인해 보세요.",
          "unclear_senderCheck=unconfirmed_sender|unclear_senderCheckBasis=asked_sender": "서류에 적힌 연락처로 물어본 것이라면 그 연락처가 맞는지부터 확인이 필요합니다. 물어본 내용과 받은 답은 그대로 저장해 두세요.",
          "unclear_senderCheck=fake_suspected|unclear_senderCheckBasis=not_checked_yet": "가짜가 의심된다면 서류의 링크나 번호로 연락하기 전에 공식 자료로 먼저 확인하세요. 개인정보나 돈은 확인이 끝날 때까지 보내지 마세요.",
          "unclear_senderCheck=unconfirmed_sender|unclear_senderCheckBasis=not_checked_yet": "보낸 곳을 모르는 서류에는 응하기 전에 먼저 보낸 곳을 확인하는 것이 순서입니다. 서류의 이름과 번호를 공식 자료에서 찾아보세요."
        }
      },
      {
        "questionCode": "Q6-D",
        "title": "서류의 특징",
        "sentences": {
          "unclear_documentFeatures=has_seal_number|unclear_featureDetail=formal_layout": "직인과 문서번호가 있고 형식이 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식만으로는 진짜 여부를 알 수 없으니 발신처 확인을 함께 하세요.",
          "unclear_documentFeatures=missing_seal_number|unclear_featureDetail=odd_wording": "공식 문서의 기본 구성이 빠져 있고 문장이 어색하다면 신중하게 볼 필요가 있습니다. 같은 기관의 다른 문서와 비교해 보세요.",
          "unclear_documentFeatures=has_threat|unclear_featureDetail=personal_data_asked": "불이익 경고와 개인정보 요구가 함께 있으면 서두르게 만드는 방식일 수 있어 주의가 필요합니다. 요구에 응하기 전에 공식 경로로 사실을 확인하세요.",
          "unclear_documentFeatures=has_link_phone|unclear_featureDetail=no_detail": "구체적인 내용 없이 링크나 번호로만 안내한다면 그 링크를 누르기 전에 확인이 필요합니다. 링크 대신 공식 사이트에 직접 접속해 확인해 보세요.",
          "unclear_documentFeatures=plain_notice|unclear_featureDetail=formal_layout": "일반 안내문 형태라면 요구 사항이 있는지부터 읽어 보세요. 요구 사항이 없다면 보관만 해 두어도 충분할 수 있습니다."
        }
      },
      {
        "questionCode": "Q7-D",
        "title": "요구 내용의 구체성",
        "sentences": {
          "unclear_requestDetail=id_docs|unclear_requestSpecificity=items_listed": "신분증·증명 서류 요구가 목록으로 분명하다면 해당 기관의 공식 안내와 목록이 같은지 확인하세요. 개인정보는 확인 후에 제출하세요.",
          "unclear_requestDetail=business_docs|unclear_requestSpecificity=items_vague": "사업 서류 요구가 분명하지 않다면 무엇을 내야 하는지 공식 경로로 먼저 물어보세요. 문의한 내용과 답은 기록해 두세요.",
          "unclear_requestDetail=form_fill|unclear_requestSpecificity=where_stated": "작성할 양식과 낼 곳이 적혀 있다면 그 곳이 공식 기관의 주소나 창구인지 확인하세요.",
          "unclear_requestDetail=statement|unclear_requestSpecificity=where_unclear": "경위서를 내야 하는데 낼 곳이 불분명하다면 먼저 낼 곳을 확인해야 합니다. 작성한 내용은 사본을 남겨 두세요.",
          "unclear_requestDetail=attendance|unclear_requestSpecificity=items_listed": "출석을 요구하면서 서류 목록이 있다면 일시와 장소가 공식 자료와 맞는지 확인하세요. 혼자 가기 어렵다면 동행을 구하는 것도 방법입니다."
        }
      },
      {
        "questionCode": "Q8-D",
        "title": "기한",
        "sentences": {
          "unclear_deadlineStatus=no_deadline|unclear_deadlineSource=not_stated": "기한이 어디에도 없다면 서두를 이유가 서류에서는 확인되지 않는 상태입니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요.",
          "unclear_deadlineStatus=deadline_far|unclear_deadlineSource=written_in_doc": "서류에 기한이 적혀 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요.",
          "unclear_deadlineStatus=deadline_near|unclear_deadlineSource=message_only": "기한이 가까운데 메시지에만 있다면 그 근거 서류가 있는지 먼저 확인이 필요합니다. 기한을 이유로 서두르게 하는 경우일 수 있어 주의하세요.",
          "unclear_deadlineStatus=deadline_passed|unclear_deadlineSource=written_in_doc": "기한이 지났더라도 바로 포기하지 말고 어떤 조치가 가능한지 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관해 두세요.",
          "unclear_deadlineStatus=deadline_unclear|unclear_deadlineSource=said_by_phone": "전화로만 들은 기한은 근거가 없는 상태입니다. 서류나 공식 안내로 기한이 있는지 다시 확인해 보세요."
        }
      },
      {
        "questionCode": "Q9-D",
        "title": "이미 한 조치",
        "sentences": {
          "unclear_actionTaken=nothing_done|unclear_actionResult=na_result": "아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 공식 자료로 확인부터 해 보세요.",
          "unclear_actionTaken=contacted_sender|unclear_actionResult=no_answer": "답이 없다면 문의한 날짜와 방법을 기록하고 공식 연락처로 다시 확인해 보세요.",
          "unclear_actionTaken=asked_others|unclear_actionResult=got_explained": "주변 설명은 참고가 되지만 서류에 적힌 내용과 맞는지는 별도로 확인해야 합니다. 들은 설명도 날짜와 함께 적어 두세요.",
          "unclear_actionTaken=searched_online|unclear_actionResult=conflicting_info": "인터넷 정보가 서로 다르면 공식 기관의 안내를 기준으로 확인해야 합니다. 어떤 글을 봤는지 주소를 기록해 두세요.",
          "unclear_actionTaken=replied|unclear_actionResult=unsure_result": "이미 답장했다면 어떤 내용을 보냈는지 정리해 두고, 추가 요구가 오면 응하기 전에 확인하세요."
        }
      },
      {
        "questionCode": "Q10-D",
        "title": "관련 분야와 남은 자료",
        "sentences": {
          "unclear_domainHint=tax_related|unclear_evidenceAvailable=original_kept": "세금과 관련되어 보이고 원본이 있어 세금 검토에서 이어서 확인하기 좋은 상태입니다. 원본은 그대로 보관하세요.",
          "unclear_domainHint=admin_related|unclear_evidenceAvailable=photo_only": "행정 절차와 관련되어 보이면 행정문서 검토에서 이어서 확인할 수 있습니다. 사진은 글자가 모두 보이도록 다시 찍어 두는 것이 좋습니다.",
          "unclear_domainHint=property_related|unclear_evidenceAvailable=partly_lost": "부동산과 관련되어 보이면 부동산 검토에서 이어서 확인할 수 있습니다. 잃어버린 부분은 발급처에 다시 요청할 수 있는지 알아보세요.",
          "unclear_domainHint=fraud_suspected|unclear_evidenceAvailable=photo_only": "사기나 사칭이 의심된다면 사기 검토에서 이어서 확인하는 방법이 있습니다. 캡처는 날짜와 보낸 사람이 보이게 보관하세요.",
          "unclear_domainHint=domain_unknown|unclear_evidenceAvailable=nothing_kept": "분야를 모르고 자료도 남아 있지 않다면 기억나는 내용을 먼저 글로 적어 두세요. 전문가 진행에서 함께 정리할 수 있습니다."
        }
      }
    ],
    "N": [
      {
        "questionCode": "Q5-N",
        "title": "발신처 확인",
        "sentences": {
          "unclear_senderCheck=confirmed_sender|unclear_senderCheckBasis=official_contact_checked": "공식 연락처로 직접 확인한 점은 가장 믿을 만한 방법입니다. 확인한 날짜와 답변 내용을 기록해 두세요.",
          "unclear_senderCheck=partly_confirmed|unclear_senderCheckBasis=search_checked": "인터넷 검색만으로는 보낸 곳이 맞는지 알기 어려울 수 있습니다. 서류에 적힌 번호가 아니라 공식 자료에 나온 연락처로 다시 확인해 보세요.",
          "unclear_senderCheck=unconfirmed_sender|unclear_senderCheckBasis=asked_sender": "서류에 적힌 연락처로 물어본 것이라면 그 연락처가 맞는지부터 확인이 필요합니다. 물어본 내용과 받은 답은 그대로 저장해 두세요.",
          "unclear_senderCheck=fake_suspected|unclear_senderCheckBasis=not_checked_yet": "가짜가 의심된다면 서류의 링크나 번호로 연락하기 전에 공식 자료로 먼저 확인하세요. 개인정보나 돈은 확인이 끝날 때까지 보내지 마세요.",
          "unclear_senderCheck=unconfirmed_sender|unclear_senderCheckBasis=not_checked_yet": "보낸 곳을 모르는 서류에는 응하기 전에 먼저 보낸 곳을 확인하는 것이 순서입니다. 서류의 이름과 번호를 공식 자료에서 찾아보세요."
        }
      },
      {
        "questionCode": "Q6-N",
        "title": "서류의 특징",
        "sentences": {
          "unclear_documentFeatures=has_seal_number|unclear_featureDetail=formal_layout": "직인과 문서번호가 있고 형식이 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식만으로는 진짜 여부를 알 수 없으니 발신처 확인을 함께 하세요.",
          "unclear_documentFeatures=missing_seal_number|unclear_featureDetail=odd_wording": "공식 문서의 기본 구성이 빠져 있고 문장이 어색하다면 신중하게 볼 필요가 있습니다. 같은 기관의 다른 문서와 비교해 보세요.",
          "unclear_documentFeatures=has_threat|unclear_featureDetail=personal_data_asked": "불이익 경고와 개인정보 요구가 함께 있으면 서두르게 만드는 방식일 수 있어 주의가 필요합니다. 요구에 응하기 전에 공식 경로로 사실을 확인하세요.",
          "unclear_documentFeatures=has_link_phone|unclear_featureDetail=no_detail": "구체적인 내용 없이 링크나 번호로만 안내한다면 그 링크를 누르기 전에 확인이 필요합니다. 링크 대신 공식 사이트에 직접 접속해 확인해 보세요.",
          "unclear_documentFeatures=plain_notice|unclear_featureDetail=formal_layout": "일반 안내문 형태라면 요구 사항이 있는지부터 읽어 보세요. 요구 사항이 없다면 보관만 해 두어도 충분할 수 있습니다."
        }
      },
      {
        "questionCode": "Q7-N",
        "title": "이해 정도와 눈에 띄는 용어",
        "sentences": {
          "unclear_understandingLevel=understood_most|unclear_keyTermsSeen=law_terms": "법령 이름이 나온다면 해당 조항이 무엇을 요구하는지 공식 자료로 확인해 보세요. 어떤 분야인지 분류에도 도움이 됩니다.",
          "unclear_understandingLevel=understood_half|unclear_keyTermsSeen=agency_names": "기관 이름이 있다면 그 기관의 공식 연락처로 서류가 맞는지 확인할 수 있습니다. 서류에 적힌 연락처는 쓰지 마세요.",
          "unclear_understandingLevel=understood_little|unclear_keyTermsSeen=numbers_only": "숫자와 번호만 있다면 그 번호가 무엇의 번호인지부터 찾아보세요. 문서번호, 계좌, 사건번호를 따로 표시해 두세요.",
          "unclear_understandingLevel=needs_translation|unclear_keyTermsSeen=no_key_terms": "번역이 필요하다면 중요한 부분부터 번역을 받아 확인하세요. 번역본과 원본을 함께 보관하는 것이 좋습니다.",
          "unclear_understandingLevel=understood_little|unclear_keyTermsSeen=agency_names": "내용은 모르지만 기관 이름이 있다면 그 기관을 단서로 어떤 분야인지 분류해 보세요. 공식 안내에서 같은 이름의 서류가 있는지 찾아보세요."
        }
      },
      {
        "questionCode": "Q8-N",
        "title": "기한",
        "sentences": {
          "unclear_deadlineStatus=no_deadline|unclear_deadlineSource=not_stated": "기한이 어디에도 없다면 서두를 이유가 서류에서는 확인되지 않는 상태입니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요.",
          "unclear_deadlineStatus=deadline_far|unclear_deadlineSource=written_in_doc": "서류에 기한이 적혀 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요.",
          "unclear_deadlineStatus=deadline_near|unclear_deadlineSource=message_only": "기한이 가까운데 메시지에만 있다면 그 근거 서류가 있는지 먼저 확인이 필요합니다. 기한을 이유로 서두르게 하는 경우일 수 있어 주의하세요.",
          "unclear_deadlineStatus=deadline_passed|unclear_deadlineSource=written_in_doc": "기한이 지났더라도 바로 포기하지 말고 어떤 조치가 가능한지 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관해 두세요.",
          "unclear_deadlineStatus=deadline_unclear|unclear_deadlineSource=said_by_phone": "전화로만 들은 기한은 근거가 없는 상태입니다. 서류나 공식 안내로 기한이 있는지 다시 확인해 보세요."
        }
      },
      {
        "questionCode": "Q9-N",
        "title": "이미 한 조치",
        "sentences": {
          "unclear_actionTaken=nothing_done|unclear_actionResult=na_result": "아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 공식 자료로 확인부터 해 보세요.",
          "unclear_actionTaken=contacted_sender|unclear_actionResult=no_answer": "답이 없다면 문의한 날짜와 방법을 기록하고 공식 연락처로 다시 확인해 보세요.",
          "unclear_actionTaken=asked_others|unclear_actionResult=got_explained": "주변 설명은 참고가 되지만 서류에 적힌 내용과 맞는지는 별도로 확인해야 합니다. 들은 설명도 날짜와 함께 적어 두세요.",
          "unclear_actionTaken=searched_online|unclear_actionResult=conflicting_info": "인터넷 정보가 서로 다르면 공식 기관의 안내를 기준으로 확인해야 합니다. 어떤 글을 봤는지 주소를 기록해 두세요.",
          "unclear_actionTaken=replied|unclear_actionResult=unsure_result": "이미 답장했다면 어떤 내용을 보냈는지 정리해 두고, 추가 요구가 오면 응하기 전에 확인하세요."
        }
      },
      {
        "questionCode": "Q10-N",
        "title": "관련 분야와 남은 자료",
        "sentences": {
          "unclear_domainHint=tax_related|unclear_evidenceAvailable=original_kept": "세금과 관련되어 보이고 원본이 있어 세금 검토에서 이어서 확인하기 좋은 상태입니다. 원본은 그대로 보관하세요.",
          "unclear_domainHint=admin_related|unclear_evidenceAvailable=photo_only": "행정 절차와 관련되어 보이면 행정문서 검토에서 이어서 확인할 수 있습니다. 사진은 글자가 모두 보이도록 다시 찍어 두는 것이 좋습니다.",
          "unclear_domainHint=property_related|unclear_evidenceAvailable=partly_lost": "부동산과 관련되어 보이면 부동산 검토에서 이어서 확인할 수 있습니다. 잃어버린 부분은 발급처에 다시 요청할 수 있는지 알아보세요.",
          "unclear_domainHint=fraud_suspected|unclear_evidenceAvailable=photo_only": "사기나 사칭이 의심된다면 사기 검토에서 이어서 확인하는 방법이 있습니다. 캡처는 날짜와 보낸 사람이 보이게 보관하세요.",
          "unclear_domainHint=domain_unknown|unclear_evidenceAvailable=nothing_kept": "분야를 모르고 자료도 남아 있지 않다면 기억나는 내용을 먼저 글로 적어 두세요. 전문가 진행에서 함께 정리할 수 있습니다."
        }
      }
    ]
  },
  "labels": {
    "account_given": "입금 계좌가 안내됨",
    "admin_related": "행정 절차 관련 같음",
    "after_call": "전화나 방문 뒤에 받음",
    "after_dispute": "분쟁이나 문의 뒤에 받음",
    "after_procedure": "어떤 절차를 한 뒤에 받음",
    "agency_names": "기관 이름이 나옴",
    "amount_large": "1천만 동 이상",
    "amount_medium": "100만 동 이상 1천만 동 미만",
    "amount_small": "100만 동 미만",
    "amount_stated": "금액이 적혀 있음",
    "amount_unknown": "금액을 모름",
    "amount_vague": "금액이 분명하지 않음",
    "appear_in_person": "출석하라고 함",
    "arrived_unexpectedly": "예고 없이 받음",
    "asked_others": "주변에 물어봄",
    "asked_sender": "보낸 쪽에 물어봄",
    "attendance": "출석(방문)",
    "bank_or_finance": "은행·금융회사",
    "bill_like": "청구서·고지서 형태",
    "business_docs": "사업 관련 서류",
    "clear_notice": "내용이 이해됨",
    "company": "회사·업체",
    "confirmed_sender": "발신처가 확인됨",
    "conflicting_info": "서로 다른 말을 들음",
    "contacted_sender": "보낸 쪽에 문의함",
    "deadline_far": "기한이 여유 있음",
    "deadline_near": "기한이 가까움",
    "deadline_passed": "기한이 이미 지남",
    "deadline_unclear": "기한이 분명하지 않음",
    "debt_like": "빚이나 대금처럼 보임",
    "deposit_like": "보증금·선납금처럼 보임",
    "direct_input": "직접 입력",
    "direct_input_detail": "직접 입력(상세)",
    "domain_unknown": "어떤 분야인지 모름",
    "email": "이메일",
    "email_text": "이메일 내용",
    "escalating": "점점 강한 표현으로 바뀜",
    "expected": "미리 예상하고 있었음",
    "fake_suspected": "가짜가 의심됨",
    "fee_hinted": "수수료·벌금 같은 표현이 있음",
    "fee_like": "수수료·요금처럼 보임",
    "fine_like": "벌금·과태료처럼 보임",
    "first_time": "처음 받음",
    "fix_docs": "고쳐서 다시 내라고 함",
    "foreign_language": "외국어로 되어 있음",
    "form_fill": "양식 작성",
    "formal_layout": "형식이 갖춰져 있음",
    "fraud_suspected": "사기나 사칭이 의심됨",
    "got_explained": "설명을 들음",
    "gov_office": "공공기관·관공서",
    "handed_over": "직접 전달받음",
    "hard_terms": "어려운 용어가 많음",
    "has_link_phone": "링크나 전화번호만 안내함",
    "has_seal_number": "직인·문서번호가 있음",
    "has_threat": "불이익을 경고하는 문구가 있음",
    "id_docs": "신분증·증명 서류",
    "individual": "개인",
    "items_listed": "필요한 서류가 목록으로 있음",
    "items_vague": "무엇을 내야 하는지 분명하지 않음",
    "law_terms": "법령 이름이 나옴",
    "message_only": "메시지에만 적혀 있음",
    "message_text": "문자·메신저 내용",
    "messenger_app": "메신저 앱",
    "missing_seal_number": "직인이나 문서번호가 없음",
    "na_result": "해당 없음",
    "needs_translation": "번역이 필요함",
    "no_answer": "답을 받지 못함",
    "no_deadline": "기한 표시 없음",
    "no_detail": "별다른 특징 없음",
    "no_key_terms": "눈에 띄는 용어 없음",
    "not_checked_yet": "아직 확인하지 않음",
    "not_stated": "어디에도 없음",
    "not_worried": "특별히 걱정하지 않음",
    "nothing_done": "아직 아무것도 하지 않음",
    "nothing_kept": "남은 것이 없음",
    "notice_only": "알리는 내용 같음",
    "numbers_only": "숫자나 번호만 나옴",
    "odd_wording": "문장이 어색함",
    "official_contact_checked": "공식 연락처로 확인함",
    "official_letter": "공문·통지서 형태",
    "original_kept": "원본을 보관 중",
    "other_form": "형식이 분명하지 않음",
    "over_month": "한 달 넘음",
    "paper_mail": "우편·종이 서류",
    "partly_clear": "일부만 이해됨",
    "partly_confirmed": "일부만 확인됨",
    "partly_lost": "일부를 잃어버림",
    "pay": "돈을 내라는 내용 같음",
    "personal_data_asked": "개인정보를 요구함",
    "photo_only": "사진이나 캡처만 있음",
    "plain_notice": "일반적인 안내문 형태",
    "property_related": "부동산 관련 같음",
    "related_business": "사업이나 거래와 관련해 받음",
    "repeated": "같은 내용을 반복해서 받음",
    "replied": "이미 답장함",
    "reply_needed": "답장하라고 함",
    "said_by_phone": "전화로 들음",
    "search_checked": "인터넷으로 찾아봄",
    "searched_online": "인터넷으로 찾아봄",
    "selected": "직접 선택함",
    "statement": "경위서·설명서",
    "submit_docs": "서류를 내라고 함",
    "submit_or_appear": "서류 제출·출석 요구 같음",
    "tax_like": "세금처럼 보임",
    "tax_related": "세금 관련 같음",
    "text_msg": "문자메시지",
    "today_or_yesterday": "오늘이나 어제",
    "unconfirmed_sender": "확인되지 않음",
    "understood_half": "절반쯤 이해함",
    "understood_little": "거의 이해하지 못함",
    "understood_most": "대부분 이해함",
    "unknown_origin": "누가 보냈는지 모름",
    "unknown_reason": "왜 받았는지 모름",
    "unreadable": "읽기 어려움",
    "unsure": "잘 모르겠음",
    "unsure_result": "아직 잘 모름",
    "visit_site": "사이트에 접속하라고 함",
    "where_stated": "낼 곳이 적혀 있음",
    "where_unclear": "낼 곳이 분명하지 않음",
    "within_month": "한 달 이내",
    "within_week": "일주일 이내",
    "worried_about_amount": "금액이 맞는지 걱정함",
    "worried_about_deadline": "기한을 놓칠까 걱정함",
    "worried_about_fake": "가짜일까 걱정함",
    "worried_about_meaning": "무슨 뜻인지 몰라 걱정함",
    "worried_about_missing": "놓치는 것이 있을까 걱정함",
    "worried_about_noncompliance": "따르지 않으면 불이익이 있을까 걱정함",
    "worried_about_nonpayment": "내지 않으면 불이익이 있을까 걱정함",
    "worried_about_paper": "어떤 서류를 내야 할지 걱정함",
    "written_in_doc": "서류에 적혀 있음"
  },
  "connections": [
    {
      "name": "세금 검토",
      "condition": "`unclear_domainHint` ∈ {tax_related} 또는 `unclear_moneyNature` ∈ {tax_like}",
      "sentence": "세금과 관련된 서류로 보인다면 세금 검토에서 이어서 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_domainHint",
          "values": [
            "tax_related"
          ]
        },
        {
          "field": "unclear_moneyNature",
          "values": [
            "tax_like"
          ]
        }
      ]
    },
    {
      "name": "행정문서 검토",
      "condition": "`unclear_domainHint` ∈ {admin_related} 또는 `unclear_moneyNature` ∈ {fine_like} 또는 `unclear_trigger` ∈ {after_procedure}",
      "sentence": "행정 절차와 관련된 서류로 보인다면 행정문서 검토에서 이어서 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_domainHint",
          "values": [
            "admin_related"
          ]
        },
        {
          "field": "unclear_moneyNature",
          "values": [
            "fine_like"
          ]
        },
        {
          "field": "unclear_trigger",
          "values": [
            "after_procedure"
          ]
        }
      ]
    },
    {
      "name": "부동산 검토",
      "condition": "`unclear_domainHint` ∈ {property_related}",
      "sentence": "부동산과 관련된 서류로 보인다면 부동산 검토에서 이어서 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_domainHint",
          "values": [
            "property_related"
          ]
        }
      ]
    },
    {
      "name": "사기 검토",
      "condition": "`unclear_domainHint` ∈ {fraud_suspected} 또는 `unclear_senderCheck` ∈ {fake_suspected}",
      "sentence": "사기나 사칭이 의심되는 상황일 수 있으니 사기 검토에서 이어서 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_domainHint",
          "values": [
            "fraud_suspected"
          ]
        },
        {
          "field": "unclear_senderCheck",
          "values": [
            "fake_suspected"
          ]
        }
      ]
    },
    {
      "name": "전문가 진행",
      "condition": "`unclear_deadlineStatus` ∈ {deadline_passed} 또는 `unclear_amountScale` ∈ {amount_large} 또는 `unclear_domainHint` ∈ {domain_unknown}",
      "sentence": "기한이 지났거나 금액이 크거나 분야를 알기 어렵다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요.",
      "mode": "or",
      "clauses": [
        {
          "field": "unclear_deadlineStatus",
          "values": [
            "deadline_passed"
          ]
        },
        {
          "field": "unclear_amountScale",
          "values": [
            "amount_large"
          ]
        },
        {
          "field": "unclear_domainHint",
          "values": [
            "domain_unknown"
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
          "note": "인증번호 요구 등 주의 안내. 기사 URL은 Cursor가 재확인"
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
