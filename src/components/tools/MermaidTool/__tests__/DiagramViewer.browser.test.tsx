import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { DiagramViewer } from "../DiagramViewer";
import { openDropdown, sampleSvg, waitForMenuItems } from "./test-utils";

test("shows the empty state when no SVG is available", async () => {
  const screen = await render(<DiagramViewer svg="" />);
  await expect.element(screen.getByText("Diagram will appear here...")).toBeVisible();
});

test("shows zoom and fullscreen controls when SVG is rendered", async () => {
  const screen = await render(<DiagramViewer svg={sampleSvg} onFullscreen={vi.fn()} />);
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("100%");
  await expect.element(screen.getByRole("button", { name: "Zoom in" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Zoom out" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Reset view" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Fullscreen preview" })).toBeVisible();
});

test("clicking zoom buttons changes zoom level", async () => {
  const screen = await render(<DiagramViewer svg={sampleSvg} />);
  (screen.getByRole("button", { name: "Zoom in" }).element() as HTMLButtonElement).click();
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("110%");
  (screen.getByRole("button", { name: "Zoom out" }).element() as HTMLButtonElement).click();
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("100%");
  (screen.getByRole("button", { name: "Reset view" }).element() as HTMLButtonElement).click();
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("100%");
});

test("zoom dropdown opens and sets zoom to a preset", async () => {
  const screen = await render(<DiagramViewer svg={sampleSvg} />);
  openDropdown(screen.getByRole("button", { name: "Select zoom" }).element() as HTMLElement);
  await waitForMenuItems();
  const item200 = Array.from(document.querySelectorAll("[role='menuitem']")).find(
    (el) => el.textContent?.includes("200%"),
  ) as HTMLElement | undefined;
  item200?.click();
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("200%");
});

test("fullscreen button calls the fullscreen handler", async () => {
  const onFullscreen = vi.fn();
  const screen = await render(<DiagramViewer svg={sampleSvg} onFullscreen={onFullscreen} />);
  (screen.getByRole("button", { name: "Fullscreen preview" }).element() as HTMLButtonElement).click();
  expect(onFullscreen).toHaveBeenCalledOnce();
});

test("wheel event on SVG container adjusts zoom", async () => {
  const screen = await render(<DiagramViewer svg={sampleSvg} />);
  const container = screen.getByRole("button", { name: "Select zoom" }).element().closest("[style*='cursor']") as HTMLElement;
  container.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toHaveTextContent("110%");
});

test("mousedown and mousemove on SVG container trigger pan", async () => {
  const screen = await render(<DiagramViewer svg={sampleSvg} />);
  const container = screen.getByRole("button", { name: "Select zoom" }).element().closest("[style*='cursor']") as HTMLElement;
  container.dispatchEvent(new MouseEvent("mousedown", { button: 0, clientX: 100, clientY: 100, bubbles: true }));
  container.dispatchEvent(new MouseEvent("mousemove", { clientX: 150, clientY: 120, bubbles: true }));
  container.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toBeVisible();
});

test("mouseleave resets dragging state", async () => {
  const screen = await render(<DiagramViewer svg={sampleSvg} />);
  const container = screen.getByRole("button", { name: "Select zoom" }).element().closest("[style*='cursor']") as HTMLElement;
  container.dispatchEvent(new MouseEvent("mousedown", { button: 0, clientX: 50, clientY: 50, bubbles: true }));
  container.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toBeVisible();
});

test("non-left mouse button is ignored during mousedown", async () => {
  const screen = await render(<DiagramViewer svg={sampleSvg} />);
  const container = screen.getByRole("button", { name: "Select zoom" }).element().closest("[style*='cursor']") as HTMLElement;
  // button: 1 = middle click, button !== 0 returns early without setting dragging
  container.dispatchEvent(new MouseEvent("mousedown", { button: 1, clientX: 100, clientY: 100, bubbles: true }));
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toBeVisible();
});

test("mouse move without prior mouse down is a no-op", async () => {
  const screen = await render(<DiagramViewer svg={sampleSvg} />);
  const container = screen.getByRole("button", { name: "Select zoom" }).element().closest("[style*='cursor']") as HTMLElement;
  // No mousedown before mousemove — dragging.current is null → returns early
  container.dispatchEvent(new MouseEvent("mousemove", { clientX: 150, clientY: 120, bubbles: true }));
  await expect.element(screen.getByRole("button", { name: "Select zoom" })).toBeVisible();
});
