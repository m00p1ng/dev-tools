import { describe, expect, it } from "vitest";
import { errorMessage } from "@/lib/tool-logic/result";

describe("result helpers", () => {
  it("returns the Error message when given an Error instance", () => {
    expect(errorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("returns fallback for non-Error values", () => {
    expect(errorMessage("string error", "fallback")).toBe("fallback");
    expect(errorMessage(42, "fallback")).toBe("fallback");
    expect(errorMessage(null, "fallback")).toBe("fallback");
    expect(errorMessage(undefined, "fallback")).toBe("fallback");
  });
});
