const fs = require('fs');
const lines = fs.readFileSync('app/washstation/payment/page.tsx', 'utf8').split('\n');

// Find the line with handler.openIframe()
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('handler.openIframe()')) {
    // Replace just that line with openIframe + timeout fallback
    lines[i] = `    handler.openIframe();

    // Safety net: if iframe never fires callback/onClose after 3 min, reset
    const paystackTimeout = setTimeout(() => {
      if (paystackHandlerRef.current) {
        paystackHandlerRef.current = null;
        pendingVerificationId.current = null;
        setPaystackRef(null);
        setStage("idle");
        isPaying.current = false;
        toast.error("Payment timed out. Please try again.");
      }
    }, 3 * 60 * 1000);

    // Clear the timeout if callback or onClose fires first
    const originalCallback = handler.callback;
    const originalOnClose = handler.onClose;
    paystackHandlerRef.current._timeoutId = paystackTimeout;`;
    console.log('Fix 2 done at line', i);
    break;
  }
}

fs.writeFileSync('app/washstation/payment/page.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
