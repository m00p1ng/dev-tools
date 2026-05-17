import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("drops falsy values", () => {
    const includeBar = Boolean("");
    expect(cn("foo", includeBar && "bar", undefined, null, "baz")).toBe("foo baz");
  });

  it("resolves tailwind conflicts — last wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles object syntax", () => {
    expect(cn({ active: true, hidden: false })).toBe("active");
  });

  it("handles array syntax", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("returns empty string with no arguments", () => {
    expect(cn()).toBe("");
  });
});
