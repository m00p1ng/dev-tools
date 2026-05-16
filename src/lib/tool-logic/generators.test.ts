import { describe, expect, it } from "vitest";
import {
  RANDOM_CHARSET,
  buildRandomCharset,
  clampNumber,
  generateObjectId,
  generateRandomString,
} from "@/lib/tool-logic/generators";

describe("generator helpers", () => {
  it("clamps numeric input", () => {
    expect(clampNumber("0", 1, 100)).toBe(1);
    expect(clampNumber("101", 1, 100)).toBe(100);
    expect(clampNumber("bad", 1, 100)).toBe(1);
    expect(clampNumber(42, 1, 100)).toBe(42);
  });

  it("builds random charsets from options", () => {
    expect(buildRandomCharset({ letters: true, digits: false, symbols: false })).toBe(RANDOM_CHARSET.letters);
    expect(buildRandomCharset({ letters: false, digits: true, symbols: true })).toBe(RANDOM_CHARSET.digits + RANDOM_CHARSET.symbols);
  });

  it("generates strings with deterministic bytes", () => {
    const charset = RANDOM_CHARSET.letters + RANDOM_CHARSET.symbols;
    const output = generateRandomString(10, charset, RANDOM_CHARSET.symbols, new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 0, 0, 0]));
    const symbolCount = Array.from(output).filter((char) => RANDOM_CHARSET.symbols.includes(char)).length;
    expect(output).toHaveLength(10);
    expect(symbolCount).toBeGreaterThanOrEqual(1);
    expect(symbolCount).toBeLessThanOrEqual(2);
  });

  it("generates ObjectIds with timestamp and random bytes", () => {
    const id = generateObjectId(1_700_000_000_000, new Uint8Array([1, 2, 3, 4, 5]));
    expect(id).toMatch(/^[0-9a-f]{24}$/);
    expect(id.startsWith("6553f1000102030405")).toBe(true);
  });
});
