const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

// Make phone input readonly on mobile to prevent keyboard popup
src = src.replace(
  "type='tel'\n                  inputMode='numeric'",
  "type='tel'\n                  inputMode='none'\n                  readOnly"
);

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', src, 'utf8');
console.log('Phone input keyboard disabled');
