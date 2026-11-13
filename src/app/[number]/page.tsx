import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColorBook } from "@/components/color-book";
import { getPalette, parsePaletteNumber } from "@/lib/palettes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ number: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const number = parsePaletteNumber((await params).number);
  const palette = number ? getPalette(number) : undefined;
  if (!palette) return { title: "Combination not found" };
  const title = `Combination ${number}`;
  const description = `${palette.colors.map((color) => color.name).join(", ")}. Original combination ${number} from Sanzo Wada’s A Dictionary of Color Combinations (1933).`;
  const image = { url: `/${number}/opengraph-image`, width: 1200, height: 630, alt: `Sanzo Wada combination ${number}: ${palette.colors.map((color) => color.name).join(", ")}` };
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/${number}` },
    openGraph: { type: "website", siteName: SITE_NAME, title: `${title} — ${SITE_NAME}`, description, url: `${SITE_URL}/${number}`, images: [image] },
    twitter: { card: "summary_large_image", title: `${title} — ${SITE_NAME}`, description, images: [image.url] },
  };
}

export default async function PalettePage({ params }: Props) {
  const number = parsePaletteNumber((await params).number);
  if (number === null) notFound();
  return <ColorBook fixedNumber={number} />;
}
