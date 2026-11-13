import type { MetadataRoute } from "next";
import { palettes } from "@/lib/palettes";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...palettes.map(({ number }) => ({ url: `${SITE_URL}/${number}`, changeFrequency: "never" as const, priority: 0.7 })),
  ];
}
