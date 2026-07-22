"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const FIELD_BASE =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-200 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

/**
 * VFBCAI 공통 UI — 한 줄 입력 필드. rounded-xl, 충분한 padding, 통일된 focus 스타일.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, className, ...props }, ref) => (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-gray-900">
          {label}
        </span>
      )}
      <input ref={ref} className={cn(FIELD_BASE, className)} {...props} />
      {hint && (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  )
);
TextField.displayName = "TextField";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

/**
 * VFBCAI 공통 UI — 여러 줄 입력 필드. TextField와 동일한 디자인 언어 공유.
 */
export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, hint, className, ...props }, ref) => (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-gray-900">
          {label}
        </span>
      )}
      <textarea
        ref={ref}
        className={cn(FIELD_BASE, "resize-none", className)}
        {...props}
      />
      {hint && (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  )
);
TextAreaField.displayName = "TextAreaField";
