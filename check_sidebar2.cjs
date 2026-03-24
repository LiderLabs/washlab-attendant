const fs = require("fs");
const src = fs.readFileSync("components/washstation/WashStationSidebar.tsx", "utf8");
const idx = src.indexOf("reports");
console.log(JSON.stringify(src.substring(idx - 20, idx + 120)));
