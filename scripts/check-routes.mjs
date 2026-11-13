import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const dataset = JSON.parse(await readFile(new URL("../data/palettes.json", import.meta.url), "utf8"));

async function checkImage(route) {
  const response = await fetch(`${base}${route}`);
  assert.equal(response.status, 200, route);
  assert.match(response.headers.get("content-type"), /image\/png/);
  const image = Buffer.from(await response.arrayBuffer());
  assert.equal(image.subarray(1, 4).toString(), "PNG");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
}
const home = await fetch(base);
assert.equal(home.status, 200);
const homeHtml = await home.text();
assert.ok(homeHtml.includes("Opening today’s page"), "SSR must not guess a visitor's local date");
assert.ok(!homeHtml.includes('aria-label="Combination '), "Home must not ship a server-timezone palette");

const pending = [...dataset.combinations];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (pending.length) {
    const palette = pending.pop();
    const response = await fetch(`${base}/${palette.number}`);
    assert.equal(response.status, 200, `Combination ${palette.number}`);
    const html = await response.text();
    assert.ok(html.includes(`Combination ${palette.number} of 348`));
    assert.ok(html.includes(`href="https://colorbook.pmg.dev/${palette.number}"`));
    assert.ok(html.includes(`${palette.number}/opengraph-image`));
    assert.ok(!html.includes("Opening today’s page"));
    for (const id of palette.colorIds) assert.ok(html.includes(`background-color:${dataset.colors[id].hex}`));
    await checkImage(`/${palette.number}/opengraph-image`);
  }
}));

for (const route of ["/0", "/349", "/0277", "/-1", "/hello", "/277.0"]) {
  assert.equal((await fetch(`${base}${route}`)).status, 404, route);
}
await checkImage("/opengraph-image");
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 349);
assert.ok((await (await fetch(`${base}/robots.txt`)).text()).includes("https://colorbook.pmg.dev/sitemap.xml"));
console.log("Verified all 348 palette routes, homepage SSR, invalid-route 404s, canonicals, all 349 PNG previews, sitemap, and robots.txt.");
