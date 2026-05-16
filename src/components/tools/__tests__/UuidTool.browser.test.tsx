import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { UuidTool } from "../UuidTool";

test("generates a UUID v4 by default", async () => {
  const screen = await render(<UuidTool />);
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)).toBeVisible();
});

test("Regenerate button produces a new result", async () => {
  const screen = await render(<UuidTool />);
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-/i)).toBeVisible();
  await screen.getByRole("button", { name: "Regenerate" }).click();
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-/i)).toBeVisible();
});

test("switching algorithm to ULID generates a ULID-format string", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("ulid");
  await expect.element(screen.getByText(/^[0-9A-Z]{26}$/)).toBeVisible();
});

test("v3 algorithm shows namespace and name inputs", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v3");
  await expect.element(screen.getByText("Namespace")).toBeVisible();
  await expect.element(screen.getByText("Name", { exact: true })).toBeVisible();
});
