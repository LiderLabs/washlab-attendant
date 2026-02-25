const fs = require('fs');

// ── Fix 1: Login page - fix duplicate header and logo size ──────────────
let src = fs.readFileSync('app/washstation/page.tsx', 'utf8');
src = src.replace(
  `      {/* Header */}
      <header className="p-6">
        <header className="p-6">
       <Logo size="sm" className="h-10" />
       </header>
      </header>`,
  `      {/* Header */}
      <header className="p-6">
        <Logo size="sm" />
      </header>`
);
fs.writeFileSync('app/washstation/page.tsx', src, 'utf8');
console.log('Fix 1 done: logo header fixed');

// ── Fix 2: WhatsApp - use customerPhoneNumber as fallback ───────────────
let wa = fs.readFileSync('app/washstation/order-complete/page.tsx', 'utf8');
wa = wa.replace(
  `const customerPhone = order?.customer?.phoneNumber || '';`,
  `const customerPhone = order?.customer?.phoneNumber || order?.customerPhoneNumber || '';`
);
// Also improve error message
wa = wa.replace(
  `toast.error('Customer not on WhatsApp');
      return;
    }
    // Reuse existing link if already generated`,
  `toast.error('No phone number found for this customer');
      return;
    }
    // Reuse existing link if already generated`
);
// Fix the length check - Ghana numbers after formatting should be 12 digits (233XXXXXXXXX)
wa = wa.replace(
  `if (digits.length !== 12) {
      toast.error('Customer not on WhatsApp');
      return;
    }`,
  `if (digits.length < 11 || digits.length > 13) {
      toast.error('Invalid phone number format: ' + digits);
      return;
    }`
);
fs.writeFileSync('app/washstation/order-complete/page.tsx', wa, 'utf8');
console.log('Fix 2 done: WhatsApp phone fallback fixed');

console.log('All attendant fixes done');
