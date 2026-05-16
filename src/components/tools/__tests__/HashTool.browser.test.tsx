import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { HashTool } from "./HashTool";

beforeEach(() => localStorage.clear());

test("shows all four algorithm labels", async () => {
  const screen = await render(<HashTool />);
  await expect.element(screen.getByText("MD5")).toBeVisible();
  await expect.element(screen.getByText("SHA-1")).toBeVisible();
  await expect.element(screen.getByText("SHA-256")).toBeVisible();
  await expect.element(screen.getByText("SHA-512")).toBeVisible();
});

test("Example fills the input and shows hex hashes", async () => {
  const screen = await render(<HashTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  // MD5 of "Hello, World!" starts with 65a8
  await expect.element(screen.getByText(/65a8e27d8879283831b664bd8b7f0ad4/)).toBeVisible();
});

test("switching to base64 encoding changes hash output format", async () => {
  const screen = await render(<HashTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByRole("button", { name: "base64" }).click();
  // base64-encoded hash differs from hex
  await expect.element(screen.getByText(/ZajifYh5KDgxtmS9i38K1A==/)).toBeVisible();
});
