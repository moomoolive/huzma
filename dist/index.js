var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { SemVer } from "small-semver";
const MANIFEST_FILE_SUFFIX = ".huzma.json";
const NULL_FIELD = "";
const FIRST_SCHEMA_VERSION = 1;
const LATEST_SCHEMA_VERSION = 2;
const BYTES_NOT_INCLUDED = -1;
function betterTypeof(val) {
  const t = typeof val;
  if (t !== "object") {
    return t;
  } else if (val === null) {
    return "null";
  } else if (Array.isArray(val)) {
    return "array";
  } else {
    return "object";
  }
}
function stripRelativePath(url) {
  if (url.length < 1) {
    return "";
  }
  if (!url.startsWith("/") && !url.startsWith("./") && !url.startsWith("../")) {
    return url;
  }
  const split = url.split("/");
  let urlStart = -1;
  for (let i = 0; i < split.length; i++) {
    const path = split[i];
    if (path !== "" && path !== "." && path !== "..") {
      urlStart = i;
      break;
    }
  }
  if (urlStart < 0) {
    return "";
  }
  return split.slice(urlStart).join("/");
}
const NULL_MANIFEST_VERSION = "0.0.0";
class HuzmaManifest {
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
    crateLogoUrl = NULL_FIELD,
    keywords = [],
    license = NULL_FIELD,
    repo = { type: NULL_FIELD, url: NULL_FIELD },
    homepageUrl = NULL_FIELD,
    permissions = [],
    metadata = {}
  } = {}) {
    // required fields
    __publicField(this, "schema");
    __publicField(this, "name");
    __publicField(this, "version");
    // optional fields
    __publicField(this, "files");
    __publicField(this, "entry");
    __publicField(this, "invalidation");
    __publicField(this, "description");
    __publicField(this, "authors");
    __publicField(this, "crateLogoUrl");
    __publicField(this, "keywords");
    __publicField(this, "license");
    __publicField(this, "repo");
    __publicField(this, "homepageUrl");
    __publicField(this, "permissions");
    __publicField(this, "metadata");
    this.homepageUrl = homepageUrl;
    this.repo = {
      type: (repo == null ? void 0 : repo.type) || "other",
      url: (repo == null ? void 0 : repo.url) || NULL_FIELD
    };
    this.license = license;
    this.keywords = keywords;
    this.crateLogoUrl = stripRelativePath(crateLogoUrl);
    this.authors = authors.map(({
      name: name2 = NULL_FIELD,
      email = NULL_FIELD,
      url = NULL_FIELD
    }) => ({
      name: name2,
      email,
      url
    }));
    this.description = description;
    this.invalidation = invalidation;
    this.files = files.map(
      (file) => typeof file === "string" ? { name: file, bytes: 0, invalidation: "default" } : file
    ).map(({
      name: name2 = "",
      bytes = 0,
      invalidation: invalidation2 = "default"
    }) => ({
      name: stripRelativePath(name2),
      bytes,
      invalidation: invalidation2
    }));
    this.entry = stripRelativePath(entry);
    this.version = version;
    this.name = name;
    this.schema = schema;
    const permissionsExpanded = permissions.map((permission) => {
      if (typeof permission === "string") {
        return { key: permission, value: [] };
      }
      return permission;
    });
    const permissionsMap = /* @__PURE__ */ new Map();
    const noDuplicates = permissionsExpanded.reduce((permissionsArray, next) => {
      if (permissionsMap.has(next.key)) {
        return permissionsArray;
      }
      permissionsMap.set(next.key, 1);
      permissionsArray.push(next);
      return permissionsArray;
    }, []);
    this.permissions = noDuplicates;
    this.metadata = metadata;
  }
}
const orNull = (str) => typeof str === "string" ? str || NULL_FIELD : NULL_FIELD;
const typevalid = (obj, key, type, errs) => {
  const t = typeof obj[key];
  if (t === type) {
    return true;
  }
  errs.push(`${key} should be a ${type}, got "${t}"`);
  return false;
};
const toInvalidation = (invalidation) => {
  switch (invalidation) {
    case "purge":
    case "url-diff":
      return invalidation;
    default:
      return "default";
  }
};
const RANDOM_BASE_URL = "https://example.com";
function isUrl(url) {
  try {
    return url === encodeURIComponent(url) && !!new URL(url, RANDOM_BASE_URL);
  } catch {
    return false;
  }
}
function validateManifest(cargo) {
  var _a, _b;
  const out = {
    pkg: new HuzmaManifest(),
    errors: [],
    semanticVersion: SemVer.null()
  };
  const { pkg, errors } = out;
  const c = cargo;
  const baseType = betterTypeof(c);
  if (baseType !== "object") {
    errors.push(`expected cargo to be type "object" got "${baseType}"`);
    return out;
  }
  if (typeof c.schema !== "number" || c.schema < FIRST_SCHEMA_VERSION || c.schema > LATEST_SCHEMA_VERSION) {
    const validVersions = new Array(2).fill(0).map((_, index) => index + 1);
    errors.push(`crate version is invalid, got "${c.schema}", valid=${validVersions.join(", ")}`);
  }
  pkg.schema = c.schema || LATEST_SCHEMA_VERSION;
  if (!typevalid(c, "name", "string", errors))
    ;
  pkg.name = orNull(c.name);
  let semverTmp;
  if (!typevalid(c, "version", "string", errors))
    ;
  else if (!(semverTmp = SemVer.fromString(c.version || ""))) {
    errors.push(`${c.version} is not a vaild semantic version`);
  } else {
    out.semanticVersion = semverTmp;
  }
  pkg.version = orNull(c.version);
  const targetFiles = c.files === void 0 ? [] : c.files;
  const filesIsArray = Array.isArray(targetFiles);
  if (!filesIsArray) {
    errors.push(`files should be an array, got "${betterTypeof(targetFiles)}"`);
  }
  const fileRecord = /* @__PURE__ */ new Map();
  const files = !filesIsArray ? [] : targetFiles;
  for (let i = 0; i < files.length; i++) {
    const preFile = files[i];
    if (typeof preFile === "string") {
      if (!isUrl(preFile)) {
        errors.push(`files should be a valid url. got "${preFile}"`);
      }
      files[i] = { name: preFile, bytes: 0, invalidation: "default" };
    }
    const file = files[i];
    if (betterTypeof(file) !== "object") {
      errors.push(`file ${i} is not an object. Expected an object with a "name" field, got ${betterTypeof(file)}`);
      break;
    }
    if (typeof (file == null ? void 0 : file.name) !== "string" || !isUrl(file.name)) {
      errors.push(`file ${i} is not a valid file format, file.name and must be a valid absolute or relative url. got ${file.name}`);
      break;
    }
    if (typeof ((file == null ? void 0 : file.invalidation) || "") !== "string") {
      errors.push(`file ${i} is not a valid file format, file.invalidation must be a string`);
      break;
    }
    const stdName = stripRelativePath(file.name);
    if (fileRecord.has(stdName)) {
      break;
    }
    fileRecord.set(stdName, true);
    pkg.files.push({
      name: stdName,
      bytes: Math.max(
        typeof file.bytes === "number" ? file.bytes : BYTES_NOT_INCLUDED,
        BYTES_NOT_INCLUDED
      ),
      invalidation: toInvalidation(
        (file == null ? void 0 : file.invalidation) || "default"
      )
    });
  }
  const permissions = c.permissions || [];
  if (!Array.isArray(permissions)) {
    errors.push(`permissions should be an array, got "${betterTypeof(c.permissions)}"`);
  }
  const permissionsMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < permissions.length; i++) {
    const permission = permissions[i];
    const permissionType = betterTypeof(permission);
    if (permissionType !== "string" && permissionType !== "object") {
      errors.push(`permission should be a string or object with "key" & "value" properties. Permission ${i} type=${betterTypeof(permission)}`);
    }
    if (typeof permission === "string") {
      if (permissionsMap.has(permission)) {
        continue;
      }
      permissionsMap.set(permission, 1);
      pkg.permissions.push({ key: permission, value: [] });
      continue;
    }
    if (permissionType !== "object") {
      continue;
    }
    if (typeof permission.key !== "string") {
      errors.push(`permission ${i} property "key" is not a string. got = ${betterTypeof(permission.key)}`);
      continue;
    }
    const value = permission.value || [];
    if (!Array.isArray(value)) {
      errors.push(`permission ${i} property "value" is not an array. got = ${betterTypeof(permission.key)}`);
      continue;
    }
    if (permissionsMap.has(permission.key)) {
      continue;
    }
    permissionsMap.set(permission.key, 1);
    pkg.permissions.push({
      key: permission.key,
      value: value.filter((val) => typeof val === "string")
    });
  }
  c.entry = orNull(c.entry);
  if (!typevalid(c, "entry", "string", errors))
    ;
  if (c.entry !== NULL_FIELD && !isUrl(c.entry)) {
    errors.push(`entry field must be a valid relative or absolute url. got "${pkg.entry}"`);
  }
  pkg.entry = c.entry;
  pkg.invalidation = typeof c.invalidation === "string" ? toInvalidation(c.invalidation) : "default";
  pkg.description = orNull(c.description);
  pkg.authors = (c.authors || []).filter((a) => typeof (a == null ? void 0 : a.name) === "string").map(({ name = "", email, url }) => ({
    name,
    email: orNull(email),
    url: orNull(url)
  }));
  pkg.crateLogoUrl = stripRelativePath(orNull(c.crateLogoUrl));
  pkg.keywords = (c.keywords || []).filter((w) => typeof w === "string");
  pkg.license = orNull(c.license);
  pkg.repo.type = orNull((_a = c.repo) == null ? void 0 : _a.type);
  pkg.repo.url = orNull((_b = c.repo) == null ? void 0 : _b.url);
  pkg.homepageUrl = orNull(c.homepageUrl);
  c.metadata = c.metadata || {};
  if (betterTypeof(c.metadata) !== "object") {
    errors.push(`metadata should be a record of strings, got "${betterTypeof(c.metadata)}"`);
    c.metadata = {};
  }
  const meta = {};
  const candidate = c.metadata || {};
  const metaKeys = Object.keys(c.metadata || {});
  for (let i = 0; i < metaKeys.length; i++) {
    const key = metaKeys[i];
    const value = candidate[key];
    if (typeof value !== "string") {
      errors.push(`meta should be a record of strings, got type "${betterTypeof(value)}" for property "${key}" of meta`);
      continue;
    }
    meta[key] = value;
  }
  pkg.metadata = meta;
  return out;
}
function manifestIsUpdatable(newManifest, oldManifest) {
  const validatedOld = validateManifest(oldManifest);
  const validatedNew = validateManifest(newManifest);
  const out = {
    oldManifest: validatedOld,
    newManifest: validatedNew,
    updateAvailable: false
  };
  const oldErrs = out.oldManifest.errors.length > 0;
  const newErrs = out.oldManifest.errors.length > 0;
  if (oldErrs || newErrs) {
    return out;
  }
  const oldVersionIsNull = validatedOld.pkg.version === NULL_MANIFEST_VERSION;
  const newVersionIsNull = validatedNew.pkg.version === NULL_MANIFEST_VERSION;
  if (oldVersionIsNull && newVersionIsNull) {
    return out;
  } else if (newVersionIsNull) {
    return out;
  } else if (oldVersionIsNull && !newVersionIsNull) {
    out.updateAvailable = true;
    return out;
  }
  const oldSemVer = validatedOld.semanticVersion;
  const newSemver = validatedNew.semanticVersion;
  out.updateAvailable = newSemver.isGreater(oldSemVer);
  return out;
}
class HuzmaUpdateDetails {
  constructor(addFiles, deleteFiles) {
    __publicField(this, "add");
    __publicField(this, "delete");
    this.add = addFiles;
    this.delete = deleteFiles;
  }
}
function diffManifestFiles(newCargo, oldCargo, defaultInvalidation) {
  const updates = new HuzmaUpdateDetails([], []);
  const newFiles = {};
  for (let i = 0; i < newCargo.files.length; i++) {
    const { name, invalidation } = newCargo.files[i];
    if (newCargo.entry !== NULL_FIELD && name === newCargo.entry && invalidation === "default") {
      newFiles[name] = "purge";
      continue;
    }
    newFiles[name] = invalidation === "default" ? defaultInvalidation : invalidation;
  }
  const oldFiles = {};
  for (let i = 0; i < oldCargo.files.length; i++) {
    const { name } = oldCargo.files[i];
    oldFiles[name] = true;
  }
  for (let i = 0; i < newCargo.files.length; i++) {
    const { name, bytes } = newCargo.files[i];
    if (!oldFiles[name] || newFiles[name] === "purge") {
      updates.add.push({ name, bytes });
    }
  }
  for (let i = 0; i < oldCargo.files.length; i++) {
    const { name, bytes } = oldCargo.files[i];
    const invalidation = newFiles[name];
    if (!invalidation || invalidation === "purge") {
      updates.delete.push({ name, bytes });
    }
  }
  return updates;
}
export {
  BYTES_NOT_INCLUDED,
  FIRST_SCHEMA_VERSION,
  HuzmaManifest,
  HuzmaUpdateDetails,
  LATEST_SCHEMA_VERSION,
  MANIFEST_FILE_SUFFIX,
  NULL_FIELD,
  NULL_MANIFEST_VERSION,
  diffManifestFiles,
  manifestIsUpdatable,
  validateManifest
};
