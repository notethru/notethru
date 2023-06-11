/**++ DO NOT TOUCH THIS FILE IF YOU WANT
 * THE APPLICATION TO WORK PROPERLY ++
 */

import Component from "./Component"
import React from "react"
import { createRoot } from "react-dom/client"

// **MAIN RENDERER METHOD BEING USED FOR DEVELOPMENT** 
//              **|| PLEASE DON'T TOUCH ||**

const root = createRoot(document.getElementById("root"))
root.render(<Component />)