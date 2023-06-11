import { part_1 } from "./paths.js"

export default (): object => {
    return {
        static: {
            directory: part_1.publicFolderPath
        },
        port: 3000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true,
        watchFiles: {
            paths: [`${part_1.appSrcFolder}/**/*`]
        }
    }
}