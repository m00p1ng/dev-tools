import { expect, test } from "vitest";

test("mounts the app into the root element", async () => {
  localStorage.setItem("onboarding-v1", "true");
  document.body.innerHTML = '<div id="root"></div>';

  await import("../main");

  await expect.poll(() => document.querySelector("header")).not.toBeNull();
});
