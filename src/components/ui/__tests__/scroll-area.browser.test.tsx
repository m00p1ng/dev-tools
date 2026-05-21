import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { ScrollArea, ScrollBar } from "../scroll-area";

beforeEach(() => {
  document.documentElement.classList.remove("dark");
});

test("ScrollArea renders children", async () => {
  const screen = await render(
    <ScrollArea>
      <div>scroll content</div>
    </ScrollArea>,
  );
  await expect.element(screen.getByText("scroll content")).toBeVisible();
});

test("ScrollBar renders with default vertical orientation", async () => {
  await render(
    <ScrollArea>
      <ScrollBar />
    </ScrollArea>,
  );
});

test("ScrollBar renders with horizontal orientation", async () => {
  await render(
    <ScrollArea>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>,
  );
});
