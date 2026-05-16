import { describe, expect, it } from "vitest";
import {
  base64urlEncode,
  decodeJwtToken,
  generateHashes,
  signHS256,
  verifyHS256,
} from "@/lib/tool-logic/security";

describe("security helpers", () => {
  it("generates known hash vectors", () => {
    const hex = generateHashes("hello", "hex");
    expect(hex["MD5"]).toBe("5d41402abc4b2a76b9719d911017c592");
    expect(hex["SHA-1"]).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
    expect(hex["SHA-256"]).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    expect(generateHashes("hello", "base64")["MD5"]).toBe("XUFAKrxLKna5cZ2REBfFkg==");
  });

  it("decodes JWT metadata and expiration", async () => {
    const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64urlEncode(JSON.stringify({ sub: "123", exp: 2000 }));
    const signingInput = `${header}.${payload}`;
    const signature = await signHS256(signingInput, "secret", false);
    const token = `${signingInput}.${signature}`;

    expect(decodeJwtToken(token, 1000)).toMatchObject({
      ok: true,
      value: { algorithm: "HS256", isExpired: false, signature },
    });
    expect(decodeJwtToken(token, 2_001_000)).toMatchObject({
      ok: true,
      value: { isExpired: true },
    });
  });

  it("verifies and rejects HS256 signatures", async () => {
    const header = base64urlEncode(JSON.stringify({ alg: "HS256" }));
    const payload = base64urlEncode(JSON.stringify({ sub: "123" }));
    const signingInput = `${header}.${payload}`;
    const token = `${signingInput}.${await signHS256(signingInput, "secret", false)}`;

    await expect(verifyHS256(token, "secret", false)).resolves.toBe(true);
    await expect(verifyHS256(token, "wrong", false)).resolves.toBe(false);
    expect(decodeJwtToken("not-a-token")).toEqual({ ok: false, error: "Invalid JWT" });
  });
});
