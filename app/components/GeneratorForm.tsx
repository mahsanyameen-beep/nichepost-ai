"use client";

import {
  AtSign,
  Briefcase,
  Building2,
  Camera,
  Coffee,
  Laugh,
  Loader2,
  Lock,
  LogIn,
  Sparkles,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCurrentUser } from "./useCurrentUser";

export type Platform = "Instagram" | "LinkedIn" | "Twitter";
export type Tone = "Professional" | "Casual" | "Humorous";

export interface GeneratedPost {
  day: number;
  title: string;
  caption: string;
  hashtags: string[];
}

export interface GeneratorResult {
  niche: string;
  platform: Platform;
  tone: Tone;
  posts: GeneratedPost[] | null;
  imageUrl: string | null;
  contentError: string | null;
  imageError: string | null;
}

interface GeneratorFormProps {
  onResult: (result: GeneratorResult) => void;
}

const PLATFORM_OPTIONS: { value: Platform; label: string; Icon: typeof Camera }[] = [
  { value: "Instagram", label: "Instagram", Icon: Camera },
  { value: "LinkedIn", label: "LinkedIn", Icon: Building2 },
  { value: "Twitter", label: "Twitter", Icon: AtSign },
];

const TONE_OPTIONS: { value: Tone; label: string; Icon: typeof Briefcase }[] = [
  { value: "Professional", label: "Professional", Icon: Briefcase },
  { value: "Casual", label: "Casual", Icon: Coffee },
  { value: "Humorous", label: "Humorous", Icon: Laugh },
];

interface SegmentedControlProps<T extends string> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; Icon: typeof Camera }[];
  disabled?: boolean;
}

function SegmentedControl<T extends string>({
  name,
  value,
  onChange,
  options,
  disabled,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className="grid grid-cols-3 gap-2 rounded-2xl border border-hairline bg-ink/60 p-1.5"
    >
      {options.map(({ value: optValue, label, Icon }) => {
        const selected = optValue === value;
        return (
          <button
            key={optValue}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(optValue)}
            className={[
              "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "bg-gradient-to-br from-[#7C3AED]/15 to-[#A855F7]/15 text-white ring-1 ring-accent/30"
                : "text-mute hover:text-white",
            ].join(" ")}
          >
            <Icon className={selected ? "h-4 w-4 text-accent" : "h-4 w-4"} aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export default function GeneratorForm({ onResult }: GeneratorFormProps) {
  const { user, loading: authLoading } = useCurrentUser();
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [tone, setTone] = useState<Tone>("Professional");
  const [loading, setLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [nicheError, setNicheError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="flex w-full max-w-2xl items-center justify-center rounded-2xl border border-hairline bg-panel p-10 shadow-2xl shadow-black/40 sm:p-12">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-mute" aria-hidden />
        <span className="text-sm text-mute">Checking your session…</span>
      </div>
    );
  }

  if (!user) return <SignInToGenerate />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = niche.trim();
    if (!trimmed) {
      setNicheError("Please describe a niche to generate content for.");
      return;
    }
    setNicheError(null);
    setContentError(null);
    setImageError(null);
    setLoading(true);

    const payload = { niche: trimmed, platform, tone };
    const [contentResult, imageResult] = await Promise.allSettled([
      postJson<{ posts: GeneratedPost[] }>("/api/generate-content", payload),
      postJson<{ imageUrl: string }>("/api/generate-image", payload),
    ]);

    const posts = contentResult.status === "fulfilled" ? contentResult.value.posts : null;
    const imageUrl = imageResult.status === "fulfilled" ? imageResult.value.imageUrl : null;
    const cErr = contentResult.status === "rejected" ? contentResult.reason.message : null;
    const iErr = imageResult.status === "rejected" ? imageResult.reason.message : null;

    setContentError(cErr);
    setImageError(iErr);
    setLoading(false);

    onResult({
      niche: trimmed,
      platform,
      tone,
      posts,
      imageUrl,
      contentError: cErr,
      imageError: iErr,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-2xl border border-hairline bg-panel p-6 shadow-2xl shadow-black/40 sm:p-8"
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="niche"
            className="mb-2 block text-sm font-medium text-white"
          >
            Niche
          </label>
          <input
            id="niche"
            type="text"
            value={niche}
            onChange={(e) => {
              setNiche(e.target.value);
              if (nicheError) setNicheError(null);
            }}
            disabled={loading}
            placeholder="e.g. sustainable fashion brand"
            aria-invalid={nicheError ? "true" : "false"}
            aria-describedby={nicheError ? "niche-error" : undefined}
            className={[
              "w-full rounded-xl border bg-ink/60 px-4 py-3 text-base text-white placeholder:text-mute/70 transition",
              "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-60",
              nicheError
                ? "border-red-500/60 focus:ring-red-500/40"
                : "border-hairline focus:border-accent/40",
            ].join(" ")}
          />
          {nicheError && (
            <p id="niche-error" className="mt-2 text-sm text-red-400">
              {nicheError}
            </p>
          )}
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-white">
            Platform
          </span>
          <SegmentedControl
            name="Platform"
            value={platform}
            onChange={setPlatform}
            options={PLATFORM_OPTIONS}
            disabled={loading}
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-white">
            Tone
          </span>
          <SegmentedControl
            name="Tone"
            value={tone}
            onChange={setTone}
            options={TONE_OPTIONS}
            disabled={loading}
          />
        </div>

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
              <span>Generating…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" aria-hidden />
              <span>Generate My Calendar</span>
            </>
          )}
        </button>

        {(contentError || imageError) && (
          <div className="space-y-2">
            {contentError && (
              <ErrorRow label="Content generation" message={contentError} />
            )}
            {imageError && (
              <ErrorRow label="Image generation" message={imageError} />
            )}
          </div>
        )}
      </div>
    </form>
  );
}

function SignInToGenerate() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-hairline bg-panel p-8 text-center shadow-2xl shadow-black/40 sm:p-10">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white shadow-md shadow-[#7C3AED]/30">
        <Lock className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">
        Sign in to generate
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mute">
        Create a free account to generate your first 7-day content calendar — it
        keeps your work tied to your profile.
      </p>
      <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/30 transition hover:brightness-110"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          Create account
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-hairline bg-ink/60 px-5 py-2.5 text-sm font-semibold text-mute transition hover:border-white/20 hover:text-white"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Sign in
        </Link>
      </div>
    </div>
  );
}

function ErrorRow({ label, message }: { label: string; message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
      <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
        !
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-red-200">{label} failed</p>
        <p className="mt-0.5 break-words text-red-300/90">{message}</p>
      </div>
    </div>
  );
}
