const fs = require("fs");
const src = fs.readFileSync("hooks/useStationOrderStatus.ts", "utf8");
console.log(src);
