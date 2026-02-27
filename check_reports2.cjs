const fs = require("fs");
const src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");
// Find autoData query
const idx = src.indexOf("autoData");
console.log(JSON.stringify(src.substring(idx, idx + 400)));
