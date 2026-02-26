const fs = require('fs');
let src = fs.readFileSync('components/washstation/OrderRowExpander.tsx', 'utf8');

// Use token from localStorage directly as fallback
src = src.replace(
  'export function OrderRowExpander({ order, stationToken, unpaid, onCollectPayment }: OrderExpanderProps) {',
  'export function OrderRowExpander({ order, stationToken: tokenProp, unpaid, onCollectPayment }: OrderExpanderProps) {\n  const stationToken = tokenProp || (typeof window !== "undefined" ? localStorage.getItem("station_token") : null)'
);

fs.writeFileSync('components/washstation/OrderRowExpander.tsx', src, 'utf8');
console.log('Done');
