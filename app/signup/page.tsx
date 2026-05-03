"use client";

import { Loader2, Lock, Mail, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthField from "../components/AuthField";
import AuthShell from "../components/AuthShell";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const nameErr = validateName(name);
    if (nameErr) next.name = nameErr;
    const emailErr = validateEmail(email);
    if (emailErr) next.email = emailErr;
    const pwErr = validatePassword(password);
    if (pwErr) next.password = pwErr;
    if (!confirm) {
      next.confirm = "Please confirm your password.";
    } else if (confirm !== password) {
      next.confirm = "Passwords don't match.";
    }
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(
          typeof data?.error === "string" ? data.error : "Sign up failed.",
        );
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
      title="Create your account"
      subtitle="Start generating on-brand calendars in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          id="name"
          label="Name"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          disabled={loading}
          error={errors.name}
          leadingIcon={<User className="h-4 w-4" aria-hidden />}
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
          }}
          disabled={loading}
          error={errors.password}
          hint="Use 8+ characters with letters and numbers."
          leadingIcon={<Lock className="h-4 w-4" aria-hidden />}
        />

        <AuthField
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
          }}
          disabled={loading}
          error={errors.confirm}
          leadingIcon={<Lock className="h-4 w-4" aria-hidden />}
        />

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
              <span>Creating account…</span>
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" aria-hidden />
              <span>Create account</span>
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
