import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { QrCodeTool } from "../QrCodeTool";

beforeEach(() => localStorage.clear());

test("shows Generate tab by default", async () => {
  const screen = await render(<QrCodeTool />);
  await expect.element(screen.getByPlaceholder("Text or URL to encode… or drop a file")).toBeVisible();
});

test("Read tab button is visible and switches view", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "read" }).click();
  await expect.element(screen.getByText("Drop QR image here or click to upload")).toBeVisible();
});

test("Example button fills input with example URL", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Text or URL to encode… or drop a file")).toHaveValue(
    "https://example.com",
  );
});

test("Clearing input empties the textarea", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByPlaceholder("Text or URL to encode… or drop a file").fill("");
  await expect.element(screen.getByPlaceholder("Text or URL to encode… or drop a file")).toHaveValue("");
});
