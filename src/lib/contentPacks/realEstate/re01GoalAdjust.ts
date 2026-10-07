import type { AnswerMap } from "./types";

export function applyRe01GoalAdjust(chain: string[], answers: AnswerMap): string[] {
  const goal = String(answers.re01_confirm_goal ?? "");
  const out = [...chain];
  const moveBefore = (ids: string[], beforeId: string) => {
    const present = ids.filter((id) => out.includes(id));
    if (!present.length || !out.includes(beforeId)) return out;
    const filtered = out.filter((id) => !present.includes(id));
    const idx = filtered.indexOf(beforeId);
    if (idx < 0) return out;
    filtered.splice(idx, 0, ...present);
    return filtered;
  };
  const moveAfter = (ids: string[], afterId: string) => {
    const present = ids.filter((id) => out.includes(id));
    if (!present.length || !out.includes(afterId)) return out;
    const filtered = out.filter((id) => !present.includes(id));
    const idx = filtered.indexOf(afterId);
    if (idx < 0) return out;
    filtered.splice(idx + 1, 0, ...present);
    return filtered;
  };

  if (goal === "r1_cg_money_safety") {
    return moveBefore(["re01_transfer_account", "re01_penalty_clause"], "re01_contract_form");
  }
  if (goal === "r1_cg_owner_authority") {
    return moveAfter(
      ["re01_book_status", "re01_owner_authority", "re01_precheck_response"],
      "re01_info_channel",
    );
  }
  if (goal === "r1_cg_foreigner_fit") {
    return moveBefore(
      ["re01_foreign_eligibility", "re01_residence_registration", "re01_client_party"],
      "re01_contract_form",
    );
  }
  if (goal === "r1_cg_contract_terms") {
    return moveAfter(
      ["re01_contract_form", "re01_language_gap", "re01_condition_compare"],
      "re01_info_channel",
    );
  }
  return out;
}
