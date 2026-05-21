import { describe, expect, it } from "vitest";
import {
  base64urlEncode,
  base64urlToBytes,
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

  it("verifies HS256 with base64url-encoded secret", async () => {
    const header = base64urlEncode(JSON.stringify({ alg: "HS256" }));
    const payload = base64urlEncode(JSON.stringify({ sub: "456" }));
    const signingInput = `${header}.${payload}`;
    const b64urlSecret = base64urlEncode("myrawsecret");
    const token = `${signingInput}.${await signHS256(signingInput, b64urlSecret, true)}`;

    await expect(verifyHS256(token, b64urlSecret, true)).resolves.toBe(true);
    await expect(verifyHS256(token, b64urlSecret, false)).resolves.toBe(false);
  });

  it("rejects malformed tokens in verifyHS256", async () => {
    await expect(verifyHS256("onlyone", "secret", false)).resolves.toBe(false);
    await expect(verifyHS256("", "secret", false)).resolves.toBe(false);
  });

  it("decodes JWT with no exp field", async () => {
    const header = base64urlEncode(JSON.stringify({ alg: "HS256" }));
    const payload = base64urlEncode(JSON.stringify({ sub: "no-exp" }));
    const signingInput = `${header}.${payload}`;
    const token = `${signingInput}.${await signHS256(signingInput, "secret", false)}`;

    const result = decodeJwtToken(token);
    expect(result).toMatchObject({ ok: true, value: { isExpired: false, expiresAt: null } });
  });

  it("generates SHA-512 hex hash for known input", () => {
    expect(generateHashes("hello", "hex")["SHA-512"]).toBe(
      "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
    );
  });

  it("decodes a 2-part token (no signature) — covers ?? '' fallback", () => {
    const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64urlEncode(JSON.stringify({ sub: "test" }));
    const result = decodeJwtToken(`${header}.${payload}`);
    // jwtDecode succeeds with 2 parts; [2] is undefined → ?? "" → signature=""
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.signature).toBe("");
  });

  it("decodes a token with no alg field — covers 'unknown' fallback", () => {
    const header = base64urlEncode(JSON.stringify({ typ: "JWT" }));
    const payload = base64urlEncode(JSON.stringify({ sub: "test" }));
    const result = decodeJwtToken(`${header}.${payload}.fakesig`);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.algorithm).toBe("unknown");
  });

  it("base64urlToBytes round-trips with base64urlEncode", () => {
    const original = "hello world";
    const encoded = base64urlEncode(original);
    const bytes = base64urlToBytes(encoded);
    expect(new TextDecoder().decode(bytes)).toBe(original);
  });

  it("verifyHS256 returns false when sig contains invalid base64 (triggers catch)", async () => {
    // "!!!" is not valid base64 → atob throws → catch → return false
    await expect(verifyHS256("aGVsbG8=.aGVsbG8=.!!!invalid!!!", "secret", false)).resolves.toBe(false);
  });
});
