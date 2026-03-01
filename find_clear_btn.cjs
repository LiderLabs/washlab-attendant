const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
const idx = src.indexOf("onClear");
// find where it renders the clear button in JSX
let pos = idx;
while (true) {
  pos = src.indexOf("Clear", pos + 1);
  if (pos === -1) break;
  const chunk = src.substring(pos - 50, pos + 100);
  if (chunk.includes("<") || chunk.includes("button") || chunk.includes("Button")) {
    console.log(JSON.stringify(chunk));
    console.log("---");
  }
}
