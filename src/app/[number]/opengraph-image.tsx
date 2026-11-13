import { notFound } from "next/navigation";
import { paletteImage } from "@/lib/og-image";
import { getPalette, palettes, parsePaletteNumber } from "@/lib/palettes";

export const alt = "A color combination from Sanzo Wada’s collection";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export function generateStaticParams() {
  return palettes.map(({ number }) => ({ number: String(number) }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ number: string }> }) {
  const number = parsePaletteNumber((await params).number);
  const palette = number ? getPalette(number) : undefined;
  if (!palette) notFound();
  return paletteImage(palette);
}
