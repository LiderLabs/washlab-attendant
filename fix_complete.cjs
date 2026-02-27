const fs = require("fs");
let src = fs.readFileSync("app/washstation/order-complete/page.tsx", "utf8");

// 1. Fix order number showing blank - use orderIdParam as fallback while loading
src = src.replace(
  `  ) : (
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Order #{orderNumber} Confirmed
            </h1>
          )}`,
  `  ) : (
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Order #{orderNumber || orderIdParam?.slice(-6).toUpperCase()} Confirmed
            </h1>
          )}`
);

// 2. Remove the payment prompt description text entirely
src = src.replace(
  `          <p className="text-muted-foreground mb-8 text-center max-w-md">
            {isMobileMoneyPending ? (
              <>Payment prompt sent for <span className="font-semibold">₵{amountPaid.toFixed(2)}</span> via {getPaymentMethodLabel(paymentMethod)}. Order will be marked Paid when the customer completes payment.</>
            ) : (
              <>Payment of <span className="font-semibold">₵{amountPaid.toFixed(2)}</span> received via {getPaymentMethodLabel(paymentMethod)}.{changeDue > 0 && <span className="block mt-1 text-sm">Change due: ₵{changeDue.toFixed(2)}</span>}</>  
            )}
          </p>`,
  ``
);

// 3. Fix WhatsApp receipt - add bag card number and address
src = src.replace(
  `    const msg =
      \`🧺 WashLab Receipt\\n\\n\` +
      \`Hi \${name},\\n\` +
      \`Thank you for using WashLab!\\n\\n\` +
      \`Order: *#\${num}*\\n\` +
      \`Service: \${serviceDesc}\\n\` +
      \`Amount Paid: *GHS \${price}*\\n\` +
      \`Payment: \${getPaymentMethodLabel(paymentMethod)}\\n\\n\` +
      \`Please bring your bag card when collecting your laundry.\\n\` +
      \`We appreciate your business! 🙏\`;`,
  `    const bagCard = order?.bagCardNumber ? \`Bag Card: *#\${order.bagCardNumber}*\\n\` : '';
    const msg =
      \`🧺 WashLab Receipt\\n\\n\` +
      \`Hi \${name},\\n\` +
      \`Thank you for using WashLab!\\n\\n\` +
      \`Order: *#\${num}*\\n\` +
      \`Service: \${serviceDesc}\\n\` +
      \`Amount Paid: *GHS \${price}*\\n\` +
      \`Payment: \${getPaymentMethodLabel(paymentMethod)}\\n\` +
      bagCard +
      \`Phone: \${customerPhone}\\n\\n\` +
      \`Please bring your bag card when collecting your laundry.\\n\` +
      \`We appreciate your business! 🙏\`;`
);

// 4. Fix mobile centering - add proper centering classes
src = src.replace(
  `      <main className={\`flex-1 transition-all duration-300 \${sidebarCollapsed ? 'ml-16' : 'ml-64'}\`}>`,
  `      <main className={\`flex-1 transition-all duration-300 \${sidebarCollapsed ? 'ml-16' : 'ml-64'} lg:ml-auto\`}>`
);

// 5. Fix Back to Dashboard - goes to /washstation/dashboard not /washstation
src = src.replace(
  `onClick={() => router.push('/washstation')}`,
  `onClick={() => router.push('/washstation/dashboard')}`
);

fs.writeFileSync("app/washstation/order-complete/page.tsx", src, "utf8");
console.log("Done");
