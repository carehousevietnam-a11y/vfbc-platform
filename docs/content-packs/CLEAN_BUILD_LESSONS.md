# 부동산 Clean Build — 교훈 장부 (L-01 ~ L-49)

C1 / C1.1 / C1.2 지시서·절대 규칙에서 확정된 항목만 기록한다. 미검증 추측은 적지 않는다.

| ID | 교훈 |
|----|------|
| **L-01** | 기존 서비스 코드는 수정·복제·재사용하지 않는다. LOCK된 VFBCAI Admin MASTER 엔진은 하나만 두고, 신규 서비스는 자기 Content Pack을 처음부터 Clean Build한다. |
| **L-02** | 내용 원천은 `docs/content-packs/VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1.md`와 `docs/content-packs/pack-RE0N.md`(해당 CASE)만 사용한다. `archive/re-j2-translation-approach`는 읽지도 가져오지도 않는다. |
| **L-03** | Admin MASTER(`verify_admin`·`AdminVerifyFirstResultPanel` 등)는 한 줄도 변경하지 않는다. 부동산은 화면 프리미티브·패널을 **import**하고 **data만** 전달한다. |
| **L-04** | `realEstateMasterProfiling`·`realEstateMasterContent`·`realEstateMasterUiContent`·`realEstateVerifyResultKeyMetrics`·옛 TextLayer·legacy funnel·번역표를 새 경로에서 import·복사·참조하지 않는다. |
| **L-05** | `docs/content-packs/real-estate-content-pack-v1.md`(폐기 초안)는 import·인용·문장 복사 모두 금지. 과거 자산 파일은 Ace 지시 전까지 삭제·수정하지 않고 그대로 둔다. |
| **L-06** | 커밋 0·push 0·git revert·reset·restore·stash·clean 금지(별도 Ace 지시 시만). 테스트 리드 삭제 금지. |
| **L-07** | `MasterReviewQuotationReport.tsx`와 옛 `page.tsx` 로직은 사용하지 않는다. `/verify/real-estate`는 `RealEstateCleanBuildPage` + Content Pack 실행기만 사용한다. `page.legacy.tsx`는 삭제(원본은 archive 브랜치). |
| **L-08** | MASTER의 질문·선택지·value·show_if·meaning·위험 신호·결과 문장은 글자 그대로 옮긴다. 임의 수정·축약·삭제 금지. value는 서비스 전체 유일 — `check-real-estate-value-uniqueness.mjs` 0건. |
| **L-09** | 1차 결과는 `DEFAULT_STEPS` 등 공용 placeholder를 쓰지 않는다. CASE·분기별 M-4(3칸)·M-5(STEP 3개) MASTER 원문과 일치해야 한다. |
| **L-10** | 2차 질문 순서는 F절 표를 파싱한 데이터로 처리한다. 한 경로의 순서를 코드 상수로 박지 않는다(RE01 `confirm_goal` 정렬 보정 포함). |
| **L-11** | 위험 신호(M 표): `+`·`\|`·AND/OR·NOT·`≠`를 평가한다. 특수 사건 → 「VFBCAI 전문가팀 진행」. 지원 불가 표기는 목록으로 보고하고 건너뛰지 않는다. |
| **L-12** | RE06: 직접 입력은 `ADMIN_DIRECT_EXPLAIN_CHOICE`와 동일 동작. 키워드 재배정·전문가 handoff는 MASTER RE06 규칙을 따른다. |
| **L-13** | MASTER RE02·RE04 구간 손상(글자마다 `r2_`/`r4_` 삽입) → **소스 문서를 영구 복구**하고 파서 우회(`deCorrupt`, `fixRe04DeadlineValueCollisions`)는 **삭제**한다. 우회 코드로 때우지 않는다. |
| **L-14** | RE01 1차 결과 문장(M-4/M-5) 생성은 `docs/content-packs/pack-RE01.md` 3·4절이 저장소에 들어온 뒤 **C1.2 항목 2**로만 재개한다. MASTER가 pack-RE01을 가리킬 때 MASTER 본문에 전문이 없으면 임의 작성 금지. |
| **L-15** | C1 범위: 1차→1차 결과→2차 질문 연결까지. C2(저장·2차 자료·Restore·Gate·My Page·PDF·CRM)는 하지 않는다. |
| **L-16** | `src/lib/contentPacks/registry.ts` 등 기존 공용 contentPacks 파일은 이번 미션에서 변경하지 않는다. `runner.ts`·`showIf.ts`·`realEstate/types.ts`는 부동산 Clean Build 신규 파일이다. |
| **L-17** | 금지어(새 파일): 행정\|교통\|벌금\|과태료\|출석\|소명\|처분\|발신 기관\|등기부\|내용증명\|제출기관 (납부는 세금 문맥만). |
| **L-18** | tsc/build 실패 시 `.next`만 삭제 후 재시도. 소스 폴더 다른 파일은 삭제하지 않는다. |
| **L-19** | `tests/qa/_output/j2-re/`(옛 J-2 harness·`realEstateMaster*` import)는 **저장소 밖**으로 이동한다. `tsconfig`는 수정하지 않는다. |
| **L-20** | 보고서 필수: 신규 경로에서 과거 자산 import 검색 0건; `git diff --stat -- src/app/verify/admin` 등 Admin 변경 0; 근거 문서가 MASTER·pack-RE0N 외 없음을 명시. |
| **L-21** | 불확실한 점은 임의 판단·우회하지 않고 보고 한 줄로 알린 뒤 가능한 부분만 진행한다. 새 교훈은 이 장부에 한 줄 추가하고 보고서 「신규 교훈」에 적는다. |
| **L-22** | 일회용 복구 스크립트 잔존 → 사용 후 제거. |
| **L-23** | 참조 문서가 저장소에 들어갔는지 확인 없이 지시서 발송 → 필요 파일 배치 확인을 첫 줄에 명시. |
| **L-24** | PATH별 손수 만든 테스트 입력은 확장 불가 → F 조건식에서 답 세트를 자동 생성. 만족시키는 답이 없으면 문서 오류로 보고. |
| **L-25** | 엔진 내 보조 맵이 콘텐츠를 이중 보유 → 결과 문장·조회표는 pack 문서 파싱 데이터에서만. 코드 보조 맵 금지. |
| **L-26** | 화면 shell을 Admin과 같게 쓰라는 명시 없이 별도 화면 제작 → 새 서비스 페이지는 Admin page의 shell·헤더 props·레이아웃 래퍼를 같은 컴포넌트·클래스로 구성하고, 단계별 Admin 대조표가 첫 결과물이다. |
| **L-30** | 화면 전환 시 hydration 오류 오버레이 → 초기 렌더에 저장 상태·난수·날짜를 쓰지 않음. 오류는 원인을 찾아 수정하고 보고한다. |
| **L-31** | 공용 컴포넌트 안의 서비스 전용 분기(RE gate 등)를 우회로로 사용 → `realEstateVerifyGate`·`isRealEstateVerifyMasterLayout` 등 과거 서비스 이름 분기 경로로 RE를 연결하지 않는다. |
| **L-32** | 지시한 항목을 건너뛰고 이전 결과를 다시 제출하지 않는다 → 미수행 항목은 보고서 첫 줄 아래 `미수행: 항목명, 사유`로 적고, 이전 PASS/FAIL 숫자를 새 결과처럼 쓰지 않는다. |
| **L-33** | 공용 컴포넌트(SiteHeader) hydration 오류 → Admin에서도 같은 조건으로 재현 여부를 먼저 확인하고, 재현되면 기존 공용 문제로 보고만 한다(RE 전용 수정으로 가장하지 않음). |
| **L-34** | showIf `splitTopLevel`에서 OR/AND를 case-insensitive로 쪼개면 value 토큰 안의 `and`(예: `hd_double_demand`)가 OR로 잘려 경로식이 깨진다 → 키워드 분리는 대문자 `AND`/`OR`만. |
| **L-35** | F표 괄호 조건 해석이 행마다 달라 경로 공백이 생김 → 괄호는 모든 행에서 경로 선택에 쓰지 않고, 선택 조건은 괄호 밖의 답만 사용한다. |
| **L-36** | 1차 같고 2차 첫 답으로 갈리는 PATH를 1차 열거만으로 검증하면 누락 → 게이트 PATH는 2차 첫 질문까지 열거한다. |
| **L-37** | Admin에서 hydration 미재현을 “RE는 문제없음”으로 해석하지 않음 → Admin 미재현이면 RE 페이지·RE 전용 상태로 원인을 조사한다. |
| **L-38** | 개발 서버를 여러 포트로 중복 실행하고 브라우저 확인에서 멈춤 → 개발 서버는 1개만, 확인 단계가 2분 이상 응답 없으면 NOT VERIFIED로 기록하고 진행한다. |
| **L-39** | 끝난 영역까지 채팅을 다시 쪼개려는 제안 → 분할은 남은 작업 기준, 끝난 단계는 상태 점검 한 줄로 확인만 한다. |
| **L-40** | 개발 서버 화면에서 Internal Server Error를 개별 확인 → 런타임 오류는 코드 확정 후 통합 검증에서 로그 원인과 함께 보고한다. |
| **L-41** | 분할 의도를 서비스 단위 병행인지 작업 단위 분할인지 확인하지 않고 해석 → 속도 제안은 대상(서비스/작업)을 먼저 확인한다. |
| **L-42** | 서비스 전용 이름이 붙은 화면 컴포넌트를 다른 서비스가 재사용할 수 없음 → 화면 shell은 서비스 중립 컴포넌트로 한 번만 만들고 서비스는 pack과 설정만 넘긴다. |
| **L-43** | 앞단(자연어 접수)이 없는 버튼 중심 퍼널 → 자연어 접수 → 분류·추출 → 퍼널 연결을 서비스 중립 계층으로 설계(부동산 LOCK 이후 별도 작업), 추출 값은 Content Pack의 value만, 사용자가 확인한 뒤에만 확정한다. |
| **L-44** | 기대 문장이 같은 파서 데이터에서 와서 테스트가 자기 참조가 될 위험 → 테스트 통과와 별개로 CASE별 실제 출력 샘플을 문서로 덤프해 사람이 원문과 직접 대조한다. |
| **L-45** | UI 동일은 "비슷하게 조립"이 아니라 Admin이 쓰는 같은 컴포넌트에 Pack 내용만 주입한다. 공통 컴포넌트 안의 서비스별 문구(칩·위험도·결과)도 Pack 출처만 허용한다. 신규 서비스 지시서는 헌장 14·15항을 상단에 인용하고, 완료 보고는 전 단계 Admin 대조표(동일/다름 Pack 문구만/다름 구조)를 필수로 포함한다. "다름 구조" 1건이면 완료가 아니다. |
| **L-46** | 공통 컴포넌트의 서비스별 분기 prop(domain="real-estate" 등)이 Admin과 다른 레이아웃을 렌더하면 그 경로는 사용 금지다. |
| **L-47** | 결과 문장의 분기 표기·괄호·빈칸·헤드라인↔04 모순은 3125 전수 점검 대상이다. 기대 문장은 Pack 원문에서 읽는다(L-44). |
| **L-48** | Admin 마스터 체인의 서비스별 고정값은 서비스 중립 슬롯으로 1회 개방한다. 이후 서비스는 Admin 파일을 수정하지 않고 슬롯·Pack 어댑터에 내용만 주입한다. 신규 서비스 지시서는 슬롯 목록을 인용한다. |
| **L-49** | 승인 조건에 "수정 전 기준본 저장"이 있으면 수정 전에 저장한다. 순서를 바꾼 경우는 HEAD 버전 임시 교체 또는 별도 worktree로 사후 기준본을 만들고 그 사실을 보고한다. |
| **L-50** | 「이동 정상」은 UI 동일의 증거가 아니다. 완료 보고는 단계별 구조 비교표(동일/다름 구조)로 한다. |
| **L-51** | 랜딩 옛 레이아웃(2열 카드·탭 CTA·QUOTATION REPORT 중복)이 서비스 경로에서 함께 렌더되는지 확인한다. Pack·Admin 체인과 page shell 래퍼를 대조한다. |
| **L-52** | Admin 화면의 구조 요소(직접 입력 블록 등)는 서비스 Pack의 옵션 유무와 무관하게 쉘이 항상 렌더한다. 새 서비스 비교 요소 목록에 직접 입력 블록·선택 답 표시를 필수로 넣는다. |
| **L-53** | npm run build 후에는 반드시 기존 dev 서버를 종료하고 .next를 지운 뒤 dev를 재기동하고, 4개 URL 헬스 체크(200·본문 정상)를 한 뒤에 완료 보고한다. 검수자는 서버 오류 화면을 만나지 않아야 한다. |
| **L-54** | 회원 상태 판단(폼 노출 여부)은 서비스 공통 경로를 쓴다. 서비스별 stub으로 대체하면 화면 흐름이 Admin과 달라진다. |
| **L-55** | 결과 검증은 데이터가 아니라 렌더된 화면 텍스트를 기준으로 한다. 렌더 수준 전수 점검(카드 수, 금칙 문자열, 빈 영역)을 완료 조건에 둔다. |
| **L-56** | 공통 컴포넌트의 서비스 전용 고정 문구는 슬롯 목록에 올리고 금칙 문자열 점검에 포함한다. |
| **L-57** | 선택지 전체 문장을 문장 틀에 끼워 넣지 않는다. 문장 틀에는 Pack이 정의한 짧은 표현만 쓰고, 없으면 제안서를 만들어 대표 승인 후 Pack에 추가한다. |
| **L-58** | `domain` 같은 서비스 이름 prop으로 레이아웃·라벨을 바꾸지 않는다. 서비스별 문구는 서비스 중립 슬롯으로만 주입한다. |
| **L-59** | 1차 결과는 선택 value·라벨의 핵심 서술(했다/못했다, 있다/없다, 일치/불일치)과 렌더 문장이 같은 방향이어야 한다. compound·lookup 조립 후 3125 전수에서 규칙 검사하며, 규칙 밖 필드는 목록만 보고한다. |
| **L-60** | 조사 검사와 함께 렌더 어미·시제 검사를 한다. 「~받은/한/본 것이 필요」 등 관형사+것이+필요 패턴과 동사 어미 안의 은/는 오인식은 0건이어야 한다. |
| **L-61** | RE01만이 아니라 RE02~RE05도 유형별 커버링 조합 덤프(`c117-dump-RE0N.txt`)로 렌더 문장을 검수한다. |
| **L-62** | Pack § 위험 신호(phase1 value)가 포함된 조합에서 헤드라인·등급이 「양호/큰 문제 없음」이면 결함이다. 판정은 Pack 신호 파싱·합산 규칙을 따른다. |
| **L-63** | m1~m3 렌더 문장에 결합 lookup 문자열(과/와·을/를·이/가 등) 조사 오류와 첫머리 조사(으로서·과의) 결함을 전수 검사한다. |
| **L-64** | RE02 등 phase1 선택 라벨의 방향어(받지 못함/주지 않음)와 m1 결과 방향어가 반대이면 결함이다. |
| **L-65** | 1차 결과 §03 소제목은 유형(RE01~05)별 bridge 주입값이어야 한다. Admin 파일·서비스명 prop 변경 금지. |
| **L-66** | 02-02/02-03 결과 문장이 phase1 선택 라벨과 완전 일치(echo)하면 결함이다. Pack §3 결과 문장이 없으면 제안서에만 기록하고 임의 작문하지 않는다. |
| **L-67** | 인접 구절 중복·기록/서면 되풀이는 의미 보존하며 한 문장으로 병합한다. Pack §3 「확인합니다」 변환은 허용, 선택 라벨 원문 복사는 금지. |
| **L-68** | 의미 되풀이 검사는 동사 어간 일치만으로 충분하지 않다. 기록·서면·메시지·남겨·받아 두·모아·준비 계열 어휘 겹침으로 문장 내 되풀이를 잡는다. |
| **L-69** | 승인된 정책 변경(헤드라인 상향 등)은 Pack 문서·파서 반영 후 3125 전수에서 **의도한 조합만** 변했는지 전/후 비교로 증명한다. |
| **L-70** | 서비스 성격(계약 전/후 문제 상태)에 따른 판정 하한은 값별 목록이 아니라 **서비스 단위** Pack 메타(`firstResultVerdictFloor`)로 둔다. |
| **L-71** | 경로별 질문 종료·간단 자료 도달은 `show_if`로 숨긴 phase1 필드를 완료 조건에 넣지 않는다. 질문 그래프 전수 도달 검사를 기본 QA에 포함한다. |
| **L-72** | 1차 판정 하한(주의)과 §03 위험 0건 문구가 모순되면, 하한+0건일 때만 Pack `firstResultNoRiskFloor*` 슬롯으로 「먼저 확인할 사항」을 쓴다. Admin 기본 문구는 슬롯 미지정 시 유지. |
| **L-73** | 신규 VERIFY 서비스 페이지의 회원 lead 복원은 Admin 기준만 허용한다: 마운트 시 `?restore=1` 또는 랜딩 「계속하기」에서만 `allowRestore: true`. 마운트 시 무조건 복원 금지 — 완료 lead(`admin_phase2_documents_upload_complete=1`)가 있으면 `adminVerifyPhase2UploadComplete` 로 My Page 자동 이동이 걸려 새 검토를 시작할 수 없다. 검사: 로그인 상태에서 서비스 URL 첫 진입이 시작 화면(랜딩/Q1)인지. |
| **L-74** | RE My Page PDF 본문은 Pack headline·`buildRealEstatePhase2SummaryLinesFromActivities`와 동일 소스로 `realEstateVerifyPdfContent`에서 조립하고, EVIDENCE 7줄 예산은 Admin `packAdminVerifyPaidEvidenceKeyFindings`를 재사용한다. QA는 유형별 300경로 plain-body 전수 + pdf-lib 샘플 렌더(전수 렌더는 수십 분 소요). |
| **L-75** | Admin PDF 회귀는 동일 하니스 2회 비교가 아니라 `03a8e21` worktree baseline(`tests/qa/fixtures/admin-mypage-pdf-03a8e21`)과 HEAD 비교. RE PDF 결론은 `gradeLabel`+2차 summary 문자 동일; `(부동산 관련 서류)` filler 금지·Pack 1차 문서명+`koreanParticle`. 양호(grade&lt;2)는 [공백] 교차확인 생략. 접수번호 `VF`+UUID hex8 — `lead-re-…` 하이픈 leadId는 pdf-parse에서 ㏄ 아티팩트 가능(운영 UUID 무관). |
| **L-76** | RE PDF MANDATORY·조치문 문서명은 `REAL_ESTATE_PHASE2_DOCUMENT_LISTS`(`phase2Documents.ts` → `generated/meta.ts`, `/documents` phase2_upload L788~794) 단일 소스. ② 조치는 `2차에 입력하신 내용을 {doc}의 기재 내용과 대조` — `내용과 {doc}와 기재` 금지. paid·free 모두 `mandatoryDocumentLines`로 렌더 카드 override. |
| **L-77** | My Page `phase2Complete` = `admin_phase2_documents_upload_complete`(Admin 동일). RE `/documents` 종합 결과 클릭 시 upload gate meta + `buildRealEstatePackPhase2PersistMeta`(session snapshot) 단일 persist. `buildRealEstateVerifyMypagePackExtras`가 grade2·summary·paid layout 게이트 QA. 서류 0건이어도 gate `1`이면 paid·2차 슬롯. |
