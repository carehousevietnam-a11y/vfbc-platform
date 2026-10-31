[홈텍스(내부 코드명) — VFBCAI 기업회원 세무·회계(기장) 모듈 구현 설계서 v2 (2026-10-16)]
역할: 설계·검토=Claude / 구현·테스트=Cursor / 승인=Ace.
첫 작업: 이 문서를 docs/master/ACCOUNTING_MODULE_DESIGN.md 로 저장하고, 이후 이 파일을 유일한 기준으로 삼는다.
■ 0. 목적
베트남에 새로 진출한 소규모 한국인 사업자(또는 그가 시킨 베트남 직원)가 영수증·인보이스·급여를 한국어 또는 베트남어로 그때그때 입력하면, 베트남 정식 서식으로 장부가 자동 생성되고, 분기 신고 때 신고서 초안이 만들어져 VNK 전문가가 검토 후 공식 포털에서 제출한다. UX는 한국 홈택스를 따르고, 서식은 베트남 세무국 서식을 따른다.
명칭 규칙: "홈텍스"는 내부 코드명이다. 고객에게 보이는 이름, 국세청 로고·문구·이미지, 국세청 서비스로 오해될 표현은 쓰지 않는다.
서식 2층 구조: 1층=정부가 번호·항목을 정한 서식(form_class=government). 지표 번호·순서를 변경하지 않으며 Form Verification Pack이 있는 서식만 활성화한다. 2층=정부가 서식을 정하지 않아 회사마다 다르게 작성해 제출하는 문서를 VIET-TAX가 표준화한 서식(form_class=standardized). 근거 법령이 요구하는 필수 내용을 포함하고 배치·문구만 표준화한다. 정부 서식 번호·명칭을 쓰지 않고 'VIET-TAX 표준 서식 · 정부가 정한 서식 아님'으로 표기한다. 법적 효력은 내용과 서명에 있으므로 vnk_expert 검토와 company_owner 확정을 거치고 베트남어 확정본만 제출 대상으로 한다.
■ 1. 범위
포함: 거래 입력(매출 인보이스, 매입 인보이스, 경비 영수증, 급여) / 증빙 첨부 / 장부 자동 생성 / 신고서 초안 3종(부가가치세, 법인세, 소득세-급여 원천징수) / 전문가 검토·정정 / 베트남어 정식 서식 PDF·Excel보내기 / 감사 로그 / 한국어·베트남어 이중 언어(§11).
제외(이번 주): 결제, 알림, 정부 포털 자동 전송·자동 신고 연동, 전자세금계산서 연동, OCR 자동 추출, 자산·재고 거래, 세무 조언·진단. 면허세(môn bài)는 2026-01-01 폐지되어 제외.
거래처별 매출·매입 인보이스 목록은 2015-01-01 이후 신고서 첨부 제출 대상이 아니며(2차 출처), 내부 대사용으로만 만든다. 신고 제출 경로는 HTKK에서 작성 → XML보내기 → 포털 전자서명 후 제출이며(엑셀 제출 불가, 2차 출처) 시스템은 포털에 전송하지 않는다.
금지: 기존 완료·잠금 자산(Admin MASTER, 행정문서 마스터, 세금 Clean Build, 가입, 마이페이지 확정분) 수정. import·재사용만 한다. 과거·레거시 자산은 가져오지 않는다. 기존 다른 화면은 이중 언어로 바꾸지 않는다.
■ 2. 위치와 흐름 (2026-10-23 Ace 방향)
- 기업회원 > VIET TAX(세무·회계). 세무·회계 모듈은 긴 질문·결과 리포트 퍼널을 보여 주지 않는다. 분쟁·개별 상담은 개인화(마이페이지)와 그쪽 절차에서 처리한다.
- 가입 직후: 간단한 질문 3개만 받은 뒤, 한국 홈택스처럼 바로 신고서 작성·검토 화면(§5 세금 신고·거래 입력)에서 입력·사용한다. 법인명·세금코드는 가입·조직 정보에서 자동 채우고 다시 묻지 않는다(NEVER ASK AGAIN).
- 온보딩 질문 3개(선택지 각 5개 이하 + 직접 입력, 문구는 Content Pack 슬롯): ① 하려는 신고(부가가치세 / 법인세 결산 / 인보이스 정리 / 기타) ② 기간(월·분기·연도) ③ 베트남어 이해 방식(직접 읽음 / 통역 / 번역기 / 거의 못함 등).
- 기장 작업공간(§5)은 회원 전용 신규 모듈이다. CHECK·VERIFY식 진단 퍼널 코드와 섞지 않는다(Clean Build 원칙). 결제 화면으로 바로 보내지 않는다(결제는 별도 후속 미션).
- [보류·코드 유지·오픈 스위치 false] 이전 설계의 3개 진입점 퍼널(부가가치세 신고 확인 / 인보이스 처리 확인 / 법인세 결산 점검): 2단계 질문·1차 결과·Content Pack 슬롯 연결. 저장소에 구현은 남기지만 고객에게는 노출하지 않는다(릴리스/오픈 스위치 false). 신규 온보딩(위 3문) + 작업공간 직행이 유일한 오픈 경로다.
- 질문·선택지 문구는 ChatGPT가 작성한 Content Pack을 받아 채운다. 구현자는 구조·타입·빈 슬롯만 만들고 문구를 직접 쓰지 않는다.
■ 3. 역할
company_owner(대표) / company_member(입력 담당, 한국인 또는 베트남인) / vnk_expert(VNK 전문가) / vnk_admin(서식·법령·용어 관리).
최종 확정과 정정 승인은 company_owner만 한다. vnk_expert는 코멘트와 정정 요청만 하고 원본 값을 덮어쓰지 못한다. "베트남어 확정"은 베트남어 사용자(company_member, locale=vi) 또는 vnk_expert만 한다.
■ 4. 데이터 모델 (Supabase/Postgres, 모든 테이블 org_id + RLS)
profiles(user_id, locale[ko|vi])   // 사용자별 언어, 조직 설정이 아님
organizations(name_official(베트남어 등록명), name_ko_display(선택), tax_code, fiscal_year_start, vat_period[month|quarter], accounting_regime[TT99|TT133 — 미검증 설정값], currency='VND')
org_members(org_id, user_id, role)
counterparties(org_id, name_original, name_reading(선택 음역), tax_code, kind[customer|supplier])
transactions(org_id, type[sale|purchase|expense|payroll], status[draft|submitted|confirmed|cancelled], txn_date, period_key, counterparty_id, invoice_series, invoice_no, invoice_date, currency, fx_rate, amount_vnd, corrects_txn_id, created_by, confirmed_by, confirmed_at)   // 메모는 i18n_texts(entity_type='transaction', field='memo')
transaction_lines(txn_id, amount_net, vat_rate, vat_amount)   // 품목 설명은 i18n_texts(field='description')
evidence_files(org_id, txn_id, storage_path, sha256, mime, size, uploaded_by, uploaded_at)   // 비공개 버킷
i18n_texts(id, org_id, entity_type, entity_id, field, lang[ko|vi], text, status[original|machine|human_verified], version, translated_from_version, created_by, created_at)   // insert-only
term_glossary(ko, vi, context, verified_status, effective_from)
chart_of_accounts(code, name_vi, name_ko, regime, effective_from, legal_source, verified_status)
posting_rules(txn_type, condition, debit_code, credit_code, effective_from, legal_source, verified_status)   // 코드가 아니라 데이터
ledger_entries(org_id, txn_id, period_key, entry_date, account_code, debit, credit, posting_rule_id, form_version_id)   // insert-only. 적요(description_vi)는 i18n_texts 현재값을 참조
form_versions(form_code, name_vi, name_ko, form_class[government|standardized], legal_basis, effective_from, effective_to, status[pending_verification|active|retired|blocked], field_map jsonb, template_path)
declarations(org_id, form_code, form_version_id, period_key, status[not_started|drafting|expert_review|ready|filed_manual|amended], computed jsonb, due_date, filed_at, filed_by, filing_receipt_path)
review_comments(org_id, target_type, target_id, author_id, status[open|resolved])   // 본문은 i18n_texts
exports(org_id, kind, form_version_id, period_key, file_path, sha256, i18n_version_list, created_by, created_at)
legal_reviews(review_month, reviewer, result, follow_up, affected_form_version_ids)
audit_log(actor, action, entity, entity_id, before_hash, after_hash, at)   // 트리거로 자동 기록, insert-only
deadline_rules(tax_type, period_kind, rule, legal_source, verified_status)
불변 규칙:
- confirmed 거래의 숫자·코드·원문은 UPDATE/DELETE 금지(RLS+트리거). 정정은 corrects_txn_id를 가진 새 거래 + 역분개 ledger_entries로만 한다. 반대 언어 번역은 새 version으로 추가할 수 있다.
- 정정 방식(적색 역분개 / 추가 기재 등)은 검증된 규칙에 따라 correction_method 설정값으로 분기한다. 모든 경우를 "취소 후 재입력"으로 고정하지 않는다.
- declarations.status가 filed_manual이면 해당 기간을 잠근다. 변경은 amended 절차로만 한다.
- 거래 1건의 ledger_entries는 차변합=대변합이어야 확정된다.
- form_class=government: Form Verification Pack이 없으면 기능 플래그 OFF. form_class=standardized: legal_basis(요구 내용의 근거 법령)가 검증되기 전에는 verified_status='unverified'로 두고 초안 생성까지만 허용하며 제출 의뢰 기능은 OFF.
■ 5. 홈텍스식 UX (구조·용어·동작은 한국 홈택스, 겉모양은 Admin MASTER 유지)
고객 문구는 "~합니다", "부가가치세"로 표기한다(VAT는 내부 코드·공식 서식명에만).
5-1 상단 메뉴: 홈 | 거래 입력 | 장부 조회 | 세금 신고 | 신고 결과·접수증 | 증빙·서류 | 내 회사 정보. 모바일은 하단 탭 4개(홈, 거래 입력, 세금 신고, 더보기).
5-2 홈: 신고 일정 카드(기한순, D-day, 상태, 다음 할 일 버튼 1개) / 진행 중인 신고 / 미확정 거래·증빙 누락 알림 / 최근 거래 5건.
5-3 세금 신고: 하위 메뉴 부가가치세 / 법인세 / 원천세(급여 소득세). 신고 구분: 정기신고 / 수정신고(amended, 베트남 khai bổ sung와 연결). 상단 단계바: ①기본정보(회사·기간·신고 구분) → ②매출 → ③매입 → ④세액 계산 → ⑤신고 전 점검 → ⑥전문가 검토 요청(법인세·원천세는 단계명만 해당 항목에 맞게 바꾼다). 공통 동작: 임시저장 / 불러오기 / 미리보기 / 이전·다음 버튼(하단 고정) / 필수 항목 * / 금액 우측 정렬·천 단위 구분·단위(VND) / 자동 합계 / 숫자는 읽기 전용이며 수정은 원본 거래에서만. 신고 전 점검(홈택스 전산검증에 해당): 오류·경고 목록을 양호/중간/경고 기존 위험도 색으로 표시하고 항목을 누르면 해당 거래로 이동. 서식 표시: 각 항목에 한국어 라벨과 베트남어 서식 항목 번호·명칭 병기(번호는 검증된 Form Verification Pack에서만). "제출"은 "전문가 검토 요청 → 제출 의뢰"로 표기하고 시스템은 정부 포털에 전송하지 않는다.
5-4 신고 결과·접수증: 기간·신고서 종류 조건 검색 → 목록 → 상세. 상태: 작성 중 / 검토 중 / 제출 완료(VNK가 수동 기록) / 수정신고. 접수증 파일 표시·다운로드. 엑셀·PDF 다운로드.
5-5 거래 입력·장부 조회·증빙: 거래 입력은 유형 4종 탭, 영수증 촬영·첨부, 초안 저장, 확정 전 점검. 장부 조회는 기간·계정·거래처 조건 검색 → 목록 → 상세, 엑셀 다운, 정정 이력은 원본과 나란히. 증빙은 거래 연결 상태(연결됨/누락) 필터, 비공개 저장.
5-6 도움말: 각 화면 우측 패널(모바일은 접힘). 그 단계 설명, 근거 법령(실제 사용한 출처만 [1]부터 번호). 어려운 용어는 한국어+베트남어 병기.
5-7 접근성: 글자 크기 3단계, 충분한 대비, 입력 오류는 해당 칸 옆 한 줄.
5-8 겉모양: Admin MASTER와 동일한 글꼴·색·로고·여백. 색은 절제하고 위험도·상태 색은 기존 그대로.
5-9 쉬움 원칙: 사용자는 한국 홈택스처럼 직관적으로 쓸 수 있어야 하며, 정부 서식과 VIET-TAX 표준 서식의 복잡함은 화면 뒤에서 처리한다.
(1) 사용자는 서식을 고르지 않는다. 부가가치세 01/GTGT·04/GTGT 등 서식 선택은 규칙(G2)이 정하고 사용자에게는 이유 한 줄만 보여준다. 규칙 검증 전에는 vnk_expert가 정한다.
(2) 사용자는 신고서 숫자를 입력하지 않는다. 신고서는 거래에서 자동으로 채워지며 읽기 전용이고 수정은 원본 거래에서만 한다.
(3) 단계바(①→⑥), 하단 고정 이전·다음 버튼, 임시저장을 모든 신고 화면에 동일하게 적용하고 한 화면에는 한 가지 일만 둔다.
(4) 정부 서식 번호·항목명은 보조 표기로만 두고, 주된 라벨은 쉬운 한국어('~합니다')를 쓴다.
(5) 2층 표준 서식은 질문에 답하면 초안이 만들어지는 방식으로 하며, 사용자가 양식을 직접 편집하지 않는다.
(6) 홈에는 '다음 할 일' 버튼 1개를 항상 먼저 보여주고, 어려운 용어는 한국어+베트남어를 병기한다.
(7) 각 입력 단계에는 '작성 예시 보기' 버튼을 두고 기본은 닫힘으로 한다. 예시는 가상 데이터이며 '예시' 표시, 읽기 전용이고 실제 데이터에 영향을 주지 않는다. 정부 서식 항목 번호는 검증된 Form Verification Pack에서만 가져오며 Pack이 없는 서식은 예시도 제공하지 않는다. 예시 문구(ko/vi)는 Content Pack 슬롯으로 채우고 구현자는 구조와 빈 슬롯만 만든다.
■ 6. 보안 (최우선)
org_id 기반 RLS 필수. 증빙은 비공개 버킷 + 짧은 만료 서명 URL. 서비스 롤 키는 서버 전용. 파일 형식·크기 제한. 역할별 권한 테스트 필수. audit_log 누락 금지. 개인정보·서류는 로그와 콘솔에 남기지 않는다.
■ 7. 미검증 게이트 (검증 전에는 값을 만들어 쓰지 말 것. 모두 verified_status='unverified'로 시드하고 UI에서 확정 기능으로 노출하지 않는다)
G1 법인세 신고 서식 번호와 양식(Thông tư 89/2026, 20/2026 원문 대조)
G2 부가가치세 방식(01/GTGT vs 04/GTGT)과 분기 신고 선택 기준(Nghị định 252/2026)
G3 회계제도(TT99 vs TT133)와 장부 서식·계정과목표(TT99 부록 III 원문)
G4 외화 거래 환산 규칙
G5 장부 정정 방식
G6 전자 인보이스 의무에 따른 증빙 요건
G7 VNK의 신고 대행 자격
G8 회계 장부·증빙의 언어 요건(베트남어 사용 의무, 외국어 병기 규정): 확인 전에는 베트남어 확정을 거친 문구만 공식 출력 대상으로 본다.
기한 시드(2차 출처, 원문 대조 전까지 unverified): 부가가치세 월 신고=익월 20일 / 분기=다음 분기 첫 달 말일 / 법인세 분기 가납=다음 분기 첫 달 30일 / 법인세 연간 결산·재무제표=회계연도 종료 후 3개월째 말일 / 소득세(원천징수) 분기=다음 분기 첫 달 말일. 기한이 휴일이면 다음 영업일(Nghị định 252/2026 제3조 7항).
신고서 필드 코드는 임의로 만들지 말고, Claude가 작성하는 Form Verification Pack(docs/master/forms/)을 받아 field_map에 넣는다. Pack이 없는 서식은 기능 플래그 OFF.
G1 갱신: 법인세 연간 결산 신고서는 03/TNDN(TT89/2026 부록 I, 2차 출처)으로 확인됨. 분기 가납 서식 번호와 부속 서식(03-2, 03-3A, 03-4, 03-5, 03-6, 03-8 등) 적용 범위는 원문 대조 전까지 unverified.
정부 서식 후보(pending_verification, 2차 출처): 01/VBGT 신고서 해명서, 01/KHBS 수정신고서, 01-1/KHBS 수정신고 해명서(amended 절차와 연결), 03/TNCN 원천징수영수증(Nghị định 70/2025/NĐ-CP).
G9 정부가 서식을 정하지 않은 제출 문서의 목록과 법령상 필수 내용. 1차 후보: 세무당국 요청에 대한 해명 공문(công văn giải trình). 확인 전에는 standardized 서식의 제출 기능 OFF, verified_status='unverified'.
참고(2차 출처): TT89/2026의 01-2/GTGT는 수력발전 배분표이며 거래처 목록이 아니다.
■ 8. 구현 단계 (각 단계 35분을 넘기지 않게 범위를 쪼갠다)
P0 조사(읽기 전용): 기존 저장소의 기업회원 관련 코드, 세금 Clean Build, Admin MASTER, Supabase 스키마·RLS·스토리지 패턴, 기존 i18n 방식을 조사하고 KEEP/MERGE/REMOVE/REWIRE/NEW 표로 보고한 뒤 Ace 승인을 받는다. 승인 게이트는 여기 한 번뿐이다.
P1 마이그레이션: §4 테이블(i18n_texts, term_glossary, profiles 포함), RLS, 감사 트리거, 비공개 버킷, i18n 카탈로그(ko/vi) 뼈대. 두 조직 격리 테스트 통과.
P2 거래 입력·증빙·초안/확정·검증(5-5), 번역 비동기 처리와 "번역 대기" 표시, 언어 전환.
P3 posting_rules 엔진과 ledger_entries 생성, 장부 조회. G3 통과 전에는 unverified 표시.
P4 서식 레지스트리, 법령 월간 점검 화면,보내기 프레임워크(버전 고정 PDF·Excel, 번역 version 기록, 미확정 번역 경고). 한국어 참고본 PDF는 후순위. (P4 마이그레이션에서 form_versions.form_class 추가)
P5 신고서 초안(부가가치세 먼저): Form Verification Pack이 도착하면 진행한다(게이트).
P6 전문가 검토 대기열, 코멘트, 정정, "베트남어 확정" 동작.
P7 퍼널·온보딩: (2026-10-23) 가입 직후 미니 질문 3개 → 신고서 작성·검토 화면 직행. 구(legacy) 3진입점·2단계 질문·1차 결과 퍼널은 코드 유지·오픈 스위치 false. 가입 후 org 연결은 유지.
P8~P9 회계 모듈 마감·QA·내비·이중언어 등(세부는 LESSONS 113–126 및 해당 커밋).
P10 standardized 2층 서식 뼈대(G9 게이트, 제출 OFF): form_class·standardized_drafts·목록 UI.

| 단계 | 상태 | 근거 |
| --- | --- | --- |
| P0 | 완료 | LESSONS·설계서 P0 조사 게이트(확인 불가: 단일 커밋 미대조) |
| P1 | 완료 | `20261016010000_accounting_p1.sql`, LESSONS 63–67 |
| P2 | 완료 | `20261016020000`–`p2b` 마이그레이션, LESSONS 72–74 |
| P3 | 완료 | `accounting_p3_*`, LESSONS 75–77 |
| P4 | 완료 | `accounting_p4a`·`p4b`, 설계 §8 P4 |
| P5 | 완료 | `accounting_p5a*`, LESSONS 91–92·122 |
| P6 | 완료 | `accounting_p6a`–`p6c`, LESSONS 105–106 |
| P7 | 퍼널 미오픈·방향 변경 | 구현 `accounting_p7_*`는 있으나 3진입 퍼널은 보류(오픈 false). 2026-10-23 Ace: 미니 3문 + 홈택스식 작업공간 직행 |
| P8 | 확인 불가 | 단일 커밋·LESSONS 외 완료 근거 미대조 |
| P9 | 완료 | P9 이월 정리 완료; 커밋 19d5014·a6a2a39; LESSONS 113–126 |
| P10 | 완료 | `20261018120000_accounting_p10_standardized.sql`(본 Mission) |

■ 9. 검증 (구현자가 직접 수행하고 증거를 첨부한다. Ace에게 확인을 넘기지 않는다)
- tsc --noEmit 0 오류
- 두 조직 계정으로 서로의 거래·증빙·장부에 접근 불가 확인
- confirmed 거래의 UPDATE/DELETE 차단 확인(번역 version 추가는 허용)
- 거래별 차변합=대변합 확인
-보내기 파일의 sha256, 서식 버전, 번역 version 기록 확인
- 브라우저에서 홈, 거래 입력, 부가가치세 신고 4단계 전체를 데스크톱·모바일에서 직접 확인
- §11-8 이중 언어 검증 전부 수행
- 발생한 문제는 작게라도 Verified Lessons(lessons ledger)에 누적하고 커밋한다
- 중간에 막히면 보고서에 기록하고 계속 진행한다. 잠금 자산 변경이나 범위 확대가 필요할 때만 멈추고 묻는다.
■ 10. 표준 규칙 (항상 적용)
정보 밀도 우선, 근거(법령 우선)와 출처 번호는 실제 사용한 것만 [1]부터 연속 표기, 법령 변경은 월 1회 점검해 즉시 반영, 질문 선택지는 최대 5개+직접입력, 고객 문구는 "~합니다".
■ 11. 한국어/베트남어 양방향 호환
범위: 이 모듈만 이중 언어. 사용자별 언어 설정(profiles.locale=ko|vi), 같은 조직의 사용자가 서로 다른 언어로 같은 데이터를 본다. 헤더에 언어 전환 버튼.
11-1 값의 종류별 처리
(a) 코드값(거래 유형, 세율, 계정 코드, 상태, 세금번호, 인보이스 번호, 금액, 날짜): 언어 무관하게 숫자·코드·ISO 날짜로 저장하고 표시만 locale에 맞춘다(ko: 2026.10.16 / 1,000,000 ; vi: 16/10/2026 / 1.000.000). 라벨은 i18n 사전으로만 가져오고 코드에 문자열을 직접 쓰지 않는다.
(b) 고유명사(회사명, 인명, 주소, 거래처명): 번역하지 않는다. 원문 + 선택 입력 읽기(음역) 필드.
(c) 자유 입력 글(메모, 품목 설명, 검토 코멘트): i18n_texts로 처리한다.
11-2 번역 저장 (insert-only, 버전 보존)
- 현재값 = (entity_type, entity_id, field, lang)별 최신 version. 수정은 새 version 삽입, 기존 version 보존.
- 입력한 언어는 status=original. 반대 언어는 저장 직후 비동기로 기계번역해 status=machine으로 삽입(재시도 3회, 실패 시 "번역 대기"로 남기고 화면은 원문 표시).
- 확정된 거래의 원문은 수정 불가. 반대 언어 번역은 확정 후에도 새 version으로 추가·검증할 수 있고 audit_log에 기록한다.
- 한쪽을 직접 고치면 그 언어가 새 원문이 되고 반대 언어는 재번역 대기가 된다. 반대 언어가 human_verified였다면 덮어쓰지 않고 "다른 언어본 재확인 필요"로 표시한다.
- "베트남어 확정"(status=human_verified)은 베트남어 사용자 또는 vnk_expert만 한다.
- 번역이 없는 칸은 다른 언어 원문을 보여주고 "번역 대기" 배지를 붙인다. 빈 칸 금지.
11-3 번역 호출(서버 전용)
- OpenAI 호출은 서버에서만. 키 노출 금지. 해당 텍스트 한 칸만 전송하고 조직 식별 정보·세금번호는 보내지 않는다. 호출 로그에 원문을 남기지 않는다.
- 프롬프트에 term_glossary 포함. 규칙: 숫자·인보이스 번호·고유명사·날짜 변경 금지, 회계 문맥으로 번역.
- 선택지·라벨은 term_glossary에서만 가져온다. 사전 항목의 베트남어 검수는 베트남어 담당자가 한다.
11-4 공식 출력과의 관계
- 장부·신고서보내기는 베트남어 정식 레이아웃. 출력에 쓰이는 자유 입력 글은 베트남어 현재값이어야 한다.
-보내기 전 점검: status=machine인 베트남어 문구가 있으면 "경고"로 표시하고 목록과 함께 "베트남어 확정"으로 이동시킨다. 경고가 있어도보낼 수는 있으나 파일에 "미확정 번역 포함" 표시를 남기고 exports에 번역 version 목록을 기록한다.
- 한국어 참고본 PDF는 선택 제공(모든 쪽에 "참고용·공식 제출 불가").
11-5 검색: 한국어와 베트남어 텍스트를 모두 검색한다. 베트남어는 성조 기호를 무시한 검색(unaccent)도 지원한다.
11-6 UI 문자열: 모든 화면 문구는 i18n 카탈로그(ko, vi)로 관리한다. 키마다 두 언어가 모두 있어야 하며 빠지면 빌드 실패. 기존 저장소의 i18n 방식이 있으면 그대로 따른다. 베트남어 문구 초안은 ChatGPT, 검수는 베트남어 담당자.
11-8 이중 언어 검증
- 한국어 계정으로 거래를 입력하고 베트남어 계정으로 전환해 모든 값과 메모가 보이는지 확인, 반대 방향도 확인
- 번역 실패(API 오류) 시 빈 칸 없이 원문과 "번역 대기" 배지가 나오는지 확인
- 확정 후 번역 version이 쌓이고 원문이 바뀌지 않는지 확인
- ko/vi 키 누락 시 빌드가 실패하는지 확인
-보내기 점검이 machine 상태 문구를 경고하는지 확인
