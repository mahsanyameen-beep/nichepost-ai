"use client";

import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthField from "../components/AuthField";
import AuthShell from "../components/AuthShell";
import { validateEmail } from "@/lib/validation";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) next.email = emailErr;
    if (!password) next.password = "Password is required.";
    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, remember }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(typeof data?.error === "string" ? data.error : "Login failed.");
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setServerError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your content calendars."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-accent hover:text-white">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          disabled={loading}
          error={errors.email}
          leadingIcon={<Mail className="h-4 w-4" aria-hidden />}
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
          }}
          disabled={loading}
          error={errors.password}
          leadingIcon={<Lock className="h-4 w-4" aria-hidden />}
        />

        <label
          htmlFor="remember"
          className="flex cursor-pointer items-center gap-2 text-sm text-mute select-none"
        >
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 cursor-pointer rounded border-hairline bg-ink/60 text-accent accent-[#A78BFA] focus:ring-2 focus:ring-accent/40 focus:ring-offset-0 disabled:cursor-not-allowed"
          />
          <span>Remember me on this device</span>
        </label>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
              !
            </span>
            <p className="break-words text-red-300/90">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={[
            "group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7C3AED]/30 transition",
            "bg-gradient-to-br from-[#7C3AED] to-[#A855F7]",
            "hover:shadow-xl hover:shadow-[#7C3AED]/40 hover:brightness-110",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel",
            "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100",
          ].join(" ")}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" aria-hidden />
              <span>Sign in</span>
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
