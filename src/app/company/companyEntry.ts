/**
 * 법인설립 랜딩 「내 상황」 3단계 질문 블록 — 이식 쪽 코드.
 * 대표 원본 랜딩(companyLandingHtml.ts)은 수정하지 않고, 가격 섹션(02 COST)과 질문 섹션(03 CHECK) 사이에
 * 블록을 끼워 넣은 마크업을 만든다. 질문 3개를 한 화면씩 보여 주고(진행 막대·이전 버튼),
 * 마지막 정리 화면의 「내 상황 확인하기」로 /register/company 퍼널(→ /verify/company)에 들어간다.
 */
import { COMPANY_LANDING_HTML } from "./companyLandingHtml";
import {
  COMPANY_ENTRY_CUSTOM_CODE,
  COMPANY_ENTRY_CUSTOM_LABEL,
  COMPANY_ENTRY_CUSTOM_MAX,
  COMPANY_ENTRY_CUSTOM_PLACEHOLDER,
  COMPANY_ENTRY_QUESTIONS,
  COMPANY_ENTRY_STORAGE_KEY,
} from "@/lib/landings/companyEntry";

const MARKER = "<!-- ============ 03 CHECK ============ -->";
const TOTAL = COMPANY_ENTRY_QUESTIONS.length;

const stepsHtml = COMPANY_ENTRY_QUESTIONS.map((q, qi) => {
  const rows = q.choices
    .map(
      (c, i) => `
          <button type="button" class="entry-option check-option w-full flex items-start gap-5 sm:gap-6 py-5 border-b border-white/10 text-left" data-code="${c.code}">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0 pt-1">${String(i + 1).padStart(2, "0")}</span>
            <span class="block">
              <span class="opt-label kr block text-[16px] sm:text-lg font-semibold text-white/80 leading-snug break-keep">${c.lead}</span>
              <span class="opt-detail kr mt-1.5 block text-[13px] sm:text-[14px] text-white/45 leading-relaxed break-keep">${c.detail}</span>
            </span>
          </button>`,
    )
    .join("");
  return `
      <div class="entry-step ${qi === 0 ? "" : "hidden"}" data-step="${qi}" data-q="${q.key}">
        <h3 class="kr text-xl sm:text-2xl font-semibold leading-snug break-keep">${q.title}</h3>
        <div class="mt-8" role="group" aria-label="${q.title}">${rows}
          <button type="button" class="entry-custom-toggle check-option w-full flex items-center gap-5 sm:gap-6 py-5 text-left">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">→</span><span class="opt-label kr text-[15px] sm:text-base text-white/60">${COMPANY_ENTRY_CUSTOM_LABEL}</span>
          </button>
        </div>
        <div class="entry-custom-wrap hidden mt-2">
          <textarea class="entry-custom-text kr w-full bg-transparent border border-white/15 rounded-lg px-4 py-3 text-[15px] text-white/85 placeholder-white/30 focus:outline-none focus:border-[#ff8f2e]" rows="3" maxlength="${COMPANY_ENTRY_CUSTOM_MAX}" placeholder="${COMPANY_ENTRY_CUSTOM_PLACEHOLDER}"></textarea>
          <div class="mt-3 text-right"><button type="button" class="entry-custom-next kr text-[14px] font-semibold text-[#ff8f2e] hover:text-[#ffa24f] transition-colors">다음 →</button></div>
        </div>
      </div>`;
}).join("");

const summaryRowsHtml = COMPANY_ENTRY_QUESTIONS.map(
  (q) => `
          <div class="flex items-baseline justify-between gap-6 py-4 border-b border-white/10">
            <span class="kr text-[13px] text-white/40 shrink-0">${q.summaryLabel}</span>
            <span class="entry-sum kr text-[15px] sm:text-base text-white/85 text-right break-keep" data-sum="${q.key}">-</span>
          </div>`,
).join("");

const ENTRY_BLOCK = `<!-- ============ ENTRY (이식 쪽 추가) ============ -->
<section id="companyEntry" class="relative py-20 md:py-28 border-t border-white/10">
  <div class="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">
    <div class="max-w-2xl mx-auto w-full border border-white/10 rounded-lg p-6 sm:p-12 min-h-[440px] flex flex-col">
      <div id="entryProgressWrap">
        <div class="flex items-center justify-between mb-4">
          <button type="button" id="entryBack" class="hidden items-center gap-1 text-[13px] text-white/35 hover:text-white/60 transition-colors">← 이전</button>
          <span id="entryStepLabel" class="text-[12px] text-white/35 tabular ml-auto">01 / ${String(TOTAL).padStart(2, "0")}</span>
        </div>
        <div class="h-px bg-white/10 mb-10"><div id="entryProgress" class="h-px bg-[#ff7a1f] transition-all duration-500 ease-out" style="width:${Math.round(100 / TOTAL)}%"></div></div>
      </div>
${stepsHtml}
      <div class="entry-step hidden" data-step="${TOTAL}" data-q="result">
        <div class="flex items-center justify-between mb-8">
          <button type="button" id="entryBack2" class="inline-flex items-center gap-1 text-[13px] text-white/35 hover:text-white/60 transition-colors">← 이전</button>
        </div>
        <span class="text-xs tracking-[0.2em] text-white/35">RESULT</span>
        <h3 class="kr mt-3 text-2xl sm:text-3xl font-bold leading-snug">입력한 내용을 정리했습니다.</h3>
        <div class="mt-8">${summaryRowsHtml}
        </div>
        <div class="mt-10">
          <a id="companyEntryCta" href="/register/company" class="inline-flex items-center gap-2 bg-[#ff7a1f] hover:bg-[#ff8f2e] text-[#050608] font-semibold text-[15px] px-7 py-3.5 rounded-md transition-colors">내 상황 확인하기 <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>
  </div>
</section>

`;

/** 원본 문자열에 마커가 없으면(원본이 바뀌었으면) 블록을 넣지 않고 원본 그대로 쓴다. */
export const COMPANY_LANDING_HTML_WITH_ENTRY: string = COMPANY_LANDING_HTML.includes(MARKER)
  ? COMPANY_LANDING_HTML.replace(MARKER, ENTRY_BLOCK + MARKER)
  : COMPANY_LANDING_HTML;

/** 3단계 선택 동작. 반환값은 정리 함수. */
export function initCompanyEntry(): () => void {
  const root = document.getElementById("companyEntry");
  if (!root) return () => {};
  const abort = new AbortController();
  const { signal } = abort;
  const steps = Array.from(root.querySelectorAll<HTMLElement>(".entry-step"));
  const progressWrap = root.querySelector<HTMLElement>("#entryProgressWrap");
  const progress = root.querySelector<HTMLElement>("#entryProgress");
  const label = root.querySelector<HTMLElement>("#entryStepLabel");
  const back = root.querySelector<HTMLElement>("#entryBack");
  const back2 = root.querySelector<HTMLElement>("#entryBack2");
  const cta = root.querySelector<HTMLAnchorElement>("#companyEntryCta");
  if (!progressWrap || !progress || !label || !back || !back2 || !cta) return () => {};

  const state: Record<string, { code: string; text: string }> = {};
  const leadByCode: Record<string, Record<string, string>> = {};
  COMPANY_ENTRY_QUESTIONS.forEach((q) => {
    leadByCode[q.key] = Object.fromEntries(q.choices.map((c) => [c.code, c.lead]));
  });
  let idx = 0;
  let timer: number | undefined;

  function show(i: number) {
    idx = i;
    steps.forEach((s) => s.classList.toggle("hidden", s.dataset.step !== String(i)));
    const isResult = i >= TOTAL;
    progressWrap!.classList.toggle("hidden", isResult);
    if (!isResult) {
      progress!.style.width = `${((i + 1) / TOTAL) * 100}%`;
      label!.textContent = `${String(i + 1).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`;
      back!.classList.toggle("hidden", i === 0);
      back!.classList.toggle("inline-flex", i !== 0);
    } else {
      renderResult();
    }
  }

  function renderResult() {
    const params = new URLSearchParams();
    COMPANY_ENTRY_QUESTIONS.forEach((q) => {
      const el = root!.querySelector<HTMLElement>(`[data-sum="${q.key}"]`);
      const s = state[q.key];
      if (el) el.textContent = s ? s.text : "-";
      if (s) params.set(q.key, s.code);
    });
    const qs = params.toString();
    cta!.href = qs ? `/register/company?${qs}` : "/register/company";
  }

  function pick(q: string, code: string, text: string) {
    state[q] = { code, text };
    window.clearTimeout(timer);
    timer = window.setTimeout(() => show(idx + 1), 280);
  }

  steps.forEach((step) => {
    const q = step.dataset.q ?? "";
    if (q === "result") return;
    step.querySelectorAll<HTMLButtonElement>(".entry-option").forEach((btn) => {
      btn.addEventListener(
        "click",
        () => {
          step.querySelectorAll(".check-option").forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          step.querySelector(".entry-custom-wrap")?.classList.add("hidden");
          const code = btn.dataset.code ?? "";
          pick(q, code, leadByCode[q]?.[code] ?? "");
        },
        { signal },
      );
    });
    const toggle = step.querySelector<HTMLButtonElement>(".entry-custom-toggle");
    const wrap = step.querySelector<HTMLElement>(".entry-custom-wrap");
    const text = step.querySelector<HTMLTextAreaElement>(".entry-custom-text");
    const next = step.querySelector<HTMLButtonElement>(".entry-custom-next");
    toggle?.addEventListener(
      "click",
      () => {
        step.querySelectorAll(".check-option").forEach((b) => b.classList.remove("selected"));
        toggle.classList.add("selected");
        wrap?.classList.remove("hidden");
        text?.focus({ preventScroll: true });
      },
      { signal },
    );
    next?.addEventListener(
      "click",
      () => {
        const v = (text?.value ?? "").trim().slice(0, COMPANY_ENTRY_CUSTOM_MAX);
        if (!v) {
          text?.classList.add("border-[#ff7a1f]");
          text?.focus();
          return;
        }
        text?.classList.remove("border-[#ff7a1f]");
        state[q] = { code: COMPANY_ENTRY_CUSTOM_CODE, text: v };
        show(idx + 1);
      },
      { signal },
    );
  });

  const goBack = () => {
    window.clearTimeout(timer);
    if (idx > 0) show(idx - 1);
  };
  back.addEventListener("click", goBack, { signal });
  back2.addEventListener("click", goBack, { signal });

  cta.addEventListener(
    "click",
    () => {
      try {
        const custom: Record<string, string> = {};
        Object.entries(state).forEach(([k, v]) => {
          if (v.code === COMPANY_ENTRY_CUSTOM_CODE) custom[k] = v.text;
        });
        if (Object.keys(custom).length) window.sessionStorage.setItem(COMPANY_ENTRY_STORAGE_KEY, JSON.stringify(custom));
        else window.sessionStorage.removeItem(COMPANY_ENTRY_STORAGE_KEY);
      } catch {
        /* 저장소를 못 쓰면 코드만 넘어간다 */
      }
    },
    { signal },
  );

  show(0);
  return () => {
    window.clearTimeout(timer);
    abort.abort();
  };
}
