import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NichePost AI",
  description: "AI-powered niche content and image generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
