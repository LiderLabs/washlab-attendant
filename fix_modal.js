const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/OnlineOrdersContent.tsx', 'utf8').split('\n');

// Find the floating props and fix them
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onVerified={handleRejectConfirm}') && 
      lines[i-1] && !lines[i-1].includes('<ActionVerification')) {
    // Insert the missing opening tag before these props
    lines.splice(i, 0, '      <ActionVerification');
    lines.splice(i, 0, '');
    lines.splice(i, 0, '      {/* Reject Verification Modal */}');
    console.log('Fixed missing ActionVerification tag at line', i);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/OnlineOrdersContent.tsx', lines.join('\n'), 'utf8');
console.log('Done! Lines:', lines.length);
