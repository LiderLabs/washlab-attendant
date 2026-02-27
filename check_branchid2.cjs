const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
const idx = src.indexOf("branchId");
console.log(JSON.stringify(src.substring(idx - 20, idx + 400)));
