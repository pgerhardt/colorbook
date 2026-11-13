"use client";

import { useRef } from "react";

export function Colophon() {
  const dialog = useRef<HTMLDialogElement>(null);

  return <>
    <button className="text-link source-trigger" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">About &amp; sources <span aria-hidden="true">↗</span></button>
    <dialog ref={dialog} className="colophon" aria-labelledby="colophon-title" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="colophon-content">
        <div className="flex items-center justify-between gap-6">
          <p className="eyebrow">A note on this collection</p>
          <button className="close-button" onClick={() => dialog.current?.close()} aria-label="Close about and sources" autoFocus>×</button>
        </div>
        <h2 id="colophon-title">A small, daily ritual.</h2>
        <p>One day. One color combination. This independent digital edition revisits the color studies of Japanese artist Sanzo Wada (1883–1967).</p>
        <p>His 1933 work, <span lang="ja">配色総鑑</span>, was later reissued by Seigensha as <em>A Dictionary of Color Combinations</em>. Its 348 combinations bring together 159 colors in pairs, trios, and quartets.</p>
        <p>Each day of your local calendar opens the corresponding numbered combination. After no. 348, the sequence begins again. The page turns at your local midnight.</p>
        <div className="source-note">
          <p>Color names, original combination numbers, HEX and CMYK values are preserved from <a href="https://github.com/mattdesl/dictionary-of-colour-combinations">Matt DesLauriers’ open-source dataset ↗</a>, based on the work of <a href="https://github.com/dblodorn/sanzo-wada">Dain M. Blodorn Kim ↗</a>.</p>
          <p>The dataset supplies no Japanese color names, so none have been inferred. Screen colors are digital interpretations of printed swatches.</p>
          <a className="book-link" href="https://en.seigensha.com/books/978-4-86152-247-5/">Discover the original book · Seigensha ↗</a>
        </div>
      </div>
    </dialog>
  </>;
}
