import { part_2 as paths_2 } from "./paths.js"

const configFactory = (webpackEnv: string) => {
  const isDevelopmentEnv = webpackEnv === "development"
  const isProductionEnv = webpackEnv === "production"

  const loaders = [

  ]

  return {
    mode: isProductionEnv ? "production" : isDevelopmentEnv && "development",
    devtool: isProductionEnv
      ? 'source-map'
      : isDevelopmentEnv && 'cheap-module-source-map',
    
    entry: paths_2.appIndexJs,
    output: {
      path: paths_2.appBuild,
      filename: "bundle.js"
    },

    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
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
              },

              babelrc: false,
              configFile: false,
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
      extensions: [".js", ".jsx"],
    },
  }
}

export { configFactory }