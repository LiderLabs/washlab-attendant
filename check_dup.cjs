const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");
// Check if WashStationLayout is used inside the component
const idx = src.indexOf("WashStationLayout");
console.log("WashStationLayout in component:", idx > -1);
console.log(JSON.stringify(src.substring(idx - 20, idx + 100)));
