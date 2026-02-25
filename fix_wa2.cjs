const fs = require('fs');
const lines = fs.readFileSync('app/washstation/order-complete/page.tsx', 'utf8').split('\n');

let fnStart = -1, fnEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handleWhatsAppReceipt = () => {')) fnStart = i;
  if (fnStart > -1 && lines[i].trim() === '};' && i > fnStart + 2) { fnEnd = i; break; }
}

if (fnStart > -1 && fnEnd > -1) {
  const newFn = [
    "  const handleWhatsAppReceipt = () => {",
    "    const customerPhone = order?.customer?.phoneNumber || order?.customerPhoneNumber || '';",
    "    if (!customerPhone) { toast.error('No phone number on file'); return; }",
    "    const phone = customerPhone.replace(/\\D/g, '');",
    "    const orderNum = order?.orderNumber || '';",
    "    const name = order?.customer?.name || 'Customer';",
    "    const price = order?.finalPrice?.toFixed(2) || '0.00';",
    "    const msg = encodeURIComponent(",
    "      'Your laundry order #' + orderNum + ' is ready for pickup.' +",
    "      ' Total: GHS ' + price + '. Please bring your bag card. Thank you - WashLab'",
    "    );",
    "    window.open('https://wa.me/' + phone + '?text=' + msg, '_blank');",
    "    toast.success('WhatsApp receipt sent!');",
    "  };"
  ];
  lines.splice(fnStart, fnEnd - fnStart + 1, ...newFn);
  console.log('WhatsApp function replaced, lines', fnStart, '-', fnEnd);
}

fs.writeFileSync('app/washstation/order-complete/page.tsx', lines.join('\n'), 'utf8');
console.log('Done');
