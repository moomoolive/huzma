import { SemVer } from "small-semver";
/**
 * File extension for the huzma format
 */
export declare const MANIFEST_FILE_SUFFIX = ".huzma.json";
export declare const NULL_FIELD = "";
export declare const FIRST_SCHEMA_VERSION = 1;
export declare const LATEST_SCHEMA_VERSION = 2;
/**
 * Returned for files that do not provide "bytes"
 * field
 */
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
export type FillEmptyPermissions<P extends PermissionsListRaw> = {
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
export type FillEmptyPermissionsOptional<P extends PermissionsListRaw> = {
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
/**
 * Repersents an invalid huzma semver
 */
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
    logoUrl: string;
    keywords: string[];
    license: string;
    repo: {
        type: RepoType;
        url: string;
    };
    homepageUrl: string;
    permissions: PermissionsList<Permissions>;
    metadata: Record<string, string>;
    constructor({ schema, name, version, files, entry, invalidation, description, authors, logoUrl, keywords, license, repo, homepageUrl, permissions, metadata }?: ManifestOptions<Permissions>);
}
/**
 * Response to attempting to parse a huzma
 * manifest from a value. If errors array are
 * contains 1 or more strings, this signifies
 * that input value is not a valid huzma.
 */
export type ValidatedCodeManfiest = {
    /**
     * Parsed manifest
     */
    pkg: HuzmaManifest;
    /**
     * Errors encountered when parsing source
     * value.
     */
    errors: string[];
    semanticVersion: SemVer;
};
/**
 * Check if inputted value is a valid huzma
 * manifest. Notes:
 * - Any members of "file" key do not
 * include a "bytes" key, "bytes" will be set
 * to BYTES_NOT_INCLUDED constant.
 * - Any string members not present in
 * parsed manifest will be set NULL_FIELD constant.
 *
 * @param manifest candidate huzma manifest
 */
export declare function validateManifest<T>(manifest: T): ValidatedCodeManfiest;
export type ManifestUpdateResponse = {
    oldManifest: ValidatedCodeManfiest;
    newManifest: ValidatedCodeManfiest;
    updateAvailable: boolean;
};
/**
 * Check if new manifest version is a greater version
 * than currently cached version.
 *
 * @param newManifest newest manifest
 * @param oldManifest cached manifest
 */
export declare function manifestIsUpdatable(newManifest: unknown, oldManifest: unknown): ManifestUpdateResponse;
export type FileRef = {
    name: string;
    bytes: number;
};
export declare class HuzmaUpdateDetails {
    /**
     * A list of files that are requested to be cached
     */
    add: FileRef[];
    /**
     * A list of files that should be removed for cache
     */
    delete: FileRef[];
    constructor(addFiles: FileRef[], deleteFiles: FileRef[]);
}
/**
 * Diff new manifest and analyze which files should
 * be added and removed from cache.
 *
 * @param newManifest updated manifest
 * @param oldManifest previously cached manifest
 * @param defaultInvalidation if file invalidation is not mentioned
 * which invalidation strategy should be used
 */
export declare function diffManifestFiles(newManifest: HuzmaManifest, oldManifest: HuzmaManifest, defaultInvalidation: ValidDefaultStrategies): HuzmaUpdateDetails;
//# sourceMappingURL=index.d.ts.map