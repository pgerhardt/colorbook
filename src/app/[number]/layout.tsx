import { palettes } from "@/lib/palettes";

// Pre-render every numbered page. The image route declares its own static
// params because route handlers do not inherit these layout params.
export const dynamicParams = false;

export function generateStaticParams() {
  return palettes.map(({ number }) => ({ number: String(number) }));
}

export default function PaletteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
