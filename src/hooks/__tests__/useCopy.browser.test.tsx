import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useCopy } from "@/hooks/useCopy";

vi.mock("@/lib/copy", () => ({ copyToClipboard: vi.fn().mockResolvedValue(undefined) }));

function Fixture({ timeout = 50000 }: { timeout?: number }) {
  const { copied, copy } = useCopy(timeout);
  return (
    <div>
      <span>{copied ? "copied" : "idle"}</span>
      <button onClick={() => copy("hello")}>copy</button>
    </div>
  );
}

test("starts in idle state", async () => {
  const screen = await render(<Fixture />);
  await expect.element(screen.getByText("idle")).toBeVisible();
});

function FixtureNoTimeout() {
  const { copied, copy } = useCopy(); // no timeout → uses default 2000
  return (
    <div>
      <span>{copied ? "copied" : "idle"}</span>
      <button onClick={() => copy("hello")}>copy</button>
    </div>
  );
}

test("uses default timeout when none provided", async () => {
  const screen = await render(<FixtureNoTimeout />);
  await expect.element(screen.getByText("idle")).toBeVisible();
});

test("shows copied state after copy is called", async () => {
  vi.useFakeTimers();
  const screen = await render(<Fixture />);
  await screen.getByRole("button", { name: "copy" }).click();
  await expect.element(screen.getByText("copied")).toBeVisible();
  vi.advanceTimersByTime(50000);
  await expect.element(screen.getByText("idle")).toBeVisible();
  vi.useRealTimers();
});
