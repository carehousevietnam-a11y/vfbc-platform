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
          VFBCAI · 개인정보처리방침 · Chính sách bảo mật
        </p>
        <div className="mt-2 flex items-center gap-2">
          <ShieldCheck className="text-blue-900" size={22} />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            개인정보처리방침
          </h1>
        </div>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          VFBCAI(베트남 외국인 비즈니스 검증·등록 AI 센터)는 베트남에서
          설립·운영되는 서비스로서, 이용자의 개인정보를 베트남
          개인정보보호법(Luật số 91/2025/QH15) 및 시행령(Nghị định số
          356/2025/NĐ-CP)에 따라 처리합니다. 본 방침은 베트남어 원문을
          기준으로 하며, 한국어는 이용자 편의를 위한 번역본입니다. 원문과
          번역본의 내용이 다를 경우 베트남어 원문이 우선합니다.
        </p>
        <p className="mt-3 text-[11px] text-gray-400">
          시행일: 2026년 7월 10일 · 최종 수정일: 2026년 7월 12일
        </p>

        {/* Điều 1 */}
        <section className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 1 (Các loại thông tin cá nhân thu thập và phương thức)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            VFBCAI thu thập thông tin dưới đây do người dùng trực tiếp nhập
            trong quá trình đăng ký dịch vụ (chẩn đoán, tư vấn, đăng ký hộ
            khẩu tạm trú/thẻ tạm trú, xin giấy phép lao động, v.v.).
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">Mục bắt buộc</span>{" "}
              — Họ tên, số điện thoại, địa chỉ cư trú hiện tại
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">Mục tùy chọn</span>{" "}
              — Email, ID Kakao Talk, ID Zalo
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">
                Tự động phát sinh khi sử dụng dịch vụ
              </span>{" "}
              — Lịch sử sử dụng dịch vụ, nhật ký truy cập, lịch sử tư
              vấn/chẩn đoán
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">
                Thu thập bổ sung khi yêu cầu dịch vụ đại lý
              </span>{" "}
              — Bản sao hộ chiếu, hợp đồng thuê nhà và các giấy tờ cần thiết
              khác
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제1조 (수집하는 개인정보 항목 및 방법)
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              VFBCAI는 서비스 신청(진단, 상담, 등록 대행 등) 과정에서
              이용자가 직접 입력하는 방식으로 아래 정보를 수집합니다.
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
          </div>
        </section>

        {/* Điều 2 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 2 (Mục đích thu thập và sử dụng thông tin cá nhân)
          </h2>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · Thông báo kết quả chẩn đoán/xác nhận và tư vấn liên quan
            </li>
            <li className="text-sm text-gray-600">
              · Tự động tạo tài khoản và xác thực đăng nhập để sử dụng dịch
              vụ
            </li>
            <li className="text-sm text-gray-600">
              · Thực hiện dịch vụ đại lý đăng ký, khai báo hành chính
            </li>
            <li className="text-sm text-gray-600">
              · Cung cấp dịch vụ bổ sung như nhắc hạn thẻ tạm trú, giấy phép
              lao động, thị thực
            </li>
            <li className="text-sm text-gray-600">
              · Thông báo dịch vụ và kết quả qua email, Kakao Talk, Zalo
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제2조 (개인정보의 수집 및 이용 목적)
            </h3>
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
          </div>
        </section>

        {/* Điều 3 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 3 (Thời gian lưu trữ và sử dụng thông tin cá nhân)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Thông tin cá nhân của người dùng được lưu trữ đến khi đạt được
            mục đích thu thập/sử dụng hoặc đến khi hủy tài khoản, sau đó sẽ
            được hủy không chậm trễ. Tuy nhiên, trường hợp pháp luật liên
            quan yêu cầu lưu trữ thì sẽ được bảo quản trong thời hạn do pháp
            luật đó quy định.
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제3조 (개인정보의 보유 및 이용 기간)
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              이용자의 개인정보는 수집·이용 목적이 달성되거나 회원 탈퇴 시까지
              보유하며, 이후 지체 없이 파기합니다. 다만 관계 법령에 따라
              보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.
            </p>
          </div>
        </section>

        {/* Điều 4 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 4 (Cung cấp thông tin cá nhân cho bên thứ ba)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            VFBCAI về nguyên tắc không cung cấp thông tin cá nhân của người
            dùng cho bên ngoài. Tuy nhiên, các trường hợp sau là ngoại lệ.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · Trường hợp người dùng đã đồng ý trước một cách riêng biệt
            </li>
            <li className="text-sm text-gray-600">
              · Trường hợp cần nộp cho cơ quan hành chính có thẩm quyền tại
              Việt Nam (công an, cục quản lý xuất nhập cảnh, v.v.) để thực
              hiện dịch vụ đại lý đăng ký
            </li>
            <li className="text-sm text-gray-600">
              · Trường hợp có yêu cầu của cơ quan điều tra theo trình tự và
              phương thức pháp luật quy định
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제4조 (개인정보의 제3자 제공)
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              VFBCAI는 이용자의 개인정보를 원칙적으로 외부에 제공하지
              않습니다. 다만 아래의 경우는 예외로 합니다.
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
                · 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진
                절차와 방법에 따라 수사기관의 요구가 있는 경우
              </li>
            </ul>
          </div>
        </section>

        {/* Điều 5 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 5 (Ủy thác xử lý thông tin cá nhân)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            VFBCAI ủy thác một số công việc xử lý thông tin cá nhân như dưới
            đây để cung cấp dịch vụ thuận lợi, và quy định các nội dung cần
            thiết trong hợp đồng ủy thác để đảm bảo thông tin cá nhân được
            quản lý an toàn.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">
                Supabase (khu vực Singapore)
              </span>{" "}
              — Lưu trữ, quản lý thông tin thành viên và dữ liệu sử dụng
              dịch vụ
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">Resend</span> —
              Gửi email thông báo kết quả và nhắc nhở
            </li>
            <li className="text-sm text-gray-600">
              · <span className="font-medium text-gray-800">Vercel</span> —
              Lưu trữ và vận hành website
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제5조 (개인정보 처리의 위탁)
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              VFBCAI는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리
              업무를 위탁하고 있으며, 위탁 계약 시 개인정보가 안전하게 관리될
              수 있도록 필요한 사항을 규정하고 있습니다.
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
                · <span className="font-medium text-gray-800">Vercel</span> —
                웹사이트 호스팅 및 운영
              </li>
            </ul>
          </div>
        </section>

        {/* Điều 6 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 6 (Quyền, nghĩa vụ của chủ thể dữ liệu và cách thức thực
            hiện)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Người dùng có thể yêu cầu xem, sửa đổi, xóa hoặc tạm ngừng xử lý
            thông tin cá nhân của mình bất cứ lúc nào, thông qua trang cá
            nhân hoặc thông tin liên hệ bên dưới. Người dùng có quyền từ
            chối đồng ý; tuy nhiên, việc từ chối đối với các mục bắt buộc có
            thể làm hạn chế việc sử dụng dịch vụ (xem kết quả chẩn đoán,
            hướng dẫn đăng ký, tạo tài khoản, v.v.).
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제6조 (정보주체의 권리·의무 및 행사 방법)
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              이용자는 언제든지 자신의 개인정보에 대해
              열람·정정·삭제·처리정지 요청을 할 수 있으며, 마이페이지 또는
              아래 문의처를 통해 요청할 수 있습니다. 동의를 거부할 권리가
              있으나, 필수 항목에 대한 동의 거부 시 서비스 이용(진단 결과
              확인, 등록 안내, 계정 생성 등)이 제한될 수 있습니다.
            </p>
          </div>
        </section>

        {/* Điều 7 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 7 (Hủy thông tin cá nhân)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Khi thời hạn lưu trữ thông tin cá nhân kết thúc hoặc mục đích xử
            lý đã đạt được, thông tin dưới dạng tệp điện tử sẽ được xóa vĩnh
            viễn bằng phương pháp không thể khôi phục.
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제7조 (개인정보의 파기)
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우, 전자적
              파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제합니다.
            </p>
          </div>
        </section>

        {/* Điều 8 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 8 (Biện pháp bảo đảm an toàn thông tin cá nhân)
          </h2>
          <ul className="mt-3 space-y-1.5">
            <li className="text-sm text-gray-600">
              · Giới hạn quyền truy cập thông tin cá nhân chỉ cho nhân viên
              phụ trách tối thiểu cần thiết
            </li>
            <li className="text-sm text-gray-600">
              · Kiểm soát truy cập cơ sở dữ liệu và mã hóa lưu trữ (mật khẩu,
              v.v.)
            </li>
            <li className="text-sm text-gray-600">
              · Lưu giữ nhật ký truy cập hệ thống xử lý thông tin cá nhân
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제8조 (개인정보의 안전성 확보 조치)
            </h3>
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
          </div>
        </section>

        {/* Điều 9 - 담당자 정보 반영 완료 */}
        <section className="mt-4 rounded-3xl bg-white border border-blue-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều 9 (Người phụ trách bảo vệ thông tin cá nhân)
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            VFBCAI chỉ định người phụ trách bảo vệ thông tin cá nhân dưới
            đây để phụ trách chung công việc xử lý thông tin cá nhân và
            giải quyết khiếu nại, bồi thường thiệt hại cho người dùng.
          </p>
          <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Họ tên: DO HAI YEN · Email: vnkhanoi@gmail.com · Điện thoại:
            0916031010
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 제9조 (개인정보 보호책임자)
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              VFBCAI는 개인정보 처리에 관한 업무를 총괄하고 이용자의
              불만처리 및 피해구제를 위하여 아래와 같이 개인정보
              보호책임자를 지정하고 있습니다.
            </p>
            <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
              성명: DO HAI YEN · 이메일: vnkhanoi@gmail.com · 연락처:
              0916031010
            </div>
          </div>
        </section>

        {/* Điều khoản thi hành / 부칙 */}
        <section className="mt-4 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-gray-900">
            Điều khoản thi hành
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Chính sách bảo mật này có hiệu lực từ ngày 10 tháng 7 năm 2026.
            Trường hợp có thay đổi nội dung, chúng tôi sẽ thông báo trước
            trên website ít nhất 7 ngày trước ngày có hiệu lực.
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              한국어 번역 — 부칙
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              이 개인정보처리방침은 2026년 7월 10일부터 시행됩니다. 내용이
              변경되는 경우 시행일 최소 7일 전 웹사이트를 통해 사전
              공지합니다.
            </p>
          </div>
        </section>

        <p className="mt-6 text-[11px] text-gray-400 leading-relaxed">
          본 문서는 서비스 운영을 위한 안내 목적으로 작성되었으며, 법률
          자문을 대체하지 않습니다. 정식 게시 전 변호사 검토를 권장합니다.
        </p>
      </div>
    </main>
  );
}
