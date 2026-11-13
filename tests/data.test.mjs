import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const raw = await readFile(new URL("../data/source/colors.json", import.meta.url), "utf8");
const original = JSON.parse(raw);
const dataset = JSON.parse(await readFile(new URL("../data/palettes.json", import.meta.url), "utf8"));

test("the checked-in source is exactly the pinned upstream snapshot", () => {
  assert.equal(createHash("sha256").update(raw).digest("hex"), dataset.source.sha256);
});

test("all 159 colors preserve every original field; no Japanese names are invented", () => {
  assert.equal(dataset.colors.length, 159);
  assert.equal(new Set(dataset.colors.map(c => c.name)).size, 159);
  dataset.colors.forEach((color, i) => {
    const { id, japaneseName, japaneseNameSource, ...sourceFields } = color;
    assert.equal(id, i);
    assert.deepEqual(sourceFields, original[i]);
    assert.equal(japaneseName, null);
    assert.equal(japaneseNameSource, null);
  });
});

test("each of 348 original numbers has exactly the source's member colors in source order", () => {
  assert.equal(dataset.combinations.length, 348);
  assert.equal(new Set(dataset.combinations.map(p => p.number)).size, 348);
  for (let number = 1; number <= 348; number++) {
    const palette = dataset.combinations.find(p => p.number === number);
    assert.ok(palette, `Missing original combination ${number}`);
    const expected = original.flatMap((color, id) => color.combinations.includes(number) ? [id] : []);
    assert.deepEqual(palette.colorIds, expected);
    assert.ok(palette.colorIds.length >= 2 && palette.colorIds.length <= 4);
  }
  const counts = dataset.combinations.reduce((counts, p) => ({ ...counts, [p.colorIds.length]: (counts[p.colorIds.length] ?? 0) + 1 }), {});
  assert.deepEqual(counts, { 2: 120, 3: 120, 4: 108 });
});

test("combination 277 is the original four-color combination", () => {
  const palette = dataset.combinations.find(p => p.number === 277);
  assert.deepEqual(palette.colorIds.map(id => dataset.colors[id].hex), ["#f27291", "#b73f74", "#837e31", "#1e0e3f"]);
});
