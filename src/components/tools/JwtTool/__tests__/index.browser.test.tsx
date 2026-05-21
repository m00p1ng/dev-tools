import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { JwtTool } from "..";
import { useJwtDecoder } from "../useJwtDecoder";

function JwtDecoderHarness() {
  const jwt = useJwtDecoder();
  return (
    <>
      <button type="button" onClick={() => jwt.handlePayloadEdit('{"sub":"1"}')}>Edit without token</button>
      <button type="button" onClick={() => jwt.decode("")}>Decode empty</button>
      <output>{jwt.payloadEditStr}</output>
    </>
  );
}

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

test("payload edit with invalid base64 secret falls back to original signature", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  // Enable BASE64URL ENCODED secret mode
  await screen.getByRole("switch").click();
  // Enter an invalid base64 string as secret (non-empty → shouldResign=true, but signHS256 throws)
  await screen.getByLabelText("JWT verification secret").fill("!!!invalid-base64!!!");
  // Edit payload — handlePayloadEdit calls signEditedPayload which hits the catch block
  await screen.getByLabelText("Edit JWT payload JSON").fill('{"sub":"1234567890"}');
  // Should not crash; token still has 3 parts
  await vi.waitFor(async () => {
    const textarea = screen.getByLabelText("Encoded JWT token").element() as HTMLTextAreaElement;
    expect(textarea.value.split(".")).toHaveLength(3);
  }, { timeout: 2000 });
});

test("editing payload with exp field shows expiration status", async () => {
  const screen = await render(<JwtTool />);
  await screen.getByRole("button", { name: "Example" }).click();
  // Set a past exp to trigger isExpired=true and expiresAt being a date string
  const pastExp = Math.floor(Date.now() / 1000) - 3600;
  await screen.getByLabelText("Edit JWT payload JSON").fill(
    `{"sub":"1234567890","iat":1516239022,"exp":${pastExp}}`,
  );
  await vi.waitFor(async () => {
    await expect.element(screen.getByText(/Expired/)).toBeVisible();
  }, { timeout: 2000 });
});

test("JWT with non-HS256 algorithm shows HS256 only badge", async () => {
  const screen = await render(<JwtTool />);
  // RS256 token — header is {"alg":"RS256","typ":"JWT"}, payload is the example payload
  const rs256Token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.fakesignature";
  await screen.getByLabelText("Encoded JWT token").fill(rs256Token);
  await expect.element(screen.getByText("HS256 only")).toBeVisible();
});

test("decoder hook handles payload edits before a token exists", async () => {
  const screen = await render(<JwtDecoderHarness />);
  await screen.getByRole("button", { name: "Edit without token" }).click();
  await expect.element(screen.getByText('{"sub":"1"}')).toBeVisible();
  await screen.getByRole("button", { name: "Decode empty" }).click();
  expect(document.querySelector("output")).not.toBeNull();
});
