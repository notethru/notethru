import chalk from "chalk"
import utils from "./index.js"

const isInteractive = process.stdout.isTTY;

function createCompiler({
    appName,
    config,
    urls,
    useYarn,
    useTypeScript,
    webpack,
}) {
    // "Compiler" is a low-level interface to webpack.
    // It lets us listen to some events and provide our own custom messages.
    let compiler;
    try {
        compiler = webpack(config);
    } catch (err) {
        console.log(chalk.red('Failed to compile.'));
        console.log();
        console.log(err.message || err);
        console.log();
        process.exit(1);
    }

    // "invalid" event fires when you have changed a file, and webpack is
    // recompiling a bundle. WebpackDevServer takes care to pause serving the
    // bundle, so if you refresh, it'll wait instead of serving the old one.
    // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
    compiler.hooks.invalid.tap('invalid', () => {
        if (isInteractive) {
            utils.clearConsole();
        }
        console.log('Compiling...');
    });

    let isFirstCompile = true;
    let tsMessagesPromise;

    // if (useTypeScript) {
    //   forkTsCheckerWebpackPlugin
    //     .getCompilerHooks(compiler)
    //     .waiting.tap('awaitingTypeScriptCheck', () => {
    //       console.log(
    //         chalk.yellow(
    //           'Files successfully emitted, waiting for typecheck results...'
    //         )
    //       );
    //     });
    // }

    // "done" event fires when webpack has finished recompiling the bundle.
    // Whether or not you have warnings or errors, you will get this event.
    compiler.hooks.done.tap('done', async stats => {
        if (isInteractive) {
            utils.clearConsole();
        }

        // We have switched off the default webpack output in WebpackDevServer
        // options so we are going to "massage" the warnings and errors and present
        // them in a readable focused way.
        // We only construct the warnings and errors for speed:
        // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
        const statsData = stats.toJson({
            all: false,
            warnings: true,
            errors: true,
        });

        const messages = utils.formatWebpackMessages(statsData);
        const isSuccessful = !messages.errors.length && !messages.warnings.length;
        if (isSuccessful) {
            console.log(chalk.green('Compiled successfully!'));
        }
        if (isSuccessful && (isInteractive || isFirstCompile)) {
            printInstructions(appName, urls, useYarn);
        }
        isFirstCompile = false;

        // If errors exist, only show errors.
        if (messages.errors.length) {
            // Only keep the first error. Others are often indicative
            // of the same problem, but confuse the reader with noise.
            if (messages.errors.length > 1) {
                messages.errors.length = 1;
            }
            console.log(chalk.red('Failed to compile.\n'));
            console.log(messages.errors.join('\n\n'));
            return;
        }

        // Show warnings if no errors were found.
        if (messages.warnings.length) {
            console.log(chalk.yellow('Compiled with warnings.\n'));
            console.log(messages.warnings.join('\n\n'));

            // Teach some ESLint tricks.
            console.log(
                '\nSearch for the ' +
                chalk.underline(chalk.yellow('keywords')) +
                ' to learn more about each warning.'
            );
            console.log(
                'To ignore, add ' +
                chalk.cyan('// eslint-disable-next-line') +
                ' to the line before.\n'
            );
        }
    });


}

function printInstructions(appName, urls, useYarn) {
    console.log();
    console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
    console.log();

    if (urls.lanUrlForTerminal) {
        console.log(
            `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
        );
        console.log(
            `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
        );
    } else {
        console.log(`  ${urls.localUrlForTerminal}`);
    }

    console.log();
    console.log('Note that the development build is not optimized.');
    console.log(
        `To create a production build, use ` +
        `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
    );
    console.log();
}

export { createCompiler }