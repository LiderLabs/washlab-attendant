const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

// Pass inflated weight (extra loads * 8kg each) to backend so price matches
src = src.replace(
  '        weight,\n        itemCount: itemCount || 1,',
  '        weight: weight + (extraWashLoads + extraDryLoads) * 8,\n        itemCount: itemCount || 1,'
);

// Also add extra loads info to notes
src = src.replace(
  "        notes: customNote || orderNotes.join(\", \") || undefined,",
  "        notes: [customNote, ...orderNotes, (extraWashLoads > 0 ? + extra wash load(s) : ''), (extraDryLoads > 0 ? + extra dry load(s) : '')].filter(Boolean).join(', ') || undefined,"
);

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', src, 'utf8');
console.log('Done - extra loads wired to backend weight');
