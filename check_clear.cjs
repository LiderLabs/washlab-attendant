const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
const idx = src.indexOf("Clear");
console.log(JSON.stringify(src.substring(idx - 200, idx + 200)));
