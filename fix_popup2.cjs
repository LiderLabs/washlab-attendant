const fs = require('fs');
let src = fs.readFileSync('components/washstation/WashStationLayout.tsx', 'utf8');

// Remove the leftover readyOrder state block
src = src.replace(
  /\s*orderNumber: string;\s*customerName: string;\s*finalPrice: number;\s*\} \| null>\(null\);/,
  ''
);

// Remove audioRef and shownOrdersRef since they were only used for the popup
src = src.replace(
  "  const audioRef = useRef<HTMLAudioElement | null>(null);\n  const shownOrdersRef = useRef<Set<string>>(new Set());\n",
  ''
);

fs.writeFileSync('components/washstation/WashStationLayout.tsx', src, 'utf8');
console.log('Done');
