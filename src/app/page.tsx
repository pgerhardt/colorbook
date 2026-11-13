import type { Metadata } from "next";
import { ColorBook } from "@/components/color-book";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: SITE_URL } };

export default function TodayPage() {
  return <ColorBook />;
}
