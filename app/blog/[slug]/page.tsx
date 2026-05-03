interface BlogPostPageProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">Post: {params.slug}</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Dynamic blog post rendered from the slug.
      </p>
    </main>
  );
}
