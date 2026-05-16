import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { useTheme } from "@/hooks/useTheme";

function Fixture() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <p>{`active:${theme}`}</p>
      <button onClick={() => setTheme("dark")}>switch-dark</button>
      <button onClick={() => setTheme("light")}>switch-light</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

test("reads persisted dark theme from localStorage", async () => {
  localStorage.setItem("theme", "dark");
  const screen = await render(<Fixture />);
  await expect.element(screen.getByText("active:dark")).toBeVisible();
});

test("reads persisted light theme from localStorage", async () => {
  localStorage.setItem("theme", "light");
  const screen = await render(<Fixture />);
  await expect.element(screen.getByText("active:light")).toBeVisible();
});

test("switching to dark adds dark class and persists to localStorage", async () => {
  localStorage.setItem("theme", "light");
  const screen = await render(<Fixture />);
  await screen.getByRole("button", { name: "switch-dark" }).click();
  await expect.element(screen.getByText("active:dark")).toBeVisible();
  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(localStorage.getItem("theme")).toBe("dark");
});

test("switching to light removes dark class and persists to localStorage", async () => {
  localStorage.setItem("theme", "dark");
  const screen = await render(<Fixture />);
  await screen.getByRole("button", { name: "switch-light" }).click();
  await expect.element(screen.getByText("active:light")).toBeVisible();
  expect(document.documentElement.classList.contains("dark")).toBe(false);
  expect(localStorage.getItem("theme")).toBe("light");
});
