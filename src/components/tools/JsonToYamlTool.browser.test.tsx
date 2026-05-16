import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { JsonToYamlTool } from "./JsonToYamlTool";

beforeEach(() => localStorage.clear());

test("Example button fills input with JSON", async () => {
  const screen = await render(<JsonToYamlTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Paste JSON here... or drop a file")).toHaveValue(
    expect.stringContaining("Alice"),
  );
});

test("Example produces YAML output", async () => {
  const screen = await render(<JsonToYamlTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  let code = "";
  await vi.waitFor(() => {
    code = document.querySelector("pre")?.textContent ?? "";
    expect(code).toContain("Alice");
  });
  expect(code).toContain("age");
});
