import CryptoJS from "crypto-js";

export const HASH_ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;
export type HashAlgo = typeof HASH_ALGOS[number];
export type HashEncoding = "hex" | "base64";

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

export type { JwtParts } from "./jwt";
export { base64urlToBytes, base64urlEncode, decodeJwtToken, verifyHS256, signHS256 } from "./jwt";
