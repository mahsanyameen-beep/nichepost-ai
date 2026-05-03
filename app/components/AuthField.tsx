"use client";

import { type InputHTMLAttributes, type ReactNode } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  leadingIcon?: ReactNode;
}

export default function AuthField({
  id,
  label,
  error,
  hint,
  leadingIcon,
  className = "",
  ...inputProps
}: AuthFieldProps) {
  const describedBy = [
    error ? `${id}-error` : null,
    hint ? `${id}-hint` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white">
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute">
            {leadingIcon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy || undefined}
          className={[
            "w-full rounded-xl border bg-ink/60 px-4 py-3 text-base text-white placeholder:text-mute/70 transition",
            leadingIcon ? "pl-10" : "",
            "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error
              ? "border-red-500/60 focus:ring-red-500/40"
              : "border-hairline focus:border-accent/40",
          ].join(" ")}
          {...inputProps}
        />
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs text-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
