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
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <Nav />
      <main>
        <Hero />

        <section
          id="generate"
          className="scroll-mt-20 px-4 pb-20 sm:pb-28"
          aria-label="Generator"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
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
    <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-md dark:border-stone-800/60 dark:bg-stone-950/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="#top" className="flex items-center gap-2" aria-label="NichePost AI home">
          <Logo />
          <span className="text-base font-semibold tracking-tight">NichePost AI</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <Link
            href="#generate"
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
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
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-200/60 md:hidden dark:text-stone-300 dark:hover:bg-stone-800/60"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200/60 bg-stone-50 md:hidden dark:border-stone-800/60 dark:bg-stone-950">
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
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900"
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
    <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-sm shadow-teal-700/20">
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
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
      className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-200/60 dark:text-stone-300 dark:hover:bg-stone-800/60"
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
          AI-Powered Content Calendars
        </p>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl dark:text-stone-50">
          A week of social posts
          <br className="hidden sm:inline" />{" "}
          <span className="bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
            in 30 seconds
          </span>
        </h1>

        <p className="max-w-xl text-pretty text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-400">
          Tell us your niche, pick a platform and tone, and get seven on-brand posts
          plus a matching cover image — written by AI, ready to publish.
        </p>

        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="#generate"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-900/10 transition-all hover:bg-stone-800 hover:shadow-xl hover:shadow-stone-900/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:bg-stone-100 dark:text-stone-900 dark:shadow-stone-100/10 dark:hover:bg-white"
          >
            Generate your calendar
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-medium text-stone-700 backdrop-blur transition-colors hover:border-stone-400 hover:bg-white dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-stone-900"
          >
            See how it works
          </Link>
        </div>

        <p className="mt-1 text-xs text-stone-500 dark:text-stone-500">
          Free to try · No signup required
        </p>
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.stone.200/55)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.stone.200/55)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(to_right,theme(colors.stone.800/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.stone.800/40)_1px,transparent_1px)]"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 75%)",
        }}
      />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10">
        <div className="h-[480px] w-[680px] rounded-full bg-gradient-to-br from-teal-200/40 via-emerald-200/30 to-transparent blur-3xl dark:from-teal-700/10 dark:via-emerald-700/10" />
      </div>
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
      className="scroll-mt-20 border-t border-stone-200/70 bg-white px-4 py-20 sm:py-28 dark:border-stone-800/70 dark:bg-stone-950"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="How it works"
          title="From blank page to published, in three steps."
          subtitle="No prompt engineering, no template wrangling. Just enough input to get something genuinely yours."
        />

        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <li
              key={step.number}
              className="group relative flex flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-6 transition-colors hover:border-stone-300 sm:p-8 dark:border-stone-800 dark:bg-stone-900/40 dark:hover:border-stone-700"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900 text-white shadow-sm dark:bg-stone-100 dark:text-stone-900">
                  <step.Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-mono text-xs font-medium tracking-wider text-stone-400 dark:text-stone-600">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {step.body}
              </p>
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
      className="scroll-mt-20 border-t border-stone-200/70 px-4 py-20 sm:py-28 dark:border-stone-800/70"
      aria-label="Why niche-specific?"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Why niche-specific?"
          title="Generic prompts make generic posts."
          subtitle="The defaults are the problem. NichePost AI tunes every variable that matters — voice, length, hashtags, visual — to your niche specifically."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {benefits.map((b) => (
            <article
              key={b.title}
              className="group flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lg sm:p-7 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700 dark:hover:shadow-black/40"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:ring-teal-900/40">
                <b.Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {b.body}
              </p>
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
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-stone-400">
        {subtitle}
      </p>
    </div>
  );
}

/* ────────────── FOOTER ────────────── */

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-stone-200/70 bg-stone-100/50 dark:border-stone-800/70 dark:bg-stone-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <Link href="#top" className="flex items-center gap-2">
              <Logo />
              <span className="text-base font-semibold tracking-tight">
                NichePost AI
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              A small tool for the unfortunately large problem of staring at a
              blank caption box.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Footer">
            <Link href="#generate" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              Generate
            </Link>
            <Link href="#how" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              How it works
            </Link>
            <Link href="#features" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              Features
            </Link>
            <Link href="/blog" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              Blog
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-stone-200/70 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center dark:border-stone-800/70 dark:text-stone-500">
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
