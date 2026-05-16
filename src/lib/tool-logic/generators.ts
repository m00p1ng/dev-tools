export const RANDOM_CHARSET = {
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

export type RandomCharsetKey = keyof typeof RANDOM_CHARSET;
export type RandomOptions = Record<RandomCharsetKey, boolean>;

export function clampNumber(value: string | number, min: number, max: number, fallback = min): number {
  const number = typeof value === "number" ? value : Number(value);
  return Math.max(min, Math.min(max, Number.isNaN(number) ? fallback : number));
}

export function buildRandomCharset(options: RandomOptions): string {
  return (Object.keys(options) as RandomCharsetKey[])
    .filter((key) => options[key])
    .map((key) => RANDOM_CHARSET[key])
    .join("");
}

export function randomChar(charset: string, rand: number): string {
  return charset[rand % charset.length];
}

export function generateRandomString(length: number, charset: string, symbolCharset: string | null, randomBytes?: Uint8Array): string {
  if (!charset) return "";
  const rands = randomBytes ?? crypto.getRandomValues(new Uint8Array(length + 4));

  if (!symbolCharset || length < 2) {
    return Array.from(rands.slice(0, length), (b) => randomChar(charset, b)).join("");
  }

  const escapedSymbols = symbolCharset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nonSymbol = charset.replace(new RegExp(`[${escapedSymbols}]`, "g"), "");
  const minSymbols = Math.max(1, Math.floor(length * 0.1));
  const maxSymbols = Math.max(minSymbols, Math.floor(length * 0.2));
  const symbolCount = minSymbols + (rands[length] % (maxSymbols - minSymbols + 1));

  const chars: string[] = [
    ...Array.from({ length: symbolCount }, (_, i) => randomChar(symbolCharset, rands[i])),
    ...Array.from({ length: length - symbolCount }, (_, i) => randomChar(nonSymbol || charset, rands[symbolCount + i])),
  ];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = rands[i % rands.length] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

let objectIdCounter = Math.floor(Math.random() * 0xffffff);

export function generateObjectId(now = Date.now(), randomBytes?: Uint8Array): string {
  const ts = Math.floor(now / 1000).toString(16).padStart(8, "0");
  const bytes = randomBytes ?? crypto.getRandomValues(new Uint8Array(5));
  const rnd = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  objectIdCounter = (objectIdCounter + 1) & 0xffffff;
  return ts + rnd + objectIdCounter.toString(16).padStart(6, "0");
}
