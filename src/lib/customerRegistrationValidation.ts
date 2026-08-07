// src/lib/customerRegistrationValidation.ts
//
// STEP22 — 고객정보(이름/전화번호/주소/이메일/SNS) 공통 검증 모듈.
//
// 이 파일은 브라우저(클라이언트 폼)와 Node 서버(API Route) 양쪽에서 동일하게
// import 되어 사용됩니다. 그래서 DOM이나 브라우저 전용 API는 절대 쓰지 않습니다.
// "프론트와 서버가 동일한 규칙을 사용해야 한다"는 원칙에 따라, 검증 로직은
// 반드시 이 파일에만 존재해야 하며 각 페이지/route.ts에서 별도로 재구현하지 않습니다.
//
// 이 모듈이 다루는 것: 값의 "형식"이 최소 기준을 충족하는지(빈 값, "L"·"3" 같은
// 의미 없는 한두 글자 입력 방지)만 검증합니다. 실제 서류 진위 여부·법적 유효성
// 판단은 이 모듈의 책임이 아닙니다 (VFBCAI 헌법 4번: AI/서버 로직은 최종 판단을
// 내리지 않습니다).

export type SupportedLanguage = "ko" | "zh" | "en" | "vi";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["ko", "zh", "en", "vi"];

/** URL의 ?lang= 값(또는 임의의 원문자열)을 지원 언어 코드로 정규화합니다. 알 수 없는 값은 기본값 "ko"로 처리합니다. */
export function resolveLanguage(input: string | null | undefined): SupportedLanguage {
  const v = (input || "").trim().toLowerCase();
  if (v === "zh" || v === "cn" || v === "zh-cn" || v === "zh-tw") return "zh";
  if (v === "en" || v === "en-us") return "en";
  if (v === "vi" || v === "vn") return "vi";
  return "ko";
}

export type LeadFormFields = {
  name: string;
  phone: string;
  address: string;
  email: string;
  kakao_id?: string | null;
  zalo_id?: string | null;
};

export type LeadFormFieldKey = "name" | "phone" | "address" | "email" | "kakao_id" | "zalo_id" | "sns";

export type FieldErrors = Partial<Record<LeadFormFieldKey, string>>;

export type FieldMessage = {
  label: string;
  placeholder: string;
  required: string;
  invalid: string;
};

// STEP22(2차) — 언어별로 "둘 중 하나 필수"인 SNS 조합. 실제 입력 필드는 항상 kakao_id(1번
// 슬롯=messengers.primary)/zalo_id(2번 슬롯=messengers.secondary) 두 개뿐이므로, 검증
// 로직 자체는 "두 슬롯 중 하나라도 값이 있는가"만 보면 된다. 이 상수는 에러 문구에
// 실제 필요한 플랫폼 이름을 정확히 보여주기 위한 용도로만 쓰인다.
export const SNS_REQUIREMENT_LABEL: Record<SupportedLanguage, string> = {
  ko: "카카오톡 또는 잘로(Zalo)",
  zh: "위챗(WeChat) 또는 잘로(Zalo)",
  en: "WhatsApp or Zalo",
  vi: "Zalo hoặc WhatsApp",
};

export type LeadFormMessages = {
  name: FieldMessage;
  phone: FieldMessage;
  address: FieldMessage;
  email: FieldMessage;
  sns: { label: string; required: string };
  consentSummary: string;
  consentRequiredWarning: string;
  submitLabel: string;
  submitLoadingLabel: string;
  privacyNoticeLine: string;
  noticeLine: string;
  resetLabel: string;
  countryCodeCustomRequired: string;
};

export const LEAD_FORM_MESSAGES: Record<SupportedLanguage, LeadFormMessages> = {
  ko: {
    name: {
      label: "이름",
      placeholder: "이름",
      required: "이름을 입력해주세요.",
      invalid: "이름을 2자 이상 정확히 입력해주세요.",
    },
    phone: {
      label: "전화번호",
      placeholder: "전화번호",
      required: "전화번호를 입력해주세요.",
      invalid: "전화번호는 숫자 8~15자리로 정확히 입력해주세요.",
    },
    address: {
      label: "현재 거주지 주소",
      placeholder: "현재 거주지 주소 (예: Quận 1, TP.HCM)",
      required: "현재 거주지 주소를 입력해주세요.",
      invalid: "주소를 5자 이상 정확히 입력해주세요.",
    },
    email: {
      label: "이메일",
      placeholder: "이메일",
      required: "이메일을 입력해주세요.",
      invalid: "올바른 이메일 형식으로 입력해주세요.",
    },
    sns: {
      label: "카카오톡 / 잘로(Zalo)",
      required: "카카오톡 또는 잘로(Zalo) ID 중 하나를 입력해주세요.",
    },
    consentSummary: "입력하신 정보로 계정이 자동 생성되며, 개인정보 수집·이용에 동의합니다.",
    consentRequiredWarning:
      "베트남 개인정보보호법에 따라 동의하지 않으면 계정 생성 및 서비스 이용(결과 확인, 상담 등)을 진행할 수 없습니다.",
    submitLabel: "AI 분석 리포트 무료로 받기",
    submitLoadingLabel: "접수 중...",
    privacyNoticeLine: "입력하신 정보는 상담 안내 목적으로만 사용됩니다.",
    noticeLine: "이름·연락처·주소·이메일을 남기시면 AI가 서류를 상세 분석한 리포트를 바로 보여드립니다.",
    resetLabel: "처음부터 다시 확인하기",
    countryCodeCustomRequired: "국가번호를 입력해주세요.",
  },
  zh: {
    name: {
      label: "姓名",
      placeholder: "姓名",
      required: "请输入姓名。",
      invalid: "姓名至少需要2个字符。",
    },
    phone: {
      label: "电话号码",
      placeholder: "电话号码",
      required: "请输入电话号码。",
      invalid: "请输入正确的电话号码（8~15位数字）。",
    },
    address: {
      label: "现居住地址",
      placeholder: "现居住地址（例：Quận 1, TP.HCM）",
      required: "请输入现居住地址。",
      invalid: "地址至少需要5个字符。",
    },
    email: {
      label: "电子邮箱",
      placeholder: "电子邮箱",
      required: "请输入电子邮箱。",
      invalid: "请输入正确的电子邮箱格式。",
    },
    sns: {
      label: "微信(WeChat) / Zalo",
      required: "请填写微信(WeChat)或Zalo ID中的一个。",
    },
    consentSummary: "根据您输入的信息将自动创建账户，即代表您同意个人信息的收集与使用。",
    consentRequiredWarning:
      "根据越南个人信息保护法，若不同意，将无法创建账户及使用服务（查看结果、咨询等）。",
    submitLabel: "免费获取AI分析报告",
    submitLoadingLabel: "提交中...",
    privacyNoticeLine: "您输入的信息仅用于咨询指导目的。",
    noticeLine: "留下姓名、联系方式、地址和电子邮箱，即可立即获取AI详细分析报告。",
    resetLabel: "重新开始诊断",
    countryCodeCustomRequired: "请输入国家代码。",
  },
  en: {
    name: {
      label: "Full name",
      placeholder: "Full name",
      required: "Please enter your name.",
      invalid: "Please enter a name with at least 2 characters.",
    },
    phone: {
      label: "Phone number",
      placeholder: "Phone number",
      required: "Please enter your phone number.",
      invalid: "Please enter a valid phone number (8–15 digits).",
    },
    address: {
      label: "Current address",
      placeholder: "Current address (e.g. Quận 1, TP.HCM)",
      required: "Please enter your current address.",
      invalid: "Please enter an address with at least 5 characters.",
    },
    email: {
      label: "Email",
      placeholder: "Email",
      required: "Please enter your email address.",
      invalid: "Please enter a valid email address.",
    },
    sns: {
      label: "WhatsApp / Zalo",
      required: "Please enter either your WhatsApp or Zalo ID.",
    },
    consentSummary:
      "An account will be created automatically from the information you provide, and you agree to the collection and use of your personal data.",
    consentRequiredWarning:
      "Under Vietnam's Personal Data Protection Law, if you do not consent, we cannot create an account or provide the service (viewing results, consultation, etc.).",
    submitLabel: "Get my free AI report",
    submitLoadingLabel: "Submitting...",
    privacyNoticeLine: "The information you provide is used only for consultation purposes.",
    noticeLine: "Leave your name, contact, address, and email, and get a detailed AI-analyzed report right away.",
    resetLabel: "Start over",
    countryCodeCustomRequired: "Please enter a country code.",
  },
  vi: {
    name: {
      label: "Họ và tên",
      placeholder: "Họ và tên",
      required: "Vui lòng nhập họ và tên.",
      invalid: "Vui lòng nhập họ tên có ít nhất 2 ký tự.",
    },
    phone: {
      label: "Số điện thoại",
      placeholder: "Số điện thoại",
      required: "Vui lòng nhập số điện thoại.",
      invalid: "Vui lòng nhập số điện thoại hợp lệ (8–15 chữ số).",
    },
    address: {
      label: "Địa chỉ hiện tại",
      placeholder: "Địa chỉ hiện tại (VD: Quận 1, TP.HCM)",
      required: "Vui lòng nhập địa chỉ hiện tại.",
      invalid: "Vui lòng nhập địa chỉ có ít nhất 5 ký tự.",
    },
    email: {
      label: "Email",
      placeholder: "Email",
      required: "Vui lòng nhập email.",
      invalid: "Vui lòng nhập địa chỉ email hợp lệ.",
    },
    sns: {
      label: "Zalo / WhatsApp",
      required: "Vui lòng nhập ID Zalo hoặc WhatsApp.",
    },
    consentSummary:
      "Tài khoản sẽ được tạo tự động từ thông tin bạn cung cấp, và bạn đồng ý với việc thu thập, sử dụng thông tin cá nhân.",
    consentRequiredWarning:
      "Theo Luật Bảo vệ dữ liệu cá nhân của Việt Nam, nếu không đồng ý, bạn sẽ không thể tạo tài khoản và sử dụng dịch vụ (xem kết quả, tư vấn, v.v.).",
    submitLabel: "Nhận báo cáo phân tích AI miễn phí",
    submitLoadingLabel: "Đang gửi...",
    privacyNoticeLine: "Thông tin bạn cung cấp chỉ được sử dụng cho mục đích tư vấn, hướng dẫn.",
    noticeLine: "Chỉ cần để lại họ tên, số điện thoại, địa chỉ và email, AI sẽ gửi ngay báo cáo phân tích chi tiết.",
    resetLabel: "Kiểm tra lại từ đầu",
    countryCodeCustomRequired: "Vui lòng nhập mã quốc gia.",
  },
};

// ── 개별 필드 검증 규칙 ────────────────────────────────────────────
// "이름: L", "전화번호: 3" 같은 의미 없는 한두 글자 입력을 걸러내는 것이 목적이며,
// 실명 확인·전화번호 실사용 여부까지 검증하지는 않습니다(서류 검토 단계의 역할).

const NAME_MIN_LETTERS = 2;
export function isValidName(raw: string): boolean {
  const v = (raw || "").trim();
  if (!v) return false;
  const letterCount = (v.match(/[\p{L}]/gu) || []).length;
  return letterCount >= NAME_MIN_LETTERS;
}

const PHONE_DIGITS_MIN = 8;
const PHONE_DIGITS_MAX = 15;
export function isValidPhone(raw: string): boolean {
  const digits = (raw || "").replace(/[^\d]/g, "");
  return digits.length >= PHONE_DIGITS_MIN && digits.length <= PHONE_DIGITS_MAX;
}

const ADDRESS_MIN_LENGTH = 5;
export function isValidAddress(raw: string): boolean {
  const v = (raw || "").trim();
  if (v.length < ADDRESS_MIN_LENGTH) return false;
  return /[\p{L}\d]/u.test(v);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(raw: string): boolean {
  const v = (raw || "").trim();
  if (!v) return false; // STEP22: 전 언어 공통 이메일 필수
  return EMAIL_REGEX.test(v);
}

/**
 * SNS ID 자체의 "형식"만 보는 헬퍼 — 값이 있다면 최소 2자 이상이어야 한다.
 * "필수 여부"(kakao_id/zalo_id 중 최소 하나)는 validateLeadForm()에서 별도로 판단한다.
 */
export function isValidSocialId(raw: string | null | undefined): boolean {
  if (!raw) return true;
  return raw.trim().length >= 2;
}

/**
 * [STEP22 2차] 언어와 무관하게, 실제 입력 슬롯은 항상 kakao_id(=messengers.primary)와
 * zalo_id(=messengers.secondary) 두 개뿐이다. 언어별로 "카카오/잘로", "위챗/잘로",
 * "왓츠앱/잘로", "잘로/왓츠앱" 중 무엇이 필요한지는 messenger.ts의 페어 구성이 이미
 * 결정하므로, 검증 로직은 언어를 몰라도 "둘 중 하나는 채워져 있는가"만 확인하면 된다.
 */
export function hasRequiredSocialContact(kakaoId: string | null | undefined, zaloId: string | null | undefined): boolean {
  const a = (kakaoId || "").trim();
  const b = (zaloId || "").trim();
  return a.length >= 2 || b.length >= 2;
}

/**
 * 리드폼 전체를 한 번에 검증합니다. 프론트(제출 시점)와 서버(lead-submit API)가
 * 반드시 이 함수 하나만 호출해야 하며, 별도로 규칙을 복제하지 않습니다.
 */
export function validateLeadForm(
  fields: LeadFormFields,
  lang: SupportedLanguage = "ko"
): { valid: boolean; errors: FieldErrors } {
  const m = LEAD_FORM_MESSAGES[lang] ?? LEAD_FORM_MESSAGES.ko;
  const errors: FieldErrors = {};

  if (!fields.name || !fields.name.trim()) {
    errors.name = m.name.required;
  } else if (!isValidName(fields.name)) {
    errors.name = m.name.invalid;
  }

  if (!fields.phone || !fields.phone.trim()) {
    errors.phone = m.phone.required;
  } else if (!isValidPhone(fields.phone)) {
    errors.phone = m.phone.invalid;
  }

  if (!fields.address || !fields.address.trim()) {
    errors.address = m.address.required;
  } else if (!isValidAddress(fields.address)) {
    errors.address = m.address.invalid;
  }

  if (!fields.email || !fields.email.trim()) {
    errors.email = m.email.required;
  } else if (!isValidEmail(fields.email)) {
    errors.email = m.email.invalid;
  }

  // [STEP22 2차] SNS는 더 이상 선택이 아니다 — kakao_id/zalo_id 두 슬롯 중 최소 하나는
  // 반드시 값이 있어야 한다(언어별로 어떤 플랫폼이 그 슬롯에 들어가는지는 messenger.ts가
  // 결정하므로 여기서는 슬롯 두 개 중 하나만 확인하면 된다).
  if (!hasRequiredSocialContact(fields.kakao_id, fields.zalo_id)) {
    errors.sns = m.sns.required;
  } else {
    if (fields.kakao_id && !isValidSocialId(fields.kakao_id)) {
      errors.kakao_id = m.name.invalid;
    }
    if (fields.zalo_id && !isValidSocialId(fields.zalo_id)) {
      errors.zalo_id = m.name.invalid;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── SNS 저장 형식 ─────────────────────────────────────────────────
// DB 스키마(kakao_id/zalo_id 컬럼)는 이번 STEP에서 변경하지 않습니다. 대신
// crm_activities.meta에 실제 플랫폼명을 정확히 구분한 socialContacts 객체를
// 함께 저장합니다 (기존 primary/secondary 슬롯에 담긴 값이 실제로 어떤
// 플랫폼인지는 messenger.ts의 페어 구성으로만 알 수 있었는데, 이제 meta에도
// 명시적으로 남깁니다).

export type SocialContacts = Partial<Record<"kakao" | "wechat" | "whatsapp" | "zalo", string>>;

// ── 개인정보 동의문 번역 블록 ───────────────────────────────────────
// 베트남어 원문(법적 근거)은 언제나 그대로 두고, "번역" 섹션만 선택된 언어에
// 맞춰 바꿔서 보여준다. 원문과 번역이 다르면 베트남어 원문이 우선한다는
// 문구는 모든 언어에서 공통으로 유지한다. primary/secondary는 messenger.ts의
// 실제 채널 라벨을 그대로 받아 수집 항목 목록에 정확히 반영한다.

export type ConsentTranslation = {
  heading: string;
  body: string;
  items: string[];
};

export function getConsentTranslation(
  lang: SupportedLanguage,
  primaryLabel: string,
  secondaryLabel: string
): ConsentTranslation {
  switch (lang) {
    case "zh":
      return {
        heading: "中文翻译（仅供参考，以越南语原文为准）",
        body: "本服务在越南运营，您的个人信息将根据越南《个人信息保护法》（第91/2025/QH15号，自2026年1月1日起施行）及其实施细则（第356/2025/NĐ-CP号）进行处理。",
        items: [
          `收集项目：姓名、电话号码、地址、电子邮箱、${primaryLabel}或${secondaryLabel} ID（二选一，必填）`,
          "收集目的：为咨询指导及自动创建服务账户",
          "保留期限：至会员注销或达成处理目的为止",
          "您可以拒绝同意，但拒绝后可能无法使用部分服务（查看诊断结果、咨询等）。",
        ],
      };
    case "en":
      return {
        heading: "English translation (for reference only — Vietnamese original prevails)",
        body: "This service operates in Vietnam. Your personal data is processed under Vietnam's Personal Data Protection Law (No. 91/2025/QH15, effective January 1, 2026) and its implementing decree (No. 356/2025/NĐ-CP).",
        items: [
          `Data collected: name, phone number, address, email, and either your ${primaryLabel} or ${secondaryLabel} ID (one required)`,
          "Purpose: consultation, guidance, and automatic service account creation",
          "Retention period: until account closure or the purpose is fulfilled",
          "You may decline consent, but doing so may limit your ability to use some services (viewing diagnosis results, consultation, etc.).",
        ],
      };
    case "vi":
      return {
        heading: "Bản dịch tiếng Việt (chỉ mang tính tham khảo — văn bản gốc phía trên có giá trị ưu tiên)",
        body: "Dịch vụ này hoạt động tại Việt Nam. Dữ liệu cá nhân của bạn được xử lý theo Luật Bảo vệ dữ liệu cá nhân (Luật số 91/2025/QH15, có hiệu lực từ 01/01/2026) và Nghị định số 356/2025/NĐ-CP.",
        items: [
          `Thông tin thu thập: họ tên, số điện thoại, địa chỉ, email, và ID ${primaryLabel} hoặc ${secondaryLabel} (bắt buộc chọn một)`,
          "Mục đích: tư vấn, hướng dẫn và tự động tạo tài khoản dịch vụ",
          "Thời hạn lưu trữ: đến khi hủy tài khoản hoặc đạt được mục đích xử lý",
          "Bạn có thể từ chối đồng ý, nhưng việc từ chối có thể khiến bạn không sử dụng được một số dịch vụ (xem kết quả chẩn đoán, tư vấn, v.v.).",
        ],
      };
    default:
      return {
        heading: "한국어 번역 (이용자 편의 제공용 — 원문과 다를 경우 베트남어 원문이 우선합니다)",
        body: "본 서비스는 베트남에서 운영되며, 이용자의 개인정보는 베트남 개인정보보호법(91/2025/QH15호, 2026년 1월 1일 시행) 및 시행령(356/2025/NĐ-CP호)에 따라 처리됩니다.",
        items: [
          `수집 항목: 이름, 전화번호, 주소, 이메일, ${primaryLabel} 또는 ${secondaryLabel} ID(둘 중 하나 필수)`,
          "수집 목적: 상담·안내 및 서비스 이용을 위한 계정 자동 생성",
          "보유 기간: 회원 탈퇴 시 또는 목적 달성 시까지",
          "동의를 거부하실 수 있으나, 거부 시 계정 생성이 불가하여 결과 확인·상담 등 서비스 이용이 제한될 수 있습니다.",
        ],
      };
  }
}

export function buildSocialContacts(input: {
  kakaoValue?: string | null;
  zaloValue?: string | null;
  primaryKey: "kakao" | "wechat" | "line" | "whatsapp" | "zalo";
  secondaryKey: "kakao" | "wechat" | "line" | "whatsapp" | "zalo";
}): SocialContacts {
  const out: SocialContacts = {};
  const primary = (input.kakaoValue || "").trim();
  const secondary = (input.zaloValue || "").trim();
  if (primary && (input.primaryKey === "kakao" || input.primaryKey === "wechat" || input.primaryKey === "whatsapp" || input.primaryKey === "zalo")) {
    out[input.primaryKey] = primary;
  }
  if (secondary && (input.secondaryKey === "kakao" || input.secondaryKey === "wechat" || input.secondaryKey === "whatsapp" || input.secondaryKey === "zalo")) {
    out[input.secondaryKey] = secondary;
  }
  return out;
}

// ── 전화번호 국가번호 선택 ───────────────────────────────────────────
// 베트남에 거주하는 외국인이 타깃이라, 실제 사용 전화가 본국(한국/중국) 번호일 수도,
// 현지(베트남) 번호일 수도 있다. 언어와 실제 소지한 폰의 국가가 항상 일치하지는
// 않으므로(예: 한국어를 쓰지만 베트남 현지 유심을 쓰는 경우), 언어에 따라 기본값만
// 잡아주고 사용자가 언제든 직접 바꿀 수 있게 한다. DB 스키마는 바꾸지 않고, 국가번호는
// 번호 앞에 합쳐서 하나의 phone 문자열로 저장한다(예: "+82 10-1234-5678").
export type CountryCode = "+82" | "+84" | "+86" | "other";

export const COUNTRY_CODE_OPTIONS: { value: CountryCode; label: string }[] = [
  { value: "+82", label: "🇰🇷 +82" },
  { value: "+84", label: "🇻🇳 +84" },
  { value: "+86", label: "🇨🇳 +86" },
  { value: "other", label: "기타" },
];

/** 언어별 기본 국가번호 — 어디까지나 "기본값"이며 사용자가 즉시 다른 값으로 바꿀 수 있다. */
export const DEFAULT_COUNTRY_CODE_BY_LANGUAGE: Record<SupportedLanguage, CountryCode> = {
  ko: "+82",
  zh: "+86",
  en: "+84",
  vi: "+84",
};

export const COUNTRY_CODE_LABEL: Record<SupportedLanguage, string> = {
  ko: "국가번호",
  zh: "国家代码",
  en: "Country code",
  vi: "Mã quốc gia",
};

export const COUNTRY_CODE_CUSTOM_PLACEHOLDER: Record<SupportedLanguage, string> = {
  ko: "+1",
  zh: "+1",
  en: "+1",
  vi: "+1",
};

/** 선택된 국가번호(또는 직접입력값)와 전화번호 숫자를 하나의 저장용 문자열로 합친다. */
export function combinePhoneWithCountryCode(
  countryCode: CountryCode,
  customCode: string,
  phoneDigits: string
): string {
  const prefix = countryCode === "other" ? customCode.trim() : countryCode;
  const number = phoneDigits.trim();
  return prefix ? `${prefix} ${number}`.trim() : number;
}
