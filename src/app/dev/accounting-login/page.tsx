import Link from "next/link";
import { submitDevAccountingLogin } from "./actions";

const ACCOUNTS = [
  { key: "org_a_owner", label: "조직 A 대표 (company_owner)" },
  { key: "org_a_member", label: "조직 A 구성원 (company_member)" },
  { key: "org_b_owner", label: "조직 B 대표 (company_owner)" },
  { key: "vnk_expert", label: "조직 A 배정 VFBCAI 세무전문가" },
] as const;

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DevAccountingLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  if (process.env.NODE_ENV !== "development") {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center text-sm text-[#4B5563]">
        이 화면은 로컬 개발 환경에서만 사용할 수 있습니다.
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">로컬 전용</p>
        <h1 className="mt-1 text-xl font-extrabold text-[#071A33]">회계 모듈 테스트 로그인</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
          비밀번호는 <code className="text-xs">tests/accounting/dev-local-login-seed.mjs</code>와 동일한 설정 파일에
          있습니다. 운영 빌드·운영 DB에서는 비활성입니다.
        </p>
        <p className="mt-2 text-xs text-[#92400E]">
          /login 메일 링크: 로컬은 OTP SMTP·shouldCreateUser 정책 때문에 실패할 수 있음 → 이 화면 사용.
        </p>
      </div>

      <form className="flex flex-col gap-6" action={submitDevAccountingLogin}>
        <label className="block text-sm font-semibold text-[#071A33]">
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete="off"
            required
            className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
          />
        </label>

        {error === "auth" ? (
          <p className="text-sm text-[#B91C1C]">로그인 정보를 확인해주세요.</p>
        ) : null}

        <div className="flex flex-col gap-2">
          {ACCOUNTS.map((a) => (
            <button
              key={a.key}
              type="submit"
              name="account"
              value={a.key}
              className="min-h-11 rounded-lg bg-[#071A33] px-4 text-left text-sm font-semibold text-white"
            >
              {a.label}
            </button>
          ))}
        </div>
      </form>

      <Link href="/" className="text-center text-sm text-[#3D4B63] underline">
        홈으로
      </Link>
    </main>
  );
}
