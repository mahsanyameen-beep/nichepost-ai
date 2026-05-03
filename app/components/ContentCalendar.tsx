"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";

export interface Post {
  day: number;
  title: string;
  caption: string;
  hashtags: string[];
}

interface ContentCalendarProps {
  posts: Post[];
  coverImage: string;
  niche: string;
}

function formatHashtags(tags: string[]): string {
  return tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
}

function formatPostForCopy(post: Post): string {
  return `${post.caption}\n${formatHashtags(post.hashtags)}`;
}

function formatCalendarForCopy(niche: string, posts: Post[]): string {
  const header = `7-Day Content Calendar — ${niche}\n${"=".repeat(40)}\n`;
  const body = posts
    .map(
      (post) =>
        `Day ${post.day}: ${post.title}\n\n${post.caption}\n\n${formatHashtags(post.hashtags)}`,
    )
    .join("\n\n" + "—".repeat(40) + "\n\n");
  return `${header}\n${body}\n`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "calendar"
  );
}

function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function extensionForDataUri(dataUri: string): string {
  const mime = dataUri.match(/^data:([^;]+)/)?.[1] ?? "";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "img";
}

function downloadDataUri(filename: string, dataUri: string) {
  const a = document.createElement("a");
  a.href = dataUri;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ContentCalendar({
  posts,
  coverImage,
  niche,
}: ContentCalendarProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [imageDownloaded, setImageDownloaded] = useState(false);

  function handleDownloadAll() {
    const filename = `nichepost-${slugify(niche)}.txt`;
    downloadTextFile(filename, formatCalendarForCopy(niche, posts));
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  function handleDownloadImage() {
    const ext = extensionForDataUri(coverImage);
    downloadDataUri(`nichepost-${slugify(niche)}-cover.${ext}`, coverImage);
    setImageDownloaded(true);
    setTimeout(() => setImageDownloaded(false), 2000);
  }

  return (
    <section className="w-full max-w-6xl space-y-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-hairline shadow-2xl shadow-black/50"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.05), 0 30px 80px -20px rgba(107,91,209,0.30), 0 20px 50px -20px rgba(255,107,157,0.20)",
        }}
      >
        <div className="relative aspect-[16/7] w-full bg-panel sm:aspect-[16/6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={`Cover image for ${niche} content calendar`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8 lg:p-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                7-Day Content Calendar
              </p>
              <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                {niche}
              </h2>
            </div>
            <div className="flex flex-col gap-2 self-start sm:flex-row sm:items-center sm:self-auto">
              <button
                type="button"
                onClick={handleDownloadImage}
                className="inline-flex flex-none items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
              >
                {imageDownloaded ? (
                  <Check className="h-4 w-4 text-emerald-300" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                {imageDownloaded ? "Saved!" : "Download cover"}
              </button>
              <button
                type="button"
                onClick={handleDownloadAll}
                className="inline-flex flex-none items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white/95 px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-lg backdrop-blur transition-all hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
              >
                {downloaded ? (
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                {downloaded ? "Downloaded!" : "Download All"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.day} post={post} />
        ))}
      </div>
    </section>
  );
}

function PostCard({ post }: { post: Post }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(formatPostForCopy(post));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-hairline bg-panel p-5 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-black/40">
      <header className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#FF9472] text-white shadow-md shadow-[#FF6B9D]/30">
          <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">
            Day
          </span>
          <span className="text-sm font-bold leading-none">{post.day}</span>
        </div>
        <CopyButton copied={copied} onClick={handleCopy} />
      </header>

      <h3 className="mt-4 text-base font-semibold leading-snug text-white">
        {post.title}
      </h3>

      <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-mute">
        {post.caption}
      </p>

      {post.hashtags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-hairline pt-4">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-mute"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={copied ? "Copied to clipboard" : "Copy post"}
        className="rounded-lg p-1.5 text-mute transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {copied ? (
          <Check className="h-4 w-4 text-accent" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
      </button>
      <span
        role="status"
        aria-live="polite"
        className={[
          "pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white shadow-md ring-1 ring-hairline transition",
          "before:absolute before:left-1/2 before:top-full before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-ink before:content-['']",
          copied ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        ].join(" ")}
      >
        Copied!
      </span>
    </div>
  );
}
