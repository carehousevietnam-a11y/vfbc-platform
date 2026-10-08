/* AUTO-GENERATED — scripts/parse-real-estate-master.mjs */
import type { ContentPackNode, Q1Option, CaseRiskTables } from "../types";

export const REAL_ESTATE_Q1: Q1Option[] = [
  {
    "value": "pre_contract",
    "label": "집을 빌리거나 사기 전이라, 계약서나 조건이 괜찮은지 먼저 확인하고 싶습니다.",
    "caseId": "RE01"
  },
  {
    "value": "deposit_dispute",
    "label": "보증금이나 계약금을 돌려받지 못했거나, 돈 문제로 상대방과 다투고 있습니다.",
    "caseId": "RE02"
  },
  {
    "value": "termination_notice",
    "label": "상대방에게서 계약 위반·해지·퇴거 통보를 받았습니다.",
    "caseId": "RE03"
  },
  {
    "value": "living_issue",
    "label": "살고 있는 집의 수리·하자·관리비·이웃 문제로 상대방과 해결이 안 되고 있습니다.",
    "caseId": "RE04"
  },
  {
    "value": "title_issue",
    "label": "집을 사는 과정에서 명의 이전이나 핑크북(토지사용권 증서) 같은 권리 서류에 문제가 생겼습니다.",
    "caseId": "RE05"
  }
];

export const REAL_ESTATE_NODES: Record<string, ContentPackNode[]> = {
  "RE01": [
    {
      "id": "re01_contract_type",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "contract.type"
      ],
      "question": "지금 앞두고 있는 계약은 어떤 계약인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_ct_lease_home",
          "label": "살 집(아파트·주택)을 빌리려고 하고, 집주인과 임대차 계약을 앞두고 있습니다.",
          "meaning": "contract.type=lease; property.use=residential; counterparty.type=owner_individual"
        },
        {
          "value": "r1_ct_lease_office",
          "label": "사무실이나 상가를 빌리려고 하고, 회사 주소나 영업 장소로 쓸 계획입니다.",
          "meaning": "contract.type=lease; property.use=commercial; office.planned_use=registered_address_or_business"
        },
        {
          "value": "r1_ct_purchase_project",
          "label": "분양 중인 아파트를 사려고 하고, 개발사(분양사)와 계약을 앞두고 있습니다.",
          "meaning": "contract.type=purchase; property.kind=project_apartment; counterparty.type=developer"
        },
        {
          "value": "r1_ct_purchase_resale",
          "label": "이미 지어진 집이나 아파트를 개인 소유자에게서 사려고 합니다.",
          "meaning": "contract.type=purchase; property.kind=existing; counterparty.type=owner_individual"
        },
        {
          "value": "r1_ct_deposit_only",
          "label": "본계약을 하기 전에, 계약금 약정서(đặt cọc)만 먼저 쓰자는 제안을 받았습니다.",
          "meaning": "contract.type=deposit_agreement; contract.main=not_yet; deposit_agreement.proposed_by=counterparty"
        }
      ]
    },
    {
      "id": "re01_progress_stage",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "stage.current"
      ],
      "question": "이 계약은 지금 어디까지 진행되었나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_st_viewing",
          "label": "집을 보고 조건만 들었고, 계약서나 서류는 아직 받지 못했습니다.",
          "meaning": "stage.current=viewing; contract.draft=none; payment.deposit=not_requested; initial_terms.form=verbal"
        },
        {
          "value": "r1_st_draft",
          "label": "계약서 초안을 받았고, 아직 서명이나 송금은 하지 않았습니다.",
          "meaning": "stage.current=draft_received; contract.draft=received; contract.main=unsigned; payment.deposit=not_paid"
        },
        {
          "value": "r1_st_deposit_requested",
          "label": "계약서에 서명하기 전에, 계약금부터 먼저 보내라는 요청을 받았습니다.",
          "meaning": "stage.current=deposit_requested; payment.deposit=requested_before_contract; contract.main=unsigned"
        },
        {
          "value": "r1_st_deposit_paid",
          "label": "계약금은 이미 보냈고, 본계약 서명이나 잔금 지급을 앞두고 있습니다.",
          "meaning": "stage.current=deposit_paid; payment.deposit=paid; contract.main=pending"
        },
        {
          "value": "r1_st_sign_scheduled",
          "label": "서명 날짜가 정해졌고, 그 전에 계약서를 확인받고 싶습니다.",
          "meaning": "stage.current=sign_scheduled; contract.main=scheduled; payment.deposit=not_paid"
        }
      ]
    },
    {
      "id": "re01_owner_doc_check",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "owner.book_seen"
      ],
      "question": "계약 상대방이 실제 소유자인지는 어떻게 확인하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_od_original_match",
          "label": "토지사용권 증서(핑크북) 원본을 직접 봤고, 소유자 이름이 계약 상대방과 같습니다.",
          "meaning": "owner.book_seen=original; owner.name_match=yes; signer.is_owner=true"
        },
        {
          "value": "r1_od_copy_only",
          "label": "핑크북 사본이나 사진만 받았고, 원본은 아직 보지 못했습니다.",
          "meaning": "owner.book_seen=copy; owner.name_match=unverified"
        },
        {
          "value": "r1_od_signer_differs",
          "label": "핑크북은 봤지만, 소유자와 계약서에 서명할 사람이 다릅니다.",
          "meaning": "owner.book_seen=seen; signer.is_owner=false; signer.authority=to_verify"
        },
        {
          "value": "r1_od_refused_delay",
          "label": "핑크북을 보여 달라고 했지만, 계속 미루거나 보여 줄 수 없다고 합니다.",
          "meaning": "owner.book_seen=none; client.action_precheck_request=made; counterparty.doc_response=refused_or_delayed"
        },
        {
          "value": "r1_od_project_no_book",
          "label": "분양 아파트라 핑크북은 아직 없고, 개발사 계약서와 사업 관련 서류만 받았습니다.",
          "meaning": "owner.book_seen=not_issued; property.kind=project_apartment; project.docs=to_verify"
        }
      ]
    },
    {
      "id": "re01_confirm_goal",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "goal.primary"
      ],
      "question": "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_cg_owner_authority",
          "label": "계약 상대방이 진짜 소유자인지, 서명할 권한이 있는 사람인지 먼저 확인하고 싶습니다.",
          "meaning": "goal.primary=verify_owner_authority"
        },
        {
          "value": "r1_cg_contract_terms",
          "label": "계약서에 제게 불리한 조항이나 빠진 조항이 없는지 확인하고 싶습니다.",
          "meaning": "goal.primary=review_terms"
        },
        {
          "value": "r1_cg_money_safety",
          "label": "계약금이나 보증금을 보내도 안전한지, 돌려받을 수 있는 조건인지 확인하고 싶습니다.",
          "meaning": "goal.primary=payment_safety"
        },
        {
          "value": "r1_cg_foreigner_fit",
          "label": "외국인인 제가 이 계약을 하고, 소유나 거주 신고까지 할 수 있는지 확인하고 싶습니다.",
          "meaning": "goal.primary=foreigner_eligibility"
        },
        {
          "value": "r1_cg_order_unsure",
          "label": "상황이 복잡해서, 서명 전에 무엇부터 확인해야 하는지 순서를 알고 싶습니다.",
          "meaning": "goal.primary=sequence_guidance"
        }
      ]
    },
    {
      "id": "re01_info_channel",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "channel.source"
      ],
      "question": "계약 조건이나 계약서는 누구를 통해 받으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_ic_owner_direct",
          "label": "집주인(소유자)에게 직접 조건을 들었고, 계약서도 직접 받았습니다.",
          "meaning": "channel.source=owner_direct; channel.medium=direct; broker.involved=false"
        },
        {
          "value": "r1_ic_broker_relay",
          "label": "중개인이 집주인 대신 조건을 전달했고, 계약서도 중개인을 통해 받았습니다.",
          "meaning": "channel.source=broker; broker.involved=true; owner.direct_contact=none"
        },
        {
          "value": "r1_ic_developer_sales",
          "label": "개발사 영업 담당자나 분양 대행사에게 조건과 계약서를 안내받았습니다.",
          "meaning": "channel.source=developer_sales; counterparty.type=developer"
        },
        {
          "value": "r1_ic_acquaintance",
          "label": "지인이나 회사 동료의 소개로, 비공식적으로 조건을 전해 들었습니다.",
          "meaning": "channel.source=acquaintance; broker.involved=informal; initial_terms.form=verbal"
        },
        {
          "value": "r1_ic_online_only",
          "label": "온라인 광고나 SNS 글을 보고 연락했고, 상대방과는 메시지로만 이야기했습니다.",
          "meaning": "channel.source=online; channel.medium=messages_only; counterparty.met_in_person=false"
        }
      ]
    },
    {
      "id": "re01_broker_role",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_info_channel = r1_ic_broker_relay|r1_ic_acquaintance` 또는 `re01_transfer_account = r1_ta_broker_account`",
      "profileFields": [
        "broker.type"
      ],
      "question": "이 계약에서 중개인은 어떤 역할을 하고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_br_licensed_written",
          "label": "중개회사 소속 중개인이고, 수수료와 역할이 서면으로 정해져 있습니다.",
          "meaning": "broker.type=licensed_company; broker.agreement=written; broker.fee=settled"
        },
        {
          "value": "r1_br_individual_verbal",
          "label": "개인 중개인이고, 수수료와 역할은 말로만 정했습니다.",
          "meaning": "broker.type=individual; broker.agreement=verbal"
        },
        {
          "value": "r1_br_both_sides",
          "label": "같은 중개인이 집주인 쪽과 제 쪽 일을 함께 맡고 있습니다.",
          "meaning": "broker.dual_agency=true"
        },
        {
          "value": "r1_br_collects_money",
          "label": "중개인이 계약금이나 보증금을 소유자 대신 받겠다고 합니다.",
          "meaning": "broker.collects_money=true; payment.handler=broker_proposed"
        },
        {
          "value": "r1_br_fee_unclear",
          "label": "중개 수수료를 누가, 언제, 얼마 내는지 아직 정해지지 않았습니다.",
          "meaning": "broker.fee=unsettled; broker.agreement=none"
        }
      ]
    },
    {
      "id": "re01_book_status",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_owner_doc_check = r1_od_copy_only|r1_od_refused_delay`",
      "profileFields": [
        "owner.book_location"
      ],
      "question": "핑크북 원본은 지금 어디에 있다고 들으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_bs_bank_held",
          "label": "은행 대출 담보로 은행에 맡겨 두었다고 들었고, 원본은 은행에서 찾아와야 한다고 합니다.",
          "meaning": "owner.book_location=bank; title.mortgage=reported; counterparty.doc_response=explained"
        },
        {
          "value": "r1_bs_reissue_transfer",
          "label": "재발급이나 명의 변경 절차 중이라, 원본이 아직 나오지 않았다고 합니다.",
          "meaning": "owner.book_location=in_process; owner.current_holder=uncertain"
        },
        {
          "value": "r1_bs_other_holder",
          "label": "가족이나 다른 사람이 원본을 보관하고 있어, 바로 가져올 수 없다고 합니다.",
          "meaning": "owner.book_location=third_party; signer.authority=to_verify"
        },
        {
          "value": "r1_bs_copy_enough",
          "label": "사본이면 충분하다며, 원본을 보여 줄 필요가 없다고 합니다.",
          "meaning": "owner.book_location=withheld; counterparty.doc_response=refused"
        },
        {
          "value": "r1_bs_no_reason",
          "label": "원본이 어디 있는지 설명 없이, 나중에 보여 주겠다고만 합니다.",
          "meaning": "owner.book_location=unexplained; counterparty.doc_response=delayed"
        }
      ]
    },
    {
      "id": "re01_owner_authority",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_owner_doc_check = r1_od_signer_differs`",
      "profileFields": [
        "signer.authority"
      ],
      "question": "소유자가 아닌 사람이 서명한다면, 그 사람의 권한은 어떻게 확인하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_oa_notarized_poa",
          "label": "공증받은 위임장을 보여 주었고, 위임 범위에 계약 서명과 돈을 받는 일이 포함되어 있습니다.",
          "meaning": "signer.authority=notarized_poa; signer.poa_scope=sign_and_receive; evidence.poa=seen"
        },
        {
          "value": "r1_oa_poa_unseen",
          "label": "위임장이 있다고 말로만 들었고, 실제 위임장은 보지 못했습니다.",
          "meaning": "signer.authority=poa_claimed_unseen; evidence.poa=none"
        },
        {
          "value": "r1_oa_co_owner_one",
          "label": "핑크북에 부부 등 여러 명이 적혀 있는데, 그중 한 사람만 서명한다고 합니다.",
          "meaning": "owner.count=multiple; signer.authority=co_owner_partial; owner.consent_all=unverified"
        },
        {
          "value": "r1_oa_relative_no_doc",
          "label": "소유자의 가족이 대신 서명한다고 하며, 위임장 이야기는 없었습니다.",
          "meaning": "signer.relation=relative; signer.authority=none_documented"
        },
        {
          "value": "r1_oa_company_rep",
          "label": "소유자가 회사이고, 대표자가 아닌 직원이 서명한다고 합니다.",
          "meaning": "owner.type=company; signer.relation=employee; signer.authority=company_authorization_to_verify"
        }
      ]
    },
    {
      "id": "re01_client_party",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_type = r1_ct_lease_office|r1_ct_purchase_project|r1_ct_purchase_resale`",
      "profileFields": [
        "client.party"
      ],
      "question": "계약서에 계약자(임차인·매수인)로 누구의 이름이 들어가나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_cp_self",
          "label": "제 개인 이름으로 계약하고, 이후 사용이나 등록도 제 명의로 할 계획입니다.",
          "meaning": "client.party=self_individual"
        },
        {
          "value": "r1_cp_vn_company",
          "label": "이미 베트남에 세운 회사 명의로 계약하고, 대표자가 서명할 예정입니다.",
          "meaning": "client.party=vn_company; client.company_status=established"
        },
        {
          "value": "r1_cp_with_spouse",
          "label": "배우자나 가족과 함께 공동 명의로 계약하려고 합니다.",
          "meaning": "client.party=joint_with_family"
        },
        {
          "value": "r1_cp_company_pending",
          "label": "회사를 아직 세우기 전이라, 우선 개인 이름으로 하고 나중에 회사로 바꾸려고 합니다.",
          "meaning": "client.party=self_individual; client.company_status=pending; contract.assignment_planned=true"
        },
        {
          "value": "r1_cp_other_name",
          "label": "제가 돈을 내지만, 베트남인 지인이나 다른 사람 이름으로 계약하자는 이야기가 있습니다.",
          "meaning": "client.party=other_person; client.payer=self; nominee.proposed=true"
        }
      ]
    },
    {
      "id": "re01_contract_form",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "contract.language"
      ],
      "question": "계약서는 어떤 언어로 되어 있고, 공증은 어떻게 하기로 했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_cf_bilingual_notary",
          "label": "베트남어와 영어(또는 한국어)가 함께 적힌 계약서이고, 공증사무소에서 공증하기로 했습니다.",
          "meaning": "contract.language=bilingual; contract.notary=planned"
        },
        {
          "value": "r1_cf_bilingual_no_notary",
          "label": "두 언어가 함께 적힌 계약서이지만, 공증 없이 서명만 하자고 합니다.",
          "meaning": "contract.language=bilingual; contract.notary=declined_by_counterparty"
        },
        {
          "value": "r1_cf_vi_only",
          "label": "베트남어로만 된 계약서이고, 공증을 할지는 아직 정해지지 않았습니다.",
          "meaning": "contract.language=vi_only; contract.notary=undecided; client.comprehension=limited"
        },
        {
          "value": "r1_cf_unofficial_translation",
          "label": "중개인이 만든 한국어 번역본만 받았고, 베트남어 원문과 같은지 확인하지 못했습니다.",
          "meaning": "contract.language=translation_only; contract.translation_verified=false; contract.translation_by=broker"
        },
        {
          "value": "r1_cf_no_draft",
          "label": "아직 계약서 초안을 받지 못했고, 말이나 메시지로 조건만 들었습니다.",
          "meaning": "contract.draft=none; initial_terms.form=verbal_or_message"
        }
      ]
    },
    {
      "id": "re01_language_gap",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_form = r1_cf_vi_only|r1_cf_unofficial_translation`",
      "profileFields": [
        "contract.gap_clause"
      ],
      "question": "계약서 내용 중 이해하기 가장 어려운 부분은 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_lg_penalty_terms",
          "label": "계약금 몰수나 위약금 등, 계약을 깰 때 적용되는 조항을 이해하지 못했습니다.",
          "meaning": "contract.gap_clause=penalty; contract.penalty=not_understood"
        },
        {
          "value": "r1_lg_termination",
          "label": "중도 해지나 갱신 조건이 어떻게 적혀 있는지 알 수 없습니다.",
          "meaning": "contract.gap_clause=termination_renewal"
        },
        {
          "value": "r1_lg_money_schedule",
          "label": "금액과 지급 일정이 제가 들은 내용과 같은지 확인하지 못했습니다.",
          "meaning": "contract.gap_clause=payment_schedule; contract.match_initial=unverified"
        },
        {
          "value": "r1_lg_cost_burden",
          "label": "관리비·수리비·세금을 누가 부담하는지 적힌 부분을 이해하지 못했습니다.",
          "meaning": "contract.gap_clause=cost_burden"
        },
        {
          "value": "r1_lg_version_priority",
          "label": "번역본과 원문이 다를 때 어느 쪽을 따르는지 적혀 있는지 모릅니다.",
          "meaning": "contract.gap_clause=language_priority; contract.prevailing_language=unknown"
        }
      ]
    },
    {
      "id": "re01_condition_compare",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_form = r1_cf_bilingual_notary|r1_cf_bilingual_no_notary|r1_cf_unofficial_translation`",
      "profileFields": [
        "contract.match_initial"
      ],
      "question": "계약서 내용은 처음 안내받은 조건과 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_cc_same",
          "label": "금액·기간·포함 항목 등이 처음 안내받은 조건과 거의 같습니다.",
          "meaning": "contract.match_initial=same"
        },
        {
          "value": "r1_cc_amount_diff",
          "label": "월세·보증금·매매대금 등 금액이 처음 들은 것과 다르게 적혀 있습니다.",
          "meaning": "contract.match_initial=amount_diff"
        },
        {
          "value": "r1_cc_scope_diff",
          "label": "가구·관리비·주차 등 포함된다고 들은 항목이 빠져 있거나 다르게 적혀 있습니다.",
          "meaning": "contract.match_initial=scope_diff"
        },
        {
          "value": "r1_cc_unit_diff",
          "label": "호수·면적·층 등 물건 정보가 제가 직접 본 곳과 다르게 적혀 있습니다.",
          "meaning": "contract.match_initial=unit_diff; property.identity=mismatch"
        },
        {
          "value": "r1_cc_cannot_compare",
          "label": "처음 조건을 말로만 들어서, 계약서와 무엇을 비교해야 할지 정리되지 않았습니다.",
          "meaning": "contract.match_initial=uncomparable; initial_terms.form=verbal"
        }
      ]
    },
    {
      "id": "re01_compare_detail",
      "phase": 2,
      "kind": "text",
      "showIf": "`re01_condition_compare = r1_cc_amount_diff|r1_cc_scope_diff|r1_cc_unit_diff`",
      "profileFields": [
        "contract.diff_text"
      ],
      "question": "처음 들은 조건과 계약서에 적힌 내용이 어떻게 다른지 적어 주세요.",
      "placeholder": "예) 중개인은 월세 1,800만 동에 관리비 포함이라고 했는데, 계약서에는 월세 2,000만 동, 관리비 별도로 적혀 있습니다.",
      "options": []
    },
    {
      "id": "re01_counterparty_reaction",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_condition_compare = r1_cc_amount_diff|r1_cc_scope_diff|r1_cc_unit_diff`",
      "profileFields": [
        "counterparty.response_to_diff"
      ],
      "question": "다른 부분을 상대방이나 중개인에게 말했을 때, 어떤 반응이었나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_cr_agreed_fix",
          "label": "계약서를 고쳐 주겠다고 했고, 수정본을 받기로 했습니다.",
          "meaning": "client.action_raised_diff=true; counterparty.response_to_diff=accepted_fix; contract.revision=pending"
        },
        {
          "value": "r1_cr_verbal_promise",
          "label": "말로는 맞춰 주겠다고 했지만, 계약서는 그대로 두고 서명하자고 합니다.",
          "meaning": "client.action_raised_diff=true; counterparty.response_to_diff=partial_verbal_only"
        },
        {
          "value": "r1_cr_refused",
          "label": "수정은 어렵다며, 그대로 서명하거나 계약을 포기하라고 했습니다.",
          "meaning": "client.action_raised_diff=true; counterparty.response_to_diff=refused"
        },
        {
          "value": "r1_cr_no_reply",
          "label": "다른 부분을 말했지만, 아직 답을 받지 못했습니다.",
          "meaning": "client.action_raised_diff=true; counterparty.response_to_diff=no_reply"
        },
        {
          "value": "r1_cr_not_raised",
          "label": "아직 상대방에게 다른 부분을 말하지 않았습니다.",
          "meaning": "client.action_raised_diff=false"
        }
      ]
    },
    {
      "id": "re01_precheck_response",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_owner_doc_check = r1_od_copy_only|r1_od_refused_delay` 또는 (`re01_progress_stage = r1_st_deposit_requested` 또는 `re01_contract_type = r1_ct_deposit_only`, 단 `re01_contract_type ≠ r1_ct_purchase_project`)",
      "profileFields": [
        "counterparty.precheck_response"
      ],
      "question": "송금이나 서명 전에 핑크북 원본이나 계약서를 먼저 보여 달라고 했을 때, 상대방은 어떻게 답했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_pr_accepted",
          "label": "원본과 계약서를 먼저 보여 주겠다고 했고, 확인할 날짜를 잡았습니다.",
          "meaning": "client.action_precheck_request=made; counterparty.precheck_response=accepted"
        },
        {
          "value": "r1_pr_pay_first",
          "label": "계약금을 먼저 보내야 원본이나 계약서를 보여 줄 수 있다고 했습니다.",
          "meaning": "client.action_precheck_request=made; counterparty.precheck_response=pay_first"
        },
        {
          "value": "r1_pr_shift_blame",
          "label": "소유자가 해외에 있다거나 중개인이 알아서 한다며, 직접 확인은 어렵다고 했습니다.",
          "meaning": "client.action_precheck_request=made; counterparty.precheck_response=shift_responsibility; owner.direct_contact=none"
        },
        {
          "value": "r1_pr_new_terms",
          "label": "다른 사람이 더 높은 금액을 제시했다며, 금액을 올리거나 바로 결정하라고 했습니다.",
          "meaning": "client.action_precheck_request=made; counterparty.precheck_response=new_terms; timeline.pressure=true"
        },
        {
          "value": "r1_pr_not_asked",
          "label": "아직 원본 확인이나 계약서를 먼저 달라고 요청하지 않았습니다.",
          "meaning": "client.action_precheck_request=not_made"
        }
      ]
    },
    {
      "id": "re01_deposit_months",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_type = r1_ct_lease_home|r1_ct_lease_office`",
      "profileFields": [
        "lease.deposit_months"
      ],
      "question": "보증금과 월세 지급 조건은 어떻게 안내받으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_dm_one_month",
          "label": "보증금은 월세 1개월분이고, 계약서에 금액과 돌려받는 시점이 적혀 있습니다.",
          "meaning": "lease.deposit_months=1; lease.deposit_return_terms=written"
        },
        {
          "value": "r1_dm_two_months",
          "label": "보증금은 월세 2개월분이고, 나갈 때 돌려준다는 말을 들었습니다.",
          "meaning": "lease.deposit_months=2; lease.deposit_return_terms=verbal"
        },
        {
          "value": "r1_dm_three_plus",
          "label": "보증금이 월세 3개월분 이상이거나, 월세를 여러 달치 미리 내라고 합니다.",
          "meaning": "lease.deposit_months=3_plus; lease.prepay=multiple_months"
        },
        {
          "value": "r1_dm_return_unclear",
          "label": "보증금 금액은 정해졌지만, 언제 어떤 조건으로 돌려주는지는 정해지지 않았습니다.",
          "meaning": "lease.deposit_amount=set; lease.deposit_return_terms=unset"
        },
        {
          "value": "r1_dm_not_settled",
          "label": "보증금 금액과 월세 지급 방식은 아직 협의하고 있습니다.",
          "meaning": "lease.deposit_amount=unset; lease.payment_terms=negotiating"
        }
      ]
    },
    {
      "id": "re01_payment_schedule",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_type = r1_ct_purchase_project|r1_ct_purchase_resale`",
      "profileFields": [
        "purchase.schedule"
      ],
      "question": "매매대금은 어떤 순서로 지급하기로 했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_ps_staged_written",
          "label": "계약금·중도금·잔금의 단계와 날짜가 계약서나 개발사 일정표에 적혀 있습니다.",
          "meaning": "purchase.schedule=staged_written"
        },
        {
          "value": "r1_ps_deposit_only_fixed",
          "label": "계약금 금액만 정해졌고, 중도금과 잔금 일정은 아직 정하지 않았습니다.",
          "meaning": "purchase.schedule=deposit_only; purchase.balance_dates=unset"
        },
        {
          "value": "r1_ps_lump_sum_first",
          "label": "명의 이전이나 핑크북 발급 전에, 대금 대부분이나 전액을 먼저 보내라고 합니다.",
          "meaning": "purchase.schedule=lump_before_transfer; payment.exposure=high"
        },
        {
          "value": "r1_ps_mortgage_payoff",
          "label": "잔금 일부로 소유자의 은행 대출을 갚고 담보를 풀겠다고 합니다.",
          "meaning": "purchase.schedule=mortgage_payoff; title.mortgage=existing"
        },
        {
          "value": "r1_ps_price_split",
          "label": "계약서에 적는 금액과 실제로 주고받는 금액을 다르게 하자는 제안을 받았습니다.",
          "meaning": "price.dual_declaration=proposed"
        }
      ]
    },
    {
      "id": "re01_deposit_link",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_type = r1_ct_deposit_only`",
      "profileFields": [
        "deposit_agreement.main_type"
      ],
      "question": "이 계약금 약정은 어떤 본계약으로 이어지기로 했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_dl_lease_fixed_date",
          "label": "임대차 본계약으로 이어지고, 본계약 서명 날짜도 정해져 있습니다.",
          "meaning": "deposit_agreement.main_type=lease; deposit_agreement.main_date=fixed"
        },
        {
          "value": "r1_dl_purchase_fixed_date",
          "label": "매매 본계약으로 이어지고, 본계약을 공증할 날짜도 정해져 있습니다.",
          "meaning": "deposit_agreement.main_type=purchase; deposit_agreement.main_date=fixed; contract.notary=planned"
        },
        {
          "value": "r1_dl_no_date",
          "label": "본계약을 한다는 말만 있고, 언제 하는지는 정해지지 않았습니다.",
          "meaning": "deposit_agreement.main_date=unset"
        },
        {
          "value": "r1_dl_terms_open",
          "label": "계약금만 먼저 걸고, 금액이나 세부 조건은 나중에 정하자고 합니다.",
          "meaning": "deposit_agreement.terms=open; deposit_agreement.price=unset"
        }
      ]
    },
    {
      "id": "re01_amount_detail",
      "phase": 2,
      "kind": "text",
      "showIf": "`re01_deposit_months = r1_dm_one_month|r1_dm_two_months|r1_dm_three_plus|r1_dm_return_unclear` 또는 `re01_payment_schedule` 응답 시 또는 `re01_deposit_link` 응답 시 또는 `re01_progress_stage = r1_st_deposit_paid`",
      "profileFields": [
        "amount.text"
      ],
      "question": "안내받은 금액(월세·보증금·매매대금·계약금)과, 이미 보냈거나 보내기로 한 날짜를 적어 주세요.",
      "placeholder": "예) 매매대금 45억 동, 계약금 4억 5천만 동(10%)은 9월 28일 송금, 잔금은 10월 15일 공증일에 지급 예정",
      "options": []
    },
    {
      "id": "re01_transfer_account",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_progress_stage = r1_st_deposit_requested|r1_st_deposit_paid` 또는 `re01_contract_type = r1_ct_deposit_only`",
      "profileFields": [
        "payment.account_holder"
      ],
      "question": "계약금이나 보증금은 누구 명의의 계좌로 보내라고 했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_ta_owner_account",
          "label": "핑크북에 적힌 소유자(분양이면 개발사) 본인 명의 계좌로 보내라고 했습니다.",
          "meaning": "payment.account_holder=owner_or_developer; payment.account_match=yes"
        },
        {
          "value": "r1_ta_broker_account",
          "label": "중개인이나 중개회사 명의 계좌로 보내라고 했습니다.",
          "meaning": "payment.account_holder=broker; payment.owner_ack=needed"
        },
        {
          "value": "r1_ta_third_party",
          "label": "소유자의 가족이나 다른 사람 명의 계좌로 보내라고 했고, 그 이유는 듣지 못했습니다.",
          "meaning": "payment.account_holder=third_party; payment.reason=unexplained"
        },
        {
          "value": "r1_ta_cash",
          "label": "현금으로 직접 달라고 했고, 영수증을 써 줄지는 확실하지 않습니다.",
          "meaning": "payment.method=cash; payment.receipt=uncertain"
        },
        {
          "value": "r1_ta_not_told",
          "label": "돈을 보내라는 말은 들었지만, 어느 계좌로 보내는지는 아직 안내받지 못했습니다.",
          "meaning": "payment.account_holder=unknown"
        }
      ]
    },
    {
      "id": "re01_deposit_paid_proof",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_progress_stage = r1_st_deposit_paid`",
      "profileFields": [
        "payment.proof"
      ],
      "question": "이미 보낸 계약금에 대해, 받았다는 확인은 어떻게 남아 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_dp_signed_receipt",
          "label": "송금했고, 상대방이 서명한 계약금 영수증이나 약정서를 받았습니다.",
          "meaning": "payment.proof=signed_receipt; evidence.payment=strong"
        },
        {
          "value": "r1_dp_transfer_only",
          "label": "송금 내역은 있지만, 상대방이 서명한 영수증이나 약정서는 받지 못했습니다.",
          "meaning": "payment.proof=transfer_record_only; payment.purpose_ack=missing"
        },
        {
          "value": "r1_dp_cash_no_receipt",
          "label": "현금으로 건넸고, 받았다는 서면 확인은 받지 못했습니다.",
          "meaning": "payment.method=cash; payment.proof=none"
        },
        {
          "value": "r1_dp_via_broker",
          "label": "중개인에게 건넸고, 소유자에게 전달되었는지는 확인하지 못했습니다.",
          "meaning": "payment.handler=broker; payment.delivery_to_owner=unconfirmed"
        }
      ]
    },
    {
      "id": "re01_post_deposit_status",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_progress_stage = r1_st_deposit_paid`",
      "profileFields": [
        "counterparty.post_deposit"
      ],
      "question": "계약금을 보낸 뒤, 상대방은 본계약에 대해 어떻게 하고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_pa_on_schedule",
          "label": "약속한 날짜에 본계약을 하기로 했고, 서류 준비도 진행되고 있습니다.",
          "meaning": "counterparty.post_deposit=on_schedule"
        },
        {
          "value": "r1_pa_terms_changed",
          "label": "본계약 전에 금액이나 조건을 바꾸자고 새로 제안했습니다.",
          "meaning": "counterparty.post_deposit=new_terms"
        },
        {
          "value": "r1_pa_delay_excuse",
          "label": "서류 준비나 다른 사람 사정을 이유로, 본계약 날짜를 계속 미루고 있습니다.",
          "meaning": "counterparty.post_deposit=delay_shift_responsibility; contract.main_date=slipping"
        },
        {
          "value": "r1_pa_more_money",
          "label": "본계약 전에 돈을 더 보내야 진행할 수 있다고 요구합니다.",
          "meaning": "counterparty.post_deposit=additional_payment_demand"
        },
        {
          "value": "r1_pa_unreachable",
          "label": "계약금을 받은 뒤로 연락이 잘 되지 않거나, 답이 계속 늦어지고 있습니다.",
          "meaning": "counterparty.post_deposit=avoiding_contact"
        }
      ]
    },
    {
      "id": "re01_penalty_clause",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_progress_stage = r1_st_deposit_requested|r1_st_deposit_paid|r1_st_sign_scheduled` 또는 `re01_contract_type = r1_ct_deposit_only`",
      "profileFields": [
        "contract.penalty"
      ],
      "question": "계약을 깨는 경우 계약금을 어떻게 처리한다고 되어 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_pc_mutual_written",
          "label": "제가 포기하면 계약금을 잃고, 상대방이 어기면 배액을 돌려준다고 서면에 적혀 있습니다.",
          "meaning": "contract.penalty=mutual_written"
        },
        {
          "value": "r1_pc_one_sided",
          "label": "제가 포기하면 계약금을 잃는다는 내용만 있고, 상대방이 어기는 경우는 적혀 있지 않습니다.",
          "meaning": "contract.penalty=one_sided_against_client"
        },
        {
          "value": "r1_pc_conditional_refund",
          "label": "대출 거절이나 서류 문제 등 특정한 경우에는 계약금을 돌려준다는 조건이 적혀 있습니다.",
          "meaning": "contract.penalty=conditional_refund_written"
        },
        {
          "value": "r1_pc_verbal_only",
          "label": "몰수나 배액 반환에 대해 말로만 들었고, 서면에는 적혀 있지 않습니다.",
          "meaning": "contract.penalty=verbal_only"
        },
        {
          "value": "r1_pc_not_checked",
          "label": "위약 조항이 있는지, 있다면 무슨 뜻인지 아직 확인하지 못했습니다.",
          "meaning": "contract.penalty=unchecked"
        }
      ]
    },
    {
      "id": "re01_project_docs",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_type = r1_ct_purchase_project` 또는 `re01_owner_doc_check = r1_od_project_no_book`",
      "profileFields": [
        "project.docs"
      ],
      "question": "개발사(또는 분양 대행사)에게서 받았거나 확인한 서류는 어디까지인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_pj_guarantee_received",
          "label": "매매계약서와 함께, 은행이 개발사의 의무를 보증한다는 확인서(은행 보증서)를 받기로 했습니다.",
          "meaning": "project.docs=bank_guarantee; project.contract_stage=formal"
        },
        {
          "value": "r1_pj_permits_only",
          "label": "건축 허가나 사업 승인 서류 사본은 받았지만, 은행 보증서 이야기는 없었습니다.",
          "meaning": "project.docs=permits_only; project.bank_guarantee=unconfirmed"
        },
        {
          "value": "r1_pj_reservation_only",
          "label": "정식 매매계약 전 단계라며, 예약 계약서(가계약서)와 예약금 안내만 받았습니다.",
          "meaning": "project.docs=reservation_only; project.contract_stage=reservation"
        },
        {
          "value": "r1_pj_brochure_only",
          "label": "분양 안내 책자와 영업 담당자 설명만 받았고, 서류는 받지 못했습니다.",
          "meaning": "project.docs=brochure_only; initial_terms.form=marketing"
        },
        {
          "value": "r1_pj_secondary_transfer",
          "label": "개발사가 아니라, 먼저 분양받은 사람에게서 계약을 넘겨받는 구조입니다.",
          "meaning": "project.transfer_from_buyer=true; counterparty.type=prior_buyer; developer.approval=to_verify"
        }
      ]
    },
    {
      "id": "re01_residence_registration",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_type = r1_ct_lease_home` 그리고 `re01_progress_stage = r1_st_viewing|r1_st_draft|r1_st_sign_scheduled`",
      "profileFields": [
        "lease.residence_registration"
      ],
      "question": "입주 후 공안에 하는 임시거주 신고는 어떻게 하기로 했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_rr_owner_will_do",
          "label": "집주인이 입주 후 임시거주 신고를 해 주기로 했고, 계약서에도 적혀 있습니다.",
          "meaning": "lease.residence_registration=owner_in_contract"
        },
        {
          "value": "r1_rr_verbal_only",
          "label": "집주인이 신고해 준다고 말했지만, 계약서에는 적혀 있지 않습니다.",
          "meaning": "lease.residence_registration=owner_verbal"
        },
        {
          "value": "r1_rr_tenant_self",
          "label": "신고는 제가 알아서 하라고 했고, 필요한 서류는 안내받지 못했습니다.",
          "meaning": "lease.residence_registration=tenant_self; lease.owner_docs_for_registration=not_offered"
        },
        {
          "value": "r1_rr_refused_or_fee",
          "label": "집주인이 신고를 꺼리거나, 신고해 주는 대신 추가 비용을 요구했습니다.",
          "meaning": "lease.residence_registration=refused_or_fee"
        },
        {
          "value": "r1_rr_not_discussed",
          "label": "임시거주 신고에 대해서는 아직 이야기해 본 적이 없습니다.",
          "meaning": "lease.residence_registration=undiscussed"
        },
        {
          "value": "re01_contract_type = r1_ct_lease_home",
          "label": "r1_st_draft",
          "meaning": "r1_st_sign_scheduled"
        }
      ]
    },
    {
      "id": "re01_commercial_use",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_type = r1_ct_lease_office`",
      "profileFields": [
        "office.registration_use"
      ],
      "question": "이 공간을 회사 주소나 영업 장소로 쓰는 것은 어떻게 확인하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_cu_registration_ok",
          "label": "회사 등록 주소로 써도 된다고 했고, 필요한 서류(핑크북 사본 등)도 주기로 했습니다.",
          "meaning": "office.registration_use=confirmed; office.owner_docs=offered"
        },
        {
          "value": "r1_cu_verbal_only",
          "label": "사업 용도로 써도 된다고 말로만 들었고, 계약서에는 용도가 적혀 있지 않습니다.",
          "meaning": "office.registration_use=verbal; contract.use_clause=missing"
        },
        {
          "value": "r1_cu_sublease",
          "label": "건물주가 아니라, 건물을 먼저 빌린 사람에게서 다시 빌리는 구조입니다.",
          "meaning": "office.sublease=true; counterparty.type=head_tenant; owner.consent=to_verify"
        },
        {
          "value": "r1_cu_use_restricted",
          "label": "주거용 건물이거나 용도 제한이 있다는 말을 들었지만, 확인하지 못했습니다.",
          "meaning": "office.registration_use=restricted_unverified"
        },
        {
          "value": "r1_cu_fitout_unclear",
          "label": "인테리어 공사와 나갈 때 원상복구 비용을 누가 부담하는지 정해지지 않았습니다.",
          "meaning": "office.fitout_terms=unset"
        }
      ]
    },
    {
      "id": "re01_foreign_eligibility",
      "phase": 2,
      "kind": "single",
      "showIf": "`re01_contract_type = r1_ct_purchase_project|r1_ct_purchase_resale` 또는 `re01_deposit_link = r1_dl_purchase_fixed_date`",
      "profileFields": [
        "purchase.foreign_eligibility"
      ],
      "question": "외국인 명의로 이 집을 살 수 있는지는 어떻게 확인하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_fe_quota_written",
          "label": "분양 프로젝트의 아파트이고, 외국인 구매 가능 물량이 남아 있다고 서면으로 안내받았습니다.",
          "meaning": "purchase.foreign_eligibility=quota_written; property.kind=project_apartment"
        },
        {
          "value": "r1_fe_quota_verbal",
          "label": "외국인도 살 수 있다고 말로만 들었고, 물량이나 프로젝트 조건은 확인하지 못했습니다.",
          "meaning": "purchase.foreign_eligibility=quota_verbal"
        },
        {
          "value": "r1_fe_landed_house",
          "label": "프로젝트 밖의 개인 주택(토지가 딸린 집)이고, 외국인 명의가 가능한지 확인하지 못했습니다.",
          "meaning": "purchase.foreign_eligibility=landed_unverified; property.kind=landed_house"
        },
        {
          "value": "r1_fe_nominee_name",
          "label": "베트남인 지인이나 중개인 명의를 빌려서 사 두자는 제안을 받았습니다.",
          "meaning": "purchase.foreign_eligibility=nominee_proposed; nominee.proposed=true"
        },
        {
          "value": "r1_fe_term_unknown",
          "label": "살 수는 있다고 들었지만, 외국인인 제가 소유할 수 있는 기간과 연장 가능 여부는 설명받지 못했습니다.",
          "meaning": "purchase.foreign_eligibility=term_unexplained"
        }
      ]
    },
    {
      "id": "re01_sign_deadline",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "timeline.deadline_type"
      ],
      "question": "서명이나 송금은 언제까지 결정해야 한다고 들으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_sd_date_fixed",
          "label": "서명(또는 송금) 날짜가 정해져 있고, 정확한 날짜를 알고 있습니다.",
          "meaning": "timeline.deadline_type=fixed_date"
        },
        {
          "value": "r1_sd_pressure_days",
          "label": "'며칠 안에 결정하지 않으면 다른 사람에게 넘긴다'는 말을 들었습니다.",
          "meaning": "timeline.deadline_type=counterparty_pressure; timeline.pressure=true"
        },
        {
          "value": "r1_sd_move_in_driven",
          "label": "입주나 개업 날짜에 맞춰야 해서, 제 쪽 일정이 급합니다.",
          "meaning": "timeline.deadline_type=client_driven"
        },
        {
          "value": "r1_sd_no_deadline",
          "label": "정해진 기한은 없고, 제가 결정하는 대로 진행하면 된다고 합니다.",
          "meaning": "timeline.deadline_type=none"
        },
        {
          "value": "r1_sd_passed",
          "label": "약속한 날짜가 이미 지났고, 상대방이 계속 진행할지 확실하지 않습니다.",
          "meaning": "timeline.deadline_type=passed; counterparty.intent=uncertain"
        }
      ]
    },
    {
      "id": "re01_sign_date",
      "phase": 2,
      "kind": "text",
      "showIf": "`re01_sign_deadline = r1_sd_date_fixed|r1_sd_pressure_days|r1_sd_move_in_driven`",
      "profileFields": [
        "timeline.sign_date"
      ],
      "question": "서명하거나 돈을 보내기로 한 날짜는 언제인가요?",
      "placeholder": "예) 10월 15일 오전 공증사무소에서 서명, 계약금은 서명 당일 송금",
      "options": []
    },
    {
      "id": "re01_evidence",
      "phase": 2,
      "kind": "multi",
      "showIf": "항상",
      "profileFields": [
        "evidence.contract"
      ],
      "question": "현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
      "placeholder": "",
      "options": [
        {
          "value": "r1_ev_contract_draft",
          "label": "계약서 초안이나 수정본(파일·사진 포함)",
          "meaning": "evidence.contract=held"
        },
        {
          "value": "r1_ev_owner_docs",
          "label": "핑크북, 상대방 신분증, 위임장의 사본이나 사진",
          "meaning": "evidence.owner_docs=held"
        },
        {
          "value": "r1_ev_payment_record",
          "label": "송금 내역이나 계약금 영수증",
          "meaning": "evidence.payment=held"
        },
        {
          "value": "r1_ev_messages",
          "label": "중개인·상대방과 주고받은 메시지(Zalo·카카오톡 등)",
          "meaning": "evidence.messages=held"
        },
        {
          "value": "r1_ev_none",
          "label": "보관 중인 자료가 없거나, 아직 정리하지 못했습니다.",
          "meaning": "evidence.any=none_or_unorganized"
        }
      ]
    },
    {
      "id": "re01_blockage",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "blockage.main"
      ],
      "question": "현재 이 계약을 진행하지 못하는 가장 큰 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_bl_owner_unverified",
          "label": "상대방이 진짜 소유자이거나 권한이 있는 사람인지 확신이 없어, 서명을 미루고 있습니다.",
          "meaning": "blockage.main=owner_authority_unverified"
        },
        {
          "value": "r1_bl_contract_unreadable",
          "label": "계약서를 제대로 이해하지 못해, 불리한 조항이 있는지 판단하지 못하고 있습니다.",
          "meaning": "blockage.main=contract_comprehension"
        },
        {
          "value": "r1_bl_money_risk",
          "label": "돈을 먼저 보내라고 하는데, 돌려받지 못할까 봐 송금을 망설이고 있습니다.",
          "meaning": "blockage.main=payment_risk"
        },
        {
          "value": "r1_bl_eligibility_unclear",
          "label": "외국인인 제가 이 계약으로 소유하거나 거주 신고를 할 수 있는지 몰라 멈춰 있습니다.",
          "meaning": "blockage.main=foreigner_eligibility"
        },
        {
          "value": "r1_bl_time_pressure",
          "label": "결정할 시간이 짧아, 무엇부터 확인해야 할지 정리하지 못하고 있습니다.",
          "meaning": "blockage.main=time_pressure"
        }
      ]
    },
    {
      "id": "re01_final_goal",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "goal.final"
      ],
      "question": "이번 검토를 통해 이 계약을 어떻게 마무리하고 싶으신가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r1_fg_sign_safely",
          "label": "확인할 것을 모두 확인한 뒤, 문제가 없으면 그대로 서명하고 싶습니다.",
          "meaning": "goal.final=sign_after_check"
        },
        {
          "value": "r1_fg_revise_then_sign",
          "label": "불리하거나 빠진 조항을 고친 뒤에 서명하고 싶습니다.",
          "meaning": "goal.final=revise_then_sign"
        },
        {
          "value": "r1_fg_protect_deposit",
          "label": "이미 보냈거나 앞으로 보낼 계약금을 지킬 수 있는 방법을 정리하고 싶습니다.",
          "meaning": "goal.final=protect_deposit"
        },
        {
          "value": "r1_fg_withdraw_safely",
          "label": "위험이 크다면, 손해를 줄이면서 계약을 하지 않는 쪽으로 정리하고 싶습니다.",
          "meaning": "goal.final=withdraw_minimize_loss"
        },
        {
          "value": "r1_fg_expert_handle",
          "label": "계약서 검토와 상대방과의 협의를 전문가에게 맡기고 싶습니다.",
          "meaning": "goal.final=delegate_to_expert"
        }
      ]
    }
  ],
  "RE02": [
    {
      "id": "re02_role",
      "phase": 1,
      "kind": "single",
      "showIf": "항상 / profile_field: `party.role`, `party.side`, `contract.kind`",
      "profileFields": [
        "party.role"
      ],
      "question": "이번 계약에서 어떤 입장이셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "role_tenant",
          "label": "집을 빌려 살았던 세입자이고, 집주인에게 보증금을 맡겨 두었습니다.",
          "meaning": "party.role=tenant; party.side=payer; contract.kind=lease; contract.signer=self"
        },
        {
          "value": "role_company_occupant",
          "label": "계약은 회사 명의로 했고, 저는 그 집에 실제로 살았던 사람입니다.",
          "meaning": "party.role=occupant; party.side=payer; contract.kind=lease; contract.signer=company"
        },
        {
          "value": "role_landlord",
          "label": "집을 빌려준 집주인이고, 세입자에게 보증금을 받아 보관하고 있었습니다.",
          "meaning": "party.role=landlord; party.side=holder; contract.kind=lease"
        },
        {
          "value": "role_buyer",
          "label": "집을 사려던 매수인이고, 매도인에게 계약금(đặt cọc)을 보냈습니다.",
          "meaning": "party.role=buyer; party.side=payer; contract.kind=sale_deposit"
        },
        {
          "value": "role_seller",
          "label": "집을 팔려던 매도인이고, 매수인에게 계약금(đặt cọc)을 받았습니다.",
          "meaning": "party.role=seller; party.side=holder; contract.kind=sale_deposit"
        }
      ]
    },
    {
      "id": "re02_dispute_type",
      "phase": 1,
      "kind": "single",
      "showIf": "`re02_role = role_tenant|role_company_occupant|role_buyer` / profile_field: `dispute.type`, `payment.refund_status`",
      "profileFields": [
        "dispute.type"
      ],
      "question": "돈 문제는 지금 어떤 상황인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "dt_not_returned",
          "label": "계약이 끝났거나 끝내기로 했는데, 맡긴 보증금이나 계약금을 아직 전혀 돌려받지 못했습니다.",
          "meaning": "dispute.type=not_returned; payment.refund_status=none"
        },
        {
          "value": "dt_partial_deduction",
          "label": "일부는 돌려받았지만, 수리비·청소비 등을 이유로 상당한 금액이 공제되었습니다.",
          "meaning": "dispute.type=partial_deduction; payment.refund_status=partial"
        },
        {
          "value": "dt_deposit_forfeited",
          "label": "계약이 진행되지 않자, 상대방이 계약금을 모두 가져가겠다고 하고 있습니다.",
          "meaning": "dispute.type=forfeit_claimed; payment.refund_status=none; counterparty.position=keep_all"
        },
        {
          "value": "dt_extra_claim",
          "label": "돌려받기는커녕, 위약금이나 추가 금액을 더 내라는 요구를 받고 있습니다.",
          "meaning": "dispute.type=extra_claim_against_self; payment.refund_status=none; counterparty.position=demands_more"
        },
        {
          "value": "dt_contact_avoided",
          "label": "돌려주겠다는 말은 들었지만, 그 뒤로 상대방이 연락을 피하거나 답이 없습니다.",
          "meaning": "dispute.type=not_returned; payment.refund_status=none; counterparty.promise=verbal_return; counterparty.contact=avoiding"
        }
      ]
    },
    {
      "id": "re02_dispute_type_holder",
      "phase": 1,
      "kind": "single",
      "showIf": "`re02_role = role_landlord|role_seller` / profile_field: `dispute.type`, `counterparty.position`",
      "profileFields": [
        "dispute.type"
      ],
      "question": "상대방과는 어떤 돈 문제로 다투고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "hd_deduct_dispute",
          "label": "손상이나 밀린 금액을 공제하고 돌려주려 했는데, 상대방은 전액을 돌려달라고 요구하고 있습니다.",
          "meaning": "dispute.type=deduction_contested; counterparty.position=full_refund"
        },
        {
          "value": "hd_forfeit_dispute",
          "label": "상대방이 계약을 포기해 계약금을 돌려주지 않으려 하는데, 상대방은 돌려달라고 요구하고 있습니다.",
          "meaning": "dispute.type=forfeit_contested; cancel.initiator=counterparty; counterparty.position=full_refund"
        },
        {
          "value": "hd_double_demand",
          "label": "제 사정으로 계약을 진행하지 못하게 되자, 상대방이 계약금의 두 배를 돌려달라고 요구하고 있습니다.",
          "meaning": "dispute.type=double_return_demand; cancel.initiator=self; counterparty.position=double_refund"
        },
        {
          "value": "hd_extra_claim",
          "label": "손해나 밀린 금액이 보증금보다 커서 차액을 요구했지만, 상대방이 지급하지 않고 있습니다.",
          "meaning": "dispute.type=extra_claim_by_self; counterparty.position=refuses_to_pay"
        },
        {
          "value": "hd_contact_lost",
          "label": "상대방이 밀린 금액을 남긴 채 집을 비웠거나, 연락을 끊었습니다.",
          "meaning": "dispute.type=counterparty_absconded; counterparty.contact=lost"
        }
      ]
    },
    {
      "id": "re02_contract_end",
      "phase": 1,
      "kind": "single",
      "showIf": "항상 / profile_field: `contract.end_type`, `contract.notice_compliance`",
      "profileFields": [
        "contract.end_type"
      ],
      "question": "계약은 어떻게 끝났나요?",
      "placeholder": "",
      "options": [
        {
          "value": "end_expired",
          "label": "계약서에 정한 기간(임대 기간이나 본계약 체결 기한)이 지나, 계약이 그대로 종료되었습니다.",
          "meaning": "contract.end_type=expired; contract.notice_compliance=not_applicable"
        },
        {
          "value": "end_me_with_notice",
          "label": "제가 먼저 계약을 끝냈고, 계약서에 정한 기간만큼 미리 알렸습니다.",
          "meaning": "contract.end_type=terminated_by_self; contract.notice_compliance=met"
        },
        {
          "value": "end_me_short_notice",
          "label": "제가 먼저 계약을 끝냈지만, 미리 알린 기간이 계약서보다 짧았거나 따로 알리지 못했습니다.",
          "meaning": "contract.end_type=terminated_by_self; contract.notice_compliance=short_or_none"
        },
        {
          "value": "end_other_first",
          "label": "상대방이 먼저 계약을 끝내자고 했거나, 상대방이 계약을 지키지 않아 끝나게 되었습니다.",
          "meaning": "contract.end_type=terminated_by_counterparty"
        },
        {
          "value": "end_not_ended",
          "label": "계약은 아직 끝나지 않았지만, 돈 문제로 이미 다툼이 생겼습니다.",
          "meaning": "contract.end_type=ongoing"
        }
      ]
    },
    {
      "id": "re02_confirm_goal",
      "phase": 1,
      "kind": "single",
      "showIf": "항상 / profile_field: `goal.first_check`",
      "profileFields": [
        "goal.first_check"
      ],
      "question": "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "cg_entitlement",
          "label": "이 돈을 돌려받을 수 있는지(또는 돌려주어야 하는지), 계약서와 실제 사정을 기준으로 확인하고 싶습니다.",
          "meaning": "goal.first_check=entitlement"
        },
        {
          "value": "cg_amount_check",
          "label": "공제되거나 요구받은 금액이 어떻게 계산되었는지, 그 금액이 맞는지 확인하고 싶습니다.",
          "meaning": "goal.first_check=amount_calculation"
        },
        {
          "value": "cg_forfeit_rule",
          "label": "계약금을 돌려주지 않거나 두 배로 돌려달라는 주장이 계약서 조항에 맞는지 확인하고 싶습니다.",
          "meaning": "goal.first_check=deposit_clause"
        },
        {
          "value": "cg_how_to_demand",
          "label": "상대방에게 언제, 어떤 방법으로 정식 요구를 해야 하는지 확인하고 싶습니다.",
          "meaning": "goal.first_check=demand_method_timing"
        },
        {
          "value": "cg_unsure",
          "label": "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.",
          "meaning": "goal.first_check=next_step_order"
        }
      ]
    },
    {
      "id": "re02_amount_state",
      "phase": 2,
      "kind": "single",
      "showIf": "`NOT PATH_A AND NOT PATH_B` / profile_field: `amount.state`",
      "profileFields": [
        "amount.state"
      ],
      "question": "다툼이 되는 금액은 어떻게 정리되어 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "amt_clear",
          "label": "계약서 금액과 실제로 주고받은 금액이 같고, 다툼이 되는 금액도 분명합니다.",
          "meaning": "amount.state=clear; amount.contract_matches_paid=yes"
        },
        {
          "value": "amt_differs",
          "label": "금액은 알고 있지만, 제가 아는 금액과 상대방이 말하는 금액이 서로 다릅니다.",
          "meaning": "amount.state=disputed_figure"
        },
        {
          "value": "amt_partial_settled",
          "label": "일부는 이미 돌려받았거나 돌려주었고, 남은 금액을 두고 다투고 있습니다.",
          "meaning": "amount.state=partially_settled; payment.refund_status=partial"
        },
        {
          "value": "amt_currency_mixed",
          "label": "동(VND)과 달러 등으로 나눠 주고받아, 정확한 금액을 아직 정리하지 못했습니다.",
          "meaning": "amount.state=mixed_currency; amount.currency=multiple"
        },
        {
          "value": "amt_unknown",
          "label": "정확한 금액이 기억나지 않고, 금액을 확인할 기록도 찾지 못했습니다.",
          "meaning": "amount.state=unknown; evidence.amount_record=none"
        }
      ]
    },
    {
      "id": "re02_amount_detail",
      "phase": 2,
      "kind": "text",
      "showIf": "`re02_amount_state = amt_clear|amt_differs|amt_partial_settled|amt_currency_mixed OR PATH_A OR PATH_B` / profile_field: `amount.detail`",
      "profileFields": [
        "amount.detail"
      ],
      "question": "주고받은 금액과 다툼이 되는 금액을 입력해 주세요.",
      "placeholder": "예: 보증금 2개월치 30,000,000동을 송금했고, 15,000,000동만 돌려받았습니다. 상대방은 수리비로 15,000,000동을 공제했다고 합니다. / 계약금 200,000,000동을 보냈고, 상대방은 전액을 돌려주지 않겠다고 합니다.",
      "options": []
    },
    {
      "id": "re02_key_dates",
      "phase": 2,
      "kind": "text",
      "showIf": "항상 / profile_field: `timeline.key_dates`",
      "profileFields": [
        "timeline.key_dates"
      ],
      "question": "이 일과 관련된 주요 날짜를 아는 만큼 입력해 주세요.",
      "placeholder": "예: 2026년 3월 1일 계약·보증금 송금 / 9월 30일 계약 종료·열쇠 반납 / 10월 3일 집주인이 수리비 공제 통보 (계약금 사건이면: 계약금 보낸 날, 본계약·잔금 예정일, 취소 이야기가 나온 날)",
      "options": []
    },
    {
      "id": "re02_money_evidence",
      "phase": 2,
      "kind": "single",
      "showIf": "항상 / profile_field: `payment.evidence`",
      "profileFields": [
        "payment.evidence"
      ],
      "question": "돈을 주고받은 사실은 어떤 자료로 확인할 수 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "me_contract_transfer",
          "label": "양쪽이 서명한 계약서가 있고, 은행 송금 내역도 남아 있습니다.",
          "meaning": "payment.evidence=contract_and_transfer; contract.written=yes; payment.method=bank_transfer"
        },
        {
          "value": "me_transfer_only",
          "label": "계약서는 없거나 찾지 못했지만, 은행 송금 내역은 남아 있습니다.",
          "meaning": "payment.evidence=transfer_only; contract.written=missing; payment.method=bank_transfer"
        },
        {
          "value": "me_cash_message",
          "label": "현금으로 주고받았고, 받았다는 메시지나 손으로 쓴 영수증만 남아 있습니다.",
          "meaning": "payment.evidence=cash_with_note; payment.method=cash"
        },
        {
          "value": "me_none",
          "label": "계약서·송금 내역·받았다는 메시지 등 확인할 수 있는 자료가 없습니다.",
          "meaning": "payment.evidence=none"
        }
      ]
    },
    {
      "id": "re02_contract_form",
      "phase": 2,
      "kind": "single",
      "showIf": "`re02_money_evidence = me_contract_transfer` / profile_field: `contract.form`, `contract.signer_valid`",
      "profileFields": [
        "contract.form"
      ],
      "question": "계약서는 어떤 형태로 작성되었나요?",
      "placeholder": "",
      "options": [
        {
          "value": "cf_bilingual_signed",
          "label": "한국어(또는 영어)와 베트남어가 함께 적힌 계약서에, 양쪽이 서명했습니다.",
          "meaning": "contract.form=bilingual_signed; contract.language_understood=yes"
        },
        {
          "value": "cf_vn_only",
          "label": "베트남어로만 된 계약서에 서명했고, 내용을 모두 이해하지는 못했습니다.",
          "meaning": "contract.form=vietnamese_only; contract.language_understood=partial"
        },
        {
          "value": "cf_notarized",
          "label": "공증사무소에서 공증받은 계약서이고, 공증본을 가지고 있습니다.",
          "meaning": "contract.form=notarized; evidence.notarized_copy=yes"
        },
        {
          "value": "cf_broker_form",
          "label": "중개인이 준비한 간단한 양식이나 계약금 확인서(giấy đặt cọc) 형태입니다.",
          "meaning": "contract.form=broker_short_form"
        },
        {
          "value": "cf_signer_doubt",
          "label": "계약서는 있지만, 상대방 서명이 빠져 있거나 실제 소유자가 아닌 사람이 서명했습니다.",
          "meaning": "contract.form=signed_doubtful; contract.signer_valid=doubtful"
        }
      ]
    },
    {
      "id": "re02_cash_proof",
      "phase": 2,
      "kind": "single",
      "showIf": "`re02_money_evidence = me_cash_message|me_none` / profile_field: `payment.cash_proof`",
      "profileFields": [
        "payment.cash_proof"
      ],
      "question": "돈을 건넸거나 받은 사실은 지금 무엇으로 확인할 수 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "cp_admit_message",
          "label": "상대방이 돈을 받았다고 인정한 문자나 메신저(Zalo 등) 메시지가 남아 있습니다.",
          "meaning": "payment.cash_proof=admission_message"
        },
        {
          "value": "cp_handwritten_signed",
          "label": "상대방이 손으로 써 준 영수증이나 메모가 있고, 서명도 되어 있습니다.",
          "meaning": "payment.cash_proof=signed_handwritten_receipt"
        },
        {
          "value": "cp_witness_broker",
          "label": "자료는 없지만, 중개인이나 함께 있던 사람이 확인해 줄 수 있습니다.",
          "meaning": "payment.cash_proof=witness_only; party.witness=broker_or_other"
        },
        {
          "value": "cp_withdrawal_only",
          "label": "현금을 인출한 은행 기록은 있지만, 상대방에게 건넨 기록은 없습니다.",
          "meaning": "payment.cash_proof=withdrawal_record_only"
        },
        {
          "value": "cp_nothing",
          "label": "찾아봤지만, 돈을 주고받은 사실을 확인할 방법이 없습니다.",
          "meaning": "payment.cash_proof=none"
        }
      ]
    },
    {
      "id": "re02_payment_path",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_B OR PATH_D1 OR PATH_E OR ((PATH_A OR PATH_C) AND re02_role = role_company_occupant)` / profile_field: `payment.payer`, `payment.receiver`, `payment.via`",
      "profileFields": [
        "payment.payer"
      ],
      "question": "이 돈은 누가 주고, 누가 받았나요?",
      "placeholder": "",
      "options": [
        {
          "value": "pp_direct",
          "label": "제가 직접 상대방 본인에게 주었거나, 상대방 본인에게서 받았습니다.",
          "meaning": "payment.payer=self; payment.receiver=counterparty; payment.via=direct"
        },
        {
          "value": "pp_agent_my_side",
          "label": "제 쪽에서는 회사·가족·지인이 대신 주고받았고, 저는 직접 관여하지 않았습니다.",
          "meaning": "payment.payer=self_side_agent; payment.via=self_agent"
        },
        {
          "value": "pp_agent_other_side",
          "label": "상대방 쪽에서는 가족이나 관리인 등 다른 사람이 대신 받거나 보냈습니다.",
          "meaning": "payment.receiver=counterparty_agent; payment.via=counterparty_agent"
        },
        {
          "value": "pp_via_broker",
          "label": "중개인을 거쳐 주고받았고, 상대방에게 실제로 전달되었는지는 중개인 말로만 알고 있습니다.",
          "meaning": "payment.via=broker; payment.delivery_confirmed=broker_word_only"
        },
        {
          "value": "pp_unclear",
          "label": "누구 명의 계좌로 오갔는지, 실제로 누가 받았는지 확실하지 않습니다.",
          "meaning": "payment.receiver=unknown"
        }
      ]
    },
    {
      "id": "re02_broker_hold",
      "phase": 2,
      "kind": "single",
      "showIf": "`re02_payment_path = pp_via_broker` / profile_field: `payment.broker_status`",
      "profileFields": [
        "payment.broker_status"
      ],
      "question": "중개인을 거친 돈은 지금 어떤 상태인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "bh_delivered_proof",
          "label": "중개인이 상대방에게 전달했고, 전달한 영수증이나 송금 내역도 보여 주었습니다.",
          "meaning": "payment.broker_status=delivered_documented; payment.receiver=counterparty"
        },
        {
          "value": "bh_delivered_word",
          "label": "중개인은 전달했다고 하지만, 전달한 기록은 확인하지 못했습니다.",
          "meaning": "payment.broker_status=delivered_unverified"
        },
        {
          "value": "bh_still_holding",
          "label": "중개인이 아직 돈을 보관하고 있다고 하지만, 돌려주지 않고 있습니다.",
          "meaning": "payment.broker_status=held_by_broker; payment.receiver=broker"
        },
        {
          "value": "bh_broker_unreachable",
          "label": "중개인과도 연락이 잘 되지 않아, 돈이 지금 어디에 있는지 모릅니다.",
          "meaning": "payment.broker_status=broker_unreachable; payment.receiver=unknown"
        }
      ]
    },
    {
      "id": "re02_demand_method",
      "phase": 2,
      "kind": "single",
      "showIf": "항상 / profile_field: `action.demand_method`",
      "profileFields": [
        "action.demand_method"
      ],
      "question": "지금까지 상대방에게 어떤 방법으로 요구하거나 대응하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "dm_not_yet",
          "label": "아직 상대방에게 정식으로 요구하거나 대응하지 않았습니다.",
          "meaning": "action.demand_method=none"
        },
        {
          "value": "dm_verbal_only",
          "label": "전화하거나 만나서 말로만 요구했고, 따로 남긴 기록은 없습니다.",
          "meaning": "action.demand_method=verbal; action.demand_recorded=no"
        },
        {
          "value": "dm_written_message",
          "label": "문자·Zalo·이메일 등 글로 요구했고, 보낸 기록이 남아 있습니다.",
          "meaning": "action.demand_method=written_message; action.demand_recorded=yes"
        },
        {
          "value": "dm_broker_relay",
          "label": "중개인이나 관리사무소를 통해 제 요구를 전달했습니다.",
          "meaning": "action.demand_method=via_intermediary; action.demand_recorded=indirect"
        },
        {
          "value": "dm_formal_letter",
          "label": "금액과 기한을 적은 정식 요구 문서를 서명해서 보냈습니다.",
          "meaning": "action.demand_method=formal_signed_letter; action.demand_recorded=yes"
        }
      ]
    },
    {
      "id": "re02_other_reaction",
      "phase": 2,
      "kind": "single",
      "showIf": "`re02_demand_method ≠ dm_not_yet` / profile_field: `counterparty.response`",
      "profileFields": [
        "counterparty.response"
      ],
      "question": "요구하거나 대응한 뒤, 상대방은 어떻게 반응했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "rx_promised_date",
          "label": "돌려주거나 정리하겠다고 했고, 구체적인 날짜도 말했습니다.",
          "meaning": "counterparty.response=accepted; counterparty.promise_date=given"
        },
        {
          "value": "rx_new_condition",
          "label": "정리하겠다고는 했지만, 다음 세입자·매수인을 구한 뒤나 합의서에 서명하면 주겠다는 등 새 조건을 붙였거나 날짜를 정하지 않았습니다.",
          "meaning": "counterparty.response=new_condition; counterparty.promise_date=none"
        },
        {
          "value": "rx_partial_offer",
          "label": "일부 금액만 주겠다고 했거나, 실제로 일부만 보냈습니다.",
          "meaning": "counterparty.response=partial_acceptance"
        },
        {
          "value": "rx_refused_blame",
          "label": "돌려줄 수 없다고 거절했고, 그 책임을 저나 중개인·관리사무소 등 다른 사람에게 돌렸습니다.",
          "meaning": "counterparty.response=refused; counterparty.blame=shifted"
        },
        {
          "value": "rx_counter_claim",
          "label": "오히려 손해나 위약금을 이유로, 저에게 돈을 더 요구했습니다.",
          "meaning": "counterparty.response=counter_demand"
        },
        {
          "value": "rx_ignored",
          "label": "메시지를 읽고도 답이 없거나, 연락을 피하고 있습니다.",
          "meaning": "counterparty.response=no_response; counterparty.contact=avoiding"
        }
      ]
    },
    {
      "id": "re02_situation_match",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_D1 OR PATH_E` / profile_field: `risk.fact_gap`",
      "profileFields": [
        "risk.fact_gap"
      ],
      "question": "상대방의 주장은 실제 있었던 일과 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "sm_match",
          "label": "상대방이 말하는 사실은 대체로 맞고, 금액이나 처리 방법만 서로 다릅니다.",
          "meaning": "risk.fact_gap=amount_only"
        },
        {
          "value": "sm_partial",
          "label": "일부 사실은 맞지만, 손상 정도나 금액 등 중요한 부분이 실제와 다릅니다.",
          "meaning": "risk.fact_gap=partial"
        },
        {
          "value": "sm_mismatch",
          "label": "상대방이 말하는 일은 실제로 없었거나, 책임은 오히려 상대방에게 있다고 생각합니다.",
          "meaning": "risk.fact_gap=contradicted; dispute.liability_view=counterparty"
        },
        {
          "value": "sm_hard_to_judge",
          "label": "기록이 남아 있지 않아, 누구 말이 맞는지 비교하기 어렵습니다.",
          "meaning": "risk.fact_gap=unverifiable"
        },
        {
          "value": "sm_unknown",
          "label": "상대방이 무엇을 주장하는지 정확히 알지 못해, 비교할 수 없습니다.",
          "meaning": "risk.fact_gap=claim_unknown"
        }
      ]
    },
    {
      "id": "re02_deadline",
      "phase": 2,
      "kind": "single",
      "showIf": "항상 / profile_field: `timeline.deadline_type`",
      "profileFields": [
        "timeline.deadline_type"
      ],
      "question": "이 돈 문제와 관련해 정해진 기한이 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "dl_contract_term",
          "label": "계약서에 반환 기한(예: 집을 비운 뒤 며칠 이내)이 적혀 있고, 날짜를 계산할 수 있습니다.",
          "meaning": "timeline.deadline_type=contract_refund_term"
        },
        {
          "value": "dl_promised_date",
          "label": "상대방이 특정 날짜까지 돌려주거나 정리하겠다고 약속했습니다.",
          "meaning": "timeline.deadline_type=counterparty_promise"
        },
        {
          "value": "dl_my_schedule",
          "label": "출국·이사·다음 계약 등 제 일정 때문에, 그 전에 정리되어야 합니다.",
          "meaning": "timeline.deadline_type=self_schedule"
        },
        {
          "value": "dl_other_demand",
          "label": "상대방이 정한 날짜까지 돈을 보내거나 합의하라고 요구했습니다.",
          "meaning": "timeline.deadline_type=counterparty_ultimatum"
        },
        {
          "value": "dl_none",
          "label": "기한에 대해서는 정해진 것이 없거나, 있는지 확인하지 못했습니다.",
          "meaning": "timeline.deadline_type=none_or_unknown"
        }
      ]
    },
    {
      "id": "re02_deadline_date",
      "phase": 2,
      "kind": "text",
      "showIf": "`re02_deadline = dl_contract_term|dl_promised_date|dl_my_schedule|dl_other_demand` / profile_field: `timeline.deadline_date`",
      "profileFields": [
        "timeline.deadline_date"
      ],
      "question": "그 기한은 언제인가요?",
      "placeholder": "예: 2026년 11월 15일(집을 비운 날부터 30일 이내) / 11월 말 출국 예정",
      "options": []
    },
    {
      "id": "re02_blockage",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_D1 OR PATH_D2 OR PATH_E` / profile_field: `risk.blockage`",
      "profileFields": [
        "risk.blockage"
      ],
      "question": "현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "bk_entitlement",
          "label": "정말 돌려받을(또는 돌려줘야 할) 돈인지 확신이 없어, 분명하게 요구하지 못하고 있습니다.",
          "meaning": "risk.blockage=entitlement_unclear"
        },
        {
          "value": "bk_amount_basis",
          "label": "공제나 위약금이 어떻게 계산되었는지 몰라, 반박할 근거를 정리하지 못하고 있습니다.",
          "meaning": "risk.blockage=calculation_unknown"
        },
        {
          "value": "bk_evidence",
          "label": "계약서·송금 내역·집 상태 기록 등 자료가 부족해, 대응을 시작하지 못하고 있습니다.",
          "meaning": "risk.blockage=evidence_gap"
        },
        {
          "value": "bk_contact",
          "label": "상대방이 연락을 피하거나 베트남 밖에 있어, 대화 자체가 진행되지 않고 있습니다.",
          "meaning": "risk.blockage=no_contact"
        },
        {
          "value": "bk_language_process",
          "label": "베트남어와 현지 절차를 잘 몰라, 다음에 무엇을 해야 할지 멈춰 있습니다.",
          "meaning": "risk.blockage=language_process"
        }
      ]
    },
    {
      "id": "re02_final_goal",
      "phase": 2,
      "kind": "single",
      "showIf": "항상 / profile_field: `goal.final`",
      "profileFields": [
        "goal.final"
      ],
      "question": "이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?",
      "placeholder": "",
      "options": [
        {
          "value": "fg_full_settlement",
          "label": "계약서 기준으로 받을(또는 돌려줄) 금액을 확인하고, 그 금액대로 정리하고 싶습니다.",
          "meaning": "goal.final=settle_per_contract"
        },
        {
          "value": "fg_fair_compromise",
          "label": "공제나 위약금 중 타당한 부분은 인정하고, 나머지는 합의로 정리하고 싶습니다.",
          "meaning": "goal.final=negotiated_compromise"
        },
        {
          "value": "fg_formal_demand",
          "label": "근거를 정리한 정식 요구 문서를 보내고, 기한 안에 답을 받고 싶습니다.",
          "meaning": "goal.final=formal_written_demand"
        },
        {
          "value": "fg_reject_claim",
          "label": "상대방의 요구가 타당하지 않다면, 근거를 갖추어 분명하게 거절하고 싶습니다.",
          "meaning": "goal.final=reject_with_grounds"
        },
        {
          "value": "fg_expert",
          "label": "제 상황을 전문가에게 정확히 전달해, 협상이나 대응을 맡기고 싶습니다.",
          "meaning": "goal.final=delegate_to_expert"
        }
      ]
    },
    {
      "id": "re02_other_reason",
      "phase": 2,
      "kind": "single",
      "showIf": "`GATE_RENTAL_UNRETURNED` / profile_field: `counterparty.refusal_reason`",
      "profileFields": [
        "counterparty.refusal_reason"
      ],
      "question": "상대방은 돈을 돌려주지 않는 이유를 어떻게 설명했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "or_contract_clause",
          "label": "계약서의 특정 조항을 근거로 들었고, 어느 조항인지도 말해 주었습니다.",
          "meaning": "counterparty.refusal_reason=contract_clause; counterparty.clause_cited=yes"
        },
        {
          "value": "or_damage_claim",
          "label": "집이나 물건이 손상되었다며, 수리비나 손해를 이유로 들었습니다.",
          "meaning": "counterparty.refusal_reason=damage; path=A"
        },
        {
          "value": "or_my_breach",
          "label": "제가 먼저 계약을 어겼거나 일찍 끝냈다는 것을 이유로 들었습니다.",
          "meaning": "counterparty.refusal_reason=self_breach_alleged"
        },
        {
          "value": "or_no_money_now",
          "label": "돌려줄 돈인 것은 인정하지만, 지금 돈이 없거나 다음 세입자·매수인을 구한 뒤 주겠다고 합니다.",
          "meaning": "counterparty.refusal_reason=liquidity; counterparty.liability_admitted=yes"
        },
        {
          "value": "or_no_reason",
          "label": "구체적인 이유를 말하지 않았거나, 들은 설명을 이해하지 못했습니다.",
          "meaning": "counterparty.refusal_reason=none_or_unclear"
        }
      ]
    },
    {
      "id": "re02_handover_record",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_A OR (PATH_C AND re02_deduction_items = ded_repair_restore|ded_cleaning_paint) OR (PATH_E AND re02_extra_claim_detail = xc_damage_over_deposit) OR PATH_D2` / profile_field: `handover.inspection`, `handover.record`, `handover.done`",
      "profileFields": [
        "handover.inspection"
      ],
      "question": "집을 넘겨줄 때(넘겨받을 때), 집 상태는 어떻게 확인했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "ho_joint_signed",
          "label": "양쪽이 함께 집 상태를 점검했고, 서명한 인수인계서나 점검표가 남아 있습니다.",
          "meaning": "handover.done=yes; handover.inspection=joint; handover.record=signed_checklist"
        },
        {
          "value": "ho_joint_no_paper",
          "label": "양쪽이 함께 둘러보았고 그 자리에서는 별다른 문제 지적이 없었지만, 서명한 문서는 남기지 않았습니다.",
          "meaning": "handover.done=yes; handover.inspection=joint; handover.record=none; handover.issue_raised_on_site=no"
        },
        {
          "value": "ho_other_alone",
          "label": "한쪽이 집을 비운 뒤 다른 한쪽이 혼자 집을 확인했고, 함께 본 사람은 없었습니다.",
          "meaning": "handover.done=yes; handover.inspection=one_side_only; handover.record=unilateral"
        },
        {
          "value": "ho_keys_only",
          "label": "열쇠만 중개인이나 관리사무소에 맡기고 나왔고, 집 상태를 함께 확인하지는 않았습니다.",
          "meaning": "handover.done=yes; handover.inspection=none; handover.keys_via=broker_or_management"
        },
        {
          "value": "ho_not_handed",
          "label": "아직 열쇠나 집을 넘겨주지 않았거나, 넘겨준 날짜를 두고 다툼이 있습니다.",
          "meaning": "handover.done=no_or_disputed; timeline.handover_date=disputed"
        }
      ]
    },
    {
      "id": "re02_exit_photos",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_A` / profile_field: `evidence.exit_photos`",
      "profileFields": [
        "evidence.exit_photos"
      ],
      "question": "집을 비울 때 집 상태를 찍은 사진이나 영상이 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "ph_dated_full",
          "label": "방마다 집 전체를 찍어 두었고, 찍은 날짜가 파일이나 메시지로 확인됩니다.",
          "meaning": "evidence.exit_photos=full; evidence.exit_photos_dated=yes"
        },
        {
          "value": "ph_sent_to_other",
          "label": "사진이나 영상을 찍어, 집을 비운 날 상대방이나 중개인에게 메시지로 보내 두었습니다.",
          "meaning": "evidence.exit_photos=full; evidence.exit_photos_dated=yes; evidence.exit_photos_shared=yes"
        },
        {
          "value": "ph_partial",
          "label": "일부 방이나 물건만 찍어 두었고, 상대방이 문제 삼는 부분은 찍혀 있지 않을 수 있습니다.",
          "meaning": "evidence.exit_photos=partial"
        },
        {
          "value": "ph_other_side_only",
          "label": "제가 찍은 것은 없고, 상대방이 나중에 보낸 손상 사진만 가지고 있습니다.",
          "meaning": "evidence.exit_photos=none; evidence.counterparty_photos=yes"
        },
        {
          "value": "ph_none",
          "label": "집을 비울 때 찍은 사진이나 영상은 남아 있지 않습니다.",
          "meaning": "evidence.exit_photos=none"
        }
      ]
    },
    {
      "id": "re02_claimed_damage",
      "phase": 2,
      "kind": "multi",
      "showIf": "`PATH_A OR (PATH_E AND re02_extra_claim_detail = xc_damage_over_deposit)` / profile_field: `damage.claimed_items`",
      "profileFields": [
        "damage.claimed_items"
      ],
      "question": "상대방이 문제 삼는 손상은 무엇인가요? (여러 개 선택 가능)",
      "placeholder": "",
      "options": [
        {
          "value": "dg_wall_floor",
          "label": "벽의 얼룩·못 자국·페인트 벗겨짐이나 바닥 긁힘",
          "meaning": "damage.claimed_items+=wall_floor"
        },
        {
          "value": "dg_furniture_appliance",
          "label": "집에 딸린 가구나 에어컨·냉장고·세탁기 등 가전의 고장이나 파손",
          "meaning": "damage.claimed_items+=furniture_appliance"
        },
        {
          "value": "dg_water_mold",
          "label": "누수·곰팡이·배관 막힘 등 물과 관련된 문제",
          "meaning": "damage.claimed_items+=water_mold"
        },
        {
          "value": "dg_missing_items",
          "label": "계약 때 있던 비품·열쇠·출입카드·리모컨 등이 없어졌다는 주장",
          "meaning": "damage.claimed_items+=missing_items"
        },
        {
          "value": "dg_not_specified",
          "label": "손상이 있다고만 하고, 어떤 부분인지는 구체적으로 알려 주지 않았습니다",
          "meaning": "damage.claimed_items+=not_specified; claim.itemized=no"
        }
      ]
    },
    {
      "id": "re02_damage_cause",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_A` / profile_field: `damage.cause`, `damage.fault_admitted`",
      "profileFields": [
        "damage.cause"
      ],
      "question": "상대방이 문제 삼는 손상은 실제로 어떻게 생긴 것이라고 보시나요?",
      "placeholder": "",
      "options": [
        {
          "value": "dc_normal_wear",
          "label": "오래 살면서 자연스럽게 생긴 사용 흔적이고, 제가 부주의해서 생긴 손상은 아니라고 생각합니다.",
          "meaning": "damage.cause=normal_wear; damage.fault_admitted=no"
        },
        {
          "value": "dc_my_fault_partial",
          "label": "일부는 제 부주의로 생긴 것이 맞지만, 상대방이 말하는 범위나 정도는 실제보다 큽니다.",
          "meaning": "damage.cause=partly_self; damage.fault_admitted=partial"
        },
        {
          "value": "dc_preexisting",
          "label": "입주할 때부터 있던 손상이고, 제가 사는 동안 생긴 것이 아닙니다.",
          "meaning": "damage.cause=preexisting; damage.fault_admitted=no"
        },
        {
          "value": "dc_building_issue",
          "label": "건물 배관·방수·전기 설비 문제로 생긴 것이고, 사는 동안 상대방에게 알린 적이 있습니다.",
          "meaning": "damage.cause=building_defect; damage.reported_during_tenancy=yes"
        },
        {
          "value": "dc_cannot_tell",
          "label": "어떤 손상인지 직접 보지 못해서, 언제 어떻게 생긴 것인지 판단할 수 없습니다.",
          "meaning": "damage.cause=unknown"
        }
      ]
    },
    {
      "id": "re02_movein_condition",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_A` / profile_field: `evidence.movein_record`",
      "profileFields": [
        "evidence.movein_record"
      ],
      "question": "입주할 때의 집 상태는 어떻게 기록되어 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "mi_signed_checklist",
          "label": "입주할 때 양쪽이 함께 점검표나 인수인계서를 작성해 서명했고, 사진도 첨부되어 있습니다.",
          "meaning": "evidence.movein_record=signed_checklist_with_photos"
        },
        {
          "value": "mi_photos_only",
          "label": "서명한 문서는 없지만, 입주한 날 제가 찍은 사진이나 영상이 남아 있습니다.",
          "meaning": "evidence.movein_record=own_photos"
        },
        {
          "value": "mi_inventory_list",
          "label": "계약서에 가구·가전 목록만 붙어 있고, 각 물건의 상태는 적혀 있지 않습니다.",
          "meaning": "evidence.movein_record=inventory_without_condition"
        },
        {
          "value": "mi_reported_later",
          "label": "입주 직후 발견한 문제를 메시지로 상대방에게 알렸고, 그 기록이 남아 있습니다.",
          "meaning": "evidence.movein_record=defect_report_message; action.reported_defect=yes"
        },
        {
          "value": "mi_none",
          "label": "입주할 때 집 상태를 기록한 자료는 따로 없습니다.",
          "meaning": "evidence.movein_record=none"
        }
      ]
    },
    {
      "id": "re02_repair_cost_basis",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_A OR (PATH_C AND re02_deduction_items = ded_repair_restore|ded_cleaning_paint) OR (PATH_E AND re02_extra_claim_detail = xc_damage_over_deposit)` / profile_field: `claim.repair_basis`, `claim.itemized`",
      "profileFields": [
        "claim.repair_basis"
      ],
      "question": "수리비(원래 상태로 되돌리는 비용)는 어떤 근거로 계산되었나요?",
      "placeholder": "",
      "options": [
        {
          "value": "rc_quote_receipt",
          "label": "수리업체의 견적서나 실제 수리 영수증이 있고, 항목별 금액을 확인할 수 있습니다.",
          "meaning": "claim.repair_basis=quote_or_receipt; claim.itemized=yes"
        },
        {
          "value": "rc_lump_sum",
          "label": "견적서나 영수증 없이, 전체 수리비 금액만 메시지나 말로 전달되었습니다.",
          "meaning": "claim.repair_basis=lump_sum; claim.itemized=no"
        },
        {
          "value": "rc_replace_new",
          "label": "고치는 비용이 아니라, 오래된 물건을 새것으로 바꾸는 비용 전체가 계산되었습니다.",
          "meaning": "claim.repair_basis=replacement_new"
        },
        {
          "value": "rc_repaired_unilateral",
          "label": "한쪽이 다른 쪽에 미리 알리거나 확인받지 않고 이미 수리를 마친 뒤, 그 비용을 청구했습니다.",
          "meaning": "claim.repair_basis=repaired_without_notice; evidence.pre_repair_state=lost"
        },
        {
          "value": "rc_not_fixed_yet",
          "label": "아직 수리 금액이 정해지지 않았고, \"수리해 보고 정산하겠다\"는 말만 있었습니다.",
          "meaning": "claim.repair_basis=pending_estimate; amount.state=open"
        }
      ]
    },
    {
      "id": "re02_cancel_reason",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_B` / profile_field: `cancel.reason`, `cancel.initiator`",
      "profileFields": [
        "cancel.reason"
      ],
      "question": "계약이 진행되지 못하게 된 직접적인 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "cr_self_plan_change",
          "label": "제 쪽 일정이나 계획이 바뀌어(발령·출국·마음이 바뀜 등), 제가 계약을 진행하지 않기로 했습니다.",
          "meaning": "cancel.initiator=self; cancel.reason=plan_change"
        },
        {
          "value": "cr_funding_fail",
          "label": "대출이 승인되지 않았거나 해외 송금이 늦어져, 정해진 날까지 잔금(다음 지급금)을 마련하지 못했습니다.",
          "meaning": "cancel.initiator=payer; cancel.reason=funding_failure"
        },
        {
          "value": "cr_document_issue",
          "label": "핑크북(토지사용권 증서)·실제 소유자·외국인 명의 가능 여부 등 서류나 권리에 문제가 드러났습니다.",
          "meaning": "cancel.reason=title_or_document_issue; risk.title_issue=yes"
        },
        {
          "value": "cr_other_terms_change",
          "label": "상대방이 가격을 올리거나 조건을 바꾸자고 했거나, 다른 사람과 계약하려 했습니다.",
          "meaning": "cancel.initiator=counterparty; cancel.reason=terms_change"
        },
        {
          "value": "cr_other_missed_date",
          "label": "상대방이 본계약 체결이나 집 인도 날짜를 지키지 않아, 계약이 더 이상 진행되지 않았습니다.",
          "meaning": "cancel.initiator=counterparty; cancel.reason=missed_date"
        }
      ]
    },
    {
      "id": "re02_cancel_form",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_B` / profile_field: `cancel.confirmation`",
      "profileFields": [
        "cancel.confirmation"
      ],
      "question": "계약을 취소한다는 사실은 어떻게 확인되었나요?",
      "placeholder": "",
      "options": [
        {
          "value": "cn_mutual_written",
          "label": "양쪽이 계약을 취소하기로 메시지나 합의서 등 글로 확인했습니다.",
          "meaning": "cancel.confirmation=mutual_written"
        },
        {
          "value": "cn_one_side_written",
          "label": "한쪽이 취소하겠다고 글로 알렸고, 다른 쪽은 아직 동의하지 않았습니다.",
          "meaning": "cancel.confirmation=unilateral_written"
        },
        {
          "value": "cn_verbal_only",
          "label": "만나거나 전화로 취소 이야기를 했고, 글로 남긴 기록은 없습니다.",
          "meaning": "cancel.confirmation=verbal_only"
        },
        {
          "value": "cn_via_broker",
          "label": "취소 이야기는 중개인을 통해서만 오갔고, 상대방에게 직접 들은 적은 없습니다.",
          "meaning": "cancel.confirmation=via_broker; payment.via_hint=broker"
        },
        {
          "value": "cn_just_stopped",
          "label": "누구도 취소한다고 분명히 말하지 않았고, 진행만 멈춰 있는 상태입니다.",
          "meaning": "cancel.confirmation=not_declared; contract.status=stalled"
        }
      ]
    },
    {
      "id": "re02_forfeit_clause",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_B` / profile_field: `contract.deposit_clause`",
      "profileFields": [
        "contract.deposit_clause"
      ],
      "question": "계약서에는 계약금(đặt cọc)을 어떻게 처리한다고 적혀 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "fc_both_sides",
          "label": "계약금을 낸 쪽이 계약을 깨면 계약금을 잃고, 받은 쪽이 깨면 두 배로 돌려준다고 양쪽 모두 적혀 있습니다.",
          "meaning": "contract.deposit_clause=bilateral_forfeit_double"
        },
        {
          "value": "fc_one_side",
          "label": "한쪽이 계약을 깰 때의 처리만 적혀 있고, 반대의 경우는 적혀 있지 않습니다.",
          "meaning": "contract.deposit_clause=one_sided"
        },
        {
          "value": "fc_condition_clause",
          "label": "대출이 나오지 않거나 토지사용권 증서(핑크북) 등 서류에 문제가 있으면 계약금을 돌려준다는 조건이 적혀 있습니다.",
          "meaning": "contract.deposit_clause=refund_condition"
        },
        {
          "value": "fc_no_clause",
          "label": "계약서는 있지만, 계약금을 어떻게 처리하는지에 대한 조항은 따로 없습니다.",
          "meaning": "contract.deposit_clause=absent"
        },
        {
          "value": "fc_cannot_read",
          "label": "계약서가 베트남어로만 되어 있어, 그런 조항이 있는지 확인하지 못했습니다.",
          "meaning": "contract.deposit_clause=unknown; contract.language_understood=no"
        }
      ]
    },
    {
      "id": "re02_condition_met",
      "phase": 2,
      "kind": "single",
      "showIf": "`re02_forfeit_clause = fc_condition_clause` / profile_field: `cancel.condition_proof`",
      "profileFields": [
        "cancel.condition_proof"
      ],
      "question": "계약서에 적힌 반환 조건이 실제로 생겼다는 것을 보여 줄 자료가 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "cm_written_proof",
          "label": "은행의 대출 거절 문서나 서류 문제를 확인한 자료 등, 조건이 생긴 사실을 글로 보여 줄 수 있습니다.",
          "meaning": "cancel.condition_proof=documented"
        },
        {
          "value": "cm_message_only",
          "label": "조건이 생겼다는 것은 상대방과 메시지로 이야기했지만, 은행이나 기관에서 받은 문서는 없습니다.",
          "meaning": "cancel.condition_proof=message_only"
        },
        {
          "value": "cm_disputed",
          "label": "조건이 생긴 것은 맞지만, 상대방은 기한을 넘겼거나 조건에 해당하지 않는다고 주장합니다.",
          "meaning": "cancel.condition_proof=disputed_by_counterparty"
        },
        {
          "value": "cm_no_proof",
          "label": "조건이 생겼다고 생각하지만, 이를 보여 줄 자료는 아직 없습니다.",
          "meaning": "cancel.condition_proof=none"
        }
      ]
    },
    {
      "id": "re02_refusal_reason",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_B_PAYER` / profile_field: `counterparty.refusal_reason`",
      "profileFields": [
        "counterparty.refusal_reason"
      ],
      "question": "상대방은 계약금을 돌려주지 않는 이유를 어떻게 설명하나요?",
      "placeholder": "",
      "options": [
        {
          "value": "rr_cites_clause",
          "label": "계약서의 계약금 조항을 들어, 제 쪽이 계약을 깼으니 돌려줄 필요가 없다고 합니다.",
          "meaning": "counterparty.refusal_reason=clause_forfeit; counterparty.clause_cited=yes"
        },
        {
          "value": "rr_blames_me",
          "label": "계약이 깨진 책임이 제 쪽에 있다며, 제가 말한 취소 이유를 인정하지 않습니다.",
          "meaning": "counterparty.refusal_reason=disputes_cancel_cause"
        },
        {
          "value": "rr_loss_claim",
          "label": "그동안 다른 사람과 계약할 기회를 놓쳤다며, 손해를 이유로 들고 있습니다.",
          "meaning": "counterparty.refusal_reason=opportunity_loss"
        },
        {
          "value": "rr_return_later",
          "label": "돌려줄 돈인 것은 인정하지만, 지금은 돈이 없거나 다음 계약자를 찾은 뒤 주겠다고 합니다.",
          "meaning": "counterparty.refusal_reason=liquidity; counterparty.liability_admitted=yes"
        },
        {
          "value": "rr_no_explanation",
          "label": "이유를 설명하지 않거나, 반환 이야기를 꺼내면 답을 하지 않습니다.",
          "meaning": "counterparty.refusal_reason=none_given; counterparty.contact=avoiding"
        }
      ]
    },
    {
      "id": "re02_return_demand_basis",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_B_HOLDER` / profile_field: `counterparty.demand_basis`",
      "profileFields": [
        "counterparty.demand_basis"
      ],
      "question": "상대방은 무엇을 근거로 계약금 반환(또는 두 배 반환)을 요구하나요?",
      "placeholder": "",
      "options": [
        {
          "value": "rd_my_side_broke",
          "label": "계약금을 받은 제 쪽이 먼저 계약을 깼다며, 계약서 조항대로 돌려달라고 합니다.",
          "meaning": "counterparty.demand_basis=holder_breach_alleged"
        },
        {
          "value": "rd_condition_met",
          "label": "대출이나 서류 문제 등, 계약서에 적힌 반환 조건에 해당한다고 주장합니다.",
          "meaning": "counterparty.demand_basis=refund_condition"
        },
        {
          "value": "rd_no_main_contract",
          "label": "본계약을 아직 맺지 않았으니, 계약금은 당연히 돌려받아야 한다고 주장합니다.",
          "meaning": "counterparty.demand_basis=no_main_contract"
        },
        {
          "value": "rd_undisclosed_issue",
          "label": "집이나 서류의 문제를 제가 미리 알리지 않았다고 주장합니다.",
          "meaning": "counterparty.demand_basis=nondisclosure_alleged; risk.title_issue=possible"
        },
        {
          "value": "rd_no_basis",
          "label": "구체적인 근거 없이 돌려달라는 요구만 하고 있습니다.",
          "meaning": "counterparty.demand_basis=none_given"
        }
      ]
    },
    {
      "id": "re02_deduction_items",
      "phase": 2,
      "kind": "multi",
      "showIf": "`PATH_C OR PATH_D2` / profile_field: `deduction.items`",
      "profileFields": [
        "deduction.items"
      ],
      "question": "공제되었거나 공제하려는 항목을 모두 선택해 주세요. (여러 개 선택 가능)",
      "placeholder": "",
      "options": [
        {
          "value": "ded_repair_restore",
          "label": "벽·바닥·가구·가전 수리비나 원래 상태로 되돌리는 비용",
          "meaning": "deduction.items+=repair_restore"
        },
        {
          "value": "ded_cleaning_paint",
          "label": "청소비나 페인트 비용",
          "meaning": "deduction.items+=cleaning_paint"
        },
        {
          "value": "ded_mgmt_utility",
          "label": "밀린 관리비·전기·수도·인터넷 요금",
          "meaning": "deduction.items+=management_utility"
        },
        {
          "value": "ded_unpaid_rent",
          "label": "밀린 임대료",
          "meaning": "deduction.items+=unpaid_rent"
        },
        {
          "value": "ded_early_exit",
          "label": "계약 기간 전에 집을 비운 데 따른 위약금",
          "meaning": "deduction.items+=early_exit_penalty"
        },
        {
          "value": "ded_no_itemization",
          "label": "항목 설명 없이 금액만 공제된(공제한) 부분",
          "meaning": "deduction.items+=unitemized; claim.itemized=no"
        }
      ]
    },
    {
      "id": "re02_mgmt_fee_basis",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_C AND re02_deduction_items = ded_mgmt_utility` / profile_field: `claim.mgmt_utility_basis`",
      "profileFields": [
        "claim.mgmt_utility_basis"
      ],
      "question": "관리비·전기·수도·인터넷 요금 공제는 어떤 근거로 계산되었나요?",
      "placeholder": "",
      "options": [
        {
          "value": "mf_bill_matched",
          "label": "관리사무소나 전기·수도 회사의 고지서를 보여 주었고, 실제로 살았던 기간과도 맞습니다.",
          "meaning": "claim.mgmt_utility_basis=bill_matches_period"
        },
        {
          "value": "mf_period_overlap",
          "label": "고지서는 있지만, 이미 낸 달이나 집을 넘긴 뒤의 기간까지 포함되어 있습니다.",
          "meaning": "claim.mgmt_utility_basis=period_overlap"
        },
        {
          "value": "mf_advance_estimate",
          "label": "마지막 달 요금이 아직 나오지 않아 대략 금액을 미리 공제했고, 나중에 정산하겠다고 했습니다.",
          "meaning": "claim.mgmt_utility_basis=estimate_pending_settlement"
        },
        {
          "value": "mf_no_bill",
          "label": "고지서나 계산 내역 없이, 공제한 금액만 알려 주었습니다.",
          "meaning": "claim.mgmt_utility_basis=no_bill; claim.itemized=no"
        }
      ]
    },
    {
      "id": "re02_unpaid_rent_period",
      "phase": 2,
      "kind": "single",
      "showIf": "`(PATH_C AND re02_deduction_items = ded_unpaid_rent) OR (PATH_E AND re02_extra_claim_detail = xc_unpaid_period)` / profile_field: `claim.rent_period`",
      "profileFields": [
        "claim.rent_period"
      ],
      "question": "밀린 임대료로 공제(청구)된 기간은 실제와 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "ur_matches_handover",
          "label": "집을 넘겨준 날까지 내지 못한 임대료이고, 그 기간과 금액은 서로 인정하고 있습니다.",
          "meaning": "claim.rent_period=matches_handover; claim.rent_admitted=yes"
        },
        {
          "value": "ur_after_handover",
          "label": "열쇠를 넘겨준 날 이후의 기간까지 임대료로 계산되어 있습니다.",
          "meaning": "claim.rent_period=beyond_handover"
        },
        {
          "value": "ur_notice_shortfall",
          "label": "계약 해지를 미리 알린 기간이 부족했다며, 모자란 기간만큼의 임대료가 계산되어 있습니다.",
          "meaning": "claim.rent_period=notice_shortfall; contract.notice_compliance=disputed"
        },
        {
          "value": "ur_already_paid",
          "label": "이미 낸 달의 임대료가 밀린 것으로 계산되어 있고, 송금 내역으로 확인할 수 있습니다.",
          "meaning": "claim.rent_period=already_paid; evidence.rent_transfer=yes"
        }
      ]
    },
    {
      "id": "re02_penalty_clause",
      "phase": 2,
      "kind": "single",
      "showIf": "`(PATH_C AND re02_deduction_items = ded_early_exit) OR (PATH_E AND re02_extra_claim_detail = xc_fixed_penalty|xc_remaining_rent)` / profile_field: `penalty.clause`, `penalty.calc`",
      "profileFields": [
        "penalty.clause"
      ],
      "question": "위약금으로 공제(청구)된 금액은 계약서와 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "pc_clause_matches",
          "label": "계약서에 중도 해지 위약금 조항이 있고, 계산한 금액도 그 조항과 맞습니다.",
          "meaning": "penalty.clause=present; penalty.calc=matches"
        },
        {
          "value": "pc_clause_calc_differs",
          "label": "조항은 있지만, 몇 개월치인지나 계산 기준이 조항과 다르게 적용되었습니다.",
          "meaning": "penalty.clause=present; penalty.calc=differs"
        },
        {
          "value": "pc_no_clause",
          "label": "계약서에서 위약금 조항을 찾지 못했는데, 위약금이 공제(청구)되었습니다.",
          "meaning": "penalty.clause=absent_or_not_found"
        },
        {
          "value": "pc_cause_disputed",
          "label": "계약이 일찍 끝난 원인이 누구에게 있는지(집 매각·수리 지연·조기 퇴거 등)를 두고 서로 주장이 다릅니다.",
          "meaning": "penalty.trigger=disputed"
        },
        {
          "value": "pc_cannot_read",
          "label": "계약서가 베트남어로만 되어 있어, 위약금 조항이 있는지 확인하지 못했습니다.",
          "meaning": "penalty.clause=unknown; contract.language_understood=no"
        }
      ]
    },
    {
      "id": "re02_extra_claim_detail",
      "phase": 2,
      "kind": "single",
      "showIf": "`PATH_E` / profile_field: `claim.extra_basis`",
      "profileFields": [
        "claim.extra_basis"
      ],
      "question": "다툼이 되는 추가 금액은 어떤 명목인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "xc_fixed_penalty",
          "label": "계약서에 정한 위약금(예: 임대료 몇 개월치)이고, 해당 조항이 계약서에 적혀 있습니다.",
          "meaning": "claim.extra_basis=contract_penalty; penalty.clause=present"
        },
        {
          "value": "xc_remaining_rent",
          "label": "남은 계약 기간의 임대료 전부이고, 계약서에 그렇게 정한 조항이 있는지는 확실하지 않습니다.",
          "meaning": "claim.extra_basis=remaining_term_rent; penalty.clause=uncertain"
        },
        {
          "value": "xc_damage_over_deposit",
          "label": "수리비나 손해가 보증금보다 크다는 이유이고, 견적서나 영수증으로 금액을 맞춰 본 적은 없습니다.",
          "meaning": "claim.extra_basis=damage_exceeds_deposit; claim.itemized=no"
        },
        {
          "value": "xc_unpaid_period",
          "label": "집을 비우기 전까지 밀린 임대료·관리비이고, 몇 달치인지는 서로 알고 있습니다.",
          "meaning": "claim.extra_basis=arrears; claim.rent_admitted=yes"
        },
        {
          "value": "xc_unclear_basis",
          "label": "명목이나 계산 근거가 정리되지 않은 금액이고, 서로 설명이 엇갈리고 있습니다.",
          "meaning": "claim.extra_basis=unclear"
        }
      ]
    }
  ],
  "RE03": [
    {
      "id": "re03_my_role",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "party.role"
      ],
      "question": "이 계약에서 고객님은 어떤 위치에 계신가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_role_tenant",
          "label": "제 이름으로 집을 빌려 살고 있고, 계약서에도 제가 임차인으로 적혀 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_role_company_staff",
          "label": "회사 명의로 계약된 집에 살고 있고, 계약 당사자는 제가 아닌 회사입니다.",
          "meaning": ""
        },
        {
          "value": "r3_role_subtenant",
          "label": "원래 세입자에게서 다시 빌려 살고 있고, 집주인과 직접 맺은 계약은 없습니다.",
          "meaning": ""
        },
        {
          "value": "r3_role_landlord",
          "label": "제 소유의 집(또는 제가 관리를 맡은 가족 소유의 집)을 빌려주었고, 세입자에게서 통보를 받았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_role_proxy",
          "label": "집을 빌려 사는 가족이나 지인 대신 확인하고 있고, 계약 당사자는 제가 아닙니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_demand_type",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "notice.demand_type"
      ],
      "question": "상대방은 이번 통보에서 무엇을 가장 중심적으로 요구했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_dm_fix_breach",
          "label": "문제가 된 부분을 정해진 기간 안에 바로잡으면, 계약을 계속 유지하겠다는 내용이었습니다.",
          "meaning": ""
        },
        {
          "value": "r3_dm_terminate",
          "label": "계약을 끝내겠다는 통보였고, 언제 집을 비워야 하는지는 아직 정해지지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_dm_vacate_date",
          "label": "계약을 끝내면서, 정해진 날짜까지 집을 비우라는(또는 비우겠다는) 날짜가 적혀 있었습니다.",
          "meaning": ""
        },
        {
          "value": "r3_dm_money_claim",
          "label": "계약 위반을 이유로, 위약금이나 손해배상 명목의 돈을 내라는 요구를 받았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_dm_unclear",
          "label": "통보는 받았지만, 상대방이 정확히 무엇을 요구하는지 이해하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_response_status",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "client.action"
      ],
      "question": "통보를 받은 뒤, 지금까지 어떻게 대응하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_rs_none",
          "label": "통보만 받았고, 아직 상대방에게 답하거나 연락하지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rs_inquired",
          "label": "상대방이나 중개인에게 이유를 물어봤지만, 제 입장은 아직 정하지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rs_disputed",
          "label": "통보 내용이 사실과 다르거나 계약과 맞지 않는다고, 상대방에게 분명히 말했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rs_complied_part",
          "label": "밀린 금액을 보내거나 문제를 고치는 등, 요구의 일부를 이미 이행했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rs_negotiating",
          "label": "나가는 날짜나 보증금·금액 조건을 두고, 상대방과 협의하고 있습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_confirm_goal",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "client.priority_goal"
      ],
      "question": "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_cg_validity",
          "label": "이 통보가 계약서 조항과 통지 기간에 맞는 것인지, 그대로 따라야 하는지 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cg_move_timing",
          "label": "정말 집을 비워야 하는지(또는 언제 비워 받을 수 있는지), 그 전에 할 일을 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cg_money",
          "label": "보증금을 어떻게 정리해야 하는지, 위약금이나 손해배상을 내야 하는지 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cg_fact_gap",
          "label": "상대방이 말한 위반 사유 중 사실과 다른 부분을 정리하고, 어떻게 설명할지 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cg_order",
          "label": "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_notice_form",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "notice.form"
      ],
      "question": "이번 통보는 어떤 방법으로 받으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_nf_written_hand",
          "label": "서명된 서면 통지를 직접 건네받았고, 원본을 가지고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_nf_post",
          "label": "우편이나 등기우편으로 서면 통지를 받았고, 봉투나 수령 기록도 남아 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_nf_messenger",
          "label": "Zalo·카카오톡·이메일 등 메시지로 받았고, 화면 캡처나 대화 기록이 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_nf_oral",
          "label": "전화나 방문으로 말로만 들었고, 서면이나 메시지는 받지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_nf_via_middle",
          "label": "중개인이나 관리사무소가 대신 전달했고, 상대방에게 직접 들은 것은 아닙니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_notice_sender",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_notice_form = r3_nf_oral|r3_nf_via_middle",
      "profileFields": [
        "notice.sender"
      ],
      "question": "통보를 실제로 보낸 사람은 누구로 확인되나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_sd_party_self",
          "label": "계약서에 적힌 상대방 본인이 보낸 것이고, 이름이나 연락처로 확인했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_sd_agent",
          "label": "상대방의 가족·회사 담당자·변호사 등 대리인이 보냈고, 위임받았는지는 확인하지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_sd_broker",
          "label": "계약을 중개한 중개인이 보냈고, 상대방 본인의 뜻인지는 직접 확인하지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_sd_mgmt_office",
          "label": "건물 관리사무소가 보냈고, 계약 상대방 본인의 뜻인지는 분명하지 않습니다.",
          "meaning": ""
        },
        {
          "value": "r3_sd_unknown",
          "label": "누가 보낸 것인지, 계약 상대방과 어떤 관계인지 확인하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_notice_period",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "contract.notice_clause"
      ],
      "question": "통보에서 준 기간은 계약서의 해지·통지 조항과 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_np_meets_clause",
          "label": "계약서에 '며칠 전 통지' 조항이 있고, 이번 통보는 그 기간을 지킨 것으로 보입니다.",
          "meaning": ""
        },
        {
          "value": "r3_np_shorter",
          "label": "계약서에 통지 기간 조항이 있지만, 이번 통보는 그보다 짧은 기간만 주었습니다.",
          "meaning": ""
        },
        {
          "value": "r3_np_no_clause",
          "label": "계약서를 확인했지만, 해지 통지 기간에 관한 조항은 찾지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_np_lang_unread",
          "label": "계약서가 베트남어로만 되어 있어, 해당 조항이 있는지 확인하지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_np_no_contract",
          "label": "서면 계약서 없이 말이나 메시지로 계약했거나, 계약서 사본을 지금 가지고 있지 않습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_contract_form",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_notice_period = r3_np_shorter|r3_np_no_clause",
      "profileFields": [
        "contract.form"
      ],
      "question": "계약서는 어떤 형태로 작성되어 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_cf_notarized",
          "label": "공증사무소에서 공증받은 계약서이고, 원본이나 공증 사본을 가지고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cf_bilingual",
          "label": "공증은 받지 않았고, 베트남어와 한국어(또는 영어)가 함께 적힌 계약서입니다.",
          "meaning": ""
        },
        {
          "value": "r3_cf_vn_only",
          "label": "공증은 받지 않았고, 베트남어로만 된 계약서라 일부만 이해하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cf_foreign_only",
          "label": "한국어나 영어로만 작성했고, 베트남어 본은 따로 만들지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cf_company_held",
          "label": "회사나 원래 세입자가 계약서를 보관하고 있어, 저는 내용을 직접 보지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_move_out_deadline",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_demand_type = r3_dm_terminate|r3_dm_vacate_date",
      "profileFields": [
        "notice.vacate_deadline_type"
      ],
      "question": "집을 비우는 날짜는 어떻게 안내받으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_md_date_written",
          "label": "통보에 정확한 날짜가 적혀 있어, 언제까지인지 확인했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_md_period_only",
          "label": "'통보일부터 30일 이내'처럼 기간만 적혀 있어, 정확한 날짜는 계산하지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_md_immediate",
          "label": "날짜 없이, 바로 또는 며칠 안에 집을 비우라는(비우겠다는) 말만 들었습니다.",
          "meaning": ""
        },
        {
          "value": "r3_md_not_stated",
          "label": "계약을 끝낸다는 통보는 받았지만, 언제 비워야 하는지는 안내받지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_md_lang_unclear",
          "label": "통보가 베트남어로 되어 있어, 날짜가 적혀 있는지조차 확인하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_key_dates",
      "phase": 2,
      "kind": "text",
      "showIf": "항상",
      "profileFields": [
        "timeline.notice_date; timeline.deadline_date; timeline.contract_end"
      ],
      "question": "통보를 받은 날짜, 통보에 적힌 기한, 계약서에 적힌 계약 종료일을 아는 대로 적어 주세요.",
      "placeholder": "예: 10월 1일 Zalo로 통보를 받았고, 10월 31일까지 집을 비우라고 적혀 있습니다. 계약은 2027년 3월까지입니다. / 9월 20일 통보, 7일 안에 밀린 임대료를 보내라고 했습니다.",
      "options": []
    },
    {
      "id": "re03_occupancy_tenant",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_my_role ≠ r3_role_landlord 그리고 (re03_demand_type = r3_dm_vacate_date 또는 re03_move_out_deadline = r3_md_immediate)",
      "profileFields": [
        "occupancy.status"
      ],
      "question": "지금 그 집에서의 생활은 어떤 상태인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_oc_living_normal",
          "label": "아직 그 집에 살고 있고, 출입이나 전기·수도 사용에는 문제가 없습니다.",
          "meaning": ""
        },
        {
          "value": "r3_oc_moving_prep",
          "label": "아직 살고 있지만, 새 집을 알아보거나 짐을 일부 옮기고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_oc_already_left",
          "label": "이미 집을 비웠지만, 열쇠 반납이나 집 상태 확인은 아직 하지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_oc_locked_out",
          "label": "상대방이 열쇠를 바꾸거나 전기·수도를 끊어, 집을 제대로 쓰지 못하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_oc_belongings_threat",
          "label": "정해진 날까지 나가지 않으면, 짐을 밖으로 내놓겠다는 말을 들었습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_occupancy_landlord",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_my_role = r3_role_landlord",
      "profileFields": [
        "occupancy.tenant_status"
      ],
      "question": "세입자는 지금 그 집을 어떻게 쓰고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_ol_still_living",
          "label": "세입자가 아직 살고 있고, 나가는 날짜에 대해 연락은 되고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ol_not_leaving",
          "label": "계약이 끝났거나 해지됐는데도 세입자가 나가지 않고, 날짜 이야기를 피하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ol_third_party",
          "label": "세입자가 아닌 다른 사람이 살고 있어, 제 동의 없이 다시 빌려준 것으로 보입니다.",
          "meaning": ""
        },
        {
          "value": "r3_ol_left_items",
          "label": "세입자는 나간 것 같지만, 짐이 남아 있고 열쇠도 돌려받지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ol_no_contact",
          "label": "세입자와 연락이 끊겼고, 집 안 상태도 확인하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_reason_tenant",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_my_role ≠ r3_role_landlord",
      "profileFields": [
        "notice.reason"
      ],
      "question": "상대방은 계약 위반이나 해지 이유를 무엇이라고 했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_rt_arrears",
          "label": "임대료나 관리비가 밀렸다는 이유였고, 밀린 기간이나 금액이 적혀 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rt_noise_misuse",
          "label": "소음이나 이웃 민원, 또는 집을 사무실·영업 등 주거 외 용도로 썼다는 이유였습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rt_sublease",
          "label": "집주인 동의 없이 다른 사람에게 다시 빌려주었거나, 함께 살게 했다는 이유였습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rt_owner_side",
          "label": "제 잘못이 아니라, 집을 팔거나 집주인이 직접 쓰겠다는 상대방 사정 때문이라고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rt_other_unclear",
          "label": "위에 없는 다른 이유이거나, 이유가 적혀 있지 않아 알 수 없습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_arrears_fact",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_reason_tenant = r3_rt_arrears",
      "profileFields": [
        "payment.arrears_fact"
      ],
      "question": "밀렸다고 한 임대료·관리비는 실제와 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_ar_admit_unpaid",
          "label": "실제로 밀린 금액이 있고, 그 금액도 상대방 말과 거의 같습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ar_amount_differs",
          "label": "밀린 것은 맞지만, 상대방이 말한 금액이나 기간이 실제보다 큽니다.",
          "meaning": ""
        },
        {
          "value": "r3_ar_paid_not_counted",
          "label": "이미 송금했는데, 상대방이 받지 못했다고 하거나 반영하지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ar_mgmt_fee_dispute",
          "label": "임대료는 보냈고, 문제가 된 것은 관리사무소 관리비나 전기·수도 요금입니다.",
          "meaning": ""
        },
        {
          "value": "r3_ar_none",
          "label": "밀린 금액이 없고, 송금 내역으로 이를 확인할 수 있습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_arrears_cause",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_arrears_fact = r3_ar_admit_unpaid|r3_ar_mgmt_fee_dispute",
      "profileFields": [
        "payment.arrears_cause"
      ],
      "question": "그 금액이 밀리게 된 실제 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_ac_temp_shortage",
          "label": "일시적으로 돈이 부족했거나 송금을 놓쳤고, 지금은 밀린 금액을 낼 수 있는 상태입니다.",
          "meaning": ""
        },
        {
          "value": "r3_ac_withheld_repair",
          "label": "집주인이 수리나 약속을 지키지 않아, 그 사이 일부러 보내지 않고 있었습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ac_company_delay",
          "label": "회사가 대신 내는 임대료인데, 회사 쪽 송금이 늦어졌습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ac_account_changed",
          "label": "집주인이 계좌나 받는 방법을 바꾸었는데, 제대로 안내받지 못해 늦어졌습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ac_fee_unclear",
          "label": "관리비·전기·수도 요금이 어떻게 계산되었는지 몰라, 확인될 때까지 보내지 않았습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_conduct_fact",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_reason_tenant = r3_rt_noise_misuse|r3_rt_sublease",
      "profileFields": [
        "conduct.fact"
      ],
      "question": "상대방이 문제 삼은 집 사용 방식은 실제로 어떠했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_cd_admit_fixed",
          "label": "그런 일이 있었던 것은 맞지만, 통보를 받은 뒤 이미 그만두거나 고쳤습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cd_admit_ongoing",
          "label": "그런 일이 있었던 것은 맞고, 지금도 같은 방식으로 쓰고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cd_consented_before",
          "label": "계약 전이나 중간에 집주인이 허락했고, 허락받은 메시지나 서면이 남아 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cd_exaggerated",
          "label": "비슷한 일은 있었지만, 상대방이 실제보다 훨씬 크게 문제 삼고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cd_deny",
          "label": "그런 사용은 없었고, 이웃이나 관리사무소가 사실을 확인해 줄 수 있습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_owner_reason_fact",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_reason_tenant = r3_rt_owner_side",
      "profileFields": [
        "counterparty.owner_side_reason"
      ],
      "question": "상대방 사정으로 계약을 끝내겠다는 통보는 어떤 내용이었나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_ow_sale_new_owner",
          "label": "집을 팔았거나 팔 예정이라고 했고, 새 집주인에게 계약이 이어지는지는 듣지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ow_sale_buyer_wants_empty",
          "label": "집을 팔면서, 사는 사람이 빈집을 원한다며 날짜를 정해 나가 달라고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ow_own_use",
          "label": "집주인이나 가족이 직접 살겠다며, 계약 기간이 남았는데도 나가 달라고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ow_bank_issue",
          "label": "은행 담보나 집주인의 빚 문제로, 집이 다른 사람에게 넘어갈 수 있다는 이야기를 들었습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ow_compensation_offered",
          "label": "상대방 사정이라며, 이사비나 위약금 일부를 보상하겠다고 제안했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_reason_landlord",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_my_role = r3_role_landlord",
      "profileFields": [
        "notice.reason"
      ],
      "question": "세입자는 계약 위반이나 해지 이유를 무엇이라고 했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_rld_repair_claim",
          "label": "제가 수리나 시설 관리를 해 주지 않아, 계약을 지키지 않았다고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rld_early_exit",
          "label": "귀국·전근 등 세입자 개인 사정으로, 계약 기간 전에 나가겠다고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rld_deposit_claim",
          "label": "보증금이나 미리 받은 임대료를 돌려 달라고 하면서, 해지를 통보했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rld_house_issue",
          "label": "누수·곰팡이·소음 등 집 상태가 계약 때 설명과 다르다고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_rld_no_reason",
          "label": "이유 없이 나가겠다고만 했거나, 그 뒤로 연락이 거의 끊긴 상태입니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_exit_terms_landlord",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_reason_landlord = r3_rld_early_exit|r3_rld_deposit_claim|r3_rld_no_reason",
      "profileFields": [
        "contract.early_exit_clause"
      ],
      "question": "세입자가 계약 기간 전에 나가는 경우에 대해, 계약서에는 어떻게 정해져 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_et_forfeit_clause",
          "label": "기간 전에 나가면 보증금을 돌려주지 않는다는 조항이 있고, 세입자도 서명했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_et_months_penalty",
          "label": "기간 전에 나가면 임대료 몇 달치를 위약금으로 낸다는 조항이 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_et_mutual_allowed",
          "label": "일정 기간이 지나면 미리 알리기만 하면 위약금 없이 나갈 수 있다는 조항이 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_et_no_clause",
          "label": "기간 전에 나가는 경우에 대한 조항이 없거나, 계약서에서 찾지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_et_tenant_disputes",
          "label": "조항은 있지만, 세입자가 그 조항을 몰랐다거나 자신에게는 적용되지 않는다고 말합니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_fact_compare",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_reason_tenant = r3_rt_other_unclear 또는 re03_reason_landlord = r3_rld_repair_claim|r3_rld_house_issue",
      "profileFields": [
        "facts.match"
      ],
      "question": "상대방이 통보에서 말한 내용은 실제 있었던 일과 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_fc_match",
          "label": "상대방이 말한 내용이 실제 있었던 일과 거의 같습니다.",
          "meaning": ""
        },
        {
          "value": "r3_fc_partial",
          "label": "그런 일은 있었지만, 날짜·금액·횟수 등 일부가 실제와 다릅니다.",
          "meaning": ""
        },
        {
          "value": "r3_fc_already_solved",
          "label": "그런 일은 있었지만, 통보 전에 이미 해결했거나 상대방과 정리한 일입니다.",
          "meaning": ""
        },
        {
          "value": "r3_fc_other_breached",
          "label": "상대방이 먼저 계약을 지키지 않았는데, 이번 통보에는 그 사실이 빠져 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_fc_cannot_compare",
          "label": "통보 내용을 이해하지 못했거나 기록이 없어, 지금은 비교하기 어렵습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_fact_gap",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_fact_compare = r3_fc_partial|r3_fc_already_solved|r3_fc_other_breached",
      "profileFields": [
        "facts.gap_type"
      ],
      "question": "상대방 말과 실제가 가장 크게 다른 점은 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_gp_date_amount",
          "label": "날짜나 금액이 다르고, 송금 내역이나 영수증으로 실제를 보여 줄 수 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_gp_action_itself",
          "label": "문제라고 한 행동 자체가 다르고, 당시 상황을 보여 줄 메시지나 증인이 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_gp_prior_agreement",
          "label": "이미 상대방과 합의한 일인데, 그 합의를 없던 일로 하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_gp_counter_breach",
          "label": "상대방이 수리·보증금·약속을 먼저 지키지 않았는데, 그 부분이 빠져 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_gp_no_proof_yet",
          "label": "다르다는 것은 분명하지만, 이를 보여 줄 자료를 아직 모으지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_fact_gap_text",
      "phase": 2,
      "kind": "text",
      "showIf": "re03_fact_gap = r3_gp_date_amount|r3_gp_action_itself|r3_gp_prior_agreement|r3_gp_counter_breach 또는 re03_arrears_fact = r3_ar_amount_differs|r3_ar_paid_not_counted 또는 re03_conduct_fact = r3_cd_consented_before|r3_cd_exaggerated|r3_cd_deny",
      "profileFields": [
        "facts.gap_text"
      ],
      "question": "상대방 주장과 실제가 다른 부분을 날짜와 함께 적어 주세요.",
      "placeholder": "예: 9월 임대료는 9월 5일에 계좌이체로 보냈는데, 통보에는 9월분이 밀렸다고 적혀 있습니다. / 3월에 집주인이 Zalo로 사무실 사용을 허락했는데, 이번 통보에는 그 내용이 빠져 있습니다.",
      "options": []
    },
    {
      "id": "re03_deposit_status",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "payment.deposit_status"
      ],
      "question": "이 계약의 보증금은 지금 어떤 상태인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_ds_held_no_talk",
          "label": "보증금은 집주인 쪽에 그대로 있고, 돌려주거나 빼는 것에 대한 이야기는 아직 없습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ds_return_promised",
          "label": "돌려준다는 말은 오갔지만, 금액이나 날짜는 아직 정해지지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ds_deduct_listed",
          "label": "밀린 금액이나 수리비를 빼고 돌려준다고 했고, 공제 내역도 받았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ds_deduct_no_list",
          "label": "일부를 빼고 돌려준다고 했지만, 무엇을 얼마나 빼는지 내역은 받지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_ds_forfeit",
          "label": "계약 위반을 이유로, 보증금을 전혀 돌려주지 않겠다는 이야기가 나왔습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_penalty_clause",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_demand_type = r3_dm_money_claim 또는 re03_deposit_status = r3_ds_deduct_listed|r3_ds_deduct_no_list|r3_ds_forfeit",
      "profileFields": [
        "contract.penalty_match"
      ],
      "question": "상대방이 요구한 금액은 계약서의 위약금 조항과 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_pc_clause_matches",
          "label": "계약서에 위약금 조항(보증금 몰수, 임대료 몇 달치 등)이 있고, 요구 금액도 그 조항과 같습니다.",
          "meaning": ""
        },
        {
          "value": "r3_pc_amount_exceeds",
          "label": "위약금 조항은 있지만, 요구받은 금액이 조항보다 크거나 다른 항목이 더 붙어 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_pc_no_clause",
          "label": "계약서에 위약금 조항이 없는데, 상대방이 금액을 정해서 요구했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_pc_damage_claim",
          "label": "위약금과 별도로, 수리비·공실 손해 등 손해배상을 추가로 요구받았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_pc_unknown",
          "label": "위약금 조항이 있는지, 요구 금액이 어떻게 계산되었는지 모르겠습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_claim_amount",
      "phase": 2,
      "kind": "text",
      "showIf": "re03_penalty_clause = r3_pc_clause_matches|r3_pc_amount_exceeds|r3_pc_no_clause|r3_pc_damage_claim",
      "profileFields": [
        "claim.amount_text"
      ],
      "question": "요구받은 금액과 항목을 통보에 적힌 그대로 적어 주세요.",
      "placeholder": "예: 위약금으로 임대료 2개월분 3,000만 동, 청소비 200만 동을 보증금에서 빼겠다고 했습니다.",
      "options": []
    },
    {
      "id": "re03_counter_reaction",
      "phase": 2,
      "kind": "single",
      "showIf": "re03_response_status = r3_rs_inquired|r3_rs_disputed|r3_rs_complied_part|r3_rs_negotiating",
      "profileFields": [
        "counterparty.response"
      ],
      "question": "대응한 뒤, 상대방은 어떤 반응을 보였나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_cr_withdrawn",
          "label": "통보를 거두거나, 계약을 그대로 유지하겠다는 답을 받았습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cr_maintained",
          "label": "처음 통보를 그대로 유지하겠다며, 같은 날짜와 요구를 다시 말했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cr_new_terms",
          "label": "날짜를 미루거나 금액을 줄이는 등, 일부는 받아들이면서 새로운 조건을 제시했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cr_shift_blame",
          "label": "자기 문제가 아니라며, 새 집주인·중개인·관리사무소·회사 쪽으로 책임을 돌렸습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cr_legal_threat",
          "label": "법원이나 공안에 신고하겠다고 했거나, 이미 절차를 시작했다고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r3_cr_no_reply",
          "label": "아직 답이 없거나, 답을 받았지만 무슨 뜻인지 이해하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_evidence",
      "phase": 2,
      "kind": "multi",
      "showIf": "항상",
      "profileFields": [
        "evidence.items"
      ],
      "question": "현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
      "placeholder": "",
      "options": [
        {
          "value": "r3_ev_contract",
          "label": "임대차 계약서(공증본·번역본 포함)",
          "meaning": ""
        },
        {
          "value": "r3_ev_notice_chat",
          "label": "상대방에게서 받은 통보와 그 뒤 주고받은 메시지 기록",
          "meaning": ""
        },
        {
          "value": "r3_ev_transfer",
          "label": "임대료·관리비·보증금 송금 내역이나 영수증",
          "meaning": ""
        },
        {
          "value": "r3_ev_house_photo",
          "label": "입주할 때와 지금의 집 상태를 보여 주는 사진·영상, 또는 집 상태 확인서·열쇠 인수 기록",
          "meaning": ""
        },
        {
          "value": "r3_ev_side_agreement",
          "label": "집주인(세입자)이 허락하거나 따로 합의한 내용, 또는 수리를 요청한 기록",
          "meaning": ""
        },
        {
          "value": "r3_ev_none",
          "label": "보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_blockage",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "process.blockage"
      ],
      "question": "현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_bk_validity_unknown",
          "label": "통보가 계약서 조항에 맞는 것인지 판단하지 못해, 따를지 말지 정하지 못하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_bk_time_pressure",
          "label": "집을 비우는 날짜가 너무 가까워, 이사나 다음 세입자 준비가 따라가지 못하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_bk_money_dispute",
          "label": "보증금이나 위약금 금액에 서로 의견이 달라, 정리가 멈춰 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_bk_no_proof",
          "label": "상대방 말이 사실과 다르다는 것을 보여 줄 자료가 부족해, 대응을 미루고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r3_bk_no_response",
          "label": "상대방이 연락을 피하거나 답이 없어, 다음 단계로 넘어가지 못하고 있습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re03_final_goal",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "client.final_goal"
      ],
      "question": "이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r3_gl_keep_living",
          "label": "계약을 그대로 유지하고, 남은 계약 기간 동안 그 집에서 계속 살고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r3_gl_leave_settle_money",
          "label": "나가는 것은 받아들이되, 보증금과 남은 금액을 정확히 정리하고 나가고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r3_gl_leave_no_penalty",
          "label": "계약을 끝내되, 위약금이나 손해배상 없이 정리하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r3_gl_recover_house",
          "label": "집주인으로서 계약을 정리하고, 집을 비워 돌려받고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r3_gl_claim_penalty",
          "label": "집주인으로서 세입자가 기간 전에 나가는 것에 대해, 계약서대로 위약금이나 보증금 정리를 받고 싶습니다.",
          "meaning": ""
        }
      ]
    }
  ],
  "RE04": [
    {
      "id": "re04_issue_type",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "issue.type"
      ],
      "question": "지금 상대방과 해결되지 않고 있는 문제는 어떤 것인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "it_repair_refused",
          "label": "누수·전기·에어컨·온수기 같은 설비가 고장 났는데, 상대방이 수리해 주지 않거나 계속 미루고 있습니다.",
          "meaning": "issue.type=repair_refused; counterparty.response=delay_or_refuse_repair"
        },
        {
          "value": "it_prior_defect_blamed",
          "label": "입주하기 전부터 있던 하자인데, 상대방이 제가 망가뜨렸다며 수리비나 책임을 저에게 넘기고 있습니다.",
          "meaning": "issue.type=prior_defect_blamed; issue.defect_origin=pre_movein(client_claim); counterparty.response=shift_blame"
        },
        {
          "value": "it_fee_dispute",
          "label": "관리비·전기·수도 요금의 금액이 이상하거나, 누가 내야 하는지를 두고 상대방과 다투고 있습니다.",
          "meaning": "issue.type=fee_dispute"
        },
        {
          "value": "it_neighbor_management",
          "label": "이웃이나 관리사무소 문제로 생활이 어려운데, 집주인은 계약과 관계없다며 해결하지 않고 있습니다.",
          "meaning": "issue.type=neighbor_management; party.third_party=neighbor_or_management; counterparty.response=disclaim"
        },
        {
          "value": "it_landlord_entry",
          "label": "집주인이나 중개인이 미리 알리지 않고 집에 들어왔거나, 원할 때 들어오겠다고 요구하고 있습니다.",
          "meaning": "issue.type=landlord_entry; counterparty.action=entry_without_notice"
        }
      ]
    },
    {
      "id": "re04_since_when",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "timeline.problem_start"
      ],
      "question": "이 문제는 언제부터 이어지고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "sw_within_week",
          "label": "1주일 안쪽에 처음 생긴 문제이고, 아직 상대방에게 한두 번 말해 본 정도입니다.",
          "meaning": "timeline.problem_start=within_1w; timeline.duration=short"
        },
        {
          "value": "sw_within_month",
          "label": "몇 주 전부터 이어지고 있고, 여러 번 말했지만 아직 해결되지 않았습니다.",
          "meaning": "timeline.problem_start=within_1m; notice.repeated=yes"
        },
        {
          "value": "sw_over_month",
          "label": "한 달 넘게 계속되고 있고, 그동안 생활의 불편이나 비용이 쌓이고 있습니다.",
          "meaning": "timeline.problem_start=over_1m; impact.accumulating=yes"
        },
        {
          "value": "sw_since_movein",
          "label": "입주할 때부터 있던 문제이고, 처음부터 계속 말해 왔지만 그대로입니다.",
          "meaning": "timeline.problem_start=at_movein; issue.defect_origin=pre_movein(client_claim)"
        },
        {
          "value": "sw_recurring",
          "label": "한 번 고쳤거나 정리되었는데, 얼마 지나지 않아 같은 문제가 다시 생겼습니다.",
          "meaning": "timeline.problem_start=recurring; issue.prior_fix=failed"
        }
      ]
    },
    {
      "id": "re04_notify_status",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "notice.channel"
      ],
      "question": "이 문제를 상대방에게 어떻게 알리셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "nt_not_told",
          "label": "아직 상대방에게 정식으로 알리지 않았고, 사진이나 기록만 모아 두었습니다.",
          "meaning": "notice.channel=none; notice.record=none; evidence.collecting=yes"
        },
        {
          "value": "nt_verbal_only",
          "label": "전화하거나 직접 만나서 말로만 알렸고, 따로 남아 있는 기록은 없습니다.",
          "meaning": "notice.channel=verbal; notice.record=none"
        },
        {
          "value": "nt_message_sent",
          "label": "잘로(Zalo)·카카오톡·이메일 등 메시지로 알렸고, 보낸 기록이 날짜와 함께 남아 있습니다.",
          "meaning": "notice.channel=message; notice.record=dated"
        },
        {
          "value": "nt_formal_request",
          "label": "문제 내용과 해결 기한을 적어, 서면이나 이메일로 정식으로 요청했습니다.",
          "meaning": "notice.channel=formal_written; notice.record=dated; notice.deadline_set=yes"
        },
        {
          "value": "nt_via_agent",
          "label": "중개인이나 관리사무소를 통해 전달했고, 상대방에게 직접 말하지는 않았습니다.",
          "meaning": "notice.channel=via_intermediary; notice.delivery_confirmed=unknown"
        }
      ]
    },
    {
      "id": "re04_confirm_goal",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "goal.primary_check"
      ],
      "question": "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "cg_who_responsible",
          "label": "이 문제를 고치거나 비용을 내야 하는 쪽이 누구인지, 계약서 기준으로 확인하고 싶습니다.",
          "meaning": "goal.primary_check=responsibility"
        },
        {
          "value": "cg_how_to_request",
          "label": "상대방에게 어떤 방법과 내용으로 요구해야 기록이 남고 효과가 있는지 확인하고 싶습니다.",
          "meaning": "goal.primary_check=request_method"
        },
        {
          "value": "cg_self_repair_cost",
          "label": "제가 먼저 고치거나 낸 비용을, 월세나 보증금에서 정산받을 수 있는지 확인하고 싶습니다.",
          "meaning": "goal.primary_check=cost_recovery"
        },
        {
          "value": "cg_deposit_risk",
          "label": "이 문제 때문에 나중에 보증금을 돌려받지 못하거나, 계약이 끝날 위험이 있는지 확인하고 싶습니다.",
          "meaning": "goal.primary_check=deposit_contract_risk"
        },
        {
          "value": "cg_order_unsure",
          "label": "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.",
          "meaning": "goal.primary_check=sequence"
        }
      ]
    },
    {
      "id": "re04_repair_detail",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_issue_type = it_repair_refused",
      "profileFields": [
        "issue.repair_item"
      ],
      "question": "고장 난 곳은 어디이고, 지금 어떤 상태인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "rd_water_leak",
          "label": "천장·벽·배관에서 물이 새고 있고, 곰팡이나 가구 손상까지 생기고 있습니다.",
          "meaning": "issue.repair_item=water_leak; impact.secondary_damage=yes"
        },
        {
          "value": "rd_electric_fault",
          "label": "차단기가 자주 내려가거나 콘센트·조명이 작동하지 않아, 감전이나 화재가 걱정됩니다.",
          "meaning": "issue.repair_item=electric; risk.safety=yes"
        },
        {
          "value": "rd_aircon_heater",
          "label": "에어컨이나 온수기가 고장 나서, 냉방이나 온수를 전혀 쓰지 못하고 있습니다.",
          "meaning": "issue.repair_item=aircon_heater; impact.essential_use_lost=yes"
        },
        {
          "value": "rd_door_window",
          "label": "출입문 잠금장치나 창문·방범창이 고장 나, 문단속이 제대로 되지 않습니다.",
          "meaning": "issue.repair_item=door_window; risk.safety=yes"
        },
        {
          "value": "rd_included_appliance",
          "label": "계약에 포함된 냉장고·세탁기·가구가 고장 났고, 수리나 교체를 요청한 상태입니다.",
          "meaning": "issue.repair_item=included_appliance; contract.item_included=yes"
        }
      ]
    },
    {
      "id": "re04_defect_claim",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_issue_type = it_prior_defect_blamed",
      "profileFields": [
        "counterparty.claim"
      ],
      "question": "상대방은 어떤 하자를 제 책임이라고 말하고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "dc_surface_damage",
          "label": "벽·바닥·문에 원래 있던 흠집이나 얼룩을, 제가 살면서 생긴 것이라고 합니다.",
          "meaning": "counterparty.claim=surface_damage_by_tenant"
        },
        {
          "value": "dc_equipment_breakdown",
          "label": "처음부터 상태가 좋지 않던 설비가 고장 나자, 제가 잘못 써서 망가졌다고 합니다.",
          "meaning": "counterparty.claim=misuse_breakdown"
        },
        {
          "value": "dc_mold_leak",
          "label": "입주 전부터 있던 누수나 곰팡이를, 제가 환기나 관리를 하지 않아 생겼다고 합니다.",
          "meaning": "counterparty.claim=poor_maintenance_mold"
        },
        {
          "value": "dc_missing_items",
          "label": "처음부터 없던 비품이나 물건을, 제가 사용하다가 잃어버렸다고 합니다.",
          "meaning": "counterparty.claim=missing_inventory"
        },
        {
          "value": "dc_deposit_deduction",
          "label": "이 하자 비용을 계약이 끝날 때 보증금에서 빼겠다고 이미 말했습니다.",
          "meaning": "counterparty.claim=defect_cost; counterparty.threat=deposit_deduction_announced"
        }
      ]
    },
    {
      "id": "re04_fee_detail",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_issue_type = it_fee_dispute",
      "profileFields": [
        "issue.fee_problem"
      ],
      "question": "어떤 요금이, 어떤 점에서 문제가 되고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "fd_electric_rate",
          "label": "전기요금이 전력회사 청구 금액보다 높은 단가로 계산되어 청구되고 있습니다.",
          "meaning": "issue.fee_problem=rate_markup; fee.item=electricity"
        },
        {
          "value": "fd_payer_shift",
          "label": "계약상 집주인이 내기로 한 관리비나 요금을, 저에게 내라고 요구하고 있습니다.",
          "meaning": "issue.fee_problem=payer_shift; contract.fee_payer=landlord(client_claim)"
        },
        {
          "value": "fd_unilateral_increase",
          "label": "계약 기간 중인데, 관리비나 요금 단가를 미리 합의 없이 올렸습니다.",
          "meaning": "issue.fee_problem=unilateral_increase; contract.term_status=ongoing"
        },
        {
          "value": "fd_prior_arrears",
          "label": "집주인이나 전 세입자가 밀린 요금 때문에, 전기·수도가 끊기거나 끊긴다는 안내를 받았습니다.",
          "meaning": "issue.fee_problem=third_party_arrears; risk.utility_cut=notified_or_done"
        },
        {
          "value": "fd_no_breakdown",
          "label": "매달 금액만 통보받고, 계량기 수치나 청구서 원본은 받지 못하고 있습니다.",
          "meaning": "issue.fee_problem=no_breakdown; evidence.original_bill=none"
        }
      ]
    },
    {
      "id": "re04_neighbor_detail",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_issue_type = it_neighbor_management",
      "profileFields": [
        "issue.third_party_problem"
      ],
      "question": "이웃이나 관리사무소와 관련해 어떤 일이 이어지고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "nd_upstairs_leak",
          "label": "위층이나 옆집에서 물이 새어 들어오는데, 집주인과 그 집이 서로 책임을 미루고 있습니다.",
          "meaning": "issue.third_party_problem=neighbor_leak; party.multi=yes; counterparty.response=mutual_blame"
        },
        {
          "value": "nd_noise_smell",
          "label": "이웃의 소음·담배 냄새·공사가 계속되는데, 관리사무소에 말해도 달라지지 않습니다.",
          "meaning": "issue.third_party_problem=nuisance; party.third_party=neighbor; management.response=ineffective"
        },
        {
          "value": "nd_management_restriction",
          "label": "관리사무소가 출입카드·주차·이사·택배 등을 막거나 제한하고 있습니다.",
          "meaning": "issue.third_party_problem=management_restriction; party.third_party=management_office"
        },
        {
          "value": "nd_common_facility",
          "label": "엘리베이터·공용 배관·주차장 같은 공용 시설 고장으로, 생활에 계속 지장이 있습니다.",
          "meaning": "issue.third_party_problem=common_facility; party.third_party=management_office"
        },
        {
          "value": "nd_condition_mismatch",
          "label": "계약할 때 설명받은 건물 조건과 실제가 달라 집주인에게 말했지만, 건물 문제라며 관여하지 않습니다.",
          "meaning": "issue.third_party_problem=condition_mismatch; counterparty.response=disclaim; contract.representation_gap=yes"
        }
      ]
    },
    {
      "id": "re04_entry_detail",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_issue_type = it_landlord_entry",
      "profileFields": [
        "issue.entry_type"
      ],
      "question": "집주인이나 중개인의 출입은 어떻게 이루어졌나요?",
      "placeholder": "",
      "options": [
        {
          "value": "ed_entered_absent",
          "label": "제가 없을 때 알리지 않고 들어왔고, 물건이 옮겨져 있거나 들어온 흔적이 남아 있었습니다.",
          "meaning": "issue.entry_type=entered_while_absent; evidence.entry_trace=yes"
        },
        {
          "value": "ed_entered_present",
          "label": "미리 연락 없이 찾아와, 제가 있는 상태에서 동의 없이 집 안으로 들어왔습니다.",
          "meaning": "issue.entry_type=entered_without_consent"
        },
        {
          "value": "ed_viewing_demand",
          "label": "집을 팔거나 다음 세입자를 구한다며, 집을 보여 달라는 요구를 자주 하고 있습니다.",
          "meaning": "issue.entry_type=viewing_demand; counterparty.plan=sale_or_relet"
        },
        {
          "value": "ed_key_retained",
          "label": "집주인이 열쇠나 비밀번호를 그대로 가지고 있고, 제가 바꾸지 못하게 하고 있습니다.",
          "meaning": "issue.entry_type=key_retained; client.lock_change=blocked"
        },
        {
          "value": "ed_unilateral_device",
          "label": "집 안이나 현관에 카메라를 달거나 잠금장치를 바꾸는 등, 저와 상의 없이 조치했습니다.",
          "meaning": "issue.entry_type=unilateral_device; risk.privacy=yes"
        }
      ]
    },
    {
      "id": "re04_counterparty",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "party.counterparty_type"
      ],
      "question": "이 문제로 실제로 이야기하고 있는 상대방은 누구인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "cp_individual_direct",
          "label": "개인 집주인과 직접 계약했고, 이 문제도 집주인에게 직접 이야기하고 있습니다.",
          "meaning": "party.counterparty_type=individual_owner; party.contract_with=owner; party.intermediary=none"
        },
        {
          "value": "cp_agent_managed",
          "label": "집주인은 따로 있지만, 중개인이나 관리 대행업체가 월세와 수리를 대신 맡아 관리하고 있습니다.",
          "meaning": "party.counterparty_type=agent_for_owner; party.contract_with=owner; party.intermediary=agent; party.agent_authority=unverified"
        },
        {
          "value": "cp_company_landlord",
          "label": "집주인이 개인이 아니라 임대 회사·법인이고, 그 회사 담당자와 연락하고 있습니다.",
          "meaning": "party.counterparty_type=corporate_owner; party.contract_with=company"
        },
        {
          "value": "cp_employer_lease",
          "label": "제가 다니는 회사 명의로 계약해서, 회사 담당자와 집주인 사이에서 이야기가 오가고 있습니다.",
          "meaning": "party.counterparty_type=owner_via_employer; party.lessee=employer; party.client_role=occupant"
        },
        {
          "value": "cp_sublease",
          "label": "집주인이 아니라 원래 임차인에게서 다시 빌린 집이라, 그 사람과 이야기하고 있습니다.",
          "meaning": "party.counterparty_type=original_tenant; party.structure=sublease; party.multi=yes"
        }
      ]
    },
    {
      "id": "re04_contract_clause",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "contract.clause_allocation"
      ],
      "question": "임대차 계약서에는 이 문제(수리·하자·관리비·요금·출입)에 대해 어떻게 적혀 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "cl_landlord_clear",
          "label": "서면 계약서에, 이 문제는 집주인이 책임지거나 부담한다고 분명히 적혀 있습니다.",
          "meaning": "contract.form=written; contract.clause_allocation=landlord"
        },
        {
          "value": "cl_tenant_clear",
          "label": "서면 계약서에, 이 문제는 임차인이 부담한다고 적혀 있어 제가 불리할 수 있습니다.",
          "meaning": "contract.form=written; contract.clause_allocation=tenant"
        },
        {
          "value": "cl_vague",
          "label": "관련 조항은 있지만, '작은 수리'·'정상적인 사용'처럼 기준이 애매하게 적혀 있습니다.",
          "meaning": "contract.form=written; contract.clause_allocation=ambiguous"
        },
        {
          "value": "cl_absent",
          "label": "계약서는 있지만, 이 문제에 대한 내용은 없거나 아직 찾지 못했습니다.",
          "meaning": "contract.form=written; contract.clause_allocation=none_found"
        },
        {
          "value": "cl_cannot_check",
          "label": "계약서가 베트남어로만 되어 있거나 사본이 없어, 해당 조항을 직접 확인하지 못했습니다.",
          "meaning": "contract.clause_allocation=unverified"
        }
      ]
    },
    {
      "id": "re04_contract_access",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_contract_clause = cl_cannot_check",
      "profileFields": [
        "contract.access_barrier"
      ],
      "question": "계약서 내용을 직접 확인하지 못하는 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "ca_vn_only",
          "label": "계약서는 가지고 있지만, 베트남어로만 되어 있어 조항을 읽지 못했습니다.",
          "meaning": "contract.form=written; contract.language=vi_only; contract.copy_holder=client"
        },
        {
          "value": "ca_company_lease",
          "label": "회사 명의로 계약해서, 저는 실제로 사는 사람이지만 계약서는 회사 담당자만 가지고 있습니다.",
          "meaning": "contract.form=written; contract.copy_holder=employer; party.lessee=employer"
        },
        {
          "value": "ca_no_copy",
          "label": "서명은 했지만 사본을 받지 못했고, 원본(공증본 포함)은 집주인이나 중개인만 가지고 있습니다.",
          "meaning": "contract.form=written; contract.copy_holder=landlord_or_agent; contract.client_copy=none"
        },
        {
          "value": "ca_verbal_only",
          "label": "정식 계약서 없이, 메시지나 말로만 월세와 조건을 정했습니다.",
          "meaning": "contract.form=verbal_or_message; contract.client_copy=none"
        }
      ]
    },
    {
      "id": "re04_not_told_reason",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_notify_status = nt_not_told",
      "profileFields": [
        "client.not_notified_reason"
      ],
      "question": "아직 상대방에게 정식으로 알리지 않은 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "ntr_fear_relation",
          "label": "관계가 나빠지거나 계약에 불이익이 생길까 봐, 말을 꺼내지 못하고 있습니다.",
          "meaning": "client.not_notified_reason=fear_retaliation"
        },
        {
          "value": "ntr_who_to_contact",
          "label": "집주인·중개인·관리사무소 중 누구에게 말해야 하는지 몰라 미루고 있습니다.",
          "meaning": "client.not_notified_reason=recipient_unclear; party.counterparty_type=unclear"
        },
        {
          "value": "ntr_language",
          "label": "베트남어로 어떻게 설명하고 요구해야 할지 몰라, 아직 연락하지 못했습니다.",
          "meaning": "client.not_notified_reason=language"
        },
        {
          "value": "ntr_collecting_first",
          "label": "먼저 사진과 자료를 모은 뒤, 한 번에 정리해서 알리려고 준비하고 있습니다.",
          "meaning": "client.not_notified_reason=preparing_evidence; evidence.collecting=yes"
        }
      ]
    },
    {
      "id": "re04_other_response",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_notify_status = nt_verbal_only|nt_message_sent|nt_formal_request|nt_via_agent",
      "profileFields": [
        "counterparty.response"
      ],
      "question": "알린 뒤, 상대방은 어떻게 반응했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "or_agreed_stalled",
          "label": "해결하겠다고 말은 했지만, 날짜를 정하지 않은 채 지금까지 그대로입니다.",
          "meaning": "counterparty.response=accept_no_action; counterparty.date_committed=no"
        },
        {
          "value": "or_partial_offer",
          "label": "비용 일부만 부담하겠다거나, 제가 먼저 고치면 나중에 정산해 주겠다고 말로만 했습니다.",
          "meaning": "counterparty.response=partial_accept; counterparty.offer_record=verbal_only"
        },
        {
          "value": "or_refused_blame",
          "label": "자기 책임이 아니라며 거절했고, 오히려 저에게 비용이나 책임을 넘기고 있습니다.",
          "meaning": "counterparty.response=refuse_shift_blame"
        },
        {
          "value": "or_counter_threat",
          "label": "계속 문제 삼으면 계약을 끝내거나 보증금을 돌려주지 않겠다는 말을 했습니다.",
          "meaning": "counterparty.response=retaliation_threat"
        },
        {
          "value": "or_silent_or_relay",
          "label": "답이 없거나, 중개인·관리사무소가 전달했다고만 하고 상대방의 답은 듣지 못했습니다.",
          "meaning": "counterparty.response=no_reply_or_relay_only; notice.delivery_confirmed=no"
        }
      ]
    },
    {
      "id": "re04_threat_detail",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_other_response = or_counter_threat",
      "profileFields": [
        "counterparty.threat"
      ],
      "question": "상대방은 구체적으로 무엇을 하겠다고 했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "td_vacate_early",
          "label": "계약 기간이 남았는데, 정해진 날까지 집을 비우라고 했습니다.",
          "meaning": "counterparty.threat=early_vacate_demand; contract.term_status=ongoing"
        },
        {
          "value": "td_keep_deposit",
          "label": "계약이 끝나면 보증금의 일부나 전부를 돌려주지 않겠다고 했습니다.",
          "meaning": "counterparty.threat=withhold_deposit"
        },
        {
          "value": "td_raise_or_no_renew",
          "label": "다음 달부터 월세를 올리거나, 계약이 끝나면 재계약하지 않겠다고 했습니다.",
          "meaning": "counterparty.threat=rent_raise_or_no_renewal"
        },
        {
          "value": "td_cut_utilities",
          "label": "전기·수도·인터넷을 끊거나 출입카드를 막겠다고 했고, 그중 일부는 이미 실제로 끊기거나 막혔습니다.",
          "meaning": "counterparty.threat=utility_access_cut; counterparty.action=utility_cut_executed"
        },
        {
          "value": "td_residence_registration",
          "label": "임시거주 신고를 해 주지 않거나, 이미 한 신고를 정리하겠다고 했습니다.",
          "meaning": "counterparty.threat=residence_registration; risk.immigration_link=yes"
        }
      ]
    },
    {
      "id": "re04_fact_compare",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_other_response = or_refused_blame",
      "profileFields": [
        "fact.claim_vs_actual"
      ],
      "question": "상대방이 주장하는 내용은 실제 있었던 일과 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "fc_mostly_true",
          "label": "상대방 말이 대체로 맞고, 저에게도 일부 책임이 있다고 생각합니다.",
          "meaning": "fact.claim_vs_actual=mostly_true; client.admits_partial=yes"
        },
        {
          "value": "fc_partly_true",
          "label": "일부는 맞지만, 원인이나 생긴 시점, 금액이 실제와 다르게 말하고 있습니다.",
          "meaning": "fact.claim_vs_actual=partly_true; fact.dispute_point=cause_time_amount"
        },
        {
          "value": "fc_false_with_proof",
          "label": "상대방 주장은 실제와 크게 다르고, 이를 보여 줄 날짜 있는 기록이 있습니다.",
          "meaning": "fact.claim_vs_actual=false; evidence.counter_proof=dated"
        },
        {
          "value": "fc_false_no_proof",
          "label": "상대방 주장은 실제와 다르지만, 이를 보여 줄 기록이 부족합니다.",
          "meaning": "fact.claim_vs_actual=false; evidence.counter_proof=insufficient"
        },
        {
          "value": "fc_no_specific_claim",
          "label": "상대방이 구체적인 이유 없이 거절만 하고 있어, 비교할 내용이 없습니다.",
          "meaning": "fact.claim_vs_actual=no_specific_claim"
        }
      ]
    },
    {
      "id": "re04_handover_record",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_issue_type = it_prior_defect_blamed",
      "profileFields": [
        "evidence.handover_record"
      ],
      "question": "입주할 때 집 상태는 어떻게 기록해 두셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "hr_signed_checklist",
          "label": "집 상태와 비품을 적은 인수인계서(체크리스트)에 저와 상대방이 함께 서명했습니다.",
          "meaning": "evidence.handover_record=signed_checklist; evidence.mutual_ack=yes"
        },
        {
          "value": "hr_dated_photos_only",
          "label": "서명한 문서는 없지만, 입주하던 날 찍은 날짜 있는 사진·영상이 남아 있습니다.",
          "meaning": "evidence.handover_record=dated_photos; evidence.mutual_ack=no"
        },
        {
          "value": "hr_item_list_only",
          "label": "비품 목록은 계약서에 있지만, 하자나 상태에 대해서는 적혀 있지 않습니다.",
          "meaning": "evidence.handover_record=inventory_only; evidence.condition_noted=no"
        },
        {
          "value": "hr_told_verbally",
          "label": "입주할 때 하자를 말로만 알렸고, 따로 남긴 기록은 없습니다.",
          "meaning": "evidence.handover_record=verbal_only"
        },
        {
          "value": "hr_no_record",
          "label": "입주할 때 집 상태를 따로 기록하거나 확인하지 않았습니다.",
          "meaning": "evidence.handover_record=none"
        }
      ]
    },
    {
      "id": "re04_self_repair",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_issue_type = it_repair_refused",
      "profileFields": [
        "client.self_repair"
      ],
      "question": "문제를 해결하려고 직접 비용을 쓴 적이 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "sr_paid_with_receipt",
          "label": "제가 먼저 수리업체를 불러 고쳤고, 영수증이나 송금 내역이 남아 있습니다.",
          "meaning": "client.self_repair=done; payment.self_repair_proof=receipt"
        },
        {
          "value": "sr_paid_no_receipt",
          "label": "제가 먼저 고쳤지만, 현금으로 줘서 영수증은 받지 못했습니다.",
          "meaning": "client.self_repair=done; payment.self_repair_proof=none; payment.method=cash"
        },
        {
          "value": "sr_paid_no_consent",
          "label": "상대방의 동의 없이 고쳤고, 상대방은 그 비용을 인정하지 않고 있습니다.",
          "meaning": "client.self_repair=done; client.prior_consent=no; counterparty.response=cost_disputed"
        },
        {
          "value": "sr_quote_only",
          "label": "아직 고치지 않았고, 수리업체에서 견적만 받아 두었습니다.",
          "meaning": "client.self_repair=quote_only"
        },
        {
          "value": "sr_not_spent",
          "label": "아직 제가 직접 쓴 비용은 없고, 상대방이 고쳐 주기를 기다리고 있습니다.",
          "meaning": "client.self_repair=none"
        }
      ]
    },
    {
      "id": "re04_self_repair_amount",
      "phase": 2,
      "kind": "text",
      "showIf": "re04_self_repair = sr_paid_with_receipt|sr_paid_no_receipt|sr_paid_no_consent|sr_quote_only",
      "profileFields": [
        "payment.self_repair_detail"
      ],
      "question": "지금까지 쓴 비용이나 받은 견적의 날짜·금액·내역을 적어 주세요.",
      "placeholder": "예: 2026-09-12 욕실 배관 누수 수리 1,500,000동(영수증 있음) / 곰팡이 제거 견적 800,000동, 집주인에게 잘로로 사진과 함께 보냄",
      "options": []
    },
    {
      "id": "re04_fee_amount",
      "phase": 2,
      "kind": "text",
      "showIf": "re04_issue_type = it_fee_dispute",
      "profileFields": [
        "payment.fee_claim_detail"
      ],
      "question": "문제가 되는 요금의 이름과 청구된 금액, 계약서에 적힌 기준을 적어 주세요.",
      "placeholder": "예: 전기요금 kWh당 4,000동으로 계산되어 9월분 2,800,000동 청구됨 / 계약서에는 '전력회사 청구 금액 기준'이라고 적혀 있음",
      "options": []
    },
    {
      "id": "re04_living_impact",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_issue_type = it_neighbor_management|it_landlord_entry",
      "profileFields": [
        "impact.living"
      ],
      "question": "이 문제가 지금 생활에 어느 정도 영향을 주고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "li_minor",
          "label": "불편하지만, 지금 생활하는 데 큰 지장은 없습니다.",
          "meaning": "impact.living=minor"
        },
        {
          "value": "li_partial_use",
          "label": "방이나 욕실·주방 일부를 쓰지 못하거나, 집에 있는 시간을 줄일 정도로 생활이 바뀌었습니다.",
          "meaning": "impact.living=partial_use_lost"
        },
        {
          "value": "li_safety_privacy",
          "label": "안전이나 사생활이 걱정되어, 혼자 있거나 물건을 두고 나가기가 불안합니다.",
          "meaning": "impact.living=safety_privacy; risk.privacy=yes"
        },
        {
          "value": "li_belongings_damaged",
          "label": "제 가구·전자제품·옷 같은 물건이 손상되었거나, 없어진 것이 있습니다.",
          "meaning": "impact.living=property_damage_or_loss; impact.client_property=damaged_or_missing"
        },
        {
          "value": "li_staying_elsewhere",
          "label": "계속 살기 어려워, 임시로 다른 곳에 머물고 있거나 이사를 고민하고 있습니다.",
          "meaning": "impact.living=relocated_or_considering; client.action=temporary_relocation"
        }
      ]
    },
    {
      "id": "re04_rent_status",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "payment.rent_status"
      ],
      "question": "이 문제가 생긴 뒤, 월세와 요금은 어떻게 내고 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "rs_paying_normal",
          "label": "문제와 별개로, 월세와 요금은 계약대로 계속 내고 있습니다.",
          "meaning": "payment.rent_status=paid_in_full"
        },
        {
          "value": "rs_withholding",
          "label": "상대방이 해결할 때까지, 월세나 요금의 일부 또는 전부를 내지 않고 있습니다.",
          "meaning": "payment.rent_status=withheld; risk.arrears_claim=yes"
        },
        {
          "value": "rs_deducted_cost",
          "label": "제가 쓴 수리비나 잘못 청구된 금액을 빼고, 남은 금액만 월세로 보냈습니다.",
          "meaning": "payment.rent_status=paid_net_of_offset; client.action=self_offset"
        },
        {
          "value": "rs_considering_withhold",
          "label": "아직 내고 있지만, 해결되지 않으면 월세를 멈추려고 생각하고 있습니다.",
          "meaning": "payment.rent_status=paid_in_full; client.plan=withhold"
        },
        {
          "value": "rs_payment_refused",
          "label": "상대방이 제 송금을 받지 않거나, 계약과 다른 금액을 내라고 요구하고 있습니다.",
          "meaning": "payment.rent_status=tender_refused_or_amount_disputed; counterparty.action=refuse_payment_or_new_amount"
        }
      ]
    },
    {
      "id": "re04_withhold_notice",
      "phase": 2,
      "kind": "single",
      "showIf": "re04_rent_status = rs_withholding|rs_deducted_cost",
      "profileFields": [
        "client.withhold_notice"
      ],
      "question": "월세를 멈추거나 금액을 뺀 사실을 상대방에게 어떻게 알리셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "wn_agreed_in_writing",
          "label": "상대방과 미리 합의했고, 그 합의가 메시지나 서면으로 남아 있습니다.",
          "meaning": "client.withhold_notice=agreed; counterparty.response=accept_offset; evidence.agreement=written"
        },
        {
          "value": "wn_notified_no_consent",
          "label": "이유와 금액을 메시지로 알렸지만, 상대방은 동의하지 않았거나 답이 없습니다.",
          "meaning": "client.withhold_notice=notified; counterparty.response=no_consent_or_silent"
        },
        {
          "value": "wn_not_notified",
          "label": "따로 알리지 않고, 월세만 덜 보내거나 보내지 않았습니다.",
          "meaning": "client.withhold_notice=none"
        },
        {
          "value": "wn_landlord_objected",
          "label": "상대방이 이를 연체라고 하며, 계약 해지나 보증금 공제를 언급했습니다.",
          "meaning": "client.withhold_notice=disputed; counterparty.response=arrears_claim; counterparty.threat=termination_or_deduction"
        }
      ]
    },
    {
      "id": "re04_deadline",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "timeline.deadline_type"
      ],
      "question": "이 문제와 관련해 정해진 날짜나 다가오는 기한이 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r4_dl_promised_date",
          "label": "상대방이 수리하거나 정산하겠다고 약속한 날짜가 있고, 그 약속이 기록으로 남아 있습니다.",
          "meaning": "timeline.deadline_type=counterparty_promise; evidence.promise_record=yes"
        },
        {
          "value": "dl_utility_cutoff",
          "label": "요금을 정리하지 않으면 전기·수도가 끊긴다고 안내받은 날짜가 있습니다.",
          "meaning": "timeline.deadline_type=utility_cutoff; risk.utility_cut=scheduled"
        },
        {
          "value": "dl_contract_end",
          "label": "계약 만료일이 다가오고 있어, 그 전에 이 문제와 보증금 정산을 정리해야 합니다.",
          "meaning": "timeline.deadline_type=contract_end; contract.end_near=yes"
        },
        {
          "value": "dl_vacate_demand",
          "label": "상대방이 정한 날짜까지 집을 비우라고 요구하고 있습니다.",
          "meaning": "timeline.deadline_type=vacate_demand; counterparty.threat=early_vacate_demand"
        },
        {
          "value": "r4_dl_none",
          "label": "정해진 날짜는 없지만, 시간이 지날수록 문제가 커지고 있습니다.",
          "meaning": "timeline.deadline_type=none; impact.accumulating=yes"
        }
      ]
    },
    {
      "id": "re04_key_dates",
      "phase": 2,
      "kind": "text",
      "showIf": "항상",
      "profileFields": [
        "timeline.key_dates"
      ],
      "question": "이 문제와 관련된 날짜를 아는 만큼 적어 주세요. (입주일, 문제가 처음 생긴 날, 처음 알린 날, 다시 요청한 날, 약속받거나 통보받은 날짜, 계약 만료일)",
      "placeholder": "예: 입주 2026-03-01 / 욕실 누수 처음 발견 2026-08-25 / 잘로로 사진 보내 첫 요청 2026-08-26, 다시 요청 2026-09-10 / 집주인이 2026-10-20까지 수리하겠다고 약속 / 계약 만료 2027-02-28",
      "options": []
    },
    {
      "id": "re04_evidence",
      "phase": 2,
      "kind": "multi",
      "showIf": "항상",
      "profileFields": [
        "evidence.items"
      ],
      "question": "현재 보관하고 있어 바로 확인할 수 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
      "placeholder": "",
      "options": [
        {
          "value": "ev_dated_photos",
          "label": "문제 상태를 찍은 날짜 있는 사진·영상(입주 당시 사진 포함)",
          "meaning": "evidence.photos=dated"
        },
        {
          "value": "ev_messages",
          "label": "상대방·중개인·관리사무소와 주고받은 잘로·카카오톡·이메일 메시지",
          "meaning": "evidence.messages=yes"
        },
        {
          "value": "ev_receipts_bills",
          "label": "수리비 영수증, 관리비·전기·수도 청구서, 송금 내역",
          "meaning": "evidence.payment_records=yes"
        },
        {
          "value": "ev_contract_handover",
          "label": "임대차 계약서와 인수인계서(비품·상태 목록) 사본",
          "meaning": "evidence.contract_copy=yes; evidence.handover_doc=yes"
        },
        {
          "value": "ev_cause_report",
          "label": "수리기사나 관리사무소가 고장·하자의 원인을 적어 준 확인서나 메시지",
          "meaning": "evidence.cause_report=third_party"
        },
        {
          "value": "ev_none",
          "label": "보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.",
          "meaning": "evidence.items=none_or_unchecked"
        }
      ]
    },
    {
      "id": "re04_blockage",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "blockage.main"
      ],
      "question": "현재 이 문제가 해결되지 못하는 가장 큰 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "bk_responsibility_unclear",
          "label": "누가 고치거나 비용을 내야 하는지 기준이 분명하지 않아, 서로 미루고만 있습니다.",
          "meaning": "blockage.main=responsibility_unclear"
        },
        {
          "value": "bk_no_proof",
          "label": "입주 당시 상태나 문제가 생긴 시점을 보여 줄 기록이 부족해, 제 주장을 뒷받침하지 못하고 있습니다.",
          "meaning": "blockage.main=insufficient_proof"
        },
        {
          "value": "bk_contact_blocked",
          "label": "상대방과 연락이 잘 닿지 않거나, 중개인·관리사무소가 중간에서 말을 제대로 전하지 않습니다.",
          "meaning": "blockage.main=contact_blocked"
        },
        {
          "value": "bk_fear_retaliation",
          "label": "강하게 요구하면 계약 해지나 보증금 문제가 생길까 봐, 요구를 망설이고 있습니다.",
          "meaning": "blockage.main=fear_retaliation"
        },
        {
          "value": "bk_language_barrier",
          "label": "계약서나 상대방의 답변이 베트남어라, 정확히 이해하거나 제 입장을 설명하지 못하고 있습니다.",
          "meaning": "blockage.main=language"
        }
      ]
    },
    {
      "id": "re04_final_goal",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "goal.final"
      ],
      "question": "이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?",
      "placeholder": "",
      "options": [
        {
          "value": "fg_repair_and_stay",
          "label": "상대방이 비용을 부담해 수리를 마치게 하고, 계약 기간 동안 계속 살고 싶습니다.",
          "meaning": "goal.final=repair_and_stay"
        },
        {
          "value": "fg_cost_settled",
          "label": "제가 쓴 비용이나 잘못 청구된 요금을 정산받고, 그 결과를 기록으로 남기고 싶습니다.",
          "meaning": "goal.final=cost_settlement"
        },
        {
          "value": "fg_deposit_protected",
          "label": "이 문제가 나중에 보증금 공제나 하자 책임으로 이어지지 않도록 지금 정리해 두고 싶습니다.",
          "meaning": "goal.final=deposit_protection"
        },
        {
          "value": "fg_rules_in_writing",
          "label": "수리 방법·요금 기준·출입 방법을 상대방과 서면으로 다시 합의하고 싶습니다.",
          "meaning": "goal.final=written_rules"
        },
        {
          "value": "fg_exit_with_deposit",
          "label": "더 이상 살기 어려워, 보증금을 돌려받고 계약을 정리한 뒤 나가고 싶습니다.",
          "meaning": "goal.final=exit_with_deposit"
        }
      ]
    }
  ],
  "RE05": [
    {
      "id": "re05_stage",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "case.stage"
      ],
      "question": "명의 이전이나 핑크북 서류에서 생긴 문제는 어떤 상황인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_transfer_delay",
          "label": "매매 계약은 맺었지만, 약속한 시점이 되어도 제 이름으로 명의 이전이 끝나지 않고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_project_book_pending",
          "label": "분양 아파트나 신축 주택을 샀지만, 약속한 시점이 지나도 핑크북이 발급되지 않고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_book_mismatch",
          "label": "핑크북을 확인해 보니, 소유자 이름이나 면적이 계약 내용이나 실제 집과 다릅니다.",
          "meaning": ""
        },
        {
          "value": "r5_foreign_eligibility",
          "label": "외국인인 제가 이 집을 제 이름으로 소유할 수 있는지 확실하지 않아, 진행이 멈춰 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_registration_rejected",
          "label": "명의 이전이나 핑크북 발급을 신청했지만, 토지등록사무소에서 받아들이지 않는다는 통지를 받았습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_paidStage",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "payment.stage / payment.channel"
      ],
      "question": "이 거래에서 지금까지 돈은 어디까지 지급하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_paid_deposit",
          "label": "계약금(đặt cọc)만 지급했고, 중도금과 잔금은 아직 지급하지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_paid_interim",
          "label": "계약금과 중도금까지 지급했고, 잔금은 명의 이전이나 핑크북을 받을 때 지급하기로 했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_paid_balance",
          "label": "잔금까지 모두 지급했지만, 아직 제 이름으로 권리가 넘어오지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_paid_via_broker",
          "label": "매도인이 아닌 중개인이나 지인 계좌로 돈을 보냈고, 매도인이 실제로 받았는지는 확인하지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_paid_nothing",
          "label": "아직 돈을 지급하지 않았고, 계약 전에 서류를 확인하고 있는 단계입니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_counterparty",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "party.counterparty_type"
      ],
      "question": "이 거래의 상대방은 누구인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_cp_individual_seller",
          "label": "핑크북을 가진 개인 매도인과 직접 계약했고, 지금도 매도인과 연락이 됩니다.",
          "meaning": ""
        },
        {
          "value": "r5_cp_developer",
          "label": "분양 회사와 직접 분양 계약을 맺었고, 회사 담당자를 통해 진행하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cp_resale_buyer",
          "label": "먼저 분양받은 사람에게서 분양 계약을 넘겨받았고, 분양 회사와 직접 계약하지는 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cp_broker_only",
          "label": "중개인을 통해서만 진행했고, 매도인을 직접 만나거나 연락한 적은 없습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cp_owner_unclear",
          "label": "계약은 했지만, 핑크북상 실제 권리자가 누구인지 확실하지 않습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_confirmGoal",
      "phase": 1,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "goal.primary"
      ],
      "question": "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_cg_why_stuck",
          "label": "명의 이전이나 핑크북 발급이 왜 멈춰 있는지, 그 원인부터 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cg_doc_valid",
          "label": "받은 핑크북이나 계약서가 진짜인지, 적힌 내용이 맞는지 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cg_foreign_ok",
          "label": "외국인인 제가 이 집을 제 이름으로 소유할 수 있는지, 어떤 조건이 붙는지 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cg_money_safe",
          "label": "이미 지급한 돈이 안전한지, 남은 돈을 계속 지급해도 되는지 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cg_order",
          "label": "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_transferDelayDetail",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_transfer_delay",
      "profileFields": [
        "transfer.blocking_step"
      ],
      "question": "명의 이전은 지금 어느 단계에서 멈춰 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_td_seller_docs",
          "label": "계약은 마쳤지만, 매도인이 핑크북 원본이나 신청에 필요한 서류를 아직 넘겨주지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_td_mortgage",
          "label": "매도인의 은행 담보가 아직 풀리지 않아, 명의 이전 신청을 하지 못하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_td_filed_waiting",
          "label": "토지등록사무소에 신청서는 접수되었지만, 안내받은 처리 기간이 지나도 결과가 나오지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_td_tax_stage",
          "label": "세금 납부 안내까지 받았지만, 누가 세금을 납부할지 정리되지 않아 멈춰 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_td_stage_unknown",
          "label": "절차를 매도인이나 중개인이 맡고 있어, 지금 어느 단계인지 알지 못합니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_projectBookDetail",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_project_book_pending",
      "profileFields": [
        "project.book_reason"
      ],
      "question": "핑크북이 발급되지 않은 이유를 어떻게 안내받으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_pb_not_applied",
          "label": "집은 인도받았지만, 분양 회사가 아직 핑크북 발급 신청을 하지 않았다고 합니다.",
          "meaning": ""
        },
        {
          "value": "r5_pb_project_legal",
          "label": "분양 회사가 프로젝트 전체의 법적 절차가 끝나지 않아 핑크북 발급이 늦어진다고 설명했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_pb_project_mortgage",
          "label": "분양 회사가 프로젝트를 은행 담보로 잡혀 두었고, 그 담보가 풀려야 발급된다고 들었습니다.",
          "meaning": ""
        },
        {
          "value": "r5_pb_applied_no_proof",
          "label": "분양 회사는 이미 신청했다고 하지만, 접수증 같은 근거는 받지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_pb_last_payment_hold",
          "label": "계약서에 핑크북(증서) 발급 후 지급할 금액이 따로 적혀 있고, 발급 일정은 따로 안내받지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_mismatchDetail",
      "phase": 2,
      "kind": "multi",
      "showIf": "re05_stage = r5_book_mismatch",
      "profileFields": [
        "book.mismatch_fields"
      ],
      "question": "핑크북에서 계약 내용이나 실제 집과 다른 부분을 모두 선택해 주세요. (여러 개 선택 가능)",
      "placeholder": "",
      "options": [
        {
          "value": "r5_mm_owner_name",
          "label": "소유자 이름(계약한 매도인과 다른 사람이거나, 공동 소유자가 더 있음)",
          "meaning": ""
        },
        {
          "value": "r5_mm_area",
          "label": "면적(계약서나 실제 집의 ㎡와 다름)",
          "meaning": ""
        },
        {
          "value": "r5_mm_address_use",
          "label": "주소·지번·호수, 또는 토지 용도·사용 기간",
          "meaning": ""
        },
        {
          "value": "r5_mm_forgery_suspect",
          "label": "핑크북 자체가 진짜가 아닐 수 있다는 말을 들음",
          "meaning": ""
        },
        {
          "value": "r5_mm_unsure",
          "label": "다르다는 말은 들었지만, 어느 부분인지 알지 못함",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_foreignDetail",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_foreign_eligibility",
      "profileFields": [
        "foreign.issue"
      ],
      "question": "외국인 소유 문제는 어떤 상황에서 생겼나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_fe_land_house",
          "label": "분양 프로젝트가 아닌, 땅이 딸린 단독주택이나 타운하우스를 사려고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_fe_quota_full",
          "label": "분양 아파트인데, 그 건물에서 외국인이 살 수 있는 물량이 다 찼다는 말을 들었습니다.",
          "meaning": ""
        },
        {
          "value": "r5_fe_term_limit",
          "label": "소유는 가능하다고 들었지만, 외국인 개인의 소유기간과 연장 가능 여부는 아직 확인하지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_fe_nominee",
          "label": "외국인 명의가 어렵다고 해서, 베트남인 지인 이름으로 계약하거나 등록하려고 합니다.",
          "meaning": ""
        },
        {
          "value": "r5_fe_told_unclear",
          "label": "외국인은 안 된다는 말만 들었고, 정확한 이유는 설명받지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_rejectionDetail",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_registration_rejected",
      "profileFields": [
        "registration.rejection_reason"
      ],
      "question": "토지등록사무소는 신청을 받아들이지 않는 이유를 어떻게 설명했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_rj_docs_missing",
          "label": "서류가 빠졌거나 서류끼리 내용이 맞지 않는다며, 고칠 부분을 알려 주었습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rj_foreign_status",
          "label": "외국인 명의로는 등록할 수 없는 집이라는 이유를 들었습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rj_seller_side",
          "label": "매도인 쪽의 은행 담보·압류·분쟁 기록 때문에 명의 이전을 할 수 없다고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rj_no_reason",
          "label": "통지는 받았지만, 이유는 적혀 있지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rj_not_understood",
          "label": "이유가 적혀 있지만, 베트남어나 법률 용어 때문에 이해하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_paidAmount",
      "phase": 2,
      "kind": "text",
      "showIf": "re05_paidStage = r5_paid_deposit|r5_paid_interim|r5_paid_balance|r5_paid_via_broker",
      "profileFields": [
        "payment.detail_text"
      ],
      "question": "지금까지 지급한 금액과 날짜, 전체 매매 금액을 적어 주세요. (변경: \"날짜\" 추가 — 지급 시점을 시간축에 남기기 위함)",
      "placeholder": "예: 전체 매매 금액 35억 동 중 2026년 3월 10일에 계약금 3억 5천만 동, 5월 20일에 중도금 10억 동을 매도인 계좌로 송금했습니다.",
      "options": []
    },
    {
      "id": "re05_nameOnDocs",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_transfer_delay|r5_book_mismatch|r5_foreign_eligibility|r5_registration_rejected (변경: r5_book_mismatch 추가)",
      "profileFields": [
        "title.name_match"
      ],
      "question": "핑크북과 매매계약서에는 각각 누구의 이름이 적혀 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_nm_match",
          "label": "핑크북의 소유자와 계약서의 매도인이 같은 사람이고, 신분증으로도 확인했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_nm_family_coowner",
          "label": "핑크북에 매도인 외에 배우자나 가족도 함께 적혀 있는데, 계약서에는 매도인만 서명했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_nm_proxy",
          "label": "핑크북 소유자는 따로 있고, 계약은 위임장을 가진 대리인과 맺었습니다.",
          "meaning": ""
        },
        {
          "value": "r5_nm_buyer_vn_name",
          "label": "계약서의 매수인이 제가 아니라 베트남인 지인 이름으로 되어 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_nm_not_seen",
          "label": "핑크북 원본이나 사본을 직접 보지 못해, 누구 이름인지 확인하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_mortgage",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_transfer_delay|r5_book_mismatch|r5_registration_rejected (변경: r5_transfer_delay·r5_registration_rejected 추가)",
      "profileFields": [
        "title.mortgage_status"
      ],
      "question": "이 집이 은행 담보로 잡혀 있는지 확인하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_mg_none_confirmed",
          "label": "핑크북 뒷면 기재란이나 토지등록사무소 조회로, 담보가 없다는 것을 확인했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_mg_release_planned",
          "label": "은행 담보가 있고, 제가 지급하는 잔금으로 담보를 풀기로 매도인과 약속했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_mg_release_unclear",
          "label": "은행 담보가 있다고 들었지만, 언제 어떻게 풀리는지는 확인하지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_mg_paid_not_released",
          "label": "담보를 풀 돈을 이미 지급했지만, 은행에서 담보가 해제되었는지 확인되지 않습니다.",
          "meaning": ""
        },
        {
          "value": "r5_mg_unknown",
          "label": "담보 여부를 확인해 본 적이 없거나, 확인하는 방법을 모릅니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_resaleApproval",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_counterparty = r5_cp_resale_buyer 그리고 re05_stage = r5_project_book_pending",
      "profileFields": [
        "contract.assignment_approval"
      ],
      "question": "분양 계약을 넘겨받을 때, 분양 회사가 그 이전을 인정했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_ra_developer_confirmed",
          "label": "분양 회사가 계약 이전을 확인해 주었고, 제 이름이 적힌 확인서나 변경된 계약서를 받았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_ra_notarized_only",
          "label": "공증사무소에서 양도 계약서를 공증받았지만, 분양 회사의 확인은 아직 받지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_ra_private_only",
          "label": "먼저 분양받은 사람과 직접 쓴 양도 서류만 있고, 공증이나 분양 회사 확인은 없습니다.",
          "meaning": ""
        },
        {
          "value": "r5_ra_unknown",
          "label": "중개인이나 먼저 분양받은 사람이 처리했다고 해서, 분양 회사가 인정했는지 알지 못합니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_promisedDate",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_transfer_delay|r5_project_book_pending",
      "profileFields": [
        "timeline.promise_status"
      ],
      "question": "명의 이전이나 핑크북 발급은 언제까지 해 주기로 약속받으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_pd_written_passed",
          "label": "계약서에 날짜가 적혀 있고, 그 날짜가 이미 지났습니다.",
          "meaning": ""
        },
        {
          "value": "r5_pd_written_upcoming",
          "label": "계약서에 날짜가 적혀 있고, 아직 그 날짜가 되지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_pd_verbal_passed",
          "label": "말이나 메시지로만 약속받았고, 그 시점이 이미 지났습니다.",
          "meaning": ""
        },
        {
          "value": "r5_pd_postponed",
          "label": "여러 차례 날짜를 다시 미루었고, 지금은 새 날짜도 정해지지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_pd_none",
          "label": "언제까지 해 주겠다는 약속은 받은 적이 없습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_counterpartyExplanation",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_promisedDate = r5_pd_written_passed|r5_pd_verbal_passed|r5_pd_postponed",
      "profileFields": [
        "counterparty.explanation"
      ],
      "question": "약속한 날짜가 지난 이유를 상대방은 어떻게 설명했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_ex_procedure",
          "label": "기관 절차가 늦어지고 있을 뿐이라며, 조금 더 기다려 달라고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_ex_tax_demand",
          "label": "명의 이전에 따른 세금을 제가 납부해야 진행된다며, 계약에 없던 금액을 요구했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_ex_extra_cost",
          "label": "급행 비용이나 명목이 분명하지 않은 추가 비용을 내야 진행된다고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_ex_no_explanation",
          "label": "이유를 설명하지 않거나, 연락을 피하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_ex_other_dispute",
          "label": "상속·이혼·채무 같은 다른 분쟁이 있어, 그 문제가 먼저 풀려야 한다고 했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_contractForm",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "contract.form"
      ],
      "question": "매매 계약은 어떤 형태로 맺으셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_cf_notarized_bilingual",
          "label": "공증사무소에서 공증받은 매매계약서가 있고, 한국어나 영어 번역도 함께 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cf_notarized_vn_only",
          "label": "공증사무소에서 공증받은 매매계약서가 있지만, 베트남어로만 되어 있어 내용을 다 이해하지 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cf_developer_contract",
          "label": "분양 회사와 맺은 분양 계약서나 이를 넘겨받은 계약서가 있고, 공증은 하지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cf_deposit_only",
          "label": "계약금 약정서만 썼고, 정식 매매계약서는 아직 쓰지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_cf_informal_only",
          "label": "직접 쓴 계약서나 메시지 약속만 있고, 공증받은 계약서는 없습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_handoverCompare",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_project_book_pending",
      "profileFields": [
        "property.handover"
      ],
      "question": "인도받은 집은 분양 계약 내용과 비교하면 어떤가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_hc_match",
          "label": "인도받은 집의 면적·호수·구조가 분양 계약 내용과 거의 같습니다.",
          "meaning": ""
        },
        {
          "value": "r5_hc_area_diff",
          "label": "실제 면적이 계약 면적과 달라, 금액 정산 문제가 남아 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_hc_spec_diff",
          "label": "면적은 비슷하지만, 구조·마감·부대시설이 계약 내용과 다릅니다.",
          "meaning": ""
        },
        {
          "value": "r5_hc_not_handed",
          "label": "아직 집을 인도받지 못해, 실제와 비교할 수 없습니다.",
          "meaning": ""
        },
        {
          "value": "r5_hc_no_contract_copy",
          "label": "분양 계약서나 도면을 가지고 있지 않아, 비교하기 어렵습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_infoSource",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_book_mismatch|r5_foreign_eligibility|r5_registration_rejected",
      "profileFields": [
        "info.source"
      ],
      "question": "이 문제는 어떤 경로로 알게 되셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_is_office_direct",
          "label": "토지등록사무소나 공증사무소에서 직접 안내를 받았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_is_counterparty",
          "label": "매도인이나 분양 회사로부터 직접 들었습니다.",
          "meaning": ""
        },
        {
          "value": "r5_is_broker_relay",
          "label": "중개인이 전해 주었고, 원래 안내나 서류를 직접 보지는 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_is_self_check",
          "label": "제가 핑크북 사본과 계약서를 직접 비교하다가 알게 되었습니다.",
          "meaning": ""
        },
        {
          "value": "r5_is_hearsay",
          "label": "지인이나 다른 매수인에게 들었고, 아직 공식적으로 확인하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_customerResponse",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "client.action"
      ],
      "question": "문제를 알게 된 뒤, 지금까지 어떻게 대응하셨나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_rs_none",
          "label": "아직 상대방이나 기관에 따로 연락하지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rs_asked_counterparty",
          "label": "매도인이나 분양 회사에 직접 연락해, 진행 상황을 물어보았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rs_via_broker",
          "label": "중개인을 통해 진행을 재촉했고, 직접 연락하지는 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rs_asked_office",
          "label": "토지등록사무소나 공증사무소에 직접 문의했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rs_hold_and_demand",
          "label": "남은 돈의 지급을 멈추고, 서면이나 메시지로 약속을 지켜 달라고 요구했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_responseReaction",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_customerResponse = r5_rs_asked_counterparty|r5_rs_via_broker|r5_rs_asked_office|r5_rs_hold_and_demand",
      "profileFields": [
        "counterparty.response"
      ],
      "question": "대응한 뒤, 상대방이나 기관은 어떻게 반응했나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_rr_new_date",
          "label": "새 날짜를 약속했지만, 서면으로 받지는 못했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rr_partial_progress",
          "label": "서류 일부를 넘겨주거나 신청을 접수하는 등 일부는 진행되었지만, 아직 마무리되지 않았습니다. (추가: \"일부 수용\" 반응이 없어 다른 선택지로 잘못 고르게 되던 문제 보완)",
          "meaning": ""
        },
        {
          "value": "r5_rr_more_money",
          "label": "진행하려면 추가 금액이나 세금을 더 내야 한다고 했습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rr_blame_other",
          "label": "서로 책임을 미루며, 누가 처리해야 하는지 분명히 말하지 않았습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rr_no_contact",
          "label": "답변이 없거나, 연락이 끊겼습니다.",
          "meaning": ""
        },
        {
          "value": "r5_rr_cancel_mentioned",
          "label": "상대방이 계약 해제나 계약금 문제를 먼저 꺼냈습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_evidence",
      "phase": 2,
      "kind": "multi",
      "showIf": "항상",
      "profileFields": [
        "evidence.items"
      ],
      "question": "현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
      "placeholder": "",
      "options": [
        {
          "value": "r5_ev_pinkbook",
          "label": "핑크북 원본이나 앞·뒷면 사본·사진",
          "meaning": ""
        },
        {
          "value": "r5_ev_contracts",
          "label": "매매계약서·분양 계약서·계약금 약정서(공증본 포함)",
          "meaning": ""
        },
        {
          "value": "r5_ev_payment_proof",
          "label": "은행 송금 내역이나 돈을 받았다는 영수증",
          "meaning": ""
        },
        {
          "value": "r5_ev_records",
          "label": "토지등록사무소 접수증·통지서, 은행 담보 해제 확인서 같은 기관 서류 (변경: 메시지를 분리하고 담보 해제 확인서를 포함 — 기관 기록과 상대방 약속은 증명하는 사실이 다름)",
          "meaning": ""
        },
        {
          "value": "r5_ev_messages",
          "label": "매도인·분양 회사·중개인과 주고받은 메시지나 이메일 (추가)",
          "meaning": ""
        },
        {
          "value": "r5_ev_none",
          "label": "보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_blockage",
      "phase": 2,
      "kind": "single",
      "showIf": "re05_stage = r5_book_mismatch|r5_foreign_eligibility|r5_registration_rejected (변경: 항상 → 3개 단계 — 지연·미발급 경로는 상세 질문이 같은 사실을 이미 확보)",
      "profileFields": [
        "blockage.main"
      ],
      "question": "현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_bk_cause_unknown",
          "label": "무엇 때문에 멈춰 있는지 알 수 없어, 어떻게 대응할지 판단하지 못하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_bk_counterparty",
          "label": "상대방이 서류를 넘겨주지 않거나 연락이 되지 않아, 제 쪽에서 진행할 수 없습니다.",
          "meaning": ""
        },
        {
          "value": "r5_bk_money_decision",
          "label": "남은 돈을 지급해야 할지 멈춰야 할지 판단하지 못해, 결정을 미루고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_bk_eligibility",
          "label": "외국인인 제가 소유할 수 있는지 확실하지 않아, 진행 여부를 정하지 못하고 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_bk_docs_language",
          "label": "서류가 베트남어로 되어 있고 절차를 몰라, 무엇을 준비해야 할지 모르겠습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_deadline",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "timeline.deadline_type"
      ],
      "question": "이 일과 관련해 앞으로 지켜야 하거나 다가오는 날짜가 있나요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_dl_next_payment",
          "label": "다음 중도금이나 잔금을 지급해야 하는 날짜가 정해져 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_dl_notice_period",
          "label": "통지서나 기관 안내에 다시 신청하거나 보완할 수 있는 기간이 적혀 있습니다.",
          "meaning": ""
        },
        {
          "value": "r5_dl_personal",
          "label": "입주·출국·비자 갱신 같은 제 일정 때문에, 그 전에 마무리해야 합니다.",
          "meaning": ""
        },
        {
          "value": "r5_dl_none",
          "label": "정해진 날짜나 기한은 따로 없습니다.",
          "meaning": ""
        },
        {
          "value": "r5_dl_unsure",
          "label": "서류가 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다.",
          "meaning": ""
        }
      ]
    },
    {
      "id": "re05_deadlineDate",
      "phase": 2,
      "kind": "text",
      "showIf": "re05_deadline = r5_dl_next_payment|r5_dl_notice_period|r5_dl_personal",
      "profileFields": [
        "timeline.deadline_text"
      ],
      "question": "확인한 날짜와, 그날까지 해야 하는 일을 적어 주세요.",
      "placeholder": "예: 2026년 11월 30일까지 잔금 15억 동을 지급해야 하고, 그 전에 명의 이전 신청 접수를 확인하고 싶습니다.",
      "options": []
    },
    {
      "id": "re05_finalGoal",
      "phase": 2,
      "kind": "single",
      "showIf": "항상",
      "profileFields": [
        "goal.final"
      ],
      "question": "이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?",
      "placeholder": "",
      "options": [
        {
          "value": "r5_fg_complete_transfer",
          "label": "막힌 원인을 확인하고, 제 이름으로 명의 이전이나 핑크북 발급을 끝까지 마치고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r5_fg_cancel_refund",
          "label": "거래를 계속하기 어렵다면, 계약을 정리하고 지급한 돈을 돌려받는 방법을 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r5_fg_safety_check",
          "label": "남은 돈을 지급하기 전에, 이 거래가 안전한지 서류와 권리관계를 확인하고 싶습니다.",
          "meaning": ""
        },
        {
          "value": "r5_fg_expert",
          "label": "제 상황을 전문가에게 정확히 전달해, 상대방과 기관 대응을 맡기고 싶습니다.",
          "meaning": ""
        }
      ]
    }
  ]
};

export const REAL_ESTATE_PHASE1_ORDER: Record<string, string[]> = {
  "RE01": [
    "re01_contract_type",
    "re01_progress_stage",
    "re01_owner_doc_check",
    "re01_confirm_goal"
  ],
  "RE02": [
    "re02_role",
    "re02_dispute_type",
    "re02_dispute_type_holder",
    "re02_contract_end",
    "re02_confirm_goal"
  ],
  "RE03": [
    "re03_my_role",
    "re03_demand_type",
    "re03_response_status",
    "re03_confirm_goal"
  ],
  "RE04": [
    "re04_issue_type",
    "re04_since_when",
    "re04_notify_status",
    "re04_confirm_goal"
  ],
  "RE05": [
    "re05_stage",
    "re05_paidStage",
    "re05_counterparty",
    "re05_confirmGoal"
  ]
};

export const REAL_ESTATE_RISKS: Record<string, CaseRiskTables> = {
  "RE01": {
    "expert": [
      {
        "trigger": "r1_od_refused_delay",
        "line": "expert|핑크북 원본을 보여 주지 않는 상대방과는 소유 여부가 확인되기 전까지 서명이나 송금을 멈추는 것이 안전합니다."
      },
      {
        "trigger": "r1_oa_poa_unseen",
        "line": "expert|위임장을 직접 보지 못한 대리인의 서명은 소유자가 계약을 인정하지 않을 위험이 있어, 공증된 위임장부터 확인해야 합니다."
      },
      {
        "trigger": "r1_oa_relative_no_doc",
        "line": "expert|가족이라도 위임장 없이 서명하면 소유자 본인에게 계약 효력을 주장하기 어려울 수 있습니다."
      },
      {
        "trigger": "r1_oa_co_owner_one",
        "line": "expert|핑크북에 적힌 공동 소유자 중 한 명만 서명하면, 나머지 소유자가 계약에 동의하지 않을 위험이 있습니다."
      },
      {
        "trigger": "r1_ta_third_party",
        "line": "expert|소유자가 아닌 사람 명의 계좌로 돈을 보내면, 분쟁이 생겼을 때 소유자에게 지급했다고 증명하기 어려울 수 있습니다."
      },
      {
        "trigger": "r1_ps_price_split",
        "line": "expert|계약서 금액과 실제 금액을 다르게 적으면 세금 문제와 분쟁 시 금액 다툼으로 이어질 수 있어, 서명 전에 검토가 필요합니다."
      },
      {
        "trigger": "r1_ps_lump_sum_first",
        "line": "expert|명의 이전 전에 대금 대부분을 먼저 보내면, 이전이 지연되거나 무산될 때 돌려받기 어려울 수 있습니다."
      },
      {
        "trigger": "r1_fe_landed_house",
        "line": "expert|프로젝트 밖의 개인 주택은 외국인 명의 소유가 제한될 수 있어, 계약 전에 소유 가능 여부부터 확인해야 합니다."
      },
      {
        "trigger": "r1_cu_sublease",
        "line": "expert|다시 빌리는 구조에서는 원래 임대차가 끝나면 함께 나가야 할 수 있어, 건물주 동의 여부를 먼저 확인해야 합니다."
      }
    ],
    "caution": [
      {
        "trigger": "r1_od_copy_only",
        "line": "caution|핑크북 사본만으로는 최근 변동 사항이나 위조 여부를 확인할 수 없어, 서명 전에 원본 대조가 필요합니다."
      },
      {
        "trigger": "r1_od_signer_differs",
        "line": "caution|소유자와 서명할 사람이 다르므로, 서명할 사람의 권한을 증명하는 서류를 먼저 받아야 합니다."
      },
      {
        "trigger": "r1_od_project_no_book",
        "line": "caution|분양 아파트는 개발사가 이 프로젝트를 팔 수 있는 조건을 갖췄는지 사업 서류로 먼저 확인해야 합니다."
      },
      {
        "trigger": "r1_pc_one_sided",
        "line": "caution|위약 조항이 한쪽에만 적용되어 있어, 상대방이 계약을 깨는 경우의 배액 반환 조항을 추가로 확인해야 합니다."
      },
      {
        "trigger": "r1_ta_broker_account",
        "line": "caution|중개인 계좌로 보내는 경우, 소유자가 그 수령을 인정한다는 서면 확인이 함께 필요합니다."
      },
      {
        "trigger": "r1_dp_transfer_only",
        "line": "caution|송금 내역만 있고 서명된 영수증이 없어, 그 돈이 계약금이라는 점을 따로 확인받아 두는 것이 좋습니다."
      },
      {
        "trigger": "r1_rr_refused_or_fee",
        "line": "caution|임시거주 신고가 되지 않으면 비자·체류 관련 절차에 영향을 줄 수 있어, 신고 책임을 계약서에 적어 두는 것이 좋습니다."
      },
      {
        "trigger": "r1_cu_use_restricted",
        "line": "caution|용도 제한이 있는 공간은 회사 주소 등록이나 영업이 어려울 수 있어, 계약 전에 용도를 확인해야 합니다."
      },
      {
        "trigger": "r1_fe_quota_verbal",
        "line": "caution|외국인 구매 가능 물량은 건물마다 한도가 있어, 말로 들은 내용만으로는 명의 등록이 가능한지 알기 어렵습니다."
      },
      {
        "trigger": "r1_br_both_sides",
        "line": "caution|중개인이 양쪽 일을 함께 맡고 있어, 중요한 조건은 상대방에게 직접 서면으로 확인받는 것이 좋습니다."
      },
      {
        "trigger": "r1_dl_terms_open",
        "line": "caution|조건이 정해지지 않은 상태에서 계약금을 걸면, 이후 조건이 맞지 않을 때 계약금 처리를 두고 다툼이 생길 수 있습니다."
      },
      {
        "trigger": "r1_sd_pressure_days",
        "line": "caution|짧은 기한으로 결정을 재촉받고 있어, 핵심 확인 항목을 먼저 정해 두고 진행하는 것이 좋습니다."
      },
      {
        "trigger": "r1_st_deposit_requested",
        "line": "caution|계약서 없이 계약금부터내면, 어떤 조건으로 돈을 보냈는지 증명하기 어려울 수 있습니다."
      }
    ],
    "check": [
      {
        "trigger": "r1_fe_term_unknown",
        "line": "check|외국인 소유 기간과 연장 조건을 서명 전에 확인해 두는 것이 좋습니다."
      },
      {
        "trigger": "r1_cc_scope_diff",
        "line": "check|포함된다고 들은 항목이 계약서에 빠져 있어, 목록으로 추가하는 것이 좋습니다."
      },
      {
        "trigger": "r1_sd_passed",
        "line": "check|약속한 날짜가 지났으므로, 상대방이 계속 진행할 의사가 있는지와 계약금 처리를 먼저 확인해야 합니다."
      }
    ],
    "special": [
      {
        "trigger": "직접 입력 텍스트에 위 내용이 있거나, `sd_passed` + `dp_cash_no_receipt|dp_via_broker` 조합일 때 전문가팀 안내 배너를 함께 표시",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "sd_passed + dp_cash_no_receipt|dp_via_broker",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "sd_passed + dp_cash_no_receipt|dp_via_broker",
        "line": "special|VFBCAI 전문가팀 진행"
      }
    ]
  },
  "RE02": {
    "expert": [
      {
        "trigger": "hd_double_demand",
        "line": "expert|계약금을 받은 쪽이 계약을 진행하지 못한 경우 두 배 반환 주장이 나올 수 있어, 계약서 조항과 진행하지 못한 사정을 함께 검토해야 합니다."
      },
      {
        "trigger": "cf_signer_doubt",
        "line": "expert|실제 소유자가 아닌 사람이 서명했거나 서명이 빠진 계약은 돈을 받은 사람이 누구인지부터 문제가 될 수 있습니다."
      },
      {
        "trigger": "me_none",
        "line": "expert|돈을 주고받은 사실을 확인할 자료가 없어, 상대방이 받은 사실 자체를 부인하면 대응이 어려워질 수 있습니다."
      },
      {
        "trigger": "cp_nothing",
        "line": "expert|돈을 주고받은 사실을 확인할 자료가 없어, 상대방이 받은 사실 자체를 부인하면 대응이 어려워질 수 있습니다."
      },
      {
        "trigger": "bh_still_holding",
        "line": "expert|중개인이 돈을 보관한 채 돌려주지 않거나 연락이 되지 않는 상황이라, 중개인과 상대방 중 누구에게 요구할지 정리가 필요합니다."
      },
      {
        "trigger": "bh_broker_unreachable",
        "line": "expert|중개인이 돈을 보관한 채 돌려주지 않거나 연락이 되지 않는 상황이라, 중개인과 상대방 중 누구에게 요구할지 정리가 필요합니다."
      }
    ],
    "caution": [
      {
        "trigger": "end_me_short_notice",
        "line": "caution|계약서에 정한 사전 통지 기간을 지키지 못한 경우, 상대방이 공제나 위약금을 주장할 여지가 있어 계약서 조항부터 확인해야 합니다."
      },
      {
        "trigger": "end_not_ended",
        "line": "caution|계약이 아직 끝나지 않은 상태라, 지금 돈을 요구하거나 거절하는 방식에 따라 계약 위반 문제로 번질 수 있습니다."
      },
      {
        "trigger": "dt_deposit_forfeited",
        "line": "caution|계약금을 돌려주지 않는 것이 정당한지는 누가 먼저 계약을 지키지 않았는지와 계약금 조항에 따라 달라지므로, 사실관계를 먼저 정리해야 합니다."
      },
      {
        "trigger": "hd_forfeit_dispute",
        "line": "caution|계약금을 돌려주지 않는 것이 정당한지는 누가 먼저 계약을 지키지 않았는지와 계약금 조항에 따라 달라지므로, 사실관계를 먼저 정리해야 합니다."
      },
      {
        "trigger": "dt_extra_claim",
        "line": "caution|보증금을 넘는 추가 금액은 근거 조항과 금액 계산이 맞는지 확인하기 전에 지급하거나 요구하지 않는 것이 안전합니다."
      },
      {
        "trigger": "hd_extra_claim",
        "line": "caution|보증금을 넘는 추가 금액은 근거 조항과 금액 계산이 맞는지 확인하기 전에 지급하거나 요구하지 않는 것이 안전합니다."
      },
      {
        "trigger": "dt_contact_avoided",
        "line": "caution|상대방이 연락을 피하고 있어, 말로 하는 요구보다 기록이 남는 방법으로 요구한 사실을 남겨 두는 것이 중요합니다."
      },
      {
        "trigger": "hd_contact_lost",
        "line": "caution|상대방이 연락을 피하고 있어, 말로 하는 요구보다 기록이 남는 방법으로 요구한 사실을 남겨 두는 것이 중요합니다."
      },
      {
        "trigger": "rx_ignored",
        "line": "caution|상대방이 연락을 피하고 있어, 말로 하는 요구보다 기록이 남는 방법으로 요구한 사실을 남겨 두는 것이 중요합니다."
      },
      {
        "trigger": "fc_no_clause",
        "line": "caution|계약서에 계약금 처리 기준이 없거나 한쪽만 적혀 있어, 현지 관행만으로 결과를 예측하기 어렵습니다."
      },
      {
        "trigger": "fc_one_side",
        "line": "caution|계약서에 계약금 처리 기준이 없거나 한쪽만 적혀 있어, 현지 관행만으로 결과를 예측하기 어렵습니다."
      },
      {
        "trigger": "me_cash_message",
        "line": "caution|현금으로 주고받은 돈은 상대방이 받았다고 인정한 기록이 핵심이므로, 남아 있는 메시지를 지우지 말고 보관해야 합니다."
      },
      {
        "trigger": "cp_withdrawal_only",
        "line": "caution|현금으로 주고받은 돈은 상대방이 받았다고 인정한 기록이 핵심이므로, 남아 있는 메시지를 지우지 말고 보관해야 합니다."
      },
      {
        "trigger": "ho_no_record",
        "line": "caution|집을 비울 때의 상태 기록이 없어, 손상 책임을 두고 서로 주장이 엇갈릴 가능성이 큽니다."
      },
      {
        "trigger": "ho_move_in_only",
        "line": "caution|집을 비울 때의 상태 기록이 없어, 손상 책임을 두고 서로 주장이 엇갈릴 가능성이 큽니다."
      },
      {
        "trigger": "pp_via_broker + + bh_delivered_word",
        "line": "caution|중개인이 상대방에게 돈을 전달했는지 기록으로 확인되지 않아, 돈이 실제로 어디에 있는지부터 확인해야 합니다."
      },
      {
        "trigger": "rx_counter_claim",
        "line": "caution|요구한 뒤 상대방이 오히려 돈을 더 요구하고 있어, 상대방 주장의 근거를 받아 본 뒤 대응 순서를 정해야 합니다."
      },
      {
        "trigger": "dl_other_demand",
        "line": "caution|기한이 가까운 상태라, 기한 전에 기록이 남는 방법으로 입장을 전달해 두는 것이 안전합니다."
      },
      {
        "trigger": "dl_my_schedule",
        "line": "caution|기한이 가까운 상태라, 기한 전에 기록이 남는 방법으로 입장을 전달해 두는 것이 안전합니다."
      }
    ],
    "check": [
      {
        "trigger": "ded_no_itemization",
        "line": "check|공제나 추가 금액에 항목별 근거가 없어, 금액을 인정하기 전에 내역과 영수증을 먼저 요구해야 합니다."
      },
      {
        "trigger": "xc_unclear_basis",
        "line": "check|공제나 추가 금액에 항목별 근거가 없어, 금액을 인정하기 전에 내역과 영수증을 먼저 요구해야 합니다."
      },
      {
        "trigger": "fc_cannot_read",
        "line": "check|베트남어 계약 내용을 정확히 이해하지 못한 상태라, 핵심 조항을 번역해 확인한 뒤 대응해야 합니다."
      },
      {
        "trigger": "cf_vn_only",
        "line": "check|베트남어 계약 내용을 정확히 이해하지 못한 상태라, 핵심 조항을 번역해 확인한 뒤 대응해야 합니다."
      },
      {
        "trigger": "ho_not_handed",
        "line": "check|집을 넘겨준 날짜가 정리되지 않으면 반환 기한과 밀린 임대료 계산이 모두 달라질 수 있습니다."
      },
      {
        "trigger": "pp_unclear",
        "line": "check|실제로 돈을 받은 사람이 계약 상대방 본인인지 확실하지 않아, 누구에게 반환을 요구할지부터 확인해야 합니다."
      },
      {
        "trigger": "pp_agent_other_side",
        "line": "check|실제로 돈을 받은 사람이 계약 상대방 본인인지 확실하지 않아, 누구에게 반환을 요구할지부터 확인해야 합니다."
      },
      {
        "trigger": "sm_mismatch",
        "line": "check|상대방 주장과 실제 사정이 다르거나 비교할 기록이 부족해, 날짜별 사실관계를 먼저 정리해야 합니다."
      },
      {
        "trigger": "sm_hard_to_judge",
        "line": "check|상대방 주장과 실제 사정이 다르거나 비교할 기록이 부족해, 날짜별 사실관계를 먼저 정리해야 합니다."
      }
    ],
    "special": [
      {
        "trigger": "role_company_occupant + pp_agent_my_side",
        "line": "special|VFBCAI 전문가팀 진행"
      }
    ]
  },
  "RE03": {
    "expert": [],
    "caution": [
      {
        "trigger": "r3_np_shorter",
        "line": "caution|통보에서 준 기간이 계약서 조항보다 짧아 보여, 그 날짜를 그대로 따라야 하는지 확인이 필요합니다."
      },
      {
        "trigger": "r3_md_immediate",
        "line": "caution|날짜 없이 바로 나가라는 통보여서, 계약서와 법에서 정한 통지 기간을 먼저 확인해야 합니다."
      },
      {
        "trigger": "r3_ds_forfeit",
        "line": "caution|보증금을 전혀 돌려주지 않겠다는 이야기가 나온 상태여서, 계약서의 몰수 조항과 실제 위반 여부를 함께 확인해야 합니다."
      },
      {
        "trigger": "r3_ds_deduct_no_list",
        "line": "caution|공제 내역 없이 보증금 일부를 빼겠다고 해, 항목과 금액을 서면으로 받아 두는 것이 좋습니다."
      },
      {
        "trigger": "r3_pc_amount_exceeds",
        "line": "caution|요구 금액이 계약서 위약금 조항보다 큰 것으로 보여, 금액 계산 근거를 확인해야 합니다."
      },
      {
        "trigger": "r3_pc_no_clause",
        "line": "caution|계약서에 위약금 조항이 없는데 금액을 요구받아, 그 금액의 근거를 확인해야 합니다."
      },
      {
        "trigger": "r3_pc_damage_claim",
        "line": "caution|위약금 외에 손해배상까지 요구받아, 항목별로 실제 손해가 있는지 나누어 확인해야 합니다."
      },
      {
        "trigger": "r3_ar_paid_not_counted",
        "line": "caution|이미 보낸 임대료가 반영되지 않은 상태여서, 송금 내역으로 사실관계를 먼저 정리해야 합니다."
      },
      {
        "trigger": "r3_cd_admit_ongoing",
        "line": "caution|문제가 된 사용 방식이 지금도 이어지고 있어, 통보 내용이 그대로 인정될 가능성을 함께 봐야 합니다."
      },
      {
        "trigger": "r3_role_company_staff",
        "line": "caution|계약 당사자가 회사여서, 회사가 상대방에게 어떻게 대응하고 있는지부터 확인해야 합니다."
      },
      {
        "trigger": "r3_dm_terminate",
        "line": "caution|계약 해지 통보를 받았으므로, 통지 기간과 퇴거 시점을 계약서와 대조해야 합니다."
      },
      {
        "trigger": "r3_dm_money_claim",
        "line": "caution|위약금·손해배상 요구를 받았으므로, 계약서 조항과 금액 근거를 확인해야 합니다."
      },
      {
        "trigger": "r3_dm_vacate_date",
        "line": "caution|날짜가 정해진 퇴거 통보를 받았으므로, 그 시점과 계약 조항을 함께 확인해야 합니다."
      }
    ],
    "check": [],
    "special": [
      {
        "trigger": "r3_oc_locked_out, r3_oc_belongings_threat",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "r3_cr_legal_threat",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "r3_ow_bank_issue",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "r3_role_subtenant + (r3_dm_terminate\\",
        "line": "special|VFBCAI 전문가팀 진행"
      }
    ]
  },
  "RE04": {
    "expert": [
      {
        "trigger": "re04_contract_access = ca_sublease",
        "line": "expert|집주인과 직접 계약하지 않은 재임대 관계라, 누구에게 책임을 물을 수 있는지 먼저 정리해야 합니다."
      },
      {
        "trigger": "re04_fee_detail = fd_prior_arrears",
        "line": "expert|전기·수도가 끊기면 생활이 바로 막히므로, 끊기기 전에 대응 순서를 정해야 합니다."
      },
      {
        "trigger": "re04_threat_detail = td_cut_utilities",
        "line": "expert|전기·수도가 끊기면 생활이 바로 막히므로, 끊기기 전에 대응 순서를 정해야 합니다."
      },
      {
        "trigger": "re04_rent_status = rs_withholding",
        "line": "expert|계약 근거나 합의 없이 월세를 멈추거나 빼면, 상대방이 연체를 이유로 계약 해지나 보증금 공제를 주장할 수 있습니다."
      },
      {
        "trigger": "rs_deducted_cost",
        "line": "expert|계약 근거나 합의 없이 월세를 멈추거나 빼면, 상대방이 연체를 이유로 계약 해지나 보증금 공제를 주장할 수 있습니다."
      },
      {
        "trigger": "re04_withhold_notice = wn_not_notified",
        "line": "expert|월세를 덜 보낸 이유가 기록으로 남아 있지 않아, 단순 연체로 받아들여질 수 있습니다."
      },
      {
        "trigger": "wn_landlord_objected",
        "line": "expert|월세를 덜 보낸 이유가 기록으로 남아 있지 않아, 단순 연체로 받아들여질 수 있습니다."
      },
      {
        "trigger": "re04_threat_detail = td_vacate_early",
        "line": "expert|계약 기간 중 집을 비우라는 요구는 계약서의 해지 조항과 함께 확인해야 하며, 날짜 전에 대응해야 합니다."
      },
      {
        "trigger": "re04_deadline = dl_vacate_demand",
        "line": "expert|계약 기간 중 집을 비우라는 요구는 계약서의 해지 조항과 함께 확인해야 하며, 날짜 전에 대응해야 합니다."
      },
      {
        "trigger": "re04_threat_detail = td_residence_registration",
        "line": "expert|임시거주 신고는 체류와 연결되므로, 상대방이 신고를 거부하거나 정리하기 전에 확인이 필요합니다."
      }
    ],
    "caution": [
      {
        "trigger": "re04_since_when = sw_over_month",
        "line": "caution|문제가 오래 이어지거나 반복되고 있어, 손상과 비용이 더 커지기 전에 요청 기록을 정리해야 합니다."
      },
      {
        "trigger": "sw_recurring",
        "line": "caution|문제가 오래 이어지거나 반복되고 있어, 손상과 비용이 더 커지기 전에 요청 기록을 정리해야 합니다."
      },
      {
        "trigger": "re04_repair_detail = rd_electric_fault",
        "line": "caution|전기·문단속 문제는 안전과 직결되므로, 수리 책임을 따지기 전에 위험부터 막을 방법을 확인해야 합니다."
      },
      {
        "trigger": "rd_door_window",
        "line": "caution|전기·문단속 문제는 안전과 직결되므로, 수리 책임을 따지기 전에 위험부터 막을 방법을 확인해야 합니다."
      },
      {
        "trigger": "re04_defect_claim = dc_deposit_deduction",
        "line": "caution|상대방이 이미 보증금 공제를 예고해, 계약 종료 전에 하자 책임을 정리하지 않으면 정산 때 다툼이 커질 수 있습니다."
      },
      {
        "trigger": "re04_handover_record = hr_told_verbally",
        "line": "caution|입주 당시 상태 기록이 없어, 기존 하자였다는 점을 다른 자료로 보완해야 합니다."
      },
      {
        "trigger": "hr_no_record",
        "line": "caution|입주 당시 상태 기록이 없어, 기존 하자였다는 점을 다른 자료로 보완해야 합니다."
      },
      {
        "trigger": "re04_contract_access = ca_verbal_only",
        "line": "caution|계약 내용을 서면으로 확인할 수 없어, 메시지와 송금 내역으로 계약 조건을 다시 정리해야 합니다."
      },
      {
        "trigger": "ca_no_copy",
        "line": "caution|계약 내용을 서면으로 확인할 수 없어, 메시지와 송금 내역으로 계약 조건을 다시 정리해야 합니다."
      },
      {
        "trigger": "re04_self_repair = sr_paid_no_receipt",
        "line": "caution|영수증이나 사전 동의가 없는 수리비는 정산을 요구할 때 근거가 약해질 수 있습니다."
      },
      {
        "trigger": "sr_paid_no_consent",
        "line": "caution|영수증이나 사전 동의가 없는 수리비는 정산을 요구할 때 근거가 약해질 수 있습니다."
      },
      {
        "trigger": "re04_rent_status = rs_considering_withhold",
        "line": "caution|월세를 멈추기 전에, 계약서와 요청 기록으로 정산 방법을 먼저 확인하는 것이 안전합니다."
      },
      {
        "trigger": "re04_other_response = or_counter_threat",
        "line": "caution|상대방이 계약 해지나 보증금을 언급하고 있어, 대응 문장과 순서를 신중하게 정해야 합니다."
      },
      {
        "trigger": "re04_entry_detail = ed_entered_absent",
        "line": "caution|동의 없는 출입이나 장치 설치가 반복되면, 날짜별 기록을 남기고 출입 규칙을 서면으로 정해야 합니다."
      },
      {
        "trigger": "ed_unilateral_device",
        "line": "caution|동의 없는 출입이나 장치 설치가 반복되면, 날짜별 기록을 남기고 출입 규칙을 서면으로 정해야 합니다."
      },
      {
        "trigger": "re04_living_impact = li_staying_elsewhere",
        "line": "caution|집을 떠나 있는 동안의 월세와 비용 부담은 계약 정리 방법과 함께 확인해야 합니다."
      },
      {
        "trigger": "re04_fact_compare = fc_false_no_proof",
        "line": "caution|상대방 주장과 다르다는 점을 보여 줄 자료가 부족해, 지금 남길 수 있는 기록부터 확보해야 합니다."
      },
      {
        "trigger": "re04_evidence = ev_none",
        "line": "caution|상대방 주장과 다르다는 점을 보여 줄 자료가 부족해, 지금 남길 수 있는 기록부터 확보해야 합니다."
      }
    ],
    "check": [
      {
        "trigger": "re04_notify_status = nt_verbal_only",
        "line": "check|지금까지 말로만 알려, 언제 무엇을 요청했는지 보여 줄 기록이 없습니다."
      },
      {
        "trigger": "re04_notify_status = nt_via_agent",
        "line": "check|중개인이나 관리사무소를 거친 요청은 상대방에게 실제로 전달되었는지 확인되지 않습니다."
      },
      {
        "trigger": "re04_other_response = or_silent_or_relay",
        "line": "check|중개인이나 관리사무소를 거친 요청은 상대방에게 실제로 전달되었는지 확인되지 않습니다."
      },
      {
        "trigger": "re04_contract_clause = cl_tenant_clear",
        "line": "check|계약서에 임차인 부담으로 적혀 있어, 해당 조항이 이번 문제에 그대로 적용되는지 확인이 필요합니다."
      },
      {
        "trigger": "re04_fee_detail = fd_electric_rate",
        "line": "check|청구된 단가나 인상분이 계약서 기준과 맞는지, 근거 자료로 비교해 봐야 합니다."
      },
      {
        "trigger": "fd_unilateral_increase",
        "line": "check|청구된 단가나 인상분이 계약서 기준과 맞는지, 근거 자료로 비교해 봐야 합니다."
      },
      {
        "trigger": "re04_living_impact = li_belongings_damaged",
        "line": "check|제 물건의 손상은 수리 책임과 별도로 금액과 사진을 정리해 두어야 합니다."
      }
    ],
    "special": []
  },
  "RE05": {
    "expert": [
      {
        "trigger": "r5_cp_owner_unclear",
        "line": "expert|실제 권리자가 확인되지 않으면, 이미 맺은 계약으로 명의 이전이 진행되지 않을 수 있습니다."
      },
      {
        "trigger": "mg_paid_not_released",
        "line": "expert|담보를 풀 돈을 지급했는데 해제가 확인되지 않으면, 그 돈의 사용처부터 확인해야 합니다."
      },
      {
        "trigger": "mm_owner_name",
        "line": "expert|핑크북 소유자가 계약 상대와 다르면, 그 사람의 동의 없이 맺은 계약은 명의 이전이 진행되지 않을 수 있습니다."
      },
      {
        "trigger": "mm_forgery_suspect",
        "line": "expert|핑크북이 진짜가 아닐 가능성이 있다면, 추가 지급을 멈추고 토지등록사무소 기록부터 확인해야 합니다."
      },
      {
        "trigger": "nm_buyer_vn_name",
        "line": "expert|다른 사람 이름으로 등록한 집은, 그 사람이 권리를 주장할 때 돌려받기 어려울 수 있습니다."
      },
      {
        "trigger": "fe_nominee",
        "line": "expert|다른 사람 이름으로 등록한 집은, 그 사람이 권리를 주장할 때 돌려받기 어려울 수 있습니다."
      },
      {
        "trigger": "rj_seller_side",
        "line": "expert|매도인 쪽의 압류·분쟁 기록은 매수인이 혼자 풀 수 없는 문제일 수 있습니다."
      },
      {
        "trigger": "ex_other_dispute",
        "line": "expert|상속·이혼·채무 분쟁은 여러 당사자가 얽혀, 매매 계약만으로 해결되지 않을 수 있습니다."
      },
      {
        "trigger": "rr_cancel_mentioned",
        "line": "expert|상대방이 계약 해제를 먼저 꺼낸 경우, 계약금 몰수나 배액 반환 조항을 확인한 뒤 답해야 합니다."
      }
    ],
    "caution": [
      {
        "trigger": "r5_paid_via_broker",
        "line": "caution|매도인이 아닌 사람에게 보낸 돈은, 실제로 매도인에게 전달되었는지 따로 확인해야 합니다."
      },
      {
        "trigger": "r5_cp_broker_only",
        "line": "caution|매도인을 직접 확인하지 않은 거래는, 계약 상대가 실제 권리자인지부터 확인해야 합니다."
      },
      {
        "trigger": "td_mortgage",
        "line": "caution|은행 담보가 풀리지 않으면 명의 이전 신청 자체가 받아들여지지 않을 수 있습니다."
      },
      {
        "trigger": "mg_release_unclear",
        "line": "caution|은행 담보가 풀리지 않으면 명의 이전 신청 자체가 받아들여지지 않을 수 있습니다."
      },
      {
        "trigger": "pb_project_mortgage",
        "line": "caution|프로젝트 전체의 담보나 법적 절차 문제는 개별 매수인이 앞당기기 어려워, 발급이 길어질 수 있습니다."
      },
      {
        "trigger": "pb_project_legal",
        "line": "caution|프로젝트 전체의 담보나 법적 절차 문제는 개별 매수인이 앞당기기 어려워, 발급이 길어질 수 있습니다."
      },
      {
        "trigger": "nm_family_coowner",
        "line": "caution|핑크북의 공동 소유자 전원이 동의하지 않으면, 명의 이전이 진행되지 않을 수 있습니다."
      },
      {
        "trigger": "nm_proxy",
        "line": "caution|대리인과 맺은 계약은 위임장이 공증되었는지, 매매 권한이 포함되었는지 확인해야 합니다."
      },
      {
        "trigger": "nm_not_seen",
        "line": "caution|핑크북을 직접 보지 못한 상태라면, 누구의 권리인지부터 확인해야 합니다."
      },
      {
        "trigger": "fe_land_house",
        "line": "caution|외국인은 집의 종류와 위치에 따라 소유가 제한될 수 있어, 거래 전 조건 확인이 필요합니다."
      },
      {
        "trigger": "rj_foreign_status",
        "line": "caution|외국인은 집의 종류와 위치에 따라 소유가 제한될 수 있어, 거래 전 조건 확인이 필요합니다."
      },
      {
        "trigger": "fe_quota_full",
        "line": "caution|외국인 소유 물량이 찬 건물이라면, 계약을 해도 외국인 명의로 핑크북을 받지 못할 수 있습니다."
      },
      {
        "trigger": "pd_postponed",
        "line": "caution|약속한 날짜가 지난 경우, 계약서의 지연 조항과 해제 조건을 확인해야 합니다."
      },
      {
        "trigger": "pd_written_passed",
        "line": "caution|약속한 날짜가 지난 경우, 계약서의 지연 조항과 해제 조건을 확인해야 합니다."
      },
      {
        "trigger": "ex_extra_cost",
        "line": "caution|계약에 없던 비용 요구는, 명목과 영수증을 서면으로 받은 뒤에 판단해야 합니다."
      },
      {
        "trigger": "rr_more_money",
        "line": "caution|계약에 없던 비용 요구는, 명목과 영수증을 서면으로 받은 뒤에 판단해야 합니다."
      },
      {
        "trigger": "ex_no_explanation",
        "line": "caution|상대방이 연락을 피하면, 그동안의 지급 내역과 연락 기록을 먼저 정리해 두어야 합니다."
      },
      {
        "trigger": "rr_no_contact",
        "line": "caution|상대방이 연락을 피하면, 그동안의 지급 내역과 연락 기록을 먼저 정리해 두어야 합니다."
      },
      {
        "trigger": "cf_deposit_only",
        "line": "caution|공증받은 매매계약서가 없으면, 명의 이전 신청에 쓸 수 있는 계약이 아직 없는 상태일 수 있습니다."
      },
      {
        "trigger": "cf_informal_only",
        "line": "caution|공증받은 매매계약서가 없으면, 명의 이전 신청에 쓸 수 있는 계약이 아직 없는 상태일 수 있습니다."
      },
      {
        "trigger": "dl_notice_period",
        "line": "caution|통지서에 적힌 기간이 지나면 다시 신청해야 할 수 있어, 날짜부터 확인해야 합니다."
      },
      {
        "trigger": "r5_registration_rejected",
        "line": "caution|토지등록사무소에서 신청이 받아들여지지 않았다면, 통지 내용과 재신청 기한을 먼저 확인해야 합니다."
      },
      {
        "trigger": "r5_book_mismatch",
        "line": "caution|핑크북 내용이 계약이나 실제 집과 다르면, 어느 쪽을 기준으로 바로잡을지 먼저 정해야 합니다."
      },
      {
        "trigger": "r5_paid_balance",
        "line": "caution|잔금까지 지급한 뒤에도 권리가 넘어오지 않아, 남은 협상 수단이 적은 상태일 수 있습니다."
      }
    ],
    "check": [
      {
        "trigger": "r5_cp_resale_buyer",
        "line": "check|분양 계약을 넘겨받은 경우, 분양 회사가 그 이전을 인정했는지에 따라 핑크북 발급 대상이 달라질 수 있습니다."
      },
      {
        "trigger": "mg_unknown",
        "line": "check|은행 담보 여부는 핑크북 뒷면 기재란이나 토지등록사무소에서 먼저 확인해야 합니다."
      },
      {
        "trigger": "td_stage_unknown",
        "line": "check|신청 접수 여부와 처리 단계를 확인할 근거(접수증)가 필요합니다."
      },
      {
        "trigger": "td_filed_waiting",
        "line": "check|신청 접수 여부와 처리 단계를 확인할 근거(접수증)가 필요합니다."
      },
      {
        "trigger": "td_tax_stage",
        "line": "check|세금을 누가 납부하는지는 계약서 조항에 따라 달라지므로, 계약서 내용과 먼저 대조해야 합니다."
      },
      {
        "trigger": "ex_tax_demand",
        "line": "check|세금을 누가 납부하는지는 계약서 조항에 따라 달라지므로, 계약서 내용과 먼저 대조해야 합니다."
      },
      {
        "trigger": "pb_applied_no_proof",
        "line": "check|신청했다는 말만 있고 접수 근거가 없으면, 실제 신청 여부를 따로 확인해야 합니다."
      },
      {
        "trigger": "hc_area_diff",
        "line": "check|실제 면적이 계약과 다르면, 핑크북 발급 전에 금액 정산 기준을 계약서로 확인해야 합니다."
      },
      {
        "trigger": "mm_area",
        "line": "check|핑크북 내용이 계약과 다르면, 어느 쪽을 기준으로 바로잡을지 먼저 정해야 합니다."
      },
      {
        "trigger": "mm_address_use",
        "line": "check|핑크북 내용이 계약과 다르면, 어느 쪽을 기준으로 바로잡을지 먼저 정해야 합니다."
      },
      {
        "trigger": "cf_notarized_vn_only",
        "line": "check|공증 계약서의 명의 이전 기한·세금 부담·해제 조항을 번역해 확인해야 합니다."
      },
      {
        "trigger": "bk_money_decision",
        "line": "check|남은 돈의 지급 여부는 계약서의 지급 조건과 권리 서류 상태를 함께 보고 정해야 합니다."
      },
      {
        "trigger": "ev_none",
        "line": "check|지급 내역과 계약서가 없으면, 지급한 돈과 약속 내용을 증명하기 어려울 수 있습니다."
      }
    ],
    "special": [
      {
        "trigger": "이유",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "위조 의심은 형사 문제로 이어질 수 있고, 기관 기록 대조가 필요함",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "압류·분쟁 기록은 매도인과 제3자(은행·채권자·법원)가 얽힌 문제",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "상속·이혼·채무 분쟁은 다수 당사자 사건",
        "line": "special|VFBCAI 전문가팀 진행"
      },
      {
        "trigger": "이미 분쟁 절차가 진행 중인 사건",
        "line": "special|VFBCAI 전문가팀 진행"
      }
    ]
  }
};
