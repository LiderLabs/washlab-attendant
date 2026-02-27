const fs = require("fs");
const src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");
const idx = src.indexOf("useEffect");
console.log(JSON.stringify(src.substring(idx, idx + 1000)));
