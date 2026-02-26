const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

// Fix 1: Remove 0 from weight input
src = src.replace(
  'value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}',
  'value={weight === 0 ? "" : weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}'
);

// Fix 2: Remove 0 from item count input
src = src.replace(
  'value={itemCount} onChange={(e) => setItemCount(parseInt(e.target.value) || 0)}',
  'value={itemCount === 0 ? "" : itemCount} onChange={(e) => setItemCount(parseInt(e.target.value) || 0)}'
);

// Fix 3: Remove textarea (custom note)
src = src.replace(
  /\s*<textarea[^>]*value=\{customNote\}[\s\S]*?\/>/,
  ''
);

// Fix 4: Show only 5 bag cards
src = src.replace(
  'while (available.length < 10)',
  'while (available.length < 5)'
);

// Fix 5: Make order summary non-fixed bottom card
src = src.replace(
  "className='bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 fixed top-24 right-6 w-[20rem]'",
  "className='bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full lg:w-80 lg:flex-shrink-0'"
);

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', src, 'utf8');
console.log('Done fixes 1-5');
