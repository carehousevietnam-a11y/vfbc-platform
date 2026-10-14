/* eslint-disable */
// @ts-nocheck
/**
 * WorkPermit 랜딩 동작 (대표 제공 index.html 의 script 를 그대로 이식, 리스너 정리만 추가).
 * 반환값: 이 페이지를 떠날 때 window/document 리스너를 정리하는 함수.
 */
export function initWorkPermitLanding(): () => void {
  const abort = new AbortController();
  const signal = abort.signal;

  // ---------- MY VIET CHECK 노동허가 서비스 URL ----------
  // 실제 서비스 페이지가 준비되면 URL을 넣는다. 비워두면 페이지 안의 해당 섹션으로 이동한다.
  const MAIN_SERVICE_URL = '';
  if (MAIN_SERVICE_URL) {
    ['navFreeCheckCta', 'mobileFreeCheckCta'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.href = MAIN_SERVICE_URL;
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const fmt = (n) => Number(n).toLocaleString('en-US');

  // ---------- shared state: hero quote ↔ CHECK ↔ RESULT ↔ COST ----------
  const store = {
    quote: 0,                                  // USD, 0 = none
    answers: {},                               // CHECK answers keyed by QUESTIONS[].key
    done: false,
  };
  const listeners = [];
  const onChange = (fn) => listeners.push(fn);
  const emit = () => listeners.forEach(fn => fn());

  // ---------- reveal on scroll ----------
  signal.addEventListener('abort', () => io.disconnect());
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---------- smooth scroll (accounts for the fixed header) ----------
  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: id === 'top' ? 0 : y, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    scrollToId(id);
    if (id === 'top') setTimeout(() => document.getElementById('heroQuoteInput')?.focus({ preventScroll: true }), 600);
  }, { signal });

  // ---------- number parsing ----------
  function digitsOnly(str) { return (str || '').replace(/[^\d]/g, ''); }

  // ---------- mobile menu ----------
  const mobileMenu = document.getElementById('mobileMenu');
  function openMenu() {
    mobileMenu.classList.remove('hidden'); mobileMenu.classList.add('flex');
    document.querySelectorAll('.mobile-link').forEach((a, i) => {
      setTimeout(() => { a.style.transition = 'all 0.4s ease'; a.classList.remove('opacity-0','translate-y-3'); }, i * 70);
    });
  }
  function closeMenu() {
    mobileMenu.classList.add('hidden'); mobileMenu.classList.remove('flex');
    document.querySelectorAll('.mobile-link').forEach(a => a.classList.add('opacity-0','translate-y-3'));
  }
  document.getElementById('menuBtn').addEventListener('click', openMenu);
  document.getElementById('menuClose').addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ---------- HERO: quote → gauge sweep + count-up ----------
  // 게이지는 금액의 "위치"만 보여준다. 비싸다/싸다 같은 판정은 하지 않는다.
  const hero = (function initHeroQuote() {
    const form = document.getElementById('heroQuoteForm');
    const input = document.getElementById('heroQuoteInput');
    const errorEl = document.getElementById('heroQuoteError');
    const numWrap = document.getElementById('gaugeNum');
    const numEl = document.getElementById('heroNum');
    const caption = document.getElementById('gaugeCaption');
    const fill = document.getElementById('gFill');
    const dot = document.getElementById('gDot');
    const cueEl = document.getElementById('scrollCue');
    setTimeout(() => { cueEl.style.opacity = '1'; }, 1600);

    // geometry: semicircle, centre (200,190), radius 160; p = 0 (left, $0) … 1 (right, $800 = market cap).
    // Amounts above $800 pin the gauge at the end; the number still shows the real amount.
    const CX = 200, CY = 190, R = 160, MAX = 800;
    const MARKET = [400, 800];                  // 시장 일반가격 (대행 포함)
    const pt = (p, r = R) => [CX - r * Math.cos(p * Math.PI), CY - r * Math.sin(p * Math.PI)];
    const arc = (p0, p1, r) => {
      const [x0, y0] = pt(p0, r), [x1, y1] = pt(p1, r);
      return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    };
    const SVG = 'http://www.w3.org/2000/svg';

    // ticks every $100 (major every $200) + minimal labels
    (function drawScale() {
      const ticks = document.getElementById('gTicks');
      const labels = document.getElementById('gLabels');
      for (let v = 0; v <= MAX; v += 100) {
        const p = v / MAX, major = v % 200 === 0;
        const [x0, y0] = pt(p, R + 9), [x1, y1] = pt(p, R + (major ? 17 : 13));
        const l = document.createElementNS(SVG, 'line');
        l.setAttribute('x1', x0); l.setAttribute('y1', y0); l.setAttribute('x2', x1); l.setAttribute('y2', y1);
        l.setAttribute('stroke-width', major ? 1.5 : 1);
        l.setAttribute('class', 'g-tick' + (major ? ' is-major' : ''));
        ticks.appendChild(l);
      }
      [[0, '$0'], [200, '$200'], [400, '$400'], [600, '$600'], [800, '$800']].forEach(([v, txt]) => {
        const p = v / MAX;
        const [x, y] = pt(p, R + 30);
        const t = document.createElementNS(SVG, 'text');
        t.setAttribute('x', x); t.setAttribute('y', y + 4);
        t.setAttribute('text-anchor', p < 0.1 ? 'end' : p > 0.9 ? 'start' : 'middle');
        t.setAttribute('class', 'g-label');
        t.textContent = txt;
        labels.appendChild(t);
      });
      // $800 is the market cap: one small label under it
      const cap = document.createElementNS(SVG, 'text');
      cap.setAttribute('x', 432); cap.setAttribute('y', 216);
      cap.setAttribute('text-anchor', 'end');
      cap.setAttribute('class', 'g-cap');
      cap.textContent = '시장가격 상한';
      labels.appendChild(cap);
      // market range as a quiet inner band
      document.getElementById('gBand').setAttribute('d', arc(MARKET[0] / MAX, MARKET[1] / MAX, R - 14));
    })();

    const COUNT_MS = 1300;                       // gauge sweep + count-up, together
    const REVEAL_AT = 0.85;                      // comparison starts ~1.1s in, while the gauge is settling
    const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);   // steady climb, soft landing (not a jump then a crawl)

    // muted, not neon: green ($0) → amber ($400) → orange ($600) → red ($800+)
    const COLOR_STOPS = [
      [0,    [111, 159, 120]],
      [0.25, [128, 162, 104]],
      [0.5,  [196, 162,  72]],
      [0.75, [206, 121,  58]],
      [1,    [194,  69,  63]],
    ];
    function gaugeColor(p) {
      for (let i = 1; i < COLOR_STOPS.length; i++) {
        const [p1, c1] = COLOR_STOPS[i];
        if (p <= p1) {
          const [p0, c0] = COLOR_STOPS[i - 1];
          const k = (p - p0) / (p1 - p0);
          return 'rgb(' + c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(',') + ')';
        }
      }
      return 'rgb(' + COLOR_STOPS[COLOR_STOPS.length - 1][1].join(',') + ')';
    }

    function paint(value) {
      const p = clamp01(value / MAX);           // = Math.min(value / 800, 1)
      const color = gaugeColor(p);
      fill.setAttribute('stroke-dashoffset', String(1000 * (1 - p)));
      fill.style.stroke = color;
      dot.setAttribute('fill', color);
      const [x, y] = pt(p);
      dot.setAttribute('cx', x.toFixed(2)); dot.setAttribute('cy', y.toFixed(2));
      numEl.textContent = fmt(Math.round(value));
    }

    let raf = 0, settleTimer = 0, revealTimers = [], revealed = false, runId = 0;
    const band = document.getElementById('gBand');
    const prSteps = document.querySelectorAll('#priceResult .pr-step');
    const markEl = document.getElementById('priceMark');
    const titleEl = document.getElementById('priceTitle');

    // position against the $400–$800 market range only — never "cheap" / "expensive"
    const ICON_IN = '<svg class="quote-mark" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.4 6.4 4.9 8.8 9.6 3.4" fill="none" stroke="#4F8A5B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICON_LOW = '<svg class="quote-mark" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2.2v7.2M2.9 6.5 6 9.6l3.1-3.1" fill="none" stroke="#e8630f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICON_HIGH = '<svg class="quote-mark" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 9.8V2.6M2.9 5.5 6 2.4l3.1 3.1" fill="none" stroke="#e8630f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    function verdictFor(v) {
      if (v < MARKET[0]) return [ICON_LOW, '시장 일반가격보다 낮은 금액입니다.'];
      if (v > MARKET[1]) return [ICON_HIGH, '시장 일반가격 범위를 넘어섭니다.'];
      return [ICON_IN, '시장 일반가격 범위 내입니다.'];
    }

    function resetResult() {
      revealTimers.forEach(clearTimeout); revealTimers = [];
      revealed = false;
      prSteps.forEach(el => el.classList.remove('is-on'));
      band.classList.remove('is-on');
    }
    // after the gauge lands: badge → market range (+ band on the gauge) → note
    function revealResult(target) {
      if (revealed) return;
      revealed = true;
      const [icon, title] = verdictFor(target);
      markEl.innerHTML = icon;
      titleEl.textContent = title;
      const delays = reduceMotion ? [0, 0, 0, 0] : [0, 120, 220, 300];
      prSteps.forEach((el, i) => revealTimers.push(setTimeout(() => {
        el.classList.add('is-on');
        if (i === 1) band.classList.add('is-on');
      }, delays[i])));
    }

    function settle(target, id = runId) {
      if (id !== runId) return;                  // a newer amount took over
      cancelAnimationFrame(raf); clearTimeout(settleTimer);
      paint(target);
      revealResult(target);
    }
    function run(target) {
      cancelAnimationFrame(raf); clearTimeout(settleTimer);
      const id = ++runId;
      resetResult();
      numWrap.classList.remove('is-empty');
      numWrap.classList.toggle('is-long', String(target).length > 5);
      caption.textContent = '내가 받은 견적';
      fill.setAttribute('opacity', '1');
      dot.setAttribute('opacity', '1');
      if (reduceMotion) { settle(target); return; }
      const start = performance.now();
      (function step(now) {
        if (id !== runId) return;
        const t = clamp01((now - start) / COUNT_MS);
        paint(target * easeOutQuad(t));
        if (t < 1) raf = requestAnimationFrame(step); else settle(target, id);
      })(start);
      revealTimers.push(setTimeout(() => { if (id === runId) revealResult(target); }, COUNT_MS * REVEAL_AT));
      settleTimer = setTimeout(() => settle(target, id), COUNT_MS + 100); // background-tab safety net
    }

    // integer USD only: "1,500", "1500", "$1,500" → 1500. A minus sign or decimals are not accepted.
    function sanitize(raw) {
      const intPart = String(raw || '').split('.')[0];
      return digitsOnly(intPart).replace(/^0+(?=\d)/, '').slice(0, 7);
    }
    function setError(msg) {
      errorEl.textContent = msg;
      input.parentElement.classList.toggle('border-ember-400', !!msg);
    }

    input.addEventListener('input', () => {
      const typedMinus = input.value.includes('-');
      const raw = typedMinus ? '' : sanitize(input.value);   // a negative amount is cleared, not silently flipped
      input.value = raw ? fmt(raw) : '';
      setError(typedMinus ? '음수는 입력할 수 없습니다.' : '');
      if (revealed && raw !== String(store.quote)) resetResult();   // a new amount clears the old comparison
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawText = input.value.trim();
      if (!rawText) { setError('받은 견적 금액을 입력해 주세요.'); input.focus(); return; }
      if (/-/.test(rawText)) { setError('음수는 입력할 수 없습니다.'); input.focus(); return; }
      const value = Number(sanitize(rawText));
      if (!value || value <= 0) { setError('0보다 큰 금액을 입력해 주세요.'); input.focus(); return; }
      store.quote = value;
      input.value = fmt(value);
      run(value);
      emit();
    });

    // "다른 금액 확인하기": back to the empty state — gauge, colour, number, comparison, badge, input
    function resetQuote() {
      runId++;
      cancelAnimationFrame(raf); clearTimeout(settleTimer);
      resetResult();
      paint(0);
      fill.setAttribute('opacity', '0');
      dot.setAttribute('opacity', '0');
      numWrap.classList.add('is-empty');
      numWrap.classList.remove('is-long');
      caption.textContent = '견적을 입력해보세요';
      input.value = '';
      setError('');
      store.quote = 0;
      emit();
      input.focus({ preventScroll: true });
    }
    document.getElementById('heroQuoteReset').addEventListener('click', resetQuote);

    // COST reference: show the visitor's own quote next to the market range (no verdict)
    const costMyQuote = document.getElementById('costMyQuote');
    onChange(() => {
      if (store.quote) {
        costMyQuote.textContent = '$' + fmt(store.quote);
        costMyQuote.className = 'font-display font-bold text-[1.35rem] sm:text-2xl tabular tracking-tight text-white hover:text-ember-300 transition-colors';
      } else {
        costMyQuote.textContent = '입력하고 비교하기 →';
        costMyQuote.className = 'kr text-[14px] font-semibold text-white/60 hover:text-ember-300 transition-colors';
      }
    });


    // also called by CHECK so the hero gauge follows the amount entered there
    return { show(v) { input.value = fmt(v); setError(''); run(v); } };
  })();

  // ---------- HERO: line the gauge up with the H1 (desktop) ----------
  // The left copy stays where it is (fixed offset in CSS); the compact quote module on the right is
  // pushed down so the centre of the gauge arc sits on the centre of the H1. Measured, not fixed,
  // because the H1 wraps to three lines on narrower desktops. offsetTop ignores the reveal/scroll transforms.
  (function alignHeroColumns() {
    const h1 = document.querySelector('#heroContent h1');
    const stage = document.getElementById('heroStage');
    const gauge = document.getElementById('gauge');
    const svg = gauge.querySelector('svg');
    const desktop = window.matchMedia('(min-width: 1024px)');
    const ARC_MID = ((30 + 190) / 2 + 6) / 228;   // arc centre within the viewBox (y −6 … 222)
    function align() {
      if (!desktop.matches) { stage.style.paddingTop = ''; return; }
      // target: the H1's main line (its lower half), so the module isn't pulled up by the title + input above the gauge
      const h1Mid = h1.offsetTop + h1.offsetHeight * 0.75;                               // in the left column
      const arcMid = gauge.offsetTop + svg.getBoundingClientRect().height * ARC_MID;     // in the right module, unpadded
      stage.style.paddingTop = Math.max(0, Math.round(h1Mid - arcMid)) + 'px';
    }
    align();
    window.addEventListener('resize', align, { signal });
    if ('ResizeObserver' in window) { const ro = new ResizeObserver(align); ro.observe(document.getElementById('top')); signal.addEventListener('abort', () => ro.disconnect()); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
  })();

  // ---------- HERO: background video ----------
  // muted + playsinline so phones autoplay it; if autoplay is blocked the first frame (or plain black) stays.
  (function initHeroVideo() {
    const video = document.getElementById('heroVideo');
    if (!video) return;
    const show = () => video.classList.add('is-ready');
    if (video.readyState >= 2) show();
    else video.addEventListener('loadeddata', show, { once: true });
    if (reduceMotion) { video.removeAttribute('autoplay'); video.pause(); return; }
    const tryPlay = () => { if (video.paused) { const p = video.play(); if (p && p.catch) p.catch(() => {}); } };
    tryPlay();
    video.addEventListener('canplay', tryPlay, { once: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tryPlay(); }, { signal });
    // dip the opacity briefly around the loop point so the jump from the stacked papers back to the start isn't abrupt
    video.addEventListener('timeupdate', () => {
      const d = video.duration;
      if (!d) return;
      video.classList.toggle('is-seam', video.currentTime > d - 0.35 || video.currentTime < 0.25);
    });
  })();

  // ---------- HERO → COST: gentle fade on scroll ----------
  (function initHeroExit() {
    if (reduceMotion) return;
    const heroSec = document.getElementById('top');
    const textEls = [document.getElementById('heroContent'), document.getElementById('heroContent2')];
    const stageEl = document.getElementById('heroStage');
    const mediaEl = document.getElementById('heroMedia');
    const cueEl = document.getElementById('scrollCue');
    const desktop = window.matchMedia('(min-width: 1024px)');
    let scheduled = false;
    function update() {
      scheduled = false;
      if (!desktop.matches) { [...textEls, stageEl].forEach(el => { el.style.transform = ''; el.style.opacity = ''; }); return; }
      const p = clamp01(window.scrollY / (heroSec.offsetHeight * 0.9));
      textEls.forEach(el => { el.style.transform = `translate3d(0, ${-p * 40}px, 0)`; el.style.opacity = String(1 - p * 0.9); });
      stageEl.style.transform = `translate3d(0, ${-p * 70}px, 0)`;
      stageEl.style.opacity = String(1 - p);
      mediaEl.style.opacity = String(1 - p * 0.6);
      cueEl.style.visibility = p > 0.05 ? 'hidden' : '';
    }
    window.addEventListener('scroll', () => { if (scheduled) return; scheduled = true; requestAnimationFrame(update); }, { passive: true, signal });
    window.addEventListener('resize', update, { signal });
  })();

  // ---------- CHECK: quick pre-check (4 questions) ----------
  // 랜딩페이지 CHECK는 부담 없는 사전 확인이다. 학력·경력 등 정밀 진단은 /check/wp(DIRECT CHECK)에서 한다.
  // 끝나면 답변을 짧게 다시 보여줄 뿐, 비용 확정·발급 여부 판단은 하지 않는다.
  const QUESTIONS = [
    { key: 'type', q: '어떤 신청인가요?', options: ['신규 발급', '갱신', '재발급', '잘 모르겠습니다'] },
    { key: 'region', q: '어디에서 근무하시나요?', options: ['하노이', '호치민', '기타 지역', '잘 모르겠습니다'] },
    { key: 'docs', q: '서류는 어느 정도 준비됐나요?', options: ['대부분 준비됨', '일부 준비됨', '아직 준비하지 않음', '잘 모르겠습니다'] },
    { key: 'hasQuote', q: '이미 받은 견적이 있나요?', options: ['있습니다', '없습니다'], quoteField: true },
  ];
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  // the read-back shown when CHECK is done, e.g. "신규 발급 · 하노이 · 대부분 준비됨 · 견적 $500"
  function summaryText(a) {
    const quote = a.hasQuote === '있습니다' ? (store.quote ? '견적 $' + fmt(store.quote) : '견적 있음') : '견적 없음';
    const unsure = (v, label) => (v === '잘 모르겠습니다' ? label + ' 확인 필요' : v);   // reads better than a bare "잘 모르겠습니다"
    return [unsure(a.type, '신청 유형'), unsure(a.region, '근무지'), unsure(a.docs, '서류 상태'), quote].join(' · ');
  }
  // one neutral sentence on what to look at in the quote (never a verdict)
  function summaryNote(a) {
    const region = a.region === '하노이' || a.region === '호치민' ? a.region + ' 기준 행정비용' : '행정비용';
    const docs = a.docs === '대부분 준비됨' ? '번역·공증 비용' : a.docs === '일부 준비됨' ? '추가 서류 준비비용' : '서류 준비비용';
    return (a.hasQuote === '있습니다' ? '받은 견적에 ' : '견적을 받으면 ') + region + '과 ' + docs + '이 포함되어 있는지 확인해보세요.';
  }
  function renderSummary() {
    document.getElementById('doneSummary').textContent = summaryText(store.answers);
    document.getElementById('doneNote').textContent = summaryNote(store.answers);
  }
  // a quote changed in the hero after CHECK is done → keep the read-back current
  onChange(() => { if (store.done) renderSummary(); });

  // ---------- CHECK: one question per screen ----------
  (function initCheck() {
    const TOTAL = QUESTIONS.length;
    const pad = (n) => String(n).padStart(2, '0');

    document.getElementById('quizSteps').innerHTML = QUESTIONS.map((Q, qi) => `
      <div class="quiz-step${qi ? ' hidden' : ''}" data-step="${qi}">
        <p class="text-[12px] text-white/35 tabular">Q${qi + 1}.</p>
        <h3 class="kr mt-2 text-xl sm:text-2xl font-semibold leading-snug">${esc(Q.q)}</h3>
        <div class="mt-8" data-group="${Q.key}">
          ${Q.options.map((v, oi) => `
          <button class="check-option w-full flex items-baseline gap-6 py-4${oi < Q.options.length - 1 ? ' border-b border-white/10' : ''} text-left" data-value="${esc(v)}"><span class="opt-num text-white/25 text-sm tabular w-5 shrink-0">${pad(oi + 1)}</span><span class="opt-label kr text-lg sm:text-xl text-white/75">${esc(v)}</span></button>`).join('')}
        </div>
        ${Q.quoteField ? `
        <div id="quoteField" class="hidden mt-10 max-w-sm">
          <label for="quoteAmount" class="block text-[13px] text-white/50 kr">받은 견적 금액 (USD)</label>
          <div class="mt-3 flex items-baseline gap-2 border-b border-white/30 focus-within:border-ember-400 field-underline pb-3">
            <span class="font-display font-semibold text-3xl sm:text-4xl text-white/60">$</span>
            <input id="quoteAmount" type="text" inputmode="numeric" autocomplete="off" placeholder="0" class="flex-1 min-w-0 w-full bg-transparent outline-none text-3xl sm:text-4xl font-display font-semibold tabular text-white">
          </div>
          <p id="quoteLinkedNote" class="kr hidden mt-2 text-[12px] text-white/35">위에서 입력한 금액을 불러왔습니다.</p>
          <button id="quoteSubmit" class="mt-6 inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-400 text-ink-950 font-semibold px-6 py-3 rounded-md text-[14px] transition-colors">
            결과 보기 <span aria-hidden="true">→</span>
          </button>
        </div>` : ''}
      </div>`).join('');

    let idx = 0;
    const steps = () => document.querySelectorAll('.quiz-step');
    const head = document.getElementById('quizHead');
    const progress = document.getElementById('quizProgress');
    const label = document.getElementById('quizStepLabel');
    const back = document.getElementById('quizBack');
    const quoteField = document.getElementById('quoteField');
    const quoteAmount = document.getElementById('quoteAmount');
    const linkedNote = document.getElementById('quoteLinkedNote');
    let draftQuote = 0;

    function showStep(i) {
      idx = i;
      const key = i >= TOTAL ? 'done' : String(i);
      steps().forEach(s => {
        const on = s.dataset.step === key;
        s.classList.toggle('hidden', !on);
        if (s.dataset.step === 'done') s.classList.toggle('flex', on);
      });
      head.classList.toggle('hidden', key === 'done');
      if (key !== 'done') {
        progress.style.width = ((i + 1) / TOTAL * 100) + '%';
        label.textContent = pad(i + 1) + ' / ' + pad(TOTAL);
        back.classList.toggle('hidden', i === 0);
        back.classList.toggle('flex', i !== 0);
      }
    }
    back.addEventListener('click', () => { if (idx > 0) showStep(idx - 1); });

    function finish() {
      store.done = true;
      renderSummary();
      showStep(TOTAL);
      emit();
    }

    document.querySelectorAll('#quizSteps [data-group]').forEach(group => {
      const key = group.dataset.group;
      group.querySelectorAll('.check-option').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('.check-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          store.answers[key] = btn.dataset.value;

          if (key === 'hasQuote') {
            if (btn.dataset.value === '있습니다') {
              // carry over the amount typed in the hero, if any
              draftQuote = store.quote;
              quoteAmount.value = draftQuote ? fmt(draftQuote) : '';
              linkedNote.classList.toggle('hidden', !draftQuote);
              quoteField.classList.remove('hidden');
              setTimeout(() => quoteAmount.focus({ preventScroll: true }), 50);
              return;
            }
            quoteField.classList.add('hidden');
            setTimeout(finish, 280);
            return;
          }
          setTimeout(() => showStep(idx + 1), 280);
        });
      });
    });

    quoteAmount.addEventListener('input', () => {
      const raw = digitsOnly(quoteAmount.value.split('.')[0]).replace(/^0+(?=\d)/, '').slice(0, 7);
      quoteAmount.value = raw ? fmt(raw) : '';
      draftQuote = raw ? Number(raw) : 0;
      linkedNote.classList.add('hidden');
      quoteAmount.parentElement.classList.remove('border-ember-400');
    });
    function submitQuote() {
      if (!draftQuote) {
        quoteAmount.focus();
        quoteAmount.parentElement.classList.add('border-ember-400');
        return;
      }
      const changed = draftQuote !== store.quote;
      store.quote = draftQuote;
      if (changed) hero.show(store.quote);   // keep the hero gauge in sync with the latest amount
      finish();
    }
    document.getElementById('quoteSubmit').addEventListener('click', submitQuote);
    quoteAmount.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submitQuote(); } });

    document.getElementById('quizRestart').addEventListener('click', () => {
      store.answers = {};
      store.done = false;
      document.querySelectorAll('.check-option.selected').forEach(b => b.classList.remove('selected'));
      quoteField.classList.add('hidden');
      showStep(0);
    });

    showStep(0);
  })();

  // ---------- DIRECT CHECK: real product screens, click-through ----------
  // 하단 01~05 단계 버튼을 누르면 실제 진단 화면 캡처를 순서대로 보여준다. 자동 전환은 없다.
  (function initDirectCheck() {
    const frame = document.getElementById('shotFrame');
    const shots = frame.querySelectorAll('.shot-img');
    const controls = document.querySelectorAll('#shotSteps .ai-step-btn, #shotSteps .ai-step-label');
    let current = 0;
    function setStage(i) {
      if (i === current) return;
      current = i;
      shots.forEach(img => img.classList.toggle('is-active', Number(img.dataset.stage) === i));
      controls.forEach(el => el.classList.toggle('is-active', Number(el.dataset.stage) === i));
      frame.href = shots[i].getAttribute('src');
    }
    controls.forEach(el => {
      if (el.tagName === 'BUTTON') el.addEventListener('click', () => setStage(Number(el.dataset.stage)));
    });
  })();

  return () => abort.abort();
}
