#!/usr/bin/env node
import {createHuzma} from "../dist/cli.js"
import commandLineArgs from "command-line-args"

console.info("running create command...")

/** @type {{}} */
const options = commandLineArgs([
    {name: "configFileName", alias: "c", type: String},
    {name: "packageJsonPath", alias: "p", type: String},
    {name: "outFile", alias: "o", type: String},
    {name: "huzmaName", alias: "n",  type: String},
    {name: "buildDir", alias: "d", type: String},
])

createHuzma(options)