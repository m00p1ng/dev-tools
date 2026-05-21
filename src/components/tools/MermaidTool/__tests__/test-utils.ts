import { expect, vi } from "vitest";

export const sampleSvg = '<svg aria-roledescription="flowchart-v2" viewBox="0 0 100 80"><rect width="100" height="80" /></svg>';

export function openDropdown(trigger: HTMLElement) {
  trigger.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ctrlKey: false,
  }));
}

export async function waitForMenuItems() {
  await vi.waitFor(() => {
    expect(document.querySelectorAll("[role='menuitem']").length).toBeGreaterThan(0);
  }, { timeout: 3000 });
}

export async function waitForSvg() {
  await vi.waitFor(() => {
    expect(document.querySelector("svg")).not.toBeNull();
  }, { timeout: 5000 });
}

export function mockRasterDownload(mimeType: string, value = "mock") {
  const originalImage = window.Image;

  class MockImage {
    onload: (() => void) | null = null;

    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }

  vi.stubGlobal("Image", MockImage);
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => { });
  const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  const toDataUrlSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "toDataURL")
    .mockReturnValue(`data:${mimeType};base64,${value}`);

  return {
    clickSpy,
    getContextSpy,
    toDataUrlSpy,
    restore: () => {
      vi.stubGlobal("Image", originalImage);
      clickSpy.mockRestore();
      getContextSpy.mockRestore();
      toDataUrlSpy.mockRestore();
    },
  };
}
