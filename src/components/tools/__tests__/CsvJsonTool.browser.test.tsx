import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CsvJsonTool } from "../CsvJsonTool";

beforeEach(() => localStorage.clear());

test("starts in CSV → JSON mode", async () => {
  const screen = await render(<CsvJsonTool />);
  await expect.element(screen.getByRole("button", { name: "CSV" })).toHaveAttribute("data-variant", "default");
});

test("shows Header switch in csv-to-json mode", async () => {
  const screen = await render(<CsvJsonTool />);
  await expect.element(screen.getByText("Header")).toBeVisible();
});

test("header switch is toggleable", async () => {
  const screen = await render(<CsvJsonTool />);
  const sw = screen.getByRole("switch");
  await expect.element(sw).toHaveAttribute("aria-checked", "true");
  await sw.click();
  await expect.element(sw).toHaveAttribute("aria-checked", "false");
});

test("Example in csv-to-json mode fills with CSV data", async () => {
  const screen = await render(<CsvJsonTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  const textarea = screen.getByPlaceholder("name,age\nAlice,30\nBob,25").element() as HTMLTextAreaElement;
  expect(textarea.value).toContain("Alice");
});

test("csv-to-json Example produces JSON output", async () => {
  const screen = await render(<CsvJsonTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await vi.waitFor(() => {
    expect(document.querySelector("pre")?.textContent ?? "").toContain("Alice");
  });
});

test("switching to JSON → CSV hides header switch", async () => {
  const screen = await render(<CsvJsonTool />);
  await screen.getByRole("button", { name: "JSON" }).click();
  expect(screen.getByText("Header").query()).toBeNull();
});

test("Example in json-to-csv mode fills with JSON array", async () => {
  const jsonPlaceholder = '[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]';
  const screen = await render(<CsvJsonTool />);
  await screen.getByRole("button", { name: "JSON" }).click();
  await screen.getByRole("button", { name: "Example" }).click();
  const textarea = screen.getByPlaceholder(jsonPlaceholder).element() as HTMLTextAreaElement;
  expect(textarea.value).toContain("Alice");
});

test("json-to-csv Example produces CSV output", async () => {
  const screen = await render(<CsvJsonTool />);
  await screen.getByRole("button", { name: "JSON" }).click();
  await screen.getByRole("button", { name: "Example" }).click();
  await vi.waitFor(() => {
    expect(document.querySelector("pre")?.textContent ?? "").toContain("name");
  });
  expect(document.querySelector("pre")?.textContent ?? "").toContain("Alice");
});
