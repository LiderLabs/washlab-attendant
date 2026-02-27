const fs = require("fs");
const src = fs.readFileSync("hooks/useStationSession.ts", "utf8");
console.log(JSON.stringify(src.substring(0, 800)));
