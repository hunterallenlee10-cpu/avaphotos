import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { BRAND, SEO, SITE_URL } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { ImageFader } from "@/components/motion/ImageFader";
import { JsonLd, personLd, businessLd } from "@/components/JsonLd";

// Big Shoulders, instanced at its 72pt "Display" optical size, weight 800,
// Latin-subset (18 KB vs 57 KB for the full variable font). Built from the
// Google Fonts source with fontTools — see assets/fonts/README.md.
const display = localFont({
  src: "../assets/fonts/BigShoulders-72-800.woff2",
  weight: "800",
  variable: "--font-display",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
  adjustFontFallback: false,
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SEO.title, template: `%s — ${BRAND.person}` },
  description: SEO.description,
  keywords: SEO.keywords,
  applicationName: BRAND.name,
  authors: [{ name: BRAND.person }],
  creator: BRAND.person,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    locale: "en_US",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <div className="grain" aria-hidden="true" />
        <Cursor />
        <RouteTransition />
        <SmoothScroll />
        <ImageFader />
        <JsonLd data={[personLd(), businessLd()]} />
      </body>
    </html>
  );
}
