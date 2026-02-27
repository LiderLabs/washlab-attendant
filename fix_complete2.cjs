const fs = require("fs");
let src = fs.readFileSync("app/washstation/order-complete/page.tsx", "utf8");

// 1. Remove the payment description paragraph using indexOf
const pStart = src.indexOf('          <p className="text-muted-foreground mb-8 text-center max-w-md">');
const pEnd = src.indexOf('          </p>', pStart) + '          </p>'.length;
if (pStart !== -1 && pEnd !== -1) {
  src = src.substring(0, pStart) + src.substring(pEnd);
  console.log("Payment text removed");
} else {
  console.log("Payment text paragraph not found - trying alternate");
  // Try finding by unique content
  const alt = src.indexOf('Payment prompt sent for');
  if (alt !== -1) {
    const altStart = src.lastIndexOf('<p ', alt);
    const altEnd = src.indexOf('</p>', alt) + '</p>'.length;
    src = src.substring(0, altStart) + src.substring(altEnd);
    console.log("Removed via alternate method");
  }
}

// 2. Fix WhatsApp - use same pattern as OrderRowExpander which works
src = src.replace(
  `  const handleWhatsAppReceipt = () => {
    const customerPhone = order?.customer?.phoneNumber || order?.customerPhoneNumber || '';
    if (!customerPhone) { toast.error('No phone number on file'); return; }
    const phone = customerPhone.replace(/\\D/g, '');
    if (!phone) { toast.error('Invalid phone number'); return; }`,
  `  const handleWhatsAppReceipt = () => {
    const rawPhone = order?.customer?.phoneNumber || order?.customerPhoneNumber || '';
    if (!rawPhone) { toast.error('No phone number on file'); return; }
    const phone = rawPhone.replace(/[\\s\\-]/g, '').replace(/^\\+/, '').replace(/^0/, '233');
    if (!phone) { toast.error('Invalid phone number'); return; }
    const customerPhone = rawPhone;`
);

fs.writeFileSync("app/washstation/order-complete/page.tsx", src, "utf8");
console.log("Done");
