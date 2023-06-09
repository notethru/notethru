import path from "path";
import fs from "fs";
import { createRequire } from "node:module";
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const node_modules_path = resolveApp('node_modules');
const require_ = createRequire(process.cwd());
export default {
    // mode: "development",
    // devtool: false,
    //   devServer: {
    //   },
    entry: path.resolve(process.cwd(), "./src/renderer/render.js"),
    output: {
        path: path.resolve(path.dirname(new URL(import.meta.url).pathname), "../render/public"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                        envName: "development",
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    modules: false
                                }
                            ],
                            "@babel/preset-react"
                        ],
                        plugins: [
                            "@babel/plugin-transform-runtime",
                            "@babel/plugin-syntax-dynamic-import",
                            "@babel/plugin-proposal-class-properties"
                        ],
                        env: {
                            production: {
                                only: ["src"],
                                plugins: [
                                    [
                                        "transform-react-remove-prop-types",
                                        {
                                            removeImport: true
                                        }
                                    ],
                                    "@babel/plugin-transform-react-inline-elements",
                                    "@babel/plugin-transform-react-constant-elements"
                                ]
                            }
                        }
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
        fallback: {
            "path": "path-browserify"
        }
    },
    resolveLoader: {
        modules: ["./node_modules"],
        extensions: ['.js', '.json'],
        mainFields: ['loader', 'main'],
    },
};
//# sourceMappingURL=webpack-config.js.map