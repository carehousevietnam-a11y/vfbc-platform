/** WorkPermit 랜딩 정적 마크업 (대표 제공 index.html 이식). 동작은 workPermitLandingScript.ts. */
export const LANDING_HTML = String.raw`
<!-- ============ NAV (same as other MY VIET CHECK pages) ============ -->
<header class="fixed top-0 inset-x-0 z-50 bg-[#050608]/85 backdrop-blur-sm">
  <nav class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
    <a href="#top" class="flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-[#ff7a1f]"></span>
      <span class="lp-display font-bold tracking-tight text-[15px]">MY VIET CHECK</span>
    </a>
    <div class="hidden md:flex items-center gap-8 text-[13px] text-white/50">
      <a href="#cost" class="hover:text-white transition-colors">비용</a>
      <a href="#check" class="hover:text-white transition-colors">진단</a>
      <a href="#direct" class="hover:text-white transition-colors">직접 확인</a>
    </div>
    <a id="navFreeCheckCta" href="#check" class="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#ff8f2e] hover:text-[#ffa95c] transition-colors">
      무료 진단 <span aria-hidden="true">→</span>
    </a>
    <button id="menuBtn" class="sm:hidden w-9 h-9 flex items-center justify-center" aria-label="메뉴 열기">
      <span class="relative w-4 h-3 block">
        <span class="absolute inset-x-0 top-0 h-px bg-white"></span>
        <span class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white"></span>
        <span class="absolute inset-x-0 bottom-0 h-px bg-white"></span>
      </span>
    </button>
  </nav>
</header>

<!-- mobile menu -->
<div id="mobileMenu" class="fixed inset-0 z-[55] bg-[#050608] hidden flex-col items-center justify-center gap-8 text-2xl lp-display font-medium">
  <button id="menuClose" class="absolute top-5 right-5 w-9 h-9 flex items-center justify-center text-white/60" aria-label="메뉴 닫기">✕</button>
  <a href="#cost" class="mobile-link opacity-0 translate-y-3">비용</a>
  <a href="#check" class="mobile-link opacity-0 translate-y-3">진단</a>
  <a href="#direct" class="mobile-link opacity-0 translate-y-3">직접 확인</a>
  <a id="mobileFreeCheckCta" href="#check" class="mobile-link opacity-0 translate-y-3 text-[#ff8f2e]">무료 진단 →</a>
</div>

<!-- ============ 01 HERO ============ -->
<section id="top" class="relative min-h-[100dvh] flex items-center overflow-hidden">
  <!-- background: work-permit documents video (layer 1) + black overlay (layer 2); all copy stays in HTML above -->
  <div id="heroMedia" class="hero-media" aria-hidden="true">
    <video id="heroVideo" class="hero-video" autoplay muted loop playsinline preload="metadata"
      src="/lp/wp/hero/work-permit-hero.mp4"></video>
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-b from-transparent to-[#050608]" aria-hidden="true"></div>

  <div class="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full pt-28 pb-24 lg:pt-24 lg:pb-16">
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] gap-x-12 xl:gap-x-20">

      <!-- left / top: label + headline -->
      <div id="heroContent" class="hero-left relative z-10 order-1 lg:order-none lg:col-start-1 lg:row-start-1 self-end lg:self-start">
        <div class="reveal">
          <p class="lp-display font-bold text-sm tracking-tight">MY VIET CHECK</p>
          <p class="mt-1 text-[10px] tracking-[0.25em] text-white/30">WORK PERMIT</p>
        </div>
        <p class="reveal kr mt-8 lg:mt-6 text-[14px] sm:text-[15px] text-white/55 leading-relaxed" style="--d:60">업체마다 다른 노동허가 비용,<br>정말 이 금액이 맞을까요?</p>
        <h1 class="reveal kr mt-4 text-[2.3rem] leading-[1.2] sm:text-5xl sm:leading-[1.16] lg:text-[3.4rem] lg:leading-[1.14] lp-display font-bold tracking-tight" style="--d:80">
          노동허가,<br><span class="text-[#ff8f2e]">얼마면</span> 받을 수 있을까요?
        </h1>
      </div>

      <!-- right: the user's own quote -->
      <div id="heroStage" class="order-3 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 self-center lg:self-start mt-14 lg:mt-0">
        <div class="reveal relative z-10 w-full max-w-[28rem] lg:max-w-[24rem] lg:ml-auto" style="--d:200">

          <!-- ask: one line, one input -->
          <p class="text-[10px] sm:text-[11px] tracking-[0.25em] text-white/40">QUOTE CHECK</p>
          <p class="kr mt-3 lg:mt-2.5 text-[1.5rem] sm:text-[1.75rem] lg:text-[1.55rem] leading-[1.3] lp-display font-bold tracking-tight text-white">내가 받은 노동허가 견적은?</p>
          <div class="relative">
          <form id="heroQuoteForm" class="mt-6 lg:mt-5 flex items-end gap-3" novalidate>
            <label for="heroQuoteInput" class="flex-1 min-w-0 flex items-baseline gap-2 border-b border-white/30 focus-within:border-[#ff8f2e] field-underline pb-2.5">
              <span class="lp-display font-semibold text-2xl sm:text-3xl lg:text-[1.6rem] text-white/50">$</span>
              <input id="heroQuoteInput" type="text" inputmode="numeric" autocomplete="off" placeholder="금액 입력" aria-label="받은 노동허가 견적 금액 (USD)" aria-describedby="heroQuoteError" class="flex-1 min-w-0 w-full bg-transparent outline-none lp-display font-semibold text-2xl sm:text-3xl lg:text-[1.6rem] tabular text-white placeholder:text-[0.6em] placeholder:font-normal">
            </label>
            <button type="submit" class="shrink-0 inline-flex items-center gap-2 border border-white/30 hover:border-[#ff8f2e] hover:text-[#ffa95c] text-white font-semibold text-[14px] px-5 py-3 rounded-md transition-colors">
              확인하기 <span aria-hidden="true">→</span>
            </button>
          </form>
          <p id="heroQuoteError" class="kr mt-2 min-h-[18px] lg:min-h-0 lg:absolute lg:left-0 lg:top-full text-[12px] text-[#ff8f2e]" aria-live="polite"></p>
          </div>

          <!-- gauge: $0 → $800 (position only, no verdict) -->
          <div class="gauge mt-10 lg:mt-7" id="gauge">
            <svg viewBox="-34 -6 468 228" aria-hidden="true">
              <g id="gTicks"></g>
              <g id="gLabels"></g>
              <path id="gBand" class="g-band" fill="none" stroke-width="2" stroke-linecap="round"/>
              <path class="g-track" d="M 40 190 A 160 160 0 0 1 360 190" fill="none" stroke-width="8" stroke-linecap="round"/>
              <path id="gFill" class="g-fill" d="M 40 190 A 160 160 0 0 1 360 190" fill="none" stroke-width="8" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000" opacity="0"/>
              <circle id="gDot" class="g-dot" cx="40" cy="190" r="8" fill="#6F9F78" stroke="#050608" stroke-width="3" opacity="0"/>
            </svg>
            <div class="gauge-readout" aria-live="polite">
              <p id="gaugeCaption" class="kr text-[12px] sm:text-[13px] text-white/45">견적을 입력해보세요</p>
              <p id="gaugeNum" class="gauge-num is-empty mt-2 lp-display font-black tabular whitespace-nowrap"><span class="cur">$</span><span id="heroNum">0</span></p>
            </div>
          </div>

          <!-- comparison: hidden until a quote is checked, then revealed in order after the gauge lands -->
          <div id="priceResult" class="mt-8" aria-live="polite">
            <p class="pr-step"><span class="price-status kr"><span id="priceMark" class="inline-flex"></span><span id="priceTitle"></span></span></p>
            <div class="pr-step mt-5 pt-4 border-t border-white/10 flex items-baseline justify-between gap-4">
              <span class="kr flex items-center gap-2 text-[12px] sm:text-[13px] text-white/45"><span class="inline-block w-3 h-[2px] rounded bg-white/40" aria-hidden="true"></span>현재 표시된 시장 일반가격 범위</span>
              <span class="lp-display font-semibold text-[15px] sm:text-base tabular text-white/80 whitespace-nowrap">$400 – $800</span>
            </div>
            <p class="pr-step kr mt-3 text-[11px] text-white/30 leading-relaxed">시장 일반가격은 개별 견적을 의미하지 않습니다.<br>실제 견적은 신청 유형, 서류 상태와 대행 범위에 따라 달라질 수 있습니다.</p>
            <button id="heroQuoteReset" type="button" class="pr-step kr mt-5 inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 underline underline-offset-4 decoration-white/20 transition-colors"><span aria-hidden="true">←</span> 다른 금액 확인하기</button>
          </div>
        </div>
      </div>

      <!-- left / bottom: sub + CTA -->
      <div id="heroContent2" class="relative z-10 lg:col-start-1 lg:row-start-2 self-start order-2 lg:order-none">
        <p class="reveal kr mt-7 lg:mt-6 text-[15px] sm:text-lg text-white/65 leading-relaxed max-w-[40ch]" style="--d:160">
          정부 비용부터 서류 준비비용, 대행비용까지<br class="hidden sm:inline"> 내가 실제로 부담할 비용을 확인해보세요.
        </p>
        <div class="reveal mt-9 lg:mt-8" style="--d:260">
          <a href="#check" class="inline-flex items-center gap-2 bg-[#ff7a1f] hover:bg-[#ff8f2e] text-[#050608] font-semibold px-6 py-3 rounded-md text-[14px] transition-colors">
            내 노동허가 비용 확인하기 <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

    </div>
  </div>

  <div class="absolute bottom-6 inset-x-0 z-10 pointer-events-none hidden lg:block" aria-hidden="true">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div id="scrollCue" class="inline-flex flex-col items-center gap-2.5 transition-opacity duration-700" style="opacity:0">
        <span class="text-[10px] tracking-[0.25em] text-white/35">SCROLL</span>
        <span class="scroll-cue"></span>
      </div>
    </div>
  </div>
</section>

<!-- ============ 02 COST ============ -->
<section id="cost" class="relative py-20 md:py-28 border-t border-white/10">
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
    <div class="reveal">
      <span class="text-xs tracking-[0.2em] text-white/35">COST</span>
      <h2 class="kr mt-4 text-3xl sm:text-4xl lg:text-5xl lp-display font-bold tracking-tight leading-[1.25]">노동허가 견적,<br>왜 업체마다 다를까요?</h2>
      <p class="kr mt-6 text-[15px] sm:text-lg text-white/55 leading-relaxed">공식 비용 외에도<br>준비해야 할 서류와 대행 범위에 따라<br>실제 견적은 달라질 수 있습니다.</p>
    </div>

    <div class="reveal mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 border-y border-white/10 relative" style="--d:100">
      <span class="absolute left-0 -top-px w-12 h-px bg-[#ff7a1f]" aria-hidden="true"></span>
      <div class="cost-col">
        <span class="lp-display font-semibold text-[13px] lg:text-[14px] text-[#ff8f2e] tabular">01</span>
        <p class="kr mt-5 text-2xl lg:text-[1.75rem] font-semibold tracking-tight text-white">공식 행정비용</p>
        <p class="kr mt-4 text-[14px] sm:text-[15px] text-white/50 leading-relaxed">정부·지방기관에 납부하는 비용입니다.<br>신청 지역과 절차에 따라 확인이 필요합니다.</p>
      </div>
      <div class="cost-col">
        <span class="lp-display font-semibold text-[13px] lg:text-[14px] text-[#ff8f2e] tabular">02</span>
        <p class="kr mt-5 text-2xl lg:text-[1.75rem] font-semibold tracking-tight text-white">서류 준비비용</p>
        <p class="kr mt-4 text-[14px] sm:text-[15px] text-white/50 leading-relaxed">건강검진, 증빙서류,<br>번역·공증 등 필요한 항목에 따라 달라집니다.</p>
      </div>
      <div class="cost-col">
        <span class="lp-display font-semibold text-[13px] lg:text-[14px] text-[#ff8f2e] tabular">03</span>
        <p class="kr mt-5 text-2xl lg:text-[1.75rem] font-semibold tracking-tight text-white">대행 범위</p>
        <p class="kr mt-4 text-[14px] sm:text-[15px] text-white/50 leading-relaxed">서류 준비부터 신청,<br>보완 대응까지 어디까지 맡기는지에 따라 달라집니다.</p>
      </div>
    </div>

    <!-- so what does it actually cost? the two reference figures -->
    <div class="reveal mt-20 lg:mt-24" style="--d:160">
      <p class="kr flex items-center gap-3 text-[13px] text-white/45"><span class="w-6 h-px bg-[#ff7a1f]" aria-hidden="true"></span>현재 확인되는 비용 기준</p>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 border-y border-white/10">
        <div class="ref-col">
          <p class="kr text-[15px] font-semibold text-white/85">관공서 공식비용</p>
          <p class="mt-6 ref-num lp-display font-bold tabular tracking-tight leading-none text-white whitespace-nowrap">400,000 – 1,000,000<span class="ref-unit text-white/45">VND</span></p>
          <p class="kr mt-4 text-[13px] text-white/45">지역별 상이</p>
        </div>
        <div class="ref-col">
          <p class="kr text-[15px] font-semibold text-white/85">시장 일반가격</p>
          <p class="mt-6 ref-num lp-display font-bold tabular tracking-tight leading-none text-[#ff8f2e] whitespace-nowrap">$400 – $800</p>
          <p class="kr mt-4 text-[13px] text-white/45">일반적인 시장가격 범위</p>
          <!-- links back to the hero quote: the visitor's own figure next to the reference -->
          <div class="mt-7 pt-5 border-t border-white/10 flex items-baseline justify-between gap-4">
            <span class="kr text-[13px] text-white/45">내가 받은 견적</span>
            <a id="costMyQuote" href="#top" class="kr text-[14px] font-semibold text-white/60 hover:text-[#ffa95c] transition-colors">입력하고 비교하기 →</a>
          </div>
        </div>
      </div>

      <p class="kr mt-6 text-[12px] text-white/30 leading-relaxed">※ 실제 견적은 신청 유형, 근무 지역,<br class="sm:hidden"> 서류 준비 상태와 대행 범위에 따라 달라질 수 있습니다.</p>
    </div>
  </div>
</section>

<!-- ============ 03 CHECK ============ -->
<section id="check" class="relative py-20 md:py-32 border-t border-white/10">
  <div class="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">
    <div class="reveal text-center">
      <span class="text-xs tracking-[0.2em] text-white/35">CHECK</span>
      <h2 class="kr mt-4 text-3xl sm:text-4xl lp-display font-bold tracking-tight leading-[1.25]">그럼, 내 경우에는<br>무엇을 확인해야 할까요?</h2>
      <p class="kr mt-5 text-[15px] sm:text-base text-white/50 leading-relaxed">몇 가지 질문에 답하면<br>내 상황에서 확인해야 할 비용 항목을 정리합니다.</p>
    </div>

    <div class="reveal mt-14 max-w-2xl mx-auto w-full border border-white/10 rounded-lg p-6 sm:p-12 min-h-[460px] flex flex-col" style="--d:100">

      <div id="quizHead">
        <div class="flex items-center justify-between mb-10">
          <button id="quizBack" class="hidden items-center gap-1 text-[13px] text-white/35 hover:text-white/60 transition-colors">← 이전</button>
          <span id="quizStepLabel" class="text-[12px] text-white/35 tabular ml-auto">01 / 04</span>
        </div>
        <div class="h-px bg-white/10 -mt-8 mb-10">
          <div id="quizProgress" class="h-px bg-[#ff7a1f] transition-all duration-500 ease-out" style="width:25%"></div>
        </div>
      </div>

      <!-- Q1–Q4 are rendered from QUESTIONS -->
      <div id="quizSteps"></div>

      <!-- DONE: a short read-back of the answers (no verdict, no CTA) — DIRECT CHECK follows -->
      <div class="quiz-step hidden flex-1 flex-col justify-center" data-step="done" aria-live="polite">
        <span class="text-[12px] text-[#ff8f2e] tabular">04 / 04</span>
        <h3 class="kr mt-3 text-xl sm:text-2xl font-semibold leading-snug">확인했습니다.</h3>
        <p id="doneSummary" class="kr mt-6 pt-6 border-t border-white/10 text-[15px] sm:text-base text-white/85 leading-relaxed tabular"></p>
        <p id="doneNote" class="kr mt-3 pb-6 border-b border-white/10 text-[14px] sm:text-[15px] text-white/50 leading-relaxed"></p>
        <button id="quizRestart" type="button" class="kr mt-6 self-start text-[12px] text-white/40 hover:text-white/70 underline underline-offset-4 decoration-white/20 transition-colors">다시 입력하기</button>
      </div>
    </div>
  </div>
</section>

<!-- ============ 04 DIRECT CHECK ============ -->
<section id="direct" class="relative border-t border-white/10 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-32 lg:pb-40">
  <!-- desktop: left = copy (row 1) + CTA (row 2), right = product demo spanning both rows.
       phones: copy → product demo → CTA, so the CTA never comes before the real screen. -->
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-[auto_1fr] gap-x-16 gap-y-12 lg:gap-y-0 items-start">

    <div class="reveal order-1 lg:order-none lg:col-start-1 lg:row-start-1">
      <span class="text-xs tracking-[0.2em] text-white/35">DIRECT CHECK</span>
      <h2 class="kr mt-3 sm:mt-4 text-[1.75rem] sm:text-4xl lg:text-[2.75rem] lp-display font-bold tracking-tight leading-snug">
        견적만 확인하고<br>맡기지 마세요.
      </h2>
      <p class="kr mt-4 text-lg sm:text-xl lg:text-[1.4rem] lp-display font-semibold tracking-tight text-white/85">내 노동허가 가능성부터 확인해보세요.</p>
      <p class="kr mt-5 text-white/50 text-[14px] sm:text-base leading-relaxed max-w-[40ch]">
        학력·경력·직무 형태에 따라 노동허가 발급 가능 여부가 달라질 수 있습니다.
        실제 MY VIET CHECK에서 몇 가지 질문을 통해 내 상황을 확인할 수 있습니다.
      </p>
    </div>

    <!-- CTA: follows the copy on the left -->
    <div class="reveal order-3 lg:order-none lg:col-start-1 lg:row-start-2 lg:mt-12 pt-10 border-t border-white/10 lg:max-w-sm" style="--d:120">
      <p class="kr text-[15px] sm:text-base text-white/70">내 상황을 직접 확인해보세요.</p>
      <a id="directServiceCta" href="/check/wp" class="mt-5 inline-flex items-center gap-2 bg-[#ff7a1f] hover:bg-[#ff8f2e] text-[#050608] font-semibold px-5 py-2.5 rounded-md text-[14px] transition-colors">
        내 노동허가 가능성 확인하기 <span aria-hidden="true">→</span>
      </a>
    </div>

    <div class="reveal order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 min-w-0" style="--d:100">
      <p class="text-[10px] tracking-[0.2em] text-white/30 mb-3">REAL PRODUCT DEMO · 실제 MY VIET CHECK 노동허가 가능성 진단 화면</p>

      <!-- real service captures (01/05 – 05/05); click opens the original size -->
      <a id="shotFrame" class="shot-frame" href="/lp/wp/direct-check/work-permit-check-01.jpg" target="_blank" rel="noopener" aria-label="실제 진단 화면 원본 크기로 보기">
        <img class="shot-img is-active" data-stage="0" src="/lp/wp/direct-check/work-permit-check-01.jpg" width="1064" height="436" decoding="async" alt="MY VIET CHECK 노동허가 가능성 진단 01/05 — 이전에 다른 곳에서 신청했다가 거절·반려된 적이 있나요?">
        <img class="shot-img" data-stage="1" src="/lp/wp/direct-check/work-permit-check-02.jpg" width="1002" height="499" decoding="async" alt="MY VIET CHECK 노동허가 가능성 진단 02/05 — 최종 학력이 어떻게 되시나요?">
        <img class="shot-img" data-stage="2" src="/lp/wp/direct-check/work-permit-check-03.jpg" width="1016" height="518" decoding="async" alt="MY VIET CHECK 노동허가 가능성 진단 03/05 — 해당 직무 관련 경력은 얼마나 되시나요?">
        <img class="shot-img" data-stage="3" src="/lp/wp/direct-check/work-permit-check-04.jpg" width="1033" height="452" decoding="async" alt="MY VIET CHECK 노동허가 가능성 진단 04/05 — 담당 직무가 기술·혁신·디지털전환 관련 우선분야에 해당하나요?">
        <img class="shot-img" data-stage="4" src="/lp/wp/direct-check/work-permit-check-05.jpg" width="1020" height="452" decoding="async" alt="MY VIET CHECK 노동허가 가능성 진단 05/05 — 담당하실 직무 형태는 무엇인가요?">
      </a>
      <p class="kr mt-3 text-[11px] text-white/30">화면을 누르면 원본 크기로 볼 수 있습니다.</p>

      <!-- step bar: five equal columns, one hairline behind the numbers; long labels wrap on phones -->
      <ol class="shot-steps mt-7" id="shotSteps">
        <li><button type="button" class="ai-step-btn is-active" data-stage="0" aria-label="01 반려 이력">01</button><span class="ai-step-label is-active" data-stage="0">반려 이력</span></li>
        <li><button type="button" class="ai-step-btn" data-stage="1" aria-label="02 최종 학력">02</button><span class="ai-step-label" data-stage="1">최종 학력</span></li>
        <li><button type="button" class="ai-step-btn" data-stage="2" aria-label="03 관련 경력">03</button><span class="ai-step-label" data-stage="2">관련 경력</span></li>
        <li><button type="button" class="ai-step-btn" data-stage="3" aria-label="04 우선분야 해당 여부">04</button><span class="ai-step-label" data-stage="3">우선분야<br class="sm:hidden"> 해당 여부</span></li>
        <li><button type="button" class="ai-step-btn" data-stage="4" aria-label="05 직무 형태">05</button><span class="ai-step-label" data-stage="4">직무 형태</span></li>
      </ol>
    </div>
  </div>
</section>

<!-- ============ FOOTER ============ -->
<footer class="relative border-t border-white/10 py-14">
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-[#ff7a1f]"></span>
      <span class="lp-display font-bold text-sm tracking-tight">MY VIET CHECK</span>
    </div>
    <div class="flex items-center gap-6 text-[13px] text-white/40">
      <a href="#cost" class="hover:text-white/70 transition-colors">비용</a>
      <a href="#check" class="hover:text-white/70 transition-colors">진단</a>
      <a href="#direct" class="hover:text-white/70 transition-colors">직접 확인</a>
    </div>
    <p class="text-[12px] text-white/25">© 2026 MY VIET CHECK · VFBCAI</p>
  </div>
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-8 pt-6 border-t border-white/10">
    <p class="text-[11px] text-white/25 leading-relaxed kr max-w-3xl">
      본 페이지는 베트남 노동허가(Work Permit) 비용 구조를 이해하는 데 도움을 드리기 위한 일반 정보 제공 목적이며, 법률 자문을 대체하지 않습니다. 베트남 노동허가 제도는 2025년 8월 7일부터 Nghị định 219/2025/NĐ-CP가 적용되며, 공식 수수료·처리기간·필요 서류는 신청 유형과 관할 기관에 따라 달라질 수 있습니다. 자가진단 결과는 입력한 정보를 바탕으로 한 참고용 정리이며, 비용을 확정하거나 발급 여부를 판단하지 않습니다.
    </p>
  </div>
</footer>
`;
