"use client";

import Link from "next/link";
import { useState } from "react";
import CostCheckHero from "@/components/cost-check/cost-check-hero";
import CostCheckInput from "@/components/cost-check/cost-check-input";
import SuggestedQuestions from "@/components/cost-check/suggested-questions";
import CostCheckPrinciples from "@/components/cost-check/cost-check-principles";

export default function CostCheckPage() {
  const [question, setQuestion] = useState("");

  function handleSubmit() {
    // UI-only step: no API, no navigation. Future steps will wire logic here.
    if (!question.trim()) return;
  }

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      {/* warm neutral backdrop */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(30,58,138,0.04),transparent)]"
        aria-hidden
      />
      <div className="h-[3px] bg-slate-900" />

      <div className="relative mx-auto max-w-[74rem] px-4 pb-20 pt-5 sm:px-6 sm:pb-24 sm:pt-7">
        <Link
          href="/"
          className="inline-flex text-xs font-medium text-slate-400 transition-colors duration-200 hover:text-slate-600"
        >
          ← VFBCAI 홈
        </Link>

        <div className="mx-auto mt-10 max-w-[40rem] space-y-8 sm:mt-14 sm:space-y-10">
          <CostCheckHero />

          <div className="space-y-7">
            <CostCheckInput
              value={question}
              onChange={setQuestion}
              onSubmit={handleSubmit}
            />
            <SuggestedQuestions
              activeQuestion={question}
              onSelect={(q) => setQuestion(q)}
            />
          </div>

          <CostCheckPrinciples />
        </div>
      </div>
    </main>
  );
}
