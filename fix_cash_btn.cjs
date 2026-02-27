const fs = require("fs");
let src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");

src = src.replace(
  `{/* Cash */}\r\n        <button\r\n          onClick={() => setPaymentMethod("cash")}\r\n          className={\`p-3 sm:p-5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all \${paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}\`}\r\n        >\r\n          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-muted">\r\n            <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />\r\n          </div>\r\n          <span className="font-medium text-xs sm:text-sm text-muted-foreground">Cash</span>\r\n          <span className="text-[10px] text-muted-foreground">Unavailable</span>\r\n        </div>`,
  `{/* Cash */}\r\n        <button\r\n          onClick={() => setPaymentMethod("cash")}\r\n          className={\`p-3 sm:p-5 rounded-xl border-2 flex flex-col items-center gap-2 transition-all \${paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}\`}\r\n        >\r\n          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-muted">\r\n            <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />\r\n          </div>\r\n          <span className="font-medium text-xs sm:text-sm text-foreground">Cash</span>\r\n        </button>`
);

fs.writeFileSync("app/washstation/payment/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("</button>") && !src.includes("Unavailable"));
