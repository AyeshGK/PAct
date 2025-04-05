import { defineConfig } from "vite";
import path from "path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")  // Enable @/ imports
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),  // Library entry
      name: "PActLib",                                  // Global name for UMD
      fileName: (format) => `pact-lib.${format}.js`,    // Output filenames
    },
    rollupOptions: {
      external: [], // mark as external if you don't want to bundle deps
      output: {
        globals: {} // for UMD
      }
    }
  }
});
// https://vitejs.dev/config/