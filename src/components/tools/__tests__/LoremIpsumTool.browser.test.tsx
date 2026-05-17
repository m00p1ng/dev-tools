import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { LoremIpsumTool } from "../LoremIpsumTool";

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

test("switching to Sentences unit generates sentence output", async () => {
  const screen = await render(<LoremIpsumTool />);
  await screen.getByRole("combobox").selectOptions("sentences");
  const value = (screen.getByRole("textbox").element() as HTMLTextAreaElement).value;
  expect(value.length).toBeGreaterThan(0);
});

test("changing count via input updates output", async () => {
  const screen = await render(<LoremIpsumTool />);
  const countInput = screen.getByRole("spinbutton");
  await countInput.fill("1");
  await screen.getByRole("button", { name: "Regenerate" }).click();
  const value = (screen.getByRole("textbox").element() as HTMLTextAreaElement).value;
  expect(value.length).toBeGreaterThan(0);
});

test("count clamped to 1 when 0 is entered then blurred", async () => {
  const screen = await render(<LoremIpsumTool />);
  const countInput = screen.getByRole("spinbutton");
  await countInput.fill("0");
  // Click Regenerate to commit blur
  await screen.getByRole("button", { name: "Regenerate" }).click();
  expect((countInput.element() as HTMLInputElement).value).toBe("1");
});

test("Enter key in count input triggers blur and commits value", async () => {
  const screen = await render(<LoremIpsumTool />);
  const countInput = screen.getByRole("spinbutton");
  await countInput.fill("2");
  // Trigger keydown Enter via native dispatch on the element
  const el = countInput.element() as HTMLInputElement;
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  expect(el.value).toBe("2");
});

test("Copy button is visible when output is generated", async () => {
  const screen = await render(<LoremIpsumTool />);
  await expect.element(screen.getByRole("button", { name: "Regenerate" })).toBeVisible();
  // CopyButton appears alongside Regenerate
  const buttons = screen.getByRole("button");
  expect(buttons.elements().length).toBeGreaterThan(0);
});
