import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import webpackConfigGenerator from "../config/webpack.config.js";
import devServerConfigGenerator from "../config/dev-server.config.js";
const start_dev_server = () => {
    const webpackConfig = webpackConfigGenerator("development");
    const devServerConfig = devServerConfigGenerator();
    const compiler = webpack(webpackConfig);
    // compiler.run((err, stats) => {
    //     if (err) {
    //       console.error(err);
    //       return;
    //     }
    //     const info = stats.toJson();
    //     if (stats.hasErrors()) {
    //       console.error(info.errors);
    //     }
    //     if (stats.hasWarnings()) {
    //       console.warn(info.warnings);
    //     }
    //     console.log(stats.toString({
    //       chunks: false,
    //       colors: true,
    //     }));
    // });
    const server = new WebpackDevServer(devServerConfig, compiler);
    server.startCallback(() => {
        console.log("Started");
    });
};
export { start_dev_server };
//# sourceMappingURL=start_dev_server.js.map