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
          background: "#0A0A1F",
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
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            display: "flex",
          }}
        />

        {/* Warm amber glow — bottom-left signature */}
        <div
          style={{
            position: "absolute",
            bottom: "-220px",
            left: "-180px",
            width: "780px",
            height: "780px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,163,77,0.40) 0%, rgba(255,163,77,0.15) 40%, transparent 75%)",
            display: "flex",
          }}
        />

        {/* Pink-coral counter-glow */}
        <div
          style={{
            position: "absolute",
            top: "-180px",
            right: "-160px",
            width: "620px",
            height: "620px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,107,157,0.30) 0%, rgba(255,107,157,0.10) 45%, transparent 75%)",
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
              background: "linear-gradient(135deg, #FF6B9D 0%, #FF9472 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(255,107,157,0.40)",
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
              color: "#FFFFFF",
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
              color: "#FF7A95",
              display: "flex",
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
              color: "#FFFFFF",
              maxWidth: "1000px",
            }}
          >
            <span>A week of social posts in</span>
            <span style={{ color: "#FF7A95" }}>30 seconds.</span>
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#A0A0B8",
              lineHeight: 1.4,
              maxWidth: "920px",
              display: "flex",
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
