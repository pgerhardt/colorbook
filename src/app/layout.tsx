import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const caslon = localFont({
  src: "../../public/fonts/libre-caslon-display.ttf",
  variable: "--font-caslon",
  display: "swap",
  weight: "400",
  fallback: ["Georgia", "serif"],
});
const mincho = localFont({
  src: "../../public/fonts/noto-serif-jp-subset.ttf",
  variable: "--font-mincho",
  display: "swap",
  weight: "400",
  fallback: ["Yu Mincho", "Hiragino Mincho ProN", "serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — A Dictionary of Color Combinations`, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "The Color Book" }],
  keywords: ["Sanzo Wada", "daily color palette", "A Dictionary of Color Combinations", "Japanese colors", "配色事典"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${SITE_NAME} — A Dictionary of Color Combinations`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The Color Book — one color combination each day" }],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: ["/opengraph-image"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6f3eb" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${caslon.variable} ${mincho.variable}`}>{children}</body></html>;
}
