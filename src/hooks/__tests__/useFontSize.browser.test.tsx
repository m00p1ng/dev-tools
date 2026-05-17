import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useFontSize } from "@/hooks/useFontSize";

vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));

function Fixture() {
  const { fontSize, setFontSize } = useFontSize();
  return (
    <div>
      <span data-testid="size">{fontSize}</span>
      <button onClick={() => setFontSize(120)}>set-120</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.style.fontSize = "";
});

test("defaults to 100 when localStorage is empty", async () => {
  const screen = await render(<Fixture />);
  await expect.element(screen.getByTestId("size")).toHaveTextContent("100");
});

test("reads stored font size from localStorage on mount", async () => {
  localStorage.setItem("font-size", "150");
  const screen = await render(<Fixture />);
  await expect.element(screen.getByTestId("size")).toHaveTextContent("150");
});

test("setFontSize updates document.documentElement.style.fontSize", async () => {
  const screen = await render(<Fixture />);
  await screen.getByRole("button", { name: "set-120" }).click();
  await expect.element(screen.getByTestId("size")).toHaveTextContent("120");
  expect(document.documentElement.style.fontSize).toBe("120%");
});

test("setFontSize persists value to localStorage", async () => {
  const screen = await render(<Fixture />);
  await screen.getByRole("button", { name: "set-120" }).click();
  expect(localStorage.getItem("font-size")).toBe("120");
});

test("Ctrl+= zooms in by 5", async () => {
  localStorage.setItem("font-size", "100");
  const screen = await render(<Fixture />);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", ctrlKey: true, bubbles: true }));
  await expect.element(screen.getByTestId("size")).toHaveTextContent("105");
});

test("Ctrl+- zooms out by 5", async () => {
  localStorage.setItem("font-size", "100");
  const screen = await render(<Fixture />);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "-", ctrlKey: true, bubbles: true }));
  await expect.element(screen.getByTestId("size")).toHaveTextContent("95");
});

test("Ctrl+0 resets font size to 100", async () => {
  localStorage.setItem("font-size", "150");
  const screen = await render(<Fixture />);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "0", ctrlKey: true, bubbles: true }));
  await expect.element(screen.getByTestId("size")).toHaveTextContent("100");
});

test("Ctrl++ zooms in (plus key alias)", async () => {
  localStorage.setItem("font-size", "100");
  const screen = await render(<Fixture />);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "+", ctrlKey: true, bubbles: true }));
  await expect.element(screen.getByTestId("size")).toHaveTextContent("105");
});

test("zoom is clamped at MAX_SIZE (200)", async () => {
  localStorage.setItem("font-size", "200");
  const screen = await render(<Fixture />);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", ctrlKey: true, bubbles: true }));
  await expect.element(screen.getByTestId("size")).toHaveTextContent("200");
});

test("zoom is clamped at MIN_SIZE (50)", async () => {
  localStorage.setItem("font-size", "50");
  const screen = await render(<Fixture />);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "-", ctrlKey: true, bubbles: true }));
  await expect.element(screen.getByTestId("size")).toHaveTextContent("50");
});

test("non-zoom keys do nothing", async () => {
  localStorage.setItem("font-size", "100");
  const screen = await render(<Fixture />);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true }));
  await expect.element(screen.getByTestId("size")).toHaveTextContent("100");
});

test("keys without Ctrl/Meta modifier do nothing", async () => {
  localStorage.setItem("font-size", "100");
  const screen = await render(<Fixture />);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", bubbles: true }));
  await expect.element(screen.getByTestId("size")).toHaveTextContent("100");
});
