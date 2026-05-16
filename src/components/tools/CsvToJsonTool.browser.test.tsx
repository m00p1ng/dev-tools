import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CsvToJsonTool } from "./CsvToJsonTool";

beforeEach(() => localStorage.clear());

test("shows First row as header switch", async () => {
  const screen = await render(<CsvToJsonTool />);
  await expect.element(screen.getByText("First row as header")).toBeVisible();
});

test("Example button fills input with CSV data", async () => {
  const screen = await render(<CsvToJsonTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("name,age\nAlice,30\nBob,25")).toHaveValue(
    expect.stringContaining("Alice"),
  );
});

test("header switch is toggleable", async () => {
  const screen = await render(<CsvToJsonTool />);
  const sw = screen.getByRole("switch");
  await expect.element(sw).toHaveAttribute("aria-checked", "true");
  await sw.click();
  await expect.element(sw).toHaveAttribute("aria-checked", "false");
});
