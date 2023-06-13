import webpack from "webpack"
import WebpackDevServer from "webpack-dev-server"

import webpackConfigGenerator from "../config/webpack.config.js"
import devServerConfigGenerator from "../config/dev-server.config.js"

const start_dev_server = () => {
    const webpackConfig = webpackConfigGenerator("development")
    const devServerConfig = devServerConfigGenerator() 
    const compiler = webpack(webpackConfig)

    const server = new WebpackDevServer(devServerConfig, compiler)

    server.startCallback(() => {
        console.log("Started")
    })
}

export { start_dev_server }