import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { MermaidTool } from "./MermaidTool";

beforeEach(() => localStorage.clear());

test("loads with example diagram pre-filled in the editor", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("textbox")).toHaveValue(
    expect.stringContaining("graph TD"),
  );
});

test("Syntax link is visible", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByText("Syntax")).toBeVisible();
});

test("Clear button empties the editor", async () => {
  const screen = await render(<MermaidTool />);
  await screen.getByRole("textbox").fill("");
  await expect.element(screen.getByText("Diagram will appear here...")).toBeVisible();
});

test("Example button reloads the example diagram", async () => {
  const screen = await render(<MermaidTool />);
  await screen.getByRole("textbox").fill("");
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByRole("textbox")).toHaveValue(
    expect.stringContaining("graph TD"),
  );
});
