import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * sheryjs ships its shaders as raw .glsl files and expects a webpack loader.
 * This turns each one into an ES module exporting the source string, which is
 * all the library actually needs.
 */
function glslRaw() {
  return {
    name: "glsl-raw",
    enforce: "pre",
    async load(id) {
      const [file] = id.split("?");
      if (!/\.(glsl|vert|frag|vs|fs)$/.test(file)) return null;
      const source = await readFile(file, "utf8");
      return `export default ${JSON.stringify(source)};`;
    },
  };
}

const resolvePath = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // See src/lib/controlkit-stub.js — the real package breaks when bundled.
      controlkit: resolvePath("./src/lib/controlkit-stub.js"),
    },
  },
  // Dep pre-bundling runs before our plugins, so it would choke on sheryjs's
  // raw .glsl imports in dev. Excluding it routes sheryjs through the normal
  // plugin pipeline where glslRaw() can handle them.
  optimizeDeps: {
    exclude: ["sheryjs"],
  },
  plugins: [glslRaw(), react()],
  build: {
    assetsInlineLimit: 4096,
  },
});
