/** 한글 받침 기준 조사 선택 (Pack 문장 조립용) */

function lastHangulChar(word: string): string {
  const trimmed = word.trim().replace(/[.,)]+$/, "");
  for (let i = trimmed.length - 1; i >= 0; i--) {
    const ch = trimmed[i];
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) return ch;
  }
  return trimmed.slice(-1);
}

export function hasJongseong(word: string): boolean {
  const ch = lastHangulChar(word);
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

export type ParticleKind = "을/를" | "은/는" | "이/가" | "과/와" | "으로/로";

export function particle(word: string, kind: ParticleKind): string {
  const jong = hasJongseong(word);
  switch (kind) {
    case "을/를":
      return jong ? "을" : "를";
    case "은/는":
      return jong ? "은" : "는";
    case "이/가":
      return jong ? "이" : "가";
    case "과/와":
      return jong ? "과" : "와";
    case "으로/로": {
      const ch = lastHangulChar(word);
      const code = ch.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        const jongIdx = (code - 0xac00) % 28;
        if (jongIdx === 0 || jongIdx === 8) return "로";
      }
      return "으로";
    }
    default:
      return "";
  }
}

export function withParticle(word: string, kind: ParticleKind): string {
  return `${word}${particle(word, kind)}`;
}

const PARTICLE_KIND_BY_FORM: Record<string, ParticleKind> = {
  을: "을/를",
  를: "을/를",
  은: "은/는",
  는: "은/는",
  이: "이/가",
  가: "이/가",
  과: "과/와",
  와: "과/와",
};

const JOSA_BOUNDARY = String.raw`(?=[\s,.)」』\]]|$)`;

function isLikelyVerbEndingParticle(word: string, p: string): boolean {
  if (!/^(은|는|이|가)$/.test(p)) return false;
  if (word.length < 2) return true;
  return /^(받|하|보|되|없|있|않|좋|싶|겠|려|만|든|간|난|간|탄|친|킨|핀|빈|싼|쁜|큰|작|많|적|듯|듯|런|던|쳐|져|여|워|와|돼)$/.test(word);
}

/** 명사 내부 음절(예: 전문**가** 권장)을 조사로 오인하는 경우 제외 */
function isHangulTokenInternalParticle(text: string, index: number, word: string, p: string): boolean {
  const space = text.indexOf(" ", index);
  const token = text.slice(index, space === -1 ? text.length : space);
  const merged = word + p;
  return token === merged && particle(word, PARTICLE_KIND_BY_FORM[p]!) !== p;
}

/** 조립 후 문장 내 명사구+조사를 받침 규칙으로 정정 (템플릿에 박힌 을/를 등) */
export function correctParticlesInSentence(text: string): string {
  let out = text.replace(
    new RegExp(`([가-힣][가-힣·]*)(을|를|은|는|이|가|과|와)${JOSA_BOUNDARY}`, "g"),
    (match, word, p, offset) => {
      const kind = PARTICLE_KIND_BY_FORM[p];
      if (!kind) return match;
      if (isLikelyVerbEndingParticle(word, p)) return match;
      if (isHangulTokenInternalParticle(text, offset, word, p)) return match;
      const correct = particle(word, kind);
      const tail = match.slice(word.length + p.length);
      return `${word}${correct}${tail}`;
    },
  );
  out = out.replace(
    new RegExp(`([가-힣][가-힣·]*)(으로|로)${JOSA_BOUNDARY}`, "g"),
    (full, word, p) => {
      const correct = particle(word, "으로/로");
      const tail = full.slice(word.length + p.length);
      return `${word}${correct}${tail}`;
    },
  );
  return out;
}

export function findJosaViolations(text: string): string[] {
  const hits: string[] = [];
  const re = new RegExp(`([가-힣][가-힣·]*)(을|를|은|는|이|가|과|와)${JOSA_BOUNDARY}`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const word = m[1];
    const p = m[2];
    const kind = PARTICLE_KIND_BY_FORM[p];
    if (!kind) continue;
    if (isLikelyVerbEndingParticle(word, p)) continue;
    if (isHangulTokenInternalParticle(text, m.index, word, p)) continue;
    if (particle(word, kind) !== p) hits.push(`${word}${p}`);
  }
  const reRo = new RegExp(`([가-힣][가-힣·]*)(으로|로)${JOSA_BOUNDARY}`, "g");
  while ((m = reRo.exec(text))) {
    const word = m[1];
    const p = m[2];
    if (particle(word, "으로/로") !== p) hits.push(`${word}${p}`);
  }
  return hits;
}
