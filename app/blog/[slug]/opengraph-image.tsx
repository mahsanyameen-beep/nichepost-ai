import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

interface ImageProps {
  params: { slug: string };
}

export function generateImageMetadata({ params }: ImageProps) {
  const post = getPostBySlug(params.slug);
  return [
    {
      contentType,
      size,
      id: "default",
      alt: post ? post.title : `${SITE_NAME} blog post`,
    },
  ];
}

export default function Image({ params }: ImageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)",
          padding: "72px",
          position: "relative",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(120,113,108,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.07) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Header: logo + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "11px",
              background: "linear-gradient(135deg, #0d9488 0%, #047857 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(13,148,136,0.25)",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#1c1917",
              letterSpacing: "-0.01em",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: "16px",
              fontWeight: 500,
              color: "#78716c",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Blog
          </div>
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#0f766e",
            marginBottom: "20px",
            position: "relative",
          }}
        >
          {formattedDate} · {post.readingMinutes} min read
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "62px",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: "#1c1917",
            maxWidth: "1040px",
            marginBottom: "24px",
            display: "flex",
            position: "relative",
          }}
        >
          {post.title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "24px",
            color: "#57534e",
            lineHeight: 1.4,
            maxWidth: "980px",
            display: "flex",
            position: "relative",
          }}
        >
          {post.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
