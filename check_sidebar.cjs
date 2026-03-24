const fs = require("fs");
const src = fs.readFileSync("components/washstation/WashStationSidebar.tsx", "utf8");
console.log(src.substring(0, 4000));
