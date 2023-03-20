import { PermissionsListOptions, InvalidationStrategy, PermissionsListRaw } from "./index";
/**
 * A configuration file for Huzma cli commands
 */
export type HuzmaCliConfig<Permissions extends PermissionsListRaw = PermissionsListRaw> = {
    /**
     * Path to package files.
     */
    buildDir?: string;
    /**
     * An array of files, directories, globs, or regexes to
     * not include in the generated Huzma manifest's "files"
     * key.
     */
    ignore?: string[];
    /**
     * Path where generated Huzma Manifest shoul be written
     */
    outFile?: string;
    /**
     * Path of package.json to fill values from
     */
    packageJsonPath?: string;
    disablePackageJsonFill?: boolean;
    name?: string;
    version?: string;
    files?: string[];
    entry?: string;
    invalidation?: InvalidationStrategy;
    description?: string;
    authors?: {
        name: string;
        email?: string;
        url?: string;
    }[];
    logoUrl?: string;
    keywords?: string[];
    license?: string;
    repo?: {
        type: string;
        url: string;
    };
    homepageUrl?: string;
    permissions?: PermissionsListOptions<Permissions>;
    metadata?: Record<string, string>;
};
/**
 * Create a huzma manifest file.
 */
export declare function createHuzma({ configFileName, packageJsonPath, outFile, buildDir, inlineConfigFile, disablePackageJsonFill }?: {
    configFileName?: string | undefined;
    packageJsonPath?: string | undefined;
    outFile?: string | undefined;
    buildDir?: string | undefined;
    inlineConfigFile?: HuzmaCliConfig<PermissionsListRaw> | null | undefined;
    disablePackageJsonFill?: boolean | undefined;
}): Promise<void>;
export type TemplateOptions = "" | "zakhaarif";
/**
 * Initialize a humza config file.
 */
export declare function initHuzma({ path, template }?: {
    path?: string | undefined;
    template?: TemplateOptions | undefined;
}): Promise<void>;
//# sourceMappingURL=cli.d.ts.map