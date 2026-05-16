import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { ThemeToggle } from "../ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

test("shows Theme: light title when light theme is stored", async () => {
  localStorage.setItem("theme", "light");
  const screen = await render(<ThemeToggle />);
  await expect.element(screen.getByTitle("Theme: light")).toBeVisible();
});

test("shows Theme: dark title when dark theme is stored", async () => {
  localStorage.setItem("theme", "dark");
  const screen = await render(<ThemeToggle />);
  await expect.element(screen.getByTitle("Theme: dark")).toBeVisible();
});

test("clicking the button toggles from light to dark", async () => {
  localStorage.setItem("theme", "light");
  const screen = await render(<ThemeToggle />);
  await screen.getByTitle("Theme: light").click();
  await expect.element(screen.getByTitle("Theme: dark")).toBeVisible();
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("clicking the button toggles from dark to light", async () => {
  localStorage.setItem("theme", "dark");
  const screen = await render(<ThemeToggle />);
  await screen.getByTitle("Theme: dark").click();
  await expect.element(screen.getByTitle("Theme: light")).toBeVisible();
  expect(document.documentElement.classList.contains("dark")).toBe(false);
});
