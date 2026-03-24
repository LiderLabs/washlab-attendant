const fs = require("fs");
const src = fs.readFileSync("components/washstation/WashStationLayout.tsx", "utf8");
console.log(src.substring(0, 3000));
