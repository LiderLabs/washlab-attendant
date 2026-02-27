const fs = require("fs");
const src = fs.readFileSync("hooks/useStationSession.ts", "utf8");
// Find what keys are stored in localStorage
const matches = src.match(/localStorage\.(getItem|setItem)\(['"](.*?)['"]/g);
console.log("localStorage keys:", matches);
