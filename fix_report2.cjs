const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Make tokens read-only
src = src.replace(
  "{numField('Washer Tokens', washerTokens, setWasherTokens)}\r\n            {numField('Dryer Tokens', dryerTokens, setDryerTokens)}",
  `<div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Washer Tokens <span className="text-primary text-xs">(system)</span></label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">{washerTokens}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Dryer Tokens <span className="text-primary text-xs">(system)</span></label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">{dryerTokens}</div>
            </div>`
);

// Make payment fields read-only
src = src.replace(
  "{numField('Cash (GHS)', cashAmount, setCashAmount, 'GHS')}\r\n            {numField('Mobile Money (GHS)', mobileMoneyAmount, setMobileMoneyAmount, 'GHS')}\r\n            {numField('Card (GHS)', cardAmount, setCardAmount, 'GHS')}\r\n            {numField('Paystack (GHS)', paystackAmount, setPaystackAmount, 'GHS')}",
  `{[['Cash', cashAmount], ['Mobile Money', mobileMoneyAmount], ['Card', cardAmount], ['Paystack', paystackAmount]].map(([label, val]) => (
              <div key={label as string} className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">{label as string} <span className="text-primary text-xs">(system)</span></label>
                <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">GHS {(val as number).toFixed(2)}</div>
              </div>
            ))}`
);

fs.writeFileSync("app/washstation/report/page.tsx", src, "utf8");
console.log("Tokens fixed:", src.includes("(system)"));
console.log("Payments fixed:", src.includes("val as number"));
