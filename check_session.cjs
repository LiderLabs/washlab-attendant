const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
const idx = src.indexOf("isSessionValid");
console.log(JSON.stringify(src.substring(idx - 100, idx + 200)));
