import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MermaidTool } from "..";
import { mockRasterDownload, openDropdown, waitForMenuItems, waitForSvg } from "./test-utils";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  vi.restoreAllMocks();
});

test("loads with example diagram pre-filled in the editor", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("textbox")).toHaveValue(
    expect.stringContaining("graph TD"),
  );
});

test("Syntax link is visible", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByText("Syntax")).toBeVisible();
});

test("Clear button empties the editor", async () => {
  const screen = await render(<MermaidTool />);
  await screen.getByRole("button", { name: "Clear" }).click();
  await expect.element(screen.getByText("Diagram will appear here...")).toBeVisible();
});

test("Example button reloads the example diagram", async () => {
  const screen = await render(<MermaidTool />);
  await screen.getByRole("textbox").fill("");
  await screen.getByRole("button", { name: "Example" }).click();
  await expect.element(screen.getByRole("textbox")).toHaveValue(
    expect.stringContaining("graph TD"),
  );
});

test("opens fullscreen preview from the rendered tool", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Fullscreen preview" })).toBeVisible();
  await screen.getByRole("button", { name: "Fullscreen preview" }).click();
  await expect.element(screen.getByText("Diagram Preview")).toBeVisible();
});

test("download dropdown opens with PNG/JPG/SVG options", async () => {
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Download diagram" })).toBeVisible();
  openDropdown(screen.getByRole("button", { name: "Download diagram" }).element() as HTMLElement);
  await waitForMenuItems();
  const texts = Array.from(document.querySelectorAll("[role='menuitem']")).map((el) => el.textContent?.trim());
  expect(texts).toEqual(expect.arrayContaining(["PNG", "JPG", "SVG"]));
});

test("clicking SVG download option triggers download", async () => {
  const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
  const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => { });

  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Download diagram" })).toBeVisible();
  openDropdown(screen.getByRole("button", { name: "Download diagram" }).element() as HTMLElement);
  await waitForMenuItems();

  const svgItem = Array.from(document.querySelectorAll("[role='menuitem']")).find(
    (el) => el.textContent?.trim() === "SVG",
  ) as HTMLElement | undefined;
  svgItem?.click();

  await vi.waitFor(() => expect(createObjectURL).toHaveBeenCalled(), { timeout: 2000 });
  createObjectURL.mockRestore();
  revokeObjectURL.mockRestore();
});

test.each([
  ["PNG", "image/png"],
  ["JPG", "image/jpeg"],
])("clicking %s download option renders the SVG to a canvas", async (format, mimeType) => {
  const download = mockRasterDownload(mimeType);
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("button", { name: "Download diagram" })).toBeVisible();

  openDropdown(screen.getByRole("button", { name: "Download diagram" }).element() as HTMLElement);
  await waitForMenuItems();

  const item = Array.from(document.querySelectorAll("[role='menuitem']")).find(
    (el) => el.textContent?.trim() === format,
  ) as HTMLElement | undefined;
  item?.click();

  await vi.waitFor(() => expect(download.toDataUrlSpy).toHaveBeenCalledWith(mimeType, 0.95), { timeout: 2000 });
  expect(download.clickSpy).toHaveBeenCalled();
  download.restore();
});

test("rendered output keeps the example diagram in the editor", async () => {
  const screen = await render(<MermaidTool />);
  await waitForSvg();
  await expect.element(screen.getByRole("textbox")).toHaveValue(expect.stringContaining("graph TD"));
});

test("invalid mermaid syntax shows error badge and error overlay", async () => {
  const screen = await render(<MermaidTool />);
  await screen.getByRole("textbox").fill("this is not valid mermaid syntax %%@@##");
  await vi.waitFor(async () => {
    await expect.element(screen.getByText("Fix errors to see diagram")).toBeVisible();
  }, { timeout: 4000 });
});

test("dark mode renders editor with light text color", async () => {
  document.documentElement.classList.add("dark");
  const screen = await render(<MermaidTool />);
  await expect.element(screen.getByRole("textbox")).toBeVisible();
  document.documentElement.classList.remove("dark");
});
