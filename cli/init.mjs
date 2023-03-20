#!/usr/bin/env node
import {initHuzma} from "../dist/cli.js"
import commandLineArgs from "command-line-args"

console.info("running init command...")

/** @type {{}} */
const options = commandLineArgs([
    {name: "path", type: String},
    {name: "template", type: String},
])

initHuzma(options)