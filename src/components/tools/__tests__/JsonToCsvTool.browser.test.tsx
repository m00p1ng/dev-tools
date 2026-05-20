import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { JsonToCsvTool } from "../JsonToCsvTool";

const INPUT_PLACEHOLDER = '[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]';

beforeEach(() => localStorage.clear());

test("Example button fills input with JSON array", async () => {
  const screen = await render(<JsonToCsvTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  const input = screen.getByPlaceholder(INPUT_PLACEHOLDER).element() as HTMLTextAreaElement;
  expect(input.value).toContain("Alice");
});

test("Example produces CSV output with headers and rows", async () => {
  const screen = await render(<JsonToCsvTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.poll(() => document.querySelector("pre")?.textContent ?? "").toContain("name");
  const output = document.querySelector("pre")?.textContent ?? "";
  expect(output).toContain("age");
  expect(output).toContain("Alice");
});
