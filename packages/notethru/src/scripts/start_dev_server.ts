import webpack from "webpack"
import config from "../webpack-config.js"

const compiler = webpack({ mode: "development", ...config })

const watchSettings = {
  aggregateTimeout: 300,
  poll: undefined,
}
let watching: object

const start_dev_server = async (str, options) => {
  
  watching =  compiler.watch(watchSettings, (err, res) => {
    if (err) {
      console.log(err.message)
      console.log("There is an error!")
    }
    
    if (res.compilation.warnings) {
      res.compilation.warnings.forEach(warning => console.log(warning))
    }
  });
 
}


export { start_dev_server, watching }