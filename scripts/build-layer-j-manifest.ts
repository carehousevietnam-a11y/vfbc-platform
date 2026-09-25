/**
 * Layer J manifest generator — catalog + clause map + DRAFT markdown.
 * Run: npx --yes tsx scripts/build-layer-j-manifest.ts
 */
import fs from "node:fs";
import path from "node:path";
import { getAdminVerifyChoiceOptionsForField } from "../src/lib/adminVerifyProfiling";
import {
  LAYER_J_JUDGMENT_FIELD_SPECS,
  LAYER_J_LEGACY_SLUGS,
} from "../src/lib/adminVerifyJudgmentFieldRegistry";

const ROOT = path.join(__dirname, "..");

function key(caseCode: string, outlet: string, fieldId: string, slug: string): string {
  return `${caseCode}|${outlet}|${fieldId}|${slug}`;
}

/** Hand-authored CASE_01 + CASE_02~06 slug→clause (판단 문장; 선택지 라벨 반복 금지). */
function clauseFor(
  caseCode: string,
  outlet: string,
  fieldId: string,
  slug: string,
  otherItemLabel: string,
): string | null {
  const k = key(caseCode, outlet, fieldId, slug);
  const CASE01: Record<string, string> = {
    [key("01", "§03·1차", "case01_violationContent", "traffic_spatiotemporal_dispute")]:
      "통지·안내는 특정 일시·장소·행동을 문제 삼는 내용으로 이해됩니다.",
    [key("01", "§03·1차", "case01_violationContent", "conduct_denied_or_partial")]:
      "통지·안내는 행동·상황 자체를 문제 삼는 내용으로 이해됩니다.",
    [key("01", "§03·1차", "case01_violationContent", "authority_explanation_missing")]:
      "통지·안내의 핵심 문구가 아직 확인되지 않은 상태로 이해됩니다.",
    [key("01", "§03·1차", "case01_violationContent", "other_stated")]:
      "통지·안내는 본인의 행동·상황 자체를 문제 삼는 내용으로 이해됩니다.",
    [key("01", "§03·1차", "case01_violationContent", "traffic")]:
      "통지·안내는 특정 일시·장소에서 일어난 일을 문제 삼는 내용으로 이해됩니다.",
    [key("01", "§03·1차", "case01_violationContent", "administrative")]:
      "통지·안내는 면허·차량·등록 관련 문제로 이해됩니다.",
    [key("01", "§03·1차", "case01_violationContent", "labor_tax")]:
      "통지·안내는 제출·신고·등록 내용을 문제 삼는 쪽으로 이해됩니다.",
    [key("01", "§03·1차", "case01_violationContent", "explanation_unknown")]:
      "통지·안내에서 문제 쟁점이 아직 파악되지 않은 상태입니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "pay_core_traffic")]:
      "기관 요구는 이번 교통·위반 건 핵심 납부로 정리됩니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "pay_bundled")]:
      "기관 요구는 납부가 다른 안내와 함께 제시된 것으로 정리됩니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "supplement_core")]:
      "기관 요구는 이번 건 핵심 보완·재제출로 정리됩니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "attend_explain")]:
      "기관 요구는 출석·소명·추가 설명 관련 안내로 정리됩니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "attendance")]:
      "기관 요구는 출석·추가 설명 관련 안내로 정리됩니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "supplement")]:
      "기관 요구는 추가 서류·자료 제출로 정리됩니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "payment")]:
      "기관 요구는 비용·납부 관련 안내로 정리됩니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "correct_record")]:
      "기관 요구는 기존 기록·제출 내용 수정·확인으로 정리됩니다.",
    [key("01", "§03·1차", "case01_authorityDemand", "demand_unclear")]:
      "기관 요구 내용이 아직 명확히 정리되지 않은 상태입니다.",
    [key("01", "§03·1차", "case01_customerResponded", "no_contact_yet")]:
      "아직 교통국에 연락·출석·제출 등 공식 대응을 하지 않은 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_customerResponded", "none")]:
      "아직 교통국에 연락·출석·제출 등 공식 대응을 하지 않은 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_customerResponded", "has_responded")]:
      "교통국에 대응한 이력이 있으나, 어떤 대응이었는지는 아직 세부 정리되지 않은 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_responseDetail", "explained_situation")]:
      "교통국에 대응한 이력이 있으며, 당시 상황을 설명한 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_responseDetail", "submitted_materials")]:
      "교통국에 대응한 이력이 있으며, 관련 자료를 제출한 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_responseDetail", "disputed_facts")]:
      "교통국에 대응한 이력이 있으며, 사실관계 차이를 전달한 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_responseDetail", "fulfilled_demand")]:
      "교통국에 대응한 이력이 있으며, 안내 받은 조치를 처리한 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_deadline", "deadline_day_known")]:
      "구체 기한 일자를 확인한 상태입니다.",
    [key("01", "§03·1차", "case01_deadline", "confirmed")]:
      "구체 기한 일자를 확인한 상태입니다.",
    [key("01", "§03·1차", "case01_deadline", "deadline_window_only")]:
      "대응 기한은 기간만 안내된 상태로, 구체 일자 확인이 필요합니다.",
    [key("01", "§03·1차", "case01_deadline", "no_deadline_stated")]:
      "별도 기한 안내가 없었거나 기억되지 않는 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_deadline", "uncertain")]:
      "대응 기한이 있다고 들었으나 구체 일자는 아직 확인되지 않았습니다.",
    [key("01", "§03·1차", "case01_deadline", "asap")]:
      "가능한 한 빨리 대응하라는 안내만 확인된 상태입니다.",
    [key("01", "§03·1차", "case01_deadline", "no_stated")]:
      "별도 기한 안내가 없었거나 기억되지 않는 상태로 확인됩니다.",
    [key("01", "§03·1차", "case01_deadline", "unknown")]:
      "기한 관련 설명을 받지 못했거나 정확히 이해하지 못한 상태입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "align_minor_gap")]:
      "2차 추가 확인에서는 대체로 같으나 날짜·시간·장소 등 일부 차이를 짚는 것이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "deny_with_alibi")]:
      "2차 추가 확인에서는 지적 행동 부인과 그 시각·장소의 다른 일정이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "partial_core_dispute")]:
      "2차 추가 확인에서는 일부는 맞지만 핵심(누가·무엇·언제)이 다르게 기록됐을 수 있다는 점이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "cannot_compare_yet")]:
      "2차 추가 확인에서는 통지 내용과 알고 있는 사실을 같은 기준으로 맞추기 어렵다는 점이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "match")]:
      "2차 추가 확인에서는 통지 설명과 실제 상황이 대체로 같다는 전제로 다음 조치를 보는 것이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "date_place_wrong")]:
      "2차 추가 확인에서는 날짜·장소 정보가 실제와 다를 수 있다는 점이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "deny_action")]:
      "2차 추가 확인에서는 기관이 문제라고 보는 행동을 실제로 하지 않았다는 점이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "partial_situation")]:
      "2차 추가 확인에서는 일부는 맞지만 전체 상황이 다르게 정리될 수 있다는 점이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "partial")]:
      "2차 추가 확인에서는 일부는 맞지만 전체 상황이 다르게 정리될 수 있다는 점이 핵심입니다.",
    [key("01", "§03·2차", "case01_factRelationship", "unknown")]:
      "2차 추가 확인에서는 통지와 실제 상황이 같은지 아직 판단하기 어렵다는 점이 핵심입니다.",
    [key("01", "§01·integrated", "case01_customerResponded", "no_contact_yet")]:
      "아직 교통국에 설명하거나 자료를 제출한 대응은 없으며",
    [key("01", "§01·integrated", "case01_customerResponded", "none")]:
      "아직 교통국에 설명하거나 자료를 제출한 대응은 없으며",
    [key("01", "§01·integrated", "case01_customerResponded", "has_responded")]:
      "이미 교통국에 일부 대응을 한 상태이며",
  };
  if (CASE01[k]) return CASE01[k];

  if (slug === "other" || slug === "direct_explain") {
    return null;
  }

  return inferLayerJClause(caseCode, outlet, fieldId, slug, otherItemLabel);
}

/** CASE_02~06 — slug별 판단 문장 (라벨 전문 반복 금지). */
function inferLayerJClause(
  caseCode: string,
  outlet: string,
  fieldId: string,
  slug: string,
  otherItemLabel: string,
): string {
  const phase1 = outlet.includes("2차") ? "2차 추가 확인에서는" : "1차 확인에서는";
  const fieldMap = LAYER_J_FIELD_SLUG_CLAUSES[fieldId];
  if (fieldMap?.[slug]) return fieldMap[slug];

  if (
    slug === "unsure" ||
    slug === "uncertain" ||
    slug === "unknown" ||
    slug === "unclear" ||
    slug.endsWith("_unclear")
  ) {
    return `${phase1} ${otherItemLabel} 관련 내용이 아직 명확히 정리되지 않은 상태입니다.`;
  }
  if (slug === "match" || slug === "align_minor_gap") {
    return `${phase1} ${otherItemLabel}이 대체로 일치하는 방향으로 정리됩니다.`;
  }
  if (slug === "partial" || slug === "partial_situation" || slug === "mismatch" || slug === "not_applicable") {
    return `${phase1} ${otherItemLabel}에서 차이·불일치 가능성이 있는 상태입니다.`;
  }
  if (slug === "confirmed" || slug === "deadline_day_known" || slug === "specific_date") {
    return `${phase1} ${otherItemLabel}에 대한 구체 일자·기한을 확인한 상태입니다.`;
  }
  if (slug === "none" || slug === "no_contact_yet" || slug === "not_paid" || slug === "not_started") {
    return `${phase1} ${otherItemLabel} 관련 공식 대응·처리가 아직 진행되지 않은 상태입니다.`;
  }
  return `${phase1} ${otherItemLabel} 관련 응답을 바탕으로 추가 대조·확인이 필요합니다.`;
}

const LAYER_J_FIELD_SLUG_CLAUSES: Record<string, Record<string, string>> = {
  case02_paymentSubject: {
    traffic_fine: "1차 확인에서는 납부 요구가 교통위반 벌금·과태료 성격으로 파악됩니다.",
    license_fee: "1차 확인에서는 납부 요구가 면허 발급·갱신·변경 비용으로 파악됩니다.",
    vehicle_reg_fee: "1차 확인에서는 납부 요구가 차량 등록·검사 관련 비용으로 파악됩니다.",
    additional_related: "1차 확인에서는 이전 처리와 연결된 추가 납부 요구로 파악됩니다.",
    unclear: "1차 확인에서는 납부 사유·근거가 아직 명확히 정리되지 않은 상태입니다.",
  },
  case02_confirmGoal: {
    verify_obligation: "1차 확인에서는 납부 의무가 실제 상황에 해당하는지부터 짚어볼 필요가 있습니다.",
    verify_amount: "1차 확인에서는 통지 금액·산정 근거를 우선 대조할 필요가 있습니다.",
    how_when_where: "1차 확인에서는 납부 시기·장소·방법을 우선 확인할 필요가 있습니다.",
    payment_processed: "1차 확인에서는 기납부 처리 여부와 재요구 사유를 우선 확인할 필요가 있습니다.",
    unsure: "1차 확인에서는 무엇부터 확인할지 방향이 아직 정리되지 않은 상태입니다.",
  },
  case02_demandAuthority: {
    traffic: "1차 확인에서는 교통·교통국 계열 기관의 납부 요구로 파악됩니다.",
    police: "1차 확인에서는 경찰 등 교통 관련 기관의 납부 요구로 파악됩니다.",
    vehicle_reg: "1차 확인에서는 차량 등록·검사 관련 기관의 납부 요구로 파악됩니다.",
    other_agency: "1차 확인에서는 특정 기관명이 불분명한 납부 요구로 파악됩니다.",
  },
  case02_paymentStatus: {
    not_paid: "1차 확인에서는 아직 납부가 이루어지지 않은 상태로 정리됩니다.",
    partial: "1차 확인에서는 일부만 납부된 상태로 정리됩니다.",
    full: "1차 확인에서는 요구 금액 전액 납부가 완료된 상태로 정리됩니다.",
    paid_unverified: "1차 확인에서는 납부는 했으나 기관 처리 확인이 되지 않은 상태입니다.",
    paid_by_other: "1차 확인에서는 대리 납부가 있었으나 본인 처리 여부 확인이 필요합니다.",
  },
  case02_deadline: {
    confirmed: "1차 확인에서는 납부 기한 일자를 확인한 상태입니다.",
    uncertain: "1차 확인에서는 납부 기한이 있으나 구체 일자 확인이 필요합니다.",
    deadline_mentioned: "1차 확인에서는 기한 안내는 있으나 구체 일자 확인이 필요합니다.",
    not_stated: "1차 확인에서는 납부 기한 안내가 확인되지 않은 상태입니다.",
    unsure: "1차 확인에서는 납부 기한 정보가 거의 없는 상태입니다.",
  },
  case02_situationMatch: {
    match: "2차 추가 확인에서는 납부 요구와 실제 상황이 대체로 맞는 방향으로 정리됩니다.",
    partial: "2차 추가 확인에서는 납부 요구와 실제 상황이 다르게 느껴진다는 점이 핵심입니다.",
    not_applicable: "2차 추가 확인에서는 납부 의무 자체가 내 상황과 맞지 않을 수 있다는 점이 핵심입니다.",
    hard_to_judge: "2차 추가 확인에서는 문서와 실제 상황을 대조하기 어렵다는 점이 핵심입니다.",
    unknown: "2차 추가 확인에서는 판단에 필요한 정보가 부족하다는 점이 핵심입니다.",
  },
  case02_paymentAmount: {
    amount_known: "2차 추가 확인에서는 안내 금액 자체를 기준으로 대조하는 것이 핵심입니다.",
    amount_differs: "2차 추가 확인에서는 안내 금액과 알고 있는 금액의 차이가 핵심입니다.",
    paid_redemand: "2차 추가 확인에서는 납부 후 재요구 가능성이 핵심입니다.",
    amount_unclear: "2차 추가 확인에서는 금액이 불명확하다는 점이 핵심입니다.",
  },
  case02_nonPaymentNotice: {
    sanction_enforcement_stated: "2차 추가 확인에서는 미납 시 추가 제재·강제징수 안내가 핵심입니다.",
    interest_stated: "2차 추가 확인에서는 이자·가산금 안내가 핵심입니다.",
    no_notice: "2차 추가 확인에서는 미납 시 결과 안내가 없어 재확인이 필요합니다.",
  },
  case04_supplementTarget: {
    additional_docs: "1차 확인에서는 빠진 자료 추가 제출 요구로 정리됩니다.",
    add_content_evidence: "1차 확인에서는 제출 내용·정보 부족을 이유로 한 보완 요구로 정리됩니다.",
    modify_existing: "1차 확인에서는 형식·작성 방법 문제로 인한 재제출 요구로 정리됩니다.",
    repeat_demand: "1차 확인에서는 이미 보완 후 재요구된 상황으로 정리됩니다.",
    unclear: "1차 확인에서는 보완 대상이 아직 명확하지 않은 상태입니다.",
  },
  case04_submissionRelation: {
    match: "2차 추가 확인에서는 보완 요구와 제출 준비가 대체로 맞는 방향입니다.",
    partial: "2차 추가 확인에서는 보완 요구와 실제 제출 상황의 차이가 핵심입니다.",
    mismatch: "2차 추가 확인에서는 보완 요구와 실제 제출 상황의 차이가 핵심입니다.",
    not_prepared: "2차 추가 확인에서는 아직 준비·제출이 되지 않은 상태가 핵심입니다.",
  },
};

function main(): void {
  const map: Record<string, string> = {};
  const mdRows: string[] = [];
  mdRows.push("# Layer J — Judgment Clause Manifest v1 (DRAFT · 승인 대기)");
  mdRows.push("");
  mdRows.push("| CASE | 질문 | 질문 문구 | slug | 선택지 라벨 | 판단 문장 | 옛 slug 여부 |");
  mdRows.push("|------|------|-----------|------|-------------|-----------|--------------|");

  const missing: string[] = [];

  for (const spec of LAYER_J_JUDGMENT_FIELD_SPECS) {
    const options = getAdminVerifyChoiceOptionsForField(spec.fieldId) ?? [];
    for (const opt of options) {
      const clause = clauseFor(spec.caseCode, spec.outlet, spec.fieldId, opt.value, spec.otherItemLabel);
      const k = key(spec.caseCode, spec.outlet, spec.fieldId, opt.value);
      if (!clause) {
        if (opt.value === "other" || opt.value === "direct_explain") {
          const j2 = `${spec.otherItemLabel}: {${spec.fieldId}Note 또는 DI 원문}`;
          map[k] = j2;
          mdRows.push(
            `| ${spec.caseCode} | ${spec.fieldId} | ${spec.questionLabel.replaceAll("|", "｜")} | \`${opt.value}\` | ${opt.label.replaceAll("|", "｜").replaceAll("\n", " ")} | **${j2}** | ${LAYER_J_LEGACY_SLUGS.has(opt.value) ? "예" : ""} |`,
          );
        } else {
          missing.push(k);
        }
        continue;
      }
      map[k] = clause;
      const legacy = LAYER_J_LEGACY_SLUGS.has(opt.value) ? "예" : "";
      const labelCell = opt.label.replaceAll("|", "｜").replaceAll("\n", " ");
      mdRows.push(
        `| ${spec.caseCode} | ${spec.fieldId} | ${spec.questionLabel.replaceAll("|", "｜")} | \`${opt.value}\` | ${labelCell} | ${clause} | ${legacy} |`,
      );
    }
  }

  if (missing.length) {
    console.error("Missing clauses:", missing.length, missing.slice(0, 5));
    process.exit(1);
  }

  const dataTs = `/** Generated by \`npx tsx scripts/build-layer-j-manifest.ts\` — do not edit by hand. */\nexport const LAYER_J_CLAUSE_MAP: Record<string, string> = ${JSON.stringify(map, null, 2)};\n`;
  fs.writeFileSync(path.join(ROOT, "src/lib/adminVerifyJudgmentClauses.data.ts"), dataTs, "utf8");
  fs.writeFileSync(
    path.join(ROOT, "docs/master/VFBCAI_ADMIN_VERIFY_LAYER_J_MANIFEST_v1_DRAFT.md"),
    mdRows.join("\n") + "\n",
    "utf8",
  );
  console.log(`Layer J manifest: ${Object.keys(map).length} clauses, ${mdRows.length - 4} table rows.`);
}

main();
