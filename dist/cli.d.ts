import { PermissionsListOptions, InvalidationStrategy, PermissionsListRaw } from "./index";
export type HuzmaCliConfig<Permissions extends PermissionsListRaw = PermissionsListRaw> = {
    buildDir?: string;
    huzmaName?: string;
    ignore?: string[];
    outFile?: string;
    packageJsonPath?: string;
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
    crateLogoUrl?: string;
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
export declare function createHuzma({ configFileName, packageJsonPath, outFile, huzmaName, buildDir, inlineConfigFile }?: {
    configFileName?: string | undefined;
    packageJsonPath?: string | undefined;
    outFile?: string | undefined;
    huzmaName?: string | undefined;
    buildDir?: string | undefined;
    inlineConfigFile?: HuzmaCliConfig<PermissionsListRaw> | null | undefined;
}): Promise<void>;
//# sourceMappingURL=cli.d.ts.map