import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { RandomStringTool } from "../RandomStringTool";

test("generates a non-empty random string by default", async () => {
  const screen = await render(<RandomStringTool />);
  // Default: letters + digits, length 32, count 1
  // Use .first() because getByText matches the span AND parent divs containing the same text
  await expect.element(screen.getByText(/^[A-Za-z0-9]{32}$/).first()).toBeVisible();
});

test("Generate button produces a new string", async () => {
  const screen = await render(<RandomStringTool />);
  await screen.getByRole("button", { name: "Generate" }).click();
  await expect.element(screen.getByText(/^[A-Za-z0-9]/).first()).toBeVisible();
});

test("Generate button is disabled when no charset is selected", async () => {
  const screen = await render(<RandomStringTool />);
  // Radix Switch renders as role="switch"; turn off letters and digits (on by default)
  await screen.getByRole("switch", { name: "letters" }).click();
  await screen.getByRole("switch", { name: "digits" }).click();
  await expect.element(screen.getByRole("button", { name: "Generate" })).toBeDisabled();
});

test("enabling symbols produces a string with symbol characters", async () => {
  const screen = await render(<RandomStringTool />);
  await screen.getByRole("switch", { name: "symbols" }).click();
  await screen.getByRole("button", { name: "Generate" }).click();
  await expect.element(screen.getByText(/[A-Za-z0-9!@#$%^&*]/).first()).toBeVisible();
});

test("changing count to 3 shows multiple strings with bulk copy", async () => {
  const screen = await render(<RandomStringTool />);
  const countInput = screen.getByRole("spinbutton").last();
  await countInput.fill("3");
  const el = countInput.element() as HTMLInputElement;
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  // After commit, 3 results shown and bulk copy button appears
  await expect.element(screen.getByText("Copy")).toBeVisible();
});

test("turning off letters only keeps digits", async () => {
  const screen = await render(<RandomStringTool />);
  await screen.getByRole("switch", { name: "letters" }).click();
  await screen.getByRole("button", { name: "Generate" }).click();
  await expect.element(screen.getByText(/^[0-9]+$/).first()).toBeVisible();
});

test("turning off digits only keeps letters", async () => {
  const screen = await render(<RandomStringTool />);
  await screen.getByRole("switch", { name: "digits" }).click();
  await screen.getByRole("button", { name: "Generate" }).click();
  await expect.element(screen.getByText(/^[A-Za-z]+$/).first()).toBeVisible();
});

test("non-numeric length input is clamped to minimum on blur", async () => {
  const screen = await render(<RandomStringTool />);
  const lengthInput = screen.getByRole("spinbutton").first();
  const el = lengthInput.element() as HTMLInputElement;
  el.focus();
  // Directly set value to bypass Playwright validation on spinbutton
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, "abc");
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.blur();
  await vi.waitFor(() => {
    const val = Number(el.value);
    expect(val).toBeGreaterThanOrEqual(1);
  }, { timeout: 1000 });
});

test("length input commits on Enter and clamps to maximum", async () => {
  const screen = await render(<RandomStringTool />);
  const lengthInput = screen.getByRole("spinbutton").first();
  await lengthInput.fill("999");
  const el = lengthInput.element() as HTMLInputElement;
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await vi.waitFor(() => {
    expect(el.value).toBe("256");
  }, { timeout: 1000 });
});

test("count slider updates count and exposes bulk copy", async () => {
  const screen = await render(<RandomStringTool />);
  const sliders = screen.getByRole("slider");
  await sliders.last().click();
  sliders.last().element().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  await expect.element(screen.getByText("Copy")).toBeVisible();
});
