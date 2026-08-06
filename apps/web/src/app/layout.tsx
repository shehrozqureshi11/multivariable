import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL } from "@/lib/api";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-loaded",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Transparent Livestock Investment`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Invest in verified goats, sheep, and cows across Pakistan. Track care updates, digital agreements, and profit sharing with HerdShare.",
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Transparent Livestock Investment`,
    description:
      "Fund verified livestock farms with transparent tracking and Shariah-friendly profit sharing.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Transparent livestock investment for Pakistan.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Livestock investment platform connecting investors with verified farms in Pakistan.",
    areaServed: "PK",
  };

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body
        style={
          {
            "--font-display": "var(--font-display-loaded), serif",
            "--font-body": "var(--font-body-loaded), sans-serif",
          } as React.CSSProperties
        }
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
