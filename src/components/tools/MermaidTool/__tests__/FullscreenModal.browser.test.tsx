import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { FullscreenModal } from "../FullscreenModal";
import { openDropdown, sampleSvg, waitForMenuItems } from "./test-utils";
import type { ImageFormat } from "@/lib/tool-logic/diagram";

function renderModal(props?: Partial<Parameters<typeof FullscreenModal>[0]>) {
  return render(
    <FullscreenModal
      svg={sampleSvg}
      isDark={false}
      onDownload={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );
}

test("renders the fullscreen preview", async () => {
  const screen = await renderModal();
  await expect.element(screen.getByText("Diagram Preview")).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Close fullscreen" })).toBeVisible();
});

test("pressing non-Escape key does not close it", async () => {
  const onClose = vi.fn();
  const screen = await renderModal({ onClose });
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
  expect(onClose).not.toHaveBeenCalled();
  await expect.element(screen.getByText("Diagram Preview")).toBeVisible();
});

test("Escape closes the fullscreen preview", async () => {
  const onClose = vi.fn();
  await renderModal({ onClose });
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  expect(onClose).toHaveBeenCalledOnce();
});

test("close button closes the fullscreen preview", async () => {
  const onClose = vi.fn();
  const screen = await renderModal({ onClose });
  await screen.getByRole("button", { name: "Close fullscreen" }).click();
  expect(onClose).toHaveBeenCalledOnce();
});

test("renders with dark background when isDark is true", async () => {
  const screen = await renderModal({ isDark: true });
  await expect.element(screen.getByText("Diagram Preview")).toBeVisible();
});

test.each<ImageFormat>(["png", "jpg", "svg"])("selecting %s download calls onDownload", async (format) => {
  const onDownload = vi.fn();
  await renderModal({ onDownload });
  const downloadButtons = Array.from(document.querySelectorAll("button[aria-label='Download diagram']"));
  openDropdown(downloadButtons[downloadButtons.length - 1] as HTMLElement);
  await waitForMenuItems();

  const item = Array.from(document.querySelectorAll("[role='menuitem']")).find(
    (el) => el.textContent?.trim().toLowerCase() === format,
  ) as HTMLElement | undefined;
  item?.click();

  expect(onDownload).toHaveBeenCalledWith(format);
});
