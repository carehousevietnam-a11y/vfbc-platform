# Immigration `quyet_dinh` 재조사 — STEP 2 최종 확인

**일시**: 2026-08-08  
**현재 Immigration (4 doc types)**: **472 / 1300** (36.3%)  
**테스트**: Immigration만 `doc_type`에 `quyet_dinh` 추가, `trung_uong` 유지, 다른 카테고리는 4종 그대로

---

## 1. `quyet_dinh` 포함 시 Immigration 증가량

| 지표 | 값 |
|---|---:|
| 코퍼스 스캔 행 | 158,822 |
| trung_uong `quyet_dinh` 전체 | 12,708 |
| Immigration on-topic (미수집) | **263** |
| **추가 가능 (quota 한도)** | **+263** |
| **예상 합계** | **735 / 1300 (56.5%)** |

→ quota 1300 대비 여전히 **565건 부족**. 700건 기준은 초과(735)하지만 quota의 절반 수준.

---

## 2. 관련성 샘플 (authorityWeight=60)

모든 신규 `quyet_dinh` 후보는 **authorityWeight=60** (Decision).

### 키워드별 분포 (263건)

| matched keyword | 건수 | 비고 |
|---|---:|---|
| biên giới | 74 | ⚠️ 상당수 이민과 무관 (국경마을·인프라·탈빈곤) |
| quốc tịch | 64 | ✅ 관련 |
| định cư | 41 | ✅ 대체로 관련 (귀국·전문가 등) |
| cư trú | 16 | ✅ (입출국 수수료 등) |
| nhập cảnh / xuất cảnh / xuất nhập cảnh | 28 | △ 일부는 **세관** Quyết định |
| hộ chiếu / người nước ngoài / biên phòng | 28 | ✅ |
| legal_area | 5 | ✅ |

### 관련성 분류 (수동 규칙 기준)

| 분류 | 건수 | 비율 |
|---|---:|---:|
| **On-topic (strong)** | ~187 | 71% |
| **Weak (`biên giới` 단독)** | ~74 | 28% |
| 기타 | 2 | 1% |

**Weak 샘플** (이민과 거리 있음):
- `490/QĐ-ĐB` — 국경 다리 유지보수 규정
- `262/2003/QĐ-TTg` — 하장성 외교·국경 사무소 설립
- `231/2003/QĐ-TTg` — 국경·산악 빈곤지역 경제사회 프로그램
- `Quy hoạch … xã biên giới` — 국경 마을 주민 배치 계획

**Strong 샘플** (CHECK/TRC·땀주 참조에 유용):
- `856/2001/QĐ-NHNN` — ngân hàng cán bộ hộ chiếu quy chế
- `59/TTg` — Việt kiều định cư hồi hương
- `136/1999/QĐ-BTC` — lệ phí nhập/xuất/cư trú
- `quốc tịch` 계열 Quyết định 다수

**결론**: 263건 전부 넣으면 **~74건(28%)은 억지 채우기**에 가깝습니다. Criminal `tài sản` 사례와 유사한 패턴(`biên giới` 과넓음).

---

## 3. 최종 Immigration — **Option B 적용 완료**

| | 값 |
|---|---:|
| 기존 (4 doc types) | 472 |
| quyet_dinh 추가 (biên giới 단독 제외) | **+189** |
| **최종 Immigration** | **661 / 1,300 (50.8%)** |
| 전체 pilot 합계 | **8,327 / 9,999** |

**판단**: biên giới noise 74건 제외 후 on-topic Quyết định만 반영. quota 1300 미달(639)은
trung_uong Immigration corpus 한도로 **추가 채우기 중단**.

STEP 2 큐레이션 공식 종료: `reports/STEP2_CLOSE.md`

---

## (참고) Option B 적용 전 probe 결과

| | 값 |
|---|---:|
| quyet_dinh raw (+263, biên giới 포함) | 735 projected |
| on-topic strong | ~187 |
| weak (`biên giới` 단독) | ~74 (28% noise) — **제외됨** |

---

## 재현

```bash
cd services/legal-rag
python3 -m src.run_immigration_quyet_dinh_probe
# 옵션 B 적용 시 (승인 후):
# python3 -m src.run_immigration_quyet_dinh_probe --apply
```

JSON: `reports/pilot_10000_immigration_quyet_dinh_probe.json`
