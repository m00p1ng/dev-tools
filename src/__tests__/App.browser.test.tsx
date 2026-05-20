import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import App from "../App";

beforeEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 1024 });
});

test("renders the app header with tool title", async () => {
  localStorage.setItem("onboarding-v1", "true");
  const screen = await render(<App />);
  // The h1 in the header shows the active tool label
  await expect.element(screen.getByRole("heading")).toBeVisible();
});

test("shows onboarding when not seen before", async () => {
  const screen = await render(<App />);
  await expect.element(screen.getByText("Dev Tools")).toBeVisible();
});

test("onboarding Get started button works", async () => {
  const screen = await render(<App />);
  await expect.element(screen.getByText("Dev Tools")).toBeVisible();
  await screen.getByRole("button", { name: "Get started" }).click();
  // After animation, onboarding dismisses and header shows
  await vi.waitFor(async () => {
    const header = document.querySelector("header");
    expect(header).not.toBeNull();
  }, { timeout: 3000 });
});

test("clicking an onboarding category opens that tool", async () => {
  const screen = await render(<App />);
  await screen.getByRole("button", { name: /Timestamps & cron/ }).click();
  await vi.waitFor(async () => {
    await expect.element(screen.getByText("Current Unix Timestamp")).toBeVisible();
  }, { timeout: 3000 });
});

test("sidebar is rendered with navigation", async () => {
  localStorage.setItem("onboarding-v1", "true");
  await render(<App />);
  const nav = document.querySelector("nav");
  expect(nav).not.toBeNull();
});

test("sidebar toggle button hides sidebar", async () => {
  localStorage.setItem("onboarding-v1", "true");
  await render(<App />);
  // Toggle sidebar closed by clicking the first button in the header
  const toggleBtn = document.querySelector("header button") as HTMLElement;
  expect(toggleBtn).not.toBeNull();
  toggleBtn?.click();
  await vi.waitFor(() => {
    expect(document.querySelector("nav")).toBeNull();
  }, { timeout: 3000 });
});

test("sidebar auto hides on mobile resize and shows on desktop resize", async () => {
  localStorage.setItem("onboarding-v1", "true");
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((media: string) => ({
      matches: false,
      media,
      onchange: null,
      addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => true,
    }))
  );

  await render(<App />);
  expect(document.querySelector("nav")).not.toBeNull();
  await vi.waitFor(() => expect(listeners.size).toBeGreaterThan(0));

  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 500 });
  listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));

  await vi.waitFor(() => {
    expect(document.querySelector("nav")).toBeNull();
  }, { timeout: 3000 });

  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 1024 });
  listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent));

  await vi.waitFor(() => {
    expect(document.querySelector("nav")).not.toBeNull();
  }, { timeout: 3000 });
});

test("selecting a tool from sidebar renders tool content", async () => {
  localStorage.setItem("onboarding-v1", "true");
  const screen = await render(<App />);
  await screen.getByPlaceholder("Search tools...").fill("cron");
  await expect.element(screen.getByText("Cron Parser")).toBeVisible();
  await screen.getByText("Cron Parser").click();
  // Cron tool renders a cron expression input
  await vi.waitFor(async () => {
    await expect.element(screen.getByPlaceholder("* * * * *")).toBeVisible();
  }, { timeout: 5000 });
});

test("theme toggle button exists in header", async () => {
  localStorage.setItem("onboarding-v1", "true");
  await render(<App />);
  const header = document.querySelector("header");
  expect(header).not.toBeNull();
  const buttons = header!.querySelectorAll("button");
  expect(buttons.length).toBeGreaterThanOrEqual(2);
});

test("main content area renders ToolContent", async () => {
  localStorage.setItem("onboarding-v1", "true");
  await render(<App />);
  const main = document.querySelector("main");
  expect(main).not.toBeNull();
  expect(main!.innerHTML.length).toBeGreaterThan(0);
});
