import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "url";

const isGitHubPages = !!process.env.GITHUB_PAGES;
const base = isGitHubPages ? "/dev-tools/" : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Dev Tools",
        short_name: "Dev Tools",
        description: "A collection of developer utilities",
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        scope: base,
        start_url: base,
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    exclude: [...configDefaults.exclude, "**/*.browser.test.{ts,tsx}"],
    coverage: {
      provider: "istanbul" as const,
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
