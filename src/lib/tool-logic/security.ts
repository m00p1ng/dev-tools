import CryptoJS from "crypto-js";
import { jwtDecode } from "jwt-decode";
import type { ToolResult } from "@/lib/tool-logic/result";

export const HASH_ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;
export type HashAlgo = typeof HASH_ALGOS[number];
export type HashEncoding = "hex" | "base64";

export interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: string | null;
  algorithm: string;
}

export function base64urlToBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

export function base64urlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function generateHashes(input: string, encoding: HashEncoding): Record<HashAlgo, string> {
  const results = {} as Record<HashAlgo, string>;
  for (const algo of HASH_ALGOS) {
    const wordArray = (() => {
      switch (algo) {
        case "MD5": return CryptoJS.MD5(input);
        case "SHA-1": return CryptoJS.SHA1(input);
        case "SHA-256": return CryptoJS.SHA256(input);
        case "SHA-512": return CryptoJS.SHA512(input);
      }
    })();
    results[algo] = encoding === "base64"
      ? wordArray.toString(CryptoJS.enc.Base64)
      : wordArray.toString(CryptoJS.enc.Hex);
  }
  return results;
}

export function decodeJwtToken(token: string, now = Date.now()): ToolResult<JwtParts> {
  try {
    const header = jwtDecode<Record<string, unknown>>(token, { header: true });
    const payload = jwtDecode<Record<string, unknown>>(token);
    const signature = token.split(".")[2] ?? "";
    const exp = typeof payload.exp === "number" ? payload.exp : null;
    const isExpired = exp !== null ? exp * 1000 < now : false;
    const expiresAt = exp ? new Date(exp * 1000).toLocaleString() : null;
    const algorithm = typeof header.alg === "string" ? header.alg : "unknown";
    return { ok: true, value: { header, payload, signature, isExpired, expiresAt, algorithm } };
  } catch {
    return { ok: false, error: "Invalid JWT" };
  }
}

export async function verifyHS256(token: string, secret: string, isBase64url: boolean): Promise<boolean> {
  try {
    const [header, payload, sig] = token.split(".");
    if (!header || !payload || !sig) return false;
    const keyBytes = isBase64url ? base64urlToBytes(secret) : new TextEncoder().encode(secret) as Uint8Array<ArrayBuffer>;
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    return crypto.subtle.verify("HMAC", key, base64urlToBytes(sig), new TextEncoder().encode(`${header}.${payload}`) as Uint8Array<ArrayBuffer>);
  } catch {
    return false;
  }
}

export async function signHS256(signingInput: string, secret: string, isBase64url: boolean): Promise<string> {
  const keyBytes = isBase64url ? base64urlToBytes(secret) : new TextEncoder().encode(secret) as Uint8Array<ArrayBuffer>;
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
