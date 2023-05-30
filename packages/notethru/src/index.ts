#! /usr/bin/env node

import { Command } from "commander"
import { start_dev_server } from "./scripts/start_dev_server.js"

const program = new Command("notethru")

process.on('unhandledRejection', err => {
    throw err;
});

program
    .name("notethru")
    .description("Notethru's official library for creating and publishing Notethru components.")
    .version("1.0.0")

program
    .command("start")
    .description("Starts a development enviornment.")
    .action(start_dev_server)

program.parse(process.argv)
