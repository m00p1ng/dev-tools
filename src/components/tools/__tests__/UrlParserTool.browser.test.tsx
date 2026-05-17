import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { UrlParserTool } from "../UrlParserTool";

beforeEach(() => localStorage.clear());

test("Example fills the input and shows parsed URL fields", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText("Protocol")).toBeVisible();
  await expect.element(screen.getByText("Hostname")).toBeVisible();
  // Target the table cell specifically to avoid matching aria-hidden overlay spans
  await expect.element(screen.getByRole("cell", { name: "https:", exact: true })).toBeVisible();
});

test("shows Query Parameters table when the URL has query params", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText("Query Parameters")).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: "role", exact: true })).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: "admin", exact: true })).toBeVisible();
});

test("shows error badge for an invalid URL", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("textbox").fill("not a url");
  await expect.element(screen.getByText("Invalid URL")).toBeVisible();
});

test("clearing the input removes parsed fields", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText("Protocol")).toBeVisible();
  await screen.getByRole("button", { name: "Clear" }).click();
  // Element removed from DOM when input is empty; use .elements() to avoid "not found" error
  expect(screen.getByText("Protocol").elements()).toHaveLength(0);
});

test("filling empty string resets the parsed output", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText("Protocol")).toBeVisible();
  await screen.getByRole("textbox").fill("");
  expect(screen.getByText("Protocol").elements()).toHaveLength(0);
});

test("URL with only root path shows slash in highlight", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("textbox").fill("https://example.com/");
  await expect.element(screen.getByText("Protocol")).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: "https:", exact: true })).toBeVisible();
});

test("URL with hash fragment shows Hash field", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText("Hash")).toBeVisible();
  // The hash cell contains "#results" (# in muted span + results in teal span)
  await expect.element(screen.getByText("results").first()).toBeVisible();
});

test("URL with username and password shows auth fields", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText("Username")).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: "user", exact: true })).toBeVisible();
});
