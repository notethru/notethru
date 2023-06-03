const fs = require("fs-extra")
const { createRequire } = require("node:module");
const path = require("node:path");
const _ = require("lodash")
const { fileURLToPath } = "url"

const templatesDir = path.resolve(__dirname, "../templates");
async function readTemplates() {
    const dirContents = await fs.readdir(templatesDir);

    return dirContents
}

async function cpTemplate(appName, root, useTypescript) {
    const source = path.resolve(__dirname, "../templates")
    const destination = path.resolve(process.cwd(), appName)

    const templates = await readTemplates()
    console.log(useTypescript)
}

module.exports = {
    cpTemplate
}