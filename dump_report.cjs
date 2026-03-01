const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
fs.writeFileSync("report_backup.tsx", src, "utf8");
console.log(src);
