import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function Arrow({ direction = "right", ...props }: IconProps & { direction?: "left" | "right" }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" {...props}>
    <path d={direction === "right" ? "M4 12h15m-6-6 6 6-6 6" : "M20 12H5m6-6-6 6 6 6"} />
  </svg>;
}

export function CopyIcon(props: IconProps) {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true" {...props}>
    <path d="M7 6.5h9v10H7zM4 13.5H2.5v-11h10V4" />
  </svg>;
}

export function ShareIcon() {
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <path d="M10 12V2m-3.5 3.5L10 2l3.5 3.5M5.5 8H3v9h14V8h-2.5" />
  </svg>;
}
