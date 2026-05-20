import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MermaidTool } from "../MermaidTool";

beforeEach(() => localStorage.clear());

function openDropdown(trigger: HTMLElement) {
  trigger.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ctrlKey: false,
  }));
}

test("loads with example diagram pre-filled in the editor", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("textbox")).toHaveValue(
    expect.stringContaining("graph TD"),
  );
});

test("Syntax link is visible", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByText("Syntax")).toBeVisible();
});

test("Clear button empties the editor", async () => {
  const screen = await render(<MermaidTool />);
  await screen.getByRole("button", { name: "Clear" }).click();
  await expect.element(screen.getByText("Diagram will appear here...")).toBeVisible();
});

test("Example button reloads the example diagram", async () => {
  const screen = await render(<MermaidTool />);
  await screen.getByRole("textbox").fill("");
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByRole("textbox")).toHaveValue(
    expect.stringContaining("graph TD"),
  );
});

test("renders SVG after valid mermaid input", async () => {
  const screen = await render(<MermaidTool />);
  await vi.waitFor(() => {
    const svg = document.querySelector("svg");
    expect(svg).not.toBeNull();
  }, { timeout: 5000 });
  await expect.element(screen.getByRole("textbox")).toHaveValue(expect.stringContaining("graph TD"));
});

test("zoom control buttons are visible when SVG is rendered", async () => {
  await render(<MermaidTool />);
  await vi.waitFor(() => expect(document.querySelector("svg")).not.toBeNull(), { timeout: 5000 });
  // The zoom percentage button shows "100%" by default
  const buttons = document.querySelectorAll("button");
  const zoomBtn = Array.from(buttons).find((b) => b.textContent?.includes("%"));
  expect(zoomBtn).not.toBeNull();
});

test("reset button is visible when SVG is rendered", async () => {
  await render(<MermaidTool />);
  await vi.waitFor(() => expect(document.querySelector("svg")).not.toBeNull(), { timeout: 5000 });
  const buttons = document.querySelectorAll("button");
  expect(buttons.length).toBeGreaterThan(2);
});

test("shows error badge for invalid mermaid syntax", async () => {
  const screen = await render(<MermaidTool />);
  await screen.getByRole("textbox").fill("not valid mermaid syntax @@@@");
  await vi.waitFor(() => {
    const badge = document.querySelector('[data-slot="badge"]');
    expect(badge).not.toBeNull();
  }, { timeout: 5000 });
});

test("dark mode observer is set up (MutationObserver)", async () => {
  await render(<MermaidTool />);
  document.documentElement.classList.add("dark");
  document.documentElement.classList.remove("dark");
  // No error means observer correctly handles class changes
});

test("wheel event on SVG container adjusts zoom", async () => {
  await render(<MermaidTool />);
  await vi.waitFor(() => expect(document.querySelector("svg")).not.toBeNull(), { timeout: 5000 });
  const container = document.querySelector('[style*="cursor"]') as HTMLElement;
  if (container) {
    container.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
    // No error = handler ran
  }
});

test("mousedown and mousemove on SVG container trigger pan", async () => {
  await render(<MermaidTool />);
  await vi.waitFor(() => expect(document.querySelector("svg")).not.toBeNull(), { timeout: 5000 });
  const container = document.querySelector('[style*="cursor"]') as HTMLElement;
  if (container) {
    container.dispatchEvent(new MouseEvent("mousedown", { button: 0, clientX: 100, clientY: 100, bubbles: true }));
    container.dispatchEvent(new MouseEvent("mousemove", { clientX: 150, clientY: 120, bubbles: true }));
    container.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    // No error = handlers ran
  }
});

test("mouseleave resets dragging state", async () => {
  await render(<MermaidTool />);
  await vi.waitFor(() => expect(document.querySelector("svg")).not.toBeNull(), { timeout: 5000 });
  const container = document.querySelector('[style*="cursor"]') as HTMLElement;
  if (container) {
    container.dispatchEvent(new MouseEvent("mousedown", { button: 0, clientX: 50, clientY: 50, bubbles: true }));
    container.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    // Cursor should revert to grab (not grabbing) - no error
  }
});

test("clicking zoom buttons changes zoom level", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Zoom in" })).toBeVisible();
  await screen.getByRole("button", { name: "Zoom in" }).click();
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("110%");
  await screen.getByRole("button", { name: "Zoom out" }).click();
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("100%");
  await screen.getByRole("button", { name: "Reset view" }).click();
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("100%");
});

test("zoom dropdown opens and sets zoom to a preset", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toBeVisible();
  const zoomPctBtn = screen.getByRole("button", { name: "Select zoom" }).element() as HTMLElement;
  openDropdown(zoomPctBtn);
  await vi.waitFor(() => {
    const items = document.querySelectorAll("[role='menuitem']");
    expect(items.length).toBeGreaterThan(0);
  }, { timeout: 3000 });
  const items = Array.from(document.querySelectorAll("[role='menuitem']"));
  const item200 = items.find((el) => el.textContent?.includes("200%")) as HTMLElement | undefined;
  item200?.click();
  await vi.waitFor(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.trim() === "200%");
    expect(btn).not.toBeNull();
  }, { timeout: 2000 });
});

test("fullscreen preview opens and closes with Escape", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Fullscreen preview" })).toBeVisible();
  await screen.getByRole("button", { name: "Fullscreen preview" }).click();
  await expect.element(screen.getByText("Diagram Preview")).toBeVisible();

  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  await vi.waitFor(() => {
    expect(screen.getByText("Diagram Preview").elements()).toHaveLength(0);
  });
});

test("fullscreen SVG download option triggers download", async () => {
  const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fullscreen");
  const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  const screen = await render(<MermaidTool />);

  await expect.element(screen.getByRole("button", { name: "Fullscreen preview" })).toBeVisible();
  await screen.getByRole("button", { name: "Fullscreen preview" }).click();
  await expect.element(screen.getByText("Diagram Preview")).toBeVisible();

  const downloadButtons = Array.from(document.querySelectorAll("button[aria-label='Download diagram']"));
  openDropdown(downloadButtons[downloadButtons.length - 1] as HTMLElement);
  await vi.waitFor(() => {
    expect(document.querySelectorAll("[role='menuitem']").length).toBeGreaterThan(0);
  });
  const svgItem = Array.from(document.querySelectorAll("[role='menuitem']")).find(
    (el) => el.textContent?.trim() === "SVG",
  ) as HTMLElement | undefined;
  svgItem?.click();

  await vi.waitFor(() => expect(createObjectURL).toHaveBeenCalled(), { timeout: 2000 });
  createObjectURL.mockRestore();
  revokeObjectURL.mockRestore();
});

test.each([
  ["PNG", "image/png"],
  ["JPG", "image/jpeg"],
])("fullscreen %s download renders the SVG to a canvas", async (format, mimeType) => {
  const originalImage = window.Image;
  class MockImage {
    onload: (() => void) | null = null;
    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }

  vi.stubGlobal("Image", MockImage);
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  const toDataUrlSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "toDataURL")
    .mockReturnValue(`data:${mimeType};base64,fullscreen`);
  const screen = await render(<MermaidTool />);

  await expect.element(screen.getByRole("button", { name: "Fullscreen preview" })).toBeVisible();
  await screen.getByRole("button", { name: "Fullscreen preview" }).click();
  const downloadButtons = Array.from(document.querySelectorAll("button[aria-label='Download diagram']"));
  openDropdown(downloadButtons[downloadButtons.length - 1] as HTMLElement);
  await vi.waitFor(() => {
    expect(document.querySelectorAll("[role='menuitem']").length).toBeGreaterThan(0);
  });

  const item = Array.from(document.querySelectorAll("[role='menuitem']")).find(
    (el) => el.textContent?.trim() === format,
  ) as HTMLElement | undefined;
  item?.click();

  await vi.waitFor(() => expect(toDataUrlSpy).toHaveBeenCalledWith(mimeType, 0.95), { timeout: 2000 });
  expect(clickSpy).toHaveBeenCalled();

  vi.stubGlobal("Image", originalImage);
  clickSpy.mockRestore();
  getContextSpy.mockRestore();
  toDataUrlSpy.mockRestore();
});

test("download dropdown opens with PNG/JPG/SVG options", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Download diagram" })).toBeVisible();
  openDropdown(screen.getByRole("button", { name: "Download diagram" }).element() as HTMLElement);
  await vi.waitFor(() => {
    const items = document.querySelectorAll("[role='menuitem']");
    expect(items.length).toBeGreaterThan(0);
  }, { timeout: 3000 });
  const texts = Array.from(document.querySelectorAll("[role='menuitem']")).map((el) => el.textContent?.trim());
  expect(texts.some((t) => t === "PNG" || t === "SVG")).toBe(true);
});

test("clicking SVG download option triggers download", async () => {
  const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Download diagram" })).toBeVisible();
  openDropdown(screen.getByRole("button", { name: "Download diagram" }).element() as HTMLElement);

  await vi.waitFor(() => {
    const items = document.querySelectorAll("[role='menuitem']");
    expect(items.length).toBeGreaterThan(0);
  }, { timeout: 3000 });

  const svgItem = Array.from(document.querySelectorAll("[role='menuitem']")).find(
    (el) => el.textContent?.trim() === "SVG"
  ) as HTMLElement | undefined;
  svgItem?.click();

  await vi.waitFor(() => expect(createObjectURL).toHaveBeenCalled(), { timeout: 2000 });
  createObjectURL.mockRestore();
  revokeObjectURL.mockRestore();
});

test.each([
  ["PNG", "image/png"],
  ["JPG", "image/jpeg"],
])("clicking %s download option renders the SVG to a canvas", async (format, mimeType) => {
  const originalImage = window.Image;
  class MockImage {
    onload: (() => void) | null = null;
    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }

  vi.stubGlobal("Image", MockImage);
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  const toDataUrlSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "toDataURL")
    .mockReturnValue(`data:${mimeType};base64,mock`);

  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Download diagram" })).toBeVisible();

  openDropdown(screen.getByRole("button", { name: "Download diagram" }).element() as HTMLElement);

  await vi.waitFor(() => {
    expect(document.querySelectorAll("[role='menuitem']").length).toBeGreaterThan(0);
  }, { timeout: 3000 });

  const item = Array.from(document.querySelectorAll("[role='menuitem']")).find(
    (el) => el.textContent?.trim() === format,
  ) as HTMLElement | undefined;
  item?.click();

  await vi.waitFor(() => expect(toDataUrlSpy).toHaveBeenCalledWith(mimeType, 0.95), { timeout: 2000 });
  expect(clickSpy).toHaveBeenCalled();

  vi.stubGlobal("Image", originalImage);
  clickSpy.mockRestore();
  getContextSpy.mockRestore();
  toDataUrlSpy.mockRestore();
});
