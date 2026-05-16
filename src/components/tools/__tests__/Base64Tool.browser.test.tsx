import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Base64Tool } from "./Base64Tool";

beforeEach(() => localStorage.clear());

test("Example button fills input with example text", async () => {
  const screen = await render(<Base64Tool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Input text or Base64... or drop a file")).toHaveValue(
    "Hello, World!",
  );
});

test("Encode mode produces base64 output", async () => {
  const screen = await render(<Base64Tool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByPlaceholder("Output will appear here...")).toHaveValue(
    "SGVsbG8sIFdvcmxkIQ==",
  );
});

test("switching to Decode adopts encoded output into input", async () => {
  const screen = await render(<Base64Tool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByRole("button", { name: "Decode" }).click();
  await expect.element(screen.getByPlaceholder("Input text or Base64... or drop a file")).toHaveValue(
    "SGVsbG8sIFdvcmxkIQ==",
  );
  await expect.element(screen.getByPlaceholder("Output will appear here...")).toHaveValue(
    "Hello, World!",
  );
});
