/** Pack §3 「확인합니다」 변환·인접 중복·기록 되풀이 제거 (L-67) */

export function dedupeAdjacentPhrases(text: string): string {
  let out = text;
  out = out.replace(/송금 전에\s+송금 전에/g, "송금 전에");
  out = out.replace(/서명이나\s+서명이나/g, "서명이나");
  out = out.replace(/\s{2,}/g, " ").trim();
  return out;
}

/** Pack §3: 선택지 「~하고 싶습니다」→ 결과 「~합니다」 */
export function hopeFormToPackConfirmGoal(text: string): string {
  if (!/싶습니다/.test(text)) return text;
  return text
    .replace(/확인하고 싶습니다\.?/g, "확인합니다.")
    .replace(/정리하고 싶습니다\.?/g, "정리합니다.")
    .replace(/받고 싶습니다\.?/g, "받을 수 있는지 확인합니다.")
    .trim();
}

/** 앞 문장이 이미 기록·서면·보관을 말하면 꼬리 「그 기록을…」 생략 (L-67·L-68) */
const RECORD_KEEPING_LEX =
  /(기록|서면|메시지|남겨|받아\s*두|모아(?:야|두|어)?|보여\s*줄\s*기록|준비)/;

export function lineAlreadyStressesRecordKeeping(text: string): boolean {
  return RECORD_KEEPING_LEX.test(text);
}

export function mergeRedundantRecordSuffix(line: string, suffix: string): string {
  const base = line.trim();
  if (!suffix || !base) return base;
  if (!/기록을\s*남겨/.test(suffix)) return `${base}${suffix}`;
  if (/그\s*기록을\s*남겨/.test(base)) return base;
  if (lineAlreadyStressesRecordKeeping(base)) return base;
  if (base.endsWith("중요합니다.")) return base;
  return `${base}${suffix}`;
}

/** 문장 내 기록·서면 의미 되풀이(꼬리 「그 기록을…」 등) */
export function hasSemanticRecordRepetition(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tail = "그 기록을 남겨 두는 것이 중요합니다";
  if (trimmed.includes(tail)) {
    const before = trimmed.split(tail)[0]?.trim() ?? "";
    return lineAlreadyStressesRecordKeeping(before);
  }
  const parts = trimmed.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  const withLex = parts.filter((p) => lineAlreadyStressesRecordKeeping(p));
  return withLex.length >= 2;
}

export function polishMetricSentence(line: string, opts?: { metricIndex?: number; suffix?: string }): string {
  let out = dedupeAdjacentPhrases(line);
  if (opts?.metricIndex === 1) out = hopeFormToPackConfirmGoal(out);
  if (opts?.suffix) out = mergeRedundantRecordSuffix(out, opts.suffix);
  return out;
}

/** 연속 두 문장이 같은 동사 어간으로 끝나는 되풀이 */
export function hasVerbStemRepetition(line: string): boolean {
  const parts = line.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  const stems = parts.map((p) => {
    const m = p.match(/([가-힣]+)(습니다|합니다|입니다|좋습니다|해야 합니다)\.?$/);
    return m ? m[1] : "";
  });
  return stems.length >= 2 && Boolean(stems[0]) && stems[0] === stems[1];
}
