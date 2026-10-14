/** 법인설립 랜딩 정적 마크업 (대표 제공 index.html 이식). 동작은 CompanyLandingClient.tsx. */
export const COMPANY_LANDING_HTML = String.raw`
<!-- ============ NAV (same as receivable page) ============ -->
<header class="fixed top-0 inset-x-0 z-50 bg-[#050608]/85 backdrop-blur-sm border-b border-white/10">
  <nav class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
    <a href="#top" class="flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-[#ff7a1f]"></span>
      <span class="lp-display font-bold tracking-tight text-[15px]">MY VIET CHECK</span>
    </a>
    <div class="hidden md:flex items-center gap-8 text-[13px] text-white/50">
      <a href="#check" class="hover:text-white transition-colors">진단</a>
      <a href="#ai-review" class="hover:text-white transition-colors">직접 확인</a>
    </div>
    <a id="navFreeCheckCta" href="/register/company" class="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#ff8f2e] hover:text-[#ffa95c] transition-colors">
      무료 진단 <span aria-hidden="true">→</span>
    </a>
    <button id="menuBtn" class="md:hidden w-9 h-9 flex items-center justify-center" aria-label="메뉴 열기">
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
  <a href="#check" class="mobile-link opacity-0 translate-y-3">진단</a>
  <a href="#ai-review" class="mobile-link opacity-0 translate-y-3">직접 확인</a>
  <a id="mobileFreeCheckCta" href="/register/company" class="mobile-link opacity-0 translate-y-3 text-[#ff8f2e]">무료 진단 →</a>
</div>

<!-- ============ 01 HERO (cost count-up) ============ -->
<section id="top" class="relative min-h-[100dvh] flex items-center overflow-hidden">

  <!-- background: company-formation video (layer 1) + dark overlay (layer 2); all text stays in HTML above -->
  <div id="heroMedia" class="hero-media" aria-hidden="true">
    <video id="heroVideo" class="hero-video" autoplay muted loop playsinline preload="auto"
      src="/lp/company/hero/company-formation.mp4"></video>
    <div class="hero-overlay"></div>
  </div>
  <div class="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-b from-transparent to-[#050608]" aria-hidden="true"></div>

  <div class="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full pt-28 pb-24 lg:pt-24 lg:pb-16">
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_auto] gap-x-12 xl:gap-x-16">

      <!-- left / top: label + headline -->
      <div id="heroContent" class="relative z-10 lg:col-start-1 lg:row-start-1 self-end">
        <div class="reveal">
          <p class="lp-display font-bold text-sm tracking-tight">MY VIET CHECK</p>
          <p class="mt-1 text-[10px] tracking-[0.25em] text-white/30">COMPANY INCORPORATION</p>
        </div>
        <p class="reveal kr mt-8 text-[14px] sm:text-[15px] text-white/55" style="--d:60">베트남에서 사업을 시작하려는 분이라면</p>
        <h1 class="reveal kr mt-3 text-[2.3rem] leading-[1.2] sm:text-5xl sm:leading-[1.16] lg:text-[3.3rem] lg:leading-[1.14] lp-display font-bold tracking-tight" style="--d:80">
          법인설립,<br><span class="text-[#ff8f2e]">대행사부터</span> 찾지 마세요.
        </h1>
      </div>

      <!-- right: the user's own quote — ask first, show price + position only after they check -->
      <div id="heroStage" class="lg:col-start-2 lg:row-start-1 lg:row-span-2 self-center mt-12 lg:mt-0">
        <div class="relative z-10 w-full max-w-[28rem] lg:ml-auto lg:pl-4 lg:box-content">

          <!-- ASK: one question, one input -->
          <div id="priceAsk" class="price-state">
            <p class="text-[10px] sm:text-[11px] tracking-[0.25em] text-white/40">MY VIET CHECK</p>
            <p class="kr mt-4 text-[1.75rem] sm:text-[2rem] lg:text-[2.25rem] leading-[1.25] lp-display font-bold tracking-tight text-white">내가 받은 견적은<br>어느 정도일까요?</p>
            <p class="kr mt-4 text-[14px] sm:text-[15px] text-white/50">대행사에서 받은 견적 금액을 입력해보세요.</p>
            <form id="heroQuoteForm" class="mt-8" novalidate>
              <label for="heroQuoteInput" class="flex items-baseline gap-2 border-b border-white/30 focus-within:border-[#ff8f2e] field-underline pb-3">
                <span class="lp-display font-semibold text-3xl sm:text-4xl text-white/50">$</span>
                <input id="heroQuoteInput" type="text" inputmode="numeric" autocomplete="off" placeholder="3,200" aria-label="받은 견적 금액 (USD)" class="flex-1 min-w-0 w-full bg-transparent outline-none lp-display font-semibold text-3xl sm:text-4xl tabular text-white">
              </label>
              <p id="heroQuoteError" class="kr hidden mt-2 text-[12px] text-[#ff8f2e]">숫자로 입력해 주세요. 예: 3,200</p>
              <button type="submit" class="mt-6 inline-flex items-center gap-2 border border-white/30 hover:border-[#ff8f2e] hover:text-[#ffa95c] text-white font-semibold text-[14px] px-6 py-3 rounded-md transition-colors">
                확인하기 <span aria-hidden="true">→</span>
              </button>
            </form>
          </div>

          <!-- RESULT: amount → bar → one status line → range → disclaimer → next step -->
          <div id="priceResult" class="price-state hidden" aria-live="polite">
            <p class="hero-num lp-display font-black tabular whitespace-nowrap"><span class="cur text-white/45">$</span><span id="heroNum">0</span></p>
            <div class="mt-6 sm:mt-7" aria-hidden="true">
              <div class="price-bar"><div id="heroGaugeFill" class="price-bar-fill"></div></div>
              <div class="mt-2.5 flex justify-between lp-display text-[11px] sm:text-[12px] tabular text-white/40">
                <span>$0</span><span>$5,000+</span>
              </div>
            </div>

            <div id="priceAfter" class="price-after">
              <p class="mt-6"><span class="price-status kr"><span id="heroQuoteMark" class="inline-flex"></span><span id="heroQuoteTitle"></span></span></p>
              <p id="heroQuoteDesc" class="kr mt-3 text-[13px] text-white/55 leading-relaxed"></p>

              <div class="mt-8 pt-5 border-t border-white/10 flex items-baseline justify-between gap-4">
                <span class="kr text-[12px] text-white/45">시장 일반가격</span>
                <span class="lp-display font-semibold text-[15px] tabular text-white/85 whitespace-nowrap">$2,000 – $5,000+</span>
              </div>
              <p class="kr mt-2 text-[11px] text-white/30 leading-relaxed">시장 일반 대행가격 범위이며, 개별 견적을 의미하지 않습니다.</p>

              <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href="#check" class="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#ff8f2e] hover:text-[#ffa95c] transition-colors">내 상황도 직접 확인하기 <span aria-hidden="true">→</span></a>
                <button id="heroQuoteReset" type="button" class="kr text-[13px] text-white/45 hover:text-white/75 underline underline-offset-4 decoration-white/20 transition-colors">다른 금액 확인하기</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- left / bottom: sub + CTA -->
      <div id="heroContent2" class="relative z-10 lg:col-start-1 lg:row-start-2 self-start">
        <p class="reveal kr mt-12 lg:mt-6 text-[15px] sm:text-lg text-white/70 leading-relaxed max-w-[40ch]" style="--d:160">
          업체마다 견적은 다릅니다.<br>먼저 내 상황에 필요한 비용부터 확인하세요.
        </p>
        <div class="reveal mt-9" style="--d:260">
          <a href="#check" class="inline-flex items-center gap-2 bg-[#ff7a1f] hover:bg-[#ff8f2e] text-[#050608] font-semibold px-6 py-3 rounded-md text-[14px] transition-colors">
            내 상황 먼저 확인하기 <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

    </div>
  </div>

  <div class="absolute bottom-6 inset-x-0 z-10 pointer-events-none" aria-hidden="true">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
      <div id="scrollCue" class="inline-flex flex-col items-center gap-2.5 transition-opacity duration-700" style="opacity:0">
        <span class="text-[10px] tracking-[0.25em] text-white/35">SCROLL</span>
        <span class="scroll-cue"></span>
      </div>
    </div>
  </div>
</section>

<!-- ============ 02 COST ============ -->
<section id="cost" class="relative py-24 md:py-36 border-t border-white/10">
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
    <div class="reveal">
      <span class="text-xs tracking-[0.2em] text-white/35">COST</span>
      <h2 class="kr mt-4 text-3xl sm:text-4xl lg:text-5xl lp-display font-bold tracking-tight leading-[1.25]">같은 법인설립인데,<br>왜 견적은 <span class="sm:whitespace-nowrap">$2,000부터 $5,000+까지</span>일까요?</h2>
      <p class="kr mt-6 text-[15px] sm:text-lg text-white/55 leading-relaxed">정부에 내는 공식 수수료와<br>대행업체에 지급하는 비용은 다릅니다.</p>
    </div>

    <div class="reveal mt-14 lg:mt-20 grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_auto_minmax(0,3fr)] items-stretch border-y border-white/10" style="--d:100">
      <!-- official fees: online / offline / publication kept as separate lines -->
      <div class="py-10 md:py-14 md:pr-12">
        <p class="kr text-[15px] font-semibold text-white/85">관공서 공식비용</p>
        <p class="kr mt-1 text-[12px] text-white/40">정부기관에 납부하는 공식 수수료</p>

        <p class="mt-8 lp-display font-bold tabular tracking-tight cost-zero leading-none text-white">0<span class="text-[0.42em] text-white/50 ml-3 tracking-normal">VND</span></p>
        <p class="kr mt-3 text-[13px] text-white/55">ERC 온라인 신청</p>

        <dl class="mt-8 border-t border-white/10">
          <div class="flex items-baseline justify-between gap-4 py-3.5 border-b border-white/10">
            <dt class="kr text-[13px] text-white/45">ERC 오프라인 신청</dt>
            <dd class="lp-display font-semibold text-[15px] sm:text-base tabular text-white/85">25,000 VND</dd>
          </div>
          <div class="flex items-baseline justify-between gap-4 py-3.5">
            <dt class="kr text-[13px] text-white/45">공표</dt>
            <dd class="lp-display font-semibold text-[15px] sm:text-base tabular text-white/85">100,000 VND</dd>
          </div>
        </dl>
      </div>

      <div class="flex md:flex-col items-center gap-4 md:gap-5" aria-hidden="true">
        <span class="flex-1 h-px md:h-auto md:w-px bg-white/10"></span>
        <span class="lp-display text-[11px] tracking-[0.25em] text-white/35">VS</span>
        <span class="flex-1 h-px md:h-auto md:w-px bg-white/10"></span>
      </div>

      <div class="py-10 md:py-14 md:pl-12 flex flex-col">
        <p class="kr text-[15px] font-semibold text-white/85">시장 일반가격</p>
        <p class="kr mt-1 text-[12px] text-white/40">대행 포함 일반적인 시장 가격 범위</p>

        <p class="mt-8 cost-range lp-display font-bold tabular tracking-tight leading-none whitespace-nowrap text-[#ff8f2e]">$2,000 – $5,000+</p>
        <p class="kr mt-3 text-[13px] text-white/55">개별 견적이 아닌, 일반적인 시장가격 범위입니다.</p>
      </div>
    </div>

    <p class="reveal kr mt-5 text-[12px] text-white/30 leading-relaxed" style="--d:120">
      관공서 공식비용은 신청 방식에 따라 다르며, 공표 비용은 별도 항목입니다. 기준은 시점·관할 기관에 따라 변경될 수 있습니다.
    </p>

    <div class="reveal mt-16 lg:mt-20 max-w-3xl" style="--d:160">
      <p class="kr text-2xl sm:text-3xl lg:text-[2.1rem] lp-display font-bold tracking-tight leading-snug text-white">
        차이는 공식 수수료가 아니라,<br>대행에 포함되는 범위에서 생깁니다.
      </p>
      <p class="kr mt-5 text-[15px] sm:text-lg text-white/50 leading-relaxed">
        같은 “법인설립”이라도<br class="sm:hidden"> <span class="text-white/90 font-semibold">어디까지 대행하느냐</span>에 따라 견적이 달라집니다.
      </p>
    </div>

    <div class="reveal mt-16 lg:mt-20" style="--d:200">
      <p class="text-[13px] text-white/40 kr">대행 비용에는 다음 항목이 포함될 수 있습니다.</p>
      <ul class="svc-list relative mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-white/10">
        <span class="absolute left-0 -top-px w-12 h-px bg-[#ff7a1f]" aria-hidden="true"></span>
        <li class="svc-item border-b border-white/10 lg:border-b-0" style="--i:0"><span class="svc-num">01</span><span class="svc-name kr">번역</span></li>
        <li class="svc-item border-b border-white/10 lg:border-b-0" style="--i:1"><span class="svc-num">02</span><span class="svc-name kr">공증·인증</span></li>
        <li class="svc-item border-b border-white/10 lg:border-b-0" style="--i:2"><span class="svc-num">03</span><span class="svc-name kr">법인 인감</span></li>
        <li class="svc-item border-b border-white/10 sm:border-b-0" style="--i:3"><span class="svc-num">04</span><span class="svc-name kr">전자서명</span></li>
        <li class="svc-item" style="--i:4"><span class="svc-num">05</span><span class="svc-name kr">세무 초기 설정</span></li>
        <li class="svc-item" style="--i:5"><span class="svc-num">06</span><span class="svc-name kr">외국인 투자 서류</span></li>
      </ul>
      <p class="kr mt-10 sm:mt-12 text-[12px] text-white/30">※ 실제 포함 범위와 비용은 업체 및 투자 조건에 따라 달라질 수 있습니다.</p>
    </div>
  </div>
</section>

<!-- ============ 03 CHECK ============ -->
<section id="check" class="relative py-24 md:py-36 border-t border-white/10">
  <div class="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">
    <div class="reveal text-center">
      <span class="text-xs tracking-[0.2em] text-white/35">CHECK</span>
      <h2 class="kr mt-4 text-3xl sm:text-4xl lp-display font-bold tracking-tight">그럼, 내 경우는 어떨까요?</h2>
      <p class="kr mt-5 text-[15px] sm:text-base text-white/50 leading-relaxed">투자 방식과 사업 준비 상황에 따라<br>필요한 절차와 서류가 달라집니다.</p>
    </div>

    <div class="reveal mt-14 max-w-2xl mx-auto w-full border border-white/10 rounded-lg p-6 sm:p-12 min-h-[440px] flex flex-col" style="--d:100">

      <div id="quizProgressWrap" class="flex items-center justify-between mb-10">
        <button id="quizBack" class="hidden items-center gap-1 text-[13px] text-white/35 hover:text-white/60 transition-colors">← 이전</button>
        <span id="quizStepLabel" class="text-[12px] text-white/35 tabular ml-auto">01 / 04</span>
      </div>
      <div class="h-px bg-white/10 -mt-8 mb-10">
        <div id="quizProgress" class="h-px bg-[#ff7a1f] transition-all duration-500 ease-out" style="width:25%"></div>
      </div>

      <!-- STEP 1: investor -->
      <div class="quiz-step" data-step="1">
        <h3 class="kr text-xl sm:text-2xl font-semibold leading-snug">누가 투자하나요?</h3>
        <div class="mt-8" data-group="investor">
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="한국인 개인">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">01</span><span class="opt-label kr text-lg sm:text-xl text-white/75">한국인 개인</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="한국 법인">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">02</span><span class="opt-label kr text-lg sm:text-xl text-white/75">한국 법인</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="공동 투자">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">03</span><span class="opt-label kr text-lg sm:text-xl text-white/75">공동 투자</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 text-left" data-value="아직 정하지 않음">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">04</span><span class="opt-label kr text-lg sm:text-xl text-white/75">아직 정하지 않음</span>
          </button>
        </div>
      </div>

      <!-- STEP 2: industry -->
      <div class="quiz-step hidden" data-step="2">
        <h3 class="kr text-xl sm:text-2xl font-semibold leading-snug">어떤 사업인가요?</h3>
        <div class="mt-8" data-group="industry">
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="무역·유통">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">01</span><span class="opt-label kr text-lg sm:text-xl text-white/75">무역·유통</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="제조">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">02</span><span class="opt-label kr text-lg sm:text-xl text-white/75">제조</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="IT·소프트웨어">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">03</span><span class="opt-label kr text-lg sm:text-xl text-white/75">IT·소프트웨어</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="요식업·F&amp;B">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">04</span><span class="opt-label kr text-lg sm:text-xl text-white/75">요식업·F&amp;B</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="서비스·컨설팅">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">05</span><span class="opt-label kr text-lg sm:text-xl text-white/75">서비스·컨설팅</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 text-left" data-value="기타">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">06</span><span class="opt-label kr text-lg sm:text-xl text-white/75">기타</span>
          </button>
        </div>
      </div>

      <!-- STEP 3: premises -->
      <div class="quiz-step hidden" data-step="3">
        <h3 class="kr text-xl sm:text-2xl font-semibold leading-snug">사업장은 준비됐나요?</h3>
        <div class="mt-8" data-group="site">
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="준비됨">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">01</span><span class="opt-label kr text-lg sm:text-xl text-white/75">준비됨</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="알아보는 중">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">02</span><span class="opt-label kr text-lg sm:text-xl text-white/75">알아보는 중</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 text-left" data-value="아직 없음">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">03</span><span class="opt-label kr text-lg sm:text-xl text-white/75">아직 없음</span>
          </button>
        </div>
      </div>

      <!-- STEP 4: existing quote -->
      <div class="quiz-step hidden" data-step="4">
        <h3 class="kr text-xl sm:text-2xl font-semibold leading-snug">이미 받은 견적이 있나요?</h3>
        <div class="mt-8" data-group="hasQuote" data-manual="true">
          <button class="check-option w-full flex items-baseline gap-6 py-4 border-b border-white/10 text-left" data-value="있음">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">01</span><span class="opt-label kr text-lg sm:text-xl text-white/75">있음</span>
          </button>
          <button class="check-option w-full flex items-baseline gap-6 py-4 text-left" data-value="없음">
            <span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">02</span><span class="opt-label kr text-lg sm:text-xl text-white/75">없음</span>
          </button>
        </div>
        <div id="quoteField" class="hidden mt-10 max-w-sm">
          <label for="quoteAmount" class="block text-[13px] text-white/50">받은 견적 금액 (USD)</label>
          <div class="mt-3 flex items-baseline gap-2 border-b border-white/30 focus-within:border-[#ff8f2e] field-underline pb-3">
            <span class="lp-display font-semibold text-3xl sm:text-4xl text-white/60">$</span>
            <input id="quoteAmount" type="text" inputmode="numeric" placeholder="0" class="flex-1 min-w-0 w-full bg-transparent outline-none text-3xl sm:text-4xl lp-display font-semibold tabular text-white">
          </div>
          <button id="quoteSubmit" class="mt-6 inline-flex items-center gap-2 bg-[#ff7a1f] hover:bg-[#ff8f2e] text-[#050608] font-semibold px-6 py-3 rounded-md text-[14px] transition-colors">
            정리 보기 <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <!-- RESULT -->
      <div class="quiz-step hidden" data-step="result">
        <span class="text-xs tracking-[0.2em] text-white/35">RESULT</span>
        <h3 class="kr mt-4 text-2xl sm:text-3xl lp-display font-bold leading-snug">입력한 내용을 정리했습니다.</h3>

        <div class="mt-10">
          <div class="flex items-baseline justify-between gap-6 py-4 border-b border-white/10">
            <span class="text-sm text-white/40 shrink-0">설립 형태</span><span id="sumForm" class="text-base text-right">-</span>
          </div>
          <div class="flex items-baseline justify-between gap-6 py-4 border-b border-white/10">
            <span class="text-sm text-white/40 shrink-0">투자 주체</span><span id="sumInvestor" class="text-base text-right">-</span>
          </div>
          <div class="flex items-baseline justify-between gap-6 py-4 border-b border-white/10">
            <span class="text-sm text-white/40 shrink-0">사업</span><span id="sumIndustry" class="text-base text-right">-</span>
          </div>
          <div class="flex items-baseline justify-between gap-6 py-4 border-b border-white/10">
            <span class="text-sm text-white/40 shrink-0">사업장</span><span id="sumSite" class="text-base text-right">-</span>
          </div>
          <div class="flex items-baseline justify-between gap-6 py-4">
            <span class="text-sm text-white/40 shrink-0">받은 견적</span><span id="sumQuote" class="lp-display font-semibold text-xl tabular text-right">-</span>
          </div>
        </div>

        <div class="mt-10 pt-8 border-t border-white/10">
          <p class="kr text-[14px] text-white/60 leading-relaxed">현재 입력한 정보를 기준으로<br class="sm:hidden"> 확인이 필요한 항목을 정리합니다.</p>
          <ol id="sumChecklist" class="mt-6 space-y-3"></ol>
        </div>

        <a href="#ai-review" class="mt-10 inline-flex items-center gap-2 bg-[#ff7a1f] hover:bg-[#ff8f2e] text-[#050608] font-semibold px-6 py-3 rounded-md text-[14px] transition-colors">
          직접 확인하러 가기 →
        </a>
        <p class="kr mt-8 text-[13px] text-white/40 leading-relaxed max-w-[44ch]">
          이 정리는 승인 여부나 진행 가능성을 판단하지 않습니다. 실제 요건은 투자 구조와 서류를 확인한 후 판단해야 합니다.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ============ 04 DIRECT CHECK ============ -->
<section id="ai-review" class="relative border-t border-white/10 py-20 sm:py-28 lg:py-32">
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 lg:gap-16 items-start">

    <div class="reveal">
      <span class="text-xs tracking-[0.2em] text-white/35">DIRECT CHECK</span>
      <h2 class="kr mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-[2.75rem] lp-display font-bold tracking-tight leading-snug">
        먼저, 직접 확인해보세요.
      </h2>
      <p class="kr mt-5 text-white/50 text-[14px] sm:text-base lg:text-lg leading-relaxed max-w-[36ch]">
        몇 가지 질문에 답하면,<br>
        내 상황에서 먼저 확인해야 할 내용을 정리해드립니다.
      </p>

      <!-- summary of the demo flow on the right; the current step is echoed here -->
      <ol id="directFlow" class="mt-10 sm:mt-12 max-w-sm border-t border-white/10">
        <li><button type="button" class="flow-row is-active" data-stage="0"><span class="flow-num">01</span><span class="flow-label">기본 이력</span></button></li>
        <li><button type="button" class="flow-row" data-stage="1"><span class="flow-num">02</span><span class="flow-label">투자 방식</span></button></li>
        <li><button type="button" class="flow-row" data-stage="2"><span class="flow-num">03</span><span class="flow-label">투자금 증빙</span></button></li>
        <li><button type="button" class="flow-row" data-stage="3"><span class="flow-num">04</span><span class="flow-label">사업장</span></button></li>
        <li><button type="button" class="flow-row" data-stage="4"><span class="flow-num">05</span><span class="flow-label">대표자 거주</span></button></li>
      </ol>
      <p class="kr mt-5 text-[13px] text-white/40 leading-relaxed">
        입력한 내용을 기준으로<br>확인이 필요한 항목을 정리합니다.
      </p>
    </div>

    <div class="reveal" style="--d:100">
      <p class="text-[10px] tracking-[0.2em] text-white/30 mb-3 text-center lg:text-left">REAL PRODUCT DEMO · 실제 MY VIET CHECK 검토 화면</p>

      <div class="relative max-w-[480px] mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-white/10 bg-white">
        <img id="aiReviewImg" src="/lp/company/direct_check_shots/step-01.png" alt="MY VIET CHECK 법인설립 진단 — 01 기본 이력" class="block w-full h-auto">
      </div>

      <div class="mt-6 flex items-start max-w-[480px] mx-auto lg:mx-0" id="aiReviewSteps">
        <div class="flex flex-col items-center gap-2">
          <button type="button" class="ai-step-btn is-active" data-stage="0" aria-label="01 기본 이력">01</button>
          <span class="ai-step-label is-active" data-stage="0">기본 이력</span>
        </div>
        <div class="ai-step-line"></div>
        <div class="flex flex-col items-center gap-2">
          <button type="button" class="ai-step-btn" data-stage="1" aria-label="02 투자 방식">02</button>
          <span class="ai-step-label" data-stage="1">투자 방식</span>
        </div>
        <div class="ai-step-line"></div>
        <div class="flex flex-col items-center gap-2">
          <button type="button" class="ai-step-btn" data-stage="2" aria-label="03 투자금 증빙">03</button>
          <span class="ai-step-label" data-stage="2">투자금 증빙</span>
        </div>
        <div class="ai-step-line"></div>
        <div class="flex flex-col items-center gap-2">
          <button type="button" class="ai-step-btn" data-stage="3" aria-label="04 사업장">04</button>
          <span class="ai-step-label" data-stage="3">사업장</span>
        </div>
        <div class="ai-step-line"></div>
        <div class="flex flex-col items-center gap-2">
          <button type="button" class="ai-step-btn" data-stage="4" aria-label="05 대표자 거주">05</button>
          <span class="ai-step-label" data-stage="4">대표자 거주</span>
        </div>
      </div>

      <!-- secondary CTA right after the product demo: what you get → free → action (smaller than the FINAL CTA) -->
      <div class="mt-14 sm:mt-16 pt-10 border-t border-white/10 max-w-[480px] mx-auto lg:mx-0 text-center lg:text-left">
        <p class="kr text-xl sm:text-2xl lp-display font-bold tracking-tight leading-snug text-white">내 상황에 맞는 항목을 먼저 확인하세요.</p>
        <p class="kr mt-4 text-[14px] sm:text-[15px] text-white/55 leading-relaxed max-w-[38ch] mx-auto lg:mx-0">
          투자자 · 업종 · 사업장 정보를 입력하면<br>
          법인설립 전에 확인해야 할 비용과 절차를 정리해드립니다.
        </p>
        <p class="kr mt-5 text-[13px] text-[#ff8f2e]/90">무료로 직접 확인할 수 있습니다.</p>
        <a id="directServiceCta" href="/register/company" class="mt-4 inline-flex items-center gap-2 bg-[#ff7a1f] hover:bg-[#ff8f2e] text-[#050608] font-semibold px-5 py-2.5 rounded-md text-[14px] transition-colors">
          내 상황 직접 확인하기 <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ============ 05 PROCESS ============ -->
<section id="process" class="relative py-24 md:py-36 border-t border-white/10">
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-[36%_64%] gap-12 lg:gap-16 items-start">

    <div class="reveal lg:sticky lg:top-32">
      <span class="text-xs tracking-[0.2em] text-white/35">PROCESS</span>
      <h2 class="kr mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] lp-display font-bold tracking-tight leading-snug">확인했다면,<br>실제 절차는<br class="hidden lg:inline"> 이렇게 진행됩니다.</h2>
      <div class="mt-8 lg:mt-10 flex items-center gap-4">
        <span id="procCounter" class="text-[12px] text-white/35 tabular">00 / 05</span>
        <div class="h-px w-32 bg-white/10" aria-hidden="true">
          <div id="procBar" class="h-px bg-[#ff7a1f] transition-all duration-500 ease-out" style="width:0%"></div>
        </div>
      </div>
      <p class="kr mt-8 lg:mt-12 text-[13px] text-white/40 leading-relaxed max-w-[30ch] hidden lg:block">
        업종·사업장·투자 조건에 따라<br>추가 절차가 필요할 수 있습니다.
      </p>
    </div>

    <div>
      <ol id="procList" class="flex flex-col">
        <li class="proc-row grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_1fr] gap-x-5 sm:gap-x-8 items-baseline py-7 sm:py-9 lg:py-11 border-b border-white/10">
          <span class="proc-num w-10 sm:w-12 text-xl sm:text-2xl lg:text-3xl lp-display font-bold tabular text-white/20">01</span>
          <span class="proc-title kr text-2xl sm:text-3xl lg:text-4xl font-medium text-white/25">조건 확인</span>
          <span class="proc-desc kr col-start-2 sm:col-start-auto mt-2 sm:mt-0 text-[13px] sm:text-[14px] leading-relaxed text-white/20">투자자·업종·사업장 조건을 먼저 확인합니다.</span>
        </li>
        <li class="proc-row grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_1fr] gap-x-5 sm:gap-x-8 items-baseline py-7 sm:py-9 lg:py-11 border-b border-white/10">
          <span class="proc-num w-10 sm:w-12 text-xl sm:text-2xl lg:text-3xl lp-display font-bold tabular text-white/20">02</span>
          <span class="proc-title kr text-2xl sm:text-3xl lg:text-4xl font-medium text-white/25">서류 준비</span>
          <span class="proc-desc kr col-start-2 sm:col-start-auto mt-2 sm:mt-0 text-[13px] sm:text-[14px] leading-relaxed text-white/20">투자자 서류를 준비하고 번역·공증합니다.</span>
        </li>
        <li class="proc-row grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_1fr] gap-x-5 sm:gap-x-8 items-baseline py-7 sm:py-9 lg:py-11 border-b border-white/10">
          <span class="proc-num w-10 sm:w-12 text-xl sm:text-2xl lg:text-3xl lp-display font-bold tabular text-white/20">03</span>
          <span class="proc-title kr text-2xl sm:text-3xl lg:text-4xl font-medium text-white/25">신청</span>
          <span class="proc-desc kr col-start-2 sm:col-start-auto mt-2 sm:mt-0 text-[13px] sm:text-[14px] leading-relaxed text-white/20">투자등록과 기업등록을 관할 기관에 신청합니다.</span>
        </li>
        <li class="proc-row grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_1fr] gap-x-5 sm:gap-x-8 items-baseline py-7 sm:py-9 lg:py-11 border-b border-white/10">
          <span class="proc-num w-10 sm:w-12 text-xl sm:text-2xl lg:text-3xl lp-display font-bold tabular text-white/20">04</span>
          <span class="proc-title kr text-2xl sm:text-3xl lg:text-4xl font-medium text-white/25">심사·보완</span>
          <span class="proc-desc kr col-start-2 sm:col-start-auto mt-2 sm:mt-0 text-[13px] sm:text-[14px] leading-relaxed text-white/20">검토 과정에서 보완 요청이 있을 수 있습니다.</span>
        </li>
        <li class="proc-row grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_1fr] gap-x-5 sm:gap-x-8 items-baseline py-7 sm:py-9 lg:py-11">
          <span class="proc-num w-10 sm:w-12 text-xl sm:text-2xl lg:text-3xl lp-display font-bold tabular text-white/20">05</span>
          <span class="proc-title kr text-2xl sm:text-3xl lg:text-4xl font-medium text-white/25">등록 완료</span>
          <span class="proc-desc kr col-start-2 sm:col-start-auto mt-2 sm:mt-0 text-[13px] sm:text-[14px] leading-relaxed text-white/20">등록 후 인감·계좌·세무 설정으로 이어집니다.</span>
        </li>
      </ol>
      <p class="kr mt-8 text-[13px] text-white/40 leading-relaxed lg:hidden">
        업종·사업장·투자 조건에 따라 추가 절차가 필요할 수 있습니다.
      </p>
    </div>
  </div>
</section>

<!-- ============ 06 FINAL CTA ============ -->
<section id="final" class="relative border-t border-white/10 py-24 sm:py-32 lg:py-40">
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
    <div class="reveal text-center">
      <h2 class="kr text-3xl sm:text-4xl lg:text-5xl lp-display font-bold tracking-tight leading-[1.2]">
        맡길 곳을 찾기 전에,<br>먼저 내 상황을 확인하세요.
      </h2>
      <p class="mt-6 text-[14px] sm:text-base text-white/45 tracking-wide">비용 · 절차 · 서류</p>
      <a id="mainServiceCta" href="/register/company" class="mt-10 inline-flex items-center gap-2 bg-[#ff7a1f] hover:bg-[#ff8f2e] text-[#050608] font-semibold px-7 py-3.5 rounded-md text-[15px] transition-colors">
        MY VIET CHECK에서 직접 확인하기 <span aria-hidden="true">→</span>
      </a>
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
      <a href="#check" class="hover:text-white/70 transition-colors">진단</a>
      <a href="#ai-review" class="hover:text-white/70 transition-colors">직접 확인</a>
    </div>
    <p class="text-[12px] text-white/25">© 2026 MY VIET CHECK</p>
  </div>
  <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-8 pt-6 border-t border-white/10">
    <p class="text-[11px] text-white/25 leading-relaxed kr max-w-3xl">
      본 페이지는 베트남 법인설립 비용과 절차를 이해하는 데 도움을 드리기 위한 일반 정보 제공 목적이며, 법률 자문을 대체하지 않습니다. 표시된 시장 일반가격은 개별 견적이 아니며, 실제 비용과 요건은 투자 구조·업종·사업장·관할 기관에 따라 달라질 수 있습니다.
    </p>
  </div>
</footer>
`;
