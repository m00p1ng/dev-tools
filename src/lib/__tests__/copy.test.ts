import { afterEach, expect, it, vi } from "vitest";
import { copyToClipboard } from "@/lib/copy";

afterEach(() => vi.unstubAllGlobals());

it("calls navigator.clipboard.writeText with the given text", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  await copyToClipboard("hello");
  expect(writeText).toHaveBeenCalledWith("hello");
});
