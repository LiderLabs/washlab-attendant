const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
// Find the useEffect that syncs autoData
const idx = src.indexOf("useEffect");
console.log("useEffect:", JSON.stringify(src.substring(idx, idx + 800)));
