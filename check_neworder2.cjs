const fs = require('fs');
const content = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (i >= 390 && i <= 510) console.log(`L${i+1}: ${l}`);
});
