const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");
const idx = src.indexOf("isNotStarted");
console.log(JSON.stringify(src.substring(idx - 50, idx + 400)));
