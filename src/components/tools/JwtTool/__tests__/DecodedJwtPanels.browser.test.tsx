import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { DecodedPanel } from "../DecodedJwtPanels";

test("renders highlighted JSON for read-only data", async () => {
  const screen = await render(<DecodedPanel title="Header" data={{ alg: "HS256", typ: "JWT" }} />);

  await expect.element(screen.getByText("Header")).toBeVisible();
  await expect.element(screen.getByText('"HS256"', { exact: true })).toBeVisible();
  await expect.element(screen.getByText('"JWT"', { exact: true })).toBeVisible();
});

test("switches to claim labels and formatted claim values", async () => {
  const screen = await render(
    <DecodedPanel title="Payload" data={{ iss: "auth-service", sub: "user-123", iat: 0, custom: true }} />,
  );

  await screen.getByRole("button", { name: "Claims" }).click();

  await expect.element(screen.getByText("Issuer")).toBeVisible();
  await expect.element(screen.getByText("Subject")).toBeVisible();
  await expect.element(screen.getByText(new Date(0).toLocaleString())).toBeVisible();
  await expect.element(screen.getByText("true")).toBeVisible();
});

test("renders editable panel without editValue or onEditChange falls back to json and no-op", async () => {
  const screen = await render(
    <DecodedPanel
      title="Payload"
      data={{ sub: "123" }}
      editable
    />,
  );
  await expect.element(screen.getByText("Payload")).toBeVisible();
  // editValue ?? json fallback and onEditChange ?? (() => {}) fallback are exercised
  await screen.getByLabelText("Edit JWT payload JSON").fill("{}");
});

test("renders editable payload JSON, forwards edits, and shows edit errors", async () => {
  const onEditChange = vi.fn();
  const screen = await render(
    <DecodedPanel
      title="Payload"
      data={{ sub: "123" }}
      editable
      editValue={'{\n  "sub": "123"\n}'}
      onEditChange={onEditChange}
      editError="Invalid JSON"
    />,
  );

  await screen.getByLabelText("Edit JWT payload JSON").fill('{"sub":"456"}');

  expect(onEditChange).toHaveBeenCalledWith('{"sub":"456"}');
  await expect.element(screen.getByText("Invalid JSON")).toBeVisible();
});
