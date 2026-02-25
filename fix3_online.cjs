const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/OnlineOrdersContent.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handleProceedToPayment = async () => {')) {
    lines.splice(i + 1, 0,
      `    if (!weight || weight <= 0) { toast.error("Please enter the actual weight before proceeding to payment."); return; }`
    );
    console.log('Fix 3 done: weight gate added at line', i);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/OnlineOrdersContent.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
