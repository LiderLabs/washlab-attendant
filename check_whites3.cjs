const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("whitesSeparate");
// Check if it's rendered in JSX
let count = 0;
let pos = 0;
while (true) {
  pos = src.indexOf("whitesSeparate", pos + 1);
  if (pos === -1) break;
  count++;
  console.log("occurrence " + count + " at " + pos + ":", JSON.stringify(src.substring(pos - 20, pos + 80)));
}
