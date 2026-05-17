import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { CopyButton } from "@/components/ui/copy-button";

vi.mock("@/lib/copy", () => ({ copyToClipboard: vi.fn().mockResolvedValue(undefined) }));

test("renders a copy icon button", async () => {
  const screen = await render(<CopyButton text="hello" />);
  await expect.element(screen.getByRole("button")).toBeVisible();
});

test("withLabel renders Copy label text", async () => {
  const screen = await render(<CopyButton text="hello" withLabel />);
  await expect.element(screen.getByText("Copy")).toBeVisible();
});

test("clicking shows Copied! feedback when withLabel is set", async () => {
  const screen = await render(<CopyButton text="some text" withLabel />);
  await screen.getByRole("button").click();
  await expect.element(screen.getByText("Copied!")).toBeVisible();
});

test("clicking button with empty text does nothing", async () => {
  const { copyToClipboard } = await import("@/lib/copy");
  (copyToClipboard as ReturnType<typeof vi.fn>).mockClear();
  const screen = await render(<CopyButton text="" />);
  await screen.getByRole("button").click();
  expect(copyToClipboard).not.toHaveBeenCalled();
});

test("applies custom className", async () => {
  await render(<CopyButton text="x" className="my-custom" />);
  const btn = document.querySelector(".my-custom");
  expect(btn).not.toBeNull();
});

test("clicking button without withLabel still copies text", async () => {
  const { copyToClipboard } = await import("@/lib/copy");
  (copyToClipboard as ReturnType<typeof vi.fn>).mockClear();
  const screen = await render(<CopyButton text="copy me" />);
  await screen.getByRole("button").click();
  await vi.waitFor(() => expect(copyToClipboard).toHaveBeenCalledWith("copy me"), { timeout: 2000 });
});
