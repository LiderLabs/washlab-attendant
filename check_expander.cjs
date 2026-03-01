const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");
const idx = src.indexOf("Start");
console.log(JSON.stringify(src.substring(idx - 100, idx + 800)));
