import test from "node:test";
import assert from "node:assert/strict";
import { adjacentPalette, dateFromKey, formatWrittenDate, getDailyPaletteNumber, getDayOfYear, getPaletteDate, localDateKey, millisecondsToNextDay } from "../src/lib/calendar.ts";

const originalTimezone = process.env.TZ;
test.after(() => { if (originalTimezone === undefined) delete process.env.TZ; else process.env.TZ = originalTimezone; });

for (const timezone of ["America/Denver", "America/Los_Angeles", "Asia/Tokyo", "Pacific/Kiritimati", "Pacific/Pago_Pago", "UTC"]) {
  test(`all days and year boundaries use the local calendar in ${timezone}`, () => {
    process.env.TZ = timezone;
    for (const [year, length] of [[2024, 366], [2025, 365], [2026, 365], [2100, 365], [2400, 366]]) {
      for (let ordinal = 1; ordinal <= length; ordinal++) {
        for (const hour of [0, 12, 23]) {
          const date = new Date(year, 0, ordinal, hour, 59);
          assert.equal(getDayOfYear(date), ordinal);
          assert.equal(getDailyPaletteNumber(date), ((ordinal - 1) % 348) + 1);
          assert.equal(localDateKey(dateFromKey(localDateKey(date))), localDateKey(date));
        }
      }
    }
    assert.equal(getDayOfYear(new Date(2025, 9, 4)), 277);
    assert.equal(getDailyPaletteNumber(new Date(2025, 9, 4)), 277);
    assert.equal(getDailyPaletteNumber(new Date(2024, 9, 4)), 278);
    assert.equal(getDailyPaletteNumber(new Date(2025, 11, 31)), 17);
    assert.equal(getDailyPaletteNumber(new Date(2024, 11, 31)), 18);
    assert.equal(getDailyPaletteNumber(new Date(2026, 0, 1)), 1);
  });
}

test("UTC rollover does not advance a Denver visitor's local date", () => {
  process.env.TZ = "America/Denver";
  const before = new Date("2025-10-04T23:59:59Z");
  const after = new Date("2025-10-05T00:00:01Z");
  assert.equal(getDailyPaletteNumber(before), 277);
  assert.equal(getDailyPaletteNumber(after), 277);
  assert.equal(localDateKey(after), "2025-10-04");
});

test("local midnight advances the palette without a UTC rollover", () => {
  process.env.TZ = "Asia/Tokyo";
  assert.equal(getDailyPaletteNumber(new Date("2025-10-04T14:59:59Z")), 277);
  assert.equal(getDailyPaletteNumber(new Date("2025-10-04T15:00:00Z")), 278);
});

test("next-midnight scheduling handles 23-hour and 25-hour DST days", () => {
  process.env.TZ = "America/Denver";
  assert.equal(millisecondsToNextDay(new Date(2026, 2, 8)), 23 * 60 * 60 * 1000);
  assert.equal(millisecondsToNextDay(new Date(2026, 10, 1)), 25 * 60 * 60 * 1000);
  assert.equal(millisecondsToNextDay(new Date(2026, 9, 30, 23, 59, 59, 990)), 10);
});

test("numbered navigation wraps in both directions", () => {
  assert.equal(adjacentPalette(1, -1), 348);
  assert.equal(adjacentPalette(348, 1), 1);
  assert.equal(adjacentPalette(277, -1), 276);
  assert.equal(adjacentPalette(277, 1), 278);
});

test("browsing dates follow numbered editions, including leap years and December repeats", () => {
  process.env.TZ = "America/Denver";
  const today = new Date(2026, 9, 30);
  assert.equal(localDateKey(getPaletteDate(302, today)), "2026-10-29");
  assert.equal(localDateKey(getPaletteDate(303, today)), "2026-10-30");
  assert.equal(localDateKey(getPaletteDate(304, today)), "2026-10-31");
  assert.equal(localDateKey(getPaletteDate(60, new Date(2024, 2, 1))), "2024-02-29");
  for (const [year, length] of [[2024, 366], [2026, 365]]) {
    for (let ordinal = 1; ordinal <= length; ordinal++) {
      const date = new Date(year, 0, ordinal);
      assert.equal(localDateKey(getPaletteDate(getDailyPaletteNumber(date), date)), localDateKey(date));
    }
  }
  assert.equal(localDateKey(getPaletteDate(348, new Date(2026, 11, 15))), "2026-12-14");
  assert.equal(localDateKey(getPaletteDate(1, new Date(2026, 11, 15))), "2026-12-15");
  assert.equal(localDateKey(getPaletteDate(2, new Date(2026, 11, 15))), "2026-12-16");
});

test("written dates include weekday and correct ordinal suffixes", () => {
  process.env.TZ = "America/Denver";
  assert.equal(formatWrittenDate(new Date(2026, 9, 30)), "Friday, October 30th, 2026");
  for (const [day, suffix] of [[1, "st"], [2, "nd"], [3, "rd"], [4, "th"], [11, "th"], [12, "th"], [13, "th"], [21, "st"], [22, "nd"], [23, "rd"], [31, "st"]] as const) {
    assert.ok(formatWrittenDate(new Date(2026, 9, day)).includes(`October ${day}${suffix}, 2026`));
  }
});
