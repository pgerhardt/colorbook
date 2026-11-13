import { ImageResponse } from "next/og";
import type { Palette } from "./palettes";
import { swatchInk } from "./palettes";

export function paletteImage(palette: Palette, cover = false) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#f6f3eb", color: "#302f2b", padding: "46px 56px 35px", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 24, borderBottom: "1px solid #d8d4cb" }}>
        <div style={{ display: "flex", fontSize: 25, letterSpacing: -0.5 }}>A Dictionary of Color Combinations</div>
        <div style={{ display: "flex", fontSize: 14, color: "#73716a" }}>SANZO WADA · 1933</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "25px 0 24px" }}>
        <div style={{ display: "flex", fontSize: 34, letterSpacing: -1 }}>The Color Book</div>
        <div style={{ display: "flex", fontSize: 42 }}>{cover ? "One day. One combination." : `${String(palette.number).padStart(3, "0")} / 348`}</div>
      </div>
      <div style={{ display: "flex", width: "100%", height: 275 }}>
        {palette.colors.map((color, index) => <div key={color.id} style={{ display: "flex", flex: 1, height: "100%", background: color.hex, color: swatchInk(color.hex), alignItems: "flex-end", padding: 20, fontSize: 12 }}>{String(index + 1).padStart(2, "0")}</div>)}
      </div>
      <div style={{ display: "flex", width: "100%", paddingTop: 18 }}>
        {palette.colors.map((color) => <div key={color.id} style={{ display: "flex", flex: 1, flexDirection: "column", paddingRight: 12, fontSize: 15, gap: 7 }}><span>{color.name}</span><span style={{ color: "#73716a", fontSize: 12 }}>{color.hex.toUpperCase()}</span></div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", fontSize: 12, color: "#73716a" }}><span>One color combination each day.</span><span>colorbook.pmg.dev</span></div>
    </div>,
    { width: 1200, height: 630 },
  );
}
