const fs = require('fs');
let src = fs.readFileSync('app/washstation/confirm-clock-in/page.tsx', 'utf8');

// Guard handleConfirm against double-tap
src = src.replace(
  'const handleConfirm = () => {\n    if (!staffData || typeof window === \'undefined\') return;',
  'const handleConfirm = () => {\n    if (!staffData || typeof window === \'undefined\' || isConfirming) return;\n    setIsConfirming(true);'
);

fs.writeFileSync('app/washstation/confirm-clock-in/page.tsx', src, 'utf8');
console.log('Double-tap fix done');
