const fs = require("fs");

// ── Fix 1: Remove Intake Queue / Pending / Estimated Volume block ──
let online = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const intakeStart = online.indexOf('<div className="text-sm">');
const intakeBlockStart = online.lastIndexOf('<div', intakeStart - 5);
const intakeEnd = online.indexOf('</div>', intakeStart) + '</div>'.length;
const outerEnd = online.indexOf('</div>', intakeEnd) + '</div>'.length;
online = online.substring(0, intakeBlockStart) + online.substring(outerEnd);
fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", online, "utf8");
console.log("Fix 1: Intake Queue block removed");

// ── Fix 2 & 3: CustomersContent - remove Store Credit, fix Last Visit ──
let customers = fs.readFileSync("components/washstation/pages/CustomersContent.tsx", "utf8");

// Remove Store Credit box - find the parent div containing it
const creditStart = customers.indexOf('<p className="text-sm text-muted-foreground">Store Credit</p>');
const creditDivStart = customers.lastIndexOf('<div', creditStart);
const creditDivEnd = customers.indexOf('</div>', creditStart) + '</div>'.length;
const creditOuterEnd = customers.indexOf('</div>', creditDivEnd) + '</div>'.length;
customers = customers.substring(0, creditDivStart) + customers.substring(creditOuterEnd);
console.log("Fix 2: Store Credit removed");

// Fix Last Visit - use real data
customers = customers.replace(
  `{selectedCustomer.lastVisit || 'Oct 12, 2023'}`,
  `{selectedCustomer.lastVisit || selectedCustomer.lastOrderDate
                    ? new Date(selectedCustomer.lastVisit || selectedCustomer.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'No visits yet'}`
);
fs.writeFileSync("components/washstation/pages/CustomersContent.tsx", customers, "utf8");
console.log("Fix 3: Last Visit fixed");

// ── Fix 4: Enable Cash in payment page ──
let payment = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
payment = payment.replace(
  `        {/* Cash â€" permanently greyed out */}
        <div
          className="p-3 sm:p-5 rounded-xl border-2 border-border flex flex-col items-center gap-2 opacity-40 cursor-not-allowed select-none"
          title="Cash payments not available"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-muted">
            <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </div>
          <span className="font-medium text-xs sm:text-sm text-muted-foreground">Cash</span>
          <span className="text-[10px] text-muted-foreground">Unavailable</span>
        </div>`,
  `        <button
          onClick={() => !isProcessing && setPaymentMethod("cash")}
          disabled={isProcessing}
          className={\`p-3 sm:p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative disabled:opacity-50 disabled:cursor-not-allowed \${
            effectivePaymentMethod === "cash"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }\`}
        >
          <div className={\`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center \${
            effectivePaymentMethod === "cash" ? "bg-primary text-primary-foreground" : "bg-muted"
          }\`}>
            <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className={\`font-medium text-xs sm:text-sm \${effectivePaymentMethod === "cash" ? "text-primary" : "text-foreground"}\`}>Cash</span>
          {effectivePaymentMethod === "cash" && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">✓</div>
          )}
        </button>`
);

// Also enable the Verify & Pay button for cash
payment = payment.replace(
  `disabled={isProcessing || effectivePaymentMethod === "cash"}`,
  `disabled={isProcessing}`
);
payment = payment.replace(
  `isProcessing || effectivePaymentMethod === "cash"
              ? "bg-muted text-muted-foreground cursor-not-allowed"`,
  `isProcessing
              ? "bg-muted text-muted-foreground cursor-not-allowed"`
);

fs.writeFileSync("app/washstation/payment/page.tsx", payment, "utf8");
console.log("Fix 4: Cash enabled");
