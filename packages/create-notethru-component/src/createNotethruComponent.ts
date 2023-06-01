// @ts-nocheck
"use strict"

import { Command } from "commander"
import chalk from "chalk";
import fs from "node:fs"
import { execSync } from "node:child_process"
import fsExtra from "fs-extra"
import path from "node:path"
import os from "node:os"
import spawn from "cross-spawn"
import prompts from "prompts"
import semver from "semver"
import tmp from "tmp"
import hyperquest from "hyperquest"
import { unpack } from "tar-pack"
import dns from "dns"
import url from "url"
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
        .option(
            '--template <path-to-template>',
            'specify a template for the created project'
          )
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

    const useYarn = isUsingYarn()
    createComponent(componentName, useYarn);

}

const createComponent = (name: string, useYarn: boolean): void => {
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

    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!useYarn && !checkThatNpmCanReadCwd()) {
        process.exit(1);
    }

    const templateDir = new URL("../templates", import.meta.url)
    run(
        root,
        appName,
        originalDirectory,
        "1.0.0",
        path.resolve(templateDir.href),
        useYarn,
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

function checkThatNpmCanReadCwd() {
    const cwd = process.cwd();
    let childOutput = null;
    try {
        // Note: intentionally using spawn over exec since
        // the problem doesn't reproduce otherwise.
        // `npm config list` is the only reliable way I could find
        // to reproduce the wrong path. Just printing process.cwd()
        // in a Node process was not enough.
        childOutput = spawn.sync('npm', ['config', 'list']).output.join('');
    } catch (err) {
        // Something went wrong spawning node.
        // Not great, but it means we can't do this check.
        // We might fail later on, but let's continue.
        return true;
    }
    if (typeof childOutput !== 'string') {
        return true;
    }
    const lines = childOutput.split('\n');
    // `npm config list` output includes the following line:
    // "; cwd = C:\path\to\current\dir" (unquoted)
    // I couldn't find an easier way to get it.
    const prefix = '; cwd = ';
    const line = lines.find(line => line.startsWith(prefix));
    if (typeof line !== 'string') {
        // Fail gracefully. They could remove it.
        return true;
    }
    const npmCWD = line.substring(prefix.length);
    if (npmCWD === cwd) {
        return true;
    }
    console.error(
        chalk.red(
            `Could not start an npm process in the right directory.\n\n` +
            `The current directory is: ${chalk.bold(cwd)}\n` +
            `However, a newly started npm process runs in: ${chalk.bold(
                npmCWD
            )}\n\n` +
            `This is probably caused by a misconfigured system terminal shell.`
        )
    );
    if (process.platform === 'win32') {
        console.error(
            chalk.red(`On Windows, this can usually be fixed by running:\n\n`) +
            `  ${chalk.cyan(
                'reg'
            )} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
            `  ${chalk.cyan(
                'reg'
            )} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
            chalk.red(`Try to run the above two lines in the terminal.\n`) +
            chalk.red(
                `To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/`
            )
        );
    }
    return false;
}


function run(
    root: string,
    appName: string,
    originalDirectory: string,
    version: any,
    template: string,
    useYarn: boolean,
) {
    Promise.all([
        getInstallPackage(version, originalDirectory),
        getTemplateInstallPackage(template, originalDirectory),
    ]).then(([packageToInstall, templateToInstall]) => {
        const allDependencies = ['react', 'react-dom', packageToInstall];

        console.log('Installing packages. This might take a couple of minutes.');

        Promise.all([
            getPackageInfo(packageToInstall),
            getPackageInfo(templateToInstall),
        ])
            .then(([packageInfo, templateInfo]) =>
                checkIfOnline(useYarn).then(isOnline => ({
                    isOnline,
                    packageInfo,
                    templateInfo,
                }))
            )
            .then(({ isOnline, packageInfo, templateInfo }) => {
                let packageVersion = semver.coerce(packageInfo.version);
                const templatesVersionMinimum = '3.3.0';

                // Assume compatibility if we can't test the version.
                if (!semver.valid(packageVersion)) {
                    packageVersion = templatesVersionMinimum;
                }

                // Only support templates when used alongside new react-scripts versions.
                const supportsTemplates = semver.gte(
                    packageVersion,
                    templatesVersionMinimum
                );
                if (supportsTemplates) {
                    allDependencies.push(templateToInstall);
                } else if (template) {
                    console.log('');
                    console.log(
                        `The ${chalk.cyan(packageInfo.name)} version you're using ${packageInfo.name === 'react-scripts' ? 'is not' : 'may not be'
                        } compatible with the ${chalk.cyan('--template')} option.`
                    );
                    console.log('');
                }

                console.log(
                    `Installing ${chalk.cyan('react')}, ${chalk.cyan(
                        'react-dom'
                    )}, and ${chalk.cyan(packageInfo.name)}${supportsTemplates ? ` with ${chalk.cyan(templateInfo.name)}` : ''
                    }...`
                );
                console.log();

                return install(
                    root,
                    useYarn,
                    allDependencies,
                    isOnline
                ).then(() => ({
                    packageInfo,
                    supportsTemplates,
                    templateInfo,
                }));
            })
            .then(async ({ packageInfo, supportsTemplates, templateInfo }) => {
                const packageName = packageInfo.name;
                const templateName = supportsTemplates ? templateInfo.name : undefined;
                checkNodeVersion(packageName);
                setCaretRangeForRuntimeDeps(packageName);

                const pnpPath = path.resolve(process.cwd(), '.pnp.js');

                const nodeArgs = fs.existsSync(pnpPath) ? ['--require', pnpPath] : [];

                await executeNodeScript(
                    {
                        cwd: process.cwd(),
                        args: nodeArgs,
                    },
                    //maybe verbose
                    [root, appName, originalDirectory, templateName],
                    `
          const init = require('${packageName}/scripts/init.js');
          init.apply(null, JSON.parse(process.argv[1]));
        `
                );

                // if (version === 'react-scripts@0.9.x') {
                //     console.log(
                //         chalk.yellow(
                //             `\nNote: the project was bootstrapped with an old unsupported version of tools.\n` +
                //             `Please update to Node >=14 and npm >=6 to get supported tools in new projects.\n`
                //         )
                //     );
                // }
            })
            .catch(reason => {
                console.log();
                console.log('Aborting installation.');
                if (reason.command) {
                    console.log(`  ${chalk.cyan(reason.command)} has failed.`);
                } else {
                    console.log(
                        chalk.red('Unexpected error. Please report it as a bug:')
                    );
                    console.log(reason);
                }
                console.log();

                // On 'exit' we will delete these files from target directory.
                const knownGeneratedFiles = ['package.json', 'node_modules'];
                const currentFiles = fs.readdirSync(path.join(root));
                currentFiles.forEach(file => {
                    knownGeneratedFiles.forEach(fileToMatch => {
                        // This removes all knownGeneratedFiles.
                        if (file === fileToMatch) {
                            console.log(`Deleting generated file... ${chalk.cyan(file)}`);
                            fsExtra.removeSync(path.join(root, file));
                        }
                    });
                });
                const remainingFiles = fs.readdirSync(path.join(root));
                if (!remainingFiles.length) {
                    // Delete target folder if empty
                    console.log(
                        `Deleting ${chalk.cyan(`${appName}/`)} from ${chalk.cyan(
                            path.resolve(root, '..')
                        )}`
                    );
                    process.chdir(path.resolve(root, '..'));
                    fsExtra.removeSync(path.join(root));
                }
                console.log('Done.');
                process.exit(1);
            });
    });
}

function getInstallPackage(version, originalDirectory) {
    let packageToInstall = 'react-scripts';
    const validSemver = semver.valid(version);
    if (validSemver) {
        packageToInstall += `@${validSemver}`;
    } else if (version) {
        if (version[0] === '@' && !version.includes('/')) {
            packageToInstall += version;
        } else if (version.match(/^file:/)) {
            packageToInstall = `file:${path.resolve(
                originalDirectory,
                version.match(/^file:(.*)?$/)[1]
            )}`;
        } else {
            // for tar.gz or alternative paths
            packageToInstall = version;
        }
    }

    const scriptsToWarn = [
        {
            name: 'react-scripts-ts',
            message: chalk.yellow(
                `The react-scripts-ts package is deprecated. TypeScript is now supported natively in Create React App. You can use the ${chalk.green(
                    '--template typescript'
                )} option instead when generating your app to include TypeScript support. Would you like to continue using react-scripts-ts?`
            ),
        },
    ];

    for (const script of scriptsToWarn) {
        if (packageToInstall.startsWith(script.name)) {
            return prompts({
                type: 'confirm',
                name: 'useScript',
                message: script.message,
                initial: false,
            }).then(answer => {
                if (!answer.useScript) {
                    process.exit(0);
                }

                return packageToInstall;
            });
        }
    }

    return Promise.resolve(packageToInstall);
}

function getTemplateInstallPackage(template, originalDirectory) {
    let templateToInstall = 'cra-template';
    if (template) {
        if (template.match(/^file:/)) {
            templateToInstall = `file:${path.resolve(
                originalDirectory,
                template.match(/^file:(.*)?$/)[1]
            )}`;
        } else if (
            template.includes('://') ||
            template.match(/^.+\.(tgz|tar\.gz)$/)
        ) {
            // for tar.gz or alternative paths
            templateToInstall = template;
        } else {
            // Add prefix 'cra-template-' to non-prefixed templates, leaving any
            // @scope/ and @version intact.
            const packageMatch = template.match(/^(@[^/]+\/)?([^@]+)?(@.+)?$/);
            const scope = packageMatch[1] || '';
            const templateName = packageMatch[2] || '';
            const version = packageMatch[3] || '';

            if (
                templateName === templateToInstall ||
                templateName.startsWith(`${templateToInstall}-`)
            ) {
                // Covers:
                // - cra-template
                // - @SCOPE/cra-template
                // - cra-template-NAME
                // - @SCOPE/cra-template-NAME
                templateToInstall = `${scope}${templateName}${version}`;
            } else if (version && !scope && !templateName) {
                // Covers using @SCOPE only
                templateToInstall = `${version}/${templateToInstall}`;
            } else {
                // Covers templates without the `cra-template` prefix:
                // - NAME
                // - @SCOPE/NAME
                templateToInstall = `${scope}${templateToInstall}-${templateName}${version}`;
            }
        }
    }

    return Promise.resolve(templateToInstall);
}

function getPackageInfo(installPackage) {
    if (installPackage.match(/^.+\.(tgz|tar\.gz)$/)) {
        return getTemporaryDirectory()
            .then((obj: {tmpdir: string, cleanup: Function}) => {
                let stream;
                if (/^http/.test(installPackage)) {
                    stream = hyperquest(installPackage);
                } else {
                    stream = fs.createReadStream(installPackage);
                }
                /* tslint:disable */
                return extractStream(stream, obj.tmpdir).then(() => obj);
            })
            .then((obj: {tmpdir: string, cleanup: Function}) => {
                const { name, version } = require(path.join(
                    obj.tmpdir,
                    'package.json'
                ));
                /* tslint:disable */
                obj.cleanup();
                return { name, version };
            })
            .catch(err => {
                // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
                // However, this function returns package name only without semver version.
                console.log(
                    `Could not extract the package name from the archive: ${err.message}`
                );
                const assumedProjectName = installPackage.match(
                    /^.+\/(.+?)(?:-\d+.+)?\.(tgz|tar\.gz)$/
                )[1];
                console.log(
                    `Based on the filename, assuming it is "${chalk.cyan(
                        assumedProjectName
                    )}"`
                );
                return Promise.resolve({ name: assumedProjectName });
            });
    } else if (installPackage.startsWith('git+')) {
        // Pull package name out of git urls e.g:
        // git+https://github.com/mycompany/react-scripts.git
        // git+ssh://github.com/mycompany/react-scripts.git#v1.2.3
        return Promise.resolve({
            name: installPackage.match(/([^/]+)\.git(#.*)?$/)[1],
        });
    } else if (installPackage.match(/.+@/)) {
        // Do not match @scope/ when stripping off @version or @tag
        return Promise.resolve({
            name: installPackage.charAt(0) + installPackage.substr(1).split('@')[0],
            version: installPackage.split('@')[1],
        });
    } else if (installPackage.match(/^file:/)) {
        const installPackagePath = installPackage.match(/^file:(.*)?$/)[1];
        const { name, version } = import(path.join(
            installPackagePath,
            'package.json'
        ));
        return Promise.resolve({ name, version });
    }
    return Promise.resolve({ name: installPackage });
}

function getTemporaryDirectory() {
    return new Promise((resolve, reject) => {
        // Unsafe cleanup lets us recursively delete the directory if it contains
        // contents; by default it only allows removal if it's empty
        tmp.dir({ unsafeCleanup: true }, (err, tmpdir, callback) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    tmpdir: tmpdir,
                    cleanup: () => {
                        try {
                            callback();
                        } catch (ignored) {
                            // Callback might throw and fail, since it's a temp directory the
                            // OS will clean it up eventually...
                        }
                    },
                });
            }
        });
    });
}

function extractStream(stream, dest) {
    return new Promise((resolve, reject) => {
        stream.pipe(
            unpack(dest, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(dest);
                }
            })
        );
    });
}

function checkNodeVersion(packageName) {
    const packageJsonPath = path.resolve(
        process.cwd(),
        'node_modules',
        packageName,
        'package.json'
    );

    if (!fs.existsSync(packageJsonPath)) {
        return;
    }

    const packageJson = import(packageJsonPath);
    if (!packageJson.engines || !packageJson.engines.node) {
        return;
    }

    if (!semver.satisfies(process.version, packageJson.engines.node)) {
        console.error(
            chalk.red(
                'You are running Node %s.\n' +
                'Create React App requires Node %s or higher. \n' +
                'Please update your version of Node.'
            ),
            process.version,
            packageJson.engines.node
        );
        process.exit(1);
    }
}

function checkIfOnline(useYarn) {
    if (!useYarn) {
        // Don't ping the Yarn registry.
        // We'll just assume the best case.
        return Promise.resolve(true);
    }

    return new Promise(resolve => {
        dns.lookup('registry.yarnpkg.com', err => {
            let proxy;
            if (err != null && (proxy = getProxy())) {
                // If a proxy is defined, we likely can't resolve external hostnames.
                // Try to resolve the proxy name as an indication of a connection.
                dns.lookup(url.parse(proxy).hostname, proxyErr => {
                    resolve(proxyErr == null);
                });
            } else {
                resolve(err == null);
            }
        });
    });
}

function setCaretRangeForRuntimeDeps(packageName) {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = import(packagePath);

    if (typeof packageJson.dependencies === 'undefined') {
        console.error(chalk.red('Missing dependencies in package.json'));
        process.exit(1);
    }

    const packageVersion = packageJson.dependencies[packageName];
    if (typeof packageVersion === 'undefined') {
        console.error(chalk.red(`Unable to find ${packageName} in package.json`));
        process.exit(1);
    }

    makeCaretRange(packageJson.dependencies, 'react');
    makeCaretRange(packageJson.dependencies, 'react-dom');

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + os.EOL);
}

function makeCaretRange(dependencies, name) {
    const version = dependencies[name];

    if (typeof version === 'undefined') {
        console.error(chalk.red(`Missing ${name} dependency in package.json`));
        process.exit(1);
    }

    let patchedVersion = `^${version}`;

    if (!semver.validRange(patchedVersion)) {
        console.error(
            `Unable to patch ${name} dependency version because version ${chalk.red(
                version
            )} will become invalid ${chalk.red(patchedVersion)}`
        );
        patchedVersion = version;
    }

    dependencies[name] = patchedVersion;
}

function getProxy() {
    if (process.env.https_proxy) {
      return process.env.https_proxy;
    } else {
      try {
        // Trying to read https-proxy from .npmrc
        let httpsProxy = execSync('npm config get https-proxy').toString().trim();
        return httpsProxy !== 'null' ? httpsProxy : undefined;
      } catch (e) {
        return;
      }
    }
  }

  function executeNodeScript({ cwd, args }, data, source): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        [...args, '-e', source, '--', JSON.stringify(data)],
        { cwd, stdio: 'inherit' }
      );
  
      child.on('close', code => {
        if (code !== 0) {
          reject({
            command: `node ${args.join(' ')}`,
          });
          return;
        }
        resolve();
      });
    });
  }

  function install(root, useYarn, dependencies, isOnline): Promise<void> {
    return new Promise((resolve, reject) => {
      let command;
      let args;
      if (useYarn) {
        command = 'yarnpkg';
        args = ['add', '--exact'];
        if (!isOnline) {
          args.push('--offline');
        }
        // if (usePnp) {
        //   args.push('--enable-pnp');
        // }
        [].push.apply(args, dependencies);
  
        // Explicitly set cwd() to work around issues like
        // https://github.com/facebook/create-react-app/issues/3326.
        // Unfortunately we can only do this for Yarn because npm support for
        // equivalent --prefix flag doesn't help with this issue.
        // This is why for npm, we run checkThatNpmCanReadCwd() early instead.
        args.push('--cwd');
        args.push(root);
  
        if (!isOnline) {
          console.log(chalk.yellow('You appear to be offline.'));
          console.log(chalk.yellow('Falling back to the local Yarn cache.'));
          console.log();
        }
      } else {
        command = 'npm';
        args = [
          'install',
          '--no-audit', // https://github.com/facebook/create-react-app/issues/11174
          '--save',
          '--save-exact',
          '--loglevel',
          'error',
        ].concat(dependencies);
  
        // if (usePnp) {
        //   console.log(chalk.yellow("NPM doesn't support PnP."));
        //   console.log(chalk.yellow('Falling back to the regular installs.'));
        //   console.log();
        // }
      }
  
    //   if (verbose) {
    //     args.push('--verbose');
    //   }
  
      const child = spawn(command, args, { stdio: 'inherit' });
      child.on('close', code => {
        if (code !== 0) {
          reject({
            command: `${command} ${args.join(' ')}`,
          });
          return;
        }
        resolve();
      });
    });
  }
export default init