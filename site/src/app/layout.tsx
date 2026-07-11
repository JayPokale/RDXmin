import type { Metadata } from "next";
import { Syne, Fragment_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
});

const fragment = Fragment_Mono({
  subsets: ["latin"],
  variable: "--font-fragment",
  weight: "400",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rdxmin.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RDXmin — cut Claude Code's token bill on three axes",
    template: "%s · RDXmin",
  },
  description:
    "RDXmin is a Claude Code plugin that cuts token usage three ways: a terse dev persona, a tool-output compression hook, and context-diet rules. Measured against caveman and ponytail: 52% of a bare model's 20-task bill, 1 backfire in 20.",
  keywords: [
    "claude code plugin",
    "token optimization",
    "save tokens claude",
    "claude code token usage",
    "context compression",
    "tool output compression",
    "YAGNI",
    "rdxmin",
    "caveman claude",
    "ponytail claude",
  ],
  authors: [{ name: "Jay Pokale", url: "https://github.com/JayPokale" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "RDXmin",
    title: "RDXmin — write less. ship less. mean more.",
    description:
      "The Claude Code plugin that bills 52% of a bare model across 20 live tasks. Terse persona + tool-output compressor + context diet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RDXmin — cut Claude Code's token bill on three axes",
    description:
      "Terse persona + tool-output compressor + context diet. Measured, not vibes: 52% of a bare model's bill.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RDXmin",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  description:
    "Claude Code plugin that cuts token usage on three axes: terse dev persona, tool-output compression hook, and context-diet rules.",
  url: SITE_URL,
  downloadUrl: "https://www.npmjs.com/package/rdxmin",
  softwareVersion: "1.2.1",
  license: "https://opensource.org/licenses/MIT",
  author: { "@type": "Person", name: "Jay Pokale", url: "https://github.com/JayPokale" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${fragment.variable}`}>
      <body className="grain antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
