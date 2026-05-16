import { describe, expect, it } from "vitest";
import { getClaimDisplay, syntaxHighlight } from "./jwt-format";

describe("jwt-format", () => {
  it("escapes HTML before applying JSON syntax highlighting", () => {
    const highlighted = syntaxHighlight(JSON.stringify({ tag: "<script>", amp: "&" }, null, 2));

    expect(highlighted).toContain("&lt;script&gt;");
    expect(highlighted).toContain("&amp;");
    expect(highlighted).not.toContain("<script>");
  });

  it("highlights keys, strings, booleans, nulls, and numbers", () => {
    const highlighted = syntaxHighlight(
      JSON.stringify({ name: "Jane", admin: false, age: 42, missing: null }, null, 2),
    );

    expect(highlighted).toContain('<span class="text-blue-300">"name":</span>');
    expect(highlighted).toContain('<span class="text-green-400">"Jane"</span>');
    expect(highlighted).toContain('<span class="text-purple-400">false</span>');
    expect(highlighted).toContain('<span class="text-orange-400">42</span>');
    expect(highlighted).toContain('<span class="text-gray-400">null</span>');
  });

  it("formats numeric registered date claims as local dates", () => {
    expect(getClaimDisplay("iat", 0)).toBe(new Date(0).toLocaleString());
    expect(getClaimDisplay("nbf", 60)).toBe(new Date(60_000).toLocaleString());
    expect(getClaimDisplay("exp", 120)).toBe(new Date(120_000).toLocaleString());
  });

  it("serializes non-date claims with JSON.stringify", () => {
    expect(getClaimDisplay("sub", "123")).toBe('"123"');
    expect(getClaimDisplay("roles", ["admin"])).toBe('["admin"]');
    expect(getClaimDisplay("metadata", { plan: "pro" })).toBe('{"plan":"pro"}');
    expect(getClaimDisplay("exp", "not-a-number")).toBe('"not-a-number"');
  });
});
