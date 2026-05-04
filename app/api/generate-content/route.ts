import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

type Platform = "Instagram" | "LinkedIn" | "Twitter";
type Tone = "Professional" | "Casual" | "Humorous";

const PLATFORMS: Platform[] = ["Instagram", "LinkedIn", "Twitter"];
const TONES: Tone[] = ["Professional", "Casual", "Humorous"];

interface GenerateRequest {
  niche: string;
  platform: Platform;
  tone: Tone;
}

interface PostShape {
  day: number;
  title: string;
  caption: string;
  hashtags: string[];
}

interface GeneratedPlan {
  posts: PostShape[];
}

const PLATFORM_GUIDE: Record<
  Platform,
  { length: string; hashtagCount: string; styleNotes: string }
> = {
  Twitter: {
    length: "Short — caption strictly under 280 characters total (including hashtags).",
    hashtagCount: "Exactly 2-3 hashtags.",
    styleNotes:
      "Punchy, scannable, hook-first. No filler. Use line breaks sparingly.",
  },
  Instagram: {
    length:
      "Medium — caption between 100 and 220 words. Lead with a strong hook line, then 2-3 short paragraphs, end with a question or CTA.",
    hashtagCount: "Exactly 8-10 hashtags, mixing broad and niche tags.",
    styleNotes:
      "Conversational, visual, story-driven. Emoji are allowed but optional and sparing.",
  },
  LinkedIn: {
    length:
      "Longer — caption between 180 and 320 words. Hook line, then 3-5 short paragraphs of insight, end with a reflective question or CTA.",
    hashtagCount: "Exactly 3-5 hashtags, professional and topical.",
    styleNotes:
      "Authoritative, insight-driven, first-person where appropriate. No emoji unless the tone is Casual or Humorous.",
  },
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          caption: { type: Type.STRING },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["day", "title", "caption", "hashtags"],
        propertyOrdering: ["day", "title", "caption", "hashtags"],
      },
    },
  },
  required: ["posts"],
};

function validate(body: unknown): GenerateRequest | string {
  if (!body || typeof body !== "object") return "Request body must be a JSON object.";
  const { niche, platform, tone } = body as Record<string, unknown>;

  if (typeof niche !== "string" || niche.trim().length === 0) {
    return "`niche` is required and must be a non-empty string.";
  }
  if (niche.length > 200) {
    return "`niche` must be 200 characters or fewer.";
  }
  if (typeof platform !== "string" || !PLATFORMS.includes(platform as Platform)) {
    return `\`platform\` must be one of: ${PLATFORMS.join(", ")}.`;
  }
  if (typeof tone !== "string" || !TONES.includes(tone as Tone)) {
    return `\`tone\` must be one of: ${TONES.join(", ")}.`;
  }

  return { niche: niche.trim(), platform: platform as Platform, tone: tone as Tone };
}

function buildPrompt({ niche, platform, tone }: GenerateRequest): string {
  const guide = PLATFORM_GUIDE[platform];
  return `You are a senior social media strategist generating a 7-day content plan.

NICHE: ${niche}
PLATFORM: ${platform}
TONE: ${tone}

PLATFORM REQUIREMENTS:
- Length: ${guide.length}
- Hashtags: ${guide.hashtagCount}
- Style: ${guide.styleNotes}

CONTENT REQUIREMENTS:
- Generate exactly 7 posts, one per day (day 1 through day 7).
- Each post must feel distinct: vary the angle (educational, story, contrarian take, behind-the-scenes, list, question, case study, etc.).
- Titles must be specific and clickable, not generic.
- Captions must be ready to publish — no placeholders, no "[insert X]" tokens.
- Hashtags must each begin with "#", contain no spaces, and be relevant to both the niche and the platform.
- Match the requested ${tone} tone consistently across all 7 posts.
- The "posts" array must contain exactly 7 entries with day values 1 through 7 in order.`;
}

function isValidPlan(value: unknown): value is GeneratedPlan {
  if (!value || typeof value !== "object") return false;
  const posts = (value as { posts?: unknown }).posts;
  if (!Array.isArray(posts) || posts.length !== 7) return false;
  return posts.every(
    (p, i) =>
      p &&
      typeof p === "object" &&
      (p as PostShape).day === i + 1 &&
      typeof (p as PostShape).title === "string" &&
      typeof (p as PostShape).caption === "string" &&
      Array.isArray((p as PostShape).hashtags) &&
      (p as PostShape).hashtags.every((h) => typeof h === "string"),
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY." },
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

  const ai = new GoogleGenAI({ apiKey });

  const callGemini = () =>
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt(validated),
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

  const isTransient = (msg: string) =>
    /\b(503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand)\b/i.test(msg);

  let rawText: string;
  try {
    let response;
    try {
      response = await callGemini();
    } catch (firstError) {
      const msg = firstError instanceof Error ? firstError.message : "";
      if (!isTransient(msg)) throw firstError;
      await new Promise((r) => setTimeout(r, 1500));
      response = await callGemini();
    }
    if (!response.text) {
      return NextResponse.json(
        { error: "Model returned no text content." },
        { status: 500 },
      );
    }
    rawText = response.text;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = isTransient(message) ? 503 : 500;
    return NextResponse.json(
      { error: `Gemini API error: ${message}` },
      { status },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      {
        error: "Model response was not valid JSON.",
        raw: rawText.slice(0, 1000),
      },
      { status: 500 },
    );
  }

  if (!isValidPlan(parsed)) {
    return NextResponse.json(
      {
        error:
          "Model JSON did not match the required shape (7 posts, day 1-7, title/caption/hashtags).",
        raw: parsed,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(parsed);
}
