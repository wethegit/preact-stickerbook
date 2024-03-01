import { defineConfig } from "vite"
import { resolve } from "node:path"
import preact from "@preact/preset-vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    commonjsOptions: {
      defaultIsModuleExports: false,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        "preact-stickerbook": resolve(__dirname, "src/lib/index.js"),
        "preact-stickerbook-helpers": resolve(
          __dirname,
          "src/lib/helpers/index.js"
        ),
      },
      name: "preactStickerbook",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["preact", "preact/hooks"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          preact: "Preact",
        },
      },
    },
  },
})
