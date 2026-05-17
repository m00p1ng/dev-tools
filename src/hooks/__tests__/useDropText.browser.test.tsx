import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useDropText } from "@/hooks/useDropText";

function DropFixture({ onDrop }: { onDrop: (text: string) => void }) {
  const { isDragging, dropProps } = useDropText(onDrop);
  return (
    <div {...dropProps} data-testid="zone">
      {isDragging ? "dragging" : "idle"}
    </div>
  );
}

test("initial state is idle", async () => {
  const screen = await render(<DropFixture onDrop={vi.fn()} />);
  await expect.element(screen.getByText("idle")).toBeVisible();
});

test("dragover sets isDragging to true", async () => {
  const screen = await render(<DropFixture onDrop={vi.fn()} />);
  const el = screen.getByTestId("zone").element();
  el.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
  await expect.element(screen.getByText("dragging")).toBeVisible();
});

test("dragleave resets isDragging when leaving to outside", async () => {
  const screen = await render(<DropFixture onDrop={vi.fn()} />);
  const el = screen.getByTestId("zone").element();
  el.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
  await expect.element(screen.getByText("dragging")).toBeVisible();
  // relatedTarget null means leaving to non-element (outside) — contains(null) = false
  el.dispatchEvent(new DragEvent("dragleave", { bubbles: true, cancelable: true, relatedTarget: null }));
  await expect.element(screen.getByText("idle")).toBeVisible();
});

test("drop with text data calls onDrop with the text", async () => {
  const onDrop = vi.fn();
  const screen = await render(<DropFixture onDrop={onDrop} />);
  const el = screen.getByTestId("zone").element();

  const dt = new DataTransfer();
  dt.setData("text/plain", "dropped text");
  el.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));

  await vi.waitFor(() => expect(onDrop).toHaveBeenCalledWith("dropped text"));
});

test("drop resets isDragging", async () => {
  const screen = await render(<DropFixture onDrop={vi.fn()} />);
  const el = screen.getByTestId("zone").element();
  el.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
  await expect.element(screen.getByText("dragging")).toBeVisible();
  const dt = new DataTransfer();
  el.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  await expect.element(screen.getByText("idle")).toBeVisible();
});

test("drop with file calls onDrop with the file text content", async () => {
  const onDrop = vi.fn();
  const screen = await render(<DropFixture onDrop={onDrop} />);
  const el = screen.getByTestId("zone").element();

  const dt = new DataTransfer();
  dt.items.add(new File(["file content"], "test.txt", { type: "text/plain" }));
  el.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));

  await vi.waitFor(() => expect(onDrop).toHaveBeenCalledWith("file content"), { timeout: 2000 });
});

test("dragleave with relatedTarget inside the zone does not reset isDragging", async () => {
  const screen = await render(<DropFixture onDrop={vi.fn()} />);
  const el = screen.getByTestId("zone").element();
  el.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
  await expect.element(screen.getByText("dragging")).toBeVisible();
  // relatedTarget is el itself (contained) — isDragging stays true
  el.dispatchEvent(new DragEvent("dragleave", { bubbles: true, cancelable: true, relatedTarget: el }));
  // Still dragging because contains(el) = true
  await expect.element(screen.getByText("dragging")).toBeVisible();
});
