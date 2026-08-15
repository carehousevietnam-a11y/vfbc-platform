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
      className="border-t border-slate-100/80 pt-8 sm:pt-10"
      aria-label="VFBCAI 서비스 철학"
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 sm:gap-x-4">
        {PRINCIPLES.map(({ key, label, question, icon: Icon }) => (
          <div key={key} className="text-center sm:text-left">
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md border border-slate-100 bg-white text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:mx-0">
              <Icon size={12} strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-2 text-[9px] font-bold tracking-[0.12em] text-slate-400 sm:text-[10px]">
              {label}
            </p>
            <p className="mt-0.5 text-[10px] leading-snug text-slate-400 sm:text-[11px]">
              {question}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
