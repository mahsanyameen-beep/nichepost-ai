import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-ink text-white">
      <header className="relative">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link href="/" className="flex items-center gap-2" aria-label="NichePost AI home">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white shadow-md shadow-[#7C3AED]/30">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-white">
              NichePost AI
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-mute transition hover:text-white"
          >
            Back to site
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              NichePost AI
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-mute">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-hairline bg-panel/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
            {children}
          </div>

          <p className="mt-6 text-center text-sm text-mute">{footer}</p>
        </div>
      </main>
    </div>
  );
}
