const fs = require('fs');
let src = fs.readFileSync('components/washstation/StatCard.tsx', 'utf8');

src = src.replace(
  'className="text-2xl md:text-3xl font-bold text-foreground mb-1"',
  'className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 break-all leading-tight"'
);

fs.writeFileSync('components/washstation/StatCard.tsx', src, 'utf8');
console.log('StatCard value size fixed');
