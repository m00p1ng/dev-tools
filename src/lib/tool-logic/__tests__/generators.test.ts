import { describe, expect, it } from "vitest";
import {
  RANDOM_CHARSET,
  buildRandomCharset,
  clampNumber,
  generateObjectId,
  generateRandomString,
  randomChar,
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

  it("returns empty string for empty charset", () => {
    expect(generateRandomString(10, "", null)).toBe("");
    expect(generateRandomString(10, "", RANDOM_CHARSET.symbols)).toBe("");
  });

  it("generates string without symbolCharset constraint", () => {
    const bytes = new Uint8Array([10, 20, 30, 40, 50]);
    const output = generateRandomString(5, RANDOM_CHARSET.letters, null, bytes);
    expect(output).toHaveLength(5);
    expect([...output].every((c) => RANDOM_CHARSET.letters.includes(c))).toBe(true);
  });

  it("skips symbol distribution for length < 2", () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const output = generateRandomString(1, RANDOM_CHARSET.letters + RANDOM_CHARSET.symbols, RANDOM_CHARSET.symbols, bytes);
    expect(output).toHaveLength(1);
  });

  it("clamps with custom fallback", () => {
    expect(clampNumber("bad", 1, 100, 50)).toBe(50);
  });

  it("randomChar picks from charset using modulo", () => {
    expect(randomChar("abc", 0)).toBe("a");
    expect(randomChar("abc", 1)).toBe("b");
    expect(randomChar("abc", 3)).toBe("a");
  });

  it("falls back to charset when all chars are symbols (nonSymbol is empty)", () => {
    // charset = symbolCharset means no non-symbol chars → nonSymbol = "" → || charset fallback
    const bytes = new Uint8Array([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 1, 0, 0, 0]);
    const output = generateRandomString(10, RANDOM_CHARSET.symbols, RANDOM_CHARSET.symbols, bytes);
    expect(output).toHaveLength(10);
    expect([...output].every((c) => RANDOM_CHARSET.symbols.includes(c))).toBe(true);
  });
});
