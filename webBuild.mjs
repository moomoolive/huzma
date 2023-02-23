import * as esbuild from "esbuild"

await esbuild.build({
    entryPoints: ["./src/index.ts"],
    outdir: "dist/web",
    minify: true,
    sourcemap: "linked",
})