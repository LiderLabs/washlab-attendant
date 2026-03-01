const fs = require("fs");
const src = fs.readFileSync("app/washstation/orders/page.tsx", "utf8");
// Find Start button
const idx = src.indexOf("Start");
console.log(JSON.stringify(src.substring(idx - 100, idx + 500)));
