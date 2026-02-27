const fs = require("fs");
const src = fs.readFileSync("hooks/useStationSession.ts", "utf8");
const idx = src.indexOf("return {");
console.log(JSON.stringify(src.substring(idx, idx + 400)));
