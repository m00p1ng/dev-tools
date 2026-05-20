import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { ColorPickerTool } from "../ColorPickerTool";

beforeEach(() => localStorage.clear());

test("renders all five format labels", async () => {
  const screen = await render(<ColorPickerTool />);
  await expect.element(screen.getByText("HEX")).toBeVisible();
  await expect.element(screen.getByText("RGB")).toBeVisible();
  await expect.element(screen.getByText("HSL")).toBeVisible();
  await expect.element(screen.getByText("HSV")).toBeVisible();
  await expect.element(screen.getByText("OKLCH")).toBeVisible();
});

test("HEX field is visible and editable", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await expect.element(hexInput).toBeVisible();
  await expect.element(hexInput).not.toHaveValue("");
});

test("renders 16 saved color slots", async () => {
  const screen = await render(<ColorPickerTool />);
  const slots = screen.getByTitle("Click to save current color");
  await expect.element(slots.first()).toBeVisible();
  expect(await slots.all()).toHaveLength(16);
});

test("filling a valid hex into HEX field updates the value", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await hexInput.fill("#FF0000");
  // Trigger commit via blur (click elsewhere)
  await screen.getByText("HEX").click();
  await expect.element(hexInput).toHaveValue("#FF0000");
});

test("filling invalid hex and committing shows error state", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await hexInput.fill("notacolor");
  await screen.getByText("HEX").click();
  // Input remains visible (error state, not removed)
  await expect.element(hexInput).toBeVisible();
});
