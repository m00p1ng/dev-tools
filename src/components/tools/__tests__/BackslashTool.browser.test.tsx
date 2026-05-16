import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { BackslashTool } from "./BackslashTool";

beforeEach(() => localStorage.clear());

test("Example button fills input with example text", async () => {
  const screen = await render(<BackslashTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Input text... or drop a file")).not.toHaveValue("");
});

test("Escape mode escapes quotes and whitespace control chars", async () => {
  const screen = await render(<BackslashTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Output will appear here...")).toHaveValue(
    expect.stringContaining('\\"'),
  );
});

test("switching to Unescape adopts escaped output into input", async () => {
  const screen = await render(<BackslashTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  const outputBefore = (
    screen.getByPlaceholder("Output will appear here...").element() as HTMLTextAreaElement
  ).value;
  await screen.getByRole("button", { name: "Unescape" }).click();
  await expect.element(screen.getByPlaceholder("Input text... or drop a file")).toHaveValue(
    outputBefore,
  );
});
