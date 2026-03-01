const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("voucherCode");
// Find the render part
let searchIdx = idx + 1;
while (searchIdx < src.length) {
  searchIdx = src.indexOf("voucherCode", searchIdx + 1);
  if (searchIdx === -1) break;
  const context = src.substring(searchIdx - 20, searchIdx + 100);
  if (context.includes("value=") || context.includes("onChange")) {
    console.log("Render found at:", searchIdx);
    console.log(JSON.stringify(src.substring(searchIdx - 100, searchIdx + 300)));
    break;
  }
}
