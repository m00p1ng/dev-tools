import { colord } from "colord";

export interface Hsv { h: number; s: number; v: number; a?: number }
export interface Rgb { r: number; g: number; b: number; a?: number }

function getAlpha(hsv: Hsv): number { return hsv.a ?? 100; }

// HSV ↔ derived formats via colord
export function hsvToHex({ h, s, v }: Hsv): string {
  return colord({ h, s, v }).toHex();
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const { r, g, b } = colord({ h, s, v }).toRgb();
  return { r, g, b };
}

export function hsvToHsl({ h, s, v }: Hsv): { h: number; s: number; l: number } {
  const { h: hh, s: ss, l } = colord({ h, s, v }).toHsl();
  return { h: hh, s: ss, l };
}

export function rgbToHsv({ r, g, b, a }: Rgb): Hsv {
  const { h, s, v } = colord({ r, g, b }).toHsv();
  return { h, s, v, a };
}

// OKLCH — manual conversion (colord has no OKLCH plugin)
function linearize(c: number): number {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function delinearize(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function rgbToOklch({ r, g, b }: Rgb): { l: number; c: number; h: number } {
  const lr = linearize(r), lg = linearize(g), lb = linearize(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bk = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const C = Math.sqrt(a * a + bk * bk);
  const hDeg = Math.atan2(bk, a) * 180 / Math.PI;
  return { l: L, c: C, h: hDeg < 0 ? hDeg + 360 : hDeg };
}

export function oklchToRgb({ l: L, c: C, h: H }: { l: number; c: number; h: number }): Rgb {
  const hRad = H * Math.PI / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
  const r = delinearize(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = delinearize(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bv = delinearize(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
  return {
    r: Math.round(Math.max(0, Math.min(255, r * 255))),
    g: Math.round(Math.max(0, Math.min(255, g * 255))),
    b: Math.round(Math.max(0, Math.min(255, bv * 255))),
  };
}

// Format display strings
export function formatHex(hsv: Hsv): string {
  const hex = hsvToHex(hsv).toUpperCase();
  const a = getAlpha(hsv);
  if (a >= 100) return hex;
  const aa = Math.round((a / 100) * 255).toString(16).padStart(2, "0").toUpperCase();
  return hex + aa;
}

export function formatRgb(hsv: Hsv): string {
  const { r, g, b } = hsvToRgb(hsv);
  const a = getAlpha(hsv);
  if (a >= 100) return `rgb(${r}, ${g}, ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${(a / 100).toFixed(2)})`;
}

export function formatHsl(hsv: Hsv): string {
  const { h, s, l } = hsvToHsl(hsv);
  const a = getAlpha(hsv);
  if (a >= 100) return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${(a / 100).toFixed(2)})`;
}

export function formatHsv({ h, s, v, a: rawA }: Hsv): string {
  const a = rawA ?? 100;
  if (a >= 100) return `hsv(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(v)}%)`;
  return `hsva(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(v)}%, ${(a / 100).toFixed(2)})`;
}

export function formatOklch(hsv: Hsv): string {
  const { l, c, h } = rgbToOklch(hsvToRgb(hsv));
  const a = getAlpha(hsv);
  if (a >= 100) return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${Math.round(h)})`;
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${Math.round(h)} / ${(a / 100).toFixed(2)})`;
}

// Parse strings → Rgb or Hsv
export function parseHex(str: string): Rgb | null {
  const s = str.trim();
  const normalized = s.startsWith("#") ? s : "#" + s;
  const c = colord(normalized);
  if (!c.isValid()) return null;
  const { r, g, b } = c.toRgb();
  const hex = normalized.replace("#", "");
  if (hex.length === 8) {
    const a = Math.round((parseInt(hex.slice(6, 8), 16) / 255) * 100);
    return { r, g, b, a };
  }
  return { r, g, b };
}

export function parseRgb(str: string): Rgb | null {
  const nums = str.match(/\d+(\.\d+)?/g)?.map(Number);
  if (!nums || nums.length < 3) return null;
  const [r, g, b] = nums;
  if (r > 255 || g > 255 || b > 255) return null;
  const a = nums.length >= 4 ? Math.round(Math.min(1, Math.max(0, nums[3])) * 100) : undefined;
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a };
}

export function parseHsl(str: string): Rgb | null {
  const nums = str.match(/-?\d+(\.\d+)?/g)?.map(Number);
  if (!nums || nums.length < 3) return null;
  const [h, s, l] = nums;
  const c = colord({ h, s, l });
  if (!c.isValid()) return null;
  const { r, g, b } = c.toRgb();
  const a = nums.length >= 4 ? Math.round(Math.min(1, Math.max(0, nums[3])) * 100) : undefined;
  return { r, g, b, a };
}

export function parseHsvStr(str: string): Hsv | null {
  const nums = str.match(/-?\d+(\.\d+)?/g)?.map(Number);
  if (!nums || nums.length < 3) return null;
  const [h, s, v] = nums;
  if (s < 0 || s > 100 || v < 0 || v > 100) return null;
  const a = nums.length >= 4 ? Math.round(Math.min(1, Math.max(0, nums[3])) * 100) : undefined;
  return { h: ((h % 360) + 360) % 360, s, v, a };
}

export function parseOklch(str: string): Rgb | null {
  const nums = str.match(/-?\d+(\.\d+)?%?/g);
  if (!nums || nums.length < 3) return null;
  const lRaw = nums[0];
  const l = lRaw.endsWith("%") ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
  const c = parseFloat(nums[1]);
  const h = parseFloat(nums[2]);
  if (isNaN(l) || isNaN(c) || isNaN(h) || l < 0 || l > 1 || c < 0) return null;
  const a = nums.length >= 4 ? Math.round(Math.min(1, Math.max(0, parseFloat(nums[3]))) * 100) : undefined;
  return { ...oklchToRgb({ l, c, h }), a };
}
