import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240,
    }),
  ],

  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",

    terserOptions: {
      compress: {
        drop_console: true,
      },
    },

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("pdfjs-dist")) {
            return "pdf";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },

    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
