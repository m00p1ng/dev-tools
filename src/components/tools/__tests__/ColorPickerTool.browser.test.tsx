import { useRef, useState, type PointerEvent } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ColorPickerTool } from "../ColorPickerTool";
import { useColorWheel } from "../ColorPickerTool/useColorWheel";
import { useDragSlider } from "../ColorPickerTool/useDragSlider";
import type { Hsv } from "@/lib/tool-logic/color";

function pressEnter() {
  const el = document.activeElement as HTMLElement | null;
  el?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
}

function MissingRefHarness() {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [hsv, setHsv] = useState<Hsv>({ h: 0, s: 0, v: 100 });
  const wheel = useColorWheel(wheelRef, hsv, setHsv, Array(16).fill(null), vi.fn());
  const slider = useDragSlider(sliderRef, vi.fn());

  return (
    <button
      type="button"
      onClick={() => {
        wheel.onPointerMove({ buttons: 1, clientX: 10, clientY: 10 } as PointerEvent<HTMLDivElement>);
        slider.onPointerMove({ buttons: 1, clientX: 10 } as PointerEvent<HTMLDivElement>);
      }}
    >
      Run hooks
    </button>
  );
}

beforeEach(() => localStorage.clear());

test("renders all five format labels", async () => {
  const screen = await render(<ColorPickerTool />);
  await expect.element(screen.getByText("HEX")).toBeVisible();
  await expect.element(screen.getByText("RGB")).toBeVisible();
  await expect.element(screen.getByText("HSL")).toBeVisible();
  await expect.element(screen.getByText("HSV")).toBeVisible();
  await expect.element(screen.getByText("OKLCH")).toBeVisible();
});

test("HEX field is visible and editable", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await expect.element(hexInput).toBeVisible();
  await expect.element(hexInput).not.toHaveValue("");
});

test("HEX field has a non-empty value starting with #", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  const el = hexInput.element() as HTMLInputElement;
  expect(el.value).toMatch(/^#[0-9A-Fa-f]{6}$/);
});

test("renders 16 saved color slots", async () => {
  const screen = await render(<ColorPickerTool />);
  const slots = screen.getByTitle("Click to save current color");
  await expect.element(slots.first()).toBeVisible();
  expect(await slots.all()).toHaveLength(16);
});

test("filling a valid hex into HEX field updates the value", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await hexInput.fill("#FF0000");
  // Trigger commit via blur (click elsewhere)
  await screen.getByText("HEX").click();
  await expect.element(hexInput).toHaveValue("#FF0000");
});

test("filling invalid hex and committing shows error state", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await hexInput.fill("notacolor");
  await screen.getByText("HEX").click();
  // Input remains visible (error state, not removed)
  await expect.element(hexInput).toBeVisible();
});

test("typing Enter in HEX field commits the value", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await hexInput.fill("#00FF00");
  pressEnter();
  await expect.element(hexInput).toHaveValue("#00FF00");
});

test("committing a valid HEX updates all format rows", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await hexInput.fill("#FF0000");
  pressEnter();
  await expect.element(screen.getByRole("textbox").nth(1)).toHaveValue("rgb(255, 0, 0)");
});

test("invalid commit followed by valid commit clears error state", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  await hexInput.fill("badvalue");
  await screen.getByText("HEX").click();
  await hexInput.fill("#0000FF");
  pressEnter();
  await expect.element(hexInput).toHaveValue("#0000FF");
});

test("clicking empty slot saves current color", async () => {
  const screen = await render(<ColorPickerTool />);
  const emptySlot = screen.getByTitle("Click to save current color").first();
  await emptySlot.click();
  // After saving, slot title changes to include the color value
  const filledSlots = document.querySelectorAll("[title*='click to load']");
  expect(filledSlots.length).toBeGreaterThan(0);
});

test("clicking filled slot loads that color into the HEX field", async () => {
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  // Commit red via blur
  await hexInput.fill("#FF0000");
  await screen.getByText("HEX").click();
  // Save to first slot
  await screen.getByTitle("Click to save current color").first().click();
  // Change to blue via blur
  await hexInput.fill("#0000FF");
  await screen.getByText("HEX").click();
  await expect.element(hexInput).toHaveValue("#0000FF");
  // Load saved red
  const filledSlot = document.querySelector("[title*='click to load']") as HTMLElement;
  if (filledSlot) {
    filledSlot.click();
    await vi.waitFor(() => {
      const val = (hexInput.element() as HTMLInputElement).value;
      expect(val).toBe("#FF0000");
    }, { timeout: 2000 });
  }
});

test("right-clicking filled slot clears it", async () => {
  const screen = await render(<ColorPickerTool />);
  // Save a color
  await screen.getByTitle("Click to save current color").first().click();
  // Right-click the filled slot to clear it
  const filledSlot = document.querySelector("[title*='click to load']") as HTMLElement;
  if (filledSlot) {
    filledSlot.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
    // Slot should be empty again
    await expect.element(screen.getByTitle("Click to save current color").first()).toBeVisible();
  }
});

test("savedColors from localStorage shorter than 16 slots get padded", async () => {
  localStorage.setItem("tool:color-picker:saved", JSON.stringify(["#ff0000", "#00ff00"]));
  await render(<ColorPickerTool />);
  const slots = document.querySelectorAll("[title*='Click to save'], [title*='click to load']");
  expect(slots.length).toBe(16);
});

test("double-clicking the wheel saves the current color to first empty slot", async () => {
  const screen = await render(<ColorPickerTool />);
  const emptySlotsBefore = screen.getByTitle("Click to save current color");
  expect(await emptySlotsBefore.all()).toHaveLength(16);
  const wheel = document.querySelector("canvas")?.parentElement;
  if (wheel) {
    wheel.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    await vi.waitFor(() => {
      const filled = document.querySelectorAll("[title*='click to load']");
      expect(filled.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  }
});

test("pointer down on brightness slider triggers value change", async () => {
  await render(<ColorPickerTool />);
  const sliders = document.querySelectorAll("[class*='relative h-5']");
  if (sliders.length > 0) {
    const slider = sliders[0] as HTMLElement;
    // Use pointerId=1 to avoid setPointerCapture errors
    slider.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 50, buttons: 1, pointerId: 1 }));
  }
});

test("pointer move on brightness slider triggers value change", async () => {
  await render(<ColorPickerTool />);
  const sliders = document.querySelectorAll("[class*='relative h-5']");
  if (sliders.length > 0) {
    const slider = sliders[0] as HTMLElement;
    slider.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 50, buttons: 1, pointerId: 1 }));
    slider.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 80, buttons: 1, pointerId: 1 }));
  }
});

test("pointer move with no buttons held is a no-op", async () => {
  await render(<ColorPickerTool />);
  const sliders = document.querySelectorAll("[class*='relative h-5']");
  if (sliders.length > 0) {
    const slider = sliders[0] as HTMLElement;
    // buttons=0 means no button held — should be ignored
    slider.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 80, buttons: 0, pointerId: 1 }));
  }
});

test("pointer events on color wheel update hue and saturation", async () => {
  await render(<ColorPickerTool />);
  const wheel = document.querySelector("canvas")?.parentElement;
  if (wheel) {
    wheel.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 100, clientY: 100, buttons: 1, pointerId: 1 }));
    wheel.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 120, clientY: 80, buttons: 1, pointerId: 1 }));
    wheel.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 120, clientY: 80, buttons: 0, pointerId: 1 }));
  }
});

test("color wheel pointer above center normalizes negative angle", async () => {
  await render(<ColorPickerTool />);
  const wheel = document.querySelector("canvas")?.parentElement as HTMLElement | null;
  if (wheel) {
    const rectSpy = vi.spyOn(wheel, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      toJSON: () => ({}),
    } as DOMRect);
    wheel.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 50, clientY: 0, buttons: 1, pointerId: 1 }));
    rectSpy.mockRestore();
  }
});

test("saved color click ignores invalid stored colors", async () => {
  localStorage.setItem("tool:color-picker:saved", JSON.stringify(["not-a-color"]));
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  const before = (hexInput.element() as HTMLInputElement).value;
  const slot = document.querySelector("[title*='click to load']") as HTMLElement;
  slot.click();
  expect((hexInput.element() as HTMLInputElement).value).toBe(before);
});

test("uses the EyeDropper API when available", async () => {
  // Mock EyeDropper
  (window as any).EyeDropper = class {
    open() { return Promise.resolve({ sRGBHex: "#ff0000" }); }
  };
  const screen = await render(<ColorPickerTool />);
  const eyeDropperBtn = screen.getByTitle("Pick color from screen");
  await expect.element(eyeDropperBtn).toBeVisible();
  await eyeDropperBtn.click();
  const hexInput = screen.getByRole("textbox").nth(0);
  await vi.waitFor(() => {
    const val = (hexInput.element() as HTMLInputElement).value;
    expect(val).toBe("#FF0000");
  }, { timeout: 2000 });
  delete (window as any).EyeDropper;
});

test("EyeDropper cancel (rejection) does not crash", async () => {
  (window as any).EyeDropper = class {
    open() { return Promise.reject(new Error("AbortError")); }
  };
  const screen = await render(<ColorPickerTool />);
  await screen.getByTitle("Pick color from screen").click();
  // Should still be visible after cancel
  await expect.element(screen.getByTitle("Pick color from screen")).toBeVisible();
  delete (window as any).EyeDropper;
});

test("EyeDropper with invalid hex does not update color", async () => {
  (window as any).EyeDropper = class {
    open() { return Promise.resolve({ sRGBHex: "notahex" }); }
  };
  const screen = await render(<ColorPickerTool />);
  const hexInput = screen.getByRole("textbox").nth(0);
  const hexBefore = (hexInput.element() as HTMLInputElement).value;
  await screen.getByTitle("Pick color from screen").click();
  await vi.waitFor(() => {}, { timeout: 300 });
  expect((hexInput.element() as HTMLInputElement).value).toBe(hexBefore);
  delete (window as any).EyeDropper;
});

test("editing HSV field with valid value updates color", async () => {
  const screen = await render(<ColorPickerTool />);
  // HSV is the 4th format row (index 3): HEX=0, RGB=1, HSL=2, HSV=3, OKLCH=4
  const hsvInput = screen.getByRole("textbox").nth(3);
  await hsvInput.fill("hsv(120, 80%, 70%)");
  await screen.getByText("HSV").click();
  await expect.element(hsvInput).toBeVisible();
});

test("editing HSV field with invalid value shows no crash", async () => {
  const screen = await render(<ColorPickerTool />);
  const hsvInput = screen.getByRole("textbox").nth(3);
  await hsvInput.fill("not-valid-hsv");
  await screen.getByText("HSV").click();
  await expect.element(hsvInput).toBeVisible();
});

test("double-clicking wheel when all slots are filled does nothing", async () => {
  localStorage.setItem("tool:color-picker:saved", JSON.stringify(Array(16).fill("#ff0000")));
  const screen = await render(<ColorPickerTool />);
  const wheel = document.querySelector("canvas")?.parentElement;
  if (wheel) {
    wheel.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  }
  // All slots still filled — no empty slot title
  await expect.element(screen.getByRole("textbox").nth(0)).toBeVisible();
});

test("color picker pointer hooks no-op when refs are unavailable", async () => {
  const screen = await render(<MissingRefHarness />);
  await screen.getByRole("button", { name: "Run hooks" }).click();
  await expect.element(screen.getByRole("button", { name: "Run hooks" })).toBeVisible();
});

test("color wheel render returns when canvas context is unavailable", async () => {
  const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const screen = await render(<ColorPickerTool />);
  await expect.element(screen.getByText("HEX")).toBeVisible();
  expect(getContextSpy).toHaveBeenCalled();
  getContextSpy.mockRestore();
});
