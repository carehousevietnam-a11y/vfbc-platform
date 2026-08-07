export type MessengerKey = "kakao" | "wechat" | "line" | "whatsapp" | "zalo";

export type MessengerPair = {
  primary: { key: MessengerKey; label: string };
  secondary: { key: MessengerKey; label: string };
};

// 잘로(Zalo)는 베트남 현지 필수 채널이라 모든 국가에서 secondary로 고정
export const MESSENGERS_KO: MessengerPair = {
  primary: { key: "kakao", label: "카카오톡" },
  secondary: { key: "zalo", label: "잘로(Zalo)" },
};

export const MESSENGERS_ZH: MessengerPair = {
  primary: { key: "wechat", label: "위챗(WeChat)" },
  secondary: { key: "zalo", label: "잘로(Zalo)" },
};

export const MESSENGERS_JA: MessengerPair = {
  primary: { key: "line", label: "라인(LINE)" },
  secondary: { key: "zalo", label: "잘로(Zalo)" },
};

export const MESSENGERS_EN: MessengerPair = {
  primary: { key: "whatsapp", label: "왓츠앱(WhatsApp)" },
  secondary: { key: "zalo", label: "잘로(Zalo)" },
};

// [STEP22 신규] 베트남어 사용자 — 잘로가 현지 최다 사용 채널이라 primary로 배치하고,
// secondary는 외국인 이용자도 많이 쓰는 왓츠앱으로 구성한다.
export const MESSENGERS_VI: MessengerPair = {
  primary: { key: "zalo", label: "Zalo" },
  secondary: { key: "whatsapp", label: "WhatsApp" },
};

// [STEP22 신규] "?lang=" 값(ko/zh/en/vi)으로 해당 언어권에 맞는 메신저 페어를 바로 찾기 위한 맵.
// customerRegistrationValidation.ts의 SupportedLanguage와 키를 맞춘다.
export const MESSENGERS_BY_LANGUAGE: Record<"ko" | "zh" | "en" | "vi", MessengerPair> = {
  ko: MESSENGERS_KO,
  zh: MESSENGERS_ZH,
  en: MESSENGERS_EN,
  vi: MESSENGERS_VI,
};
