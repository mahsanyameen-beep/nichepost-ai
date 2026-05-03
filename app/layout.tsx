import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — A week of social posts in 30 seconds`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI content calendar",
    "social media generator",
    "AI social media posts",
    "Instagram caption generator",
    "LinkedIn post generator",
    "Twitter thread generator",
    "niche content marketing",
    "AI marketing tool",
    "content automation",
    "social media planning",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — A week of social posts in 30 seconds`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
    // app/opengraph-image.tsx auto-generates the 1200×630 image at /opengraph-image
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — A week of social posts in 30 seconds`,
    description: SITE_DESCRIPTION,
    creator: "@nichepostai",
    // Twitter image auto-derives from openGraph image when not set
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Favicon + apple-touch-icon are auto-wired from app/icon.svg and app/apple-icon.tsx
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#0A0A1F",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-ink font-sans text-white antialiased">{children}</body>
    </html>
  );
}
