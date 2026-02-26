const fs = require('fs');
let src = fs.readFileSync('components/washstation/OrderRowExpander.tsx', 'utf8');

// Add missing props to interface
src = src.replace(
  '  stationToken: string | null\n}',
  '  stationToken: string | null\n  unpaid?: boolean\n  onCollectPayment?: () => void\n}'
);

// Add to function signature
src = src.replace(
  'export function OrderRowExpander({ order, stationToken }',
  'export function OrderRowExpander({ order, stationToken, unpaid, onCollectPayment }'
);

fs.writeFileSync('components/washstation/OrderRowExpander.tsx', src, 'utf8');
console.log('Done');
