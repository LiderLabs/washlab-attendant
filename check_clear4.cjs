const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
const idx = src.indexOf("Clear");
let pos = 0;
let count = 0;
while(true) {
  pos = src.indexOf("Clear", pos + 1);
  if (pos === -1) break;
  count++;
  console.log(`\n--- occurrence ${count} at pos ${pos} ---`);
  console.log(JSON.stringify(src.substring(pos - 100, pos + 150)));
}
