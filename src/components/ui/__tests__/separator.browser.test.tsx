import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Separator } from "@/components/ui/separator";

test("renders a horizontal separator by default", async () => {
  await render(
    <div>
      <p>Above</p>
      <Separator />
      <p>Below</p>
    </div>,
  );
  const sep = document.querySelector('[data-slot="separator"]');
  expect(sep).not.toBeNull();
  expect(sep?.getAttribute("data-orientation")).toBe("horizontal");
});

test("renders a vertical separator", async () => {
  await render(<Separator orientation="vertical" />);
  const sep = document.querySelector('[data-slot="separator"]');
  expect(sep?.getAttribute("data-orientation")).toBe("vertical");
});

test("applies custom className", async () => {
  await render(<Separator className="my-custom-class" />);
  const sep = document.querySelector('[data-slot="separator"]');
  expect(sep?.classList.contains("my-custom-class")).toBe(true);
});
