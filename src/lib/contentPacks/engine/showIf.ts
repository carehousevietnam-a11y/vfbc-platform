import type { AnswerMap } from "./types";

type PathAliases = Record<string, string>;

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function answerValues(answers: AnswerMap, qid: string): string[] {
  const v = answers[qid];
  if (v == null) return [];
  return Array.isArray(v) ? v.map(String) : [String(v)];
}

function stripOuterParens(e: string): string {
  let s = e;
  while (s.startsWith("(") && s.endsWith(")")) {
    const inner = s.slice(1, -1).trim();
    if ((inner.match(/\(/g) ?? []).length !== (inner.match(/\)/g) ?? []).length) break;
    s = inner;
  }
  return s;
}

function splitTopLevel(expr: string, keyword: "AND" | "OR"): string[] | null {
  const re = new RegExp(`^\\s*\\b${keyword}\\b`);
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (depth === 0) {
      const tail = expr.slice(i);
      const m = tail.match(re);
      if (m) {
        parts.push(expr.slice(start, i).trim());
        start = i + m[0].length;
        i = start - 1;
      }
    }
  }
  parts.push(expr.slice(start).trim());
  return parts.length > 1 ? parts.filter(Boolean) : null;
}

function evalAtom(atom: string, answers: AnswerMap, aliases: PathAliases): boolean {
  const a = norm(atom);
  if (!a || a === "항상") return true;
  if (aliases[a]) return evalExpr(aliases[a], answers, aliases);

  const neq = a.match(/^(.+?)\s*≠\s*(.+)$/);
  if (neq) {
    const [, qid, vals] = neq;
    const have = answerValues(answers, qid.trim());
    if (have.length === 0) return false;
    const banned = vals.split("|").map((x) => x.trim());
    return have.some((h) => !banned.includes(h));
  }

  const eq = a.match(/^([\w.]+)\s*=\s*(.+)$/);
  if (eq) {
    const [, qid, vals] = eq;
    const options = vals.split("|").map((x) => x.trim());
    const have = answerValues(answers, qid.trim());
    if (have.length === 0) return false;
    const ok = have.some((h) => options.includes(h));
    return ok;
  }

  if (/^[a-z][\w]*$/i.test(a) && !aliases[a]) {
    for (const v of Object.values(answers)) {
      if (Array.isArray(v)) {
        if (v.some((x) => String(x) === a)) return true;
      } else if (v != null && String(v) === a) return true;
    }
    return false;
  }

  return false;
}

export function evalExpr(expr: string, answers: AnswerMap, aliases: PathAliases = {}): boolean {
  let e = norm(expr.replace(/그리고/g, " AND ").replace(/또는/g, " OR "));
  if (!e || e === "항상") return true;
  e = stripOuterParens(e);

  const andParts = splitTopLevel(e, "AND");
  if (andParts) return andParts.every((p) => evalExpr(p, answers, aliases));

  const orParts = splitTopLevel(e, "OR");
  if (orParts) return orParts.some((p) => evalExpr(p, answers, aliases));

  if (/^NOT\s+/i.test(e)) {
    return !evalExpr(e.replace(/^NOT\s+/i, "").trim(), answers, aliases);
  }

  const orPieces = e.split(/\s+또는\s+/);
  if (orPieces.length > 1) return orPieces.some((p) => evalExpr(p, answers, aliases));
  const andPieces = e.split(/\s+그리고\s+/);
  if (andPieces.length > 1) return andPieces.every((p) => evalExpr(p, answers, aliases));

  if (e.includes("+")) {
    const parts = e.split("+").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1 && parts.every((p) => p.includes("=") || p.includes("≠"))) {
      return parts.every((p) => evalExpr(p, answers, aliases));
    }
  }

  if (e.includes("|") && !/=\s*[^|]+\|/.test(e)) {
    const parts = e.split("|").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) return parts.some((p) => evalExpr(p, answers, aliases));
  }

  return evalAtom(e, answers, aliases);
}
