import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

test("renders trigger and opens content on click", async () => {
  const screen = await render(
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
        <DropdownMenuItem>Item 2</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await screen.getByRole("button", { name: "Open" }).click();
  await expect.element(screen.getByText("Item 1")).toBeVisible();
  await expect.element(screen.getByText("Item 2")).toBeVisible();
});

test("renders DropdownMenuLabel inside open menu", async () => {
  const screen = await render(
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Label</DropdownMenuLabel>
        <DropdownMenuItem>Option</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await screen.getByRole("button", { name: "Open" }).click();
  await expect.element(screen.getByText("My Label")).toBeVisible();
});

test("renders DropdownMenuSeparator inside open menu", async () => {
  await render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>A</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>B</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const sep = document.querySelector('[data-slot="dropdown-menu-separator"]');
  expect(sep).not.toBeNull();
});

test("renders DropdownMenuCheckboxItem with checked state", async () => {
  await render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked>Checked option</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const item = document.querySelector('[data-slot="dropdown-menu-checkbox-item"]');
  expect(item).not.toBeNull();
  expect(item?.getAttribute("data-state")).toBe("checked");
});

test("renders DropdownMenuRadioGroup with DropdownMenuRadioItem", async () => {
  await render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const items = document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]');
  expect(items.length).toBe(2);
});

test("renders DropdownMenuGroup wrapping items", async () => {
  await render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>Grouped</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const group = document.querySelector('[data-slot="dropdown-menu-group"]');
  expect(group).not.toBeNull();
});

test("renders DropdownMenuShortcut", async () => {
  await render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          Save <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const shortcut = document.querySelector('[data-slot="dropdown-menu-shortcut"]');
  expect(shortcut?.textContent).toBe("⌘S");
});

test("renders DropdownMenuSub with SubTrigger and SubContent", async () => {
  const screen = await render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await expect.element(screen.getByText("More")).toBeVisible();
});

test("renders DropdownMenuItem with destructive variant", async () => {
  await render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const item = document.querySelector('[data-variant="destructive"]');
  expect(item).not.toBeNull();
});

test("renders DropdownMenuLabel with inset prop", async () => {
  await render(
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const label = document.querySelector('[data-slot="dropdown-menu-label"]');
  expect(label?.getAttribute("data-inset")).toBe("true");
});
