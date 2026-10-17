/** §11-3 — 서버 전용 기계번역. 원문·번역문은 로그에 남기지 않는다. */

export type TranslateDirection = "ko_to_vi" | "vi_to_ko";

export async function machineTranslateAccountingText(
  direction: TranslateDirection,
  text: string
): Promise<{ ok: true; translated: string } | { ok: false }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || !text.trim()) return { ok: false };

  const target = direction === "ko_to_vi" ? "Vietnamese" : "Korean";
  const source = direction === "ko_to_vi" ? "Korean" : "Vietnamese";

  const system =
    "You translate accounting UI memos between Korean and Vietnamese. " +
    "Do not change numbers, invoice numbers, dates, tax IDs, or proper nouns. " +
    "Return only the translation with no quotes or explanation.";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Translate from ${source} to ${target}:\n\n${text}`,
            },
          ],
          max_completion_tokens: 800,
        }),
      });
      if (!res.ok) {
        console.error("accountingMachineTranslate: upstream status", res.status);
        continue;
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const translated = data?.choices?.[0]?.message?.content?.trim() ?? "";
      if (translated) return { ok: true, translated };
    } catch {
      console.error("accountingMachineTranslate: attempt failed", attempt + 1);
    }
  }
  return { ok: false };
}
