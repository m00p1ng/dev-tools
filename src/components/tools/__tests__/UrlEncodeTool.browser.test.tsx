import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { UrlEncodeTool } from "../UrlEncodeTool";

beforeEach(() => localStorage.clear());

function outputText() {
  return document.querySelector("pre")?.textContent ?? "";
}

test("Example button fills input with URL", async () => {
  const screen = await render(<UrlEncodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(
    screen.getByPlaceholder("Input text or encoded string... or drop a file"),
  ).toHaveValue("https://example.com/search?q=hello world&lang=en");
});

test("Encode mode percent-encodes special characters", async () => {
  const screen = await render(<UrlEncodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.poll(outputText).toContain("%20");
});

test("switching to Decode adopts encoded output into input", async () => {
  const screen = await render(<UrlEncodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.poll(outputText).toContain("%20");
  const outputBefore = outputText();
  await screen.getByRole("button", { name: "Decode" }).click();
  await expect.element(
    screen.getByPlaceholder("Input text or encoded string... or drop a file"),
  ).toHaveValue(outputBefore);
});
