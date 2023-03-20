import {SemVer} from "small-semver"

/**
 * File extension for the huzma format
 */
export const MANIFEST_FILE_SUFFIX = ".huzma.json"
export const NULL_FIELD = ""
export const FIRST_SCHEMA_VERSION = 1
export const LATEST_SCHEMA_VERSION = 2
/**
 * Represents bytes for files that do 
 * not provide "bytes" field
 */
export const BYTES_NOT_INCLUDED = -1

export type {HuzmaCliConfig} from "./cli"

type ExpandedInbuiltTypes = (
    "string" 
    | "number" 
    | "bigint" 
    | "boolean" 
    | "symbol" 
    | "undefined" 
    | "function" 
    | "object" 
    | "null" 
    | "array"
)

function betterTypeof(val: unknown): ExpandedInbuiltTypes {
    const t = typeof val
    if (t !== "object") {
        return t
    } else if (val === null) {
        return "null"
    } else if (Array.isArray(val)) {
        return "array"
    } else {
        return "object"
    }
}

function stripRelativePath(url: string): string {
    if (url.length < 1) {
        return ""
    }
    if (
        !url.startsWith("/")
        && !url.startsWith("./") 
        && !url.startsWith("../")
    ) {
        return url
    }
    const split = url.split("/")
    let urlStart = -1
    for (let i = 0; i < split.length; i++) {
        const path = split[i]
        if (path !== "" && path !== "." && path !== "..") {
            urlStart = i
            break
        }
    }
    if (urlStart < 0) {
        return ""
    }
    return split.slice(urlStart).join("/")
}

export type SchemaVersion = (
    typeof FIRST_SCHEMA_VERSION
    | typeof LATEST_SCHEMA_VERSION
)
export type NullField = typeof NULL_FIELD
export type RepoType = "git" | "other" | NullField
export type ValidDefaultStrategies = ("url-diff" | "purge")
export type InvalidationStrategy = ValidDefaultStrategies | "default"

export type PermissionsListRaw = ReadonlyArray<
    string | {key: string, value: Array<string> | ReadonlyArray<string>}
>

export type FillEmptyPermissions<
    P extends PermissionsListRaw
> = {
    [index in keyof P]: P[index] extends string
        ?  {key: P[index], value: string[]}
        :  P[index] extends {
                key: infer Key, 
                value: Array<infer Value> | ReadonlyArray<infer Value>
        }
            ?  {key: Key, value: Value[]}
            : never
}

export type FillEmptyPermissionsOptional<P extends PermissionsListRaw> = {
    [index in keyof P]: P[index] extends string
        ?  P[index] | {key: P[index], value: string[]}
        :  P[index] extends {
                key: infer Key, 
                value: Array<infer Value> | ReadonlyArray<infer Value>
        }
            ? Key | {key: Key, value: Value[]}
            : never
}

export type PermissionsListOptions<
    P extends PermissionsListRaw = {key: string, value: string[]}[]
> = Array<FillEmptyPermissionsOptional<P>[number]>

export type PermissionsList<
    P extends PermissionsListRaw = {key: string, value: string[]}[]
> = Array<FillEmptyPermissions<P>[number]>

export type HuzmaManifestPartial= Partial<
    Omit<HuzmaManifest, "files" | "authors" | "repo" | "permissions">
>

export type ManifestOptions<
    Permissions extends PermissionsListRaw = ReadonlyArray<{key: string, value: string[]}>
> = (
    HuzmaManifestPartial & Partial<{
        authors: Array<Partial<{
            name: string, 
            email: string, 
            url: string
        }>>
        files: Array<string> | Array<Partial<{
            name: string,   
            bytes: number,
            invalidation: InvalidationStrategy
        }>>
        repo: Partial<{ type: RepoType, url: string }>
        permissions: PermissionsListOptions<Permissions>
        metadata: Record<string, string>
    }>
)

/**
 * Repersents an invalid huzma semver
 */
export const NULL_MANIFEST_VERSION = "0.0.0"

export class HuzmaManifest<
    Permissions extends PermissionsListRaw = ReadonlyArray<{key: string, value: string[]}>
> {
    // required fields
    schema: SchemaVersion
    name: string
    version: string
    
    // optional fields
    files: Array<{
        name: string, 
        bytes: number,
        invalidation: InvalidationStrategy
    }>
    entry: string
    invalidation: InvalidationStrategy
    description: string
    authors: Array<{ name: string, email: string, url: string }>
    logoUrl: string
    keywords: string[]
    license: string
    repo: {type: RepoType, url: string}
    homepageUrl: string
    permissions: PermissionsList<Permissions>
    metadata: Record<string, string>

    constructor({
        schema = LATEST_SCHEMA_VERSION,
        name = "unspecified-name",
        version = NULL_MANIFEST_VERSION,

        // optional fields
        files = [],
        entry = NULL_FIELD,
        invalidation = "default",
        description = NULL_FIELD,
        authors = [],
        logoUrl = NULL_FIELD,
        keywords = [],
        license = NULL_FIELD,
        repo = {type: NULL_FIELD, url: NULL_FIELD},
        homepageUrl = NULL_FIELD,
        permissions = [],
        metadata = {}
    }: ManifestOptions<Permissions> = {}) {
        this.homepageUrl = homepageUrl
        this.repo = {
            type: repo?.type || "other",
            url: repo?.url || NULL_FIELD
        }
        this.license = license
        this.keywords = keywords
        this.logoUrl = stripRelativePath(logoUrl)
        this.authors = authors.map(({
            name = NULL_FIELD, 
            email = NULL_FIELD, 
            url = NULL_FIELD
        }) => ({
            name, email, url
        }))
        this.description = description
        this.invalidation = invalidation
        this.files = files
            .map((file) => typeof file === "string" 
                ? {name: file, bytes: 0, invalidation: "default"} as const
                : file
            )
            .map(({
                name = "", bytes = 0, invalidation = "default"
            }) => ({
                name: stripRelativePath(name), 
                bytes, 
                invalidation
            }))
        this.entry = stripRelativePath(entry)
        this.version = version
        this.name = name
        this.schema = schema
        const permissionsExpanded = permissions.map((permission) => {
            if (typeof permission === "string") {
                return {key: permission, value: []}
            }
            return permission
        }) as PermissionsList<Permissions>
        const permissionsMap = new Map<string, number>()
        const noDuplicates = permissionsExpanded.reduce((permissionsArray, next) => {
            if (permissionsMap.has(next.key as string)) {
                return permissionsArray
            }
            permissionsMap.set(next.key as string, 1)
            permissionsArray.push(next)
            return permissionsArray
        }, [] as PermissionsList<Permissions>)
        this.permissions = noDuplicates
        this.metadata = metadata
    }
}

const orNull = <T extends string>(str?: T) => typeof str === "string" ? str || NULL_FIELD : NULL_FIELD

const typevalid = <T extends Record<string, unknown>>(
    obj: T,
    key: keyof T,
    type: "string" | "object",
    errs: string[]
) => {
    const t = typeof obj[key]
    if (t === type) {
        return true
    }
    errs.push(`${key as string} should be a ${type}, got "${t}"`)
    return false
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
    pkg: HuzmaManifest,
    /**
     * Errors encountered when parsing source
     * value.
     */
    errors: string [],
    semanticVersion: SemVer
}

const toInvalidation = (invalidation: string) => {
    switch (invalidation) {
        case "purge":
        case "url-diff":
            return invalidation
        default:
            return "default"
    }
}

const RANDOM_BASE_URL = "https://example.com"

function isUrl(url: string): boolean {
    try {
        const fullUrl = new URL(url, RANDOM_BASE_URL)
        return (
            !!fullUrl
            && decodeURI(fullUrl.href) === fullUrl.href 
        )
    } catch {
        return false
    }
}

/**
 * Check if inputted value is a valid huzma
 * manifest. Notes: 
 * - Any members of "file" key that do not
 * include a "bytes" key will have it set
 * to BYTES_NOT_INCLUDED constant. 
 * - Any string members not present in 
 * parsed manifest will be set NULL_FIELD constant.
 * 
 * @param manifest candidate huzma manifest
 */
export function validateManifest<T>(manifest: T): ValidatedCodeManfiest {
    
    const out: ValidatedCodeManfiest = {
        pkg: new HuzmaManifest(),
        errors: [],
        semanticVersion: SemVer.null()
    }
    const {pkg, errors} = out
    const c = manifest as ManifestOptions
    const baseType = betterTypeof(c)
    if (baseType !== "object") {
        errors.push(`expected cargo to be type "object" got "${baseType}"`)
        return out
    }

    if (
        typeof c.schema !== "number"
        || c.schema < FIRST_SCHEMA_VERSION
        || c.schema > LATEST_SCHEMA_VERSION
    ) {
        const validVersions = new Array<number>(2)
            .fill(0)
            .map((_, index) => index + 1)
        errors.push(`crate version is invalid, got "${c.schema}", valid=${validVersions.join(", ")}`)
    }
    pkg.schema = c.schema || LATEST_SCHEMA_VERSION

    if (!typevalid(c, "name", "string", errors)) {}
    pkg.name = orNull(c.name)

    let semverTmp: SemVer | null
    if (!typevalid(c, "version", "string", errors)) {

    } else if (!(semverTmp = SemVer.fromString(c.version || ""))) {
        errors.push(`${c.version} is not a vaild semantic version`)
    } else {
        out.semanticVersion = semverTmp
    }
    pkg.version = orNull(c.version)

    const targetFiles = c.files === undefined ? [] : c.files
    const filesIsArray = Array.isArray(targetFiles)
    if (!filesIsArray) {
        errors.push(`files should be an array, got "${betterTypeof(targetFiles)}"`)
    }
    
    const fileRecord: Map<string, boolean> = new Map()
    const files = !filesIsArray ? [] : targetFiles
    for (let i = 0; i < files.length; i++) {
        const preFile = files[i]
        if (typeof preFile === "string") {
            files[i] = {name: preFile, bytes: 0, invalidation: "default"}
        }
        const file = files[i] as Partial<{name: string, bytes: 0, invalidation: string}>
        if (betterTypeof(file) !== "object") {
            errors.push(`file ${i} is not an object. Expected an object with a "name" field, got ${betterTypeof(file)}`)
            break
        }
        if (typeof file?.name !== "string") {
            errors.push(`file ${i} is not a valid file format, file.name and must be a valid absolute or relative url. got ${file.name}`)
            break
        }

        if (typeof (file?.invalidation || "") !== "string") {
            errors.push(`file ${i} is not a valid file format, file.invalidation must be a string`)
            break
        }

        const stdName = stripRelativePath(file.name)
        // ignore duplicate files
        if (fileRecord.has(stdName)) {
            break
        }
        fileRecord.set(stdName, true)
        pkg.files.push({
            name: stdName,
            bytes: Math.max(
                typeof file.bytes === "number" ? file.bytes : BYTES_NOT_INCLUDED, 
                BYTES_NOT_INCLUDED
            ),
            invalidation: toInvalidation(
                file?.invalidation || "default"
            )
        })
    }

    const permissions = c.permissions || []
    if (!Array.isArray(permissions)) {
        errors.push(`permissions should be an array, got "${betterTypeof(c.permissions)}"`)
    }

    const permissionsMap = new Map<string, number>()
    for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i]
        const permissionType = betterTypeof(permission)
        if (permissionType !== "string" && permissionType !== "object") {
            errors.push(`permission should be a string or object with "key" & "value" properties. Permission ${i} type=${betterTypeof(permission)}`)
        }

        if (typeof permission === "string") {
            if (permissionsMap.has(permission)) {
                continue
            }
            permissionsMap.set(permission, 1)
            pkg.permissions.push({key: permission, value: []})
            continue
        }
        if (permissionType !== "object") {
            continue
        }
        if (typeof permission.key !== "string") {
            errors.push(`permission ${i} property "key" is not a string. got = ${betterTypeof(permission.key)}`)
            continue
        }
        const value = permission.value || []
        if (!Array.isArray(value)) {
            errors.push(`permission ${i} property "value" is not an array. got = ${betterTypeof(permission.key)}`)
            continue
        }
        if (permissionsMap.has(permission.key)) {
            continue
        }
        permissionsMap.set(permission.key, 1)
        pkg.permissions.push({
            key: permission.key, 
            value: value.filter((val) => typeof val === "string")
        })
    }

    c.entry = orNull(c.entry)
    if (!typevalid(c, "entry", "string", errors)) {}
    if (c.entry !== NULL_FIELD && !isUrl(c.entry)) {
        errors.push(`entry field must be a valid relative or absolute url. got "${pkg.entry}"`)
    }
    pkg.entry = c.entry

    pkg.invalidation = typeof c.invalidation === "string"
        ? toInvalidation(c.invalidation)
        : "default"
    pkg.description = orNull(c.description)
    pkg.authors = (c.authors || [])
        .filter(a => typeof a?.name === "string")
        .map(({name = "", email, url}) => ({
            name,  email: orNull(email), url: orNull(url)
        }))
    pkg.logoUrl = stripRelativePath(orNull(c.logoUrl))
    if (pkg.logoUrl !== NULL_FIELD && !isUrl(pkg.logoUrl)) {
        errors.push(`logoUrl should be a valid relative or absolute url`)
    }
    pkg.keywords = (c.keywords || []).filter(w => typeof w === "string")
    pkg.license = orNull(c.license)
    pkg.repo.type = orNull(c.repo?.type)
    pkg.repo.url = orNull(c.repo?.url)
    pkg.homepageUrl = orNull(c.homepageUrl)

    c.metadata = c.metadata || {}
    if (betterTypeof(c.metadata) !== "object") {
        errors.push(`metadata should be a record of strings, got "${betterTypeof(c.metadata)}"`)
        c.metadata = {}
    }

    const meta: Record<string, string> = {}
    const candidate = c.metadata || {}
    const metaKeys = Object.keys(c.metadata || {})
    for (let i = 0; i < metaKeys.length; i++) {
        const key = metaKeys[i]
        const value = candidate[key]
        if (typeof value !== "string") {
            errors.push(`meta should be a record of strings, got type "${betterTypeof(value)}" for property "${key}" of meta`)
            continue
        }
        meta[key] = value
    }
    pkg.metadata = meta
    return out
}

export type ManifestUpdateResponse = {
    oldManifest: ValidatedCodeManfiest
    newManifest: ValidatedCodeManfiest
    updateAvailable: boolean
}

/**
 * Check if new manifest version is a greater version
 * than currently cached version.
 * 
 * @param newManifest newest manifest
 * @param oldManifest cached manifest
 */
export function manifestIsUpdatable(
    newManifest: unknown, 
    oldManifest: unknown
): ManifestUpdateResponse {
    const validatedOld = validateManifest(oldManifest)
    const validatedNew = validateManifest(newManifest)
    const out = {
        oldManifest: validatedOld, 
        newManifest: validatedNew,
        updateAvailable: false
    }
    const oldErrs = out.oldManifest.errors.length > 0
    const newErrs = out.oldManifest.errors.length > 0
    if (oldErrs || newErrs) {
        return out
    }
    const oldVersionIsNull = validatedOld.pkg.version === NULL_MANIFEST_VERSION
    const newVersionIsNull = validatedNew.pkg.version === NULL_MANIFEST_VERSION
    if (oldVersionIsNull && newVersionIsNull) {
        return out
    } else if (newVersionIsNull) {
        return out
    } else if (oldVersionIsNull && !newVersionIsNull) {
        out.updateAvailable = true
        return out
    }
    const oldSemVer = validatedOld.semanticVersion
    const newSemver = validatedNew.semanticVersion
    out.updateAvailable = newSemver.isGreater(oldSemVer)
    return out
}

export type FileRef = {
    name: string, 
    bytes: number
}

export class HuzmaUpdateDetails {
    /**
     * A list of files requested to be cached
     */
    add: FileRef[]
    /**
     * A list of files that should be removed from cache
     */
    delete: FileRef[]

    constructor(addFiles: FileRef[], deleteFiles: FileRef[]) {
        this.add = addFiles
        this.delete = deleteFiles
    }
}
/**
 * Diff new manifest and analyze which files should
 * be added and removed from cache.
 * 
 * @param newManifest updated manifest
 * @param oldManifest previously cached manifest
 * @param defaultInvalidation if file invalidation is not 
 * included for a given file which invalidation 
 * strategy should be used
 */
export function diffManifestFiles(
    newManifest: HuzmaManifest, 
    oldManifest: HuzmaManifest,
    defaultInvalidation: ValidDefaultStrategies
): HuzmaUpdateDetails {
    const updates = new HuzmaUpdateDetails([], [])
    const newFiles: Record<string, ValidDefaultStrategies> = {}
    for (let i = 0; i < newManifest.files.length; i++) {
        const {name, invalidation} = newManifest.files[i]
        if (
            newManifest.entry !== NULL_FIELD 
            && name === newManifest.entry
            && invalidation === "default"
        ) {
            newFiles[name] = "purge"
            continue
        }
        newFiles[name] = invalidation === "default"
            ? defaultInvalidation
            : invalidation
    }

    const oldFiles: Record<string, boolean> = {}
    for (let i = 0; i < oldManifest.files.length; i++) {
        const {name} = oldManifest.files[i]
        oldFiles[name] = true
    }

    for (let i = 0; i < newManifest.files.length; i++) {
        const {name, bytes} = newManifest.files[i]
        if (!oldFiles[name] || newFiles[name] === "purge") {
            updates.add.push({name, bytes})
        }
    }

    for (let i = 0; i < oldManifest.files.length; i++) {
        const {name, bytes} = oldManifest.files[i]
        const invalidation = newFiles[name]
        if (!invalidation || invalidation === "purge") {
            updates.delete.push({name, bytes})
        }
    }
    return updates
}