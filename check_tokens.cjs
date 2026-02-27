const fs = require("fs");
const src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");
const idx = src.indexOf("WASHER\|washerToken\|Washer Token");
const idx2 = src.indexOf("washerToken");
console.log(JSON.stringify(src.substring(idx2 - 100, idx2 + 400)));
