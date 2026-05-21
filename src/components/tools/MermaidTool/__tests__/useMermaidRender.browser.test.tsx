import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useMermaidRender } from "../useMermaidRender";

function RenderHarness({ input }: { input: string }) {
  const { svg, error, isDark } = useMermaidRender(input);

  return (
    <div>
      <span data-testid="theme">{isDark ? "dark" : "light"}</span>
      <span data-testid="error">{error}</span>
      <div data-testid="svg" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

beforeEach(() => {
  document.documentElement.classList.remove("dark");
});

test("renders SVG after valid mermaid input", async () => {
  await render(<RenderHarness input="graph TD; A-->B;" />);
  await vi.waitFor(() => {
    expect(document.querySelector("svg")).not.toBeNull();
  }, { timeout: 5000 });
});

test("shows an error for invalid mermaid syntax", async () => {
  const screen = await render(<RenderHarness input="not valid mermaid syntax @@@" />);
  await vi.waitFor(async () => {
    await expect.element(screen.getByTestId("error")).not.toHaveTextContent("");
  }, { timeout: 5000 });
});

test("clears SVG and error for empty input", async () => {
  const screen = await render(<RenderHarness input="" />);
  await expect.element(screen.getByTestId("svg")).toHaveTextContent("");
  await expect.element(screen.getByTestId("error")).toHaveTextContent("");
});

test("tracks dark mode class changes", async () => {
  const screen = await render(<RenderHarness input="" />);
  await expect.element(screen.getByTestId("theme")).toHaveTextContent("light");
  document.documentElement.classList.add("dark");
  await expect.element(screen.getByTestId("theme")).toHaveTextContent("dark");
  document.documentElement.classList.remove("dark");
  await expect.element(screen.getByTestId("theme")).toHaveTextContent("light");
});

test("renders in dark mode when dark class is preset", async () => {
  document.documentElement.classList.add("dark");
  const screen = await render(<RenderHarness input="" />);
  await expect.element(screen.getByTestId("theme")).toHaveTextContent("dark");
});

test("error without message property falls back to Invalid diagram", async () => {
  const mermaid = (await import("mermaid")).default;
  vi.spyOn(mermaid, "render").mockRejectedValueOnce(null);
  const screen = await render(<RenderHarness input="trigger error" />);
  await vi.waitFor(async () => {
    await expect.element(screen.getByTestId("error")).toHaveTextContent("Invalid diagram");
  }, { timeout: 3000 });
  vi.restoreAllMocks();
});
