import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Badge } from "@/components/ui/badge";

test("renders with default variant (no props)", async () => {
  const screen = await render(<Badge>Default</Badge>);
  await expect.element(screen.getByText("Default")).toBeVisible();
});

test("renders outline variant", async () => {
  const screen = await render(<Badge variant="outline">Outline</Badge>);
  await expect.element(screen.getByText("Outline")).toBeVisible();
});

test("renders secondary variant", async () => {
  const screen = await render(<Badge variant="secondary">Secondary</Badge>);
  await expect.element(screen.getByText("Secondary")).toBeVisible();
});

test("renders destructive variant", async () => {
  const screen = await render(<Badge variant="destructive">Error</Badge>);
  await expect.element(screen.getByText("Error")).toBeVisible();
});

test("asChild renders child element as badge", async () => {
  const screen = await render(
    <Badge asChild>
      <a href="#">Link Badge</a>
    </Badge>,
  );
  await expect.element(screen.getByRole("link", { name: "Link Badge" })).toBeVisible();
});
