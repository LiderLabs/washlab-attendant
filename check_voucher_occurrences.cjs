const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("voucherResult");
// Find all occurrences
let i = 0;
let pos = 0;
while ((pos = src.indexOf("voucherResult", pos)) !== -1) {
  i++;
  if (i >= 3) {
    console.log("occurrence", i, "at", pos);
    console.log(JSON.stringify(src.substring(pos - 30, pos + 200)));
    console.log("---");
  }
  pos += 1;
  if (i > 8) break;
}
