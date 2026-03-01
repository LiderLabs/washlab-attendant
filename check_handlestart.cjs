const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");
const idx = src.indexOf("handleStart");
console.log(JSON.stringify(src.substring(idx, idx + 800)));
