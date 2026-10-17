(() => {
  'use strict';

  // ---------- Links to the real REGISTER / account pages ----------
  // Served from vfbcai.com → relative routes; anywhere else → absolute URLs (same rule as MY VIET CHECK).
  const ORIGIN = /(^|\.)vfbcai\.com$/.test(location.hostname) ? '' : 'https://www.vfbcai.com';
  document.querySelectorAll('[data-route]').forEach((a) => {
    a.href = ORIGIN + a.dataset.route + (a.dataset.tab ? '?tab=' + a.dataset.tab : '');
  });

  // ---------- Header: transparent over the hero, white once the hero has scrolled away ----------
  // IntersectionObserver watches the hero; the top margin equals the header height, so the
  // switch happens exactly when the hero's bottom passes under the header.
  const header = document.getElementById('bisHeader');
  const hero = document.getElementById('top');
  // Backup for contexts where the observer doesn't fire: a passive scroll check against a cached
  // threshold (no layout reads per scroll event; the threshold is only re-measured on resize).
  let threshold = 0;
  const measure = () => { threshold = hero.offsetTop + hero.offsetHeight - header.offsetHeight; };
  const sync = () => header.classList.toggle('is-solid', window.scrollY > threshold);
  measure(); sync();
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', () => { measure(); sync(); });
  if ('IntersectionObserver' in window) {
    let heroIO;
    const watchHero = () => {
      if (heroIO) heroIO.disconnect();
      heroIO = new IntersectionObserver(([entry]) => header.classList.toggle('is-solid', !entry.isIntersecting),
        { rootMargin: `-${header.offsetHeight}px 0px 0px 0px`, threshold: 0 });
      heroIO.observe(hero);
    };
    watchHero();
    window.addEventListener('resize', watchHero); // header height changes at the mobile breakpoint
  }

  // ---------- i18n (ko / en / vi / zh) ----------
  // Same languages, data-i18n attribute and vfbcai_locale cookie as MY VIET CHECK (main.js),
  // so a language picked on either page carries over to the other and into vfbcai.com.
  const I18N = {
    ko: {
      _title: 'MY VIET BIZ | 베트남 법인설립·사업 인허가 확인', _label: '한국어',
      navCompany: '법인설립', navPermit: '인허가', navTax: '세무', navAcct: '회계', navLabor: '노무', soon: '준비 중',
      login: '로그인', member: '일반회원 페이지', langLabel: '언어',
      heroTitle: '베트남 사업의 시작부터,<br>필요한 인허가까지.',
      heroSub: '법인설립과 업종별 인허가, 사업 운영에 필요한 <br class="bis-br-d">행정 절차를 확인하고 준비하세요.',
      ctaCheck: '사업 절차 확인하기', heroTags: '법인설립 · 업종별 인허가 · 사업 행정 절차',
      trustText: '베트남 정부 관공서의 최신 정보를 수집·검증하여, <br>현재 기준으로 <em>정확하고 신뢰할 수 있는 정보</em>를 제공합니다.',
      gov1: '법무부', gov2: '재정부', gov3: '내무부', gov4: '공안부', gov5: '세무국', gov6: '보건부',
      s1Title: 'MY VIET BIZ가 제공하는 서비스',
      s1Lead: '베트남에서 사업을 시작하고 운영하는 데 필요한 주요 행정 절차와 인허가 정보를 확인할 수 있습니다.',
      sv1d: '회사 설립 절차와 필요 서류, 요건 확인', sv2d: '업종별 영업 인허가 요건과 절차 확인',
      sv3t: '세무·회계', sv3d: '세금, 회계 관련 행정 요건 확인', sv4d: '노동·고용 관련 주요 절차와 요건',
      s2Title: '내 사업에는 어떤 인허가가 필요할까?',
      s2Lead: '업종별로 필요한 인허가와 행정 요건을 확인하고 사업 준비를 더 정확하게 시작하세요.',
      in1t: '식당허가', in1d: '요식업 영업에 필요한 허가',
      in2t: '소방허가', in2d: '소방시설 안전 관련 허가·인증',
      in3t: '위생허가', in3d: '식품 위생 안전 관련 허가',
      in4t: '환경허가', in4d: '환경영향평가·배출 관련 허가',
      in5t: '화장품허가', in5d: '화장품 판매 신고·유통 허가',
      in6t: '의료기기허가', in6d: '의료기기 수입·유통 허가',
      in7t: '프랜차이즈 등록', in7d: '가맹사업 등록 요건',
      s3Title: '복잡한 행정 절차를 세 단계로',
      s3Lead: '사업 유형을 선택하면 관련 인허가와 필요 서류, 준비 절차를 확인할 수 있습니다.',
      st1t: '사업 유형과 계획 선택', st1d: '업종과 사업 형태를 선택하여 내 사업에 맞는 정보를 확인합니다.',
      st2t: '필요한 절차·서류·요건 확인', st2d: '관련 인허가, 제출 서류, 기관 정보 등 필요한 내용을 확인합니다.',
      st3t: '확인한 내용을 바탕으로 준비', st3d: '확인한 정보를 기준으로 사업 준비 절차를 진행합니다.',
      s4Title: '검증된 공식 자료를 기준으로 합니다.',
      s4Lead: '베트남 정부의 공식 웹사이트와 법령, 공고, 지침 등 신뢰할 수 있는 공개 자료를 바탕으로 정보를 제공합니다.',
      ck1: '베트남 정부 관공서의 공식 자료 확인', ck2: '관련 법령·공고·지침을 기준으로 정보 확인',
      ck3: '출처와 기준일을 확인할 수 있도록 안내', ck4: '현재 기준에 맞는 정보를 제공하기 위해 검토',
      srcLabel: '참고하는 공식 공개 자료',
      src1: '정부 공식 포털', src2: '관보 (법령 공포)', src3: '국가 법령 데이터베이스', src4: '국가 공공서비스 포털',
      srcNote: 'MY VIET BIZ는 정부기관이 아니며, 위 기관과 제휴 또는 인증 관계가 없습니다. 안내 정보는 참고용이며 법률 자문이나 행정기관의 결정을 대체하지 않습니다.',
      s5Title: '지금, 내 사업에 필요한 절차부터 확인하세요.',
      s5Lead: '베트남 사업의 시작부터 운영까지, 필요한 인허가와 행정 절차를 더 정확하게 준비할 수 있습니다.',
      s5Join: '기업회원 가입하기',
      ftNote: 'MY VIET BIZ는 베트남 사업 관련 절차 정보를 안내하는 서비스이며, 법률 자문이나 행정기관의 결정을 대체하지 않습니다. 사안에 따라 전문가 상담이 필요할 수 있습니다.',
    },
    en: {
      _title: 'MY VIET BIZ | Company setup &amp; business licences in Vietnam', _label: 'English',
      navCompany: 'Company setup', navPermit: 'Licences', navTax: 'Tax', navAcct: 'Accounting', navLabor: 'Labour', soon: 'Coming soon',
      login: 'Log in', member: 'Personal page', langLabel: 'Language',
      heroTitle: 'From starting a business in Vietnam<br>to the licences you need.',
      heroSub: 'Check and prepare company setup, industry licences and the administrative steps your business needs.',
      ctaCheck: 'Check business procedures', heroTags: 'Company setup · Industry licences · Business admin procedures',
      trustText: 'We collect and verify the latest information from Vietnamese government offices, <br>providing <em>accurate, reliable information</em> based on current rules.',
      gov1: 'Ministry of Justice', gov2: 'Ministry of Finance', gov3: 'Ministry of Home Affairs', gov4: 'Ministry of Public Security', gov5: 'Department of Taxation', gov6: 'Ministry of Health',
      s1Title: 'Services MY VIET BIZ provides',
      s1Lead: 'Check the key administrative procedures and licence information you need to start and run a business in Vietnam.',
      sv1d: 'Company setup steps, required documents and conditions', sv2d: 'Business licence requirements and steps by industry',
      sv3t: 'Tax &amp; accounting', sv3d: 'Tax and accounting administrative requirements', sv4d: 'Key labour and employment procedures and requirements',
      s2Title: 'Which licences does my business need?',
      s2Lead: 'Check the licences and administrative requirements for your industry and start preparing with more confidence.',
      in1t: 'Restaurant licence', in1d: 'Permits needed to run a food-service business',
      in2t: 'Fire safety permit', in2d: 'Fire safety equipment permits and certification',
      in3t: 'Hygiene permit', in3d: 'Food hygiene and safety permits',
      in4t: 'Environmental permit', in4d: 'Environmental impact assessment and discharge permits',
      in5t: 'Cosmetics licence', in5d: 'Cosmetics product notification and distribution',
      in6t: 'Medical device licence', in6d: 'Medical device import and distribution permits',
      in7t: 'Franchise registration', in7d: 'Franchise business registration requirements',
      s3Title: 'Complex administration in three steps',
      s3Lead: 'Choose your business type to see the related licences, required documents and preparation steps.',
      st1t: 'Choose your business type and plan', st1d: 'Select your industry and business form to see information that fits your business.',
      st2t: 'Check procedures, documents and requirements', st2d: 'Review the related licences, documents to submit, agency information and more.',
      st3t: 'Prepare based on what you checked', st3d: 'Move ahead with your preparation using the information you have checked.',
      s4Title: 'Based on verified official sources.',
      s4Lead: 'We provide information based on trustworthy public sources such as official Vietnamese government websites, laws, announcements and guidelines.',
      ck1: 'Official materials from Vietnamese government offices', ck2: 'Information checked against relevant laws, announcements and guidelines',
      ck3: 'Guidance on where to confirm the source and reference date', ck4: 'Reviewed to reflect current rules',
      srcLabel: 'Official public sources we refer to',
      src1: 'Government portal', src2: 'Official Gazette', src3: 'National legal database', src4: 'National public service portal',
      srcNote: 'MY VIET BIZ is not a government agency and has no affiliation with or certification from the agencies above. Information is for reference only and does not replace legal advice or decisions by the authorities.',
      s5Title: 'Start with the procedures your business needs.',
      s5Lead: 'From launching to running a business in Vietnam, prepare the licences and administrative steps you need more accurately.',
      s5Join: 'Sign up as a business member',
      ftNote: 'MY VIET BIZ provides information on business procedures in Vietnam and does not replace legal advice or decisions by the authorities. Some cases may require professional advice.',
    },
    vi: {
      _title: 'MY VIET BIZ | Thành lập doanh nghiệp &amp; giấy phép kinh doanh tại Việt Nam', _label: 'Tiếng Việt',
      navCompany: 'Thành lập doanh nghiệp', navPermit: 'Giấy phép', navTax: 'Thuế', navAcct: 'Kế toán', navLabor: 'Lao động', soon: 'Sắp ra mắt',
      login: 'Đăng nhập', member: 'Trang cá nhân', langLabel: 'Ngôn ngữ',
      heroTitle: 'Từ khởi nghiệp tại Việt Nam<br>đến các giấy phép cần thiết.',
      heroSub: 'Kiểm tra và chuẩn bị thủ tục thành lập doanh nghiệp, giấy phép theo ngành và các thủ tục hành chính cần cho hoạt động kinh doanh.',
      ctaCheck: 'Kiểm tra thủ tục kinh doanh', heroTags: 'Thành lập doanh nghiệp · Giấy phép theo ngành · Thủ tục hành chính',
      trustText: 'Thu thập và kiểm chứng thông tin mới nhất từ các cơ quan nhà nước Việt Nam, <br>cung cấp <em>thông tin chính xác, đáng tin cậy</em> theo quy định hiện hành.',
      // the Vietnamese name is already the first line, so the second line stays empty (hidden by CSS)
      gov1: '', gov2: '', gov3: '', gov4: '', gov5: '', gov6: '',
      s1Title: 'Dịch vụ của MY VIET BIZ',
      s1Lead: 'Tra cứu các thủ tục hành chính và thông tin giấy phép chính cần thiết để khởi nghiệp và vận hành doanh nghiệp tại Việt Nam.',
      sv1d: 'Quy trình thành lập công ty, hồ sơ và điều kiện cần thiết', sv2d: 'Điều kiện và thủ tục giấy phép kinh doanh theo ngành',
      sv3t: 'Thuế · Kế toán', sv3d: 'Các yêu cầu hành chính về thuế và kế toán', sv4d: 'Thủ tục và điều kiện chính về lao động, tuyển dụng',
      s2Title: 'Doanh nghiệp của tôi cần những giấy phép nào?',
      s2Lead: 'Kiểm tra giấy phép và yêu cầu hành chính theo ngành để bắt đầu chuẩn bị kinh doanh chính xác hơn.',
      in1t: 'Giấy phép nhà hàng', in1d: 'Giấy phép cần cho kinh doanh dịch vụ ăn uống',
      in2t: 'Giấy phép PCCC', in2d: 'Giấy phép, chứng nhận an toàn phòng cháy chữa cháy',
      in3t: 'Giấy phép vệ sinh', in3d: 'Giấy phép an toàn vệ sinh thực phẩm',
      in4t: 'Giấy phép môi trường', in4d: 'Đánh giá tác động môi trường, giấy phép xả thải',
      in5t: 'Giấy phép mỹ phẩm', in5d: 'Công bố sản phẩm và phân phối mỹ phẩm',
      in6t: 'Giấy phép thiết bị y tế', in6d: 'Giấy phép nhập khẩu, phân phối thiết bị y tế',
      in7t: 'Đăng ký nhượng quyền', in7d: 'Điều kiện đăng ký hoạt động nhượng quyền',
      s3Title: 'Thủ tục hành chính phức tạp trong ba bước',
      s3Lead: 'Chọn loại hình kinh doanh để xem giấy phép liên quan, hồ sơ cần thiết và các bước chuẩn bị.',
      st1t: 'Chọn loại hình và kế hoạch kinh doanh', st1d: 'Chọn ngành nghề và hình thức kinh doanh để xem thông tin phù hợp với doanh nghiệp của bạn.',
      st2t: 'Kiểm tra thủ tục, hồ sơ, điều kiện', st2d: 'Xem giấy phép liên quan, hồ sơ cần nộp, thông tin cơ quan và các nội dung cần thiết.',
      st3t: 'Chuẩn bị dựa trên thông tin đã kiểm tra', st3d: 'Tiến hành các bước chuẩn bị kinh doanh dựa trên thông tin đã xác nhận.',
      s4Title: 'Dựa trên nguồn chính thức đã kiểm chứng.',
      s4Lead: 'Chúng tôi cung cấp thông tin dựa trên các nguồn công khai đáng tin cậy như cổng thông tin chính thức của Chính phủ Việt Nam, văn bản pháp luật, thông báo và hướng dẫn.',
      ck1: 'Kiểm tra tài liệu chính thức của cơ quan nhà nước Việt Nam', ck2: 'Đối chiếu với văn bản pháp luật, thông báo và hướng dẫn liên quan',
      ck3: 'Hướng dẫn để có thể xác minh nguồn và ngày tham chiếu', ck4: 'Rà soát để cung cấp thông tin theo quy định hiện hành',
      srcLabel: 'Nguồn công khai chính thức được tham khảo',
      // the source names are already Vietnamese, so no second line
      src1: '', src2: '', src3: '', src4: '',
      srcNote: 'MY VIET BIZ không phải là cơ quan nhà nước và không có quan hệ liên kết hay chứng nhận với các cơ quan nêu trên. Thông tin chỉ mang tính tham khảo, không thay thế tư vấn pháp lý hoặc quyết định của cơ quan có thẩm quyền.',
      s5Title: 'Hãy bắt đầu từ các thủ tục doanh nghiệp bạn cần.',
      s5Lead: 'Từ khởi nghiệp đến vận hành tại Việt Nam, chuẩn bị giấy phép và thủ tục hành chính cần thiết một cách chính xác hơn.',
      s5Join: 'Đăng ký thành viên doanh nghiệp',
      ftNote: 'MY VIET BIZ là dịch vụ cung cấp thông tin về thủ tục kinh doanh tại Việt Nam, không thay thế tư vấn pháp lý hoặc quyết định của cơ quan có thẩm quyền. Tùy trường hợp, có thể cần tham vấn chuyên gia.',
    },
    zh: {
      _title: 'MY VIET BIZ | 越南公司设立·经营许可核查', _label: '中文',
      navCompany: '公司设立', navPermit: '许可', navTax: '税务', navAcct: '会计', navLabor: '劳务', soon: '即将推出',
      login: '登录', member: '个人会员页面', langLabel: '语言',
      heroTitle: '从在越南创业，<br>到所需的各项许可。',
      heroSub: '了解并准备公司设立、行业许可以及经营所需的行政手续。',
      ctaCheck: '查看经营手续', heroTags: '公司设立 · 行业许可 · 经营行政手续',
      trustText: '收集并核实越南政府机关的最新信息，<br>按现行标准提供<em>准确、可靠的信息</em>。',
      gov1: '司法部', gov2: '财政部', gov3: '内务部', gov4: '公安部', gov5: '税务局', gov6: '卫生部',
      s1Title: 'MY VIET BIZ 提供的服务',
      s1Lead: '了解在越南开展和经营业务所需的主要行政手续与许可信息。',
      sv1d: '公司设立流程、所需材料及条件', sv2d: '各行业经营许可的条件与流程',
      sv3t: '税务·会计', sv3d: '税务、会计相关的行政要求', sv4d: '劳动·雇佣相关的主要流程与要求',
      s2Title: '我的业务需要哪些许可？',
      s2Lead: '了解各行业所需的许可与行政要求，更准确地开始业务准备。',
      in1t: '餐厅许可', in1d: '餐饮经营所需的许可',
      in2t: '消防许可', in2d: '消防设施安全相关许可·认证',
      in3t: '卫生许可', in3d: '食品卫生安全相关许可',
      in4t: '环境许可', in4d: '环境影响评价·排放相关许可',
      in5t: '化妆品许可', in5d: '化妆品销售备案·流通许可',
      in6t: '医疗器械许可', in6d: '医疗器械进口·流通许可',
      in7t: '特许经营登记', in7d: '特许经营业务登记要求',
      s3Title: '三步了解复杂的行政手续',
      s3Lead: '选择经营类型，即可查看相关许可、所需材料与准备流程。',
      st1t: '选择经营类型与计划', st1d: '选择行业与经营形式，查看适合您业务的信息。',
      st2t: '确认所需流程·材料·条件', st2d: '查看相关许可、提交材料、机构信息等所需内容。',
      st3t: '根据确认的内容进行准备', st3d: '以确认的信息为基础推进业务准备流程。',
      s4Title: '以经过核实的官方资料为准。',
      s4Lead: '我们以越南政府官方网站、法律法规、公告及指引等可信的公开资料为基础提供信息。',
      ck1: '确认越南政府机关的官方资料', ck2: '以相关法律法规、公告及指引为准核对信息',
      ck3: '提供可核实出处与基准日期的指引', ck4: '为提供符合现行标准的信息进行审核',
      srcLabel: '参考的官方公开资料',
      src1: '政府门户网站', src2: '政府公报', src3: '国家法律数据库', src4: '国家公共服务门户',
      srcNote: 'MY VIET BIZ 并非政府机关，与上述机构不存在合作或认证关系。信息仅供参考，不能替代法律意见或行政机关的决定。',
      s5Title: '现在，先从您业务所需的手续开始了解。',
      s5Lead: '从在越南创业到经营，更准确地准备所需的许可与行政手续。',
      s5Join: '注册企业会员',
      ftNote: 'MY VIET BIZ 提供越南经营相关手续信息，不能替代法律意见或行政机关的决定。视具体情况，可能需要咨询专业人士。',
    },
  };

  const readLocale = () => {
    const m = document.cookie.match(/(?:^|;\s*)vfbcai_locale=([a-z]{2})/);
    if (m && I18N[m[1]]) return m[1];
    try { const s = localStorage.getItem('mvc_lang'); if (s && I18N[s]) return s; } catch (_) {}
    return 'ko';
  };
  const setLang = (next, persist) => {
    if (!I18N[next]) return;
    const dict = I18N[next];
    document.documentElement.lang = next;
    const t = document.createElement('textarea'); t.innerHTML = dict._title; document.title = t.value;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = dict[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll('.bis-nav-item.is-soon').forEach((el) => { el.title = dict.soon; });
    document.querySelectorAll('[data-lang-current]').forEach((el) => { el.textContent = dict._label; });
    document.querySelectorAll('[data-set-lang]').forEach((o) => {
      const on = o.dataset.setLang === next;
      o.classList.toggle('is-current', on);
      o.setAttribute('aria-checked', String(on));
    });
    if (persist) {
      // same cookie / storage key as MY VIET CHECK and the vfbcai.com app
      document.cookie = `vfbcai_locale=${next}; path=/; max-age=31536000; samesite=lax`;
      try { localStorage.setItem('mvc_lang', next); } catch (_) {}
    }
  };

  // ---------- Language menu (desktop dropdown + mobile grid share [data-set-lang]) ----------
  const langWrap = document.querySelector('[data-lang-menu]');
  if (langWrap) {
    const btn = langWrap.querySelector('.bis-lang-btn');
    const pop = langWrap.querySelector('.bis-lang-pop');
    const opts = [...pop.querySelectorAll('[role="menuitemradio"]')];
    const close = (focusBtn) => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (focusBtn) btn.focus(); };
    const open = () => { pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); (opts.find((o) => o.classList.contains('is-current')) || opts[0]).focus(); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); if (pop.hidden) open(); else close(); });
    pop.addEventListener('keydown', (e) => {
      const i = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); opts[(i + 1) % opts.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); opts[(i - 1 + opts.length) % opts.length].focus(); }
      if (e.key === 'Escape') close(true);
      if (e.key === 'Tab') close();
      if ((e.key === 'Enter' || e.key === ' ') && opts[i]) { e.preventDefault(); setLang(opts[i].dataset.setLang, true); close(true); }
    });
    opts.forEach((o) => o.addEventListener('click', () => { setLang(o.dataset.setLang, true); close(true); }));
    document.addEventListener('click', (e) => { if (!langWrap.contains(e.target)) close(); });
  }
  document.querySelectorAll('.bis-mobile-langs [data-set-lang]').forEach((o) => {
    o.addEventListener('click', () => setLang(o.dataset.setLang, true));
    o.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLang(o.dataset.setLang, true); } });
  });
  setLang(readLocale(), false);

  // ---------- Mobile menu ----------
  const menuBtn = document.getElementById('bisMenuBtn');
  const menu = document.getElementById('bisMobileMenu');
  const closeMenu = () => { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('bis-menu-open'); };
  menuBtn.addEventListener('click', () => {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); document.body.classList.add('bis-menu-open');
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // ---------- Hero video ----------
  // Loops automatically. With reduced motion it doesn't play: it shows the final frame (the finished building) instead.
  // The blurred fill layer (same file) follows the main video's frame.
  const video = document.getElementById('bisHeroVideo');
  const fill = document.getElementById('bisHeroFill');
  const layers = [video, fill].filter(Boolean);
  if (video) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showFinalFrame = (v) => { v.pause(); v.currentTime = Math.max(0, (v.duration || 6) - 0.05); };
    if (reduce) {
      layers.forEach((v) => {
        v.removeAttribute('autoplay');
        v.loop = false;
        v.pause();
        if (v.readyState >= 1) showFinalFrame(v); else v.addEventListener('loadedmetadata', () => showFinalFrame(v), { once: true });
      });
    } else if (fill) {
      // resync only on noticeable drift, so the fill isn't seeking constantly
      video.addEventListener('timeupdate', () => {
        if (Math.abs(fill.currentTime - video.currentTime) > 0.2) fill.currentTime = video.currentTime;
        if (fill.paused && !video.paused) fill.play().catch(() => {});
      });
    }
    // if the file can't load, the navy hero background, copy and CTA still show
    video.addEventListener('error', () => layers.forEach((v) => { v.style.display = 'none'; }));
  }

  // ---------- Section 05 background: a still of the hero clip's last frame (the lit building at night) ----------
  const finalMedia = document.getElementById('bisFinalMedia');
  if (finalMedia) {
    const still = () => { finalMedia.currentTime = Math.max(0, (finalMedia.duration || 6) - 0.1); };
    if (finalMedia.readyState >= 1) still(); else finalMedia.addEventListener('loadedmetadata', still, { once: true });
    finalMedia.addEventListener('error', () => { finalMedia.style.display = 'none'; });
  }

  // ---------- Reveal (IntersectionObserver + scroll/timer fallback so nothing stays hidden) ----------
  const pending = new Set(document.querySelectorAll('.reveal'));
  const show = (el) => { el.classList.add('in'); pending.delete(el); };
  const check = () => { const limit = window.innerHeight * 0.94; pending.forEach((el) => { if (el.getBoundingClientRect().top < limit) show(el); }); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } }),
      { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
    pending.forEach((el) => io.observe(el));
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('load', check);
  check();
  const safety = setInterval(() => { check(); if (!pending.size) clearInterval(safety); }, 500);
})();
