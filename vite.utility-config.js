// vite.config.js
const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  root: "./utility",
  base: "./",
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, "utility/index.html"),
    },
  },
});
