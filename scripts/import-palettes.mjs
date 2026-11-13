import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const commit = "c142bd0bc8049ea48db4da5eb397981f047e8ef4";
const repository = "https://github.com/mattdesl/dictionary-of-colour-combinations";
const sha256 = "555f11c32eb8133078fd470dd7d5320533aaa8b636f12fa06a8dd3d0ee2703b4";
const sourceDirectory = path.join(root, "data/source");
const sourceFile = path.join(sourceDirectory, "colors.json");

// Only this explicit command needs the network. Ordinary builds use the
// checked-in, byte-for-byte upstream snapshot and its original MIT license.
if (process.argv.includes("--fetch")) {
  await mkdir(sourceDirectory, { recursive: true });
  for (const file of ["colors.json", "LICENSE.md"]) {
    const response = await fetch(`https://raw.githubusercontent.com/mattdesl/dictionary-of-colour-combinations/${commit}/${file}`);
    if (!response.ok) throw new Error(`Cannot fetch ${file}: HTTP ${response.status}`);
    const content = await response.text();
    if (file === "colors.json" && createHash("sha256").update(content).digest("hex") !== sha256) {
      throw new Error("The upstream source does not match the pinned checksum.");
    }
    await writeFile(path.join(sourceDirectory, file), content);
  }
}

const source = await readFile(sourceFile, "utf8");
if (createHash("sha256").update(source).digest("hex") !== sha256) {
  throw new Error("Local source differs from the pinned upstream snapshot. Run npm run data:fetch to restore it.");
}
const original = JSON.parse(source);
if (!Array.isArray(original) || original.length !== 159) throw new Error("Expected 159 source colors.");

// Each source color declares its ORIGINAL combination numbers. Never infer
// combination numbers from a sorted palette, a color name, or an array index.
const combinationsByNumber = new Map();
const colors = original.map((color, id) => {
  if (typeof color.name !== "string" || !/^#[0-9a-f]{6}$/i.test(color.hex)) {
    throw new Error(`Invalid color at source position ${id}.`);
  }
  // Preserve upstream values verbatim, including the source's M=106 entry.
  // Clamping or recomputing CMYK/HEX would change the requested historical data.
  if (color.cmyk.length !== 4 || !color.cmyk.every(Number.isFinite)) {
    throw new Error(`Invalid CMYK for ${color.name}.`);
  }
  if (new Set(color.combinations).size !== color.combinations.length) {
    throw new Error(`Duplicate membership for ${color.name}.`);
  }
  for (const number of color.combinations) {
    if (!Number.isInteger(number) || number < 1 || number > 348) throw new Error(`Invalid original combination number ${number}.`);
    if (!combinationsByNumber.has(number)) combinationsByNumber.set(number, []);
    combinationsByNumber.get(number).push(id);
  }
  return {
    id,
    ...color,
    // This source has no Japanese names. Null is deliberate, not a translation.
    japaneseName: null,
    japaneseNameSource: null,
  };
});

const combinations = [];
for (let number = 1; number <= 348; number++) {
  const colorIds = combinationsByNumber.get(number);
  if (!colorIds || colorIds.length < 2 || colorIds.length > 4) throw new Error(`Combination ${number} must contain 2–4 colors.`);
  combinations.push({ number, colorIds });
}

const dataset = {
  source: { repository, commit, sha256, license: "MIT", japaneseNames: "Not present in the upstream dataset; none inferred." },
  colors,
  combinations,
};
await writeFile(path.join(root, "data/palettes.json"), JSON.stringify(dataset, null, 2) + "\n");
console.log(`Imported ${combinations.length} original combinations and ${colors.length} colors from the verified local snapshot.`);
