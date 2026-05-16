import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { ToolContent } from "./ToolContent";
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
