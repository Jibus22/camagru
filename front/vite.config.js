import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  const config = {
    base: "/",
    server: {
      host: true,
    },
    build: {
      outDir: "../dist",
    },
    root: "src",
  };

  if (command !== "serve") {
    config.base = "/camagru/";
  }

  return config;
});
