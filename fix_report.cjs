const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Make tokens and payment fields read-only (display only, not editable inputs)
src = src.replace(
  `        <div className="grid grid-cols-2 gap-4">
            {numField('Washer Tokens', washerTokens, setWasherTokens)}
            {numField('Dryer Tokens', dryerTokens, setDryerTokens)}
          </div>`,
  `        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Washer Tokens <span className="text-primary">(from system)</span></label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">{washerTokens}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">Dryer Tokens <span className="text-primary">(from system)</span></label>
              <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">{dryerTokens}</div>
            </div>
          </div>`
);

// Make payment fields read-only
src = src.replace(
  `          <div className="grid grid-cols-2 gap-4">
            {numField('Cash (GHS)', cashAmount, setCashAmount, 'GHS')}
            {numField('Mobile Money (GHS)', mobileMoneyAmount, setMobileMoneyAmount, 'GHS')}
            {numField('Card (GHS)', cardAmount, setCardAmount, 'GHS')}
            {numField('Paystack (GHS)', paystackAmount, setPaystackAmount, 'GHS')}
          </div>`,
  `          <div className="grid grid-cols-2 gap-4">
            {[['Cash', cashAmount], ['Mobile Money', mobileMoneyAmount], ['Card', cardAmount], ['Paystack', paystackAmount]].map(([label, val]) => (
              <div key={label as string} className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">{label} <span className="text-primary">(from system)</span></label>
                <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm font-bold text-foreground">GHS {(val as number).toFixed(2)}</div>
              </div>
            ))}
          </div>`
);

fs.writeFileSync("app/washstation/report/page.tsx", src, "utf8");
console.log("Report fixed:", src.includes("from system"));
