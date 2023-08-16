import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
  },
  build: {
    outDir: "../dist",
  },
  root: "src",
});
