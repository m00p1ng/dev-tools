import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { PlaceholderTool } from "./PlaceholderTool";

test("renders label with coming soon text", async () => {
  const screen = await render(<PlaceholderTool label="My Tool" />);
  await expect.element(screen.getByText("My Tool — coming soon")).toBeVisible();
});

test("renders different labels without cross-contamination", async () => {
  const screen = await render(<PlaceholderTool label="Another Tool" />);
  await expect.element(screen.getByText("Another Tool — coming soon")).toBeVisible();
});
