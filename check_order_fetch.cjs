const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("useStationOrder");
console.log(src.substring(idx - 50, idx + 200));
