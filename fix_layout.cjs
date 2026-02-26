const fs = require('fs');
let src = fs.readFileSync('components/washstation/WashStationLayout.tsx', 'utf8');

// Remove the entire leftover useEffect block that sets readyOrder
src = src.replace(
  /\s*if \(newlyReadyOrders\.length > 0\) \{[\s\S]*?shownOrdersRef\.current\.add\(order\._id\.toString\(\)\);\s*\}\s*\}, \[allOrders\]\);/,
  '\n  }, [allOrders]);'
);

// Remove shownOrdersRef ref if still present
src = src.replace(/\s*const shownOrdersRef = useRef<Set<string>>\(new Set\(\)\);/, '');

// Remove audioRef if still present
src = src.replace(/\s*const audioRef = useRef<HTMLAudioElement \| null>\(null\);/, '');

fs.writeFileSync('components/washstation/WashStationLayout.tsx', src, 'utf8');
console.log('Done');
