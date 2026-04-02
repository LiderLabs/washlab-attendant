const fs = require('fs');
const file = 'app/washstation/payment/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: Default mobile view to "summary"
content = content.replace(
  `const [mobileView, setMobileView] = useState<"summary" | "payment">("payment")`,
  `const [mobileView, setMobileView] = useState<"summary" | "payment">("summary")`
);

// Fix 2: Remove Tax row
content = content.replace(
  `        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (0%)</span>
          <span className="text-foreground">₵0.00</span>
        </div>`,
  ``
);

// Fix 3: Hide voucher section if no active vouchers
content = content.replace(
  `        {/* Voucher */}
        <div className="pt-3 border-t border-border">`,
  `        {/* Voucher */}
        {(activeVouchers ?? []).length > 0 && <div className="pt-3 border-t border-border">`
);
content = content.replace(
  `          )}
        </div>

        <div className="flex justify-between pt-2 border-t border-border items-center">`,
  `          )}
        </div>}

        <div className="flex justify-between pt-2 border-t border-border items-center">`
);

fs.writeFileSync(file, content);
console.log('SUCCESS');
