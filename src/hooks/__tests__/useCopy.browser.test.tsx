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

test("shows copied state after copy is called", async () => {
  const screen = await render(<Fixture />);
  await screen.getByRole("button", { name: "copy" }).click();
  await expect.element(screen.getByText("copied")).toBeVisible();
});
