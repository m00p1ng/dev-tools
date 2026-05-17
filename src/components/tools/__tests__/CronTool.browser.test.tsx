import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CronTool } from "../CronTool";

beforeEach(() => localStorage.clear());

test("default expression shows next runs section", async () => {
  const screen = await render(<CronTool />);
  await expect.element(screen.getByText("Next 5 runs")).toBeVisible();
});

test("shows an error badge for an invalid expression", async () => {
  const screen = await render(<CronTool />);
  await screen.getByPlaceholder("* * * * *").fill("bad cron");
  await expect.element(screen.getByText(/invalid/i)).toBeVisible();
});

test("preset buttons set the expression in the input", async () => {
  const screen = await render(<CronTool />);
  await screen.getByRole("button", { name: "Every minute" }).click();
  await expect.element(screen.getByPlaceholder("* * * * *")).toHaveValue("* * * * *");
});

test("every hour preset sets the correct expression", async () => {
  const screen = await render(<CronTool />);
  await screen.getByRole("button", { name: "Every hour" }).click();
  await expect.element(screen.getByPlaceholder("* * * * *")).toHaveValue("0 * * * *");
});

test("shows human readable description for valid expression", async () => {
  const screen = await render(<CronTool />);
  await expect.element(screen.getByText("Human readable")).toBeVisible();
});

test("Every day at midnight preset", async () => {
  const screen = await render(<CronTool />);
  await screen.getByRole("button", { name: "Every day at midnight" }).click();
  await expect.element(screen.getByPlaceholder("* * * * *")).toHaveValue("0 0 * * *");
  await expect.element(screen.getByText("Next 5 runs")).toBeVisible();
});

test("Every Monday at 9am preset", async () => {
  const screen = await render(<CronTool />);
  await screen.getByRole("button", { name: "Every Monday at 9am" }).click();
  await expect.element(screen.getByPlaceholder("* * * * *")).toHaveValue("0 9 * * 1");
});

test("Every 1st of month preset", async () => {
  const screen = await render(<CronTool />);
  await screen.getByRole("button", { name: "Every 1st of month" }).click();
  await expect.element(screen.getByPlaceholder("* * * * *")).toHaveValue("0 0 1 * *");
});

test("filling empty string hides description and next runs", async () => {
  const screen = await render(<CronTool />);
  await expect.element(screen.getByText("Next 5 runs")).toBeVisible();
  await screen.getByPlaceholder("* * * * *").fill("");
  await vi.waitFor(() => {
    expect(screen.getByText("Next 5 runs").elements()).toHaveLength(0);
  }, { timeout: 3000 });
});
