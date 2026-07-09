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
