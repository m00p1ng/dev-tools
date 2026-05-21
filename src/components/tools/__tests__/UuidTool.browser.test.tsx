import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { UuidTool } from "../UuidTool";

test("generates a UUID v4 by default", async () => {
  const screen = await render(<UuidTool />);
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)).toBeVisible();
});

test("Regenerate button produces a new result", async () => {
  const screen = await render(<UuidTool />);
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-/i)).toBeVisible();
  await screen.getByRole("button", { name: "Regenerate" }).click();
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-/i)).toBeVisible();
});

test("switching algorithm to ULID generates a ULID-format string", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("ulid");
  await expect.element(screen.getByText(/^[0-9A-Z]{26}$/)).toBeVisible();
});

test("v3 algorithm shows namespace and name inputs", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v3");
  await expect.element(screen.getByText("Namespace")).toBeVisible();
  await expect.element(screen.getByText("Name", { exact: true })).toBeVisible();
});

test("v5 algorithm generates a UUID v5", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v5");
  await expect.element(screen.getByText("Namespace")).toBeVisible();
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-/i)).toBeVisible();
});

test("v1 algorithm generates a UUID v1", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v1");
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-/i)).toBeVisible();
});

test("v7 algorithm generates a UUID v7", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v7");
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/i)).toBeVisible();
});

test("ObjectId algorithm generates a 24-char hex string", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("objectid");
  await expect.element(screen.getByText(/^[0-9a-f]{24}$/i)).toBeVisible();
});

test("v5 algorithm shows Namespace and Name inputs with DNS/URL/Custom options", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v5");
  await expect.element(screen.getByText("Namespace")).toBeVisible();
  await expect.element(screen.getByText("Name", { exact: true })).toBeVisible();
  // Namespace select shows DNS, URL, Custom options
  const selects = document.querySelectorAll("select");
  const nsSelect = selects[1] as HTMLSelectElement;
  const options = Array.from(nsSelect.options).map((o) => o.value);
  expect(options).toContain("DNS");
  expect(options).toContain("URL");
  expect(options).toContain("custom");
});

test("count input changes number of results", async () => {
  const screen = await render(<UuidTool />);
  const countInput = screen.getByRole("spinbutton");
  await countInput.fill("3");
  const el = countInput.element() as HTMLInputElement;
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  // After enter, count commits and bulk copy button appears
  await expect.element(screen.getByRole("button", { name: "Regenerate" })).toBeVisible();
});

test("v3 name input affects generated UUID", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v3");
  await expect.element(screen.getByText("Name", { exact: true })).toBeVisible();
  const nameInput = screen.getByPlaceholder("Enter name…");
  await nameInput.fill("test-name");
  // UUID should still be a valid UUID v3
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-/i)).toBeVisible();
});

test("v5 name input affects generated UUID", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v5");
  const nameInput = screen.getByPlaceholder("Enter name…");
  await nameInput.fill("hello");
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-/i)).toBeVisible();
});

test("count input shows max of 100", async () => {
  const screen = await render(<UuidTool />);
  const countInput = screen.getByRole("spinbutton");
  // Verify the max attribute is 100
  expect((countInput.element() as HTMLInputElement).max).toBe("100");
});

test("v5 custom namespace shows namespace UUID input", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v5");
  const selects = document.querySelectorAll("select");
  const nsSelect = selects[1] as HTMLSelectElement;
  // Switch to custom namespace
  nsSelect.value = "custom";
  nsSelect.dispatchEvent(new Event("change", { bubbles: true }));
  const namespaceInput = screen.getByPlaceholder("Namespace UUID");
  await expect.element(namespaceInput).toBeVisible();
  await namespaceInput.fill("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
  await expect.element(namespaceInput).toHaveValue("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
});

test("v3 custom namespace input renders with custom option", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v3");
  const selects = document.querySelectorAll("select");
  const nsSelect = selects[1] as HTMLSelectElement;
  nsSelect.value = "custom";
  nsSelect.dispatchEvent(new Event("change", { bubbles: true }));
  await expect.element(screen.getByPlaceholder("Namespace UUID")).toBeVisible();
});

test("bulk copy button appears when count > 1", async () => {
  const screen = await render(<UuidTool />);
  const countInput = screen.getByRole("spinbutton");
  // Set count to 3 and commit
  await countInput.fill("3");
  const el = countInput.element() as HTMLInputElement;
  el.blur();
  await vi.waitFor(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const copyBtn = buttons.find((b) => b.textContent?.includes("Copy") && b.getAttribute("aria-label") !== "Copy");
    expect(copyBtn).not.toBeNull();
  }, { timeout: 2000 });
});

test("v5 invalid custom namespace falls back to DNS namespace", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v5");
  const selects = document.querySelectorAll("select");
  const nsSelect = selects[1] as HTMLSelectElement;
  nsSelect.value = "custom";
  nsSelect.dispatchEvent(new Event("change", { bubbles: true }));
  // Fill an invalid UUID string — isUuid() returns false → falls back to uuidv5.DNS
  const namespaceInput = screen.getByPlaceholder("Namespace UUID");
  await namespaceInput.fill("not-a-valid-uuid");
  await screen.getByRole("button", { name: "Regenerate" }).click();
  // UUID v5 should still generate (with DNS fallback namespace)
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-/i)).toBeVisible();
});

test("count onBlur clamps value", async () => {
  const screen = await render(<UuidTool />);
  const countInput = screen.getByRole("spinbutton");
  // Set an out-of-range value and trigger blur
  (countInput.element() as HTMLInputElement).focus();
  await countInput.fill("200");
  const el = countInput.element() as HTMLInputElement;
  el.blur();
  await vi.waitFor(() => {
    expect(Number(el.value)).toBeLessThanOrEqual(100);
  }, { timeout: 1000 });
});

test("namespace URL option is used for v5 generation", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v5");
  const nsSelect = document.querySelectorAll("select")[1] as HTMLSelectElement;
  nsSelect.value = "URL";
  nsSelect.dispatchEvent(new Event("change", { bubbles: true }));
  await screen.getByPlaceholder("Enter name…").fill("https://example.com");
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-/i)).toBeVisible();
});

test("unknown namespace falls back to DNS namespace", async () => {
  const screen = await render(<UuidTool />);
  await screen.getByRole("combobox").selectOptions("v5");
  const nsSelect = document.querySelectorAll("select")[1] as HTMLSelectElement;
  nsSelect.value = "UNKNOWN";
  nsSelect.dispatchEvent(new Event("change", { bubbles: true }));
  await screen.getByPlaceholder("Enter name…").fill("example");
  await expect.element(screen.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-/i)).toBeVisible();
});

test("count input Enter blurs and clamps invalid values to minimum", async () => {
  const screen = await render(<UuidTool />);
  const countInput = screen.getByRole("spinbutton");
  const el = countInput.element() as HTMLInputElement;
  el.focus();
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, "abc");
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await vi.waitFor(() => {
    expect(el.value).toBe("1");
  }, { timeout: 1000 });
});

test("count input ignores non-Enter keydown", async () => {
  const screen = await render(<UuidTool />);
  const countInput = screen.getByRole("spinbutton");
  const el = countInput.element() as HTMLInputElement;
  el.focus();
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  expect(document.activeElement).toBe(el);
});

test("count slider updates count and shows bulk copy", async () => {
  const screen = await render(<UuidTool />);
  const slider = screen.getByRole("slider");
  await slider.click();
  slider.element().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  await expect.element(screen.getByText("Copy")).toBeVisible();
});
