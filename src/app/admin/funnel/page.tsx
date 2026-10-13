// src/app/admin/funnel/page.tsx
//
// 퍼널 진입·진행·이탈 보기 화면(P3, 보기 전용). 설계: docs/master/FUNNEL_TRACKING_DESIGN.md
// - funnel_events(익명 집계: 세션 UUID·서비스·단계·이벤트·기기만)를 서버에서 읽기만 한다.
// - 접근은 middleware(/admin/*)의 관리자 로그인으로 보호된다. 브라우저는 DB에 직접 접근하지 않는다.
// - 이탈 = 세션에서 접수 완료(submit)가 없고 마지막 기록 후 30분이 지난 경우. 이탈 지점 = 그 세션의 최대 단계.
// - 기존 관리자 화면 스타일 그대로(색 추가 없음).

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

const ABANDON_MS = 30 * 60 * 1000;
const PERIODS = [7, 30, 90];
const PAGE_SIZE = 1000;
const MAX_ROWS = 50000;
const KST_MS = 9 * 60 * 60 * 1000;

type Row = {
  session_id: string;
  engine: string;
  service: string;
  step: number;
  event: string;
  device: string | null;
  occurred_at: string;
};

type Sess = {
  service: string;
  engine: string;
  first: number;
  last: number;
  maxStep: number;
  submitted: boolean;
  device: string | null;
};

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "-");
const dayKey = (ms: number) => new Date(ms + KST_MS).toISOString().slice(0, 10);

export default async function AdminFunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const daysParam = Number(typeof sp.days === "string" ? sp.days : "30");
  const days = PERIODS.includes(daysParam) ? daysParam : 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();

  // 1000행 제한을 넘겨도 끝까지 읽는다(LESSONS 45). 상한 도달 시 안내 문구를 띄운다.
  const rows: Row[] = [];
  let truncated = false;
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await supabaseAdmin
      .from("funnel_events")
      .select("session_id, engine, service, step, event, device, occurred_at")
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      return (
        <main className="min-h-screen bg-[#fafafa] p-10">
          <p className="text-sm text-red-600">
            데이터를 불러오는 중 문제가 발생했습니다: {error.message}
          </p>
        </main>
      );
    }
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < PAGE_SIZE) break;
    if (from + PAGE_SIZE >= MAX_ROWS) truncated = true;
  }

  // 세션(서비스별) 단위로 묶기
  const sessions = new Map<string, Sess>();
  for (const r of rows) {
    const key = `${r.service}|${r.session_id}`;
    const t = new Date(r.occurred_at).getTime();
    const cur =
      sessions.get(key) ??
      ({
        service: r.service,
        engine: r.engine,
        first: t,
        last: t,
        maxStep: 0,
        submitted: false,
        device: r.device,
      } as Sess);
    cur.first = Math.min(cur.first, t);
    cur.last = Math.max(cur.last, t);
    if (r.event === "submit") cur.submitted = true;
    else cur.maxStep = Math.max(cur.maxStep, r.step);
    if (!cur.device && r.device) cur.device = r.device;
    sessions.set(key, cur);
  }

  const now = Date.now();
  const all = Array.from(sessions.values());
  const isAbandoned = (s: Sess) => !s.submitted && now - s.last > ABANDON_MS;

  // 서비스별 집계
  type Svc = {
    service: string;
    engine: string;
    entered: number;
    submitted: number;
    abandoned: number;
    mobile: number;
    reach: number[]; // reach[s] = 최대 단계가 s 이상인 세션 수
    dropAt: Map<number, number>;
  };
  const byService = new Map<string, Svc>();
  for (const s of all) {
    const cur =
      byService.get(s.service) ??
      ({
        service: s.service,
        engine: s.engine,
        entered: 0,
        submitted: 0,
        abandoned: 0,
        mobile: 0,
        reach: [],
        dropAt: new Map(),
      } as Svc);
    cur.entered += 1;
    if (s.submitted) cur.submitted += 1;
    if (isAbandoned(s)) {
      cur.abandoned += 1;
      cur.dropAt.set(s.maxStep, (cur.dropAt.get(s.maxStep) ?? 0) + 1);
    }
    if (s.device === "mobile") cur.mobile += 1;
    for (let i = 0; i <= s.maxStep; i++) cur.reach[i] = (cur.reach[i] ?? 0) + 1;
    byService.set(s.service, cur);
  }
  const services = Array.from(byService.values()).sort((a, b) => b.entered - a.entered);

  const total = {
    entered: all.length,
    submitted: all.filter((s) => s.submitted).length,
    abandoned: all.filter(isAbandoned).length,
    mobile: all.filter((s) => s.device === "mobile").length,
  };

  // 일별 추이(한국 시간 기준, 최근 14일까지 표시)
  const daily = new Map<string, { entered: number; submitted: number }>();
  for (const s of all) {
    const k = dayKey(s.first);
    const d = daily.get(k) ?? { entered: 0, submitted: 0 };
    d.entered += 1;
    if (s.submitted) d.submitted += 1;
    daily.set(k, d);
  }
  const dailyRows = Array.from(daily.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14);
  const dailyMax = Math.max(1, ...dailyRows.map(([, v]) => v.entered));

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            VFBCAI 관리자
          </p>
          <AdminLogoutButton />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
          <Link href="/admin" className="hover:text-gray-600 hover:underline">
            관리자 홈
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">퍼널 현황</span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">퍼널 현황</h1>
        <p className="mt-1 text-sm text-gray-500">
          고객이 서비스 화면에 들어와 어디까지 진행하고, 어디서 나가고, 접수까지 하는지 봅니다. 개인정보는
          저장하지 않는 익명 집계입니다.
        </p>

        <div className="mt-4 flex gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin/funnel?days=${p}`}
              className={
                p === days
                  ? "rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white"
                  : "rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              }
            >
              최근 {p}일
            </Link>
          ))}
        </div>

        {truncated && (
          <p className="mt-3 text-xs text-gray-500">
            기록이 많아 앞쪽 {MAX_ROWS.toLocaleString()}건까지만 집계했습니다. 기간을 줄여 보세요.
          </p>
        )}

        {/* 전체 요약 */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "진입 세션", value: total.entered.toLocaleString() },
            { label: "접수 완료", value: total.submitted.toLocaleString() },
            { label: "접수 전환율", value: pct(total.submitted, total.entered) },
            { label: "이탈(30분 경과)", value: total.abandoned.toLocaleString() },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl bg-white border border-gray-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <p className="text-xl font-bold text-gray-900">{c.value}</p>
              <p className="text-[11px] text-gray-400">{c.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          모바일 비율 {pct(total.mobile, total.entered)} · 상담 접수(consultation_direct, consultation_result)는
          질문 단계가 없어 접수 기록만 있고, 진입 대비 전환율은 의미가 없다.
        </p>

        {/* 일별 추이 */}
        <h2 className="mt-8 text-sm font-bold text-gray-900">일별 진입·접수 (한국 시간)</h2>
        <div className="mt-3 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {dailyRows.length === 0 && <p className="text-sm text-gray-400">아직 데이터가 없습니다.</p>}
          <div className="space-y-2">
            {dailyRows.map(([day, v]) => (
              <div key={day} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-gray-500">{day}</span>
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-900"
                    style={{ width: `${Math.round((v.entered / dailyMax) * 100)}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-gray-700">
                  진입 {v.entered} · 접수 {v.submitted}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 서비스별 */}
        <h2 className="mt-8 text-sm font-bold text-gray-900">서비스별 진행·이탈</h2>
        <div className="mt-3 space-y-3">
          {services.length === 0 && <p className="text-sm text-gray-400">아직 데이터가 없습니다.</p>}
          {services.map((s) => {
            const maxS = s.reach.length - 1;
            let dropStep = -1;
            let dropCnt = 0;
            for (const [st, c] of s.dropAt) {
              if (c > dropCnt) {
                dropCnt = c;
                dropStep = st;
              }
            }
            return (
              <details
                key={s.service}
                className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-gray-900">{s.service}</span>
                    <span className="text-[11px] font-semibold text-blue-900 group-open:hidden">
                      단계별 보기 ▾
                    </span>
                    <span className="hidden text-[11px] font-semibold text-gray-400 group-open:inline-block">
                      접기 ▴
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{s.entered}</p>
                      <p className="text-[11px] text-gray-400">진입</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{s.submitted}</p>
                      <p className="text-[11px] text-gray-400">접수</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{pct(s.submitted, s.entered)}</p>
                      <p className="text-[11px] text-gray-400">전환율</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{s.abandoned}</p>
                      <p className="text-[11px] text-gray-400">이탈</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{pct(s.mobile, s.entered)}</p>
                      <p className="text-[11px] text-gray-400">모바일</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {dropStep >= 0 ? `${dropStep}단계` : "-"}
                      </p>
                      <p className="text-[11px] text-gray-400">가장 많이 나간 지점</p>
                    </div>
                  </div>
                </summary>
                <div className="mt-4 space-y-1.5">
                  {Array.from({ length: maxS + 1 }, (_, i) => i).map((i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-12 shrink-0 text-gray-500">{i}단계</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-blue-900"
                          style={{ width: `${Math.round(((s.reach[i] ?? 0) / s.entered) * 100)}%` }}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right text-gray-700">
                        {s.reach[i] ?? 0} ({pct(s.reach[i] ?? 0, s.entered)})
                      </span>
                    </div>
                  ))}
                  <p className="pt-1 text-[11px] text-gray-400">
                    check·register·verify/admin은 화면 단계(1부터 4), 나머지 VERIFY는 답한 질문 수(0=질문
                    화면 진입). 막대는 그 단계 이상 도달한 세션 비율.
                  </p>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </main>
  );
}
