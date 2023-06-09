import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import config from "../webpack-config.js";
import path from "path";
const compiler = webpack({ mode: "development", ...config });
const importUrl = `${process.cwd()}/src/Component.js`;
const MainComponent = await import(importUrl);
let watching;
const start_dev_server = async (str, options) => {
    const server = new WebpackDevServer({
        static: {
            directory: path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../render/public"),
        },
    }, compiler);
    const runServer = async () => {
        console.log('Starting server...');
        await server.start();
    };
    runServer();
};
export { start_dev_server, watching, MainComponent };
// watching =  compiler.watch(watchSettings, (err, res) => {
//   if (err) {
//     console.log(err.message)
//     console.log("There is an error!")
//   }
//   if (res.compilation.warnings) {
//     res.compilation.warnings.forEach(warning => console.log(chalk.yellow(warning)))
//   }
//   if (res.compilation.errors) {
//     res.compilation.errors.forEach(error => console.log(error))
//   }
// });
//# sourceMappingURL=start_dev_server.js.map