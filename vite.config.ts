import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split the heaviest vendor libraries out of the main bundle so the
        // initial app chunk is smaller and these can be cached independently.
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    proxy: {
      // Dev only: proxy API calls to the local Express server (PORT=4000).
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
