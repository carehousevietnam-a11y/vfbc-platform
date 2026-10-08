const paths = ["/", "/check/trc", "/verify/admin", "/verify/real-estate"];
const base = process.env.MYPAGE_QA_BASE ?? "http://localhost:3000";
const timeoutMs = 120_000;

const out = {};
for (const p of paths) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${p}`, { signal: ctrl.signal });
    out[p] = res.status;
  } catch (e) {
    out[p] = `ERR: ${e?.message ?? e}`;
  } finally {
    clearTimeout(t);
  }
}
console.log(JSON.stringify({ base, timeoutMs, out }, null, 2));
process.exit(Object.values(out).every((v) => v === 200) ? 0 : 1);
