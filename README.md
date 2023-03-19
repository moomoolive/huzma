# بسم الله الرحمن الرحيم

# Huzma 📦

Huzma (the Arabic word for package, [pronounced like this](https://www.howtopronounce.com/arabic/%D8%AD%D8%B2%D9%85%D8%A9), spelt in Arabic حزمة) is a manifest format for browser-based package managers. Originally made to import game mods into the [Zakhaarif Launcher](https://github.com/moomoolive/zakhaarif-launcher).

Table of Contents:
* [Installation](#installation)
* [Specification](#specification)
* [Command Line](#command-line-tools)
* [API Reference](https://moomoolive.github.io/huzma/)

## Installation

```shell
npm i huzma
```

## Specification
A huzma is a json file that has the file extension `.huzma.json` and includes these keys:

**⚠️ Required**

- `schema`: ,  an integer value of `1` to latest version (`2`), indicating which huzma version package is used.

- `name`: **Required**, a string naming your package.

- `version`: **Required**, a vaild [semver (semantic version)](https://medium.com/the-non-traditional-developer/semantic-versioning-for-dummies-45c7fe04a1f8) string, indicating the version of package.

**✅ Optional**

- `files`: soon...

- `entry`: a relative url to an entry script (e.g `./index.js`, `main.js`). Note that entry url must be within the same scope as huzma and cannot exceed it. This means that absolute urls and relative urls that start with `../` are not acceptable.

    **Acceptable**: `main.js`, `./main.js`, `./assets/main.js`, etc.

    **Unacceptable**: `../main.js`, `https://your-site.com/main.js`, `../not-in-scope-assets/main.js`, etc.

- `invalidation`: soon...

- `description`: a string that describes package.

- `authors`: soon...

- `logoUrl`: a relative or absolute url to a picture that repersents package. Examples: `https://yo-mamas.house/logo.png`, `./silly-logo.jpg`, etc.

- `keywords`: an array of string tags that describe package. Examples: `penguins`, `kitties`, `html-parser`, etc.

- `license`: a string denoting license granted to package user. Examples: `MIT`, `GPL-3`, `Apache-2`, `My-Own-Cool-License`, etc.

- `repo`: soon...

- `homepageUrl`: an absolute url of package website. Example: `https://www.nexusmods.com/my-amazing-mod-homepage`

- `permissions`: soon...

- `metadata`: an object of arbitrary key & value pairs, where values are strings. Denotes specific information a particular package manager may want to know about package. Works similar to http headers.

    **Examples**: 
    
    `{"author-bio": "https://medium.com/cool-author"}` 
    
    `{"is-extension": "true"}`

    `{"created": "100003231414", "updated": "100003231414"}`

## Command Line Tools

This package comes bundle with some cli commands to help create huzem (plural for huzma). All commands can also be programmatically invoked from as well. Package must be [installed](#installation) to invoke commands.

- `npx huzma-init`: initialize a huzma config file. A configuration file which can be used by other commands to generate a huzma.

    Options:

    * `path`: soon... Defaults to `huzma.config.mjs`.

    * `template`: soon...

```js
import {initHuzma} from "huzma/dist/cli.js"

(async () => {
    await initHuzma({/* insert your config */})
})()
```

- `npx huzma-create`: create a huzma manifest from config.

    Options:
    
    * `configFileName`: soon... Defaults to `huzma.config.mjs`

    * `packageJsonPath`: soon... Defaults to `packageJson`

    * `outFile`: soon...

    * `huzmaName`: soon... Defaults to `default`

    * `buildDir`: soon...

    * `disablePackageJsonFill`: soon... Defaults to false.

```js
import {createHuzma} from "huzma/dist/cli.js"

(async () => {
    createHuzma({/* insert your config */})
})()
```
