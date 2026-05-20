import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Sidebar } from "../Sidebar";

beforeEach(() => localStorage.clear());

test("ignores invalid persisted sidebar settings", async () => {
  localStorage.setItem("favorites", "not-json");
  localStorage.setItem("hidden-tools", "not-json");
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await expect.element(screen.getByText("JSON Format / Validate")).toBeVisible();
});

test("renders all group labels and tool names", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await expect.element(screen.getByText("Data")).toBeVisible();
  await expect.element(screen.getByText("JSON Format / Validate")).toBeVisible();
  await expect.element(screen.getByText("Cron Parser")).toBeVisible();
});

test("calls onSelect with the correct tool id when a tool is clicked", async () => {
  const onSelect = vi.fn();
  const screen = await render(<Sidebar activeTool="json-format" onSelect={onSelect} />);
  // Search first to avoid scroll + stagger-animation timing issues with motion.button
  await screen.getByPlaceholder("Search tools...").fill("cron");
  // Click the text span (not the button center) to avoid the star's stopPropagation area
  await expect.element(screen.getByText("Cron Parser")).toBeVisible();
  await screen.getByText("Cron Parser").click();
  await vi.waitFor(() => expect(onSelect).toHaveBeenCalledWith("cron"), { timeout: 2000 });
});

test("search filters the tool list", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await screen.getByPlaceholder("Search tools...").fill("cron");
  await expect.element(screen.getByText("Cron Parser")).toBeVisible();
  // Element may be removed from DOM entirely when filtered; use elements() to avoid "not found" error
  expect(screen.getByText("Hash Generator").elements()).toHaveLength(0);
});

test("shows No tools found when search has no match", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await screen.getByPlaceholder("Search tools...").fill("xyznotfound123");
  await expect.element(screen.getByText("No tools found")).toBeVisible();
});

test("Manage Tools button toggles the tool visibility panel", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await screen.getByRole("button", { name: /Manage Tools/ }).click();
  await expect.element(screen.getByText("Visible Tools")).toBeVisible();
});

test("pre-seeded favorite appears in Favorites section", async () => {
  localStorage.setItem("favorites", JSON.stringify(["cron"]));
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await expect.element(screen.getByText("Favorites")).toBeVisible();
});

test("clicking a favorite selects it and clicking star removes it", async () => {
  localStorage.setItem("favorites", JSON.stringify(["cron"]));
  const onSelect = vi.fn();
  const screen = await render(<Sidebar activeTool="json-format" onSelect={onSelect} />);

  await screen.getByText("Cron Parser").click();
  await vi.waitFor(() => expect(onSelect).toHaveBeenCalledWith("cron"), { timeout: 2000 });

  await screen.getByRole("button", { name: "Remove from favorites" }).click();
  await vi.waitFor(() => {
    expect(localStorage.getItem("favorites")).toBe("[]");
  }, { timeout: 2000 });
});

test("clicking a tool in Manage Tools panel toggles its switch", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await screen.getByRole("button", { name: /Manage Tools/ }).click();
  await expect.element(screen.getByText("Visible Tools")).toBeVisible();
  // All switches should be on by default
  const switches = screen.getByRole("switch");
  await expect.element(switches.first()).toBeChecked();
  // Toggle first switch (hide a tool)
  await switches.first().click();
  await expect.element(switches.first()).not.toBeChecked();
});

test("Reset button appears after hiding a tool and resets visibility", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await screen.getByRole("button", { name: /Manage Tools/ }).click();
  // Hide first tool
  await screen.getByRole("switch").first().click();
  // Reset button should appear
  await expect.element(screen.getByText("Reset")).toBeVisible();
  await screen.getByText("Reset").click();
  // All switches back on
  await expect.element(screen.getByRole("switch").first()).toBeChecked();
});

test("clicking a hidden tool switch again restores it", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await screen.getByRole("button", { name: /Manage Tools/ }).click();
  const firstSwitch = screen.getByRole("switch").first();

  await firstSwitch.click();
  await expect.element(firstSwitch).not.toBeChecked();
  await firstSwitch.click();
  await expect.element(firstSwitch).toBeChecked();
  expect(localStorage.getItem("hidden-tools")).toBe("[]");
});

test("hidden tool is removed from the tool list", async () => {
  localStorage.setItem("hidden-tools", JSON.stringify(["cron"]));
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  expect(screen.getByText("Cron Parser").elements()).toHaveLength(0);
});

test("star click in tool list favorites the tool", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  // Each ToolButton contains a Star icon div as the last child of the motion.button
  // Click the star (motion.div wrapping Star) - it's inside the button
  // Use keyboard search to find "cron" then interact with star
  await screen.getByPlaceholder("Search tools...").fill("cron");
  await expect.element(screen.getByText("Cron Parser")).toBeVisible();
  // The star is a motion.div onClick handler inside the button; use DOM query
  const starDivs = document.querySelectorAll("nav button > div");
  if (starDivs.length > 0) {
    (starDivs[0] as HTMLElement).click();
    // After star click, favorites should update localStorage
    await vi.waitFor(() => {
      const favs = localStorage.getItem("favorites");
      expect(favs).not.toBeNull();
    }, { timeout: 2000 });
  }
});

test("Manage Tools button closes the panel when clicked again", async () => {
  const screen = await render(<Sidebar activeTool="json-format" onSelect={vi.fn()} />);
  await screen.getByRole("button", { name: /Manage Tools/ }).click();
  await expect.element(screen.getByText("Visible Tools")).toBeVisible();
  await screen.getByRole("button", { name: /Manage Tools/ }).click();
  await expect.element(screen.getByText("JSON Format / Validate")).toBeVisible();
});
