import { Lock, PenLine, Search, ShieldCheck } from "lucide-react";

const PRINCIPLES = [
  {
    key: "check",
    label: "CHECK",
    question: "내가 이것을 해야 하는가?",
    icon: Search,
  },
  {
    key: "verify",
    label: "VERIFY",
    question: "받은 정보·서류·견적이 맞는가?",
    icon: ShieldCheck,
  },
  {
    key: "register",
    label: "REGISTER",
    question: "실제로 어떻게 진행하는가?",
    icon: PenLine,
  },
  {
    key: "protect",
    label: "PROTECT",
    question: "진행 과정에서 어떻게 보호받는가?",
    icon: Lock,
  },
] as const;

export default function CostCheckPrinciples() {
  return (
    <section
      className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-5 sm:px-5"
      aria-label="VFBCAI 서비스 철학"
    >
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        VFBCAI
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {PRINCIPLES.map(({ key, label, question, icon: Icon }) => (
          <div key={key} className="text-center">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              <Icon size={14} strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-2 text-[10px] font-bold tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">{question}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
