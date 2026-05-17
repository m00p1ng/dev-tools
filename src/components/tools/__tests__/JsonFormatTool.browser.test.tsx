import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { JsonFormatTool } from "../JsonFormatTool";

beforeEach(() => localStorage.clear());

test("Example button fills input with JSON", async () => {
  const screen = await render(<JsonFormatTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Paste JSON here... or drop a file")).toHaveValue(
    expect.stringContaining("Alice"),
  );
});

test("Format mode produces multi-line JSON output", async () => {
  const screen = await render(<JsonFormatTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  let code = "";
  await vi.waitFor(() => {
    code = document.querySelector("pre")?.textContent ?? "";
    const contentLines = code.split("\n").filter((l) => l.trim());
    expect(contentLines.length).toBeGreaterThan(1);
  });
  expect(code).toContain("name");
});

test("Minify mode produces single-line JSON output", async () => {
  const screen = await render(<JsonFormatTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByRole("button", { name: "Minify" }).click();
  let code = "";
  await vi.waitFor(() => {
    code = document.querySelector("pre")?.textContent ?? "";
    const contentLines = code.split("\n").filter((l) => l.trim());
    expect(contentLines.length).toBe(1);
  });
  expect(code).toContain("name");
});

test("valid JSON does not show Auto-repaired badge", async () => {
  const screen = await render(<JsonFormatTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  expect(screen.getByText("Auto-repaired").query()).toBeNull();
});

test("repairable JSON shows Auto-repaired badge", async () => {
  const screen = await render(<JsonFormatTool />);
  // Trailing comma is a common auto-repaired case
  await screen.getByPlaceholder("Paste JSON here... or drop a file").fill('{"a":1,}');
  await expect.element(screen.getByText("Auto-repaired")).toBeVisible();
});
