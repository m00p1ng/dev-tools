import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { HashTool } from "../HashTool";

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

test("clearing input empties the textarea", async () => {
  const screen = await render(<HashTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText(/65a8e27d/)).toBeVisible();
  await screen.getByRole("button", { name: "Clear" }).click();
  await expect.element(screen.getByRole("textbox")).toHaveValue("");
});

test("typing input directly shows hash output", async () => {
  const screen = await render(<HashTool />);
  await screen.getByRole("textbox").fill("hello");
  await expect.element(screen.getByText(/5d41402abc4b2a76b9719d911017c592/)).toBeVisible();
});

test("empty input shows dashes for all algorithms", async () => {
  const screen = await render(<HashTool />);
  const dashes = screen.getByText("—");
  await expect.element(dashes.first()).toBeVisible();
});

test("hex button is active by default (selected styling)", async () => {
  const screen = await render(<HashTool />);
  await expect.element(screen.getByRole("button", { name: "hex" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "base64" })).toBeVisible();
});

test("dragover on textarea sets isDragging ring class", async () => {
  const screen = await render(<HashTool />);
  const textarea = screen.getByRole("textbox").element();
  textarea.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
  await vi.waitFor(() => {
    expect(textarea.className).toMatch(/ring-2/);
  }, { timeout: 1000 });
});
