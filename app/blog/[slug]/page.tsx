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
        className="text-sm font-medium text-mute transition hover:text-white"
      >
        ← All posts
      </Link>

      <article className="mt-8 space-y-6">
        <header className="space-y-4 border-b border-hairline pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {formattedDate} · {post.readingMinutes} min read
          </p>
          <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="text-pretty text-lg leading-relaxed text-mute">
            {post.description}
          </p>
        </header>

        <div className="space-y-5 text-base leading-relaxed text-mute">
          {post.body
            .trim()
            .split(/\n\n+/)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>

        <footer className="mt-12 border-t border-hairline pt-8">
          <Link
            href="/#generate"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#FF9472] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6B9D]/30 transition hover:shadow-xl hover:shadow-[#FF6B9D]/40 hover:brightness-110"
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
    <section className="mt-16 border-t border-hairline pt-10">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-mute">
        Keep reading
      </h2>
      <ul className="mt-5 space-y-4">
        {others.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block rounded-xl border border-hairline bg-panel p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:shadow-lg hover:shadow-black/40"
            >
              <h3 className="text-base font-semibold tracking-tight text-white transition group-hover:text-accent">
                {p.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-mute">
                {p.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
