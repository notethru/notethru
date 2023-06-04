import React from "react"
import { createRoot } from "react-dom/client"

export default Component = () => {
    return <>
        <p>Hello World!</p>
    </>
};

const root = createRoot(document.getElementById("root"))
root.render(<Component />)