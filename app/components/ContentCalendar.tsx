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

export default function ContentCalendar({
  posts,
  coverImage,
  niche,
}: ContentCalendarProps) {
  const [allCopied, setAllCopied] = useState(false);

  async function handleCopyAll() {
    const ok = await copyToClipboard(formatCalendarForCopy(niche, posts));
    if (ok) {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    }
  }

  return (
    <section className="w-full max-w-6xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-200/50 dark:border-neutral-800 dark:shadow-black/40">
        <div className="relative aspect-[16/7] w-full bg-neutral-200 dark:bg-neutral-900 sm:aspect-[16/6]">
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
            <button
              type="button"
              onClick={handleCopyAll}
              className="group relative inline-flex flex-none items-center justify-center gap-2 self-start rounded-xl bg-white/95 px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-lg backdrop-blur transition-all hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 sm:self-auto"
            >
              {allCopied ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              {allCopied ? "Copied!" : "Download All"}
            </button>
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
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 dark:hover:shadow-black/40">
      <header className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25">
          <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">
            Day
          </span>
          <span className="text-sm font-bold leading-none">{post.day}</span>
        </div>
        <CopyButton copied={copied} onClick={handleCopy} />
      </header>

      <h3 className="mt-4 text-base font-semibold leading-snug text-neutral-900 dark:text-white">
        {post.title}
      </h3>

      <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        {post.caption}
      </p>

      {post.hashtags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-neutral-100 pt-4 dark:border-neutral-800/70">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
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
        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
      </button>
      <span
        role="status"
        aria-live="polite"
        className={[
          "pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white shadow-md transition-all",
          "before:absolute before:left-1/2 before:top-full before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-neutral-900 before:content-['']",
          copied ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        ].join(" ")}
      >
        Copied!
      </span>
    </div>
  );
}
