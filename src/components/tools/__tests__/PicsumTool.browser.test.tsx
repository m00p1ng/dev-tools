import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { PicsumTool } from "../PicsumTool";

test("fetches a preview from the square endpoint", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(new Blob(["image"]), { status: 200 }));
  const screen = await render(<PicsumTool />);
  await screen.getByLabelText("Width").fill("300");
  await screen.getByLabelText("Height").fill("300");
  await screen.getByRole("button", { name: "Generate image" }).click();

  await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("https://picsum.photos/300?random="),
    expect.anything(),
  ));
  fetchSpy.mockRestore();
});

test("fetches a preview from the rectangular endpoint", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(new Blob(["image"]), { status: 200 }));
  await render(<PicsumTool />);

  await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("https://picsum.photos/640/400?random="),
    expect.anything(),
  ));
  fetchSpy.mockRestore();
});

test("choosing a preset updates both dimensions", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(new Blob(["image"]), { status: 200 }));
  const screen = await render(<PicsumTool />);

  await screen.getByLabelText("Preset size").selectOptions("1080x1080");

  await expect.element(screen.getByLabelText("Width")).toHaveValue(1080);
  await expect.element(screen.getByLabelText("Height")).toHaveValue(1080);
  fetchSpy.mockRestore();
});

test("generating after choosing a preset keeps that preset selected", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(new Blob(["image"]), { status: 200 }));
  const screen = await render(<PicsumTool />);

  await screen.getByLabelText("Preset size").selectOptions("1080x1080");
  await screen.getByRole("button", { name: "Generate image" }).click();

  await expect.element(screen.getByLabelText("Preset size")).toHaveValue("1080x1080");
  fetchSpy.mockRestore();
});

test("save image triggers a download", async () => {
  const blob = new Blob(["image"]);
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(blob, { status: 200 }));
  const createObjectUrlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:download");
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const screen = await render(<PicsumTool />);

  await vi.waitFor(async () => await expect.element(screen.getByRole("button", { name: "Save image" })).not.toBeDisabled());
  await screen.getByRole("button", { name: "Save image" }).click();

  await vi.waitFor(() => expect(clickSpy).toHaveBeenCalled());
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("https://picsum.photos/640/400"),
    expect.anything(),
  );
  expect(createObjectUrlSpy).toHaveBeenCalledWith(blob);
  clickSpy.mockRestore();
  createObjectUrlSpy.mockRestore();
  fetchSpy.mockRestore();
});
