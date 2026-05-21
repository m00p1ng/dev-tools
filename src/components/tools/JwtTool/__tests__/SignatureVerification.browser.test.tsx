import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import type { JwtParts } from "@/lib/tool-logic/security";
import { SignatureVerification } from "../SignatureVerification";

const hs256Parts: JwtParts = {
  header: { alg: "HS256", typ: "JWT" },
  payload: { sub: "123" },
  signature: "signature",
  algorithm: "HS256",
  isExpired: false,
  expiresAt: null,
};

test("allows entering a secret for HS256 tokens", async () => {
  const onSecretChange = vi.fn();
  const onBase64SecretChange = vi.fn();
  const screen = await render(
    <SignatureVerification
      parts={hs256Parts}
      secret=""
      isBase64Secret={false}
      onSecretChange={onSecretChange}
      onBase64SecretChange={onBase64SecretChange}
    />,
  );

  await expect.element(screen.getByText("Without a secret, edited payload keeps the original signature (invalid).")).toBeVisible();
  await screen.getByLabelText("JWT verification secret").fill("secret");
  await screen.getByRole("switch").click();

  expect(onSecretChange).toHaveBeenCalledWith("secret");
  expect(onBase64SecretChange).toHaveBeenCalledWith(true);
});

test("explains that payload edits are re-signed when a secret is present", async () => {
  const screen = await render(
    <SignatureVerification
      parts={hs256Parts}
      secret="secret"
      isBase64Secret={false}
      onSecretChange={vi.fn()}
      onBase64SecretChange={vi.fn()}
    />,
  );

  await expect.element(screen.getByText("Payload edits will be re-signed with this secret.")).toBeVisible();
});

test("disables secret input for unsupported algorithms", async () => {
  const screen = await render(
    <SignatureVerification
      parts={{ ...hs256Parts, algorithm: "RS256", header: { alg: "RS256", typ: "JWT" } }}
      secret=""
      isBase64Secret={false}
      onSecretChange={vi.fn()}
      onBase64SecretChange={vi.fn()}
    />,
  );

  await expect.element(screen.getByText("HS256 only")).toBeVisible();
  await expect.element(screen.getByLabelText("JWT verification secret")).toBeDisabled();
});
