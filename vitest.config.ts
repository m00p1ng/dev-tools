import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { configDefaults, defineConfig } from "vitest/config";

const alias = {
  "@": fileURLToPath(new URL("./src", import.meta.url)),
};

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        plugins: [react(), tailwindcss()],
        resolve: { alias },
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          setupFiles: ["src/test-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            api: 0,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        ...(configDefaults.coverage?.exclude ?? []),
        "**/*.test.{ts,tsx}",
        "src/test-setup.ts",
      ],
    },
  },
});
