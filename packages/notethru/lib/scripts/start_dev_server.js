import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import config from "../webpack-config.js";
const compiler = webpack({ mode: "development", ...config });
const watchSettings = {
    aggregateTimeout: 300,
    poll: undefined,
};
let watching;
const start_dev_server = async (str, options) => {
    const server = new WebpackDevServer({}, compiler);
    const runServer = async () => {
        console.log('Starting server...');
        await server.start();
    };
    runServer();
};
export { start_dev_server, watching };
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