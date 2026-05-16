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
