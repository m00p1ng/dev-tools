import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Slider } from "../slider";

test("renders with controlled value prop", async () => {
  const screen = await render(<Slider value={[50]} onValueChange={() => {}} />);
  await expect.element(screen.getByRole("slider")).toBeVisible();
  expect(screen.getByRole("slider").element().getAttribute("aria-valuenow")).toBe("50");
});

test("renders with defaultValue prop (uncontrolled)", async () => {
  const screen = await render(<Slider defaultValue={[30]} />);
  await expect.element(screen.getByRole("slider")).toBeVisible();
  expect(screen.getByRole("slider").element().getAttribute("aria-valuenow")).toBe("30");
});

test("renders with no value or defaultValue (uses [min, max])", async () => {
  // Neither value nor defaultValue — _values falls back to [min, max]
  await render(<Slider min={0} max={100} onValueChange={() => {}} />);
  const thumbs = document.querySelectorAll('[data-slot="slider-thumb"]');
  expect(thumbs.length).toBe(2);
});

test("applies custom className", async () => {
  await render(<Slider value={[25]} className="my-custom-class" onValueChange={() => {}} />);
  const root = document.querySelector("[data-slot='slider']");
  expect(root?.classList.contains("my-custom-class")).toBe(true);
});

test("min and max attributes are applied", async () => {
  const screen = await render(<Slider value={[10]} min={5} max={20} onValueChange={() => {}} />);
  const thumb = screen.getByRole("slider").element();
  expect(thumb.getAttribute("aria-valuemin")).toBe("5");
  expect(thumb.getAttribute("aria-valuemax")).toBe("20");
});
