const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
const idx = src.indexOf("attendance\|clockedIn\|clocked_in\|attendanceLog");
const idx2 = src.indexOf("attendants");
console.log("Attendants state area:", JSON.stringify(src.substring(idx2, idx2 + 200)));
