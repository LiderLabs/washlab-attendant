const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
const idx = src.indexOf("useEffect(");
console.log(JSON.stringify(src.substring(idx, idx + 1200)));
