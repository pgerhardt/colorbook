"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { adjacentPalette, dateFromKey, formatWrittenDate, getDailyPaletteNumber, getDayOfYear, getPaletteDate, localDateKey } from "@/lib/calendar";
import { getPalette, swatchInk } from "@/lib/palettes";
import { useLocalDate } from "@/lib/use-local-date";
import { Arrow, CopyIcon, ShareIcon } from "./icons";
import { Colophon } from "./colophon";

export function ColorBook({ fixedNumber }: { fixedNumber?: number }) {
  const router = useRouter();
  const dateKey = useLocalDate();
  const today = dateKey ? dateFromKey(dateKey) : null;
  const todayNumber = today ? getDailyPaletteNumber(today) : null;
  const number = fixedNumber ?? todayNumber;
  const date = today && number ? getPaletteDate(number, today) : null;
  const displayedDateKey = date ? localDateKey(date) : undefined;
  const writtenDate = date ? formatWrittenDate(date) : null;
  const palette = number ? getPalette(number) : undefined;
  const isToday = number !== null && number === todayNumber;
  const [feedback, setFeedback] = useState<{ key: string; message: string } | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (value: string, key: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback({ key, message });
    } catch {
      setFeedback({ key: "error", message: "Copy unavailable. You can select and copy the HEX value or page address." });
    }
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2600);
  }, []);

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); }, []);

  useEffect(() => {
    if (!number) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [role='textbox'], dialog[open]"))) return;
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        router.push(`/${adjacentPalette(number, event.key === "ArrowLeft" ? -1 : 1)}`, { scroll: false });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [number, router]);

  const columns = { "--color-count": palette?.colors.length ?? 4 } as CSSProperties;

  return <div className="book-page">
    <a href="#palette" className="skip-link">Skip to color combination</a>
    <header className="masthead">
      <Link href="/" className="wordmark" aria-label="A Dictionary of Color Combinations — today’s combination">
        <span className="wordmark-japanese" lang="ja">配色事典</span>
        <span className="wordmark-english">A Dictionary of Color Combinations</span>
      </Link>
      <div className="edition-date">
        <time dateTime={displayedDateKey}>
          {date ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date) : <span aria-hidden="true">&nbsp;</span>}
        </time>
        <p>{date ? `DAY ${String(getDayOfYear(date)).padStart(3, "0")}` : "DAILY EDITION"}<span className="date-separator" aria-hidden="true"> / </span><span>VOL. 01</span></p>
      </div>
    </header>

    <main id="palette" className="main-content" tabIndex={-1}>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{palette ? `Combination ${palette.number} of 348. ${palette.colors.map((color) => color.name).join(", ")}.` : ""}</p>
      <section aria-labelledby="palette-title" aria-busy={!palette}>
        <div className="palette-heading">
          <div className="intro">
            <p className="eyebrow"><span className="edition-dot" aria-hidden="true" />{fixedNumber ? "From the collection" : "Today’s color combination"}</p>
            <h1 id="palette-title">The Color Book</h1>
          </div>
          <div className="combination-reference">
            <p className="palette-number" aria-label={number ? `Combination ${number} of 348` : "Loading today’s combination"}>
              <span className="current-number">{number ? String(number).padStart(3, "0") : <span aria-hidden="true">—</span>}</span>
              <span className="number-total"><span className="number-slash">/</span> 348</span>
            </p>
            <p className="reference-caption">SANZO WADA’S COLLECTION</p>
          </div>
        </div>

        {palette ? <>
          <div className={`swatch-field colors-${palette.colors.length}`} style={columns} role="group" aria-label={`Colors in combination ${palette.number}`}>
            {palette.colors.map((color, index) => <button
              key={color.id}
              className="color-swatch"
              style={{ backgroundColor: color.hex, color: swatchInk(color.hex) }}
              onClick={() => copy(color.hex.toUpperCase(), color.hex, `${color.hex.toUpperCase()} copied`)}
              aria-label={`Copy ${color.name}, ${color.hex.toUpperCase()}`}
              title={`${color.name} · ${color.hex.toUpperCase()} · Click to copy`}
            >
              <span className="swatch-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="swatch-action" aria-hidden="true">{feedback?.key === color.hex ? "Copied" : "Copy HEX"} <span>{feedback?.key === color.hex ? "✓" : "+"}</span></span>
            </button>)}
          </div>

          <div className={`color-details colors-${palette.colors.length}`} style={columns}>
            {palette.colors.map((color, index) => <div className="color-detail" key={color.id}>
              <div className="detail-index" aria-hidden="true"><span style={{ backgroundColor: color.hex }} />{String(index + 1).padStart(2, "0")}</div>
              {color.japaneseName && color.japaneseNameSource && <p className="color-japanese" lang="ja">{color.japaneseName}</p>}
              <h2>{color.name}</h2>
              <button className="hex-copy" onClick={() => copy(color.hex.toUpperCase(), color.hex, `${color.hex.toUpperCase()} copied`)} aria-label={`Copy HEX ${color.hex.toUpperCase()} for ${color.name}`}>
                <span>{color.hex.toUpperCase()}</span>
                <span className="copy-indicator" aria-hidden="true">{feedback?.key === color.hex ? "✓" : <CopyIcon />}</span>
              </button>
              <p className="cmyk" aria-label={`CMYK: cyan ${color.cmyk[0]}, magenta ${color.cmyk[1]}, yellow ${color.cmyk[2]}, black ${color.cmyk[3]}`}><span>CMYK</span> {color.cmyk.join(" · ")}</p>
            </div>)}
          </div>
        </> : <div className="palette-placeholder" aria-label="Opening today’s color combination"><p>Opening today’s page<span aria-hidden="true"> …</span></p></div>}

        <div className="palette-toolbar">
          <nav className="palette-navigation" aria-label="Browse color combinations">
            {number ? <>
              <Link href={`/${adjacentPalette(number, -1)}`} scroll={false} className="nav-control" aria-label={`Previous combination, ${adjacentPalette(number, -1)}`} aria-keyshortcuts="ArrowLeft"><Arrow direction="left" /><span>Previous</span></Link>
              <Link href={`/${adjacentPalette(number, 1)}`} scroll={false} className="nav-control" aria-label={`Next combination, ${adjacentPalette(number, 1)}`} aria-keyshortcuts="ArrowRight"><span>Next</span><Arrow /></Link>
            </> : <span className="nav-loading">A new page, every day.</span>}
            <span className="nav-divider" aria-hidden="true" />
            <Link href="/" scroll={false} className="today-control" aria-current={!fixedNumber ? "page" : undefined}>Today<span className={isToday ? "today-dot active" : "today-dot"} aria-hidden="true" /></Link>
          </nav>
          <div className="share-area">
            <span className="share-feedback" aria-hidden="true">{feedback?.key === "share" ? "Link copied" : ""}</span>
            <button className="share-control" disabled={!number} onClick={() => number && copy(`${window.location.origin}/${number}`, "share", `Link to combination ${number} copied`)} aria-label="Copy permanent link to this combination"><ShareIcon /><span>Share</span></button>
          </div>
        </div>
        <p className={`copy-feedback ${feedback?.key === "error" ? "copy-error" : "sr-only"}`} role="status" aria-live="polite" aria-atomic="true">{feedback?.message ?? ""}</p>
        <noscript><p className="noscript-note">JavaScript selects today’s palette using your local date. You can still explore the collection, beginning with <a href="/1">combination 1</a>.</p></noscript>
      </section>
    </main>

    <footer className="page-footer">
      <div className="footer-credit"><p>Sanzo Wada <span aria-hidden="true">·</span> 1933</p><p>A Dictionary of Color Combinations</p></div>
      <p className="daily-note"><time dateTime={displayedDateKey}>{writtenDate ?? <span aria-hidden="true">&nbsp;</span>}</time></p>
      <Colophon />
    </footer>
  </div>;
}
