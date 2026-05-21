import { describe, expect, it } from "vitest";
import {
  hsvToHex,
  hsvToRgb,
  hsvToHsl,
  rgbToHsv,
  rgbToOklch,
  oklchToRgb,
  formatHex,
  formatRgb,
  formatHsl,
  formatHsv,
  formatOklch,
  parseHex,
  parseRgb,
  parseHsl,
  parseHsvStr,
  parseOklch,
} from "@/lib/tool-logic/color";

describe("hsvToHex", () => {
  it("converts red", () => {
    expect(hsvToHex({ h: 0, s: 100, v: 100 })).toBe("#ff0000");
  });

  it("converts white", () => {
    expect(hsvToHex({ h: 0, s: 0, v: 100 })).toBe("#ffffff");
  });

  it("converts black", () => {
    expect(hsvToHex({ h: 0, s: 0, v: 0 })).toBe("#000000");
  });

  it("converts blue", () => {
    expect(hsvToHex({ h: 240, s: 100, v: 100 })).toBe("#0000ff");
  });
});

describe("hsvToRgb", () => {
  it("converts red", () => {
    expect(hsvToRgb({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("converts green", () => {
    expect(hsvToRgb({ h: 120, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("converts blue", () => {
    expect(hsvToRgb({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("converts white (0 saturation)", () => {
    expect(hsvToRgb({ h: 0, s: 0, v: 100 })).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe("hsvToHsl", () => {
  it("converts red", () => {
    expect(hsvToHsl({ h: 0, s: 100, v: 100 })).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("converts white", () => {
    const { l } = hsvToHsl({ h: 0, s: 0, v: 100 });
    expect(l).toBe(100);
  });

  it("converts a mid-tone blue", () => {
    const { h } = hsvToHsl({ h: 240, s: 100, v: 100 });
    expect(h).toBe(240);
  });
});

describe("rgbToHsv", () => {
  it("converts red", () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toMatchObject({ h: 0, s: 100, v: 100 });
  });

  it("converts green", () => {
    expect(rgbToHsv({ r: 0, g: 255, b: 0 })).toMatchObject({ h: 120, s: 100, v: 100 });
  });

  it("preserves alpha when provided", () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0, a: 50 })).toMatchObject({ a: 50 });
  });

  it("returns undefined alpha when not provided", () => {
    const result = rgbToHsv({ r: 255, g: 0, b: 0 });
    expect(result.a).toBeUndefined();
  });
});

describe("rgbToOklch", () => {
  it("returns L≈0 for black", () => {
    const { l } = rgbToOklch({ r: 0, g: 0, b: 0 });
    expect(l).toBeCloseTo(0, 2);
  });

  it("returns L≈1 for white", () => {
    const { l } = rgbToOklch({ r: 255, g: 255, b: 255 });
    expect(l).toBeCloseTo(1, 2);
  });

  it("returns C≈0 for achromatic grey", () => {
    const { c } = rgbToOklch({ r: 128, g: 128, b: 128 });
    expect(c).toBeCloseTo(0, 2);
  });

  it("returns h ≥ 0 for all colors", () => {
    const { h } = rgbToOklch({ r: 0, g: 0, b: 255 });
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
  });

  it("wraps negative hue angle to positive", () => {
    // Colors with negative atan2 result should wrap to [0, 360)
    const { h: hRed } = rgbToOklch({ r: 255, g: 0, b: 0 });
    expect(hRed).toBeGreaterThanOrEqual(0);
  });
});

describe("oklchToRgb", () => {
  it("round-trips with rgbToOklch for red", () => {
    const rgb = { r: 255, g: 0, b: 0 };
    const back = oklchToRgb(rgbToOklch(rgb));
    expect(back.r).toBeCloseTo(rgb.r, -1);
    expect(back.g).toBeCloseTo(rgb.g, -1);
    expect(back.b).toBeCloseTo(rgb.b, -1);
  });

  it("round-trips with rgbToOklch for a muted colour", () => {
    const rgb = { r: 100, g: 150, b: 200 };
    const back = oklchToRgb(rgbToOklch(rgb));
    expect(back.r).toBeCloseTo(rgb.r, -1);
    expect(back.g).toBeCloseTo(rgb.g, -1);
    expect(back.b).toBeCloseTo(rgb.b, -1);
  });

  it("clamps out-of-gamut values to 0–255", () => {
    const rgb = oklchToRgb({ l: 0.5, c: 0.5, h: 180 });
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.g).toBeLessThanOrEqual(255);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeLessThanOrEqual(255);
  });
});

describe("formatHex", () => {
  it("returns uppercase hex without alpha suffix when fully opaque", () => {
    expect(formatHex({ h: 0, s: 100, v: 100 })).toBe("#FF0000");
  });

  it("appends two-digit uppercase alpha when alpha < 100", () => {
    expect(formatHex({ h: 0, s: 100, v: 100, a: 50 })).toBe("#FF000080");
  });

  it("treats missing alpha as 100 (no suffix)", () => {
    expect(formatHex({ h: 120, s: 100, v: 100 })).toBe("#00FF00");
  });

  it("alpha=0 yields 00 suffix", () => {
    expect(formatHex({ h: 0, s: 100, v: 100, a: 0 })).toBe("#FF000000");
  });
});

describe("formatRgb", () => {
  it("returns rgb() when fully opaque", () => {
    expect(formatRgb({ h: 0, s: 100, v: 100 })).toBe("rgb(255, 0, 0)");
  });

  it("returns rgba() when alpha < 100", () => {
    expect(formatRgb({ h: 0, s: 100, v: 100, a: 50 })).toBe("rgba(255, 0, 0, 0.50)");
  });

  it("returns rgba() for alpha=0", () => {
    expect(formatRgb({ h: 0, s: 100, v: 100, a: 0 })).toBe("rgba(255, 0, 0, 0.00)");
  });
});

describe("formatHsl", () => {
  it("returns hsl() when fully opaque", () => {
    expect(formatHsl({ h: 0, s: 100, v: 100 })).toBe("hsl(0, 100%, 50%)");
  });

  it("returns hsla() when alpha < 100", () => {
    const result = formatHsl({ h: 0, s: 100, v: 100, a: 50 });
    expect(result).toMatch(/^hsla\(0, 100%, 50%, 0\.50\)$/);
  });
});

describe("formatHsv", () => {
  it("returns hsv() when fully opaque", () => {
    expect(formatHsv({ h: 0, s: 100, v: 100 })).toBe("hsv(0, 100%, 100%)");
  });

  it("returns hsva() when alpha < 100", () => {
    expect(formatHsv({ h: 0, s: 100, v: 100, a: 50 })).toBe("hsva(0, 100%, 100%, 0.50)");
  });

  it("defaults missing alpha to 100 (no hsva)", () => {
    expect(formatHsv({ h: 0, s: 100, v: 100 })).toBe("hsv(0, 100%, 100%)");
  });
});

describe("formatOklch", () => {
  it("returns oklch() when fully opaque", () => {
    const result = formatOklch({ h: 0, s: 100, v: 100 });
    expect(result).toMatch(/^oklch\([\d.]+% [\d.]+ \d+\)$/);
  });

  it("returns oklch() with / separator when alpha < 100", () => {
    const result = formatOklch({ h: 0, s: 100, v: 100, a: 50 });
    expect(result).toMatch(/ \/ 0\.50\)$/);
  });
});

describe("parseHex", () => {
  it("parses 6-char hex with #", () => {
    expect(parseHex("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses 6-char hex without #", () => {
    expect(parseHex("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses uppercase hex", () => {
    expect(parseHex("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses 8-char hex and returns alpha", () => {
    const result = parseHex("#ff000080");
    expect(result).not.toBeNull();
    expect(result?.r).toBe(255);
    expect(result?.g).toBe(0);
    expect(result?.b).toBe(0);
    expect(result?.a).toBeDefined();
    expect(result!.a).toBeGreaterThan(0);
  });

  it("returns null for completely invalid string", () => {
    expect(parseHex("notacolor")).toBeNull();
  });

  it("returns null for invalid hex digits", () => {
    expect(parseHex("#xyzxyz")).toBeNull();
  });

  it("trims leading/trailing whitespace", () => {
    expect(parseHex("  #ff0000  ")).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe("parseRgb", () => {
  it("parses rgb()", () => {
    expect(parseRgb("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses rgba() with alpha", () => {
    const result = parseRgb("rgba(255, 0, 0, 0.5)");
    expect(result).toMatchObject({ r: 255, g: 0, b: 0, a: 50 });
  });

  it("returns null when fewer than 3 numbers", () => {
    expect(parseRgb("rgb(1, 2)")).toBeNull();
  });

  it("returns null when r > 255", () => {
    expect(parseRgb("rgb(300, 0, 0)")).toBeNull();
  });

  it("returns null when g > 255", () => {
    expect(parseRgb("rgb(0, 300, 0)")).toBeNull();
  });

  it("returns null when b > 255", () => {
    expect(parseRgb("rgb(0, 0, 300)")).toBeNull();
  });

  it("clamps alpha > 1 to 100", () => {
    const result = parseRgb("rgba(255, 0, 0, 2.0)");
    expect(result?.a).toBe(100);
  });

  it("returns no alpha when alpha not provided", () => {
    const result = parseRgb("rgb(255, 0, 0)");
    expect(result?.a).toBeUndefined();
  });
});

describe("parseHsl", () => {
  it("parses hsl()", () => {
    const result = parseHsl("hsl(0, 100%, 50%)");
    expect(result).not.toBeNull();
    expect(result?.r).toBe(255);
    expect(result?.g).toBe(0);
    expect(result?.b).toBe(0);
  });

  it("parses hsla() with alpha", () => {
    const result = parseHsl("hsla(0, 100%, 50%, 0.5)");
    expect(result?.a).toBe(50);
  });

  it("returns null when fewer than 3 numbers", () => {
    expect(parseHsl("hsl(0, 100%)")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(parseHsl("not a color")).toBeNull();
  });

  it("parses with negative hue", () => {
    const result = parseHsl("hsl(-30, 100%, 50%)");
    expect(result).not.toBeNull();
  });
});

describe("parseHsvStr", () => {
  it("parses hsv() string", () => {
    expect(parseHsvStr("hsv(0, 100%, 100%)")).toMatchObject({ h: 0, s: 100, v: 100 });
  });

  it("parses hsva() with alpha", () => {
    const result = parseHsvStr("hsva(0, 100%, 100%, 0.5)");
    expect(result?.a).toBe(50);
  });

  it("returns null when fewer than 3 numbers", () => {
    expect(parseHsvStr("hsv(0, 100%)")).toBeNull();
  });

  it("returns null when s > 100", () => {
    expect(parseHsvStr("hsv(0, 110%, 100%)")).toBeNull();
  });

  it("returns null when s < 0", () => {
    expect(parseHsvStr("hsv(0, -10%, 100%)")).toBeNull();
  });

  it("returns null when v > 100", () => {
    expect(parseHsvStr("hsv(0, 100%, 110%)")).toBeNull();
  });

  it("returns null when v < 0", () => {
    expect(parseHsvStr("hsv(0, 100%, -10%)")).toBeNull();
  });

  it("normalizes hue > 360 with modulo", () => {
    expect(parseHsvStr("hsv(370, 100%, 100%)")?.h).toBe(10);
  });

  it("normalizes negative hue to positive", () => {
    expect(parseHsvStr("hsv(-10, 100%, 100%)")?.h).toBe(350);
  });
});

describe("parseOklch", () => {
  it("parses oklch() with decimal lightness", () => {
    const result = parseOklch("oklch(0.627 0.257 29)");
    expect(result).not.toBeNull();
  });

  it("parses oklch() with percentage lightness", () => {
    const result = parseOklch("oklch(62.7% 0.257 29)");
    expect(result).not.toBeNull();
  });

  it("parses oklch() with alpha", () => {
    const result = parseOklch("oklch(0.627 0.257 29 / 0.5)");
    expect(result?.a).toBe(50);
  });

  it("returns null when fewer than 3 values", () => {
    expect(parseOklch("oklch(0.627 0.257)")).toBeNull();
  });

  it("returns null when l > 1 (decimal)", () => {
    expect(parseOklch("oklch(1.5 0.257 29)")).toBeNull();
  });

  it("returns null when l < 0", () => {
    expect(parseOklch("oklch(-0.1 0.257 29)")).toBeNull();
  });

  it("returns null when c < 0", () => {
    expect(parseOklch("oklch(0.5 -0.1 29)")).toBeNull();
  });

  it("round-trips with formatOklch", () => {
    const original = { h: 120, s: 60, v: 80 };
    const formatted = formatOklch(original);
    const parsed = parseOklch(formatted);
    expect(parsed).not.toBeNull();
  });
});
