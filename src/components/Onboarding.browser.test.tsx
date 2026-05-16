import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Onboarding } from "./Onboarding";
import { TOOLS } from "@/tools";

test("renders title and all category names", async () => {
  const screen = await render(<Onboarding onComplete={vi.fn()} />);
  await expect.element(screen.getByText("Dev Tools")).toBeVisible();
  // Use exact: true to avoid substring matching ("Time" inside "Timestamps")
  await expect.element(screen.getByText("Time", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("Security", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("Generators", { exact: true })).toBeVisible();
});

test("Get started calls onComplete with no toolId after animation", async () => {
  const onComplete = vi.fn();
  const screen = await render(<Onboarding onComplete={onComplete} />);
  await screen.getByRole("button", { name: "Get started" }).click();
  await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(undefined), { timeout: 1500 });
});

test("clicking a category card calls onComplete with that group's first tool id", async () => {
  const onComplete = vi.fn();
  const screen = await render(<Onboarding onComplete={onComplete} />);
  await screen.getByRole("button", { name: /^Time/ }).click();
  const firstTimeTool = TOOLS.find((t) => t.group === "Time")!;
  await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(firstTimeTool.id), { timeout: 1500 });
});

test("shows tool count per category", async () => {
  const screen = await render(<Onboarding onComplete={vi.fn()} />);
  const dataTools = TOOLS.filter((t) => t.group === "Data").length;
  await expect.element(screen.getByText(`${dataTools} tools`, { exact: true })).toBeVisible();
});
