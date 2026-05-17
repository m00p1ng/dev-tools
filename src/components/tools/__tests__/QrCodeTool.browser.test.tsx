import { beforeEach, expect, test, vi } from "vitest";
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

test("QR image is rendered after typing input", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByPlaceholder("Text or URL to encode… or drop a file").fill("hello");
  await vi.waitFor(() => {
    const img = document.querySelector("img[alt='QR Code']") as HTMLImageElement | null;
    expect(img?.style.opacity).toBe("1");
  }, { timeout: 3000 });
});

test("EC level selector is visible after entering input", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await vi.waitFor(() => {
    expect(document.querySelector("select")).not.toBeNull();
  }, { timeout: 3000 });
  await expect.element(screen.getByRole("combobox")).toBeVisible();
});

test("switching EC level is possible", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await vi.waitFor(() => expect(document.querySelector("select")).not.toBeNull(), { timeout: 3000 });
  await screen.getByRole("combobox").selectOptions("L");
  await expect.element(screen.getByRole("combobox")).toHaveValue("L");
});

test("switching to generate tab after read shows textarea", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "read" }).click();
  await screen.getByRole("button", { name: "generate" }).click();
  await expect.element(screen.getByPlaceholder("Text or URL to encode… or drop a file")).toBeVisible();
});

test("clearing input empties the textarea", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByPlaceholder("Text or URL to encode… or drop a file").fill("");
  await expect.element(screen.getByPlaceholder("Text or URL to encode… or drop a file")).toHaveValue("");
});

test("clear button (RotateCcw) resets input", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Text or URL to encode… or drop a file")).toHaveValue("https://example.com");
  // RotateCcw button: only button with SVG and no text content
  const clearBtn = Array.from(document.querySelectorAll("button")).find(
    (b) => b.querySelector("svg") && !b.textContent?.trim()
  ) as HTMLElement | undefined;
  expect(clearBtn).not.toBeNull();
  clearBtn?.click();
  await vi.waitFor(async () => {
    await expect.element(screen.getByPlaceholder("Text or URL to encode… or drop a file")).toHaveValue("");
  }, { timeout: 2000 });
});

test("drop zone in read tab is clickable", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "read" }).click();
  const dropZone = document.querySelector("div.border-dashed") as HTMLElement;
  expect(dropZone).not.toBeNull();
  // DragOver on the read drop zone (this is NOT the generate drag zone)
  dropZone?.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
});

test("file drop with real PNG image on read tab shows error", async () => {
  const screen = await render(<QrCodeTool />);
  await screen.getByRole("button", { name: "read" }).click();
  const dropZone = document.querySelector("div.border-dashed") as HTMLElement;

  // Minimal 1x1 PNG (valid image, no QR code)
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const binary = atob(pngBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const dt = new DataTransfer();
  dt.items.add(new File([bytes], "test.png", { type: "image/png" }));
  dropZone?.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));

  await vi.waitFor(async () => {
    await expect.element(screen.getByText("No QR code found in image")).toBeVisible();
  }, { timeout: 5000 });
});
