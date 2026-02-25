const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/OnlineOrdersContent.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<ActionVerification') && !lines[i+1].includes('open=')) {
    lines.splice(i + 1, 0, '        open={showRejectVerification}');
    lines.splice(i + 2, 0, '        onCancel={() => setShowRejectVerification(false)}');
    console.log('Added open and onCancel at line', i);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/OnlineOrdersContent.tsx', lines.join('\n'), 'utf8');
console.log('Done! Lines:', lines.length);
