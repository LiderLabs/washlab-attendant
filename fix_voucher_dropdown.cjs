const fs = require("fs");
let src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");

// 1. Add getActive query after voucherValidation
src = src.replace(
  `  const voucherValidation = useQuery(`,
  `  const activeVouchers = useQuery(
    (api as any).vouchers.getActive,
    order ? { branchId: order.branchId } : "skip"
  );

  const voucherValidation = useQuery(`
);

// 2. Replace the text input + Apply button with a dropdown
const oldInput = `<div className=\"flex gap-2\">\r\n            <input id=\"voucher-input\" type=\"text\" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === \"Enter\" && handleApplyVoucher()} placeholder=\"VOUCHER CODE\" disabled={isProcessing} autoComplete=\"off\" className=\"flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 uppercase\" />\r\n            <button onClick={handleApplyVoucher} disabled={!voucherCode.trim() || isProcessing} className=\"px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40\">Apply</button>\r\n\r\n          </div>`;

const newDropdown = `<div className=\"flex gap-2\">
            <select
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              disabled={isProcessing}
              className=\"flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50\"
            >
              <option value=\"\">-- Select a voucher --</option>
              {(activeVouchers ?? []).map((v: any) => (
                <option key={v._id} value={v.code}>
                  {v.code}{v.name ? \` — \${v.name}\` : \"\"} ({v.discountType === \"percentage\" ? \`\${v.discountValue}% off\` : \`₵\${v.discountValue} off\`})
                </option>
              ))}
            </select>
            <button onClick={handleApplyVoucher} disabled={!voucherCode.trim() || isProcessing} className=\"px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40\">Apply</button>
          </div>`;

src = src.replace(oldInput, newDropdown);

fs.writeFileSync("app/washstation/payment/page.tsx", src, "utf8");
console.log("activeVouchers query added:", src.includes("getActive"));
console.log("Dropdown added:", src.includes("<select"));
