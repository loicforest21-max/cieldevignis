import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase warning threshold (we now split chunks intentionally)
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks: keep React separate from Firebase
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
            if (id.includes("firebase")) return "vendor-firebase";
            return "vendor-misc";
          }
          // Wiki data is huge (~1.4 MB) — keep it in its own chunk
          // so it only loads when the user opens the Wiki page
          if (id.includes("/data/wiki.js")) return "data-wiki";
          // Other data files are small enough to ride with their pages
        },
      },
    },
  },
});
