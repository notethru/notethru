import webpack from "webpack"

import webpackConfigGenerator from "../config/webpack.config.js"
import { part_1 } from "../config/paths.js"

const start_dev_server = () => {
    const webpackConfig = webpackConfigGenerator("development")
    const compiler = webpack(webpackConfig)

    compiler.run((err, stats) => {
        if (err) {
          console.error(err);
          return;
        }
      
        const info = stats.toJson();
      
        if (stats.hasErrors()) {
          console.error(info.errors);
        }
      
        if (stats.hasWarnings()) {
          console.warn(info.warnings);
        }
      
        console.log(stats.toString({
          chunks: false,
          colors: true,
        }));
      });
}

export { start_dev_server }