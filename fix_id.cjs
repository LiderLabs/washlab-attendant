const fs = require('fs');
let src = fs.readFileSync('components/washstation/OrderRowExpander.tsx', 'utf8');

// Make _id accept any string-like Id to match the table's Order type
src = src.replace(
  '    _id: Id<"orders">',
  '    _id: Id<"orders"> | string'
);

fs.writeFileSync('components/washstation/OrderRowExpander.tsx', src, 'utf8');
console.log('Done');
