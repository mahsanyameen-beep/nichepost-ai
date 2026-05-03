import type { Metadata } from "next";
import Image from "next/image";
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
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: `Cover image for ${post.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
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

      <article className="mt-8 space-y-8">
        <header className="space-y-4">
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

        {/* Cover image — full-bleed within article width */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-hairline bg-panel shadow-2xl shadow-black/40">
          <Image
            src={post.image}
            alt={`Cover image for ${post.title}`}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </div>

        <div className="space-y-5 border-t border-hairline pt-8 text-base leading-relaxed text-mute">
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
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/30 transition hover:shadow-xl hover:shadow-[#7C3AED]/40 hover:brightness-110"
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
      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {others.map((p) => {
          const formatted = new Date(p.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-panel transition hover:-translate-y-0.5 hover:border-white/15 hover:shadow-lg hover:shadow-black/40"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={p.image}
                    alt={`Cover image for ${p.title}`}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-base font-semibold leading-snug tracking-tight text-white transition group-hover:text-accent">
                    {p.title}
                  </h3>
                  <time
                    dateTime={p.date}
                    className="font-mono text-xs uppercase tracking-wider text-mute/80"
                  >
                    {formatted}
                  </time>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
