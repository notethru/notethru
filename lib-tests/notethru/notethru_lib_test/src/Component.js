import React from "react"
import { createRoot } from "react-dom/client"
import "./style.css"

const Hello = () => {
    return <>
        <p>Hello, This is amazing!</p>
    </>
};

const root = createRoot(document.getElementById("root"))
root.render(<Hello />)