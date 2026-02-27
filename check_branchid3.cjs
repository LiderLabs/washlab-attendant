const fs = require("fs");
const src = fs.readFileSync("hooks/useStationSession.ts", "utf8");
const idx = src.indexOf("branchId");
console.log(JSON.stringify(src.substring(idx - 100, idx + 400)));
