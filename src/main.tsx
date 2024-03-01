import { render } from "preact"
import { App } from "./app"

const el = document.getElementById("app")

if (el) {
  render(<App />, el)
}
