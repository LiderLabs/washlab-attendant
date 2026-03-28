const fs = require("fs");
const path = "app/washstation/reconciliation/page.tsx";
let src = fs.readFileSync(path, "utf8");

// Remove Paystack fee and amount after fee rows from summary card
src = src.replace(
  `                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Paystack Fee (1.95%)</span>
                  <span className="text-sm text-orange-600">-₵{summary.paystackFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Amount After Fee</span>
                  <span className="font-bold text-green-600">₵{summary.amountAfterFee.toFixed(2)}</span>
                </div>`,
  ``
);

// Remove Paystack fee and WashLab receives rows from MoMo send card
src = src.replace(
  `                <div className="flex justify-between"><span className="text-muted-foreground">Paystack fee</span><span className="text-orange-600">-₵{summary?.paystackFee.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-1 mt-1"><span className="font-medium">WashLab receives</span><span className="font-bold text-green-600">₵{summary?.amountAfterFee.toFixed(2)}</span></div>`,
  ``
);

fs.writeFileSync(path, src);
console.log("paystackFee removed:", !src.includes("paystackFee") ? "YES" : "NO");
console.log("amountAfterFee removed:", !src.includes("amountAfterFee") ? "YES" : "NO");
