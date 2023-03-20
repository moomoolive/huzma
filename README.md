# بسم الله الرحمن الرحيم

# Huzma 📦

> A manifest format for browser-based package managers

* [Installation](#installation)
* [Specification](#specification)
* [Invalidations](#invalidations)
* [Command Line](#command-line-tools)
* [API Reference](https://moomoolive.github.io/huzma/)
* [Examples](https://github.com/moomoolive/huzma/tree/master/examples)

Huzma (the Arabic word for package, [pronounced like this](https://www.howtopronounce.com/arabic/%D8%AD%D8%B2%D9%85%D8%A9), spelt in Arabic حزمة) is a manifest format for browser-based package managers. This library is a Javascript implementation of the Huzma manifest format which includes:

* Various [functions, constants, and types](https://moomoolive.github.io/huzma/) to aid in creating and validating huzma manifests.

* A [command line interface](#command-line-tools) to ease automation.

Originally made to import game mods into the [Zakhaarif Launcher](https://github.com/moomoolive/zakhaarif-launcher), this format takes inspiration from Node's [package.json](https://docs.npmjs.com/cli/v9/configuring-npm/package-json) and Rust's [cargo.toml](https://doc.rust-lang.org/cargo/reference/manifest.html).

## Installation

```shell
npm i huzma
```

## Specification
A huzma is a json file that has the file extension `.huzma.json` and includes these keys:

**⚠️ Required**

- `schema`: an integer value of `1` or `2`, indicating which huzma version is used.

- `name`: a string naming package.

- `version`: a vaild [semver (semantic version)](https://medium.com/the-non-traditional-developer/semantic-versioning-for-dummies-45c7fe04a1f8) string, indicating the version of package. Implementation provided by [small-semver package](https://github.com/moomoolive/small-semver).

**✅ Optional**

- `files`: an array of strings or objects indicating files that should be cached on disk if possible (via [`Cache API`](https://developer.mozilla.org/en-US/docs/Web/API/Cache), [`IndexedDB`](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), etc.). Objects must include a string value at `name` field and an optional integer value at `bytes` field and [invalidation (string)](#invalidations) at `invalidation` field.

    If a string value is provided it indicates the relative url of a file. If an object value is provided the `name` field repersents the relative url of a file, the `invalidation` field repersents how file should be [diffed on package update](#invalidations),
    and the `bytes` field repersents uncompressed size of file in bytes. 
    
    All File urls must be relative to huzma manifest and cannot be an absolute url or start with `../`.

    **Example:**

    ```json
    {
        "files": [
            "index.js",
            "./index.js",
            "assets/cat.png",
            {"name": "assets/doggo.png"},
            {"name": "styles/style.css", "bytes": 1234},
            {
                "name": "multi-thread.wasm", 
                "invalidation": "purge"
            },
            {
                "name": "config.json", 
                "invalidation": "url-diff",
                "bytes": 10540
            }
        ]
    }
    ```

- `entry`: a url relative to huzma manifest that denotes an entry script (cannot be an absolute url or start with `../`.). This communicates to package managers which file to import in order to execute code included in package.

- `invalidation`: specify the default [invalidation strategy](#invalidations) for all files mentioned in `files` field.

- `description`: a string that describes package.

- `authors`: an array of objects repersenting project maintainers / main contributors. Object must include a string value at `name` field, and optionally can provide an email value at `email` field and url (absolute) for at `url` field.

    **Example:**

    ```json
    {
        "authors": [
            {"name": "moomoolive"}, 
            {
                "name": "milk_farmer", 
                "email": "lactose-free@dairy.com"
            }, 
            {
                "name": "pure_lactose", 
                "email": "we-love-lactose@farm.com", 
                "url": "https://whatsinyourmilk.milk"
            }
        ]
    }
    ```

- `logoUrl`: a relative or absolute url to a picture that repersents package. Examples: `https://yo-mamas.house/logo.png`, `./silly-logo.jpg`, etc.

- `keywords`: an array of string tags that describe package. Examples: `penguins`, `kitties`, `html-parser`, etc.

- `license`: a string denoting license granted to package user. Examples: `MIT`, `GPL-3`, `Apache-2`, `My-Own-Cool-License`, etc.

- `repo`: an object representing package's code repository, with an optional string value at `type` field and url at `url` field.

    **Example:**
    ```json
    {
        "repo": {
            "type": "git", 
            "url": "https://github.com/moomoolive/huzma"
        }
    }
    ```

- `homepageUrl`: absolute url to package website. Example: `https://www.nexusmods.com/my-amazing-mod-homepage`

- `permissions`: an array of strings or objects with a string value at `key` field and an array of strings at `value` field. A string value (i.e `"permission"`) is equivalent to an object with a string value at `key` field and an empty array at `value` field (i.e `{ "key": "permission", "value": [] }`). 

    It is up to package managers to implement a concrete set of permissions.

    **Example:**

    ```json
    {
        "permissions": [
            "permission1",
            {"key": "permission2", "value": []},
            {"key": "permission3", "value": ["value1"]},
            {"key": "permission3", "value": ["value1", "value2"]},
        ]
    }
    ```

- `metadata`: an object of arbitrary key & value pairs, where values are strings. Denotes specific information a particular package manager may want to know about package. Works similar to http headers.

    **Example:** 

    ```json
    {
        "metadata": {
            "is-extension": "true",
            "pkg-manager-x-key": "key-exists",
            "created": "100003231414",
            "updated": "100003431414"
        }
    }
    ```

## Invalidations

If a new version of a package is released, package managers will need to update the cached files of said package. Providing an invalidation strategy for a file(s) hints to package managers how to cache files.

Here are a list of strategies that may be provided:

* `url-diff`: file should only be cached if file with same url does not exist in package manager cache. Otherwise, file should not be cached.

* `purge`: file should be recached on every new package version, regardless if a file with same url exists in package manager cache. By default the `entry` file of a huzma manifest uses this strategy if it is found in `files`.

* `default`: let package manager decide.

## Command Line Tools

This package comes bundled with cli commands to help create huzem (plural for huzma). All commands can be programmatically invoked from as well. Package must be [installed](#installation) to invoke commands.

### npx huzma-init

Initialize a huzma config file - a [configuration file](https://moomoolive.github.io/huzma/types/cli.HuzmaCliConfig.html) which is used by other commands in this package.

Options:

* `path`: a path where huzma config file should be created, must end with `js` or `mjs` extension. Defaults to `huzma.config.mjs`.

    CLI:

    ```bash
    npx huzma-init --path huzma.config.mjs
    ```

    JS:

    ```js
    import {initHuzma} from "huzma/dist/cli.js"

    await initHuzma({path: "huzma.config.mjs"})
    ```

* `template`: available templates include `zakhaarif`. Defaults to empty string.

    CLI:

    ```bash
    npx huzma-init --template zakhaarif
    ```

    JS:

    ```js
    import {initHuzma} from "huzma/dist/cli.js"

    await initHuzma({template: "zakhaarif"})
    ```

### npx huzma-create

Create a huzma manifest.

Options:

* `buildDir`: ⚠️ required, directory that includes all package files.

    CLI:

    ```bash
    npx huzma-create --buildDir dist
    ```

    JS:

    ```js
    import {createHuzma} from "huzma/dist/cli.js"

    await createHuzma({buildDir: "dist"})
    ```

* `outFile`: the full path with the generated huzma manifest should be written to. Path must end with `.huzma.json`. Defaults to `buildDir` + `default.huzma.json`.

    CLI:

    ```bash
    npx huzma-create --outFile dist/default.huzma.json
    ```

    js:

    ```JS
    import {createHuzma} from "huzma/dist/cli.js"

    await createHuzma({outFile: "dist/default.huzma.json"})
    ```

* `configFileName`: path to [huzma config file](https://moomoolive.github.io/huzma/types/cli.HuzmaCliConfig.html), path must end with `js` or `mjs`. Can be generated via `npx huzma-init` command. Defaults to `huzma.config.mjs`

    CLI:

    ```bash
    npx huzma-create --configFileName huzma.config.mjs
    ```

    JS:

    ```js
    import {createHuzma} from "huzma/dist/cli.js"

    await createHuzma({configFileName: "huzma.config.mjs"})
    ```

* `packageJsonPath`: Path to package json from which to auto-fill missing values from. See `disablePackageJsonFill` for more details. Defaults to `package.json`

    CLI:

    ```bash
    npx huzma-create --packageJsonPath package.json
    ```

    JS:

    ```js
    import {createHuzma} from "huzma/dist/cli.js"

    await createHuzma({packageJsonPath: "package.json"})
    ```

* `disablePackageJsonFill`: Whether missing values not found in config file & inline config should be autofilled from package json. Values in package json are given a lower precedent than values found in config file or inline config. Setting flag disables auto-fill. To set path of package json set the `packageJsonPath` argument. Values that can be auto-filled from `package.json` include: 

    * `name`
    * `version` 
    * `description`
    * `keywords`
    * `license`
    * `repository`: maps to huzma's `repo` field.
    * `contributors`: maps to huzma's `authors` field.
    * `homepage`: maps to huzma's `homepageUrl` field.

    CLI:

    ```bash
    npx huzma-create --disablePackageJsonFill
    ```

    JS:

    ```js
    import {createHuzma} from "huzma/dist/cli.js"

    await createHuzma({disablePackageJsonFill: true})
    ```
* `inlineConfigFile`: provide an inline config, which takes precedent over config file. Defaults to null. Cannot be used from cli.

    JS:

    ```js
    import {createHuzma} from "huzma/dist/cli.js"

    await createHuzma({
        inlineConfigFile: {
            name: "my-huzma",
            version: "0.1.0"
            // ...rest of config
        }
    })
    ```
