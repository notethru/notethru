import path from "path";
import fs from "fs";
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const node_modules_path = resolveApp('node_modules');
export default {
    // mode: "development",
    // devtool: false,
    //   devServer: {
    //   },
    entry: path.resolve(process.cwd(), "src/index.jsx"),
    output: {
        path: path.resolve(process.cwd(), "dist"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                        envName: "development",
                    },
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    resolveLoader: {
        modules: ["./node_modules"],
        extensions: ['.js', '.json'],
        mainFields: ['loader', 'main'],
    },
};
//# sourceMappingURL=webpack-config.js.map