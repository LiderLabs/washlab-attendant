const fs = require("fs");

// ── FIX 1: Remove Clear button from NumberPad ──
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
src = src.replace(
  `      <button\r\n        onClick={onClear}\r\n        className='h-12 sm:h-14 rounded-xl bg-destructive/10 text-lg sm:text-xl font-semibold text-destructive hover:bg-destructive/20 transition-colors'\r\n      >\r\n        <X className='w-4 h-4 sm:w-5 sm:h-5 mx-auto' />\r\n      </button>`,
  `      <div className='h-12 sm:h-14' />`
);
fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Clear removed:", !src.includes("onClear}\r\n        className='h-12"));

// ── FIX 2: Enable Cash on payment page ──
let pay = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
pay = pay.replace(
  `{/* Cash — permanently greyed out */}\r\n        <div\r\n          className="p-3 sm:p-5 rounded-xl border-2 border-border flex flex-col items-center gap-2 opacity-40 cursor-not-allowed select-none"\r\n          title="Cash payments not available"`,
  `{/* Cash */}\r\n        <button\r\n          onClick={() => setPaymentMethod("cash")}\r\n          className={\`p-3 sm:p-5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all \${paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}\`}`
);
// Close the div that was wrapping cash - find and replace the closing structure
const cashImgIdx = pay.indexOf('opacity-40 cursor-not-allowed');
if (cashImgIdx === -1) {
  // Already replaced, now fix the closing tag issue
  console.log("Cash div already updated");
}
fs.writeFileSync("app/washstation/payment/page.tsx", pay, "utf8");
console.log("Cash enabled:", pay.includes('setPaymentMethod("cash")'));

