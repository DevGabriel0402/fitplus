import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "inline",
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        name: "FITBODY Fitness",
        short_name: "FITBODY",
        description: "Seu parceiro completo de treinos e nutrição",
        theme_color: "#9b8cff",
        background_color: "#0b0b0f",
        display: "standalone",
        start_url: "/",
        icons: [{ src: "/favicon.svg", sizes: "192x192 512x512", type: "image/svg+xml" }],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),

  ],
  server: {
    open: true,
    port: 3000,
    strictPort: true,
  },
});
