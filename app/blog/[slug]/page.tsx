import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getAllPostSlugs, getPostBySlug } from "@/lib/posts";

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };

  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      // OG image auto-derives from app/blog/[slug]/opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <Link
        href="/blog"
        className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
      >
        ← All posts
      </Link>

      <article className="mt-8 space-y-6">
        <header className="space-y-4 border-b border-stone-200 pb-8 dark:border-stone-800">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
            {formattedDate} · {post.readingMinutes} min read
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl dark:text-stone-50">
            {post.title}
          </h1>
          <p className="text-pretty text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            {post.description}
          </p>
        </header>

        <div className="space-y-5 text-base leading-relaxed text-stone-700 dark:text-stone-300">
          {post.body
            .trim()
            .split(/\n\n+/)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>

        <footer className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
          <Link
            href="/#generate"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            Try the generator →
          </Link>
        </footer>
      </article>

      <RelatedPosts currentSlug={post.slug} />
    </main>
  );
}

function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const others = POSTS.filter((p) => p.slug !== currentSlug).slice(0, 2);
  if (others.length === 0) return null;

  return (
    <section className="mt-16 border-t border-stone-200 pt-10 dark:border-stone-800">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-500">
        Keep reading
      </h2>
      <ul className="mt-5 space-y-4">
        {others.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block rounded-xl border border-stone-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700"
            >
              <h3 className="text-base font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-teal-700 dark:text-stone-100 dark:group-hover:text-teal-400">
                {p.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {p.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
