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
    <main className="min-h-screen bg-[#f8f9fb]">
      <div className="h-[3px] bg-slate-900" />

      <div className="mx-auto max-w-[72rem] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-8 sm:mb-10">
          <Link
            href="/"
            className="inline-flex text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            ← VFBCAI 홈
          </Link>
        </div>

        <div className="mx-auto max-w-2xl space-y-10 sm:space-y-12">
          <CostCheckHero />

          <div className="space-y-6">
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
