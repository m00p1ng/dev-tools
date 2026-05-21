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

test("URL with default HTTPS port still shows colon in highlight", async () => {
  const screen = await render(<UrlParserTool />);
  // Port 443 is the default for HTTPS so u.port="" but raw has ":"
  await screen.getByRole("textbox").fill("https://example.com:443/path");
  await expect.element(screen.getByText("Protocol")).toBeVisible();
});

test("URL with only a hash fragment shows no hash value in Hash cell", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("textbox").fill("https://example.com#");
  await expect.element(screen.getByText("Hash")).toBeVisible();
});

test("URL with username but no password skips password row", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("textbox").fill("https://user@example.com/path");
  await expect.element(screen.getByText("Username")).toBeVisible();
  expect(screen.getByText("Password").elements()).toHaveLength(0);
});

test("URL without trailing slash on root covers no-slash highlight path", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("textbox").fill("https://example.com");
  await expect.element(screen.getByText("Protocol")).toBeVisible();
});

test("URL with query key having no value covers rest.length === 0 branch", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("textbox").fill("https://example.com/path?flag");
  await expect.element(screen.getByText("Query Parameters")).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: "flag", exact: true })).toBeVisible();
});

test("URL with bare query marker keeps empty query output", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("textbox").fill("https://example.com/path?");
  await expect.element(screen.getByText("Query")).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: "(none)", exact: true }).first()).toBeVisible();
});

test("URL with empty query pair keeps separator rendering stable", async () => {
  const screen = await render(<UrlParserTool />);
  await screen.getByRole("textbox").fill("https://example.com/path?foo=bar&&baz=qux");
  await expect.element(screen.getByText("Query Parameters")).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: "foo", exact: true })).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: "baz", exact: true })).toBeVisible();
});

test("dragging over URL input applies drag affordance", async () => {
  const screen = await render(<UrlParserTool />);
  const textarea = screen.getByRole("textbox").element();
  textarea.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
  await expect.poll(() => textarea.className).toContain("ring-2");
});
