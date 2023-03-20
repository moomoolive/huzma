#!/usr/bin/env node
import {createHuzma} from "../dist/cli.js"
import commandLineArgs from "command-line-args"

console.info("running create command...")

/** @type {{}} */
const options = commandLineArgs([
    {name: "configFileName", type: String},
    {name: "packageJsonPath", type: String},
    {name: "outFile", type: String},
    {name: "buildDir", type: String},
    {name: "disablePackageJsonFill", type: Boolean}
])

createHuzma(options)