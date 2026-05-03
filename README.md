# NichePost AI

A Next.js 14 starter for generating niche blog content and accompanying images
with the Anthropic and OpenAI APIs.

## Features

- App Router with TypeScript
- Tailwind CSS for styling
- API routes for content (`/api/generate-content`) and image (`/api/generate-image`) generation
- Dynamic blog routes at `/blog/[slug]`

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ESLint](https://eslint.org/) (`next/core-web-vitals`)

## Project Structure

```
app/
  api/
    generate-content/   # POST endpoint for AI text generation
    generate-image/     # POST endpoint for AI image generation
  blog/
    [slug]/             # Dynamic blog post pages
components/             # Shared React components
lib/                    # Utilities and API client wrappers
public/                 # Static assets
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example env file and fill in your keys:

   ```bash
   cp .env.local.example .env.local
   ```

   Required variables:

   - `ANTHROPIC_API_KEY` — Anthropic API key for content generation
   - `OPENAI_API_KEY` — OpenAI API key for image generation
   - `NEXT_PUBLIC_SITE_URL` — Public URL of the site (e.g. `http://localhost:3000`)

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Run the production build
- `npm run lint` — Run ESLint
