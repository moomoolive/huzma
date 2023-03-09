import Filehound from "filehound";
import fs from "fs/promises";
import { z } from "zod";
import semver from "semver";
import { LATEST_SCHEMA_VERSION, MANIFEST_FILE_SUFFIX, validateManifest } from "./index.js";
import filePathFilter from "@jsdevtools/file-path-filter";
import fsSync from "fs";
import "small-semver";
const DEAULT_CONFIG_FILE = "huzma.config.mjs";
const DEFAULT_HUZMA_NAME = "default" + MANIFEST_FILE_SUFFIX;
const dirName = (dir = "") => {
  let str = dir;
  if (dir.startsWith("/")) {
    str = str.slice(1);
  }
  if (dir.endsWith("/")) {
    return str;
  } else {
    return str + "/";
  }
};
async function createHuzma({
  configFileName = `${process.cwd()}/${DEAULT_CONFIG_FILE}`,
  packageJsonPath = `${process.cwd()}/package.json`,
  outFile = "",
  huzmaName = "",
  buildDir = "",
  inlineConfigFile = null
} = {}) {
  if (configFileName.length < 1 && !inlineConfigFile) {
    console.error("no config file name was specificed and inline config was not provided");
    return;
  }
  const configFile = await (async () => {
    if (inlineConfigFile) {
      return { default: inlineConfigFile };
    }
    if (!fsSync.existsSync(configFileName)) {
      throw new Error(`input config file "${configFileName.split("/").at(-1) || "unknown"}" does not exist (${configFileName})`);
    }
    return await import(configFileName);
  })();
  if (!("default" in configFile)) {
    console.error(`no default export found in huzma config file.`);
    return;
  }
  const parsedConfig = (() => {
    const schema = z.object({
      buildDir: z.string().optional(),
      huzmaName: z.string().optional(),
      ignore: z.array(z.string()).default([]),
      outFile: z.string().optional(),
      packageJsonPath: z.string().optional(),
      version: z.string().default(""),
      name: z.string().default(""),
      files: z.array(z.string()).default([]),
      entry: z.string().optional(),
      invalidation: z.string().optional(),
      description: z.string().optional(),
      authors: z.array(z.object({
        name: z.string().default(""),
        email: z.string().default(""),
        url: z.string().default("")
      })).optional(),
      crateLogoUrl: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      license: z.string().optional(),
      repo: z.object({
        type: z.string(),
        ur: z.string()
      }).optional(),
      homepageUrl: z.string().optional(),
      permissions: z.array(z.union([
        z.string(),
        z.object({ key: z.string(), value: z.array(z.string()) })
      ])).optional(),
      metadata: z.record(z.string(), z.string()).optional()
    });
    const parsed = schema.safeParse(configFile.default);
    return parsed;
  })();
  if (!parsedConfig.success) {
    console.error(parsedConfig.error);
    return;
  }
  const parsedPackageJson = await (async () => {
    try {
      const packageJsonFilePath = parsedConfig.data.packageJsonPath || packageJsonPath || "";
      const packageJson = await fs.readFile(packageJsonFilePath, {
        encoding: "utf-8"
      });
      const jsObject = JSON.parse(packageJson);
      const schema = z.object({
        name: z.string().default(""),
        version: z.string().default(""),
        description: z.string().default(""),
        keywords: z.array(z.string()).default([]),
        homepage: z.string().default(""),
        license: z.string().default(""),
        contributors: z.array(z.object({
          name: z.string().default(""),
          email: z.string().default(""),
          url: z.string().default("")
        })).default([]),
        repository: z.object({
          type: z.string(),
          url: z.string()
        }).optional()
      });
      const parsed = schema.parse(jsObject);
      return parsed;
    } catch {
      return null;
    }
  })();
  const mergedConfig = (() => {
    const pJson = parsedPackageJson;
    const config = parsedConfig.data;
    const authors = [];
    const pAuthors = (pJson == null ? void 0 : pJson.contributors) || [];
    const cAuthors = config.authors || [];
    authors.push(...pAuthors, ...cAuthors);
    const keywords = [];
    const pKeywords = (pJson == null ? void 0 : pJson.keywords) || [];
    const cKeywords = config.keywords || [];
    keywords.push(...pKeywords, ...cKeywords);
    const description = config.description || (pJson == null ? void 0 : pJson.description);
    const license = config.license || (pJson == null ? void 0 : pJson.license);
    const repo = config.repo || (pJson == null ? void 0 : pJson.repository);
    const homepageUrl = config.homepageUrl || (pJson == null ? void 0 : pJson.homepage);
    return {
      schema: LATEST_SCHEMA_VERSION,
      name: config.name || (pJson == null ? void 0 : pJson.name) || "unnamed-huzma",
      version: config.version || (pJson == null ? void 0 : pJson.version) || "0.1.0",
      // optional fields
      ...config.entry ? { entry: config.entry } : {},
      ...config.invalidation ? { invalidation: config.invalidation } : {},
      ...description ? { description } : {},
      ...authors.length > 0 ? { authors } : {},
      ...config.crateLogoUrl ? { crateLogoUrl: config.crateLogoUrl } : {},
      ...keywords.length > 0 ? { keywords } : {},
      ...license ? { license } : {},
      ...repo ? { repo } : {},
      ...homepageUrl ? { homepageUrl } : {},
      ...config.permissions ? { permissions: config.permissions } : {},
      ...config.metadata ? { metadata: config.metadata } : {}
    };
  })();
  const { buildDir: configBuildDir, ignore } = parsedConfig.data;
  const { version } = mergedConfig;
  const finalBuildDir = buildDir || configBuildDir || "";
  if (typeof finalBuildDir !== "string" || finalBuildDir.length < 1) {
    console.error("build directory must be provided");
    return;
  }
  if (!semver.valid(version)) {
    console.error("inputed version is not a valid semantic version. For more information check out: https://docs.npmjs.com/cli/v9/configuring-npm/package-json#version");
    return;
  }
  const globs = ignore.filter((pattern) => pattern.includes("*"));
  const otherPatterns = ignore.filter((pattern) => !pattern.includes("*"));
  const huzmaFilename = huzmaName || parsedConfig.data.huzmaName || DEFAULT_HUZMA_NAME;
  const filename = outFile || parsedConfig.data.outFile || dirName(finalBuildDir) + huzmaFilename;
  if (!filename.endsWith(MANIFEST_FILE_SUFFIX)) {
    console.error(`Huzma name must end with suffix "${MANIFEST_FILE_SUFFIX}". Got "${filename}"`);
    return;
  }
  const initialFiles = await Filehound.create().paths(finalBuildDir).discard([...otherPatterns]).find();
  const filterFn = filePathFilter({ exclude: globs });
  const files = initialFiles.filter(
    (path) => filterFn(path) && path !== filename
  );
  const buildDirName = dirName(finalBuildDir);
  const filesWithoutBuildDir = files.map(
    (name) => name.split(buildDirName)[1]
  );
  for (const file of filesWithoutBuildDir) {
  }
  const pkg = { ...mergedConfig, files: filesWithoutBuildDir };
  const { errors } = validateManifest(JSON.parse(JSON.stringify(pkg)));
  if (errors.length > 0) {
    console.error("cli produced incorrect manifest...this is probably a bug, manifest errors", errors.join(", "));
    return;
  }
  await fs.writeFile(filename, JSON.stringify(pkg));
  console.info("generated huzma", pkg);
  console.info(`✅ huzma file generated successfully (${filename})`);
}
const HUZMA_CLI_DOCS_LINK = "https://github.com/moomoolive/huzma";
async function initHuzma({
  path = DEAULT_CONFIG_FILE,
  template = ""
} = {}) {
  if (!path.endsWith("js") && !path.endsWith("mjs")) {
    console.error(`huzma config file must be a js file (ending with "js" or "mjs"), got "${path}"`);
    return;
  }
  const typeDeclaration = (() => {
    switch (template) {
      default:
        return `/** @type {import("huzma").HuzmaCliConfig} */`;
    }
  })();
  const defaultConfig = {
    buildDir: "dist",
    huzmaName: "default.huzma.json"
  };
  const file = `
// docs: ${HUZMA_CLI_DOCS_LINK}
${typeDeclaration}
export default {
    buildDir: "${defaultConfig.buildDir}",
    huzmaName: "${defaultConfig.huzmaName}"
}
    `.trim();
  await fs.writeFile(path, file, { encoding: "utf-8" });
  console.info(`✅ successfully generated huzma file at "${path}"`);
}
export {
  createHuzma,
  initHuzma
};
