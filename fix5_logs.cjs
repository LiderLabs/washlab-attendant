const fs = require('fs');
const lines = fs.readFileSync('app/washstation/payment/page.tsx', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('paystackHandlerRef.current = handler;') && 
      lines[i+1] && lines[i+1].includes('handler.openIframe()')) {
    lines.splice(i, 0,
      `    if (process.env.NODE_ENV !== 'production') console.log('[Paystack] About to open iframe', {`,
      `      handlerExists: !!handler,`,
      `      paystackPopExists: !!(window as any).PaystackPop,`,
      `      amount: Math.round(paystackChargeAmount * 100),`,
      `      email: order.customer?.email || order.customerEmail,`,
      `      ref,`,
      `      channels,`,
      `    });`
    );
    console.log('Added diagnostic log at line', i);
    break;
  }
}
fs.writeFileSync('app/washstation/payment/page.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
