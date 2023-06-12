import { part_1 } from "../config/paths.js"

export default (webpackEnv: string): object => {
    return {
        //componentJs path can also be ts path **needs work**
        mode: webpackEnv === "development" ? "development" : "production",
        entry: part_1.componentRendererJs,
        output: {
            path: part_1.publicFolderPath,
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
    }
}