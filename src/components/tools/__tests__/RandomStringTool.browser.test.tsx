import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { RandomStringTool } from "./RandomStringTool";

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
