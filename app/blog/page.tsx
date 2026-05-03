import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { POSTS } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on niche-specific content, platform-native writing, and building a consistent voice with AI.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog",
    description:
      "Notes on niche-specific content, platform-native writing, and building a consistent voice with AI.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndex() {
  const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  const [feature, ...rest] = sorted;

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <header className="mb-12 max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Blog
        </p>
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Writing about <span className="text-accent">writing</span>.
        </h1>
        <p className="text-base leading-relaxed text-mute">
          Short pieces on what makes AI-generated content actually work — and
          what makes it slop.
        </p>
      </header>

      {/* Featured (most recent) — full-width hero card */}
      <FeaturedCard post={feature} />

      {/* Grid of remaining posts */}
      {rest.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}

function FeaturedCard({ post }: { post: (typeof POSTS)[number] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-hairline bg-panel transition hover:border-white/15 hover:shadow-2xl hover:shadow-black/40"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-auto lg:h-full">
          <Image
            src={post.image}
            alt={`Cover image for ${post.title}`}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            priority
            className="recolor-cover object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/30 via-transparent to-transparent" />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Featured
          </span>
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-white transition group-hover:text-accent sm:text-3xl">
            {post.title}
          </h2>
          <p className="text-sm leading-relaxed text-mute sm:text-base">
            {post.description}
          </p>
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: (typeof POSTS)[number] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-panel transition hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={post.image}
          alt={`Cover image for ${post.title}`}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="recolor-cover object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-white transition group-hover:text-accent">
          {post.title}
        </h2>
        <p className="flex-1 text-sm leading-relaxed text-mute">
          {post.description}
        </p>
        <PostMeta post={post} compact />
      </div>
    </Link>
  );
}

function PostMeta({
  post,
  compact = false,
}: {
  post: (typeof POSTS)[number];
  compact?: boolean;
}) {
  const formatted = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <div
      className={`flex items-center gap-3 text-xs text-mute/80 ${compact ? "pt-1" : "pt-2"}`}
    >
      <time dateTime={post.date} className="font-mono uppercase tracking-wider">
        {formatted}
      </time>
      <span aria-hidden className="h-1 w-1 rounded-full bg-mute/40" />
      <span>{post.readingMinutes} min read</span>
    </div>
  );
}
