import { describe, expect, it } from "vitest";
import {
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
  });
});
