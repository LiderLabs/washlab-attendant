const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
const idx = src.indexOf("washerTokens");
console.log(JSON.stringify(src.substring(idx - 200, idx + 600)));
