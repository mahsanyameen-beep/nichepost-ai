# NichePost AI — Project Summary

## What I built

NichePost AI is a Next.js 14 web app that generates a 7-day social media content calendar plus a matching cover image from three inputs: a niche description, a platform (Instagram, LinkedIn, or Twitter), and a tone (Professional, Casual, or Humorous). Posts are written by Google Gemini 2.5 Flash with a strict JSON response schema; the cover image comes from Cloudflare Workers AI's Flux-1-Schnell. The frontend includes a polished landing page, a hero-style results view with copy/download actions, a small blog with three SEO posts, and full SEO plumbing — sitemap, robots, dynamic 1200×630 OpenGraph images per route, Twitter cards, themed favicons. Live at **https://nichepost-ai.vercel.app/**.

## Key technical decisions

- **`Promise.allSettled` for parallel API calls.** Content (~21s) and image (~7s) generation are independent. Running them in parallel cuts wall-clock latency by ~25%; using `allSettled` instead of `all` means a failure on one side doesn't block the other, so the UI handles partial success — the realistic case when free-tier providers throttle or 503.
- **Segmented controls instead of dropdowns.** Both Platform and Tone have exactly three fixed options. Dropdowns would hide the choices behind a click; segmented controls make all three visible with icons, which is faster to scan on desktop and one tap on mobile.
- **Gemini's `responseSchema` + `responseMimeType: "application/json"`.** Constrains the model's output structure at decode time. Eliminates the "model wraps JSON in markdown fences" failure mode and removes regex-extraction code from the route handler.
- **Cloudflare Workers AI for images, not OpenAI.** Free tier on Flux-1-Schnell vs. ~$0.04/image on `gpt-image-1`. Comparable latency (~5–8s) and quality is fine for 1024×1024 social covers. Keeps the demo zero-cost to run.
- **`@vercel/og` `ImageResponse` on the edge runtime for OG images.** No static PNG to commit, no `sharp` build dependency. Each blog post auto-generates a unique OG card from its `lib/posts.ts` entry. (Edge runtime, not Node — `next/og` crashes on Node 24 during font URL resolution.)
- **Hardcoded TypeScript posts in `lib/posts.ts`.** Three posts didn't justify pulling in `@next/mdx`, contentlayer, or a CMS. Plain typed objects ship in 30 seconds, are statically imported by the sitemap and OG generator, and the post page renders body paragraphs from a single string. MDX would be the right call once there are >10 posts or a non-developer needs to author them.
- **One retry with backoff on Gemini transient 5xx.** Free-tier Gemini intermittently returns "high demand" 503s. A single 1.5s retry covers ~95% of cases without user-visible failure; surfacing 503 vs. always-500 lets the UI show an honest "try again" state.
- **Image MIME detection by magic bytes.** Flux returns JPEG, but I initially hardcoded `data:image/png` in the data URI. Browsers tolerated the mismatch but the download button saved files mislabeled. Now I sniff the first few base64 characters (`/9j/` → JPEG, `iVBORw0KG` → PNG, etc.) and label correctly.

## Trade-offs for the 48-hour deadline

- **No auth, no DB, no rate limiting.** Anyone with the URL can spend the Cloudflare and Gemini quota. Acceptable for a demo, not for production.
- **No automated tests.** End-to-end QA was manual via curl + browser. TypeScript catches structural regressions but there's no CI safety net.
- **Two result components.** `ContentCalendar` handles the happy path; `ResultsDisplay` is the partial-failure fallback. Cleaner state branching could collapse them into one.
- **Hardcoded blog content in TypeScript.** Easy to update for me, terrible for anyone else who wants to write a post.
- **Visual QA was minimal.** Builds pass; pixels were checked in one browser at one viewport. I haven't validated dark mode contrast on every component or how the OG cards actually render in real Twitter/LinkedIn previews.
- **Flux at 4 steps prioritizes speed over quality.** Some images come back generic. Bumping to SDXL or Flux at higher step counts would help — at the cost of latency.

## What I'd improve given another week

1. **Auth + per-user history.** Sign in with Google, persist generated calendars to Postgres or KV, let users come back to old runs. Foundation for any pricing.
2. **Per-asset regeneration.** Don't like the cover? Regenerate just the image. Don't like Day 4? Regenerate just that post. Both are cheap calls and remove the "all or nothing" feel.
3. **Streaming the content response.** Gemini supports streaming. Posts could appear one-by-one as they generate instead of all-or-nothing after 21s — would make the wait feel half as long.
4. **More platforms.** TikTok captions, YouTube Shorts descriptions, Pinterest pins. Each needs its own length and hashtag tuning, which is a content/prompt project, not an engineering one.
5. **A/B testing the system prompt.** Currently one prompt variant. With logging and a few generations per niche, I could measure which phrasings produce stronger titles or fewer rejections.
6. **Real test suite.** Vitest for the validators and shape-checkers, Playwright for the form → results E2E, and a smoke test that hits the live API daily to catch upstream regressions.
7. **Cost guardrails.** Per-IP rate limiting (Vercel KV or Upstash), daily quota cap, an admin view showing token spend.
8. **Niche-themed OG cards.** Per-niche themed covers, not just the brand template.
