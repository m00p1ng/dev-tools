import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { JwtTool } from "./JwtTool";

beforeEach(() => {
  localStorage.clear();
});

test("decodes the example JWT and verifies the HS256 secret", async () => {
  const screen = await render(<JwtTool />);

  await screen.getByRole("button", { name: "Example" }).click();

  await expect.element(screen.getByText("Valid JWT")).toBeVisible();
  await expect.element(screen.getByText("Header")).toBeVisible();
  await expect.element(screen.getByText("Payload", { exact: true })).toBeVisible();
  await expect.element(screen.getByText('"John Doe"', { exact: true })).toBeVisible();

  await screen.getByLabelText("JWT verification secret").fill("your-256-bit-secret");

  await expect.element(screen.getByText("Signature Verified")).toBeVisible();
});

test("shows a payload JSON validation error while editing", async () => {
  const screen = await render(<JwtTool />);

  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByLabelText("Edit JWT payload JSON").fill("{");

  await expect.element(screen.getByText("Invalid JSON")).toBeVisible();
});
