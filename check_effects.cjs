const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
// Find all useEffect calls
let idx = 0;
let count = 0;
while (count < 5) {
  idx = src.indexOf("useEffect(", idx + 1);
  if (idx === -1) break;
  console.log("useEffect #" + count + ":", JSON.stringify(src.substring(idx, idx + 300)));
  console.log("---");
  count++;
}
