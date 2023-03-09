#!/usr/bin/env node
import {initHuzma} from "../dist/cli.js"
import commandLineArgs from "command-line-args"

console.info("running init command...")

/** @type {{}} */
const options = commandLineArgs([
    {name: "path", alias: "p", type: String},
    {name: "template", alias: "t", type: String},
])

initHuzma(options)