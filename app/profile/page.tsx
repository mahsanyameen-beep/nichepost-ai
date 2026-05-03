"use client";

import { Loader2, LogOut, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import AuthField from "../components/AuthField";
import { validateBio, validateName } from "@/lib/validation";

interface PublicUser {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

interface FieldErrors {
  name?: string;
  bio?: string;
}

const COLOR_CHOICES = [
  "#7C3AED",
  "#A855F7",
  "#FFA34D",
  "#22D3EE",
  "#34D399",
  "#F472B6",
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarColor, setAvatarColor] = useState("#7C3AED");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.user) {
          setServerError(
            typeof data?.error === "string" ? data.error : "Failed to load profile.",
          );
          return;
        }
        const u = data.user as PublicUser;
        setUser(u);
        setName(u.name);
        setBio(u.bio);
        setAvatarColor(u.avatarColor);
      } catch {
        if (!cancelled) setServerError("Network error. Try again.");
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const nameErr = validateName(name);
    if (nameErr) next.name = nameErr;
    const bioErr = validateBio(bio);
    if (bioErr) next.bio = bioErr;
    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setSuccess(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), avatarColor }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(typeof data?.error === "string" ? data.error : "Save failed.");
        return;
      }
      setUser(data.user);
      setSuccess("Profile updated.");
    } catch {
      setServerError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-ink text-white">
      <header className="relative border-b border-hairline bg-ink/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2" aria-label="NichePost AI home">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white shadow-md shadow-[#7C3AED]/30">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-white">
              NichePost AI
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-ink/60 px-3.5 py-1.5 text-sm font-medium text-mute transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <LogOut className="h-3.5 w-3.5" aria-hidden />
            )}
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="relative flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Account
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
              Your profile
            </h1>
            <p className="mt-3 text-base leading-relaxed text-mute">
              Update how your account shows up across NichePost AI.
            </p>
          </div>

          <div className="rounded-2xl border border-hairline bg-panel/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
            {loadingUser ? (
              <div className="flex items-center justify-center py-16 text-mute">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                Loading profile…
              </div>
            ) : user ? (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="inline-flex h-16 w-16 flex-none items-center justify-center rounded-2xl text-2xl font-semibold text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${avatarColor}, #A855F7)`,
                      boxShadow: `0 8px 24px ${avatarColor}40`,
                    }}
                  >
                    {(name || user.name || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-white">
                      {name || user.name}
                    </p>
                    <p className="truncate text-sm text-mute">{user.email}</p>
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-sm font-medium text-white">
                    Avatar color
                  </span>
                  <div
                    role="radiogroup"
                    aria-label="Avatar color"
                    className="flex flex-wrap gap-2"
                  >
                    {COLOR_CHOICES.map((c) => {
                      const selected = c.toLowerCase() === avatarColor.toLowerCase();
                      return (
                        <button
                          type="button"
                          key={c}
                          role="radio"
                          aria-checked={selected}
                          aria-label={`Select ${c}`}
                          onClick={() => setAvatarColor(c)}
                          className={[
                            "h-9 w-9 rounded-xl ring-offset-2 ring-offset-panel transition",
                            selected
                              ? "ring-2 ring-accent"
                              : "ring-1 ring-hairline hover:ring-white/30",
                          ].join(" ")}
                          style={{ background: c }}
                        />
                      );
                    })}
                  </div>
                </div>

                <AuthField
                  id="name"
                  label="Display name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  disabled={saving}
                  error={errors.name}
                />

                <div>
                  <label htmlFor="bio" className="mb-2 block text-sm font-medium text-white">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      if (errors.bio) setErrors((p) => ({ ...p, bio: undefined }));
                    }}
                    disabled={saving}
                    rows={4}
                    maxLength={280}
                    placeholder="Tell us about your niche and audience."
                    aria-invalid={errors.bio ? "true" : "false"}
                    aria-describedby={errors.bio ? "bio-error" : "bio-hint"}
                    className={[
                      "w-full resize-none rounded-xl border bg-ink/60 px-4 py-3 text-base text-white placeholder:text-mute/70 transition",
                      "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-0",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      errors.bio
                        ? "border-red-500/60 focus:ring-red-500/40"
                        : "border-hairline focus:border-accent/40",
                    ].join(" ")}
                  />
                  {errors.bio ? (
                    <p id="bio-error" className="mt-2 text-sm text-red-400">
                      {errors.bio}
                    </p>
                  ) : (
                    <p id="bio-hint" className="mt-2 text-xs text-mute">
                      {bio.length}/280
                    </p>
                  )}
                </div>

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

                {success && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
                      ✓
                    </span>
                    <p className="text-emerald-200">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className={[
                    "group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#7C3AED]/30 transition",
                    "bg-gradient-to-br from-[#7C3AED] to-[#A855F7]",
                    "hover:shadow-xl hover:shadow-[#7C3AED]/40 hover:brightness-110",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel",
                    "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100",
                  ].join(" ")}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" aria-hidden />
                      <span>Save changes</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-10 text-center text-sm text-mute">
                {serverError ?? "Profile not available."}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
