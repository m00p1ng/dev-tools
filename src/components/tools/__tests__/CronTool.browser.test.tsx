import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { CronTool } from "./CronTool";

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
