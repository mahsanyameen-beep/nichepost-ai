import { NextResponse } from "next/server";
import { userIdFromCookieHeader } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "@cf/black-forest-labs/flux-1-schnell";

interface GenerateImageRequest {
  niche: string;
  platform: string;
  tone: string;
}

function validate(body: unknown): GenerateImageRequest | string {
  if (!body || typeof body !== "object") return "Request body must be a JSON object.";
  const { niche, platform, tone } = body as Record<string, unknown>;
  if (typeof niche !== "string" || niche.trim().length === 0) {
    return "`niche` is required and must be a non-empty string.";
  }
  if (typeof platform !== "string" || platform.trim().length === 0) {
    return "`platform` is required and must be a non-empty string.";
  }
  if (typeof tone !== "string" || tone.trim().length === 0) {
    return "`tone` is required and must be a non-empty string.";
  }
  return {
    niche: niche.trim(),
    platform: platform.trim(),
    tone: tone.trim(),
  };
}

function buildPrompt({ niche, platform, tone }: GenerateImageRequest): string {
  return `Clean modern social media cover image for a ${platform} post about "${niche}", ${tone.toLowerCase()} mood. Contemporary editorial illustration or minimalist photographic composition with a strong central focal point representing the essence of ${niche}. Balanced 1:1 square composition, intentional negative space, restrained 3-5 color palette matching a ${tone.toLowerCase()} feel, soft even lighting, subtle depth, modern textures, professional polish. NO text, NO words, NO letters, NO numbers, NO captions, NO watermarks, NO logos, NO typography of any kind. Pure visual imagery only.`;
}

interface CloudflareImageResponse {
  result?: { image?: string };
  success?: boolean;
  errors?: Array<{ code?: number; message?: string }>;
  messages?: unknown;
}

function detectImageMime(base64: string): string {
  // Magic-byte sniffing via the first few base64 chars (no need to decode).
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw0KG")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/png";
}

export async function POST(request: Request) {
  const userId = userIdFromCookieHeader(request.headers.get("cookie"));
  if (!userId) {
    return NextResponse.json(
      { error: "You must be signed in to generate images." },
      { status: 401 },
    );
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return NextResponse.json(
      {
        error:
          "Server is missing CLOUDFLARE_ACCOUNT_ID and/or CLOUDFLARE_API_TOKEN.",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const validated = validate(body);
  if (typeof validated === "string") {
    return NextResponse.json({ error: validated }, { status: 400 });
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: buildPrompt(validated),
        steps: 4,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return NextResponse.json(
      { error: `Failed to reach Cloudflare: ${message}` },
      { status: 502 },
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      if (contentType.includes("application/json")) {
        const errBody = (await response.json()) as CloudflareImageResponse;
        const msg = errBody.errors?.[0]?.message;
        if (msg) detail = msg;
      } else {
        detail = (await response.text()).slice(0, 200) || detail;
      }
    } catch {
      // fall through with HTTP status only
    }
    return NextResponse.json(
      { error: `Cloudflare Workers AI error: ${detail}` },
      { status: response.status },
    );
  }

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as CloudflareImageResponse;
    const base64 = data.result?.image;
    if (!base64) {
      return NextResponse.json(
        { error: "Cloudflare response did not include image data." },
        { status: 500 },
      );
    }
    return NextResponse.json({
      imageUrl: `data:${detectImageMime(base64)};base64,${base64}`,
    });
  }

  if (contentType.startsWith("image/")) {
    const buffer = Buffer.from(await response.arrayBuffer());
    const mime = contentType.split(";")[0];
    return NextResponse.json({
      imageUrl: `data:${mime};base64,${buffer.toString("base64")}`,
    });
  }

  return NextResponse.json(
    { error: `Unexpected response type from Cloudflare: ${contentType}` },
    { status: 500 },
  );
}
