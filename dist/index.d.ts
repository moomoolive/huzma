import { SemVer } from "small-semver";
export declare const MANIFEST_FILE_SUFFIX = ".huzma.json";
export declare const NULL_FIELD = "";
export declare const FIRST_SCHEMA_VERSION = 1;
export declare const LATEST_SCHEMA_VERSION = 2;
export declare const BYTES_NOT_INCLUDED = -1;
export type { HuzmaCliConfig } from "./cli";
export type SchemaVersion = (typeof FIRST_SCHEMA_VERSION | typeof LATEST_SCHEMA_VERSION);
export type NullField = typeof NULL_FIELD;
export type RepoType = "git" | "other" | NullField;
export type ValidDefaultStrategies = ("url-diff" | "purge");
export type InvalidationStrategy = ValidDefaultStrategies | "default";
export type PermissionsListRaw = ReadonlyArray<string | {
    key: string;
    value: Array<string> | ReadonlyArray<string>;
}>;
type FillEmptyPermissions<P extends PermissionsListRaw> = {
    [index in keyof P]: P[index] extends string ? {
        key: P[index];
        value: string[];
    } : P[index] extends {
        key: infer Key;
        value: Array<infer Value> | ReadonlyArray<infer Value>;
    } ? {
        key: Key;
        value: Value[];
    } : never;
};
type FillEmptyPermissionsOptional<P extends PermissionsListRaw> = {
    [index in keyof P]: P[index] extends string ? P[index] | {
        key: P[index];
        value: string[];
    } : P[index] extends {
        key: infer Key;
        value: Array<infer Value> | ReadonlyArray<infer Value>;
    } ? Key | {
        key: Key;
        value: Value[];
    } : never;
};
export type PermissionsListOptions<P extends PermissionsListRaw = {
    key: string;
    value: string[];
}[]> = Array<FillEmptyPermissionsOptional<P>[number]>;
export type PermissionsList<P extends PermissionsListRaw = {
    key: string;
    value: string[];
}[]> = Array<FillEmptyPermissions<P>[number]>;
export type HuzmaManifestPartial = Partial<Omit<HuzmaManifest, "files" | "authors" | "repo" | "permissions">>;
export type ManifestOptions<Permissions extends PermissionsListRaw = ReadonlyArray<{
    key: string;
    value: string[];
}>> = (HuzmaManifestPartial & Partial<{
    authors: Array<Partial<{
        name: string;
        email: string;
        url: string;
    }>>;
    files: Array<string> | Array<Partial<{
        name: string;
        bytes: number;
        invalidation: InvalidationStrategy;
    }>>;
    repo: Partial<{
        type: RepoType;
        url: string;
    }>;
    permissions: PermissionsListOptions<Permissions>;
    metadata: Record<string, string>;
}>);
export declare const NULL_MANIFEST_VERSION = "0.0.0";
export declare class HuzmaManifest<Permissions extends PermissionsListRaw = ReadonlyArray<{
    key: string;
    value: string[];
}>> {
    schema: SchemaVersion;
    name: string;
    version: string;
    files: Array<{
        name: string;
        bytes: number;
        invalidation: InvalidationStrategy;
    }>;
    entry: string;
    invalidation: InvalidationStrategy;
    description: string;
    authors: Array<{
        name: string;
        email: string;
        url: string;
    }>;
    crateLogoUrl: string;
    keywords: string[];
    license: string;
    repo: {
        type: RepoType;
        url: string;
    };
    homepageUrl: string;
    permissions: PermissionsList<Permissions>;
    metadata: Record<string, string>;
    constructor({ schema, name, version, files, entry, invalidation, description, authors, crateLogoUrl, keywords, license, repo, homepageUrl, permissions, metadata }?: ManifestOptions<Permissions>);
}
export type ValidatedCodeManfiest = {
    pkg: HuzmaManifest;
    errors: string[];
    semanticVersion: SemVer;
};
export declare function validateManifest<T>(cargo: T): ValidatedCodeManfiest;
export type ManifestUpdateResponse = {
    oldManifest: ValidatedCodeManfiest;
    newManifest: ValidatedCodeManfiest;
    updateAvailable: boolean;
};
export declare function manifestIsUpdatable(newManifest: unknown, oldManifest: unknown): ManifestUpdateResponse;
export type FileRef = {
    name: string;
    bytes: number;
};
export declare class HuzmaUpdateDetails {
    add: FileRef[];
    delete: FileRef[];
    constructor(addFiles: FileRef[], deleteFiles: FileRef[]);
}
export declare function diffManifestFiles(newCargo: HuzmaManifest, oldCargo: HuzmaManifest, defaultInvalidation: ValidDefaultStrategies): HuzmaUpdateDetails;
//# sourceMappingURL=index.d.ts.map