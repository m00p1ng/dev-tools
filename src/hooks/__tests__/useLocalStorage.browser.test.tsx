import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

function Fixture({ storageKey, initial }: { storageKey: string; initial: string }) {
  const [value, setValue] = useLocalStorage(storageKey, initial);
  return (
    <div>
      <p>{`val:${value}`}</p>
      <button onClick={() => setValue("one")}>save-one</button>
      <button onClick={() => setValue("two")}>save-two</button>
    </div>
  );
}

beforeEach(() => localStorage.clear());

test("returns initial value when key is absent", async () => {
  const screen = await render(<Fixture storageKey="absent" initial="hello" />);
  await expect.element(screen.getByText("val:hello")).toBeVisible();
});

test("reads pre-existing value from localStorage", async () => {
  localStorage.setItem("pre-key", JSON.stringify("stored"));
  const screen = await render(<Fixture storageKey="pre-key" initial="ignored" />);
  await expect.element(screen.getByText("val:stored")).toBeVisible();
});

test("persists new value to localStorage on state update", async () => {
  const screen = await render(<Fixture storageKey="write-key" initial="start" />);
  await screen.getByRole("button", { name: "save-one" }).click();
  await expect.element(screen.getByText("val:one")).toBeVisible();
  expect(JSON.parse(localStorage.getItem("write-key")!)).toBe("one");
});

test("subsequent updates overwrite previous value", async () => {
  const screen = await render(<Fixture storageKey="seq-key" initial="start" />);
  await screen.getByRole("button", { name: "save-one" }).click();
  await screen.getByRole("button", { name: "save-two" }).click();
  await expect.element(screen.getByText("val:two")).toBeVisible();
  expect(JSON.parse(localStorage.getItem("seq-key")!)).toBe("two");
});

test("falls back to initial value when stored value is invalid JSON", async () => {
  // Store corrupted JSON — JSON.parse will throw, catch returns initialValue
  localStorage.setItem("bad-json-key", "not-valid-json{{{");
  const screen = await render(<Fixture storageKey="bad-json-key" initial="fallback" />);
  await expect.element(screen.getByText("val:fallback")).toBeVisible();
});
