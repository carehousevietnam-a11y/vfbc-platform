/* eslint-disable */
// @ts-nocheck
/**
 * 법인설립 랜딩 동작 (대표 제공 index.html 의 script 를 그대로 이식).
 * 시작 버튼 주소는 마크업에 /register/company 로 고정되어 있다.
 * 반환값: 이 페이지를 떠날 때 window/document 리스너를 정리하는 함수.
 */
export function initCompanyLanding(): () => void {
  const abort = new AbortController();
  const signal = abort.signal;
  // ---------- MY VIET CHECK 법인설립 서비스 URL ----------
  
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  // ---------- reveal on scroll ----------
  signal.addEventListener('abort', () => io.disconnect());
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---------- number formatting ----------
  function digitsOnly(str) { return (str || '').replace(/[^\d]/g, ''); }
  function formatComma(numStr) { return numStr ? Number(numStr).toLocaleString('en-US') : ''; }

  // ---------- mobile menu ----------
  const menuBtn = document.getElementById('menuBtn');
  const menuClose = document.getElementById('menuClose');
  const mobileMenu = document.getElementById('mobileMenu');
  function openMenu() {
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('flex');
    document.querySelectorAll('.mobile-link').forEach((a, i) => {
      setTimeout(() => { a.style.transition = 'all 0.4s ease'; a.classList.remove('opacity-0','translate-y-3'); }, i * 70);
    });
  }
  function closeMenu() {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
    document.querySelectorAll('.mobile-link').forEach(a => a.classList.add('opacity-0','translate-y-3'));
  }
  menuBtn.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ---------- HERO: background video ----------
  // 원본 속도 그대로 반복 재생한다. 자동재생이 막히면 첫 프레임이 그대로 보인다.
  (function initHeroVideo() {
    const video = document.getElementById('heroVideo');
    if (!video) return;
    const show = () => video.classList.add('is-ready');
    if (video.readyState >= 2) show();
    else video.addEventListener('loadeddata', show, { once: true });
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      // autoplay blocked → the first frame simply stays as the poster
      const tryPlay = () => { if (video.paused) { const p = video.play(); if (p && p.catch) p.catch(() => {}); } };
      tryPlay();
      video.addEventListener('canplay', tryPlay, { once: true });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) tryPlay(); }, { signal });
    }
  })();

  // ---------- HERO: quote check (ask → count-up → position in the market range) ----------
  // 입력 견적이 페이지에 표시된 시장 일반가격 범위($2,000–$5,000+)의 아래 / 안 / 상단 중 어디인지만 안내한다.
  // 적정성 판단이나 세부 등급은 만들지 않는다.
  (function initHeroQuote() {
    const askEl = document.getElementById('priceAsk');
    const resultEl = document.getElementById('priceResult');
    const afterEl = document.getElementById('priceAfter');
    const form = document.getElementById('heroQuoteForm');
    const input = document.getElementById('heroQuoteInput');
    const errorEl = document.getElementById('heroQuoteError');
    const numEl = document.getElementById('heroNum');
    const gaugeEl = document.getElementById('heroGaugeFill');
    const markEl = document.getElementById('heroQuoteMark');
    const titleEl = document.getElementById('heroQuoteTitle');
    const descEl = document.getElementById('heroQuoteDesc');
    const resetBtn = document.getElementById('heroQuoteReset');
    const cueEl = document.getElementById('scrollCue');
    if (!form) return;

    setTimeout(() => { cueEl.style.opacity = '1'; }, 1600);

    const BAR_MIN = 0, BAR_MAX = 5000;          // bar scale (technical): $0 = 0%, $5,000 = 100%
    const MARKET_MIN = 2000, MARKET_MAX = 5000; // market general range used for the verdict: $2,000 – $5,000+
    const COUNT_MS = 1000;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // bar colour follows the price: muted green → yellow → warm orange → restrained red (red only near $5,000)
    const BAR_STOPS = [
      [0,    [111, 159, 120]], // #6F9F78  $0
      [0.5,  [183, 166,  90]], // #B7A65A  $2,500
      [0.8,  [201, 122,  58]], // #C97A3A  $4,000
      [1,    [194,  69,  63]], // #C2453F  $5,000
    ];
    function barColor(t) {
      for (let i = 1; i < BAR_STOPS.length; i++) {
        const [t1, c1] = BAR_STOPS[i];
        if (t <= t1) {
          const [t0, c0] = BAR_STOPS[i - 1];
          const k = (t - t0) / (t1 - t0);
          return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(',')})`;
        }
      }
      return `rgb(${BAR_STOPS[BAR_STOPS.length - 1][1].join(',')})`;
    }
    // bar position for any price on the $0–$5,000 scale; caps at 100% above $5,000
    function paint(value) {
      const p = clamp01((value - BAR_MIN) / (BAR_MAX - BAR_MIN));
      numEl.textContent = Math.round(value).toLocaleString('en-US');
      gaugeEl.style.width = (p * 100) + '%';
      gaugeEl.style.backgroundColor = barColor(p);
    }

    const ICON_OK = '<svg class="quote-mark" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.4 6.4 4.9 8.8 9.6 3.4" fill="none" stroke="#4F8A5B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICON_WARN = '<svg class="quote-mark" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.1 11.2 10.4H.8Z" fill="#F2B705" stroke="#F2B705" stroke-width="1" stroke-linejoin="round"/><path d="M6 4.6v2.7" stroke="#050608" stroke-width="1.3" stroke-linecap="round"/><circle cx="6" cy="8.75" r="0.7" fill="#050608"/></svg>';
    const RESULTS = {
      low:  { mark: ICON_OK,   title: '시장 일반가격보다 낮은 구간입니다.', desc: '실제 비용은 업무 범위와 투자 조건에 따라 달라질 수 있습니다.' },
      in:   { mark: ICON_OK,   title: '시장 일반가격 범위 내입니다.',       desc: '현재 표시된 시장 일반가격 범위 $2,000 – $5,000+ 안에 있습니다.' },
      high: { mark: ICON_WARN, title: '시장 일반가격의 상단 구간입니다.',   desc: '현재 표시된 시장 일반가격 범위의 상단을 넘어선 견적입니다.' },
    };

    // digits with optional thousands commas only; "$" is shown by the UI
    function parseQuote(raw) {
      const v = raw.trim().replace(/^\$\s*/, '');
      if (!/^(\d{1,3}(,\d{3})+|\d+)$/.test(v)) return null;
      const n = Number(v.replace(/,/g, ''));
      return n > 0 && n < 1e7 ? n : null;
    }

    function swap(from, to, done) {
      if (reduceMotion) { from.classList.add('hidden'); to.classList.remove('hidden'); done && done(); return; }
      from.classList.add('is-leaving');
      setTimeout(() => {
        from.classList.add('hidden');
        from.classList.remove('is-leaving');
        to.classList.add('is-leaving');
        to.classList.remove('hidden');
        void to.offsetWidth;
        to.classList.remove('is-leaving');
        done && done();
      }, 400);
    }

    let countTimer = 0, settleTimer = 0;
    function settle(target) {
      cancelAnimationFrame(countTimer);
      clearTimeout(settleTimer);
      paint(target);
      afterEl.classList.add('is-on');
    }
    function countUp(target) {
      cancelAnimationFrame(countTimer);
      clearTimeout(settleTimer);
      if (reduceMotion) { settle(target); return; }
      const start = performance.now();
      (function step(now) {
        const t = clamp01((now - start) / COUNT_MS);
        paint(target * easeOutCubic(t));
        if (t < 1) countTimer = requestAnimationFrame(step);
        else settle(target);
      })(start);
      // safety net: if frames are paused (background tab), land on the final state anyway
      settleTimer = setTimeout(() => settle(target), COUNT_MS + 200);
    }

    input.addEventListener('input', () => {
      errorEl.classList.add('hidden');
      input.parentElement.classList.remove('border-ember-400');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!input.value.trim()) { input.focus(); return; } // empty: nothing happens
      const value = parseQuote(input.value);
      if (value === null) {
        errorEl.classList.remove('hidden');
        input.parentElement.classList.add('border-ember-400');
        input.focus();
        return;
      }
      input.value = value.toLocaleString('en-US');

      const r = value < MARKET_MIN ? RESULTS.low : value > MARKET_MAX ? RESULTS.high : RESULTS.in;
      markEl.innerHTML = r.mark;
      titleEl.textContent = r.title;
      descEl.textContent = r.desc;

      afterEl.classList.remove('is-on');
      paint(0);
      swap(askEl, resultEl, () => countUp(value));
    });

    resetBtn.addEventListener('click', () => {
      cancelAnimationFrame(countTimer);
      clearTimeout(settleTimer);
      swap(resultEl, askEl, () => { input.select(); });
    });
  })();

  // ---------- HERO → COST: slow fade / translate on scroll ----------
  (function initHeroExit() {
    if (reduceMotion) return;
    const hero = document.getElementById('top');
    const textEls = [document.getElementById('heroContent'), document.getElementById('heroContent2')];
    const stageEl = document.getElementById('heroStage');
    const layerEl = document.getElementById('heroMedia');
    const cueEl = document.getElementById('scrollCue');
    let scheduled = false;

    function update() {
      scheduled = false;
      const p = clamp01(window.scrollY / (hero.offsetHeight * 0.9));
      textEls.forEach(el => {
        el.style.transform = `translate3d(0, ${-p * 40}px, 0)`;
        el.style.opacity = String(1 - p * 0.9);
      });
      stageEl.style.transform = `translate3d(0, ${-p * 80}px, 0)`;
      stageEl.style.opacity = String(1 - p * 1.0);
      layerEl.style.transform = `translate3d(0, ${-p * 30}px, 0)`;
      layerEl.style.opacity = String(1 - p * 0.6);
      cueEl.style.visibility = p > 0.05 ? 'hidden' : '';
    }
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }, { passive: true, signal });
  })();

  // ---------- PROCESS: steps activate in order as they pass the viewport ----------
  (function initProcess() {
    const rows = Array.from(document.querySelectorAll('.proc-row'));
    const counter = document.getElementById('procCounter');
    const bar = document.getElementById('procBar');
    let lastCount = -1;
    let scheduled = false;

    function apply(count) {
      if (count === lastCount) return;
      lastCount = count;
      rows.forEach((row, i) => {
        const on = i < count;
        const num = row.querySelector('.proc-num');
        const title = row.querySelector('.proc-title');
        const desc = row.querySelector('.proc-desc');
        num.classList.toggle('text-ember-400', on);
        num.classList.toggle('text-white/20', !on);
        title.classList.toggle('text-white', on);
        title.classList.toggle('text-white/25', !on);
        desc.classList.toggle('text-white/50', on);
        desc.classList.toggle('text-white/20', !on);
      });
      counter.textContent = String(count).padStart(2, '0') + ' / 05';
      bar.style.width = (count / rows.length * 100) + '%';
    }

    if (reduceMotion) { apply(rows.length); return; }

    function update() {
      scheduled = false;
      const line = window.innerHeight * 0.62;
      let count = 0;
      rows.forEach(row => { if (row.getBoundingClientRect().top < line) count++; });
      apply(count);
    }
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }, { passive: true, signal });
    window.addEventListener('resize', update, { signal });
    update();
  })();

  // ---------- CHECK (4 steps) ----------
  const quizState = { investor: '', industry: '', site: '', hasQuote: '', quote: '' };
  const stepOrder = ['1','2','3','4','result'];
  let currentStepIndex = 0;

  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizProgress = document.getElementById('quizProgress');
  const quizStepLabel = document.getElementById('quizStepLabel');
  const quizBack = document.getElementById('quizBack');
  const quizProgressWrap = document.getElementById('quizProgressWrap');
  const quoteField = document.getElementById('quoteField');
  const quoteAmount = document.getElementById('quoteAmount');

  function showStep(idx) {
    currentStepIndex = idx;
    const stepKey = stepOrder[idx];
    quizSteps.forEach(s => s.classList.toggle('hidden', s.dataset.step !== stepKey));

    if (stepKey === 'result') {
      quizProgressWrap.classList.add('hidden');
      quizProgress.parentElement.classList.add('hidden');
      renderResult();
    } else {
      quizProgressWrap.classList.remove('hidden');
      quizProgress.parentElement.classList.remove('hidden');
      quizProgress.style.width = ((idx + 1) / 4 * 100) + '%';
      quizStepLabel.textContent = String(idx + 1).padStart(2,'0') + ' / 04';
      quizBack.classList.toggle('hidden', idx === 0);
      quizBack.classList.toggle('flex', idx !== 0);
    }
  }

  function goNext() {
    if (currentStepIndex < stepOrder.length - 1) showStep(currentStepIndex + 1);
  }
  quizBack.addEventListener('click', () => {
    if (currentStepIndex === stepOrder.length - 1) showStep(3);
    else if (currentStepIndex > 0) showStep(currentStepIndex - 1);
  });

  document.querySelectorAll('.quiz-step [data-group]').forEach(group => {
    const key = group.dataset.group;
    group.querySelectorAll('.check-option').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.check-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        quizState[key] = btn.dataset.value;

        if (key === 'hasQuote') {
          if (btn.dataset.value === '있음') {
            quoteField.classList.remove('hidden');
            setTimeout(() => quoteAmount.focus({ preventScroll: true }), 50);
            return;
          }
          quoteField.classList.add('hidden');
          quizState.quote = '';
        }
        setTimeout(goNext, 280);
      });
    });
  });

  quoteAmount.addEventListener('input', () => {
    const raw = digitsOnly(quoteAmount.value);
    quoteAmount.value = raw ? formatComma(raw) : '';
    quizState.quote = raw;
    quoteAmount.parentElement.classList.remove('border-ember-400');
  });
  function submitQuote() {
    if (!quizState.quote || Number(quizState.quote) <= 0) {
      quoteAmount.focus();
      quoteAmount.parentElement.classList.add('border-ember-400');
      return;
    }
    goNext();
  }
  document.getElementById('quoteSubmit').addEventListener('click', submitQuote);
  quoteAmount.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitQuote(); });

  // 입력값 기준으로 "확인할 항목"만 정리한다. 승인 여부·성공 가능성은 판단하지 않는다.
  function buildChecklist(s) {
    const items = [];
    const investorItems = {
      '한국인 개인': '투자자 여권 등 개인 서류의 번역·공증 범위',
      '한국 법인': '모회사 등기·재무 서류의 번역·공증·인증 범위',
      '공동 투자': '투자자별 서류와 지분 구조',
      '아직 정하지 않음': '투자 주체(개인 / 법인)에 따른 서류 차이',
    };
    if (investorItems[s.investor]) items.push(investorItems[s.investor]);
    items.push(s.industry && s.industry !== '기타'
      ? `${s.industry} 업종의 외국인 투자 조건과 추가 허가 필요 여부`
      : '희망 업종의 외국인 투자 조건과 추가 허가 필요 여부');
    items.push(s.site === '준비됨'
      ? '사업장 임대차 계약서 등 주소 증빙 서류'
      : '신청 전 사업장 주소 확보 시점');
    items.push(s.hasQuote === '있음'
      ? '받은 견적에 포함된 항목 (번역 · 공증 · 인감 · 전자서명 · 세무 설정)'
      : '대행 비용에 포함되는 항목별 범위');
    return items;
  }

  function renderResult() {
    const isForeignInvested = ['한국인 개인', '한국 법인', '공동 투자'].includes(quizState.investor);
    document.getElementById('sumForm').textContent = isForeignInvested ? '외국인 투자 법인' : (quizState.investor ? '확인 필요' : '-');
    document.getElementById('sumInvestor').textContent = quizState.investor || '-';
    document.getElementById('sumIndustry').textContent = quizState.industry || '-';
    document.getElementById('sumSite').textContent = quizState.site || '-';
    document.getElementById('sumQuote').textContent =
      quizState.hasQuote === '있음' && quizState.quote ? ('$' + formatComma(quizState.quote)) : (quizState.hasQuote ? '없음' : '-');

    const list = document.getElementById('sumChecklist');
    list.innerHTML = '';
    buildChecklist(quizState).forEach((text, i) => {
      const li = document.createElement('li');
      li.className = 'flex items-baseline gap-4';
      li.innerHTML = `<span class="text-[12px] text-white/25 tabular w-5 shrink-0">${String(i + 1).padStart(2, '0')}</span><span class="kr text-[14px] sm:text-[15px] text-white/80 leading-relaxed"></span>`;
      li.lastElementChild.textContent = text;
      list.appendChild(li);
    });
  }

  showStep(0);

  // ---------- DIRECT CHECK: real product screens, click-through ----------
  // 01~05 버튼(또는 왼쪽 단계 요약)을 누르면 해당 실제 진단 화면만 보여준다.
  // 자동 순환·자동 전환은 하지 않는다 — 사용자가 직접 눌러서 확인한다.
  (function initDirectCheckDemo() {
    const img = document.getElementById('aiReviewImg');
    const stepButtons = document.querySelectorAll('.ai-step-btn');
    const stepLabels = document.querySelectorAll('.ai-step-label');
    const flowRows = document.querySelectorAll('#directFlow .flow-row');
    if (!img || !stepButtons.length) return;

    const DIR = '/lp/company/direct_check_shots/';
    const STEPS = [
      { src: DIR + 'step-01.png', alt: 'MY VIET CHECK 법인설립 진단 — 01 기본 이력' },
      { src: DIR + 'step-02.png', alt: 'MY VIET CHECK 법인설립 진단 — 02 투자 방식' },
      { src: DIR + 'step-03.png', alt: 'MY VIET CHECK 법인설립 진단 — 03 투자금 증빙' },
      { src: DIR + 'step-04.png', alt: 'MY VIET CHECK 법인설립 진단 — 04 사업장' },
      { src: DIR + 'step-05.png', alt: 'MY VIET CHECK 법인설립 진단 — 05 대표자 거주' },
    ];
    const FADE_OUT = 150;

    // preload so swaps never flash an empty frame
    STEPS.forEach(s => { const p = new Image(); p.src = s.src; });

    let current = 0;
    let swapTimer = null;

    function showScreen(screen) {
      clearTimeout(swapTimer);
      const apply = () => {
        img.src = screen.src;
        img.alt = screen.alt;
        const reveal = () => { img.style.opacity = '1'; img.style.transform = 'translateY(0)'; };
        if (img.complete) requestAnimationFrame(reveal);
        else img.addEventListener('load', reveal, { once: true });
      };
      if (reduceMotion) { apply(); return; }
      img.style.opacity = '0';
      img.style.transform = 'translateY(5px)';
      swapTimer = setTimeout(apply, FADE_OUT);
    }

    function setStage(idx) {
      if (idx === current) return;
      current = idx;
      [stepButtons, stepLabels, flowRows].forEach(list =>
        list.forEach(el => el.classList.toggle('is-active', Number(el.dataset.stage) === idx)));
      showScreen(STEPS[idx]);
    }

    [...stepButtons, ...flowRows].forEach(btn => btn.addEventListener('click', () => setStage(Number(btn.dataset.stage))));
  })();

  return () => abort.abort();
}
