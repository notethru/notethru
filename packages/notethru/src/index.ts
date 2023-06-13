#! /usr/bin/env node

import { Command } from "commander"
import { start_dev_server, publish_component } from "./scripts/index.js"
import { createRequire } from "node:module"

const packageJson = createRequire(import.meta.url)("../package.json")

const program = new Command(packageJson.name)

process.on('unhandledRejection', err => {
    throw err;
});

program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version)

program
    .command("start")
    .description("Starts a development enviornment.")
    .action(start_dev_server)

program
    .command("publish")
    .description("Publish your component to notethru's official collection of amazing prebuild components read for being used by many peoples in their blogs.")
    .action(publish_component)

program.parse(process.argv)
