import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CodeBlock } from "../code-block";

beforeEach(() => {
  document.documentElement.classList.remove("dark");
});

test("renders code in light mode", async () => {
  const screen = await render(<CodeBlock code="const x = 1;" language="javascript" />);
  await expect.element(screen.getByText(/const x/)).toBeVisible();
});

test("renders placeholder when code is empty", async () => {
  const screen = await render(<CodeBlock code="" language="text" placeholder="No output yet" />);
  await expect.element(screen.getByText("No output yet")).toBeVisible();
});

test("renders code in dark mode", async () => {
  document.documentElement.classList.add("dark");
  const screen = await render(<CodeBlock code="const x = 1;" language="javascript" />);
  await expect.element(screen.getByText(/const x/)).toBeVisible();
  document.documentElement.classList.remove("dark");
});
