/* Generated from docs/master/content/FRAUD_CONTENT_V2.md. Do not edit sentences. */
export const FRAUD_CONTENT_FINAL = {
  "entry": {
    "code": "A-0",
    "id": "fraud_entry",
    "route": "ENTRY",
    "phase": 0,
    "prompt": "지금 어떤 상황에서 확인하려고 하시나요?",
    "subtitle": "가까운 상황을 골라 주세요. 잘 모르겠다면 제출·계약 전 검토부터 시작합니다.",
    "choices": [
      {
        "value": "o1",
        "label": "제출·계약 전 서류 검토",
        "description": "받은 제안서나 계약서, 입금 요청을 따르기 전에 살펴보고 싶습니다.",
        "fields": {
          "fraud_reviewStage": "pre",
          "fraud_routeSelectionMode": "selected"
        },
        "route": "B"
      },
      {
        "value": "o2",
        "label": "문제 발생 후 대응 검토",
        "description": "돈을 보냈거나 문제가 생긴 뒤 무엇을 준비할지 알고 싶습니다.",
        "fields": {
          "fraud_reviewStage": "post",
          "fraud_routeSelectionMode": "selected"
        },
        "route": "A"
      },
      {
        "value": "o3",
        "label": "잘 모르겠습니다",
        "description": "",
        "fields": {
          "fraud_reviewStage": "pre",
          "fraud_routeSelectionMode": "unsure"
        },
        "route": "B"
      }
    ],
    "directFields": {
      "fraud_reviewStage": "pre",
      "fraud_routeSelectionMode": "direct_input"
    },
    "directRoute": "B"
  },
  "questions": [
    {
      "code": "Q1-B",
      "id": "fraud_q1_b",
      "route": "B",
      "phase": 1,
      "prompt": "어떤 종류의 제안을 받으셨나요?",
      "choices": [
        {
          "value": "o1",
          "label": "투자나 수익, 사업 제휴를 내세운 제안입니다",
          "fields": {
            "fraud_scheme": "investment",
            "fraud_schemeGroup": "sg_return"
          }
        },
        {
          "value": "o2",
          "label": "대출을 내세운 제안입니다",
          "fields": {
            "fraud_scheme": "loan",
            "fraud_schemeGroup": "sg_finance"
          }
        },
        {
          "value": "o3",
          "label": "온라인 거래나 임대 제안입니다",
          "fields": {
            "fraud_scheme": "online_trade",
            "fraud_schemeGroup": "sg_trade"
          }
        },
        {
          "value": "o4",
          "label": "기관이나 지인, 일자리, 연애를 내세운 제안입니다",
          "fields": {
            "fraud_scheme": "impersonation",
            "fraud_schemeGroup": "sg_identity"
          }
        },
        {
          "value": "o5",
          "label": "어떤 종류인지 잘 모르겠습니다",
          "fields": {
            "fraud_scheme": "unsure_scheme",
            "fraud_schemeGroup": "sg_unknown"
          }
        }
      ],
      "directFields": {
        "fraud_scheme": "direct_input",
        "fraud_schemeGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q2-B",
      "id": "fraud_q2_b",
      "route": "B",
      "phase": 1,
      "prompt": "상대가 내세운 명목은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "고수익·투자·가상자산·다단계·사업 제휴입니다",
          "fields": {
            "fraud_pretext": "pre_invest",
            "fraud_pretextGroup": "pg_return"
          }
        },
        {
          "value": "o2",
          "label": "소액 과제나 구인, 아르바이트입니다",
          "fields": {
            "fraud_pretext": "pre_tasks",
            "fraud_pretextGroup": "pg_work"
          }
        },
        {
          "value": "o3",
          "label": "연애나 결혼, 소개입니다",
          "fields": {
            "fraud_pretext": "pre_romance",
            "fraud_pretextGroup": "pg_relation"
          }
        },
        {
          "value": "o4",
          "label": "임대나 매매의 보증금·예약금입니다",
          "fields": {
            "fraud_pretext": "pre_deposit",
            "fraud_pretextGroup": "pg_deposit"
          }
        },
        {
          "value": "o5",
          "label": "택배나 관세, 상품 수령입니다",
          "fields": {
            "fraud_pretext": "pre_parcel",
            "fraud_pretextGroup": "pg_parcel"
          }
        },
        {
          "value": "o6",
          "label": "공안·세무·법원 같은 기관의 연락입니다",
          "fields": {
            "fraud_pretext": "pre_authority",
            "fraud_pretextGroup": "pg_authority"
          }
        },
        {
          "value": "o7",
          "label": "비자나 체류, 행정 업무 대행입니다",
          "fields": {
            "fraud_pretext": "pre_service",
            "fraud_pretextGroup": "pg_service"
          }
        },
        {
          "value": "o8",
          "label": "잘 모르겠습니다",
          "fields": {
            "fraud_pretext": "pre_unsure",
            "fraud_pretextGroup": "pg_unknown"
          }
        }
      ],
      "directFields": {
        "fraud_pretext": "direct_input",
        "fraud_pretextGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q3-B",
      "id": "fraud_q3_b",
      "route": "B",
      "phase": 1,
      "prompt": "상대와는 어떤 경로로 연락이 닿았나요?",
      "choices": [
        {
          "value": "o1",
          "label": "문자메시지입니다",
          "fields": {
            "fraud_contactChannel": "text_message",
            "fraud_channelGroup": "cg_direct"
          }
        },
        {
          "value": "o2",
          "label": "전화입니다",
          "fields": {
            "fraud_contactChannel": "phone_call",
            "fraud_channelGroup": "cg_direct"
          }
        },
        {
          "value": "o3",
          "label": "이메일입니다",
          "fields": {
            "fraud_contactChannel": "email_contact",
            "fraud_channelGroup": "cg_direct"
          }
        },
        {
          "value": "o4",
          "label": "메신저나 소셜 앱입니다",
          "fields": {
            "fraud_contactChannel": "messenger",
            "fraud_channelGroup": "cg_direct"
          }
        },
        {
          "value": "o5",
          "label": "온라인 광고나 게시글입니다",
          "fields": {
            "fraud_contactChannel": "online_post",
            "fraud_channelGroup": "cg_public"
          }
        },
        {
          "value": "o6",
          "label": "거래·임대·구인구직 플랫폼입니다",
          "fields": {
            "fraud_contactChannel": "trade_platform",
            "fraud_channelGroup": "cg_public"
          }
        },
        {
          "value": "o7",
          "label": "지인의 소개입니다",
          "fields": {
            "fraud_contactChannel": "referral",
            "fraud_channelGroup": "cg_personal"
          }
        },
        {
          "value": "o8",
          "label": "직접 만나서 시작되었습니다",
          "fields": {
            "fraud_contactChannel": "in_person",
            "fraud_channelGroup": "cg_personal"
          }
        }
      ],
      "directFields": {
        "fraud_contactChannel": "direct_input",
        "fraud_channelGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q4-B",
      "id": "fraud_q4_b",
      "route": "B",
      "phase": 1,
      "prompt": "지금 가장 크게 걱정되는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "상대가 진짜인지 모르겠습니다",
          "fields": {
            "fraud_mainConcern": "doubt_party",
            "fraud_firstAction": "next_party"
          }
        },
        {
          "value": "o2",
          "label": "서명하거나 계약해도 되는지 모르겠습니다",
          "fields": {
            "fraud_mainConcern": "doubt_sign",
            "fraud_firstAction": "next_terms"
          }
        },
        {
          "value": "o3",
          "label": "먼저 돈을 보내라는데 괜찮은지 모르겠습니다",
          "fields": {
            "fraud_mainConcern": "doubt_prepay",
            "fraud_firstAction": "next_hold"
          }
        },
        {
          "value": "o4",
          "label": "개인정보를 달라는데 괜찮은지 모르겠습니다",
          "fields": {
            "fraud_mainConcern": "doubt_data",
            "fraud_firstAction": "next_protect"
          }
        },
        {
          "value": "o5",
          "label": "조건이 너무 좋아 보여 걱정됩니다",
          "fields": {
            "fraud_mainConcern": "doubt_terms",
            "fraud_firstAction": "next_terms"
          }
        },
        {
          "value": "o6",
          "label": "재촉이 부담스럽습니다",
          "fields": {
            "fraud_mainConcern": "doubt_rush",
            "fraud_firstAction": "next_hold"
          }
        }
      ],
      "directFields": {
        "fraud_mainConcern": "direct_input",
        "fraud_firstAction": "direct_input_detail"
      }
    },
    {
      "code": "Q1-A",
      "id": "fraud_q1_a",
      "route": "A",
      "phase": 1,
      "prompt": "어떤 종류의 일을 겪으셨나요?",
      "choices": [
        {
          "value": "o1",
          "label": "투자나 수익, 사업 제휴와 관련해 문제가 생겼습니다",
          "fields": {
            "fraud_scheme": "investment",
            "fraud_schemeGroup": "sg_return"
          }
        },
        {
          "value": "o2",
          "label": "대출과 관련해 문제가 생겼습니다",
          "fields": {
            "fraud_scheme": "loan",
            "fraud_schemeGroup": "sg_finance"
          }
        },
        {
          "value": "o3",
          "label": "온라인 거래나 임대와 관련해 문제가 생겼습니다",
          "fields": {
            "fraud_scheme": "online_trade",
            "fraud_schemeGroup": "sg_trade"
          }
        },
        {
          "value": "o4",
          "label": "기관이나 지인, 일자리, 연애를 내세운 상대와 문제가 생겼습니다",
          "fields": {
            "fraud_scheme": "impersonation",
            "fraud_schemeGroup": "sg_identity"
          }
        },
        {
          "value": "o5",
          "label": "어떤 종류인지 잘 모르겠습니다",
          "fields": {
            "fraud_scheme": "unsure_scheme",
            "fraud_schemeGroup": "sg_unknown"
          }
        }
      ],
      "directFields": {
        "fraud_scheme": "direct_input",
        "fraud_schemeGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q2-A",
      "id": "fraud_q2_a",
      "route": "A",
      "phase": 1,
      "prompt": "상대가 내세웠던 명목은 무엇이었나요?",
      "choices": [
        {
          "value": "o1",
          "label": "고수익·투자·가상자산·다단계·사업 제휴였습니다",
          "fields": {
            "fraud_pretext": "pre_invest",
            "fraud_pretextGroup": "pg_return"
          }
        },
        {
          "value": "o2",
          "label": "소액 과제나 구인, 아르바이트였습니다",
          "fields": {
            "fraud_pretext": "pre_tasks",
            "fraud_pretextGroup": "pg_work"
          }
        },
        {
          "value": "o3",
          "label": "연애나 결혼, 소개였습니다",
          "fields": {
            "fraud_pretext": "pre_romance",
            "fraud_pretextGroup": "pg_relation"
          }
        },
        {
          "value": "o4",
          "label": "임대나 매매의 보증금·예약금이었습니다",
          "fields": {
            "fraud_pretext": "pre_deposit",
            "fraud_pretextGroup": "pg_deposit"
          }
        },
        {
          "value": "o5",
          "label": "택배나 관세, 상품 수령이었습니다",
          "fields": {
            "fraud_pretext": "pre_parcel",
            "fraud_pretextGroup": "pg_parcel"
          }
        },
        {
          "value": "o6",
          "label": "공안·세무·법원 같은 기관의 연락이었습니다",
          "fields": {
            "fraud_pretext": "pre_authority",
            "fraud_pretextGroup": "pg_authority"
          }
        },
        {
          "value": "o7",
          "label": "비자나 체류, 행정 업무 대행이었습니다",
          "fields": {
            "fraud_pretext": "pre_service",
            "fraud_pretextGroup": "pg_service"
          }
        },
        {
          "value": "o8",
          "label": "피해를 회복해 준다는 대행 제안이었습니다",
          "fields": {
            "fraud_pretext": "pre_recovery",
            "fraud_pretextGroup": "pg_service"
          }
        }
      ],
      "directFields": {
        "fraud_pretext": "direct_input",
        "fraud_pretextGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q3-A",
      "id": "fraud_q3_a",
      "route": "A",
      "phase": 1,
      "prompt": "상대와는 어떤 경로로 연락이 닿았나요?",
      "choices": [
        {
          "value": "o1",
          "label": "문자메시지였습니다",
          "fields": {
            "fraud_contactChannel": "text_message",
            "fraud_channelGroup": "cg_direct"
          }
        },
        {
          "value": "o2",
          "label": "전화였습니다",
          "fields": {
            "fraud_contactChannel": "phone_call",
            "fraud_channelGroup": "cg_direct"
          }
        },
        {
          "value": "o3",
          "label": "이메일이었습니다",
          "fields": {
            "fraud_contactChannel": "email_contact",
            "fraud_channelGroup": "cg_direct"
          }
        },
        {
          "value": "o4",
          "label": "메신저나 소셜 앱이었습니다",
          "fields": {
            "fraud_contactChannel": "messenger",
            "fraud_channelGroup": "cg_direct"
          }
        },
        {
          "value": "o5",
          "label": "온라인 광고나 게시글이었습니다",
          "fields": {
            "fraud_contactChannel": "online_post",
            "fraud_channelGroup": "cg_public"
          }
        },
        {
          "value": "o6",
          "label": "거래·임대·구인구직 플랫폼이었습니다",
          "fields": {
            "fraud_contactChannel": "trade_platform",
            "fraud_channelGroup": "cg_public"
          }
        },
        {
          "value": "o7",
          "label": "지인의 소개였습니다",
          "fields": {
            "fraud_contactChannel": "referral",
            "fraud_channelGroup": "cg_personal"
          }
        },
        {
          "value": "o8",
          "label": "직접 만나서 시작되었습니다",
          "fields": {
            "fraud_contactChannel": "in_person",
            "fraud_channelGroup": "cg_personal"
          }
        }
      ],
      "directFields": {
        "fraud_contactChannel": "direct_input",
        "fraud_channelGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q4-A",
      "id": "fraud_q4_a",
      "route": "A",
      "phase": 1,
      "prompt": "지금 가장 크게 걱정되는 점은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "보낸 돈이 어떻게 될지 걱정됩니다",
          "fields": {
            "fraud_mainConcern": "doubt_recover",
            "fraud_firstAction": "next_bank"
          }
        },
        {
          "value": "o2",
          "label": "상대가 계속 추가로 요구해 걱정됩니다",
          "fields": {
            "fraud_mainConcern": "doubt_more",
            "fraud_firstAction": "next_stop"
          }
        },
        {
          "value": "o3",
          "label": "상대와 연락이 끊겨 걱정됩니다",
          "fields": {
            "fraud_mainConcern": "doubt_cut",
            "fraud_firstAction": "next_evidence"
          }
        },
        {
          "value": "o4",
          "label": "어디에 알려야 하는지 모르겠습니다",
          "fields": {
            "fraud_mainConcern": "doubt_where",
            "fraud_firstAction": "next_report"
          }
        },
        {
          "value": "o5",
          "label": "증거가 부족해 걱정됩니다",
          "fields": {
            "fraud_mainConcern": "doubt_proof",
            "fraud_firstAction": "next_evidence"
          }
        },
        {
          "value": "o6",
          "label": "개인정보를 줘서 걱정됩니다",
          "fields": {
            "fraud_mainConcern": "doubt_leak",
            "fraud_firstAction": "next_protect"
          }
        }
      ],
      "directFields": {
        "fraud_mainConcern": "direct_input",
        "fraud_firstAction": "direct_input_detail"
      }
    },
    {
      "code": "Q5-B",
      "id": "fraud_q5_b",
      "route": "B",
      "phase": 2,
      "prompt": "상대나 회사 이름은 어디까지 확인되었나요?",
      "choices": [
        {
          "value": "o1",
          "label": "공식 조회로 이름과 등록 정보가 확인되었습니다",
          "fields": {
            "fraud_identityCheck": "checked_official",
            "fraud_identityTrust": "it_verified"
          }
        },
        {
          "value": "o2",
          "label": "이름은 맞지만 연락한 사람의 소속은 확인하지 못했습니다",
          "fields": {
            "fraud_identityCheck": "checked_name_only",
            "fraud_identityTrust": "it_partial"
          }
        },
        {
          "value": "o3",
          "label": "상대가 말해 준 이름만 알고 있습니다",
          "fields": {
            "fraud_identityCheck": "name_only_known",
            "fraud_identityTrust": "it_unverified"
          }
        },
        {
          "value": "o4",
          "label": "확인해 보니 정보가 맞지 않거나 가짜가 의심됩니다",
          "fields": {
            "fraud_identityCheck": "check_mismatch",
            "fraud_identityTrust": "it_suspect"
          }
        },
        {
          "value": "o5",
          "label": "아직 확인해 보지 않았습니다",
          "fields": {
            "fraud_identityCheck": "not_checked",
            "fraud_identityTrust": "it_unchecked"
          }
        }
      ],
      "directFields": {
        "fraud_identityCheck": "direct_input",
        "fraud_identityTrust": "direct_input_detail"
      }
    },
    {
      "code": "Q6-B",
      "id": "fraud_q6_b",
      "route": "B",
      "phase": 2,
      "prompt": "상대가 내세운 수익이나 조건은 어느 쪽에 가깝나요?",
      "choices": [
        {
          "value": "o1",
          "label": "원금이나 수익을 보장한다고 합니다",
          "fields": {
            "fraud_benefitType": "benefit_guaranteed",
            "fraud_benefitFlag": "bf_flag"
          }
        },
        {
          "value": "o2",
          "label": "짧은 기간에 아주 높은 확정 수익을 말합니다",
          "fields": {
            "fraud_benefitType": "benefit_high_fixed",
            "fraud_benefitFlag": "bf_flag"
          }
        },
        {
          "value": "o3",
          "label": "수수료나 보증금을 먼저 내야 한다고 합니다",
          "fields": {
            "fraud_benefitType": "benefit_fee_first",
            "fraud_benefitFlag": "bf_flag"
          }
        },
        {
          "value": "o4",
          "label": "조건은 일반적이고 특별한 보장은 없습니다",
          "fields": {
            "fraud_benefitType": "benefit_ordinary",
            "fraud_benefitFlag": "bf_normal"
          }
        },
        {
          "value": "o5",
          "label": "조건에 대한 설명이 거의 없습니다",
          "fields": {
            "fraud_benefitType": "benefit_unexplained",
            "fraud_benefitFlag": "bf_unclear"
          }
        }
      ],
      "directFields": {
        "fraud_benefitType": "direct_input",
        "fraud_benefitFlag": "direct_input_detail"
      }
    },
    {
      "code": "Q7-B",
      "id": "fraud_q7_b",
      "route": "B",
      "phase": 2,
      "prompt": "상대가 지금 요구하는 것은 무엇인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "먼저 돈을 보내라고 합니다",
          "fields": {
            "fraud_requestedAction": "send_first",
            "fraud_requestGroup": "rg_money"
          }
        },
        {
          "value": "o2",
          "label": "신분증이나 계좌 정보를 달라고 합니다",
          "fields": {
            "fraud_requestedAction": "give_info",
            "fraud_requestGroup": "rg_data"
          }
        },
        {
          "value": "o3",
          "label": "앱 설치나 로그인을 하라고 합니다",
          "fields": {
            "fraud_requestedAction": "install_login",
            "fraud_requestGroup": "rg_access"
          }
        },
        {
          "value": "o4",
          "label": "만나자거나 다른 곳으로 옮기자고 합니다",
          "fields": {
            "fraud_requestedAction": "meet_move",
            "fraud_requestGroup": "rg_meeting"
          }
        },
        {
          "value": "o5",
          "label": "서명이나 계약을 서두르라고 합니다",
          "fields": {
            "fraud_requestedAction": "sign_now",
            "fraud_requestGroup": "rg_signing"
          }
        },
        {
          "value": "o6",
          "label": "비밀로 하고 다른 사람에게 말하지 말라고 합니다",
          "fields": {
            "fraud_requestedAction": "keep_secret",
            "fraud_requestGroup": "rg_secret"
          }
        }
      ],
      "directFields": {
        "fraud_requestedAction": "direct_input",
        "fraud_requestGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q8-B",
      "id": "fraud_q8_b",
      "route": "B",
      "phase": 2,
      "prompt": "송금하라는 계좌의 명의는 어떻게 되어 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "서류에 적힌 상대의 이름과 같습니다",
          "fields": {
            "fraud_accountMatch": "matches_party",
            "fraud_accountFlag": "af_consistent"
          }
        },
        {
          "value": "o2",
          "label": "서류에 적힌 상대의 이름과 다릅니다",
          "fields": {
            "fraud_accountMatch": "differs_party",
            "fraud_accountFlag": "af_mismatch"
          }
        },
        {
          "value": "o3",
          "label": "개인 명의 계좌입니다",
          "fields": {
            "fraud_accountMatch": "personal_account",
            "fraud_accountFlag": "af_personal"
          }
        },
        {
          "value": "o4",
          "label": "계좌가 여러 개이거나 자주 바뀝니다",
          "fields": {
            "fraud_accountMatch": "multiple_accounts",
            "fraud_accountFlag": "af_changing"
          }
        },
        {
          "value": "o5",
          "label": "해외 계좌나 가상자산 주소입니다",
          "fields": {
            "fraud_accountMatch": "overseas_or_crypto",
            "fraud_accountFlag": "af_untraceable"
          }
        },
        {
          "value": "o6",
          "label": "계좌가 아직 안내되지 않았습니다",
          "fields": {
            "fraud_accountMatch": "account_not_given",
            "fraud_accountFlag": "af_unknown"
          }
        }
      ],
      "directFields": {
        "fraud_accountMatch": "direct_input",
        "fraud_accountFlag": "direct_input_detail"
      }
    },
    {
      "code": "Q9-B",
      "id": "fraud_q9_b",
      "route": "B",
      "phase": 2,
      "prompt": "상대는 어떤 방식으로 재촉하나요?",
      "choices": [
        {
          "value": "o1",
          "label": "재촉은 없습니다",
          "fields": {
            "fraud_pressureType": "press_none",
            "fraud_pressureLevel": "pl_none"
          }
        },
        {
          "value": "o2",
          "label": "기한을 정해 두고 그 안에 하라고 합니다",
          "fields": {
            "fraud_pressureType": "press_deadline",
            "fraud_pressureLevel": "pl_low"
          }
        },
        {
          "value": "o3",
          "label": "이번 기회만 있다며 마감이 임박했다고 합니다",
          "fields": {
            "fraud_pressureType": "press_scarcity",
            "fraud_pressureLevel": "pl_mid"
          }
        },
        {
          "value": "o4",
          "label": "비밀로 하라며 다른 사람에게 말하지 못하게 합니다",
          "fields": {
            "fraud_pressureType": "press_secret",
            "fraud_pressureLevel": "pl_high"
          }
        },
        {
          "value": "o5",
          "label": "확인해 보겠다고 하면 화를 내거나 말을 돌립니다",
          "fields": {
            "fraud_pressureType": "press_evasive",
            "fraud_pressureLevel": "pl_high"
          }
        },
        {
          "value": "o6",
          "label": "지인이나 다른 사람을 내세워 압박합니다",
          "fields": {
            "fraud_pressureType": "press_third_party",
            "fraud_pressureLevel": "pl_mid"
          }
        }
      ],
      "directFields": {
        "fraud_pressureType": "direct_input",
        "fraud_pressureLevel": "direct_input_detail"
      }
    },
    {
      "code": "Q10-B",
      "id": "fraud_q10_b",
      "route": "B",
      "phase": 2,
      "prompt": "받은 서류나 기록은 어떤 것이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "상대 정보가 모두 적힌 계약서나 약정서가 있습니다",
          "fields": {
            "fraud_recordKind": "contract_full",
            "fraud_recordGroup": "rec_formal"
          }
        },
        {
          "value": "o2",
          "label": "상대 정보가 일부만 적힌 계약서나 제안서가 있습니다",
          "fields": {
            "fraud_recordKind": "contract_partial",
            "fraud_recordGroup": "rec_formal"
          }
        },
        {
          "value": "o3",
          "label": "안내문이나 광고 화면만 있습니다",
          "fields": {
            "fraud_recordKind": "notice_only",
            "fraud_recordGroup": "rec_informal"
          }
        },
        {
          "value": "o4",
          "label": "대화 내용만 있습니다",
          "fields": {
            "fraud_recordKind": "chat_log",
            "fraud_recordGroup": "rec_informal"
          }
        },
        {
          "value": "o5",
          "label": "입금 안내만 받았습니다",
          "fields": {
            "fraud_recordKind": "pay_request",
            "fraud_recordGroup": "rec_payment"
          }
        },
        {
          "value": "o6",
          "label": "받은 서류가 없습니다",
          "fields": {
            "fraud_recordKind": "no_record",
            "fraud_recordGroup": "rec_none"
          }
        }
      ],
      "directFields": {
        "fraud_recordKind": "direct_input",
        "fraud_recordGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q11-B",
      "id": "fraud_q11_b",
      "route": "B",
      "phase": 2,
      "prompt": "지금까지 이 제안과 관련해 한 일이 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "아무것도 하지 않았습니다",
          "fields": {
            "fraud_actionTaken": "nothing_yet",
            "fraud_exposureLevel": "exp_none"
          }
        },
        {
          "value": "o2",
          "label": "문의만 해 보았습니다",
          "fields": {
            "fraud_actionTaken": "asked_only",
            "fraud_exposureLevel": "exp_low"
          }
        },
        {
          "value": "o3",
          "label": "개인정보나 신분증을 이미 보냈습니다",
          "fields": {
            "fraud_actionTaken": "gave_info",
            "fraud_exposureLevel": "exp_info"
          }
        },
        {
          "value": "o4",
          "label": "앱을 설치했거나 로그인했습니다",
          "fields": {
            "fraud_actionTaken": "installed_app",
            "fraud_exposureLevel": "exp_access"
          }
        },
        {
          "value": "o5",
          "label": "소액을 먼저 보냈습니다",
          "fields": {
            "fraud_actionTaken": "sent_small",
            "fraud_exposureLevel": "exp_money"
          }
        },
        {
          "value": "o6",
          "label": "서명이나 도장을 이미 했습니다",
          "fields": {
            "fraud_actionTaken": "signed_already",
            "fraud_exposureLevel": "exp_signed"
          }
        }
      ],
      "directFields": {
        "fraud_actionTaken": "direct_input",
        "fraud_exposureLevel": "direct_input_detail"
      }
    },
    {
      "code": "Q12-B",
      "id": "fraud_q12_b",
      "route": "B",
      "phase": 2,
      "prompt": "확인해 보겠다고 하면 상대는 어떻게 반응하나요?",
      "choices": [
        {
          "value": "o1",
          "label": "기꺼이 필요한 자료를 줍니다",
          "fields": {
            "fraud_verifyReaction": "react_open",
            "fraud_reactionFlag": "rf_open"
          }
        },
        {
          "value": "o2",
          "label": "대답이 매번 바뀌거나 앞뒤가 맞지 않습니다",
          "fields": {
            "fraud_verifyReaction": "react_inconsistent",
            "fraud_reactionFlag": "rf_flag"
          }
        },
        {
          "value": "o3",
          "label": "화를 내거나 서두르라고 합니다",
          "fields": {
            "fraud_verifyReaction": "react_pressure",
            "fraud_reactionFlag": "rf_flag"
          }
        },
        {
          "value": "o4",
          "label": "연락을 끊거나 차단합니다",
          "fields": {
            "fraud_verifyReaction": "react_cut",
            "fraud_reactionFlag": "rf_flag"
          }
        },
        {
          "value": "o5",
          "label": "아직 확인해 보겠다고 말해 보지 않았습니다",
          "fields": {
            "fraud_verifyReaction": "react_untested",
            "fraud_reactionFlag": "rf_unknown"
          }
        }
      ],
      "directFields": {
        "fraud_verifyReaction": "direct_input",
        "fraud_reactionFlag": "direct_input_detail"
      }
    },
    {
      "code": "Q13-B",
      "id": "fraud_q13_b",
      "route": "B",
      "phase": 2,
      "prompt": "대화·서류·입금 내역은 어느 정도 남아 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "대화와 서류, 입금 내역이 모두 있습니다",
          "fields": {
            "fraud_evidenceState": "all_kept",
            "fraud_evidenceGroup": "eg_strong"
          }
        },
        {
          "value": "o2",
          "label": "대화만 있습니다",
          "fields": {
            "fraud_evidenceState": "chat_only",
            "fraud_evidenceGroup": "eg_medium"
          }
        },
        {
          "value": "o3",
          "label": "서류만 있고 대화는 남아 있지 않습니다",
          "fields": {
            "fraud_evidenceState": "docs_only",
            "fraud_evidenceGroup": "eg_medium"
          }
        },
        {
          "value": "o4",
          "label": "일부를 지웠거나 잃어버렸습니다",
          "fields": {
            "fraud_evidenceState": "deleted_some",
            "fraud_evidenceGroup": "eg_weak"
          }
        },
        {
          "value": "o5",
          "label": "남은 자료가 없습니다",
          "fields": {
            "fraud_evidenceState": "none_kept",
            "fraud_evidenceGroup": "eg_weak"
          }
        }
      ],
      "directFields": {
        "fraud_evidenceState": "direct_input",
        "fraud_evidenceGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q5-A",
      "id": "fraud_q5_a",
      "route": "A",
      "phase": 2,
      "prompt": "문제를 알게 된 지 얼마나 되었나요?",
      "choices": [
        {
          "value": "o1",
          "label": "오늘이나 어제 알게 되었습니다",
          "fields": {
            "fraud_elapsedTime": "elapsed_today",
            "fraud_urgencyTier": "ut_urgent"
          }
        },
        {
          "value": "o2",
          "label": "일주일 안입니다",
          "fields": {
            "fraud_elapsedTime": "elapsed_week",
            "fraud_urgencyTier": "ut_soon"
          }
        },
        {
          "value": "o3",
          "label": "한 달 안입니다",
          "fields": {
            "fraud_elapsedTime": "elapsed_month",
            "fraud_urgencyTier": "ut_soon"
          }
        },
        {
          "value": "o4",
          "label": "반년 안입니다",
          "fields": {
            "fraud_elapsedTime": "elapsed_half_year",
            "fraud_urgencyTier": "ut_late"
          }
        },
        {
          "value": "o5",
          "label": "반년이 넘었습니다",
          "fields": {
            "fraud_elapsedTime": "elapsed_over_half",
            "fraud_urgencyTier": "ut_late"
          }
        }
      ],
      "directFields": {
        "fraud_elapsedTime": "direct_input",
        "fraud_urgencyTier": "direct_input_detail"
      }
    },
    {
      "code": "Q6-A",
      "id": "fraud_q6_a",
      "route": "A",
      "phase": 2,
      "prompt": "어떻게 문제를 알게 되었나요?",
      "choices": [
        {
          "value": "o1",
          "label": "상대와 연락이 끊겼습니다",
          "fields": {
            "fraud_discovery": "disc_contact_cut",
            "fraud_discoveryGroup": "dg_counterparty"
          }
        },
        {
          "value": "o2",
          "label": "약속한 일이 지켜지지 않았습니다",
          "fields": {
            "fraud_discovery": "disc_broken_promise",
            "fraud_discoveryGroup": "dg_counterparty"
          }
        },
        {
          "value": "o3",
          "label": "추가 비용을 계속 요구했습니다",
          "fields": {
            "fraud_discovery": "disc_more_fees",
            "fraud_discoveryGroup": "dg_counterparty"
          }
        },
        {
          "value": "o4",
          "label": "주변이나 뉴스에서 같은 수법을 알게 되었습니다",
          "fields": {
            "fraud_discovery": "disc_heard_similar",
            "fraud_discoveryGroup": "dg_outside"
          }
        },
        {
          "value": "o5",
          "label": "은행이나 플랫폼에서 알려 주었습니다",
          "fields": {
            "fraud_discovery": "disc_bank_notice",
            "fraud_discoveryGroup": "dg_outside"
          }
        },
        {
          "value": "o6",
          "label": "스스로 의심이 들어 확인해 보다가 알게 되었습니다",
          "fields": {
            "fraud_discovery": "disc_self_check",
            "fraud_discoveryGroup": "dg_self"
          }
        }
      ],
      "directFields": {
        "fraud_discovery": "direct_input",
        "fraud_discoveryGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q7-A",
      "id": "fraud_q7_a",
      "route": "A",
      "phase": 2,
      "prompt": "지금 상대는 어떤 상태인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "연락이 되고 계속 추가로 요구합니다",
          "fields": {
            "fraud_counterpartyStance": "demands_more",
            "fraud_contactStatus": "contact_active"
          }
        },
        {
          "value": "o2",
          "label": "연락은 되지만 변명하거나 미룹니다",
          "fields": {
            "fraud_counterpartyStance": "excuses",
            "fraud_contactStatus": "contact_active"
          }
        },
        {
          "value": "o3",
          "label": "위협하거나 협박합니다",
          "fields": {
            "fraud_counterpartyStance": "threatens",
            "fraud_contactStatus": "contact_active"
          }
        },
        {
          "value": "o4",
          "label": "연락이 끊겼습니다",
          "fields": {
            "fraud_counterpartyStance": "silent",
            "fraud_contactStatus": "contact_cut"
          }
        },
        {
          "value": "o5",
          "label": "차단되었거나 번호·계정이 바뀌었습니다",
          "fields": {
            "fraud_counterpartyStance": "blocked_changed",
            "fraud_contactStatus": "contact_blocked"
          }
        }
      ],
      "directFields": {
        "fraud_counterpartyStance": "direct_input",
        "fraud_contactStatus": "direct_input_detail"
      }
    },
    {
      "code": "Q8-A",
      "id": "fraud_q8_a",
      "route": "A",
      "phase": 2,
      "prompt": "돈은 어떤 방식으로 보냈나요?",
      "choices": [
        {
          "value": "o1",
          "label": "은행 계좌 이체입니다",
          "fields": {
            "fraud_payMethod": "pay_bank",
            "fraud_traceability": "tr_traceable"
          }
        },
        {
          "value": "o2",
          "label": "결제 앱이나 전자지갑입니다",
          "fields": {
            "fraud_payMethod": "pay_wallet",
            "fraud_traceability": "tr_traceable"
          }
        },
        {
          "value": "o3",
          "label": "가상자산입니다",
          "fields": {
            "fraud_payMethod": "pay_crypto",
            "fraud_traceability": "tr_hard"
          }
        },
        {
          "value": "o4",
          "label": "현금으로 직접 건넸습니다",
          "fields": {
            "fraud_payMethod": "pay_cash",
            "fraud_traceability": "tr_hard"
          }
        },
        {
          "value": "o5",
          "label": "상품권이나 선불카드입니다",
          "fields": {
            "fraud_payMethod": "pay_voucher",
            "fraud_traceability": "tr_hard"
          }
        },
        {
          "value": "o6",
          "label": "아직 돈은 보내지 않았습니다",
          "fields": {
            "fraud_payMethod": "pay_none",
            "fraud_traceability": "tr_none"
          }
        }
      ],
      "directFields": {
        "fraud_payMethod": "direct_input",
        "fraud_traceability": "direct_input_detail"
      }
    },
    {
      "code": "Q9-A",
      "id": "fraud_q9_a",
      "route": "A",
      "phase": 2,
      "prompt": "보낸 돈은 모두 합쳐 어느 정도인가요?",
      "choices": [
        {
          "value": "o1",
          "label": "보내지 않았습니다",
          "fields": {
            "fraud_lossScale": "loss_none",
            "fraud_lossTier": "lt_none"
          }
        },
        {
          "value": "o2",
          "label": "100만 동 미만입니다",
          "fields": {
            "fraud_lossScale": "loss_under_1m",
            "fraud_lossTier": "lt_small"
          }
        },
        {
          "value": "o3",
          "label": "100만 동 이상 1천만 동 미만입니다",
          "fields": {
            "fraud_lossScale": "loss_1m_10m",
            "fraud_lossTier": "lt_medium"
          }
        },
        {
          "value": "o4",
          "label": "1천만 동 이상 1억 동 미만입니다",
          "fields": {
            "fraud_lossScale": "loss_10m_100m",
            "fraud_lossTier": "lt_large"
          }
        },
        {
          "value": "o5",
          "label": "1억 동 이상입니다",
          "fields": {
            "fraud_lossScale": "loss_over_100m",
            "fraud_lossTier": "lt_xlarge"
          }
        }
      ],
      "directFields": {
        "fraud_lossScale": "direct_input",
        "fraud_lossTier": "direct_input_detail"
      }
    },
    {
      "code": "Q10-A",
      "id": "fraud_q10_a",
      "route": "A",
      "phase": 2,
      "prompt": "송금은 몇 번, 몇 개의 계좌로 했나요?",
      "choices": [
        {
          "value": "o1",
          "label": "한 번, 한 계좌로 보냈습니다",
          "fields": {
            "fraud_transferPattern": "tp_once_one",
            "fraud_accountFlag": "af_single"
          }
        },
        {
          "value": "o2",
          "label": "여러 번 같은 계좌로 보냈습니다",
          "fields": {
            "fraud_transferPattern": "tp_many_one",
            "fraud_accountFlag": "af_single"
          }
        },
        {
          "value": "o3",
          "label": "여러 계좌로 나누어 보냈습니다",
          "fields": {
            "fraud_transferPattern": "tp_many_multi",
            "fraud_accountFlag": "af_multiple"
          }
        },
        {
          "value": "o4",
          "label": "받은 계좌가 어디인지 알지 못합니다",
          "fields": {
            "fraud_transferPattern": "tp_unknown",
            "fraud_accountFlag": "af_unknown"
          }
        },
        {
          "value": "o5",
          "label": "송금한 적이 없습니다",
          "fields": {
            "fraud_transferPattern": "tp_none",
            "fraud_accountFlag": "af_none"
          }
        }
      ],
      "directFields": {
        "fraud_transferPattern": "direct_input",
        "fraud_accountFlag": "direct_input_detail"
      }
    },
    {
      "code": "Q11-A",
      "id": "fraud_q11_a",
      "route": "A",
      "phase": 2,
      "prompt": "상대에게 어떤 정보를 주었나요?",
      "choices": [
        {
          "value": "o1",
          "label": "개인정보는 주지 않았습니다",
          "fields": {
            "fraud_infoGiven": "info_none",
            "fraud_infoRisk": "ir_none"
          }
        },
        {
          "value": "o2",
          "label": "이름과 연락처 정도를 알려 주었습니다",
          "fields": {
            "fraud_infoGiven": "info_basic",
            "fraud_infoRisk": "ir_low"
          }
        },
        {
          "value": "o3",
          "label": "신분증이나 여권 사본을 보냈습니다",
          "fields": {
            "fraud_infoGiven": "info_id_copy",
            "fraud_infoRisk": "ir_id"
          }
        },
        {
          "value": "o4",
          "label": "계좌·카드 정보나 인증번호를 알려 주었습니다",
          "fields": {
            "fraud_infoGiven": "info_finance",
            "fraud_infoRisk": "ir_finance"
          }
        },
        {
          "value": "o5",
          "label": "앱을 설치했거나 원격 접속을 허용했습니다",
          "fields": {
            "fraud_infoGiven": "info_remote",
            "fraud_infoRisk": "ir_device"
          }
        }
      ],
      "directFields": {
        "fraud_infoGiven": "direct_input",
        "fraud_infoRisk": "direct_input_detail"
      }
    },
    {
      "code": "Q12-A",
      "id": "fraud_q12_a",
      "route": "A",
      "phase": 2,
      "prompt": "지금까지 어떤 조치를 해 보셨나요?",
      "choices": [
        {
          "value": "o1",
          "label": "아직 아무 조치도 하지 않았습니다",
          "fields": {
            "fraud_actionTaken": "nothing_yet",
            "fraud_actionGroup": "ag_none"
          }
        },
        {
          "value": "o2",
          "label": "거래 은행에 문의하거나 요청했습니다",
          "fields": {
            "fraud_actionTaken": "bank_recall",
            "fraud_actionGroup": "ag_official"
          }
        },
        {
          "value": "o3",
          "label": "거래 플랫폼에 신고했습니다",
          "fields": {
            "fraud_actionTaken": "platform_report",
            "fraud_actionGroup": "ag_official"
          }
        },
        {
          "value": "o4",
          "label": "공안이나 수사기관에 알렸습니다",
          "fields": {
            "fraud_actionTaken": "police_report",
            "fraud_actionGroup": "ag_official"
          }
        },
        {
          "value": "o5",
          "label": "상대에게 직접 환불이나 해결을 요청했습니다",
          "fields": {
            "fraud_actionTaken": "direct_refund",
            "fraud_actionGroup": "ag_informal"
          }
        },
        {
          "value": "o6",
          "label": "주변 사람에게 상담했습니다",
          "fields": {
            "fraud_actionTaken": "consulted_others",
            "fraud_actionGroup": "ag_informal"
          }
        }
      ],
      "directFields": {
        "fraud_actionTaken": "direct_input",
        "fraud_actionGroup": "direct_input_detail"
      }
    },
    {
      "code": "Q13-A",
      "id": "fraud_q13_a",
      "route": "A",
      "phase": 2,
      "prompt": "대화·서류·입금 내역은 어느 정도 남아 있나요?",
      "choices": [
        {
          "value": "o1",
          "label": "대화와 서류, 입금 내역이 모두 있습니다",
          "fields": {
            "fraud_evidenceState": "all_kept",
            "fraud_evidenceGroup": "eg_strong"
          }
        },
        {
          "value": "o2",
          "label": "입금 내역만 있습니다",
          "fields": {
            "fraud_evidenceState": "payment_only",
            "fraud_evidenceGroup": "eg_medium"
          }
        },
        {
          "value": "o3",
          "label": "대화만 있습니다",
          "fields": {
            "fraud_evidenceState": "chat_only",
            "fraud_evidenceGroup": "eg_medium"
          }
        },
        {
          "value": "o4",
          "label": "일부를 지웠거나 잃어버렸습니다",
          "fields": {
            "fraud_evidenceState": "deleted_some",
            "fraud_evidenceGroup": "eg_weak"
          }
        },
        {
          "value": "o5",
          "label": "남은 자료가 없습니다",
          "fields": {
            "fraud_evidenceState": "none_kept",
            "fraud_evidenceGroup": "eg_weak"
          }
        }
      ],
      "directFields": {
        "fraud_evidenceState": "direct_input",
        "fraud_evidenceGroup": "direct_input_detail"
      }
    }
  ],
  "firstResult": {
    "B": {
      "cards": [
        {
          "questionCode": "Q1-B",
          "title": "받은 제안의 종류",
          "sentences": {
            "fraud_scheme=investment|fraud_schemeGroup=sg_return": "투자·수익·사업 제휴 제안을 받은 상황입니다",
            "fraud_scheme=loan|fraud_schemeGroup=sg_finance": "대출 제안을 받은 상황입니다",
            "fraud_scheme=online_trade|fraud_schemeGroup=sg_trade": "온라인 거래·임대 제안을 받은 상황입니다",
            "fraud_scheme=impersonation|fraud_schemeGroup=sg_identity": "기관·지인·일자리·연애를 내세운 제안을 받은 상황입니다",
            "fraud_scheme=unsure_scheme|fraud_schemeGroup=sg_unknown": "어떤 종류인지 알 수 없는 제안을 받은 상황입니다"
          }
        },
        {
          "questionCode": "Q2-B",
          "title": "상대가 내세운 명목",
          "sentences": {
            "fraud_pretext=pre_invest|fraud_pretextGroup=pg_return": "고수익·투자·사업 제휴를 명목으로 한 제안입니다",
            "fraud_pretext=pre_tasks|fraud_pretextGroup=pg_work": "과제·구인·아르바이트를 명목으로 한 제안입니다",
            "fraud_pretext=pre_romance|fraud_pretextGroup=pg_relation": "연애·결혼·소개를 명목으로 한 제안입니다",
            "fraud_pretext=pre_deposit|fraud_pretextGroup=pg_deposit": "임대·매매 보증금을 명목으로 한 제안입니다",
            "fraud_pretext=pre_parcel|fraud_pretextGroup=pg_parcel": "택배·관세·상품 수령을 명목으로 한 제안입니다",
            "fraud_pretext=pre_authority|fraud_pretextGroup=pg_authority": "기관을 내세워 접근한 제안입니다",
            "fraud_pretext=pre_service|fraud_pretextGroup=pg_service": "비자·체류·행정 대행을 명목으로 한 제안입니다",
            "fraud_pretext=pre_unsure|fraud_pretextGroup=pg_unknown": "명목이 분명하지 않은 제안입니다"
          }
        },
        {
          "questionCode": "Q3-B",
          "title": "연락이 닿은 경로",
          "sentences": {
            "fraud_contactChannel=text_message|fraud_channelGroup=cg_direct": "문자메시지로 연락이 닿은 제안입니다",
            "fraud_contactChannel=phone_call|fraud_channelGroup=cg_direct": "전화로 연락이 닿은 제안입니다",
            "fraud_contactChannel=email_contact|fraud_channelGroup=cg_direct": "이메일로 연락이 닿은 제안입니다",
            "fraud_contactChannel=messenger|fraud_channelGroup=cg_direct": "메신저나 소셜 앱으로 연락이 닿은 제안입니다",
            "fraud_contactChannel=online_post|fraud_channelGroup=cg_public": "온라인 광고·게시글로 시작된 제안입니다",
            "fraud_contactChannel=trade_platform|fraud_channelGroup=cg_public": "거래·구인구직 플랫폼에서 시작된 제안입니다",
            "fraud_contactChannel=referral|fraud_channelGroup=cg_personal": "지인의 소개로 시작된 제안입니다",
            "fraud_contactChannel=in_person|fraud_channelGroup=cg_personal": "직접 만나서 시작된 제안입니다"
          }
        }
      ],
      "verdicts": {
        "fraud_mainConcern=doubt_party|fraud_firstAction=next_party": {
          "headline": "상대의 실체 확인이 먼저 필요한 제안입니다",
          "body": "상대가 알려 준 연락처가 아니라 공식 조회와 공개 자료로 이름과 등록 정보를 확인하세요. 확인이 끝나기 전에는 송금이나 서명을 미루는 것이 안전합니다."
        },
        "fraud_mainConcern=doubt_sign|fraud_firstAction=next_terms": {
          "headline": "서명 전에 조건과 서류 확인이 필요한 제안입니다",
          "body": "서명한 문서는 이후 다투기 어려울 수 있어 조건을 읽고 이해한 뒤에 서명하세요. 말로 들은 조건이 문서에도 있는지 대조해 보세요."
        },
        "fraud_mainConcern=doubt_prepay|fraud_firstAction=next_hold": {
          "headline": "먼저 송금하라는 요구는 확인 후에 판단할 제안입니다",
          "body": "수익이나 서비스를 받기 전에 먼저 돈을 내라는 구조는 특히 신중해야 합니다. 보내기 전에 상대 정보와 계좌 명의를 확인하고 요구 내용을 글로 남겨 두세요."
        },
        "fraud_mainConcern=doubt_data|fraud_firstAction=next_protect": {
          "headline": "개인정보 제공 전에 요구의 필요성을 확인해야 하는 제안입니다",
          "body": "신분증이나 계좌, 인증번호는 필요한 이유를 확인하기 전에는 제공하지 않는 것이 안전합니다. 꼭 필요한 항목만 내도 되는지 먼저 물어보세요."
        },
        "fraud_mainConcern=doubt_terms|fraud_firstAction=next_terms": {
          "headline": "조건이 지나치게 유리해 보여 근거 확인이 필요한 제안입니다",
          "body": "높은 수익이나 보장을 내세운다면 그 근거가 문서와 공식 자료로 확인되는지 따져 보세요. 확인되지 않는 보장은 신중하게 보는 것이 좋습니다."
        },
        "fraud_mainConcern=doubt_rush|fraud_firstAction=next_hold": {
          "headline": "재촉에 흔들리지 않고 확인할 시간이 필요한 상황입니다",
          "body": "서두르게 만드는 요구는 확인할 시간을 주지 않으려는 방식일 수 있습니다. 시간을 달라고 말한 뒤 상대의 반응도 함께 기록해 두세요."
        }
      },
      "verdictQuestionCode": "Q4-B",
      "risks": {
        "rules": [
          {
            "clauses": [
              {
                "field": "fraud_actionTaken",
                "values": [
                  "gave_info",
                  "installed_app",
                  "sent_small",
                  "signed_already"
                ]
              },
              {
                "field": "fraud_exposureLevel",
                "values": [
                  "exp_info",
                  "exp_access",
                  "exp_money",
                  "exp_signed"
                ]
              }
            ],
            "excludes": [],
            "sentence": "이미 정보를 주었거나 앱을 설치했거나 송금·서명을 했다면 추가 응답 전에 상황 정리가 먼저입니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_accountMatch",
                "values": [
                  "differs_party",
                  "multiple_accounts",
                  "personal_account",
                  "overseas_or_crypto"
                ]
              },
              {
                "field": "fraud_accountFlag",
                "values": [
                  "af_mismatch",
                  "af_changing",
                  "af_untraceable"
                ]
              }
            ],
            "excludes": [],
            "sentence": "송금 계좌의 명의나 수단이 서류와 맞지 않거나 되돌리기 어려워 보내기 전에 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_benefitType",
                "values": [
                  "benefit_fee_first",
                  "benefit_guaranteed",
                  "benefit_high_fixed"
                ]
              },
              {
                "field": "fraud_requestedAction",
                "values": [
                  "send_first"
                ]
              },
              {
                "field": "fraud_mainConcern",
                "values": [
                  "doubt_prepay"
                ]
              }
            ],
            "excludes": [],
            "sentence": "먼저 돈을 내거나 수익을 보장한다는 조건은 근거를 확인하기 전에는 응하지 않는 것이 안전합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_pressureType",
                "values": [
                  "press_secret",
                  "press_evasive",
                  "press_scarcity",
                  "press_third_party"
                ]
              },
              {
                "field": "fraud_pressureLevel",
                "values": [
                  "pl_high"
                ]
              },
              {
                "field": "fraud_verifyReaction",
                "values": [
                  "react_pressure",
                  "react_cut",
                  "react_inconsistent"
                ]
              }
            ],
            "excludes": [],
            "sentence": "재촉이나 비밀 요구, 확인을 피하는 반응은 확인할 시간을 막는 신호일 수 있습니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_identityCheck",
                "values": [
                  "name_only_known",
                  "check_mismatch",
                  "not_checked",
                  "checked_name_only"
                ]
              },
              {
                "field": "fraud_identityTrust",
                "values": [
                  "it_suspect",
                  "it_unchecked",
                  "it_unverified"
                ]
              }
            ],
            "excludes": [],
            "sentence": "상대나 회사 정보가 확인되지 않아 송금이나 서명 전에 공식 자료로 대조해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_pretext",
                "values": [
                  "pre_authority"
                ]
              },
              {
                "field": "fraud_pretextGroup",
                "values": [
                  "pg_authority"
                ]
              }
            ],
            "excludes": [],
            "sentence": "기관을 내세운 연락이라면 연락처가 아니라 공식 자료의 연락처로 사실을 먼저 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_recordKind",
                "values": [
                  "chat_log",
                  "pay_request",
                  "no_record",
                  "notice_only"
                ]
              },
              {
                "field": "fraud_recordGroup",
                "values": [
                  "rec_none",
                  "rec_payment"
                ]
              }
            ],
            "excludes": [],
            "sentence": "서류나 상대 정보가 부족해 조건을 문서로 받아 두는 것이 먼저입니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_evidenceState",
                "values": [
                  "deleted_some",
                  "none_kept"
                ]
              }
            ],
            "excludes": [],
            "sentence": "남은 자료가 부족해 지금부터 오는 연락과 안내를 모두 저장해 두어야 합니다"
          }
        ],
        "fallback": "입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 서명이나 송금 전에 상대와 서류를 한 번 더 확인하세요",
        "max": 4
      }
    },
    "A": {
      "cards": [
        {
          "questionCode": "Q1-A",
          "title": "겪은 문제의 종류",
          "sentences": {
            "fraud_scheme=investment|fraud_schemeGroup=sg_return": "투자·수익·사업 제휴 관련 문제를 겪은 상황입니다",
            "fraud_scheme=loan|fraud_schemeGroup=sg_finance": "대출 관련 문제를 겪은 상황입니다",
            "fraud_scheme=online_trade|fraud_schemeGroup=sg_trade": "온라인 거래·임대 관련 문제를 겪은 상황입니다",
            "fraud_scheme=impersonation|fraud_schemeGroup=sg_identity": "기관·지인·일자리·연애를 내세운 상대와 문제를 겪은 상황입니다",
            "fraud_scheme=unsure_scheme|fraud_schemeGroup=sg_unknown": "어떤 종류인지 알 수 없는 문제를 겪은 상황입니다"
          }
        },
        {
          "questionCode": "Q2-A",
          "title": "상대가 내세웠던 명목",
          "sentences": {
            "fraud_pretext=pre_invest|fraud_pretextGroup=pg_return": "고수익·투자·사업 제휴를 명목으로 한 일입니다",
            "fraud_pretext=pre_tasks|fraud_pretextGroup=pg_work": "과제·구인·아르바이트를 명목으로 한 일입니다",
            "fraud_pretext=pre_romance|fraud_pretextGroup=pg_relation": "연애·결혼·소개를 명목으로 한 일입니다",
            "fraud_pretext=pre_deposit|fraud_pretextGroup=pg_deposit": "임대·매매 보증금을 명목으로 한 일입니다",
            "fraud_pretext=pre_parcel|fraud_pretextGroup=pg_parcel": "택배·관세·상품 수령을 명목으로 한 일입니다",
            "fraud_pretext=pre_authority|fraud_pretextGroup=pg_authority": "기관을 내세워 접근한 일입니다",
            "fraud_pretext=pre_service|fraud_pretextGroup=pg_service": "비자·체류·행정 대행을 명목으로 한 일입니다",
            "fraud_pretext=pre_recovery|fraud_pretextGroup=pg_service": "피해 회복 대행을 명목으로 접근받은 일입니다"
          }
        },
        {
          "questionCode": "Q3-A",
          "title": "연락이 닿았던 경로",
          "sentences": {
            "fraud_contactChannel=text_message|fraud_channelGroup=cg_direct": "문자메시지로 연락이 닿았던 일입니다",
            "fraud_contactChannel=phone_call|fraud_channelGroup=cg_direct": "전화로 연락이 닿았던 일입니다",
            "fraud_contactChannel=email_contact|fraud_channelGroup=cg_direct": "이메일로 연락이 닿았던 일입니다",
            "fraud_contactChannel=messenger|fraud_channelGroup=cg_direct": "메신저나 소셜 앱으로 연락이 닿았던 일입니다",
            "fraud_contactChannel=online_post|fraud_channelGroup=cg_public": "온라인 광고·게시글에서 시작된 일입니다",
            "fraud_contactChannel=trade_platform|fraud_channelGroup=cg_public": "거래·구인구직 플랫폼에서 시작된 일입니다",
            "fraud_contactChannel=referral|fraud_channelGroup=cg_personal": "지인의 소개로 시작된 일입니다",
            "fraud_contactChannel=in_person|fraud_channelGroup=cg_personal": "직접 만나서 시작된 일입니다"
          }
        }
      ],
      "verdicts": {
        "fraud_mainConcern=doubt_recover|fraud_firstAction=next_bank": {
          "headline": "송금 후 가능한 조치를 빨리 확인해야 하는 상황입니다",
          "body": "송금 내역과 받은 계좌 정보를 정리해 가능한 한 빨리 거래 은행에 문의해 보세요. 피해 회복 여부는 사정에 따라 달라 이 서비스에서 판단하지 않습니다."
        },
        "fraud_mainConcern=doubt_more|fraud_firstAction=next_stop": {
          "headline": "추가 요구에 응하기 전에 멈추는 것이 우선인 상황입니다",
          "body": "더 보내면 해결된다는 말에는 응하지 말고 요구 내용과 날짜를 그대로 보관하세요. 이미 보낸 내역을 정리한 뒤 전문가 확인을 살펴보세요."
        },
        "fraud_mainConcern=doubt_cut|fraud_firstAction=next_evidence": {
          "headline": "남은 대화와 송금 기록을 먼저 확보해야 하는 상황입니다",
          "body": "상대 계정, 번호, 계좌 정보가 남아 있을 때 화면을 날짜와 함께 저장하세요. 연락이 끊겼다는 사실도 날짜와 함께 기록하세요."
        },
        "fraud_mainConcern=doubt_where|fraud_firstAction=next_report": {
          "headline": "알릴 곳과 준비 자료를 정리해야 하는 상황입니다",
          "body": "송금한 은행, 거래한 플랫폼, 수사기관 중 어디에 어떤 자료를 낼지 정해 두면 도움이 됩니다. 알리는 방법은 구두나 서면이 가능하니 자료를 먼저 정리하세요."
        },
        "fraud_mainConcern=doubt_proof|fraud_firstAction=next_evidence": {
          "headline": "남은 자료를 다시 모으는 것이 먼저인 상황입니다",
          "body": "은행 거래 내역과 앱 기록에서 다시 모을 수 있는 자료가 있는지 확인하세요. 기억나는 내용도 날짜순으로 적어 두면 도움이 됩니다."
        },
        "fraud_mainConcern=doubt_leak|fraud_firstAction=next_protect": {
          "headline": "제공한 개인정보를 보호하는 조치가 먼저 필요한 상황입니다",
          "body": "제공한 정보의 종류와 날짜를 정리하세요. 계좌나 인증번호를 줬다면 해당 금융기관에 알리는 방법을 먼저 확인하세요."
        }
      },
      "verdictQuestionCode": "Q4-A",
      "risks": {
        "rules": [
          {
            "clauses": [
              {
                "field": "fraud_lossScale",
                "values": [
                  "loss_10m_100m",
                  "loss_over_100m"
                ]
              },
              {
                "field": "fraud_lossTier",
                "values": [
                  "lt_large",
                  "lt_xlarge"
                ]
              }
            ],
            "excludes": [],
            "sentence": "피해 금액이 커서 은행과 관련 기관에 빨리 알리고 전문가와 함께 진행하는 방법을 살펴볼 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_counterpartyStance",
                "values": [
                  "demands_more",
                  "threatens"
                ]
              },
              {
                "field": "fraud_discovery",
                "values": [
                  "disc_more_fees"
                ]
              },
              {
                "field": "fraud_mainConcern",
                "values": [
                  "doubt_more"
                ]
              }
            ],
            "excludes": [],
            "sentence": "추가 송금이나 위협이 이어지고 있어 요구에 응하기 전에 멈추고 기록을 남겨야 합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_payMethod",
                "values": [
                  "pay_crypto",
                  "pay_cash",
                  "pay_voucher"
                ]
              },
              {
                "field": "fraud_traceability",
                "values": [
                  "tr_hard"
                ]
              }
            ],
            "excludes": [],
            "sentence": "송금 수단이 기록을 남기기 어렵거나 되돌리기 어려워 거래 내역을 서둘러 확보해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_infoGiven",
                "values": [
                  "info_id_copy",
                  "info_finance",
                  "info_remote"
                ]
              },
              {
                "field": "fraud_infoRisk",
                "values": [
                  "ir_id",
                  "ir_finance",
                  "ir_device"
                ]
              },
              {
                "field": "fraud_mainConcern",
                "values": [
                  "doubt_leak"
                ]
              }
            ],
            "excludes": [],
            "sentence": "신분·금융 정보를 주었거나 기기 접근을 허용했다면 정보 보호 조치를 먼저 확인해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_contactStatus",
                "values": [
                  "contact_cut",
                  "contact_blocked"
                ]
              },
              {
                "field": "fraud_mainConcern",
                "values": [
                  "doubt_cut"
                ]
              }
            ],
            "excludes": [],
            "sentence": "상대와 연락이 끊기거나 차단되어 있어 남아 있는 대화와 송금 기록을 먼저 확보해야 합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_elapsedTime",
                "values": [
                  "elapsed_half_year",
                  "elapsed_over_half"
                ]
              },
              {
                "field": "fraud_urgencyTier",
                "values": [
                  "ut_late"
                ]
              }
            ],
            "excludes": [],
            "sentence": "시간이 지났다면 거래 내역과 기록 확인이 어려워질 수 있어 가능한 한 빨리 확인하는 것이 좋습니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_transferPattern",
                "values": [
                  "tp_many_multi",
                  "tp_unknown"
                ]
              },
              {
                "field": "fraud_accountFlag",
                "values": [
                  "af_multiple",
                  "af_unknown"
                ]
              }
            ],
            "excludes": [],
            "sentence": "송금 계좌가 여러 개이거나 알 수 없어 계좌별 송금 내역을 따로 정리해 둘 필요가 있습니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_pretext",
                "values": [
                  "pre_recovery"
                ]
              }
            ],
            "excludes": [],
            "sentence": "피해 회복을 대행해 준다는 제안은 추가 비용 요구로 이어질 수 있어 먼저 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_evidenceState",
                "values": [
                  "deleted_some",
                  "none_kept",
                  "chat_only",
                  "payment_only"
                ]
              },
              {
                "field": "fraud_evidenceGroup",
                "values": [
                  "eg_weak"
                ]
              }
            ],
            "excludes": [],
            "sentence": "자료가 일부 또는 전부 없는 상태라 은행 거래 내역과 앱 기록으로 다시 모을 수 있는지 확인이 필요합니다"
          },
          {
            "clauses": [
              {
                "field": "fraud_actionTaken",
                "values": [
                  "nothing_yet"
                ]
              },
              {
                "field": "fraud_actionGroup",
                "values": [
                  "ag_none",
                  "ag_informal"
                ]
              }
            ],
            "excludes": [],
            "sentence": "공식 경로에 알린 조치가 없어 자료 정리와 은행 문의부터 시작하는 것이 좋습니다"
          }
        ],
        "fallback": "입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 송금 내역과 대화 기록은 계속 보관해 두세요",
        "max": 4
      }
    }
  },
  "phase2Result": {
    "B": [
      {
        "questionCode": "Q5-B",
        "title": "상대 정보의 확인",
        "sentences": {
          "fraud_identityCheck=checked_official|fraud_identityTrust=it_verified": "공식 조회로 확인된 부분은 의미가 있지만 연락해 온 사람이 그 회사 소속인지는 따로 봐야 합니다. 조회 결과를 날짜와 함께 저장해 두세요.",
          "fraud_identityCheck=checked_name_only|fraud_identityTrust=it_partial": "회사가 실제로 있어도 그 이름을 사칭할 수 있습니다. 공식 대표 연락처로 이 사람이 소속인지 직접 확인해 보세요.",
          "fraud_identityCheck=name_only_known|fraud_identityTrust=it_unverified": "상대가 직접 말해 준 이름만으로는 확인된 것이 아닙니다. 공개 자료로 같은 이름과 연락처가 있는지 찾아보세요.",
          "fraud_identityCheck=check_mismatch|fraud_identityTrust=it_suspect": "정보가 맞지 않는다면 그 점이 확인의 핵심 단서입니다. 어떤 부분이 다른지 기록하고 응하기 전에 멈추세요.",
          "fraud_identityCheck=not_checked|fraud_identityTrust=it_unchecked": "송금이나 서명 전에 이름, 등록번호, 대표자를 공식 자료로 대조하는 것이 첫 확인입니다. 확인 결과를 메모해 두세요."
        }
      },
      {
        "questionCode": "Q6-B",
        "title": "수익·조건의 성격",
        "sentences": {
          "fraud_benefitType=benefit_guaranteed|fraud_benefitFlag=bf_flag": "보장 문구가 문서로 남아 있는지, 누가 책임지는지 확인하세요. 말로만 한 보장은 근거가 되기 어렵습니다.",
          "fraud_benefitType=benefit_high_fixed|fraud_benefitFlag=bf_flag": "단기간의 높은 확정 수익은 근거를 확인하기 전에는 믿기 어려운 조건입니다. 수익이 어떻게 나는지 구조를 설명해 달라고 요청해 보세요.",
          "fraud_benefitType=benefit_fee_first|fraud_benefitFlag=bf_flag": "서비스나 수익을 받기 전에 수수료를 먼저 내라는 구조는 특히 신중해야 합니다. 수수료의 이름과 근거가 서류에 적혀 있는지 확인하세요.",
          "fraud_benefitType=benefit_ordinary|fraud_benefitFlag=bf_normal": "조건이 일반적이어도 상대 확인과 서류 대조는 필요합니다. 조건이 계약서에 정확히 들어 있는지 확인하세요.",
          "fraud_benefitType=benefit_unexplained|fraud_benefitFlag=bf_unclear": "조건을 모르는 채로 진행하지 말고 조건을 글로 요청하세요. 설명을 피한다면 그 반응도 기록해 두세요."
        }
      },
      {
        "questionCode": "Q7-B",
        "title": "상대의 현재 요구",
        "sentences": {
          "fraud_requestedAction=send_first|fraud_requestGroup=rg_money": "먼저 송금하는 요구에는 보내기 전에 상대와 계좌를 확인하세요. 한 번 보내면 되돌리기 어려울 수 있습니다.",
          "fraud_requestedAction=give_info|fraud_requestGroup=rg_data": "신분증과 계좌 정보는 악용될 수 있어 요구가 공식인지 확인한 뒤에 제공하세요. 이미 보냈다면 그 사실을 기록해 두세요.",
          "fraud_requestedAction=install_login|fraud_requestGroup=rg_access": "앱 설치나 로그인은 계정과 기기에 접근을 줄 수 있어 신중해야 합니다. 공식 스토어와 공식 사이트의 안내인지 확인하세요.",
          "fraud_requestedAction=meet_move|fraud_requestGroup=rg_meeting": "만남이나 장소 이동 요구는 혼자 응하지 말고 믿을 만한 사람에게 알려 두세요. 대화를 다른 앱으로 옮기자는 요구도 기록해 두세요.",
          "fraud_requestedAction=sign_now|fraud_requestGroup=rg_signing": "서명을 서두르는 것은 확인할 시간을 막는 방식일 수 있습니다. 서명 전에 문서를 사본으로 받아 조건을 대조하세요.",
          "fraud_requestedAction=keep_secret|fraud_requestGroup=rg_secret": "비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의해 보세요."
        }
      },
      {
        "questionCode": "Q8-B",
        "title": "송금 계좌의 명의",
        "sentences": {
          "fraud_accountMatch=matches_party|fraud_accountFlag=af_consistent": "명의가 서류 속 상대와 같더라도 그 이름이 실제 존재하는 사람이나 회사인지 확인해 보세요. 은행과 계좌번호를 기록해 두세요.",
          "fraud_accountMatch=differs_party|fraud_accountFlag=af_mismatch": "명의가 다르다면 이유를 글로 물어보고 답을 기록하세요. 설명 없이 다른 명의를 쓰는 것은 중요하게 볼 부분입니다.",
          "fraud_accountMatch=personal_account|fraud_accountFlag=af_personal": "회사나 기관과의 거래인데 개인 계좌로 받는다면 이유를 확인하세요. 같은 계좌에 다른 사람도 보냈는지는 전문가 확인이 필요할 수 있습니다.",
          "fraud_accountMatch=multiple_accounts|fraud_accountFlag=af_changing": "계좌가 바뀌는 이유를 확인하고 바뀐 계좌와 날짜를 모두 적어 두세요. 계좌별 정보를 표로 정리하면 좋습니다.",
          "fraud_accountMatch=overseas_or_crypto|fraud_accountFlag=af_untraceable": "해외 계좌나 가상자산은 되돌리기 어려운 경우가 많아 보내기 전에 더 신중해야 합니다. 보내지 않은 상태에서 먼저 확인하세요.",
          "fraud_accountMatch=account_not_given|fraud_accountFlag=af_unknown": "계좌가 안내되면 명의가 서류의 상대와 같은지 먼저 확인하세요. 계좌 정보는 받은 날짜와 함께 보관하세요."
        }
      },
      {
        "questionCode": "Q9-B",
        "title": "재촉과 압박",
        "sentences": {
          "fraud_pressureType=press_none|fraud_pressureLevel=pl_none": "재촉이 없다면 확인할 시간을 충분히 가질 수 있습니다. 그래도 상대와 서류 확인은 먼저 하세요.",
          "fraud_pressureType=press_deadline|fraud_pressureLevel=pl_low": "기한의 근거가 문서에 있는지 확인하고 기한을 이유로 확인을 생략하지 마세요. 기한 날짜를 적어 두세요.",
          "fraud_pressureType=press_scarcity|fraud_pressureLevel=pl_mid": "한정이나 마감을 내세우는 방식은 서두르게 하는 흔한 방식입니다. 마감이 사실인지 공식 자료로 확인해 보세요.",
          "fraud_pressureType=press_secret|fraud_pressureLevel=pl_high": "주변에 말하지 못하게 하는 것은 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람과 상의하는 것이 안전합니다.",
          "fraud_pressureType=press_evasive|fraud_pressureLevel=pl_high": "확인을 피하는 반응은 중요한 단서입니다. 요청한 내용과 상대의 답을 날짜와 함께 기록하세요.",
          "fraud_pressureType=press_third_party|fraud_pressureLevel=pl_mid": "지인이나 제3자의 말도 별도 확인이 필요합니다. 그 사람에게 직접 따로 연락해 사실인지 확인해 보세요."
        }
      },
      {
        "questionCode": "Q10-B",
        "title": "받은 서류와 기록",
        "sentences": {
          "fraud_recordKind=contract_full|fraud_recordGroup=rec_formal": "계약서가 있다면 상대 이름·주소·등록번호가 공식 자료와 같은지 대조하세요. 조건이 말로 들은 것과 같은지도 확인하세요.",
          "fraud_recordKind=contract_partial|fraud_recordGroup=rec_formal": "상대 정보가 빠진 서류는 보완을 요청하고 받은 답을 기록하세요. 빠진 정보가 무엇인지 목록으로 정리해 두세요.",
          "fraud_recordKind=notice_only|fraud_recordGroup=rec_informal": "광고나 안내문은 약속의 근거가 되기 어려워 화면을 날짜와 함께 저장해 두세요. 주소와 연락처도 함께 적어 두세요.",
          "fraud_recordKind=chat_log|fraud_recordGroup=rec_informal": "대화 내용은 날짜와 상대 이름이 보이게 순서대로 캡처해 두세요. 중요한 약속은 글로 다시 받아 두세요.",
          "fraud_recordKind=pay_request|fraud_recordGroup=rec_payment": "입금 안내만 있다면 무엇에 대한 돈인지 문서로 확인하는 것이 먼저입니다. 근거 서류를 요청하세요.",
          "fraud_recordKind=no_record|fraud_recordGroup=rec_none": "서류가 없을수록 이후 확인이 어려워지므로 지금부터 대화와 안내를 모두 저장하세요. 조건은 문서로 받아 두는 것이 좋습니다."
        }
      },
      {
        "questionCode": "Q11-B",
        "title": "이미 한 일",
        "sentences": {
          "fraud_actionTaken=nothing_yet|fraud_exposureLevel=exp_none": "아직 아무것도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 대화와 서류를 그대로 저장하세요.",
          "fraud_actionTaken=asked_only|fraud_exposureLevel=exp_low": "문의한 내용과 받은 답을 날짜와 함께 기록하세요. 문의에 대한 반응도 확인의 단서가 됩니다.",
          "fraud_actionTaken=gave_info|fraud_exposureLevel=exp_info": "보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관에 알리는 방법을 확인하세요.",
          "fraud_actionTaken=installed_app|fraud_exposureLevel=exp_access": "설치한 앱은 지우고 비밀번호를 바꾸는 것을 살펴보세요. 어떤 앱이었는지 이름과 설치 경로를 기록해 두세요.",
          "fraud_actionTaken=sent_small|fraud_exposureLevel=exp_money": "소액을 보낸 뒤 더 큰 금액을 요구하는 방식이 있습니다. 추가 송금은 멈추고 보낸 내역을 보관하세요.",
          "fraud_actionTaken=signed_already|fraud_exposureLevel=exp_signed": "서명한 문서의 사본을 확보하고 조건을 정리하세요. 서명 후의 대응은 문서 내용에 따라 달라 전문가 확인이 필요합니다."
        }
      },
      {
        "questionCode": "Q12-B",
        "title": "확인 요청에 대한 반응",
        "sentences": {
          "fraud_verifyReaction=react_open|fraud_reactionFlag=rf_open": "자료를 준다면 그 자료를 공식 자료와 대조해 보세요. 협조적이라고 해서 진짜라는 뜻은 아니므로 확인은 계속하세요.",
          "fraud_verifyReaction=react_inconsistent|fraud_reactionFlag=rf_flag": "말이 바뀌는 부분을 날짜와 함께 기록하세요. 앞뒤가 맞지 않는 설명은 확인의 핵심 단서입니다.",
          "fraud_verifyReaction=react_pressure|fraud_reactionFlag=rf_flag": "확인을 막으려는 반응은 신중하게 보아야 합니다. 그 대화를 저장하고 확인이 끝날 때까지 응하지 마세요.",
          "fraud_verifyReaction=react_cut|fraud_reactionFlag=rf_flag": "연락을 끊는다면 남은 대화와 계좌 정보를 먼저 보관하세요. 이미 보낸 것이 있다면 사후 검토도 함께 살펴볼 수 있습니다.",
          "fraud_verifyReaction=react_untested|fraud_reactionFlag=rf_unknown": "시간을 달라고 말해 보면 상대의 반응이 중요한 단서가 됩니다. 반응을 그대로 기록하세요."
        }
      },
      {
        "questionCode": "Q13-B",
        "title": "자료 보관 상태",
        "sentences": {
          "fraud_evidenceState=all_kept|fraud_evidenceGroup=eg_strong": "자료가 모두 있다면 날짜순으로 정리해 두는 것이 가장 큰 준비입니다. 원본은 그대로 두고 사본을 사용하세요.",
          "fraud_evidenceState=chat_only|fraud_evidenceGroup=eg_medium": "서류와 계좌 정보를 대화에서 따로 뽑아 정리해 두세요. 날짜와 상대 이름이 보이게 캡처하는 것이 좋습니다.",
          "fraud_evidenceState=docs_only|fraud_evidenceGroup=eg_medium": "서류에 적힌 연락처와 날짜를 기준으로 연락 경위를 기억나는 대로 적어 두세요. 상대와의 연락은 지금부터 모두 저장하세요.",
          "fraud_evidenceState=deleted_some|fraud_evidenceGroup=eg_weak": "지운 자료는 복구가 가능한지 먼저 알아보세요. 남은 기록을 중심으로 날짜순 정리를 시작하세요.",
          "fraud_evidenceState=none_kept|fraud_evidenceGroup=eg_weak": "자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 도움이 됩니다. 지금부터 오는 연락은 모두 저장하세요."
        }
      }
    ],
    "A": [
      {
        "questionCode": "Q5-A",
        "title": "시간 경과",
        "sentences": {
          "fraud_elapsedTime=elapsed_today|fraud_urgencyTier=ut_urgent": "가장 빨리 움직일 수 있는 시점입니다. 오늘 안에 거래 은행에 문의하고 기록을 저장하세요.",
          "fraud_elapsedTime=elapsed_week|fraud_urgencyTier=ut_soon": "아직 빠르게 확인할 수 있는 시기입니다. 송금 내역을 정리해 은행 문의부터 하세요.",
          "fraud_elapsedTime=elapsed_month|fraud_urgencyTier=ut_soon": "시간이 조금 지났어도 확인할 수 있는 자료가 남아 있을 수 있습니다. 빨리 자료를 정리하세요.",
          "fraud_elapsedTime=elapsed_half_year|fraud_urgencyTier=ut_late": "시간이 지날수록 기록 확인이 어려워질 수 있습니다. 남은 자료를 먼저 확보하세요.",
          "fraud_elapsedTime=elapsed_over_half|fraud_urgencyTier=ut_late": "시간이 오래 지났다면 가진 자료를 모두 모아 전문가와 함께 가능한 조치를 확인하는 것이 좋습니다. 속은 사실을 알게 된 때부터의 기간 확인도 필요합니다."
        }
      },
      {
        "questionCode": "Q6-A",
        "title": "알게 된 계기",
        "sentences": {
          "fraud_discovery=disc_contact_cut|fraud_discoveryGroup=dg_counterparty": "연락이 끊긴 시점과 마지막 대화를 기록해 두세요. 끊기기 직전의 요구가 무엇이었는지도 중요합니다.",
          "fraud_discovery=disc_broken_promise|fraud_discoveryGroup=dg_counterparty": "약속한 내용이 문서나 대화로 남아 있는지 확인하세요. 약속 시점과 어긴 시점을 날짜순으로 정리하세요.",
          "fraud_discovery=disc_more_fees|fraud_discoveryGroup=dg_counterparty": "추가 비용 요구 내역을 항목별로 정리하세요. 요구에는 응하지 않고 이미 낸 비용도 따로 기록하세요.",
          "fraud_discovery=disc_heard_similar|fraud_discoveryGroup=dg_outside": "알게 된 출처와 내용을 기록해 두세요. 같은 상대나 수법이 맞는지는 별도로 확인이 필요합니다.",
          "fraud_discovery=disc_bank_notice|fraud_discoveryGroup=dg_outside": "받은 안내 내용과 담당 부서, 접수 번호를 기록하세요. 이후 문의는 그 안내를 근거로 이어가세요.",
          "fraud_discovery=disc_self_check|fraud_discoveryGroup=dg_self": "확인한 과정과 날짜를 기록하세요. 어떤 점이 맞지 않았는지가 이후 설명에 중요합니다."
        }
      },
      {
        "questionCode": "Q7-A",
        "title": "상대의 현재 상태",
        "sentences": {
          "fraud_counterpartyStance=demands_more|fraud_contactStatus=contact_active": "추가 요구에는 응하지 말고 대화는 그대로 저장하세요. 상대와의 직접 협상은 추가 피해로 이어질 수 있어 주의가 필요합니다.",
          "fraud_counterpartyStance=excuses|fraud_contactStatus=contact_active": "변명 내용과 날짜를 순서대로 기록하세요. 약속한 날짜가 지나면 그 사실도 함께 적어 두세요.",
          "fraud_counterpartyStance=threatens|fraud_contactStatus=contact_active": "위협 내용을 그대로 저장하고 대응하지 마세요. 신변이나 안전이 걱정되면 가까운 사람에게 알리고 전문가 확인을 살펴보세요.",
          "fraud_counterpartyStance=silent|fraud_contactStatus=contact_cut": "마지막 연락 날짜와 내용을 기록하세요. 상대 계정과 번호는 사라지기 전에 화면으로 저장하세요.",
          "fraud_counterpartyStance=blocked_changed|fraud_contactStatus=contact_blocked": "남아 있는 대화 화면과 이전 번호·계정을 보관하세요. 새 번호로 연락이 온다면 같은 상대인지 따로 확인해야 합니다."
        }
      },
      {
        "questionCode": "Q8-A",
        "title": "송금 방식",
        "sentences": {
          "fraud_payMethod=pay_bank|fraud_traceability=tr_traceable": "은행 이체는 기록이 남아 은행에 문의하기 쉬운 방식입니다. 이체 확인증과 받은 계좌 정보를 보관하고 가능한 한 빨리 은행에 알리세요.",
          "fraud_payMethod=pay_wallet|fraud_traceability=tr_traceable": "앱의 거래 내역과 상대 계정 정보를 저장하고 해당 서비스 고객센터에 문의 방법을 확인하세요. 접수 번호를 기록하세요.",
          "fraud_payMethod=pay_crypto|fraud_traceability=tr_hard": "가상자산은 거래 기록의 주소와 시각이 중요합니다. 거래 내역 화면을 그대로 저장하고 전문가와 함께 가능한 조치를 확인하세요.",
          "fraud_payMethod=pay_cash|fraud_traceability=tr_hard": "현금은 기록이 적어 만난 날짜·장소·사람의 정보를 최대한 적어 두세요. 주변 폐쇄회로나 목격자 같은 단서도 기억나는 대로 정리하세요.",
          "fraud_payMethod=pay_voucher|fraud_traceability=tr_hard": "상품권이나 선불카드 번호와 구입 영수증을 보관하세요. 구입처와 발급사에 문의할 수 있는지 확인하세요.",
          "fraud_payMethod=pay_none|fraud_traceability=tr_none": "송금하지 않았다면 이후 추가 요구에 응하지 않는 것이 가장 중요합니다. 지금까지의 대화와 정보 제공 여부를 점검하세요."
        }
      },
      {
        "questionCode": "Q9-A",
        "title": "피해 규모",
        "sentences": {
          "fraud_lossScale=loss_none|fraud_lossTier=lt_none": "금전 피해가 없다면 같은 연락이 오지 않도록 기록을 정리하세요. 개인정보를 준 적이 있는지 한 번 더 점검하세요.",
          "fraud_lossScale=loss_under_1m|fraud_lossTier=lt_small": "금액이 크지 않아도 송금 날짜와 계좌를 정리해 두면 은행이나 플랫폼 문의에 도움이 됩니다. 추가 요구에는 응하지 마세요.",
          "fraud_lossScale=loss_1m_10m|fraud_lossTier=lt_medium": "송금 시간이 지날수록 확인이 어려워질 수 있어 거래 은행에 빨리 문의하세요. 은행 안내도 날짜와 함께 기록하세요.",
          "fraud_lossScale=loss_10m_100m|fraud_lossTier=lt_large": "금액이 크므로 송금 내역을 날짜순 표로 정리하는 것이 먼저입니다. 전문가와 함께 진행하는 방법도 살펴볼 만합니다.",
          "fraud_lossScale=loss_over_100m|fraud_lossTier=lt_xlarge": "피해 금액이 매우 크다면 은행과 관련 기관에 가능한 한 빨리 알리고 전문가 상담을 함께 받는 것이 필요할 수 있습니다. 모든 송금 증빙을 원본 그대로 보관하세요."
        }
      },
      {
        "questionCode": "Q10-A",
        "title": "송금 횟수와 계좌",
        "sentences": {
          "fraud_transferPattern=tp_once_one|fraud_accountFlag=af_single": "한 번의 송금이라면 이체 확인증 하나로 정리할 수 있습니다. 받은 계좌의 은행과 명의를 기록하세요.",
          "fraud_transferPattern=tp_many_one|fraud_accountFlag=af_single": "같은 계좌로 반복해 보냈다면 날짜와 금액을 표로 정리하세요. 어떤 요구가 있을 때마다 보냈는지도 함께 적어 두세요.",
          "fraud_transferPattern=tp_many_multi|fraud_accountFlag=af_multiple": "계좌별로 날짜·금액·명의를 따로 정리하세요. 상대가 계좌를 바꾼 이유도 기록해 두세요.",
          "fraud_transferPattern=tp_unknown|fraud_accountFlag=af_unknown": "송금 내역에서 은행과 계좌번호를 먼저 확인하세요. 은행에 거래 확인서를 요청하면 도움이 됩니다.",
          "fraud_transferPattern=tp_none|fraud_accountFlag=af_none": "송금이 없다면 정보 제공이나 서명 같은 다른 노출이 있었는지 점검하세요. 추가 요구에는 응하지 마세요."
        }
      },
      {
        "questionCode": "Q11-A",
        "title": "정보 제공",
        "sentences": {
          "fraud_infoGiven=info_none|fraud_infoRisk=ir_none": "정보를 주지 않았다면 앞으로도 요구에 응하지 않는 것이 좋습니다. 상대가 알고 있는 정보가 무엇인지 점검해 두세요.",
          "fraud_infoGiven=info_basic|fraud_infoRisk=ir_low": "기본 정보가 알려졌다면 이후 비슷한 연락이 올 수 있습니다. 모르는 번호의 요구에는 응하기 전에 확인하세요.",
          "fraud_infoGiven=info_id_copy|fraud_infoRisk=ir_id": "보낸 사본의 종류와 날짜를 정리하세요. 악용될 수 있으므로 관련 기관에 알리는 방법을 확인하세요.",
          "fraud_infoGiven=info_finance|fraud_infoRisk=ir_finance": "해당 금융기관에 가능한 한 빨리 알려 추가 조치 방법을 확인하세요. 비밀번호도 바꾸는 것을 살펴보세요.",
          "fraud_infoGiven=info_remote|fraud_infoRisk=ir_device": "설치한 앱은 지우고 관련 계정의 비밀번호를 바꾸는 것을 살펴보세요. 기기 점검이 필요할 수 있습니다."
        }
      },
      {
        "questionCode": "Q12-A",
        "title": "이미 취한 조치",
        "sentences": {
          "fraud_actionTaken=nothing_yet|fraud_actionGroup=ag_none": "아직 조치 전이라면 자료 정리와 은행 문의부터 시작할 수 있습니다. 시간이 지날수록 확인이 어려워질 수 있어 빨리 움직이는 것이 좋습니다.",
          "fraud_actionTaken=bank_recall|fraud_actionGroup=ag_official": "접수 번호와 담당 부서, 안내받은 내용을 기록해 두세요. 이후 진행 상황도 날짜와 함께 남기세요.",
          "fraud_actionTaken=platform_report|fraud_actionGroup=ag_official": "신고 날짜와 화면을 저장하고 답변이 없다면 다시 문의하세요. 플랫폼 밖의 다른 확인 경로도 함께 살펴보세요.",
          "fraud_actionTaken=police_report|fraud_actionGroup=ag_official": "접수한 기관과 날짜, 접수 번호를 기록하세요. 이후 내라고 하는 자료가 있다면 목록으로 정리해 두세요.",
          "fraud_actionTaken=direct_refund|fraud_actionGroup=ag_informal": "상대와의 직접 협상은 추가 요구로 이어질 수 있어 주의가 필요합니다. 요청한 내용과 거절·답변을 글로 남겨 두세요.",
          "fraud_actionTaken=consulted_others|fraud_actionGroup=ag_informal": "주변의 조언은 참고가 되지만 어느 기관에 어떤 자료를 낼지는 따로 확인이 필요합니다. 상담 내용과 날짜를 적어 두세요."
        }
      },
      {
        "questionCode": "Q13-A",
        "title": "자료 보관 상태",
        "sentences": {
          "fraud_evidenceState=all_kept|fraud_evidenceGroup=eg_strong": "자료가 모두 있다면 날짜순으로 정리하는 것이 가장 큰 준비입니다. 원본은 그대로 두고 사본을 사용하세요.",
          "fraud_evidenceState=payment_only|fraud_evidenceGroup=eg_medium": "입금 내역만 있어도 은행 문의에 쓸 수 있습니다. 상대와의 대화를 앱 기록에서 다시 모을 수 있는지 알아보세요.",
          "fraud_evidenceState=chat_only|fraud_evidenceGroup=eg_medium": "대화에서 계좌 정보와 약속 내용을 따로 뽑아 정리하세요. 입금 내역은 은행에서 다시 받을 수 있는지 확인하세요.",
          "fraud_evidenceState=deleted_some|fraud_evidenceGroup=eg_weak": "지운 자료는 복구가 가능한지 먼저 알아보세요. 은행 거래 내역과 앱 기록에서 다시 모을 수 있는 것도 확인하세요.",
          "fraud_evidenceState=none_kept|fraud_evidenceGroup=eg_weak": "남은 자료가 없어도 은행 거래 내역은 금융기관에 요청해 받을 수 있습니다. 지금부터 오는 연락은 모두 저장하세요."
        }
      }
    ]
  },
  "labels": {
    "account_not_given": "계좌가 아직 안내되지 않음",
    "af_changing": "계좌가 바뀜",
    "af_consistent": "일치함",
    "af_mismatch": "일치하지 않음",
    "af_multiple": "계좌가 여러 개",
    "af_none": "해당 없음",
    "af_personal": "개인 계좌",
    "af_single": "계좌가 하나",
    "af_unknown": "계좌 정보 불명",
    "af_untraceable": "추적이 어려운 수단",
    "ag_informal": "상대와의 직접 해결",
    "ag_none": "조치 없음",
    "ag_official": "공식 경로에 알림",
    "all_kept": "대화·서류·입금 내역을 모두 보관",
    "asked_only": "문의만 함",
    "bank_recall": "은행에 문의·요청",
    "benefit_fee_first": "수수료·보증금 선납",
    "benefit_guaranteed": "원금·수익 보장",
    "benefit_high_fixed": "단기간 높은 확정 수익",
    "benefit_ordinary": "일반적인 조건",
    "benefit_unexplained": "조건 설명이 없음",
    "bf_flag": "확인이 필요한 조건",
    "bf_normal": "특이점이 적은 조건",
    "bf_unclear": "조건이 불분명",
    "blocked_changed": "차단됨·번호나 계정이 바뀜",
    "cg_direct": "직접 전달된 연락",
    "cg_personal": "사람을 통한 접촉",
    "cg_public": "공개 게시·플랫폼",
    "chat_log": "대화 내용",
    "chat_only": "대화만 보관",
    "check_mismatch": "정보가 맞지 않음",
    "checked_name_only": "회사 이름만 확인됨",
    "checked_official": "공식 조회로 확인됨",
    "consulted_others": "주변에 상담함",
    "contact_active": "연락이 이어짐",
    "contact_blocked": "차단·변경",
    "contact_cut": "연락이 끊김",
    "contract_full": "상대 정보가 갖춰진 계약서",
    "contract_partial": "상대 정보가 일부만 있는 계약서·제안서",
    "deleted_some": "일부를 지웠거나 사라짐",
    "demands_more": "추가로 요구함",
    "dg_counterparty": "상대의 변화로 알게 됨",
    "dg_outside": "외부 정보로 알게 됨",
    "dg_self": "스스로 알게 됨",
    "differs_party": "상대 이름과 다름",
    "direct_input": "직접 입력",
    "direct_input_detail": "직접 입력(상세)",
    "direct_refund": "상대에게 직접 요청",
    "disc_bank_notice": "은행·플랫폼 안내",
    "disc_broken_promise": "약속이 지켜지지 않음",
    "disc_contact_cut": "연락이 끊김",
    "disc_heard_similar": "비슷한 수법을 알게 됨",
    "disc_more_fees": "추가 비용 요구",
    "disc_self_check": "스스로 확인하다 알게 됨",
    "docs_only": "서류만 보관",
    "doubt_cut": "연락이 끊겨 걱정함",
    "doubt_data": "개인정보를 줘도 되는지 모르겠음",
    "doubt_leak": "개인정보 제공이 걱정됨",
    "doubt_more": "추가 요구가 걱정됨",
    "doubt_party": "상대가 진짜인지 모르겠음",
    "doubt_prepay": "먼저 송금해도 되는지 모르겠음",
    "doubt_proof": "증거가 부족해 걱정함",
    "doubt_recover": "보낸 돈이 어떻게 될지 걱정함",
    "doubt_rush": "재촉이 부담됨",
    "doubt_sign": "서명해도 되는지 모르겠음",
    "doubt_terms": "조건이 너무 좋아 걱정됨",
    "doubt_where": "어디에 알려야 할지 모르겠음",
    "eg_medium": "자료가 일부 있음",
    "eg_strong": "자료가 충분함",
    "eg_weak": "자료가 부족함",
    "elapsed_half_year": "반년 이내",
    "elapsed_month": "한 달 이내",
    "elapsed_over_half": "반년 이상",
    "elapsed_today": "오늘이나 어제",
    "elapsed_week": "일주일 이내",
    "email_contact": "이메일",
    "excuses": "변명하며 미룸",
    "exp_access": "기기·계정 접근 가능성",
    "exp_info": "개인정보 노출",
    "exp_low": "노출 적음",
    "exp_money": "금전 피해 가능성",
    "exp_none": "노출 없음",
    "exp_signed": "서명으로 인한 책임 가능성",
    "gave_info": "개인정보·신분증을 이미 보냄",
    "give_info": "신분증·계좌 정보를 달라는 요구",
    "impersonation": "기관·지인 사칭, 취업·연애 관련",
    "in_person": "직접 만남",
    "info_basic": "이름·연락처",
    "info_finance": "계좌·카드·인증번호",
    "info_id_copy": "신분증·여권 사본",
    "info_none": "정보를 주지 않음",
    "info_remote": "앱 설치·원격 접속",
    "install_login": "앱 설치·로그인을 하라는 요구",
    "installed_app": "앱 설치·로그인함",
    "investment": "투자·수익·사업 제휴 관련",
    "ir_device": "기기 접근 노출",
    "ir_finance": "금융 정보 노출",
    "ir_id": "신분 정보 노출",
    "ir_low": "노출이 적음",
    "ir_none": "노출 없음",
    "it_partial": "일부만 확인됨",
    "it_suspect": "의심됨",
    "it_unchecked": "확인 전",
    "it_unverified": "확인되지 않음",
    "it_verified": "확인됨",
    "keep_secret": "비밀 유지 요구",
    "loan": "대출 관련",
    "loss_10m_100m": "1천만 동 이상 1억 동 미만",
    "loss_1m_10m": "100만 동 이상 1천만 동 미만",
    "loss_none": "금전 피해 없음",
    "loss_over_100m": "1억 동 이상",
    "loss_under_1m": "100만 동 미만",
    "lt_large": "큰 금액",
    "lt_medium": "중간 금액",
    "lt_none": "피해 없음",
    "lt_small": "소액",
    "lt_xlarge": "매우 큰 금액",
    "matches_party": "서류의 상대 이름과 일치",
    "meet_move": "만나자거나 다른 곳으로 옮기자는 요구",
    "messenger": "메신저·소셜 앱",
    "multiple_accounts": "계좌가 여러 개이거나 바뀜",
    "name_only_known": "상대가 말한 이름만 앎",
    "next_bank": "먼저 은행 문의",
    "next_evidence": "남은 자료부터 확보",
    "next_hold": "송금을 보류하고 확인",
    "next_party": "먼저 상대 확인",
    "next_protect": "정보 제공·보호 조치 확인",
    "next_report": "신고 경로 확인",
    "next_stop": "추가 송금을 멈추고 기록",
    "next_terms": "먼저 조건·서류 확인",
    "no_record": "받은 서류 없음",
    "none_kept": "남은 자료 없음",
    "not_checked": "아직 확인하지 않음",
    "nothing_yet": "아직 아무것도 하지 않음",
    "notice_only": "안내문·광고 화면",
    "online_post": "온라인 광고·게시글",
    "online_trade": "온라인 거래·임대 관련",
    "overseas_or_crypto": "해외 계좌·가상자산 주소",
    "pay_bank": "은행 계좌 이체",
    "pay_cash": "현금 직접 전달",
    "pay_crypto": "가상자산",
    "pay_none": "아직 송금하지 않음",
    "pay_request": "입금 안내·청구서",
    "pay_voucher": "상품권·선불카드",
    "pay_wallet": "결제 앱·전자지갑",
    "payment_only": "입금 내역만 보관",
    "personal_account": "개인 명의 계좌",
    "pg_authority": "기관을 내세우는 유형",
    "pg_deposit": "보증금·예치 유형",
    "pg_parcel": "물품·통관 유형",
    "pg_relation": "관계 유형",
    "pg_return": "수익 약속 유형",
    "pg_service": "대행 서비스 유형",
    "pg_unknown": "유형 불명",
    "pg_work": "일과 보수 유형",
    "phone_call": "전화",
    "pl_high": "높음",
    "pl_low": "낮음",
    "pl_mid": "중간",
    "pl_none": "없음",
    "platform_report": "거래 플랫폼에 신고",
    "police_report": "수사기관에 알림",
    "post": "문제 발생 후 대응 검토",
    "pre": "제출·계약 전 서류 검토",
    "pre_authority": "기관 사칭(수사·세금·벌금)",
    "pre_deposit": "임대·매매 보증금·예약금",
    "pre_invest": "고수익·투자·다단계·사업 제휴",
    "pre_parcel": "택배·관세·상품 수령",
    "pre_recovery": "피해 회복 대행",
    "pre_romance": "연애·결혼·소개",
    "pre_service": "비자·체류·행정 대행",
    "pre_tasks": "소액 과제·구인·아르바이트",
    "pre_unsure": "명목을 잘 모름",
    "press_deadline": "기한을 정해 재촉",
    "press_evasive": "확인을 말하면 회피·분노",
    "press_none": "재촉이 없음",
    "press_scarcity": "한정·마감을 내세움",
    "press_secret": "비밀 유지 압박",
    "press_third_party": "제3자를 내세운 압박",
    "react_cut": "연락을 끊음",
    "react_inconsistent": "말이 바뀜",
    "react_open": "기꺼이 자료를 줌",
    "react_pressure": "화를 내거나 재촉",
    "react_untested": "아직 시험해 보지 않음",
    "rec_formal": "정식 서류",
    "rec_informal": "비공식 기록",
    "rec_none": "서류 없음",
    "rec_payment": "입금 요청뿐",
    "referral": "지인·소개",
    "rf_flag": "주의할 반응",
    "rf_open": "협조적",
    "rf_unknown": "아직 모름",
    "rg_access": "접속 요구",
    "rg_data": "정보 요구",
    "rg_meeting": "만남·이동 요구",
    "rg_money": "돈 요구",
    "rg_secret": "비밀 요구",
    "rg_signing": "서명 요구",
    "selected": "직접 선택함",
    "send_first": "먼저 돈을 보내라는 요구",
    "sent_small": "소액을 먼저 보냄",
    "sg_finance": "금융 제안 유형",
    "sg_identity": "신분·관계를 내세우는 유형",
    "sg_return": "수익을 약속하는 유형",
    "sg_trade": "거래·임대 유형",
    "sg_unknown": "유형 불명",
    "sign_now": "서명·계약을 서두르라는 요구",
    "signed_already": "서명·도장을 이미 함",
    "silent": "연락이 끊김",
    "text_message": "문자메시지",
    "threatens": "위협·협박함",
    "tp_many_multi": "여러 번·여러 계좌",
    "tp_many_one": "여러 번·한 계좌",
    "tp_none": "송금하지 않음",
    "tp_once_one": "한 번·한 계좌",
    "tp_unknown": "받은 계좌를 모름",
    "tr_hard": "추적이 어려운 방식",
    "tr_none": "송금 없음",
    "tr_traceable": "기록이 남는 방식",
    "trade_platform": "거래·임대·구인구직 플랫폼",
    "unsure": "잘 모르겠음",
    "unsure_scheme": "어떤 유형인지 모름",
    "ut_late": "기록 확인이 어려워질 수 있는 시점",
    "ut_soon": "빨리 조치가 필요한 시점",
    "ut_urgent": "바로 조치가 필요한 시점"
  },
  "connections": [
    {
      "name": "행정문서 검토",
      "condition": "`fraud_pretext` ∈ {pre_authority} 또는 `fraud_pretextGroup` ∈ {pg_authority, pg_service} 또는 `fraud_scheme` ∈ {impersonation}",
      "sentence": "공공기관 이름으로 받은 문서라면 행정문서 검토에서 함께 확인해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "fraud_pretext",
          "values": [
            "pre_authority"
          ]
        },
        {
          "field": "fraud_pretextGroup",
          "values": [
            "pg_authority",
            "pg_service"
          ]
        },
        {
          "field": "fraud_scheme",
          "values": [
            "impersonation"
          ]
        }
      ]
    },
    {
      "name": "불확실한 문서 검토",
      "condition": "`fraud_recordKind` ∈ {notice_only, chat_log, pay_request} 또는 `fraud_recordGroup` ∈ {rec_payment, rec_informal}",
      "sentence": "어떤 문서인지 분명하지 않다면 불확실한 문서 검토에서 먼저 분류해 보실 수 있습니다.",
      "mode": "or",
      "clauses": [
        {
          "field": "fraud_recordKind",
          "values": [
            "notice_only",
            "chat_log",
            "pay_request"
          ]
        },
        {
          "field": "fraud_recordGroup",
          "values": [
            "rec_payment",
            "rec_informal"
          ]
        }
      ]
    },
    {
      "name": "전문가 진행",
      "condition": "`fraud_lossTier` ∈ {lt_large, lt_xlarge} 또는 `fraud_counterpartyStance` ∈ {threatens} 또는 `fraud_infoRisk` ∈ {ir_id, ir_finance, ir_device} 또는 `fraud_exposureLevel` ∈ {exp_signed}",
      "sentence": "금액이 크거나 위협이 있거나 중요한 정보를 이미 준 상황이라면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요.",
      "mode": "or",
      "clauses": [
        {
          "field": "fraud_lossTier",
          "values": [
            "lt_large",
            "lt_xlarge"
          ]
        },
        {
          "field": "fraud_counterpartyStance",
          "values": [
            "threatens"
          ]
        },
        {
          "field": "fraud_infoRisk",
          "values": [
            "ir_id",
            "ir_finance",
            "ir_device"
          ]
        },
        {
          "field": "fraud_exposureLevel",
          "values": [
            "exp_signed"
          ]
        }
      ]
    },
    {
      "name": "서류 첨부",
      "condition": "모든 결과 화면",
      "sentence": "받으신 서류나 대화 내용을 첨부하면 더 정확히 확인할 수 있습니다.",
      "mode": "always",
      "clauses": []
    }
  ],
  "afterResultGuide": {
    "pre": [
      "제출 요건과 형식",
      "누락된 내용이나 서류",
      "불리하거나 위험한 조항",
      "원본과 번역본의 일치 여부",
      "공증·인증·영사확인 필요 여부",
      "전체 검토가 필요함"
    ],
    "post": [
      "공식 대응 전",
      "상대방·기관과 협의 중",
      "이의신청·통지 준비 중",
      "경찰·검찰·법원·행정기관 접수",
      "판결·결정 후 후속 대응",
      "기타"
    ]
  },
  "directNotice": "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.",
  "reportFixed": {
    "missingFileNotice": "서류를 첨부하면 더 정확히 확인할 수 있습니다"
  },
  "reportGuide": {
    "title": "참고 사항",
    "subtitle": "고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.",
    "caption": "확인 기준일 2026.10.10 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.",
    "disclaimer": "위 내용은 일반 참고 정보이며, 개별 사안의 사기 여부나 법적 책임, 피해 회복 가능성을 판단하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다.",
    "firstMark": "먼저 확인",
    "fileCountTemplate": "접수된 자료: {n}건",
    "notice": {
      "title": "상대의 요구에 응하기 전에 먼저 할 것",
      "flow": "대화·서류 보관 → 송금·정보 제공 멈춤 → 공식 연락처로 직접 확인 → 전문가 확인",
      "chips": [
        "일반 실무"
      ],
      "items": [
        {
          "text": "상대가 알려 준 연락처가 아니라 공식 자료에 나온 연락처로 사실을 확인해 보세요.",
          "chips": [
            "7"
          ]
        },
        {
          "text": "대화 화면과 받은 서류, 입금 내역은 지우지 말고 날짜가 보이게 그대로 저장해 두세요.",
          "chips": [
            "일반 실무"
          ]
        },
        {
          "text": "공식 기관을 내세운 연락이라도 개인정보나 인증번호는 전화나 메시지로 알려 주지 마세요.",
          "chips": [
            "7"
          ]
        }
      ]
    },
    "routes": {
      "B": {
        "checklist": {
          "title": "① 준비 자료 체크",
          "rows": [
            {
              "name": "받은 제안서·계약서 원본",
              "why": "상대가 내세운 수익과 조건이 문서에 어떻게 적혀 있는지 확인하는 기본 자료입니다.",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "name": "상대의 이름·등록 정보 확인 자료",
              "why": "회사라면 이름, 등록 번호, 대표자를 공식 조회 결과와 비교합니다.",
              "chips": [
                "9"
              ]
            },
            {
              "name": "송금하라는 계좌 정보",
              "why": "계좌 명의가 서류의 상대와 같은지 비교합니다.",
              "chips": [
                "7"
              ]
            },
            {
              "name": "대화 기록 (문자, 메신저, 통화 기록)",
              "why": "약속과 요구가 언제 어떻게 나왔는지 보여 줍니다.",
              "chips": [
                "7"
              ]
            },
            {
              "name": "수익·조건을 설명한 자료",
              "why": "보장 문구, 수수료, 기한이 문서로 남아 있는지 확인합니다.",
              "chips": [
                "5"
              ]
            }
          ]
        },
        "order": {
          "title": "② 확인 순서",
          "flow": "자료 모으기 (제안서·대화·계좌) → 서로 맞는지 보기 (이름·계좌·조건) → 송금·정보 제공 보류 후 전문가에게 전달",
          "chips": [
            "일반 실무"
          ]
        },
        "compare": {
          "title": "③ 서류 간 대조표",
          "rows": [
            {
              "left": "서류의 상대 이름",
              "right": "송금 계좌 명의",
              "point": "같은 사람이나 회사인지",
              "chips": [
                "7"
              ]
            },
            {
              "left": "서류의 등록 정보",
              "right": "공식 조회 결과",
              "point": "이름, 번호, 대표자가 맞는지",
              "chips": [
                "9"
              ]
            },
            {
              "left": "말로 들은 조건",
              "right": "서류에 적힌 조건",
              "point": "보장, 수수료, 기한이 서류에도 있는지",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "left": "서류에 적힌 연락처",
              "right": "공식 안내 연락처",
              "point": "같은 번호와 주소인지",
              "chips": [
                "7"
              ]
            }
          ]
        },
        "timeline": {
          "title": "④ 시점별 정리",
          "flow": "첫 연락 (언제, 어디서) → 제안 내용 → 요구 사항 (송금, 정보) → 기한 → 현재 단계",
          "chips": [
            "일반 실무"
          ],
          "note": "위 순서대로 날짜를 적어 두면 요구가 늘어나는 구간이 보입니다.",
          "noteChips": [
            "일반 실무"
          ]
        },
        "misses": {
          "title": "⑤ 자주 놓치는 점",
          "items": [
            {
              "text": "계좌 명의가 서류의 상대와 다른데 이유를 확인하지 않고 보낸 경우",
              "chips": [
                "7"
              ]
            },
            {
              "text": "서류의 회사 이름만 확인하고 실제 연락해 온 사람이 그 회사 소속인지는 확인하지 않은 경우",
              "chips": [
                "9"
              ]
            },
            {
              "text": "말로 들은 수익 보장이 계약서에는 없는데 그대로 서명한 경우",
              "chips": [
                "5"
              ]
            },
            {
              "text": "결혼 관련 소개나 상담 업체의 경우 운영 허가와 계약 조건을 확인하지 않은 경우",
              "chips": [
                "8"
              ]
            }
          ]
        },
        "questions": {
          "title": "⑥ 전문가에게 가져갈 질문",
          "items": [
            {
              "text": "제가 받은 서류와 상대 정보로 더 확인해야 할 것은 무엇인가요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "송금하라는 계좌의 명의가 다른 경우 어떻게 확인하는 것이 좋은가요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "이 계약서의 수익 보장이나 수수료 조항은 어떻게 해석되나요?",
              "chips": [
                "1",
                "5"
              ]
            }
          ]
        }
      },
      "A": {
        "checklist": {
          "title": "① 준비 자료 체크",
          "rows": [
            {
              "name": "송금 내역 (은행 이체 확인서, 거래 내역)",
              "why": "보낸 날짜, 금액, 받은 계좌를 보여 주는 기본 자료입니다.",
              "chips": [
                "7"
              ]
            },
            {
              "name": "대화 기록 (문자, 메신저, 통화 기록)",
              "why": "상대의 약속과 요구, 연락이 끊긴 시점을 보여 줍니다.",
              "chips": [
                "7"
              ]
            },
            {
              "name": "받은 서류 (제안서, 계약서, 광고 화면)",
              "why": "약속한 수익과 조건이 어떻게 적혀 있었는지 보여 줍니다.",
              "chips": [
                "5"
              ]
            },
            {
              "name": "상대 정보 (이름, 연락처, 계좌, 계정 주소)",
              "why": "이후 확인에서 상대를 특정하는 데 쓰입니다.",
              "chips": [
                "7"
              ]
            },
            {
              "name": "이미 취한 조치의 기록 (은행 문의, 플랫폼 신고 접수 내용)",
              "why": "접수 번호와 답변 내용을 함께 보관합니다.",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        },
        "order": {
          "title": "② 확인 순서",
          "flow": "자료 모으기 (송금·대화·서류) → 날짜순으로 정리하기 → 은행·플랫폼 문의 기록 → 전문가에게 전달",
          "chips": [
            "일반 실무"
          ]
        },
        "compare": {
          "title": "③ 서류 간 대조표",
          "rows": [
            {
              "left": "송금 내역",
              "right": "대화 기록",
              "point": "보낸 시점과 요구한 시점이 이어지는지",
              "chips": [
                "7"
              ]
            },
            {
              "left": "받은 서류",
              "right": "실제 결과",
              "point": "약속한 내용과 지금 상태가 어떻게 다른지",
              "chips": [
                "5"
              ]
            },
            {
              "left": "상대가 알려 준 계좌",
              "right": "실제 입금 계좌",
              "point": "명의와 번호가 같은지",
              "chips": [
                "7"
              ]
            },
            {
              "left": "신고·문의 내용",
              "right": "받은 답변",
              "point": "날짜와 담당 부서가 기록되어 있는지",
              "chips": [
                "일반 실무"
              ]
            }
          ]
        },
        "timeline": {
          "title": "④ 시점별 정리",
          "flow": "첫 연락 → 제안 내용 → 송금 (날짜별) → 추가 요구 → 연락 두절 또는 문제 발견 → 이미 한 조치",
          "chips": [
            "일반 실무"
          ],
          "note": "위 순서대로 날짜와 금액을 적어 두면 어느 구간의 자료가 부족한지 보입니다.",
          "noteChips": [
            "일반 실무"
          ]
        },
        "misses": {
          "title": "⑤ 자주 놓치는 점",
          "items": [
            {
              "text": "대화를 지우거나 앱을 삭제해 증빙이 사라진 경우",
              "chips": [
                "7"
              ]
            },
            {
              "text": "상대와 직접 협상하다가 추가 송금을 한 경우",
              "chips": [
                "7"
              ]
            },
            {
              "text": "민법상 속아서 한 거래의 무효를 주장할 수 있는 기간이 있는데, 알게 된 때부터의 기간을 확인하지 않은 경우",
              "chips": [
                "2"
              ]
            },
            {
              "text": "신고 방법과 접수 기관을 확인하지 않고 여러 곳에 서로 다른 내용으로 알린 경우",
              "chips": [
                "6"
              ]
            }
          ]
        },
        "questions": {
          "title": "⑥ 전문가에게 가져갈 질문",
          "items": [
            {
              "text": "제가 가진 자료로 어떤 기관에 어떻게 알리는 것이 좋은가요?",
              "chips": [
                "6"
              ]
            },
            {
              "text": "이미 송금한 돈에 대해 은행이나 플랫폼에서 확인할 수 있는 것은 무엇인가요?",
              "chips": [
                "일반 실무"
              ]
            },
            {
              "text": "계약이나 송금을 취소하거나 무효로 다투려면 기간과 준비 자료는 어떻게 되나요?",
              "chips": [
                "2"
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
          "name": "형법 제100/2015/QH13호(제12/2017/QH14호 개정) 제174조 사기, 제175조 신뢰 남용",
          "publisher": "베트남 국회",
          "kind": "법령(이차 자료로 확인)",
          "urls": [
            "https://lawnet.vn/ngan-hang-phap-luat/en/tu-van-phap-luat/trach-nhiem-hinh-su/what-are-penalties-for-obtaining-property-by-fraud-in-vietnam-390034",
            "https://lawnet.vn/thong-tin-phap-luat/en/tu-van-luat/penalties-for-abuse-of-trust-to-appropriate-property-in-vietnam-120363.html"
          ],
          "note": "사기죄 기준 금액 200만 동 이상, 신뢰 남용 400만 동 이상(이차 자료). 원문 대조 필요"
        },
        {
          "id": "2",
          "name": "민법 제91/2015/QH13호 제127조(속임·위협), 제131조(무효의 효과), 제132조(청구 기간)",
          "publisher": "베트남 국회",
          "kind": "법령(이차 자료로 확인)",
          "urls": [
            "https://lawnet.vn/thong-tin-phap-luat/en/dan-su/time-limit-for-requesting-court-to-declare-civil-transactions-invalid-in-vietnam-128405.html",
            "https://lawnet.vn/thong-tin-phap-luat/en/dan-su/will-civil-transactions-conducted-due-to-deception-threats-or-coercion-in-vietnam-be-invalidated-153757.html"
          ],
          "note": "속임을 알았거나 알 수 있었던 때부터 2년(이차 자료). 원문 대조 필요"
        },
        {
          "id": "3",
          "name": "민법 제468조(이자 상한 연 20%) 및 형법 제201조(고리대금)",
          "publisher": "베트남 국회",
          "kind": "법령(이차 자료로 확인)",
          "urls": [],
          "note": "상한 초과분은 무효. 형법 제201조는 상한의 5배 이상 등 요건. 원문 대조 필요"
        },
        {
          "id": "4",
          "name": "형법 제217a조(다단계 판매) 및 정부령 제40/2018/ND-CP호",
          "publisher": "베트남 국회·정부",
          "kind": "법령(이차 자료로 확인)",
          "urls": [],
          "note": "원문 대조 필요"
        },
        {
          "id": "5",
          "name": "전자상거래법 제122/2025/QH15호(2025.12.10 통과, 2026.7.1 시행) 및 소비자권익보호법 제19/2023/QH15호",
          "publisher": "베트남 국회",
          "kind": "법령(이차 자료로 확인)",
          "urls": [
            "https://kpmg.com/us/en/taxnewsflash/news/2026/06/tnf-vietnam-law-on-e-commerce-2025-effective-july-1-2026.html",
            "https://blogs.duanemorris.com/vietnam/2026/01/16/vietnam-new-law-on-e-commerce-what-you-must-know/"
          ],
          "note": "소비자권익보호법 시행일은 이번에 확인하지 못함. 확인 필요"
        },
        {
          "id": "6",
          "name": "형사소송법 제101/2015/QH13호 제144조(신고는 구두 또는 서면)",
          "publisher": "베트남 국회",
          "kind": "법령(이차 자료로 확인)",
          "urls": [],
          "note": "제145조 등 후속 조항은 확인하지 못해 사용하지 않음. 확인 필요"
        },
        {
          "id": "7",
          "name": "공안부 사이버범죄 대응 부서(A05) 사기 수법 안내 (2020.10.13 기사)",
          "publisher": "베트남 공안부",
          "kind": "공식 기관 안내(기사 인용)",
          "urls": [],
          "note": "수법과 인증번호 요구 주의 안내. 원문 대조 필요"
        },
        {
          "id": "8",
          "name": "외국인 관련 결혼 중개·상담 규정 (정부령 제126/2014/ND-CP호 제51~52조, 정부령 제82/2020/ND-CP호 제39조)",
          "publisher": "베트남 정부",
          "kind": "법령(이차 자료로 확인)",
          "urls": [],
          "note": "원문 대조 필요"
        },
        {
          "id": "9",
          "name": "기업법 제59/2020/QH14호 (제28조 기업등록증의 내용)",
          "publisher": "베트남 국회",
          "kind": "법령",
          "urls": [
            "https://english.luatvietnam.vn/law-on-enterprises-no-59-2020-qh14-dated-june-17-2020-of-the-national-assembly-186272-doc1.html"
          ],
          "note": "세금 확정본 출처 6과 같은 자료"
        }
      ]
    }
  }
} as const;
