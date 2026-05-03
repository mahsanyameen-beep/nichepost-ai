export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  body: string;
}

export const POSTS: Post[] = [
  {
    slug: "why-niche-specific-content-beats-templates",
    title: "Why niche-specific content beats generic templates",
    description:
      "Templates make every brand sound the same. Niche-tuned prompts give the model the constraints it needs to write copy your audience actually recognizes.",
    date: "2026-04-12",
    readingMinutes: 4,
    body: `Most "AI content" tools fail in the same way: they ship a template, swap a few keywords, and call it personalization. The output is recognizable from a mile away — the same three-paragraph structure, the same "Did you know?" opener, the same emoji cadence.

The fix isn't a better template. It's giving the model enough information to make real choices.

A niche is more than a keyword. It's the audience's vocabulary, the specific problems they'd nod at, the references that mark you as an insider versus an outsider. "Sustainable fashion brand" produces generic copy; "secondhand designer resale for women 28-45 in walkable East Coast cities" produces copy that lands.

Tighten your niche and the model has somewhere specific to go. Leave it loose and it falls back on its training-data center of mass — which is exactly the soup of generic content you were trying to escape.`,
  },
  {
    slug: "platform-native-lengths",
    title: "Platform-native lengths: when to write short vs long",
    description:
      "Twitter rewards punch, LinkedIn rewards depth, Instagram rewards story. Picking the wrong format is a bigger drag on engagement than picking the wrong topic.",
    date: "2026-04-22",
    readingMinutes: 5,
    body: `Length is a format decision, not a writing decision. Each platform has a native shape that its audience is calibrated to.

Twitter is a punch — single thought, sharp angle, no preamble. The right length is "as short as possible while still landing." A 240-character post that feels complete will out-perform a 280-character post that feels stuffed.

LinkedIn rewards substance. The audience has self-selected for depth: they're scrolling past lifestyle content and looking for things to think about. A 220-word post with a real argument beats a 60-word "thought leadership" platitude every time.

Instagram is story-shaped. Hook, narrative beats, payoff, call to action. The visual carries half the weight, so the caption gets to be conversational and meandering in a way the others don't.

Get this part wrong and the content reads as foreign no matter how good the writing is. NichePost AI calibrates length per platform — you don't have to think about it.`,
  },
  {
    slug: "consistent-voice-across-a-week",
    title: "Building a consistent voice across a 7-day calendar",
    description:
      "Voice consistency is what makes a feed feel like a brand instead of a collection of posts. Here's how to lock it in across a week of content.",
    date: "2026-05-01",
    readingMinutes: 4,
    body: `A feed feels like a brand when its voice is consistent. Same vocabulary, same cadence, same level of formality from one post to the next.

The mistake most people make is generating posts one at a time over the week — different mood, different prompt, different model run. The result is whiplash: Monday is wry, Tuesday is corporate, Wednesday is suddenly using emoji.

Generating a full week in one pass solves this. The model sees all seven posts together, holds the tone steady across them, and varies angle (educational, story, contrarian, list, question) without breaking voice.

It also forces you to make the tone decision once. "Professional" stays professional all week. "Humorous" doesn't drift into earnest. The single-decision constraint is what makes the calendar feel coherent rather than assembled.`,
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllPostSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
