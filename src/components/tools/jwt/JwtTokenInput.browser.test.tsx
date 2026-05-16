import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import type { JwtParts } from "@/lib/tool-logic/security";
import { JwtTokenInput } from "./JwtTokenInput";

const parts: JwtParts = {
  header: { alg: "HS256", typ: "JWT" },
  payload: { sub: "123" },
  signature: "signature",
  algorithm: "HS256",
  isExpired: false,
  expiresAt: null,
};

test("shows placeholder text and emits the example token", async () => {
  const onChange = vi.fn();
  const screen = await render(
    <JwtTokenInput
      input=""
      error=""
      parts={null}
      sigVerified={null}
      isDragging={false}
      dropProps={{}}
      onChange={onChange}
      onClear={vi.fn()}
    />,
  );

  await expect.element(screen.getByText("Paste JWT token here... or drop a file")).toBeVisible();
  await screen.getByRole("button", { name: "Example" }).click();

  expect(onChange).toHaveBeenCalledWith(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  );
});

test("emits textarea changes and clear clicks", async () => {
  const onChange = vi.fn();
  const onClear = vi.fn();
  const screen = await render(
    <JwtTokenInput
      input="header.payload.signature"
      error=""
      parts={parts}
      sigVerified={null}
      isDragging={false}
      dropProps={{}}
      onChange={onChange}
      onClear={onClear}
    />,
  );

  await screen.getByLabelText("Encoded JWT token").fill("new.token.value");
  await screen.getByRole("button", { name: "Clear JWT" }).click();

  expect(onChange).toHaveBeenCalledWith("new.token.value");
  expect(onClear).toHaveBeenCalledOnce();
});

test("renders validation, signature, and expiration statuses", async () => {
  const expiredParts = { ...parts, isExpired: true, expiresAt: "1/1/1970, 7:00:00 AM" };
  const screen = await render(
    <JwtTokenInput
      input="header.payload.signature"
      error=""
      parts={expiredParts}
      sigVerified={false}
      isDragging={false}
      dropProps={{}}
      onChange={vi.fn()}
      onClear={vi.fn()}
    />,
  );

  await expect.element(screen.getByText("Valid JWT")).toBeVisible();
  await expect.element(screen.getByText("Invalid Signature")).toBeVisible();
  await expect.element(screen.getByText("Expired: 1/1/1970, 7:00:00 AM")).toBeVisible();
});

test("renders decode errors instead of valid statuses", async () => {
  const screen = await render(
    <JwtTokenInput
      input="bad"
      error="Invalid JWT"
      parts={null}
      sigVerified={null}
      isDragging={false}
      dropProps={{}}
      onChange={vi.fn()}
      onClear={vi.fn()}
    />,
  );

  await expect.element(screen.getByText("Invalid JWT")).toBeVisible();
});
