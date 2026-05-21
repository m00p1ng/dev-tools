import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Onboarding } from "../Onboarding";
import { TOOLS } from "@/tools";

function rect(overrides: Partial<DOMRect> = {}): DOMRect {
  const left = overrides.left ?? 0;
  const top = overrides.top ?? 0;
  const width = overrides.width ?? 100;
  const height = overrides.height ?? 80;

  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect;
}

test("renders title and all category names", async () => {
  const screen = await render(<Onboarding onComplete={vi.fn()} />);
  await expect.element(screen.getByText("Dev Tools")).toBeVisible();
  for (const group of new Set(TOOLS.map((tool) => tool.group))) {
    await expect.element(screen.getByText(group, { exact: true })).toBeVisible();
  }
});

test("Get started calls onComplete with no toolId after animation", async () => {
  const onComplete = vi.fn();
  const screen = await render(<Onboarding onComplete={onComplete} />);
  const cta = screen.getByRole("button", { name: "Get started" });
  const button = cta.element() as HTMLButtonElement;
  button.click();
  await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(undefined), { timeout: 1500 });
});

test("launch ignores repeated clicks while exit animation is running", async () => {
  const onComplete = vi.fn();
  const screen = await render(<Onboarding onComplete={onComplete} />);
  const cta = screen.getByRole("button", { name: "Get started" }).element() as HTMLButtonElement;
  cta.click();
  await vi.waitFor(() => {
    expect((cta.closest(".fixed") as HTMLElement).style.pointerEvents).toBe("none");
  }, { timeout: 1000 });
  cta.click();
  await vi.waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1), { timeout: 1500 });
});

test("clicking a category card calls onComplete with that group's first tool id", async () => {
  const onComplete = vi.fn();
  const screen = await render(<Onboarding onComplete={onComplete} />);
  await screen.getByRole("button", { name: /^Time/ }).click();
  const firstTimeTool = TOOLS.find((t) => t.group === "Time")!;
  await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(firstTimeTool.id), { timeout: 1500 });
});

test("shows tool count per category", async () => {
  const screen = await render(<Onboarding onComplete={vi.fn()} />);
  const dataTools = TOOLS.filter((t) => t.group === "Data").length;
  await expect.element(screen.getByRole("button", { name: new RegExp(`^Data.*${dataTools} tools`) })).toBeVisible();
});

test("desktop pointer interactions update hover affordances", async () => {
  Object.defineProperty(navigator, "maxTouchPoints", {
    configurable: true,
    value: 0,
  });
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: false,
    media: "(pointer: coarse)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList);

  const screen = await render(<Onboarding onComplete={vi.fn()} />);
  const timeCard = screen.getByRole("button", { name: /^Time/ }).element() as HTMLButtonElement;
  vi.spyOn(timeCard, "getBoundingClientRect").mockReturnValue(rect({ width: 120, height: 90 }));

  timeCard.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  timeCard.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 80, clientY: 35 }));
  timeCard.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  timeCard.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  timeCard.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

  const grid = timeCard.closest(".relative.w-full") as HTMLDivElement;
  vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(rect({ left: 10, top: 20, width: 400, height: 200 }));
  grid.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 180, clientY: 95 }));
  grid.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

  const cta = screen.getByRole("button", { name: "Get started" }).element() as HTMLButtonElement;
  vi.spyOn(cta, "getBoundingClientRect").mockReturnValue(rect({ width: 160, height: 40 }));
  cta.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 125, clientY: 30 }));
  cta.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

  await expect.element(screen.getByText("click a category to jump in", { exact: false })).toBeVisible();
  vi.restoreAllMocks();
});

test("touch devices skip desktop pointer effects", async () => {
  Object.defineProperty(navigator, "maxTouchPoints", {
    configurable: true,
    value: 1,
  });

  const screen = await render(<Onboarding onComplete={vi.fn()} />);
  const timeCard = screen.getByRole("button", { name: /^Time/ }).element() as HTMLButtonElement;
  vi.spyOn(timeCard, "getBoundingClientRect").mockReturnValue(rect());
  timeCard.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 50, clientY: 20 }));
  timeCard.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

  const grid = timeCard.closest(".relative.w-full") as HTMLDivElement;
  vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(rect());
  grid.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 80, clientY: 30 }));

  await expect.element(screen.getByText("tap a category to jump in", { exact: false })).toBeVisible();
  Object.defineProperty(navigator, "maxTouchPoints", {
    configurable: true,
    value: 0,
  });
  vi.restoreAllMocks();
});
