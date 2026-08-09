"use client";

const SECTION_HEADER_RE = /^【(.+?)】$/;
const BULLET_RE = /^(?:·|-)\s+/;
const DOC_NUMBER_LINE_RE =
  /^[·-]\s*(\d{1,4}\/\d{4}\/[A-Za-zÀ-ỹĐđ\-]+(?:\s*\(số\))?)/;
const DISCLAIMER_PREFIX = "이 내용은 AI가";
const VIETNAMESE_CHAR_RE = /[À-ỹĐđ]/;

type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "section"; title: string }
  | { kind: "bullet"; text: string }
  | { kind: "doc"; number: string; title?: string }
  | { kind: "disclaimer"; text: string };

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-gray-900">
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

type ChatAnswerContentProps = {
  content: string;
  className?: string;
};

export function ChatAnswerContent({ content, className = "" }: ChatAnswerContentProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={`space-y-3 text-sm leading-relaxed text-gray-800 sm:text-[15px] sm:leading-7 ${className}`}>
      {blocks.map((block, index) => {
        if (block.kind === "section") {
          return (
            <p
              key={index}
              className="pt-1 text-[13px] font-bold tracking-tight text-blue-950 sm:text-sm"
            >
              【{block.title}】
            </p>
          );
        }

        if (block.kind === "doc") {
          return (
            <div
              key={index}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
            >
              <p className="font-mono text-[12px] font-semibold tracking-tight text-slate-800 sm:text-[13px]">
                {block.number}
              </p>
              {block.title ? (
                <p className="mt-1 break-words text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-5">
                  {block.title}
                </p>
              ) : null}
            </div>
          );
        }

        if (block.kind === "bullet") {
          return (
            <div key={index} className="flex gap-2 pl-0.5">
              <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
              <p
                className={`min-w-0 flex-1 break-words ${
                  isVietnameseHeavy(block.text) ? "text-xs leading-5 text-slate-600 sm:text-[13px]" : ""
                }`}
              >
                {renderInline(block.text)}
              </p>
            </div>
          );
        }

        if (block.kind === "disclaimer") {
          return (
            <p
              key={index}
              className="border-t border-gray-100 pt-3 text-[11px] leading-5 text-gray-400 sm:text-xs"
            >
              {block.text}
            </p>
          );
        }

        return (
          <p
            key={index}
            className={`break-words whitespace-pre-line ${
              isVietnameseHeavy(block.text) ? "text-xs leading-5 text-slate-600 sm:text-[13px] sm:leading-6" : ""
            }`}
          >
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
