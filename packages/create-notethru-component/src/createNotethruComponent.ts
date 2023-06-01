"use strict"

import { Command } from "commander"
import chalk from "chalk";
import fs from "node:fs"
import fsExtra from "fs-extra"
import path from "node:path"
import os from "node:os"
import validateProjectName from "validate-npm-package-name"

const loadJSON = (path: string) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf-8"));
const pjson = loadJSON("../package.json")

function isUsingYarn(): boolean {
    return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
}
function isUsingPnpn(): boolean {
    return (process.env.npm_config_user_agent || '').indexOf('pnpm') === 0;
}
function isUsingNpm(): boolean {
    return (process.env.npm_config_user_agent || '').indexOf('npm') === 0;
}
function getWhichPackageManagerToUse(): string {
    if (isUsingNpm()) {
        return "npm"
    }
    else if (isUsingPnpn()) {
        return "pnpm"
    }
    else if (isUsingYarn()) {
        return "yarn"
    }
    else {
        return "npm"
    }
}


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

    createComponent(componentName);

}

const createComponent = (name: string): void => {
    const root = path.resolve(name);
    const appName = path.basename(root);

    checkAppName(appName);
    fsExtra.ensureDirSync(name);

    if (!isSafeToCreateProjectIn(root, name)) {
        process.exit(1);
    }

    console.log();

    console.log(`Creating a new Notethru component in ${chalk.green(root)}.`);
    console.log();

    const packageJson = {
        name: appName,
        version: '0.1.0',
        private: true,
    };
    fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2) + os.EOL
    );
}

function checkAppName(appName: string): void {
    const validationResult = validateProjectName(appName);
    if (!validationResult.validForNewPackages) {
        console.error(
            chalk.red(
                `Cannot create a project named ${chalk.green(
                    `"${appName}"`
                )} because of npm naming restrictions:\n`
            )
        );
        [
            ...(validationResult.errors || []),
            ...(validationResult.warnings || []),
        ].forEach(error => {
            console.error(chalk.red(`  * ${error}`));
        });
        console.error(chalk.red('\nPlease choose a different project name.'));
        process.exit(1);
    }
}

function isSafeToCreateProjectIn(root, name) {
    const validFiles = [
        '.DS_Store',
        '.git',
        '.gitattributes',
        '.gitignore',
        '.gitlab-ci.yml',
        '.hg',
        '.hgcheck',
        '.hgignore',
        '.idea',
        '.npmignore',
        '.travis.yml',
        'docs',
        'LICENSE',
        'README.md',
        'mkdocs.yml',
        'Thumbs.db',
    ];
    // These files should be allowed to remain on a failed install, but then
    // silently removed during the next create.
    const errorLogFilePatterns = [
        'npm-debug.log',
        'yarn-error.log',
        'yarn-debug.log',
    ];
    const isErrorLog = file => {
        return errorLogFilePatterns.some(pattern => file.startsWith(pattern));
    };

    const conflicts = fs
        .readdirSync(root)
        .filter(file => !validFiles.includes(file))
        // IntelliJ IDEA creates module files before CRA is launched
        .filter(file => !/\.iml$/.test(file))
        // Don't treat log files from previous installation as conflicts
        .filter(file => !isErrorLog(file));

    if (conflicts.length > 0) {
        console.log(
            `The directory ${chalk.green(name)} contains files that could conflict:`
        );
        console.log();
        for (const file of conflicts) {
            try {
                const stats = fs.lstatSync(path.join(root, file));
                if (stats.isDirectory()) {
                    console.log(`  ${chalk.blue(`${file}/`)}`);
                } else {
                    console.log(`  ${file}`);
                }
            } catch (e) {
                console.log(`  ${file}`);
            }
        }
        console.log();
        console.log(
            'Either try using a new directory name, or remove the files listed above.'
        );

        return false;
    }

    // Remove any log files from a previous installation.
    fs.readdirSync(root).forEach(file => {
        if (isErrorLog(file)) {
            fsExtra.removeSync(path.join(root, file));
        }
    });
    return true;
}
export default init