const fs = require("fs");
let src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");

// Fix voucher input - add id and prevent re-render focus loss
src = src.replace(
  `<input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()} placeholder="Voucher code" disabled={isProcessing}`,
  `<input id="voucher-input" type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()} placeholder="VOUCHER CODE" disabled={isProcessing} autoComplete="off"`
);

fs.writeFileSync("app/washstation/payment/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("voucher-input"));
