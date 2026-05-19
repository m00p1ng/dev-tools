import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "url";

const host = process.env.TAURI_DEV_HOST;
const isGitHubPages = !!process.env.GITHUB_PAGES;

// https://vite.dev/config/
export default defineConfig(() => ({
  base: isGitHubPages ? "/dev-tools/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["tauri.svg", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Dev Tools",
        short_name: "Dev Tools",
        description: "A collection of developer utilities",
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        scope: isGitHubPages ? "/dev-tools/" : "/",
        start_url: isGitHubPages ? "/dev-tools/" : "/",
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

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
