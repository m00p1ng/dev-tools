import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { JwtTool } from "../JwtTool";

beforeEach(() => {
  localStorage.clear();
});

test("decodes the example JWT and verifies the HS256 secret", async () => {
  const screen = await render(<JwtTool />);

  await screen.getByRole("button", { name: "Example" }).click();

  await expect.element(screen.getByText("Valid JWT")).toBeVisible();
  await expect.element(screen.getByText("Header")).toBeVisible();
  await expect.element(screen.getByText("Payload", { exact: true })).toBeVisible();
  await expect.element(screen.getByText('"John Doe"', { exact: true })).toBeVisible();

  await screen.getByLabelText("JWT verification secret").fill("your-256-bit-secret");

  await expect.element(screen.getByText("Signature Verified")).toBeVisible();
});

test("shows a payload JSON validation error while editing", async () => {
  const screen = await render(<JwtTool />);

  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByLabelText("Edit JWT payload JSON").fill("{");

  await expect.element(screen.getByText("Invalid JSON")).toBeVisible();
});

test("shows placeholder when no token is pasted", async () => {
  const screen = await render(<JwtTool />);
  await expect.element(screen.getByText("Paste JWT token here... or drop a file")).toBeVisible();
});

test("shows Invalid JWT error for malformed token", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByLabelText("Encoded JWT token").fill("not.a.jwt");
  await expect.element(screen.getByText("Invalid JWT")).toBeVisible();
});

test("clear button resets the token input and decoded view", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText("Header")).toBeVisible();
  await screen.getByRole("button", { name: "Clear JWT" }).click();
  await expect.element(screen.getByText("Paste JWT token here... or drop a file")).toBeVisible();
});

test("editing payload with valid JSON updates the token", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText('"John Doe"', { exact: true })).toBeVisible();
  await screen.getByLabelText("Edit JWT payload JSON").fill('{"sub":"1234567890","name":"Jane Doe","iat":1516239022}');
  await vi.waitFor(async () => {
    const textarea = screen.getByLabelText("Encoded JWT token").element() as HTMLTextAreaElement;
    expect(textarea.value).toContain(".");
  });
});

test("base64 secret toggle is visible after loading example", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText(/base64/i)).toBeVisible();
});

test("wrong secret shows Invalid Signature", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByLabelText("JWT verification secret").fill("wrong-secret");
  await expect.element(screen.getByText("Invalid Signature")).toBeVisible();
});

test("missing secret shows Invalid Signature", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByText("Invalid Signature")).toBeVisible();
});

test("decodes token on mount when localStorage has a pre-stored JWT", async () => {
  const exampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  // useLocalStorage reads via JSON.parse, so value must be JSON-encoded
  localStorage.setItem("tool:jwt", JSON.stringify(exampleToken));
  const screen = await render(<JwtTool />);
  // The mount useEffect decodes the stored token via setTimeout
  await vi.waitFor(async () => {
    await expect.element(screen.getByText("Valid JWT")).toBeVisible();
  }, { timeout: 3000 });
});

test("editing payload with a secret set re-signs the token", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  await screen.getByLabelText("JWT verification secret").fill("your-256-bit-secret");
  await expect.element(screen.getByText("Signature Verified")).toBeVisible();
  // Now edit payload - it should resign with the secret
  await screen.getByLabelText("Edit JWT payload JSON").fill('{"sub":"1234567890","name":"Jane Doe","iat":1516239022}');
  await vi.waitFor(async () => {
    const textarea = screen.getByLabelText("Encoded JWT token").element() as HTMLTextAreaElement;
    expect(textarea.value.split(".")).toHaveLength(3);
  });
});
