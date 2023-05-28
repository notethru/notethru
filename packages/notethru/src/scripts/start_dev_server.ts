import webpack from "webpack"
import config from "../webpack-config.js"

const compiler = webpack(config)

export const start_dev_server = async (str, options) => {
  
    await new Promise((resolve, reject) => {
        compiler.run((err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res);
        });
      });
}