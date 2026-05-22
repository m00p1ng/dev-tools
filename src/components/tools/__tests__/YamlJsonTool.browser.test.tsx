import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { YamlJsonTool } from "../YamlJsonTool";

beforeEach(() => localStorage.clear());

test("starts in YAML → JSON mode", async () => {
  const screen = await render(<YamlJsonTool />);
  await expect.element(screen.getByRole("button", { name: "YAML" })).toHaveAttribute("data-variant", "default");
});

test("Example button fills input with YAML in yaml-to-json mode", async () => {
  const screen = await render(<YamlJsonTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Paste YAML here... or drop a file")).toHaveValue(
    expect.stringContaining("Alice"),
  );
});

test("Example in yaml-to-json mode produces JSON output", async () => {
  const screen = await render(<YamlJsonTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await vi.waitFor(() => {
    expect(document.querySelector("pre")?.textContent ?? "").toContain("Alice");
  });
});

test("switching to JSON → YAML shows correct placeholder", async () => {
  const screen = await render(<YamlJsonTool />);
  await screen.getByRole("button", { name: "JSON" }).click();
  await expect.element(screen.getByPlaceholder("Paste JSON here... or drop a file")).toBeVisible();
});

test("adoptOutputOnModeChange swaps output into input on mode switch", async () => {
  const screen = await render(<YamlJsonTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await vi.waitFor(() => {
    expect(document.querySelector("pre")?.textContent ?? "").toContain("Alice");
  });
  await screen.getByRole("button", { name: "JSON" }).click();
  const textarea = screen.getByPlaceholder("Paste JSON here... or drop a file").element() as HTMLTextAreaElement;
  expect(textarea.value).toContain("Alice");
});

test("Example in json-to-yaml mode fills with JSON", async () => {
  const screen = await render(<YamlJsonTool />);
  await screen.getByRole("button", { name: "JSON" }).click();
  await screen.getByRole("button", { name: "Example" }).click();
  const textarea = screen.getByPlaceholder("Paste JSON here... or drop a file").element() as HTMLTextAreaElement;
  expect(textarea.value).toContain("Alice");
});
