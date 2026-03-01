const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");

// Check voucherValidation position vs order position
const voucherIdx = src.indexOf("voucherValidation");
const orderIdx = src.indexOf("const { order,");
console.log("voucherValidation at:", voucherIdx);
console.log("order declared at:", orderIdx);
console.log("voucherValidation after order?", voucherIdx > orderIdx);

// Show the voucherValidation query
console.log(JSON.stringify(src.substring(voucherIdx - 20, voucherIdx + 200)));
