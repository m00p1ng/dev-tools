import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import App from "../App";

beforeEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  history.replaceState(null, "", "/");
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 1024 });
});

test("renders the app header with tool title", async () => {
  localStorage.setItem("onboarding-v1", "true");
  const screen = await render(<App />);
  // The h1 in the header shows the active tool label
  await expect.element(screen.getByRole("heading")).toBeVisible();
});

test("uses a valid tool query parameter as the initial tool", async () => {
  localStorage.setItem("onboarding-v1", "true");
  history.replaceState(null, "", "/?tool=cron");
  const screen = await render(<App />);

  await expect.element(screen.getByRole("heading", { name: "Cron Parser" })).toBeVisible();
});

test("falls back when the tool query parameter is invalid", async () => {
  localStorage.setItem("onboarding-v1", "true");
  history.replaceState(null, "", "/?tool=missing");
  const screen = await render(<App />);

  await expect.element(screen.getByRole("heading", { name: "Unix Time Converter" })).toBeVisible();
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

test("mobile sidebar opens as an overlay and closes from the backdrop", async () => {
  localStorage.setItem("onboarding-v1", "true");
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 500 });
  await render(<App />);

  expect(document.querySelector("nav")).toBeNull();
  const toggleBtn = document.querySelector("header button") as HTMLElement;
  toggleBtn.click();

  await vi.waitFor(() => {
    expect(document.querySelector("nav")).not.toBeNull();
    const backdrop = Array.from(document.querySelectorAll("div")).find((el) =>
      el.className.toString().includes("bg-black/50"),
    );
    expect(backdrop).not.toBeUndefined();
    (backdrop as HTMLElement).click();
  });

  await vi.waitFor(() => {
    expect(document.querySelector("nav")).toBeNull();
  }, { timeout: 3000 });
});

test("selecting a mobile overlay tool closes the sidebar and updates the URL", async () => {
  localStorage.setItem("onboarding-v1", "true");
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 500 });
  const screen = await render(<App />);

  (document.querySelector("header button") as HTMLElement).click();
  await expect.element(screen.getByPlaceholder("Search tools...")).toBeVisible();
  await screen.getByPlaceholder("Search tools...").fill("cron");
  await screen.getByText("Cron Parser").click();

  await vi.waitFor(() => {
    expect(document.querySelector("nav")).toBeNull();
    expect(window.location.search).toContain("tool=cron");
  });
});

test("full width toggle changes the content wrapper", async () => {
  localStorage.setItem("onboarding-v1", "true");
  const screen = await render(<App />);
  const wrapper = document.querySelector("main > div") as HTMLElement;

  expect(wrapper.className).toContain("max-w-5xl");
  await screen.getByTitle("Full width").click();
  await vi.waitFor(() => {
    expect(wrapper.className).not.toContain("max-w-5xl");
  });
  await expect.element(screen.getByTitle("Constrain width")).toBeVisible();
});

test("full width toggle is hidden on mobile screens", async () => {
  localStorage.setItem("onboarding-v1", "true");
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 500 });
  const screen = await render(<App />);
  expect(screen.getByTitle("Full width").elements()).toHaveLength(0);
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
