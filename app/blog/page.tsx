import Link from "next/link";

export default function BlogIndex() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Posts will appear here. Try{" "}
        <Link href="/blog/hello-world" className="underline">
          /blog/hello-world
        </Link>
        .
      </p>
    </main>
  );
}
