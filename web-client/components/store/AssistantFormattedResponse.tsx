"use client";

import React from "react";
import { Sparkles, ArrowRight, CheckCircle2, Tag, ShieldCheck } from "lucide-react";

interface AssistantFormattedResponseProps {
  text: string;
}

// Helper to format inline markdown (bold, code/SKU chips, and prices)
const renderInlineContent = (content: string): React.ReactNode => {
  // Regex matches:
  // 1. Bold: **text**
  // 2. Code/SKU chip: `code`
  // 3. Currency: ₪1,499.00 or 1,499 ש"ח
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|₪\s*[\d,]+(?:\.\d{1,2})?|[\d,]+(?:\.\d{1,2})?\s*(?:ש"ח|₪))/g;
  const parts = content.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      // If bold text contains a price, style it as a badge
      if (/₪\s*[\d,]+|[\d,]+\s*(?:ש"ח|₪)/.test(boldText)) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 mx-1 rounded-lg font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs shadow-xs"
          >
            {boldText}
          </span>
        );
      }
      return (
        <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
          {boldText}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      const codeText = part.slice(1, -1);
      return (
        <span
          key={index}
          className="inline-block px-1.5 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60"
        >
          {codeText}
        </span>
      );
    }

    if (/^(?:₪\s*[\d,]+(?:\.\d{1,2})?|[\d,]+(?:\.\d{1,2})?\s*(?:ש"ח|₪))$/.test(part.trim())) {
      return (
        <span
          key={index}
          className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded-md font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 text-xs"
        >
          {part.trim()}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

// Sanitize accidental Arabic script leakage from LLM closing formulas
const sanitizeArabicLeak = (content: string): string => {
  if (!/[\u0600-\u06FF]/.test(content)) return content;
  let sanitized = content
    .replace(/إذا\s+كنת?\s+بحاجة\s+إلى\s+أي\s+مساعد[ةه]?/g, "אם אתה זקוק לעזרה נוספת")
    .replace(/لا\s+تتردد\s+في\s+التواصل/g, "אני כאן תמיד לשירותך")
    .replace(/شكراً\s+لك/g, "תודה רבה")
    .replace(/[\u0600-\u06FF]+/g, "")
    .trim();
  return sanitized || "אם תרצה, אוכל לעזור לך בפעולה נוספת!";
};

export const AssistantFormattedResponse: React.FC<AssistantFormattedResponseProps> = ({ text }) => {
  // Normalize paragraphs and cleanse any Arabic hallucinations
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => sanitizeArabicLeak(p.trim()))
    .filter(Boolean);

  return (
    <div dir="rtl" className="space-y-2.5 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
      {paragraphs.map((para, idx) => {
        const isIntro = idx === 0 && (para.startsWith("שלום") || para.startsWith("היי"));
        const isOutro =
          idx === paragraphs.length - 1 &&
          (para.includes("האם תרצה") ||
            para.includes("אוכל לעזור") ||
            para.includes("לשירותך") ||
            para.includes("זקוק לעזרה"));

        // Match leading icon / section title (e.g. "🔍 **איתור בקטלוג וזמינות מלאי**:")
        const headerMatch = para.match(/^([^\n*:]*?)\s*\*\*([^*]+)\*\*[:\n]?([\s\S]*)$/);

        if (isIntro) {
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/15 dark:via-purple-500/10 border-r-4 border-indigo-500 font-medium text-slate-700 dark:text-slate-200"
            >
              {renderInlineContent(para)}
            </div>
          );
        }

        if (isOutro) {
          return (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent dark:from-amber-500/15 border border-amber-300/40 dark:border-amber-800/30 flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
              <span>{renderInlineContent(para)}</span>
            </div>
          );
        }

        // Structured section card
        if (headerMatch && headerMatch[2]) {
          const icon = headerMatch[1]?.trim() || "✨";
          const title = headerMatch[2].trim();
          const remainingContent = (headerMatch[3] || "").trim();

          const lines = remainingContent
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/60 dark:border-indigo-900/40 bg-white/80 dark:bg-[#0f1422]/90 backdrop-blur-xl shadow-xs p-3.5 space-y-2 transform-gpu transition-all hover:border-indigo-300 dark:hover:border-indigo-700/60"
            >
              {/* Card Header */}
              <div className="flex items-center gap-2 font-black text-xs text-indigo-950 dark:text-indigo-200 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-base shrink-0">{icon}</span>
                <span>{title}</span>
              </div>

              {/* Card Body */}
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {lines.map((line, lIdx) => {
                  const isBullet = line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ");
                  const cleanLine = isBullet ? line.replace(/^[-•*]\s*/, "") : line;

                  if (isBullet) {
                    return (
                      <div key={lIdx} className="flex items-start gap-2 pr-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span className="flex-1">{renderInlineContent(cleanLine)}</span>
                      </div>
                    );
                  }

                  return <p key={lIdx}>{renderInlineContent(cleanLine)}</p>;
                })}
              </div>
            </div>
          );
        }

        // Default card
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-[#0f1422]/80 backdrop-blur-md p-3.5 shadow-xs text-xs"
          >
            {renderInlineContent(para)}
          </div>
        );
      })}
    </div>
  );
};
