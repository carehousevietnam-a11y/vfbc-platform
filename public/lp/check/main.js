(() => {
  'use strict';

  // ---------- Service routing ----------
  // Real features (CHECK / VERIFY / REGISTER / PROTECT, login, document review) live on vfbcai.com.
  // Served from vfbcai.com itself → relative routes; served anywhere else → absolute URLs.
  const SERVICE_ORIGIN = /(^|\.)vfbcai\.com$/.test(location.hostname) ? '' : 'https://www.vfbcai.com';

  function serviceUrl(path, tab, q) {
    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    if (q) params.set('q', q);
    const qs = params.toString();
    return SERVICE_ORIGIN + path + (qs ? '?' + qs : '');
  }

  // Keyword → route table, mirroring the feature routes on vfbcai.com.
  // Order matters: more specific topics first.
  const ROUTES = [
    [/거주증|임시\s?거주|trc|residence\s?card|thẻ\s?tạm\s?trú/i, '/check/trc', 'lookup'],
    [/노동\s?허가|워크\s?퍼밋|work\s?permit|giấy\s?phép\s?lao\s?động/i, '/check/wp', 'lookup'],
    [/땀\s?[쭈주]|거주\s?신고|tạm\s?trú|temporary\s?residence/i, '/check/tamtru', 'lookup'],
    [/운전\s?면허|driv|bằng\s?lái|giấy\s?phép\s?lái/i, '/check/driving-license', 'lookup'],
    [/프랜차이즈|franchise|nhượng\s?quyền/i, '/register/franchise', 'direct'],
    [/식당|음식점|레스토랑|restaurant|nhà\s?hàng|quán\s?ăn/i, '/register/restaurant', 'direct'],
    [/소방|fire|pccc|phòng\s?cháy/i, '/register/fire-safety', 'direct'],
    [/위생|hygiene|vệ\s?sinh|attp/i, '/register/hygiene', 'direct'],
    [/환경|environment|môi\s?trường/i, '/register/environment', 'direct'],
    [/화장품|cosmetic|mỹ\s?phẩm/i, '/register/cosmetics', 'direct'],
    [/의료\s?기기|medical\s?device|thiết\s?bị\s?y\s?tế/i, '/register/medical-device', 'direct'],
    [/법인|회사\s?설립|company|incorporat|thành\s?lập|doanh\s?nghiệp/i, '/register/company', 'direct'],
    [/부동산|임대|아파트|월세|전세|real\s?estate|lease|rent|apartment|bất\s?động\s?sản|thuê\s?nhà|căn\s?hộ/i, '/verify/real-estate', 'review'],
    [/사기|미수금|못\s?받|떼인|fraud|scam|lừa\s?đảo/i, '/verify/fraud', 'review'],
    [/세금|세무|부가세|vat|tax|thuế/i, '/verify/tax', 'review'],
    [/공문|행정\s?문서|official\s?letter|công\s?văn|văn\s?bản\s?hành\s?chính/i, '/verify/admin', 'review'],
    [/계약서|서류|문서|contract|document|hợp\s?đồng|giấy\s?tờ/i, '/verify/unclear', 'review'],
  ];
  const FALLBACK = ['/check', null];
  const DOCUMENT_REVIEW = ['/verify/unclear', 'review'];

  // Chinese keywords for the same routes (same order/priority as ROUTES).
  const ROUTES_ZH = [
    [/居留卡|暂住证/, '/check/trc', 'lookup'],
    [/工作许可|劳动许可/, '/check/wp', 'lookup'],
    [/暂住登记|临时居住/, '/check/tamtru', 'lookup'],
    [/驾照|驾驶证/, '/check/driving-license', 'lookup'],
    [/加盟|特许经营/, '/register/franchise', 'direct'],
    [/餐厅|饭店/, '/register/restaurant', 'direct'],
    [/消防/, '/register/fire-safety', 'direct'],
    [/卫生/, '/register/hygiene', 'direct'],
    [/环境/, '/register/environment', 'direct'],
    [/化妆品/, '/register/cosmetics', 'direct'],
    [/医疗器械/, '/register/medical-device', 'direct'],
    [/公司设立|设立公司|成立公司|企业/, '/register/company', 'direct'],
    [/房地产|租赁|租房|公寓/, '/verify/real-estate', 'review'],
    [/诈骗|欠款/, '/verify/fraud', 'review'],
    [/税/, '/verify/tax', 'review'],
    [/公文|行政文件/, '/verify/admin', 'review'],
    [/合同|文件/, '/verify/unclear', 'review'],
  ];

  function resolveQuery(q) {
    for (const [re, path, tab] of ROUTES) if (re.test(q)) return serviceUrl(path, tab, q);
    for (const [re, path, tab] of ROUTES_ZH) if (re.test(q)) return serviceUrl(path, tab, q);
    return serviceUrl(FALLBACK[0], FALLBACK[1], q);
  }

  // Plain service links (nav, services list, footer, login)
  document.querySelectorAll('[data-route]').forEach((a) => {
    a.href = serviceUrl(a.dataset.route, a.dataset.tab);
  });

  // ---------- i18n ----------
  // REGISTER strings (nav3, svc3, svc3d, rg1–rg8, cta3) are no longer shown on this personal page;
  // they are kept for the upcoming MY VIET BIS business page.
  // Same for the business items removed from this page: sc3t/sc3d (사업·행정) and pop3 (법인설립 question).
  const I18N = {
    ko: {
      _label: '한국어',
      login: '로그인',
      bizPage: '기업회원 페이지',
      nav1: '확인', nav2: '검증', nav3: '등록', nav4: '관리',
      heroEyebrow: '베트남 체류·사업·행정·법률·금융 비용 확인 플랫폼',
      heroTitle: '<span class="t1">이 금액,</span><br><span class="t2">정말 맞는 걸까?</span>',
      heroSub: '베트남에서 받은 비용과 정보부터<br>계약서와 각종 서류까지.<br>결정하기 전에 <span class="hl">먼저 직접 확인</span>하세요.',
      cta: '무료로 직접 확인하기',
      selfTitle: '궁금한 건,<br><span class="hl">먼저 직접 확인</span>하세요.',
      selfLead: '비용부터 서류까지,<br>베트남에서 받은 정보를 먼저 확인해보세요.',
      askLabel: '확인하고 싶은 내용',
      askPh: '예) 노동허가 비용이 3,000달러라는데 맞나요?',
      askDoc: '서류로 확인하기',
      askDocDesc: '계약서·견적서·행정문서·세무문서 등을 올려 직접 확인하세요.',
      dt1: '행정문서', dt2: '부동산 문서', dt3: '사기 의심 문서', dt4: '세무문서', dt5: '기타 불확실한 문서',
      vf6: '미수금·분쟁 검토',
      askSubmit: '확인하기',
      askHow: '확인하기를 누르면 질문에 맞는 확인 페이지로 이동합니다.', resultNote: '확인 결과는 공개 자료와 일반적인 시장 범위를 바탕으로 한 참고 정보이며, 법률 자문이나 행정기관의 결정을 대체하지 않습니다. 추가 확인이 필요한 경우 전문가 상담을 안내합니다.',
      askEmpty: '확인하고 싶은 내용을 한 줄로 적어주세요.',
      popLabel: '많이 찾는 질문',
      pop1: '노동허가 비용이 맞나요?', pop2: '거주증 비용은 얼마인가요?', pop3: '법인설립 절차는 어떻게 되나요?', pop4: '비자 연장 비용은 얼마인가요?', pop5: '받은 견적을 확인하고 싶어요.',
      scopeTitle: '비용부터 서류,<br>문제 대응까지.',
      scopeLead: '베트남에서 받은 정보와 서류부터<br>문제가 생겼을 때까지<br>필요한 것부터 확인하세요.',
      sc1t: '비용 · 정보',
      sc1d: '받은 견적과 비용을 확인합니다.',
      sc2t: '서류 · 계약',
      sc2d: '계약서와 각종 서류를 검토합니다.',
      sc3t: '사업 · 행정',
      sc3d: '법인설립과 인허가를 확인합니다.',
      sc4t: '문제 대응',
      sc4d: '미수금·분쟁·사기 상황을 검토합니다.',
      azTitle: '무엇을 근거로 분석할까요?',
      azDesc: '<strong>베트남 법률 지식을 학습한 AI</strong>와 <strong>형사사건 프로파일링</strong> 방식에서 착안한 분석 구조로 정황·관계·증거를 살펴봅니다.',
      svcTitle: '필요한 확인과 대응을<br>한 곳에서.',
      svcLead: '확인부터 검토, 문제 대응까지<br>필요한 서비스로 바로 이동하세요.',
      svc1: '비용·행정 정보 확인',
      svc1d: '베트남 생활과 행정에 필요한 비용 및 절차를 확인합니다.',
      svc2: '계약서·견적서·의심 문서 검토',
      svc2d: '받은 서류와 견적, 의심스러운 상황을 검토합니다.',
      svc3: '법인설립·사업 인허가 확인',
      svc3d: '사업 운영에 필요한 등록 및 인허가 절차를 확인합니다.',
      svc4: '신청 진행·서류·만료일 관리',
      svc4d: '신청 진행 상황과 제출 서류, 주요 만료일을 관리합니다.',
      ck1: '노동허가', ck2: '거주증', ck3: '운전면허', ck4: '땀주 (Tạm trú)',
      hq1d: '발급·갱신 비용 확인', hq2d: '발급 요건·비용 확인', hq3t: '땀주', hq3d: '임시거주등록 확인', hq4d: '교환·취득 비용 확인', hq5t: '서류 검토', hq5d: '각종 서류 검토',
      rg1: '법인설립', rg2: '식당', rg3: '소방', rg4: '위생', rg5: '환경', rg6: '화장품', rg7: '의료기기', rg8: '프랜차이즈',
      pt1: '진행 단계', pt2: '제출 서류·만료일', pt3: '알림', pt4: '담당자 상담',
      cta1: '확인하기', cta2: '검토하기', cta3: '등록하기', cta4: '진행 상황 확인하기',
      trustTitle: '공식 자료를 기준으로<br>확인합니다.',
      trustNote: '베트남의 공식 공개 자료를 참고해 정보를 확인합니다.',
      trustFine: 'MY VIET CHECK는 정부기관이 아니며, 각 기관과 제휴 또는 인증 관계가 없습니다.',
      src1: '법무부', src2: '재정부', src3: '내무부', src4: '공안부', src5: '세무국', src6: '보건부',
      disclaimer: 'MY VIET CHECK는 일반 정보 확인을 돕는 서비스이며, 법률 자문을 대체하지 않습니다. 사안에 따라 전문가 상담이 필요할 수 있으며, 상담 비용이 발생할 수 있습니다.',
      _title: 'MY VIET CHECK | 결정하기 전에, 먼저 직접 확인하세요',
    },
    en: {
      _label: 'English',
      login: 'Log in',
      bizPage: 'Business page',
      nav1: '', nav2: '', nav3: '', nav4: '', // the English names already say it
      heroEyebrow: 'Cost checks for living, business, admin, legal &amp; finance in Vietnam',
      heroTitle: '<span class="t1">This amount,</span><br><span class="t2">is it right?</span>',
      heroSub: 'From the costs and information you were given in Vietnam to contracts and other documents — <span class="hl">check them yourself</span> before you decide.',
      cta: 'Check it yourself, free',
      selfTitle: 'Have a question?<br><span class="hl">Check it yourself</span> first.',
      selfLead: 'From costs to documents —<br>check what you were given in Vietnam first.',
      askLabel: 'What you want to check',
      askPh: 'e.g. I was quoted $3,000 for a work permit. Is that right?',
      askDoc: 'Check a document',
      askDocDesc: 'Upload contracts, quotes, administrative or tax documents and check them yourself.',
      dt1: 'Administrative documents', dt2: 'Real estate documents', dt3: 'Suspected fraud', dt4: 'Tax documents', dt5: 'Other unclear documents',
      vf6: 'Unpaid money & disputes',
      askSubmit: 'Check',
      askHow: 'Pressing Check opens the check page that matches your question.', resultNote: 'Results are reference information based on public materials and typical market ranges. They do not replace legal advice or decisions by government agencies. If further review is needed, we point you to an expert consultation.',
      askEmpty: 'Type what you want to check in one line.',
      popLabel: 'Popular questions',
      pop1: 'Is this work permit cost right?', pop2: 'How much is a residence card?', pop3: 'How do I set up a company?', pop4: 'How much is a visa extension?', pop5: 'I want to check a quote I received.',
      scopeTitle: 'From costs to documents<br>and problems.',
      scopeLead: 'From the information and documents you received in Vietnam to what to do when something goes wrong — start with what you need.',
      sc1t: 'Costs · Information',
      sc1d: 'Check the quotes and costs you received.',
      sc2t: 'Documents · Contracts',
      sc2d: 'Review contracts and other documents.',
      sc3t: 'Business · Administration',
      sc3d: 'Check company setup and licences.',
      sc4t: 'Problem response',
      sc4d: 'Review unpaid money, disputes and fraud.',
      azTitle: 'What do we base the analysis on?',
      azDesc: 'We look at the context, relationships and evidence using <strong>an AI trained on Vietnamese legal knowledge</strong> and an analysis structure inspired by <strong>criminal case profiling</strong>.',
      svcTitle: 'Every check and response,<br>in one place.',
      svcLead: 'From checking and reviewing to responding —<br>go straight to the service you need.',
      svc1: 'Costs & administrative information',
      svc1d: 'Check the costs and procedures you need for life and administration in Vietnam.',
      svc2: 'Contracts, quotes & suspicious documents',
      svc2d: 'Review the documents and quotes you received, and situations that seem suspicious.',
      svc3: 'Company setup & business licences',
      svc3d: 'Check the registration and licence procedures your business needs.',
      svc4: 'Applications, documents & expiry dates',
      svc4d: 'Manage application progress, submitted documents and key expiry dates.',
      ck1: 'Work permit', ck2: 'Residence card', ck3: 'Driving licence', ck4: 'Temporary residence (Tạm trú)',
      hq1d: 'Issuance &amp; renewal costs', hq2d: 'Requirements &amp; costs', hq3t: 'Tạm trú', hq3d: 'Temporary residence registration', hq4d: 'Conversion &amp; new licence costs', hq5t: 'Document review', hq5d: 'Review all kinds of documents',
      rg1: 'Company setup', rg2: 'Restaurant', rg3: 'Fire safety', rg4: 'Hygiene', rg5: 'Environment', rg6: 'Cosmetics', rg7: 'Medical devices', rg8: 'Franchise',
      pt1: 'Progress timeline', pt2: 'Documents & expiry dates', pt3: 'Notifications', pt4: 'Talk to staff',
      cta1: 'Check', cta2: 'Review', cta3: 'Register', cta4: 'View progress',
      trustTitle: 'We check against<br>official sources.',
      trustNote: 'We check information against official materials published in Vietnam.',
      trustFine: 'MY VIET CHECK is not a government body and has no partnership with or certification from any of these institutions.',
      src1: 'Ministry of Justice', src2: 'Ministry of Finance', src3: 'Ministry of Home Affairs', src4: 'Ministry of Public Security', src5: 'Tax Department', src6: 'Ministry of Health',
      disclaimer: 'MY VIET CHECK helps you check general information and does not replace legal advice. Some cases may need an expert consultation, which may be charged.',
      _title: 'MY VIET CHECK | Before you decide, check it yourself',
    },
    vi: {
      _label: 'Tiếng Việt',
      login: 'Đăng nhập',
      bizPage: 'Trang doanh nghiệp',
      nav1: 'Kiểm tra', nav2: 'Xác minh', nav3: 'Đăng ký', nav4: 'Quản lý',
      heroEyebrow: 'Kiểm tra chi phí cư trú·kinh doanh·hành chính·pháp lý·tài chính',
      heroTitle: '<span class="t1">Số tiền này,</span><br><span class="t2">có thật đúng?</span>',
      heroSub: 'Từ chi phí, thông tin đến hợp đồng và các loại giấy tờ tại Việt Nam — hãy <span class="hl">tự kiểm tra</span> trước khi quyết định.',
      cta: 'Tự kiểm tra miễn phí',
      selfTitle: 'Có thắc mắc?<br>Hãy <span class="hl">tự kiểm tra</span> trước.',
      selfLead: 'Từ chi phí đến giấy tờ,<br>hãy kiểm tra trước thông tin bạn nhận được tại Việt Nam.',
      askLabel: 'Nội dung cần kiểm tra',
      askPh: 'VD: Giấy phép lao động báo giá 3.000 USD có đúng không?',
      askDoc: 'Kiểm tra giấy tờ',
      askDocDesc: 'Tải lên hợp đồng, báo giá, văn bản hành chính, giấy tờ thuế… để tự kiểm tra.',
      dt1: 'Văn bản hành chính', dt2: 'Giấy tờ bất động sản', dt3: 'Tài liệu nghi lừa đảo', dt4: 'Giấy tờ thuế', dt5: 'Tài liệu chưa rõ khác',
      vf6: 'Nợ chưa thu & tranh chấp',
      askSubmit: 'Kiểm tra',
      askHow: 'Nhấn Kiểm tra để mở trang kiểm tra phù hợp với câu hỏi của bạn.', resultNote: 'Kết quả là thông tin tham khảo dựa trên tài liệu công khai và mức thị trường thông thường, không thay thế tư vấn pháp lý hay quyết định của cơ quan nhà nước. Khi cần kiểm tra thêm, chúng tôi sẽ hướng dẫn tư vấn chuyên gia.',
      askEmpty: 'Hãy nhập điều bạn muốn kiểm tra.',
      popLabel: 'Câu hỏi thường gặp',
      pop1: 'Chi phí giấy phép lao động này có đúng không?', pop2: 'Thẻ tạm trú tốn bao nhiêu?', pop3: 'Thủ tục thành lập công ty thế nào?', pop4: 'Gia hạn visa tốn bao nhiêu?', pop5: 'Tôi muốn kiểm tra báo giá đã nhận.',
      scopeTitle: 'Từ chi phí, giấy tờ<br>đến xử lý vấn đề.',
      scopeLead: 'Từ thông tin, giấy tờ bạn nhận được tại Việt Nam đến khi có vấn đề — hãy kiểm tra những gì bạn cần trước.',
      sc1t: 'Chi phí · Thông tin',
      sc1d: 'Kiểm tra báo giá và chi phí đã nhận.',
      sc2t: 'Giấy tờ · Hợp đồng',
      sc2d: 'Rà soát hợp đồng và các loại giấy tờ.',
      sc3t: 'Kinh doanh · Hành chính',
      sc3d: 'Kiểm tra thành lập công ty và giấy phép.',
      sc4t: 'Xử lý vấn đề',
      sc4d: 'Rà soát nợ chưa thu, tranh chấp, lừa đảo.',
      azTitle: 'Chúng tôi phân tích dựa trên điều gì?',
      azDesc: 'Chúng tôi xem xét bối cảnh, mối quan hệ và chứng cứ bằng <strong>AI được huấn luyện về kiến thức pháp luật Việt Nam</strong> và cấu trúc phân tích lấy cảm hứng từ phương pháp <strong>phân tích hồ sơ vụ án hình sự</strong>.',
      svcTitle: 'Kiểm tra và ứng phó,<br>tất cả ở một nơi.',
      svcLead: 'Từ kiểm tra, rà soát đến xử lý vấn đề —<br>đi thẳng đến dịch vụ bạn cần.',
      svc1: 'Chi phí & thông tin hành chính',
      svc1d: 'Kiểm tra chi phí và thủ tục cần thiết cho cuộc sống và hành chính tại Việt Nam.',
      svc2: 'Hợp đồng, báo giá & tài liệu đáng ngờ',
      svc2d: 'Rà soát giấy tờ, báo giá đã nhận và các tình huống đáng ngờ.',
      svc3: 'Thành lập công ty & giấy phép kinh doanh',
      svc3d: 'Kiểm tra thủ tục đăng ký và giấy phép cần cho hoạt động kinh doanh.',
      svc4: 'Hồ sơ, tiến độ & ngày hết hạn',
      svc4d: 'Quản lý tiến độ hồ sơ, giấy tờ đã nộp và các ngày hết hạn quan trọng.',
      ck1: 'Giấy phép lao động', ck2: 'Thẻ tạm trú', ck3: 'Bằng lái xe', ck4: 'Đăng ký tạm trú',
      hq1d: 'Chi phí cấp mới · gia hạn', hq2d: 'Điều kiện · chi phí cấp', hq3t: 'Tạm trú', hq3d: 'Kiểm tra đăng ký tạm trú', hq4d: 'Chi phí đổi · cấp mới', hq5t: 'Kiểm tra giấy tờ', hq5d: 'Kiểm tra các loại giấy tờ',
      rg1: 'Thành lập công ty', rg2: 'Nhà hàng', rg3: 'PCCC', rg4: 'Vệ sinh', rg5: 'Môi trường', rg6: 'Mỹ phẩm', rg7: 'Thiết bị y tế', rg8: 'Nhượng quyền',
      pt1: 'Tiến độ', pt2: 'Hồ sơ & ngày hết hạn', pt3: 'Thông báo', pt4: 'Trao đổi với nhân viên',
      cta1: 'Kiểm tra', cta2: 'Rà soát', cta3: 'Đăng ký', cta4: 'Xem tiến độ',
      trustTitle: 'Kiểm tra dựa trên<br>nguồn chính thức.',
      trustNote: 'Chúng tôi kiểm tra thông tin dựa trên tài liệu chính thức công khai tại Việt Nam.',
      trustFine: 'MY VIET CHECK không phải cơ quan nhà nước và không có quan hệ hợp tác hay chứng nhận với các cơ quan này.',
      src1: '', src2: '', src3: '', src4: '', src5: '', src6: '',
      disclaimer: 'MY VIET CHECK hỗ trợ kiểm tra thông tin chung và không thay thế tư vấn pháp lý. Một số trường hợp cần tư vấn chuyên gia và có thể phát sinh phí.',
      _title: 'MY VIET CHECK | Trước khi quyết định, hãy tự kiểm tra',
    },
    zh: {
      _label: '中文',
      login: '登录',
      bizPage: '企业会员页面',
      nav1: '核查', nav2: '验证', nav3: '登记', nav4: '管理',
      heroEyebrow: '越南居留·经营·行政·法律·金融费用核查平台',
      heroTitle: '<span class="t1">这个金额，</span><br><span class="t2">真的对吗？</span>',
      heroSub: '从在越南收到的费用、信息到合同和各类文件，<br>做决定之前，请<span class="hl">先亲自核实</span>。',
      cta: '免费亲自核实',
      selfTitle: '有疑问，<br><span class="hl">先亲自核实</span>。',
      selfLead: '从费用到文件，<br>先核实您在越南收到的信息。',
      askLabel: '想要核实的内容',
      askPh: '例）听说工作许可费用要3,000美元，对吗？',
      askDoc: '用文件核实',
      askDocDesc: '上传合同、报价单、行政文件、税务文件等，亲自核实。',
      dt1: '行政文件', dt2: '房地产文件', dt3: '疑似诈骗文件', dt4: '税务文件', dt5: '其他不确定文件',
      vf6: '欠款·纠纷审查',
      askSubmit: '核实',
      askHow: '点击“核实”后，将前往与您问题相符的核实页面。', resultNote: '核实结果是基于公开资料和一般市场范围的参考信息，不能替代法律咨询或行政机关的决定。如需进一步确认，我们将为您介绍专家咨询。',
      askEmpty: '请用一句话写下您想核实的内容。',
      popLabel: '常见问题',
      pop1: '工作许可费用对吗？', pop2: '居留卡要多少钱？', pop3: '公司设立流程是怎样的？', pop4: '签证延期要多少钱？', pop5: '我想核对收到的报价。',
      scopeTitle: '从费用、文件<br>到问题应对。',
      scopeLead: '从在越南收到的信息和文件，到出现问题时——先从您需要的开始核实。',
      sc1t: '费用 · 信息',
      sc1d: '核实收到的报价和费用。',
      sc2t: '文件 · 合同',
      sc2d: '审查合同及各类文件。',
      sc3t: '经营 · 行政',
      sc3d: '确认公司设立与许可。',
      sc4t: '问题应对',
      sc4d: '审查欠款、纠纷、诈骗情况。',
      azTitle: '我们依据什么进行分析？',
      azDesc: '借助<strong>学习了越南法律知识的AI</strong>与借鉴<strong>刑事案件侧写</strong>方法的分析结构审视情况、关系与证据。',
      svcTitle: '所需的核实与应对，<br>一站完成。',
      svcLead: '从核实、审查到问题应对，<br>直接前往您需要的服务。',
      svc1: '费用·行政信息核实',
      svc1d: '核实在越南生活与办理行政事务所需的费用和手续。',
      svc2: '合同·报价·可疑文件审查',
      svc2d: '审查收到的文件、报价以及可疑情况。',
      svc3: '公司设立·经营许可确认',
      svc3d: '确认经营所需的登记与许可手续。',
      svc4: '申请进度·文件·到期日管理',
      svc4d: '管理申请进度、提交的文件及重要到期日。',
      ck1: '工作许可', ck2: '居留卡', ck3: '驾照', ck4: '暂住登记 (Tạm trú)',
      hq1d: '办理·续签费用核实', hq2d: '办理条件·费用核实', hq3t: '暂住', hq3d: '暂住登记核实', hq4d: '换证·考取费用核实', hq5t: '文件审查', hq5d: '各类文件审查',
      rg1: '公司设立', rg2: '餐厅', rg3: '消防', rg4: '卫生', rg5: '环境', rg6: '化妆品', rg7: '医疗器械', rg8: '加盟',
      pt1: '进度', pt2: '提交文件·到期日', pt3: '通知', pt4: '联系负责人',
      cta1: '核实', cta2: '审查', cta3: '登记', cta4: '查看进度',
      trustTitle: '以官方资料<br>为核实依据。',
      trustNote: '参考越南官方公开资料核实信息。',
      trustFine: 'MY VIET CHECK 并非政府机构，与上述机构不存在合作或认证关系。',
      src1: '司法部', src2: '财政部', src3: '内务部', src4: '公安部', src5: '税务局', src6: '卫生部',
      disclaimer: 'MY VIET CHECK 是帮助核实一般信息的服务，不能替代法律咨询。视具体情况可能需要咨询专家，并可能产生咨询费用。',
      _title: 'MY VIET CHECK | 做决定之前，先亲自核实',
    },
  };

  let lang = 'ko';

  function readLocale() {
    const m = document.cookie.match(/(?:^|;\s*)vfbcai_locale=([a-z]{2})/);
    if (m && I18N[m[1]]) return m[1];
    try { const s = localStorage.getItem('mvc_lang'); if (s && I18N[s]) return s; } catch (_) {}
    return 'ko';
  }

  function setLang(next, persist) {
    if (!I18N[next]) return;
    lang = next;
    const dict = I18N[next];
    document.documentElement.lang = next;
    document.title = dict._title;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = dict[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.placeholder = dict[el.dataset.i18nPh];
    });
    document.querySelectorAll('[data-lang-current]').forEach((el) => { el.textContent = dict._label; });
    document.querySelectorAll('[data-set-lang]').forEach((b) => {
      b.setAttribute('aria-current', String(b.dataset.setLang === next));
    });
    if (persist) {
      // Same cookie the vfbcai.com app reads, so the choice carries into CHECK / VERIFY / …
      document.cookie = `vfbcai_locale=${next}; path=/; max-age=31536000; samesite=lax`;
      try { localStorage.setItem('mvc_lang', next); } catch (_) {}
    }
  }

  // Language menu
  const langMenu = document.querySelector('[data-lang-menu]');
  const langBtn = langMenu.querySelector('.lang-btn');
  const langPop = langMenu.querySelector('.lang-pop');
  function closeLang() { langPop.hidden = true; langBtn.setAttribute('aria-expanded', 'false'); }
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = langPop.hidden;
    langPop.hidden = !open;
    langBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => { if (!langMenu.contains(e.target)) closeLang(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLang(); closeMenu(); } });
  document.querySelectorAll('[data-set-lang]').forEach((b) => {
    b.addEventListener('click', () => { setLang(b.dataset.setLang, true); closeLang(); });
  });

  // ---------- Header: transparent over the hero, solid after ----------
  const header = document.getElementById('siteHeader');
  const hero = document.getElementById('top');
  function updateHeader() {
    const threshold = hero.offsetHeight - header.offsetHeight - 8;
    header.classList.toggle('is-solid', window.scrollY > threshold);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);

  // ---------- Mobile menu ----------
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() {
    if (mobileMenu.hidden) return;
    mobileMenu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  menuBtn.addEventListener('click', () => {
    if (!mobileMenu.hidden) { closeMenu(); return; }
    mobileMenu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  // ---------- Self check ----------
  const form = document.getElementById('askForm');
  const input = document.getElementById('askInput');
  const hint = document.getElementById('askHint');
  const docLink = document.getElementById('askDoc');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim().replace(/\s+/g, ' ');
    if (!q) {
      hint.textContent = I18N[lang].askEmpty;
      input.focus();
      return;
    }
    window.location.href = resolveQuery(q);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  // The field starts as one line and grows with the question (capped in CSS).
  function autosize() {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
    input.style.overflowY = input.scrollHeight > input.clientHeight + 1 ? 'auto' : 'hidden';
  }
  window.addEventListener('resize', autosize);
  autosize();

  input.addEventListener('input', () => {
    autosize();
    hint.textContent = '';
    pills.forEach((p) => p.classList.toggle('is-picked', p.textContent.trim() === input.value.trim()));
  });

  // Popular questions fill the input (editable) — 확인하기 then sends it through the same routing.
  const pills = document.querySelectorAll('[data-fill]');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      input.value = pill.textContent.trim();
      autosize();
      hint.textContent = '';
      pills.forEach((p) => p.classList.toggle('is-picked', p === pill));
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  });

  // Documents are reviewed (and uploaded) in the VERIFY document-review flow.
  docLink.addEventListener('click', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    window.location.href = serviceUrl(DOCUMENT_REVIEW[0], DOCUMENT_REVIEW[1], q || undefined);
  });

  // CTAs → self check, focusing the input
  document.querySelectorAll('[data-cta]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('self-check').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => input.focus({ preventScroll: true }), 650);
    });
  });

  // ---------- Hero video: two layers, play only while visible ----------
  const video = document.querySelector('.hero-video');
  const videoBg = document.querySelector('.hero-video-bg');
  if (video && videoBg) {
    // Keep the blurred ambient layer locked to the main layer.
    const sync = () => {
      if (Math.abs(videoBg.currentTime - video.currentTime) > 0.12) videoBg.currentTime = video.currentTime;
      if (!video.paused && videoBg.paused) videoBg.play().catch(() => {});
    };
    video.addEventListener('timeupdate', sync);
    video.addEventListener('seeked', sync);
    video.addEventListener('play', () => { sync(); videoBg.play().catch(() => {}); });
    video.addEventListener('pause', () => videoBg.pause());
  }
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.05 }).observe(video.parentElement);
  }

  // ---------- Scroll reveal ----------
  // IntersectionObserver drives the fade-in; a plain scroll/resize check backs it up
  // so content can never stay hidden (e.g. in-app browsers or throttled tabs).
  const pending = new Set(document.querySelectorAll('.reveal'));
  const show = (el) => { el.classList.add('in'); pending.delete(el); };
  function revealInView() {
    const limit = window.innerHeight * 0.94;
    pending.forEach((el) => { if (el.getBoundingClientRect().top < limit) show(el); });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
    pending.forEach((el) => io.observe(el));
  }
  window.addEventListener('scroll', revealInView, { passive: true });
  window.addEventListener('resize', revealInView);
  window.addEventListener('load', revealInView);
  revealInView();
  // Last-resort safety net: scroll events aren't delivered in every context, timers are.
  const safety = setInterval(() => { revealInView(); if (!pending.size) clearInterval(safety); }, 500);

  // ---------- "How we analyze" bubble: plays once, when it is well inside the viewport ----------
  const scopeNote = document.getElementById('scopeNote');
  if (scopeNote) {
    let done = false;
    const showNote = () => { if (done) return; done = true; scopeNote.classList.add('is-shown'); };
    const noteInView = () => scopeNote.getBoundingClientRect().top < window.innerHeight * 0.8;
    if ('IntersectionObserver' in window) {
      const noteIO = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { showNote(); noteIO.disconnect(); }
      }, { threshold: 0.6 });
      noteIO.observe(scopeNote);
    }
    // same fallbacks as the reveals, so it can never stay hidden
    const check = () => { if (!done && noteInView()) showNote(); };
    window.addEventListener('scroll', check, { passive: true });
    const noteSafety = setInterval(() => { check(); if (done) clearInterval(noteSafety); }, 500);
    check();
  }

  setLang(readLocale(), false);
  updateHeader();
})();
