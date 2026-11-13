import dataset from "../../data/palettes.json";

export type Color = {
  id: number;
  name: string;
  hex: string;
  cmyk: number[];
  japaneseName: string | null;
  japaneseNameSource: string | null;
};

export type Palette = { number: number; colors: Color[] };

export const palettes: Palette[] = dataset.combinations.map(({ number, colorIds }) => ({
  number,
  colors: colorIds.map((id) => dataset.colors[id]),
}));

const paletteByNumber = new Map(palettes.map((palette) => [palette.number, palette]));

export function getPalette(number: number): Palette | undefined {
  return paletteByNumber.get(number);
}

export function parsePaletteNumber(value: string): number | null {
  if (!/^[1-9]\d{0,2}$/.test(value)) return null;
  const number = Number(value);
  return paletteByNumber.has(number) ? number : null;
}

/** Choose the higher-contrast ink for the small labels inside each swatch. */
export function swatchInk(hex: string): string {
  const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = rgb.map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return luminance > 0.179 ? "#000000" : "#ffffff";
}
