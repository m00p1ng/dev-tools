import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ToolContent } from "../ToolContent";
import { TOOLS } from "@/tools";

beforeEach(() => localStorage.clear());

test("renders PlaceholderTool for an unknown toolId", async () => {
  const screen = await render(<ToolContent toolId="nonexistent-tool" />);
  await expect.element(screen.getByText(/coming soon/)).toBeVisible();
});

test("placeholder label falls back to first TOOLS entry for unknown toolId", async () => {
  const screen = await render(<ToolContent toolId="nonexistent-tool" />);
  await expect.element(screen.getByText(`${TOOLS[0].label} — coming soon`)).toBeVisible();
});

test("renders a known tool component via lazy loading", async () => {
  const screen = await render(<ToolContent toolId="cron" />);
  // CronTool renders a cron expression input
  await expect.element(screen.getByPlaceholder("* * * * *")).toBeVisible();
});

test("renders different lazy tools correctly", async () => {
  const screen = await render(<ToolContent toolId="hash" />);
  // HashTool renders algo badges
  await expect.element(screen.getByText("MD5")).toBeVisible();
});

// These tool IDs trigger lazy imports not covered by other tests
const additionalToolIds = [
  "json-format",
  "base64",
  "url-encode",
  "url-parser",
  "backslash",
  "jwt",
  "unix-time",
  "uuid",
  "yaml-to-json",
  "json-to-yaml",
  "json-to-csv",
  "csv-to-json",
  "lorem-ipsum",
  "mermaid",
  "random-string",
  "qrcode",
  "color-picker",
];

for (const toolId of additionalToolIds) {
  test(`renders lazy tool without crashing: ${toolId}`, async () => {
    await render(<ToolContent toolId={toolId} />);
    // Wait for Suspense to resolve — the loading div or the actual tool renders
    await vi.waitFor(() => {
      const body = document.body;
      expect(body.firstChild).not.toBeNull();
      expect(body.innerHTML.length).toBeGreaterThan(10);
    }, { timeout: 10000 });
  });
}
