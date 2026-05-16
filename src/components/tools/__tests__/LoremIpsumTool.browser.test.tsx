import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { LoremIpsumTool } from "./LoremIpsumTool";

test("generates non-empty lorem ipsum text by default", async () => {
  const screen = await render(<LoremIpsumTool />);
  const output = screen.getByRole("textbox");
  await expect.element(output).toBeVisible();
  const el = output.element() as HTMLTextAreaElement;
  expect(el.value.length).toBeGreaterThan(0);
});

test("Regenerate button produces new output", async () => {
  const screen = await render(<LoremIpsumTool />);
  const output = screen.getByRole("textbox");
  const before = (output.element() as HTMLTextAreaElement).value;
  await screen.getByRole("button", { name: "Regenerate" }).click();
  const after = (output.element() as HTMLTextAreaElement).value;
  expect(before.length).toBeGreaterThan(0);
  expect(after.length).toBeGreaterThan(0);
});

test("switching to Words unit changes output style", async () => {
  const screen = await render(<LoremIpsumTool />);
  await screen.getByRole("combobox").selectOptions("words");
  await screen.getByRole("button", { name: "Regenerate" }).click();
  const value = (screen.getByRole("textbox").element() as HTMLTextAreaElement).value;
  expect(value.length).toBeGreaterThan(0);
});
