"use client";

import {
  ArrowRight,
  AudioLines,
  CalendarCheck,
  ImageIcon,
  Menu,
  MessageSquareQuote,
  PenLine,
  Rows3,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ContentCalendar from "./components/ContentCalendar";
import GeneratorForm, { type GeneratorResult } from "./components/GeneratorForm";
import ResultsDisplay from "./components/ResultsDisplay";

export default function Home() {
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const fullSuccess = Boolean(result?.posts && result?.imageUrl);
  const partialSuccess = Boolean(
    result &&
      !fullSuccess &&
      (result.posts || result.imageUrl || result.contentError || result.imageError),
  );
  const hasResults = fullSuccess || partialSuccess;

  useEffect(() => {
    if (!hasResults || !resultsRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [hasResults, result]);

  return (
    <div className="min-h-screen bg-ink text-white">
      <Nav />
      <main>
        <Hero />

        <section
          id="generate"
          className="relative scroll-mt-20 px-4 pb-20 sm:pb-28"
          aria-label="Generator"
        >
          <PurpleGlow />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12">
            <GeneratorForm onResult={setResult} />

            {hasResults && (
              <div ref={resultsRef} className="w-full scroll-mt-24">
                {fullSuccess && result?.posts && result?.imageUrl ? (
                  <ContentCalendar
                    posts={result.posts}
                    coverImage={result.imageUrl}
                    niche={result.niche}
                  />
                ) : (
                  result && <ResultsDisplay result={result} />
                )}
              </div>
            )}
          </div>
        </section>

        <HowItWorks />
        <Benefits />
      </main>
      <Footer />
    </div>
  );
}

/* ────────────── NAV ────────────── */

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="#top" className="flex items-center gap-2" aria-label="NichePost AI home">
          <Logo />
          <span className="text-base font-semibold tracking-tight text-white">
            NichePost AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <Link
            href="#generate"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#FF9472] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#FF6B9D]/20 transition hover:shadow-xl hover:shadow-[#FF6B9D]/30 hover:brightness-110"
          >
            Try it free
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mute transition hover:bg-white/5 hover:text-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-hairline bg-ink md:hidden">
          <nav
            className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3"
            aria-label="Mobile primary"
          >
            <MobileNavLink href="#features" onClick={() => setOpen(false)}>
              Features
            </MobileNavLink>
            <MobileNavLink href="#how" onClick={() => setOpen(false)}>
              How it works
            </MobileNavLink>
            <MobileNavLink href="/blog" onClick={() => setOpen(false)}>
              Blog
            </MobileNavLink>
            <Link
              href="#generate"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#FF9472] px-4 py-2.5 text-sm font-medium text-white"
            >
              Try it free
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B9D] to-[#FF9472] text-white shadow-md shadow-[#FF6B9D]/30">
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-mute transition hover:text-white"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 text-sm font-medium text-mute transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}

/* ────────────── HERO ────────────── */

function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden px-4 pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-32"
      aria-label="Introduction"
    >
      <HeroBackground />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          AI-Powered Content Calendars
        </p>

        <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
          A week of social posts in <span className="text-accent">30 seconds</span>
        </h1>

        <p className="max-w-xl text-pretty text-base leading-relaxed text-mute sm:text-lg">
          Tell us your niche, pick a platform and tone, and get seven on-brand posts
          plus a matching cover image — written by AI, ready to publish.
        </p>
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {/* Subtle grid pattern with radial fade */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
        }}
      />

      {/* Warm amber glow — bottom left (signature element) */}
      <div
        className="absolute -bottom-32 -left-40 h-[640px] w-[640px] rounded-full sm:-bottom-40 sm:-left-32"
        style={{
          background:
            "radial-gradient(circle, rgba(255,163,77,0.30) 0%, rgba(255,163,77,0.12) 35%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Soft pink-coral highlight on the opposite side for balance */}
      <div
        className="absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,107,157,0.18) 0%, rgba(255,107,157,0.06) 40%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
    </div>
  );
}

function PurpleGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(107,91,209,0.18) 0%, rgba(107,91,209,0.05) 50%, transparent 75%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}

/* ────────────── HOW IT WORKS ────────────── */

function HowItWorks() {
  const steps = [
    {
      number: "01",
      Icon: PenLine,
      title: "Describe your niche",
      body: "One line is enough — your industry, audience, or angle. The model takes it from there.",
    },
    {
      number: "02",
      Icon: SlidersHorizontal,
      title: "Pick platform & tone",
      body: "Twitter, LinkedIn, or Instagram — Professional, Casual, or Humorous. Lengths and hashtags adapt.",
    },
    {
      number: "03",
      Icon: CalendarCheck,
      title: "Publish for the week",
      body: "Seven posts and a cover image, copy-ready. Schedule them and reclaim your week.",
    },
  ];

  return (
    <section
      id="how"
      className="scroll-mt-20 border-t border-hairline px-4 py-20 sm:py-28"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="How it works"
          titleBefore="From blank page to published, in "
          titleHighlight="three steps"
          titleAfter="."
          subtitle="No prompt engineering, no template wrangling. Just enough input to get something genuinely yours."
        />

        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <li
              key={step.number}
              className="group relative flex flex-col gap-4 rounded-2xl border border-hairline bg-panel p-6 transition hover:border-white/15 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#FF9472] text-white shadow-md shadow-[#FF6B9D]/30">
                  <step.Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-mono text-xs font-medium tracking-wider text-mute/60">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-mute">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ────────────── BENEFITS ────────────── */

function Benefits() {
  const benefits = [
    {
      Icon: MessageSquareQuote,
      title: "Audience-fit copy",
      body: "Posts speak in your readers' language and reference your niche, not generic startup-isms.",
    },
    {
      Icon: Rows3,
      title: "Platform-native length",
      body: "Twitter punch, LinkedIn depth, Instagram visual storytelling — calibrated per format.",
    },
    {
      Icon: AudioLines,
      title: "Consistent voice",
      body: "All seven posts share the tone you picked. No whiplash between casual and corporate.",
    },
    {
      Icon: ImageIcon,
      title: "A cover image, included",
      body: "Every calendar ships with an AI-generated cover so your week has a unified look.",
    },
  ];

  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-hairline px-4 py-20 sm:py-28"
      aria-label="Why niche-specific?"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Why niche-specific?"
          titleBefore="Generic prompts make "
          titleHighlight="generic posts"
          titleAfter="."
          subtitle="The defaults are the problem. NichePost AI tunes every variable that matters — voice, length, hashtags, visual — to your niche specifically."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="group flex flex-col gap-3 rounded-2xl border border-hairline bg-panel p-6 transition hover:-translate-y-0.5 hover:border-white/15 hover:shadow-lg hover:shadow-black/30 sm:p-7"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
                <b.Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-base font-semibold tracking-tight text-white">
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed text-mute">{b.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────── SHARED ────────────── */

function SectionHeader({
  eyebrow,
  titleBefore,
  titleHighlight,
  titleAfter,
  subtitle,
}: {
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter?: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
        {titleBefore}
        <span className="text-accent">{titleHighlight}</span>
        {titleAfter}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-mute">{subtitle}</p>
    </div>
  );
}

/* ────────────── FOOTER ────────────── */

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-hairline bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <Link href="#top" className="flex items-center gap-2">
              <Logo />
              <span className="text-base font-semibold tracking-tight text-white">
                NichePost AI
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-mute">
              A small tool for the unfortunately large problem of staring at a
              blank caption box.
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
            aria-label="Footer"
          >
            <Link href="#generate" className="text-mute transition hover:text-white">
              Generate
            </Link>
            <Link href="#how" className="text-mute transition hover:text-white">
              How it works
            </Link>
            <Link href="#features" className="text-mute transition hover:text-white">
              Features
            </Link>
            <Link href="/blog" className="text-mute transition hover:text-white">
              Blog
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 text-xs text-mute/80 sm:flex-row sm:items-center">
          <p>© {year} NichePost AI. All rights reserved.</p>
          <p>
            Posts and images are AI-generated. Review before publishing — you&apos;re
            responsible for what goes out under your name.
          </p>
        </div>
      </div>
    </footer>
  );
}
