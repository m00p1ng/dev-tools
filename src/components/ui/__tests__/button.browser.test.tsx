import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Button } from "@/components/ui/button";

test("renders with default variant and size (no props)", async () => {
  const screen = await render(<Button>Default</Button>);
  await expect.element(screen.getByRole("button", { name: "Default" })).toBeVisible();
});

test("renders destructive variant", async () => {
  const screen = await render(<Button variant="destructive">Delete</Button>);
  await expect.element(screen.getByRole("button", { name: "Delete" })).toBeVisible();
});

test("renders outline variant with sm size", async () => {
  const screen = await render(<Button variant="outline" size="sm">Outline</Button>);
  await expect.element(screen.getByRole("button", { name: "Outline" })).toBeVisible();
});

test("renders icon size", async () => {
  const screen = await render(<Button size="icon" aria-label="icon">✕</Button>);
  await expect.element(screen.getByRole("button", { name: "icon" })).toBeVisible();
});

test("asChild renders child element as button", async () => {
  const screen = await render(
    <Button asChild>
      <a href="#">Link Button</a>
    </Button>,
  );
  await expect.element(screen.getByRole("link", { name: "Link Button" })).toBeVisible();
});
