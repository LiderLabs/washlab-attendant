const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
const idx = src.indexOf("SESSION:");
console.log("Debug in file:", idx > -1);
console.log(JSON.stringify(src.substring(idx - 20, idx + 150)));
