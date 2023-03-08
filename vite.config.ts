import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        outDir: "dist",
        minify: false,
        lib: {
            entry: [
                "./src/index.ts",
                "./src/cli.ts",
            ],
            formats: ["es"],
        },
        rollupOptions: {
            external: [
                "command-line-args",
                "small-semver",
                "zod",
                "semver",
                "@jsdevtools/file-path-filter",
                "filehound",
                "fs",
                "fs/promises"
            ]
        }
    },
    plugins: [dts()],
})