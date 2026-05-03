import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = `${SITE_NAME} — A week of social posts in 30 seconds`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)",
          padding: "80px",
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
              "linear-gradient(to right, rgba(120,113,108,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.6,
          }}
        />

        {/* Soft teal glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(13,148,136,0.18) 0%, rgba(16,185,129,0.10) 30%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0d9488 0%, #047857 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(13,148,136,0.30)",
            }}
          >
            <svg
              width="28"
              height="28"
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
              fontSize: "32px",
              fontWeight: 600,
              color: "#1c1917",
              letterSpacing: "-0.02em",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#0f766e",
            }}
          >
            AI-Powered Content Calendars
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              fontSize: "76px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#1c1917",
              maxWidth: "1000px",
            }}
          >
            <span>A week of social posts</span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, #0f766e 0%, #047857 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              in 30 seconds.
            </span>
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#57534e",
              lineHeight: 1.4,
              maxWidth: "920px",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
