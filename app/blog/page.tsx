import type { Metadata } from "next";
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <header className="mb-12 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
          Blog
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
          Writing about writing.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400">
          Short pieces on what makes AI-generated content actually work — and what
          makes it slop.
        </p>
      </header>

      <ul className="divide-y divide-stone-200 border-y border-stone-200 dark:divide-stone-800 dark:border-stone-800">
        {sorted.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 py-6 transition-colors sm:flex-row sm:items-baseline sm:gap-6"
            >
              <time
                dateTime={post.date}
                className="flex-none font-mono text-xs uppercase tracking-wider text-stone-500 sm:w-28 dark:text-stone-500"
              >
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <div className="flex-1">
                <h2 className="text-lg font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-teal-700 dark:text-stone-100 dark:group-hover:text-teal-400">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {post.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
