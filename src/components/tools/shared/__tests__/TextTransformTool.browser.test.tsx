import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { TextTransformTool } from "../TextTransformTool";

const caseTransform = (input: string, mode: "upper" | "lower") =>
  mode === "upper" ? input.toUpperCase() : input.toLowerCase();

beforeEach(() => localStorage.clear());

test("Example button fills the input with the example text", async () => {
  const screen = await render(
    <TextTransformTool
      storageKey="test-ttt-1"
      initialMode="upper"
      inputPlaceholder="Enter text"
      outputPlaceholder="Output"
      example="hello world"
      transform={caseTransform}
    />,
  );
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Enter text")).toHaveValue("hello world");
});

test("output textarea reflects the transformed value", async () => {
  const screen = await render(
    <TextTransformTool
      storageKey="test-ttt-2"
      initialMode="upper"
      inputPlaceholder="Enter text"
      outputPlaceholder="Output"
      example="hello"
      transform={caseTransform}
    />,
  );
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Output")).toHaveValue("HELLO");
});

test("switching modes transforms the current input differently", async () => {
  const screen = await render(
    <TextTransformTool
      storageKey="test-ttt-3"
      initialMode="upper"
      modes={[
        { value: "upper", label: "Upper" },
        { value: "lower", label: "Lower" },
      ]}
      inputPlaceholder="Enter text"
      outputPlaceholder="Output"
      example="Hello World"
      transform={caseTransform}
    />,
  );
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Output")).toHaveValue("HELLO WORLD");
  await screen.getByRole("button", { name: "Lower" }).click();
  await expect.element(screen.getByPlaceholder("Output")).toHaveValue("hello world");
});

test("adoptOutputOnModeChange swaps output into input when switching modes", async () => {
  const screen = await render(
    <TextTransformTool
      storageKey="test-ttt-4"
      initialMode="upper"
      modes={[
        { value: "upper", label: "Upper" },
        { value: "lower", label: "Lower" },
      ]}
      inputPlaceholder="Enter text"
      outputPlaceholder="Output"
      example="hello"
      transform={caseTransform}
      adoptOutputOnModeChange
    />,
  );
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Output")).toHaveValue("HELLO");
  await screen.getByRole("button", { name: "Lower" }).click();
  // After adopt, input becomes "HELLO", output becomes "hello"
  await expect.element(screen.getByPlaceholder("Enter text")).toHaveValue("HELLO");
  await expect.element(screen.getByPlaceholder("Output")).toHaveValue("hello");
});

test("filling empty string clears both input and output", async () => {
  const screen = await render(
    <TextTransformTool
      storageKey="test-ttt-5"
      initialMode="upper"
      inputPlaceholder="Enter text"
      outputPlaceholder="Output"
      example="hello"
      transform={caseTransform}
    />,
  );
  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByPlaceholder("Enter text").fill("");
  await expect.element(screen.getByPlaceholder("Enter text")).toHaveValue("");
  await expect.element(screen.getByPlaceholder("Output")).toHaveValue("");
});

test("typing in input triggers transform immediately", async () => {
  const screen = await render(
    <TextTransformTool
      storageKey="test-ttt-6"
      initialMode="upper"
      inputPlaceholder="Enter text"
      outputPlaceholder="Output"
      example="x"
      transform={caseTransform}
    />,
  );
  await screen.getByPlaceholder("Enter text").fill("world");
  await expect.element(screen.getByPlaceholder("Output")).toHaveValue("WORLD");
});

const errorTransform = (input: string, _mode: "default") => {
  if (input === "bad") return { ok: false as const, error: "Transform failed" };
  return input;
};

test("transform error shows error badge", async () => {
  const screen = await render(
    <TextTransformTool
      storageKey="test-ttt-7"
      initialMode="default"
      inputPlaceholder="Enter text"
      outputPlaceholder="Output"
      example="x"
      transform={errorTransform}
    />,
  );
  await screen.getByPlaceholder("Enter text").fill("bad");
  await expect.element(screen.getByText("Transform failed")).toBeVisible();
});
