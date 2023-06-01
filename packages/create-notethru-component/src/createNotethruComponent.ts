import { Command } from "commander"
import chalk from "chalk";
import fs from "node:fs"

const loadJSON = (path: string) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf-8"));
const pjson = loadJSON("../package.json")

let componentName: string;
const init = () => {
    const program = new Command(pjson.name)
        .version(pjson.version)
        .arguments('<project-directory>')
        .usage(`${chalk.green('<project-directory>')} [options]`)
        .action(name => componentName = name)
        .parse(process.argv)

    if (typeof componentName === 'undefined') {
        console.error('Please specify the project directory:');
        console.log(
            `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
        );
        console.log();
        console.log('For example:');
        console.log(
            `  ${chalk.cyan(program.name())} ${chalk.green('my-react-app')}`
        );
        console.log();
        console.log(
            `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
        );
        process.exit(1);
    }

}

export default init