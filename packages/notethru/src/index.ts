#! /usr/bin/env node

import { Command } from "commander"
import { start_dev_server } from "./scripts/start_dev_server.js"
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

program.parse(process.argv)
