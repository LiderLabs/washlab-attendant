const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");
const idx = src.indexOf("IN_PROGRESS_STATUSES");
console.log(JSON.stringify(src.substring(idx, idx + 200)));
