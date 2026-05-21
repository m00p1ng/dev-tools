import { describe, expect, it, vi } from "vitest";
import {
  decodeBase64,
  encodeBase64,
  escapeBackslash,
  transformBackslash,
  transformBase64,
  transformUrlComponent,
  unescapeBackslash,
} from "@/lib/tool-logic/encoding";

describe("encoding helpers", () => {
  it("round-trips unicode Base64", () => {
    const encoded = transformBase64("Hello, 世界", "encode");
    expect(encoded).toEqual({ ok: true, value: "SGVsbG8sIOS4lueVjA==" });

    const decoded = transformBase64(encoded.ok ? encoded.value : "", "decode");
    expect(decoded).toEqual({ ok: true, value: "Hello, 世界" });
  });

  it("reports invalid Base64", () => {
    expect(transformBase64("not base64%", "decode")).toEqual({ ok: false, error: "Invalid Base64 string" });
  });

  it("encodes and decodes URL components", () => {
    const encoded = transformUrlComponent("hello world & ไทย", "encode");
    expect(encoded).toEqual({ ok: true, value: "hello%20world%20%26%20%E0%B9%84%E0%B8%97%E0%B8%A2" });
    expect(transformUrlComponent(encoded.ok ? encoded.value : "", "decode")).toEqual({ ok: true, value: "hello world & ไทย" });
  });

  it("reports malformed URL escapes", () => {
    expect(transformUrlComponent("%E0%A4%A", "decode")).toEqual({ ok: false, error: "Invalid encoded string" });
  });

  it("escapes and unescapes common backslash sequences", () => {
    const raw = 'Hello "World"\r\nNew line\tTabbed\\Slash';
    const escaped = 'Hello \\"World\\"\\r\\nNew line\\tTabbed\\\\Slash';
    expect(escapeBackslash(raw)).toBe(escaped);
    expect(unescapeBackslash(escaped)).toBe(raw);
    expect(transformBackslash(raw, "escape")).toBe(escaped);
    expect(transformBackslash(escaped, "unescape")).toBe(raw);
  });

  it("returns empty for empty inputs", () => {
    expect(transformBase64("", "encode")).toEqual({ ok: true, value: "" });
    expect(transformBase64("", "decode")).toEqual({ ok: true, value: "" });
    expect(transformUrlComponent("", "encode")).toEqual({ ok: true, value: "" });
    expect(transformUrlComponent("", "decode")).toEqual({ ok: true, value: "" });
    expect(transformBackslash("", "escape")).toBe("");
    expect(transformBackslash("", "unescape")).toBe("");
  });

  it("encodeBase64 and decodeBase64 are inverses for ASCII", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
    expect(decodeBase64("aGVsbG8=")).toBe("hello");
  });

  it("returns Encoding failed for URL encode with lone surrogate", () => {
    // lone high surrogate causes encodeURIComponent to throw
    const loneHighSurrogate = String.fromCharCode(0xd800);
    const result = transformUrlComponent(loneHighSurrogate, "encode");
    expect(result).toEqual({ ok: false, error: "Encoding failed" });
  });

  it("returns Encoding failed when Base64 encoding throws", () => {
    const btoaSpy = vi.spyOn(globalThis, "btoa").mockImplementation(() => {
      throw new Error("boom");
    });
    expect(transformBase64("hello", "encode")).toEqual({ ok: false, error: "Encoding failed" });
    btoaSpy.mockRestore();
  });
});
