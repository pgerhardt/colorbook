import { paletteImage } from "@/lib/og-image";
import { getPalette } from "@/lib/palettes";

export const alt = "The Color Book — one color combination each day";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  // An evergreen cover, explicitly not labelled as the visitor's daily palette.
  return paletteImage(getPalette(303)!, true);
}
