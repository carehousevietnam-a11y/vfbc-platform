"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBC · 개인정보처리방침 · Chính sách bảo mật
        </p>
        <div className="mt-2 flex items-center gap-2">
          <ShieldCheck className="text-blue-900" size={22} />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            개인정보처리방침
          </h1>
        </div>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          VFBC(베트남 외국인 비즈니스센터)는 이용자의 개인정보를 소중히
          다루며, 베트남 개인정보보호법(Luật số 91/2025/QH15) · 시행령(Nghị
          định số 356/2025/NĐ-CP) 및 대한민국 개인정보보호법에 따라 아래와
          같이 개인정보를 처리합니다.
        </p>
        <p className="mt-3 text-[11px] text-gray-400">
          시행일: 2026년 7월 10일 · 최종 수정일: 2026년 7월 10일
        </p>

        {/* ===== PART I. 베트남 ===== */}
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-blue-900">
          I. Việt Nam · 베트남
        </p>

        <section className="mt-3 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Thông báo dành cho người dùng tại Việt Nam
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Theo Luật Bảo vệ dữ liệu cá nhân (Luật số 91/2025/QH15, có hiệu
            lực từ ngày 01/01/2026) và Nghị định số 356/2025/NĐ-CP hướng dẫn
            thi hành, chúng tôi thu thập và xử lý dữ liệu cá nhân của bạn sau
            khi có sự đồng ý rõ ràng, bao gồm: họ tên, số điện thoại, địa
            chỉ, email (nếu có), ID Kakao/Zalo (nếu có), nhằm mục đích tư
            vấn, hướng dẫn đăng ký và tạo tài khoản dịch vụ tự động. Dữ liệu
            được lưu trữ đến khi bạn hủy tài khoản hoặc đạt được mục đích xử
            lý. Bạn có quyền từ chối đồng ý; tuy nhiên, việc từ chối có thể
            khiến bạn không thể sử dụng một số dịch vụ (hướng dẫn khai báo,
            xem kết quả, v.v.).
          </p>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            (한국어 참고 번역) 베트남 거주 이용자를 위한 안내
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            베트남 개인정보보호법(법률 제91/2025/QH15호, 2026년 1월 1일
            시행) 및 시행령(제356/2025/NĐ-CP호)에 따라, VFBC는 명확한 동의를
            받은 후 이름, 전화번호, 주소, 이메일(선택), 카카오톡/잘로
            ID(선택)를 상담·등록 안내 및 서비스 계정 자동 생성 목적으로
            수집·처리합니다. 데이터는 계정 해지 시 또는 처리 목적 달성 시까지
            보관됩니다. 동의를 거부할 권리가 있으나, 거부 시 신고 안내·결과
            확인 등 일부 서비스 이용이 제한될 수 있습니다.
          </p>
          <p className="mt-2 text-[11px] text-gray-400">
            ※ 위 한국어 문단은 베트남어 원문의 이해를 돕기 위한 참고
            번역이며, 법적 효력은 베트남어 원문 및 대한민국 개인정보보호법
            조항(아래 II)에 근거합니다.
          </p>
        </section>

        {/* ===== PART II. 대한민국 ===== */}
        <p className="mt-10 text-[11px] font-semibold uppercase tracking-widest text-blue-900">
          II. 대한민국
        </p>

        <section className="mt-3 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제1조 (수집하는 개인정보 항목 및 방법)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            VFBC는 서비스 신청(진단, 상담, 등록 대행 등) 과정에서 이용자가
            직접 입력하는 방식으로 아래 정보를 수집합니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">필수 항목</span>{" "}
              — 이름, 전화번호, 현재 거주지 주소
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">선택 항목</span>{" "}
              — 이메일, 카카오톡 ID, 잘로(Zalo) ID
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">
                서비스 이용 중 자동 생성
              </span>{" "}
              — 서비스 이용 기록, 접속 로그, 상담·진단 이력
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">
                대행 신청 시 추가 수집
              </span>{" "}
              — 여권 사본, 임대차 계약서 등 서비스 처리에 필요한 서류
            </li>
          </ul>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제2조 (개인정보의 수집 및 이용 목적)
          </h2>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · 진단·확인 서비스 결과 안내 및 관련 상담 제공
            </li>
            <li className="text-sm text-gray-600">
              · 서비스 이용을 위한 계정 자동 생성 및 로그인 식별
            </li>
            <li className="text-sm text-gray-600">
              · 행정 등록·신고 대행 서비스 수행
            </li>
            <li className="text-sm text-gray-600">
              · 거주증·노동허가·비자 등 만료 알림 등 부가 서비스 제공
            </li>
            <li className="text-sm text-gray-600">
              · 이메일·카카오톡·잘로 등을 통한 서비스 안내 및 결과 통지
            </li>
          </ul>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제3조 (개인정보의 보유 및 이용 기간)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            이용자의 개인정보는 수집·이용 목적이 달성되거나 회원 탈퇴 시까지
            보유하며, 이후 지체 없이 파기합니다. 다만 관계 법령에 따라 보존이
            필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.
          </p>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제4조 (개인정보의 제3자 제공)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            VFBC는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
            다만 아래의 경우는 예외로 합니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · 이용자가 사전에 별도로 동의한 경우
            </li>
            <li className="text-sm text-gray-600">
              · 등록 대행 서비스 수행을 위해 베트남 관할 행정기관(공안,
              출입국관리국 등)에 제출이 필요한 경우
            </li>
            <li className="text-sm text-gray-600">
              · 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와
              방법에 따라 수사기관의 요구가 있는 경우
            </li>
          </ul>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제5조 (개인정보 처리의 위탁)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            VFBC는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를
            위탁하고 있으며, 위탁 계약 시 개인정보가 안전하게 관리될 수
            있도록 필요한 사항을 규정하고 있습니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">
                Supabase (싱가포르 리전)
              </span>{" "}
              — 회원 정보 및 서비스 이용 데이터 저장·관리
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">Resend</span> —
              결과 안내 및 알림 이메일 발송
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">
                Vercel
              </span>{" "}
              — 웹사이트 호스팅 및 운영
            </li>
          </ul>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제6조 (정보주체의 권리·의무 및 행사 방법)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            이용자는 언제든지 자신의 개인정보에 대해 열람·정정·삭제·처리정지
            요청을 할 수 있으며, 마이페이지 또는 아래 문의처를 통해 요청할
            수 있습니다. 동의를 거부할 권리가 있으나, 필수 항목에 대한 동의
            거부 시 서비스 이용(진단 결과 확인, 등록 안내, 계정 생성 등)이
            제한될 수 있습니다.
          </p>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제7조 (개인정보의 파기)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우, 전자적
            파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제합니다.
          </p>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제8조 (개인정보의 안전성 확보 조치)
          </h2>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · 개인정보에 대한 접근 권한을 최소한의 담당자로 제한
            </li>
            <li className="text-sm text-gray-600">
              · 데이터베이스 접근 통제 및 암호화 저장(비밀번호 등)
            </li>
            <li className="text-sm text-gray-600">
              · 개인정보 처리 시스템에 대한 접속 기록 보관
            </li>
          </ul>
        </section>

        <section className="mt-4 rounded-3xl bg-white border border-amber-200 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            제9조 (개인정보 보호책임자)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            VFBC는 개인정보 처리에 관한 업무를 총괄하고 이용자의 불만처리 및
            피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고
            있습니다.
          </p>
          <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            성명: [담당자명 입력] · 이메일: [담당 이메일 입력] · 연락처:
            [연락처 입력]
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            ⚠️ 이 항목은 배포 전 실제 담당자 정보로 반드시 교체해야 합니다.
          </p>
        </section>

        {/* 부칙 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">부칙</h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            이 개인정보처리방침은 2026년 7월 10일부터 시행됩니다. 내용이
            변경되는 경우 시행일 최소 7일 전 웹사이트를 통해 사전 공지합니다.
          </p>
        </section>

        <p className="mt-6 text-[11px] text-gray-400 leading-relaxed">
          본 문서는 서비스 운영을 위한 안내 목적으로 작성되었으며, 법률
          자문을 대체하지 않습니다. 정식 게시 전 변호사 검토를 권장합니다.
        </p>
      </div>
    </main>
  );
}
