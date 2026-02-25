const fs = require('fs');
const lines = fs.readFileSync('app/washstation/payment/page.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  // Replace the stale-ref guard with a force-clear instead of bail
  if (lines[i].includes('if (paystackHandlerRef.current) { toast.error("A payment popup is already open."); return; }')) {
    lines[i] = `    // Force-clear any stale handler from a previous failed attempt
    if (paystackHandlerRef.current) {
      try { clearTimeout(paystackHandlerRef.current._timeoutId); } catch {}
      paystackHandlerRef.current = null;
      isPaying.current = false;
    }`;
    console.log('Fix: replaced stale-ref bail with force-clear at line', i);
    break;
  }
}

// Wrap PaystackPop.setup in try/catch so errors surface
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handler = (window as any).PaystackPop.setup({')) {
    lines[i] = `    let handler: any;
    try {
      handler = (window as any).PaystackPop.setup({`;
    // Find the closing }); of setup() and add catch
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() === '});' && lines[j-1] && lines[j-1].includes('openIframe')) {
        break;
      }
      if (lines[j].includes('paystackHandlerRef.current = handler;')) {
        lines.splice(j, 0,
          `    } catch (setupErr) {`,
          `      toast.error("Failed to open payment window. Please try again.");`,
          `      setStage("idle");`,
          `      isPaying.current = false;`,
          `      return;`,
          `    }`
        );
        console.log('Fix: added try/catch around PaystackPop.setup at line', j);
        break;
      }
    }
    break;
  }
}

fs.writeFileSync('app/washstation/payment/page.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
