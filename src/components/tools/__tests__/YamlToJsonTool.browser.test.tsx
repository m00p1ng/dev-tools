import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { YamlToJsonTool } from "./YamlToJsonTool";

beforeEach(() => localStorage.clear());

test("Example button fills input with YAML", async () => {
  const screen = await render(<YamlToJsonTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Paste YAML here... or drop a file")).toHaveValue(
    expect.stringContaining("Alice"),
  );
});

test("Example produces JSON output", async () => {
  const screen = await render(<YamlToJsonTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  let code = "";
  await vi.waitFor(() => {
    code = document.querySelector("pre")?.textContent ?? "";
    expect(code).toContain("Alice");
  });
  expect(code).toContain("name");
});
