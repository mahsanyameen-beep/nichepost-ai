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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Your 7-day calendar
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {niche}
        </h2>
        <p className="text-sm text-mute">
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
      <div className="overflow-hidden rounded-2xl border border-hairline bg-panel shadow-2xl shadow-black/40">
        <div className="relative aspect-square w-full bg-ink">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`Generated cover image for ${niche}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
              <ImageOff className="h-10 w-10 text-mute/60" aria-hidden />
              <p className="text-sm font-medium text-mute">
                {imageError ? "Image couldn't be generated" : "No image yet"}
              </p>
              {imageError && (
                <p className="text-xs text-mute/70">{imageError}</p>
              )}
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="border-t border-hairline p-3">
            <a
              href={imageUrl}
              download={`nichepost-${slugify(niche)}.png`}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-[#7C3AED]/30 transition hover:shadow-lg hover:shadow-[#7C3AED]/40 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
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
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-hairline bg-panel p-8 text-center">
        <Calendar className="h-10 w-10 text-mute/60" aria-hidden />
        <p className="text-sm font-medium text-mute">
          {contentError ? "Posts couldn't be generated" : "No posts yet"}
        </p>
        {contentError && (
          <p className="max-w-md text-xs text-mute/70">{contentError}</p>
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
    <li className="group rounded-2xl border border-hairline bg-panel p-5 shadow-lg shadow-black/30 transition hover:border-white/15 hover:shadow-xl hover:shadow-black/40">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-none flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white shadow-md shadow-[#7C3AED]/30">
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
            Day
          </span>
          <span className="text-base font-bold leading-none">{post.day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-snug text-white">
              {post.title}
            </h3>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`Copy day ${post.day} post`}
              className="flex-none rounded-lg p-1.5 text-mute transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {copied ? (
                <Check className="h-4 w-4 text-accent" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>

          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-mute">
            {post.caption}
          </p>

          {post.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-mute/60" aria-hidden />
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
        </div>
      </div>
    </li>
  );
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "cover"
  );
}
