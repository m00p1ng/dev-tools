import { describe, expect, it } from "vitest";
import { emptyPixelDataUrl, resolveSvgDimensions } from "@/lib/tool-logic/media";

describe("media helpers", () => {
  it("returns the transparent pixel data URL", () => {
    expect(emptyPixelDataUrl()).toBe("data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=");
  });

  it("resolves SVG dimensions from width and height", () => {
    const svg = {
      getAttribute: (name: string) => ({ width: "320", height: "240", viewBox: null })[name] ?? null,
    } as SVGElement;
    expect(resolveSvgDimensions(svg)).toEqual({ width: 320, height: 240 });
  });

  it("falls back to viewBox dimensions", () => {
    const svg = {
      getAttribute: (name: string) => ({ width: null, height: null, viewBox: "0 0 640 480" })[name] ?? null,
    } as SVGElement;
    expect(resolveSvgDimensions(svg)).toEqual({ width: 640, height: 480 });
  });

  it("falls back to 800x600 when all attributes are missing", () => {
    const svg = {
      getAttribute: () => null,
    } as SVGElement;
    expect(resolveSvgDimensions(svg)).toEqual({ width: 800, height: 600 });
  });

  it("uses viewBox with comma-separated values", () => {
    const svg = {
      getAttribute: (name: string) => ({ width: null, height: null, viewBox: "0,0,1024,768" })[name] ?? null,
    } as SVGElement;
    expect(resolveSvgDimensions(svg)).toEqual({ width: 1024, height: 768 });
  });
});
