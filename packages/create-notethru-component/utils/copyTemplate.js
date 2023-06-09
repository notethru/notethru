const fs = require("fs-extra")
const path = require("node:path");
const chalk = require("chalk")

const templatesDir = path.resolve(__dirname, "../templates");
async function readTemplates() {
    const dirContents = await fs.readdir(templatesDir);

    return dirContents
}

async function cpTemplate(appName, root, useTypescript, useYarn) {

    
    const templates = await readTemplates()
    let templateToBeUsed = templates[0]

    if (useTypescript) templateToBeUsed = templates[1]
    const source = path.resolve(__dirname, `../templates/${templateToBeUsed}`)

    try {
        await fs.copy(source, root)
    } catch (error) {
        throw error
    }

    const cdpath = path.relative('.', root)
    const displayedCommand = useYarn ? "yarn" : "npm"

    console.log();
    console.log(`Success! Created ${appName} at ${root}`);
   
    console.log()
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), cdpath);
    console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
    // if (readmeExists) {
    //     console.log();
    //     console.log(
    //         chalk.yellow(
    //             'You had a `README.md` file, we renamed it to `README.old.md`'
    //         )
    //     );
    // }
    console.log();
    console.log('Happy hacking!');
}

module.exports = {
    cpTemplate
}