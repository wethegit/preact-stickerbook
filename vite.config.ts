import { defineConfig } from "vite"
import { resolve } from "node:path"
import preact from "@preact/preset-vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), dts({ rollupTypes: true, include: ["src/lib"] })],
  build: {
    copyPublicDir: false,
    target: "esnext",
    commonjsOptions: {
      defaultIsModuleExports: false,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        "preact-stickerbook": resolve(__dirname, "src/lib/index.tsx"),
        "preact-stickerbook-helpers": resolve(
          __dirname,
          "src/lib/helpers/index.ts"
        ),
      },
      name: "PreactStickerbook",
      formats: ["es"],
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
