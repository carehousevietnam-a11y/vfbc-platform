"use client";

const NEEDS_EXPERT_MARKER = "[NEEDS_EXPERT]";

const SECTION_HEADER_RE = /^【(.+?)】$/;
const BULLET_RE = /^(?:·|-)\s+/;
const DOC_NUMBER_LINE_RE =
  /^[·-]\s*(\d{1,4}\/\d{4}\/[A-Za-zÀ-ỹĐđ\-]+(?:\s*\(số\))?)/;
const DISCLAIMER_PREFIX = "이 내용은 AI가";
const LEGAL_BASIS_PREFIX = "관련 법령";
const MYPAGE_CTA_PREFIX = "무료 회원가입 후";
const VIETNAMESE_CHAR_RE = /[À-ỹĐđ]/;

type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "section"; title: string }
  | { kind: "bullet"; text: string }
  | { kind: "doc"; number: string; title?: string }
  | { kind: "disclaimer"; text: string };

type RenderUnit =
  | { kind: "bullets"; items: string[] }
  | { kind: "block"; block: Block };

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function isVietnameseHeavy(text: string): boolean {
  const matches = text.match(VIETNAMESE_CHAR_RE);
  if (!matches) return false;
  return matches.length >= 3;
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const paragraphs = content.split(/\n\n+/);

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith(DISCLAIMER_PREFIX)) {
      blocks.push({ kind: "disclaimer", text: trimmed });
      continue;
    }

    const lines = trimmed.split("\n");
    let index = 0;

    while (index < lines.length) {
      const line = lines[index].trim();
      if (!line) {
        index += 1;
        continue;
      }

      const sectionMatch = line.match(SECTION_HEADER_RE);
      if (sectionMatch) {
        blocks.push({ kind: "section", title: sectionMatch[1] });
        index += 1;
        continue;
      }

      const docMatch = line.match(DOC_NUMBER_LINE_RE);
      if (docMatch) {
        const number = docMatch[1].replace(/\s*\(số\)\s*$/, "").trim();
        const nextLine = lines[index + 1]?.trim() ?? "";
        const title =
          nextLine && !SECTION_HEADER_RE.test(nextLine) && !BULLET_RE.test(nextLine)
            ? nextLine
            : undefined;
        blocks.push({ kind: "doc", number, title });
        index += title ? 2 : 1;
        continue;
      }

      if (BULLET_RE.test(line)) {
        blocks.push({ kind: "bullet", text: line.replace(BULLET_RE, "") });
        index += 1;
        continue;
      }

      const chunk: string[] = [line];
      index += 1;
      while (index < lines.length) {
        const peek = lines[index].trim();
        if (
          !peek ||
          SECTION_HEADER_RE.test(peek) ||
          BULLET_RE.test(peek) ||
          DOC_NUMBER_LINE_RE.test(peek)
        ) {
          break;
        }
        chunk.push(peek);
        index += 1;
      }
      blocks.push({ kind: "paragraph", text: chunk.join("\n") });
    }
  }

  return blocks;
}

function groupBlocks(blocks: Block[]): RenderUnit[] {
  const units: RenderUnit[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = () => {
    if (bulletBuffer.length > 0) {
      units.push({ kind: "bullets", items: bulletBuffer });
      bulletBuffer = [];
    }
  };

  for (const block of blocks) {
    if (block.kind === "bullet") {
      bulletBuffer.push(block.text);
      continue;
    }
    flushBullets();
    units.push({ kind: "block", block });
  }

  flushBullets();
  return units;
}

type ChatAnswerContentProps = {
  content: string;
  className?: string;
};

export function ChatAnswerContent({ content, className = "" }: ChatAnswerContentProps) {
  const sanitized = content.split(NEEDS_EXPERT_MARKER).join("").trim();
  if (!sanitized) return null;

  const units = groupBlocks(parseBlocks(sanitized));

  return (
    <div
      className={`space-y-4 text-[15px] leading-relaxed text-slate-800 sm:text-base sm:leading-[1.65] ${className}`}
    >
      {units.map((unit, index) => {
        if (unit.kind === "bullets") {
          return (
            <ul key={index} className="space-y-2">
              {unit.items.map((text, bulletIndex) => (
                <li key={bulletIndex} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
                  <span
                    className={`min-w-0 flex-1 break-words ${
                      isVietnameseHeavy(text) ? "text-[14px] leading-relaxed text-slate-700" : ""
                    }`}
                  >
                    {renderInline(text)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        const block = unit.block;

        if (block.kind === "section") {
          return (
            <h3
              key={index}
              className="pt-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg"
            >
              {block.title}
            </h3>
          );
        }

        if (block.kind === "doc") {
          return (
            <div
              key={index}
              className="rounded-xl bg-slate-50/90 px-4 py-3 ring-1 ring-slate-200/70"
            >
              <p className="font-mono text-[13px] font-semibold tracking-tight text-slate-800 sm:text-sm">
                {block.number}
              </p>
              {block.title ? (
                <p className="mt-1 break-words text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                  {block.title}
                </p>
              ) : null}
            </div>
          );
        }

        if (block.kind === "disclaimer") {
          return (
            <p
              key={index}
              className="border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500 sm:text-[13px]"
            >
              {block.text}
            </p>
          );
        }

        if (block.kind === "paragraph") {
          if (block.text.startsWith(LEGAL_BASIS_PREFIX)) {
            return (
              <p
                key={index}
                className="text-[13px] leading-relaxed text-slate-600 sm:text-sm"
              >
                {renderInline(block.text)}
              </p>
            );
          }

          if (block.text.startsWith(MYPAGE_CTA_PREFIX)) {
            return (
              <p key={index} className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                {renderInline(block.text)}
              </p>
            );
          }

          if (block.text.startsWith("최종 업데이트:")) {
            return (
              <p key={index} className="text-xs text-slate-500 sm:text-[13px]">
                <time>{block.text.replace("최종 업데이트:", "").trim()}</time>
              </p>
            );
          }
        }

        return (
          <p
            key={index}
            className={`break-words whitespace-pre-line ${
              block.kind === "paragraph" && isVietnameseHeavy(block.text)
                ? "text-[14px] leading-relaxed text-slate-700"
                : ""
            }`}
          >
            {block.kind === "paragraph" ? renderInline(block.text) : null}
          </p>
        );
      })}
    </div>
  );
}
