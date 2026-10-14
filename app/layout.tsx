import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Instrument_Serif, Inter_Tight } from "next/font/google";
import "./globals.css";
import { BRAND, SEO, SITE_URL } from "@/content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { JsonLd, personLd, businessLd } from "@/components/JsonLd";

const display = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
  adjustFontFallback: false,
  display: "swap",
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
      <head>
        {/* Lets CSS hide not-yet-revealed content only when JS will reveal it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
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
        <RevealObserver />
        <JsonLd data={[personLd(), businessLd()]} />
      </body>
    </html>
  );
}
