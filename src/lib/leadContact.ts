export type LeadContact = {
  name: string;
  phone: string;
  address: string;
  kakao_id?: string | null;
  zalo_id?: string | null;
};

const KEY = "vfbc_lead_contact";

export function saveLeadContact(contact: LeadContact) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(contact));
  } catch {
    // sessionStorage 사용 불가 환경이면 조용히 무시
  }
}

export function getLeadContact(): LeadContact | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LeadContact) : null;
  } catch {
    return null;
  }
}
