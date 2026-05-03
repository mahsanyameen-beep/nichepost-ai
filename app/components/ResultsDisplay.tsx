"use client";

import { Calendar, Check, Copy, Download, Hash, ImageOff } from "lucide-react";
import { useState } from "react";
import type { GeneratorResult } from "./GeneratorForm";

interface ResultsDisplayProps {
  result: GeneratorResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { niche, platform, tone, posts, imageUrl, imageError, contentError } = result;

  return (
    <section className="w-full max-w-5xl space-y-8">
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          Your 7-day calendar
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
          {niche}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {platform} · {tone}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <ImagePanel imageUrl={imageUrl} imageError={imageError} niche={niche} />
        <PostsPanel posts={posts} contentError={contentError} />
      </div>
    </section>
  );
}

function ImagePanel({
  imageUrl,
  imageError,
  niche,
}: {
  imageUrl: string | null;
  imageError: string | null;
  niche: string;
}) {
  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/40 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/40">
        <div className="relative aspect-square w-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`Generated cover image for ${niche}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
              <ImageOff
                className="h-10 w-10 text-neutral-400 dark:text-neutral-500"
                aria-hidden
              />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {imageError ? "Image couldn't be generated" : "No image yet"}
              </p>
              {imageError && (
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {imageError}
                </p>
              )}
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
            <a
              href={imageUrl}
              download={`nichepost-${slugify(niche)}.png`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download cover
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function PostsPanel({
  posts,
  contentError,
}: {
  posts: GeneratorResult["posts"];
  contentError: string | null;
}) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-950">
        <Calendar
          className="h-10 w-10 text-neutral-400 dark:text-neutral-500"
          aria-hidden
        />
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {contentError ? "Posts couldn't be generated" : "No posts yet"}
        </p>
        {contentError && (
          <p className="max-w-md text-xs text-neutral-500 dark:text-neutral-500">
            {contentError}
          </p>
        )}
      </div>
    );
  }

  return (
    <ol className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.day} post={post} />
      ))}
    </ol>
  );
}

function PostCard({ post }: { post: NonNullable<GeneratorResult["posts"]>[number] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `${post.title}\n\n${post.caption}\n\n${post.hashtags.join(" ")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail in non-secure contexts; silent fail is fine here.
    }
  }

  return (
    <li className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:shadow-black/40">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-none flex-col items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20">
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
            Day
          </span>
          <span className="text-base font-bold leading-none">{post.day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-snug text-neutral-900 dark:text-white">
              {post.title}
            </h3>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`Copy day ${post.day} post`}
              className="flex-none rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>

          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {post.caption}
          </p>

          {post.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Hash
                className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                aria-hidden
              />
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
        </div>
      </div>
    </li>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "cover";
}
