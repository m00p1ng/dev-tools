import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { UnixTimeTool } from "../UnixTimeTool";

test("shows current Unix timestamp label", async () => {
  const screen = await render(<UnixTimeTool />);
  await expect.element(screen.getByText("Current Unix Timestamp")).toBeVisible();
});

test("live timestamp display shows a current Unix value", async () => {
  await render(<UnixTimeTool />);
  const ts = document.querySelector(".text-2xl")?.textContent ?? "";
  expect(Number(ts)).toBeGreaterThan(1_000_000_000);
});

test("Now button sets input to current timestamp", async () => {
  const screen = await render(<UnixTimeTool />);
  await screen.getByRole("button", { name: "Now" }).click();
  const input = screen.getByPlaceholder(
    "e.g., 1700000000 or 2023-11-15T12:00:00Z",
  ).element() as HTMLInputElement;
  expect(Number(input.value)).toBeGreaterThan(1_000_000_000);
});

test("shows conversion cards for a valid timestamp", async () => {
  const screen = await render(<UnixTimeTool />);
  await screen.getByPlaceholder("e.g., 1700000000 or 2023-11-15T12:00:00Z").fill("1700000000");
  await expect.element(screen.getByText("Unix (s)")).toBeVisible();
  await expect.element(screen.getByText("UTC Time")).toBeVisible();
  await expect.element(screen.getByText("ISO 8601")).toBeVisible();
});

test("shows error badge for invalid input", async () => {
  const screen = await render(<UnixTimeTool />);
  await screen.getByPlaceholder("e.g., 1700000000 or 2023-11-15T12:00:00Z").fill("not-a-date");
  await expect.element(screen.getByText("Invalid input format")).toBeVisible();
});
